const fs = require('fs-extra');
const FormData = require('form-data');

const { rpRetry } = require('@mimik/request-retry');
const logger = require('@mimik/sumologic-winston-logger');

const config = require('../configuration/config');

const { url, apiKey } = config.dependencies.MESS;

const postFile = (nodeId, pathName, fileName, localFilePath, correlationId) => rpRetry({
    method: 'POST',
    headers: {
      'x-correlation-id': correlationId,
      apiKey,
    },
    url: `${url}/objects`,
    data: {
      id: fileName,
      type: pathName,
      version: '1.0.0',
      destinations: [
        {
          nodeId,
        },
      ],
    },
  })
    .catch((err) => {
      if (err.statusCode === 409 || err.statusCode === 400) return;

      throw err;
    })
    .then(() => {
      const form = new FormData();
      form.append('file', fs.createReadStream(localFilePath));


      return rpRetry({
        method: 'PUT',
        headers: {
          ...form.getHeaders(),
          'x-correlation-id': correlationId,
          apiKey,
        },
        url: `${url}/objects/${pathName}/${fileName}/data`,
        data: form,
      })
    });

module.exports = {
  postFile,
};
