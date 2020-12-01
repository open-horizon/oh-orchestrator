const http = require('http');
const Promise = require('bluebird');

const { dockerSocketPath } = require('../../../configuration/config');
const { SERVER_TYPE, LOG_TYPE, saveLog } = require('../../../models/anaxSocketModel');

const DOCKER_ENDPOINTS = {
  CONTAINERS: '/containers',
};

const genericDockerOptions = {
  host: 'unix.sock',
  headers: {
    'Accept-Encoding': 'gzip',
    Connection: 'close',
  },
};
Object.freeze(genericDockerOptions);

const request = (
  nodeId,
  {
    method,
    host,
    endpoint,
    headers,
    body,
  },
  correlationId,
) => new Promise((resolve, reject) => {
  const options = {
    socketPath: dockerSocketPath,
    path: endpoint,
    method,
    headers,
    host,
  };
  saveLog(nodeId, LOG_TYPE.INFO, SERVER_TYPE.DOCKER_PROXY_FACING, 'Sending request', { options }, correlationId);

  const response = {};

  try {
    const callback = (res) => {
      response.data = [];
      response.headers = res.headers;
      response.status = {
        code: res.statusCode,
        message: res.statusMessage,
      };

      res.setEncoding('utf8');
      res.on('data', (data) => {
        response.data.push(data);
      });
      res.on('error', (error) => {
        saveLog(nodeId, LOG_TYPE.ERROR, SERVER_TYPE.DOCKER_PROXY_FACING, 'Error response received', { error }, correlationId);
        reject(error);
      });
      res.on('close', () => {
        saveLog(nodeId, LOG_TYPE.INFO, SERVER_TYPE.DOCKER_PROXY_FACING, 'Successful response received', { response }, correlationId);
        resolve(response);
      });
    };

    const clientRequest = http.request(options, callback);
    if (body) clientRequest.write(body);
    clientRequest.end();
  }
  catch (error) {
    saveLog(nodeId, LOG_TYPE.ERROR, SERVER_TYPE.DOCKER_PROXY_FACING, 'Error occured while requesting socket', { error }, correlationId);
    reject();
  }
});

const fetchContainerById = (nodeId, containerId, correlationId) => {
  const options = { ...genericDockerOptions };
  options.method = 'GET';
  options.endpoint = `${DOCKER_ENDPOINTS.CONTAINERS}/${containerId}/json?`;

  return request(
    nodeId,
    options,
    correlationId,
  );
};

module.exports = {
  request,
  fetchContainerById,
};
