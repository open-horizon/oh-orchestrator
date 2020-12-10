const Promise = require('bluebird');
const https = require('https');
const fs = require('fs-extra');

const { getRichError } = require('@bananabread/response-helper');

const { anaxContainersStorageDir } = require('../../configuration/config');

const { shortenNodeId } = require('../../util/nodeUtil');

const getSocketPath = (nodeId, correlationId) => {
  const shortenedNodeId = shortenNodeId(nodeId);
  const filePath = `${anaxContainersStorageDir}/${shortenedNodeId}/fss-domain-socket/essapi.sock`;

  return fs.access(filePath)
    .then(() => filePath)
    .catch((err) => {
      throw getRichError('System', 'Failed to find/access to socketPath for nodeId', { filePath }, err, 'error', correlationId);
    });
};

const httpRequest = (nodeId, request, correlationId) => getSocketPath(nodeId, correlationId)
  .then((socketPath) => {
    const {
      method,
      endpoint,
      headers,
      body,
      cert,
    } = request;

    const options = {
      socketPath,
      path: endpoint,
      method,
      cert,
      headers,
    };

    const callback = (res) => {
      let allData = '';
      res.setEncoding('utf8');

      res.on('data', (data) => { allData += data; });

      res.on('error', (error) => {
        throw getRichError('System', 'Failed to find/access to socketPath for nodeId', { filePath }, err, 'error', correlationId); });

      res.on('close', () => {
        let result;
        try {
          result = JSON.parse(allData);
        }
        catch (e) {
          result = allData;
        }
        resolve(result);
      });
    };

    const clientRequest = https.request(options, callback);
    if (body) clientRequest.write(body);
    clientRequest.end();
  })


const fileRequest = (nodeId, socketPath, request, correlationId) => new Promise((resolve, reject) => {
  const {
    method,
    endpoint,
    headers,
    body,
    cert,
    filePath,
  } = request;

  const options = {
    socketPath,
    path: endpoint,
    method,
    cert,
    headers,
  };

  const dest = fs.createWriteStream(filePath);

  const callback = (res) => {
    res.on('data', (data) => {
      dest.write(data);
    });

    res.on('error', (error) => {
      reject(error);
    });

    res.on('close', () => {
      resolve();
    });
  };
  const clientRequest = https.request(options, callback);
  if (body) clientRequest.write(body);
  clientRequest.end();
});

module.exports = {
  httpRequest,
  fileRequest,
};
