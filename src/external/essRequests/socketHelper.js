const Promise = require('bluebird');
const https = require('https');
const fs = require('fs-extra');

const logger = require('@bananabread/sumologic-winston-logger');
const { getRichError } = require('@bananabread/response-helper');

const dataRequest = (nodeId, request, correlationId) => new Promise((resolve, reject) => {
  logger.info('Sending data request', { nodeId, request }, correlationId);

  const callback = (res) => {
    let allData = '';
    res.setEncoding('utf8');

    res.on('data', (data) => {
      allData += data;
    });

    res.on('error', (error) => {
<<<<<<< HEAD
      reject(getRichError('System', 'Received error from ESS socket', { nodeId, request, correlationId }, error, 'error', correlationId));
=======
      reject(new Error(`Received error from ESS socket, error: ${error}`));
>>>>>>> 9f20540672076bbb5e27feafad0401b9a38fb699
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
<<<<<<< HEAD
=======

>>>>>>> 9f20540672076bbb5e27feafad0401b9a38fb699
      resolve(result);
    });
  };

  const clientRequest = https.request(request, callback);
  if (request.body) clientRequest.write(request.body);
  clientRequest.end();
});

const fileDownloadRequest = (nodeId, outputFilePath, request) => new Promise((resolve, reject) => {
  const dest = fs.createWriteStream(outputFilePath);

  const callback = (res) => {
    res.on('data', (data) => {
      dest.write(data);
    });

    res.on('error', (error) => {
<<<<<<< HEAD
      reject(getRichError('System', 'Received error from ESS socket', { nodeId, request, correlationId }, error, 'error', correlationId));
=======
      reject(new Error(`Received error from ESS socket, error: ${error}`));
>>>>>>> 9f20540672076bbb5e27feafad0401b9a38fb699
    });

    res.on('close', () => {
      resolve();
    });
  };
  const clientRequest = https.request(request, callback);
  if (request.body) clientRequest.write(request.body);
  clientRequest.end();
});

module.exports = {
  dataRequest,
  fileDownloadRequest,
};
