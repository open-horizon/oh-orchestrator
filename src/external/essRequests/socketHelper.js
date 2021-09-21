const Promise = require('bluebird');
const https = require('https');
const fs = require('fs-extra');

const dataRequest = (nodeId, request) => new Promise((resolve, reject) => {
  console.log('===> in dataRequest');
  console.log('===> nodeId', nodeId);

  const callback = (res) => {
    let allData = '';
    res.setEncoding('utf8');

    res.on('data', (data) => {
      allData += data;
    });

    res.on('error', (error) => {
      reject(new Error(`Received error from ESS socket, error: ${error}`));
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
      reject(new Error(`Received error from ESS socket, error: ${error}`));
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
