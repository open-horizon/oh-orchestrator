const Promise = require('bluebird');
const https = require('https');
const fs = require('fs-extra');

// const { getRichError } = require('@bananabread/response-helper');

const dataRequest = (nodeId, request, correlationId) => new Promise((resolve, reject) => {
  console.log('===> in dataRequest');
  console.log('===> nodeId', nodeId);
  // console.log('===> request', request);

  const callback = (res) => {
    let allData = '';
    res.setEncoding('utf8');

    res.on('data', (data) => {
      // console.log('===> in data', data);
      allData += data;
    });

    res.on('error', (error) => {
      // reject(getRichError('System', 'Received error from ESS socket', { nodeId, request, correlationId }, error, 'error', correlationId));
      // console.log('===> in error', error);
      reject(new Error('Received error from ESS socket'));
    });

    res.on('close', () => {
      // console.log('===> in close');
      let result;
      try {
        result = JSON.parse(allData);
      }
      catch (e) {
        result = allData;
      }
      // console.log('===> result', result);
      const response = {};
      response.headers = res.headers;
      response.status = {
        code: res.statusCode,
        message: res.statusMessage,
      };
      // console.log('===> response', response);
      resolve(result);
    });
  };

  const clientRequest = https.request(request, callback);
  if (request.body) clientRequest.write(request.body);
  clientRequest.end();
});

const fileDownloadRequest = (nodeId, outputFilePath, request, correlationId) => new Promise((resolve, reject) => {
  const dest = fs.createWriteStream(outputFilePath);

  const callback = (res) => {
    res.on('data', (data) => {
      dest.write(data);
    });

    res.on('error', (error) => {
      // reject(getRichError('System', 'Received error from ESS socket', { nodeId, request, correlationId }, error, 'error', correlationId));
      // console.log('===> error', error);
      reject(new Error('Received error from ESS socket'));
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
