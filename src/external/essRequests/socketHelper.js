const Promise = require('bluebird');
const https = require('https');
const fs = require('fs-extra');

const logger = require('@mimik/sumologic-winston-logger');
const { getRichError } = require('@mimik/response-helper');

const dataRequest = (nodeId, request, correlationId) => new Promise((resolve, reject) => {
  logger.info('Sending data request', { nodeId, request }, correlationId);

  const callback = (res) => {
    let allData = '';
    res.setEncoding('utf8');

    res.on('data', (data) => {
      allData += data;
    });

    res.on('error', (error) => {
      reject(getRichError('System', 'Received error from ESS socket', { nodeId, request, correlationId }, error, 'error', correlationId));
    });

    res.on('close', () => {
      let result;
      try {
        result = JSON.parse(allData);
      }
      catch (e) {
        result = allData;
      }

      const response = {};
      response.headers = res.headers;
      response.status = {
        code: res.statusCode,
        message: res.statusMessage,
      };
      resolve(result);
    });
  };

  try {
    const clientRequest = https.request(request, callback);
    if (request.body) clientRequest.write(request.body);
    clientRequest.end();
  } catch (error) {
    reject(error);
  }
});

const fileDownloadRequest = (nodeId, outputFilePath, request, correlationId) => new Promise((resolve, reject) => {
  const dest = fs.createWriteStream(outputFilePath);

  const callback = (res) => {
    res.pipe(dest);

    res.on('error', (error) => {
      reject(getRichError('System', 'Received error from ESS socket', { nodeId, request, correlationId }, error, 'error', correlationId));
    });

    res.on('close', () => {
      resolve();
    });
  };

  try {
    const clientRequest = https.request(request, callback);
    if (request.body) clientRequest.write(request.body);
    clientRequest.end();  
  } catch (error) {
    reject(error);
  }
});

module.exports = {
  dataRequest,
  fileDownloadRequest,
};
