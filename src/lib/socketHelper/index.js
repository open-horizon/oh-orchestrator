const net = require('net');
const fs = require('fs-extra');

const { getCorrelationId } = require('@bananabread/request-helper');

const {
  hzn: {
    nodeSocketsDir,
  },
} = require('../../configuration/config');

const { SERVER_TYPE, LOG_TYPE, saveLog } = require('../../models/anaxSocketModel');

const { routeRequest } = require('./requestRouter');

const {
  formatToJson,
  formatToHttp,
} = require('./converters/httpJsonConverter');

const initializeSocket = (nodeId) => {
  const connections = {};
  let SHUTDOWN = false;
  const SOCKET_FILE = `${nodeSocketsDir}/ohorchestrator_${nodeId}.sock`;
  let server;

  saveLog(nodeId, LOG_TYPE.INFO, SERVER_TYPE.ANAX_FACING, 'Loading interprocess communications');

  function createServer(socket) {
    saveLog(nodeId, LOG_TYPE.INFO, SERVER_TYPE.ANAX_FACING, 'Creating server');
    server = net.createServer((stream) => {
      const correlationId = getCorrelationId();
      saveLog(nodeId, LOG_TYPE.INFO, SERVER_TYPE.ANAX_FACING, 'Incoming connection acknowledged', undefined, correlationId);

      const self = Date.now();
      connections[self] = (stream);

      stream.on('end', () => {
        saveLog(nodeId, LOG_TYPE.INFO, SERVER_TYPE.ANAX_FACING, 'Incoming client disconnected', undefined, correlationId);
        delete connections[self];
      });

      stream.on('error', (error) => {
        saveLog(nodeId, LOG_TYPE.ERROR, SERVER_TYPE.ANAX_FACING, 'Error occured on incoming socket', { error }, correlationId);
      });

      stream.on('data', (msg) => {
        const msgStr = msg.toString();

        const formattedRequest = formatToJson(msgStr);
        routeRequest(nodeId, formattedRequest, correlationId)
          .then((response) => {
            try {
              stream.setEncoding('utf8');
              saveLog(
                nodeId, LOG_TYPE.INFO, SERVER_TYPE.ANAX_FACING, 'Sending response from docker socket', { response }, correlationId,
              );

              const { status, headers, data: responseData } = response;
              const { httpHeaders, isChunked } = formatToHttp(status, headers);

              if (isChunked) {
                stream.write(httpHeaders);
                responseData.forEach((body) => {
                  if (body && body.length > 0) {
                    const size = (body.length).toString(16);
                    stream.write(`${size}\r\n`);
                    stream.write(body);
                    stream.write('\r\n');
                  }
                });
                stream.end('0\r\n\r\n');
              }
              else if (response.data[0]) {
                stream.write(`${httpHeaders}${response.data[0]}`);
              }
              else {
                stream.write(httpHeaders);
              }
            }
            catch (error) {
              saveLog(
                nodeId, LOG_TYPE.ERROR, SERVER_TYPE.ANAX_FACING, 'Error occured while writing data to stream', { error }, correlationId,
              );
            }
          })
          .catch((error) => {
            saveLog(
              nodeId, LOG_TYPE.ERROR, SERVER_TYPE.ANAX_FACING, 'Error received from docker request server', { error }, correlationId,
            );
            stream.end();
          });
      });
    })
      .listen(socket)
      .on('connection', () => { });

    return server;
  }

  saveLog(nodeId, LOG_TYPE.INFO, SERVER_TYPE.ANAX_FACING, 'Checking for left over server');

  function cleanup() {
    if (!SHUTDOWN) {
      SHUTDOWN = true;
      saveLog(nodeId, LOG_TYPE.INFO, SERVER_TYPE.ANAX_FACING, 'Terminating server');
      if (Object.keys(connections).length) {
        const clients = Object.keys(connections);
        while (clients.length) {
          const client = clients.pop();
          connections[client].end();
        }
      }
      server.close();
      process.exit(0);
    }
  }
  process.on('SIGINT', cleanup);

  return fs.ensureDir(nodeSocketsDir)
    .then(() => fs.stat(SOCKET_FILE)
      .then(() => fs.unlink(SOCKET_FILE)
        .catch((error) => {
          saveLog(nodeId, LOG_TYPE.ERROR, SERVER_TYPE.ANAX_FACING, 'Error occured while removing old socket file', { error });
        }))
      .catch(() => { })
      .then(() => {
        server = createServer(SOCKET_FILE);
        fs.chmodSync(SOCKET_FILE, 777);
      }))
    .then(() => SOCKET_FILE);
};

module.exports = {
  initializeSocket,
};
