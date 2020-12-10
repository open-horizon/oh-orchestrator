const Promise = require('bluebird');
const https = require('https');
const fs = require('fs-extra');

const { getRichError } = require('@bananabread/response-helper');

const dataRequest = (nodeId, request, correlationId) => new Promise((resolve, reject) => {
  const callback = (res) => {
    let allData = '';
    res.setEncoding('utf8');

    res.on('data', (data) => { allData += data; });

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
      reject(getRichError('System', 'Received error from ESS socket', { nodeId, request, correlationId }, error, 'error', correlationId));
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
