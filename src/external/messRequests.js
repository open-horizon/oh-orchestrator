const fs = require('fs-extra');

const { rpRetry } = require('@bananabread/request-retry');
const logger = require('@bananabread/sumologic-winston-logger');

const config = require('../configuration/config');

const messUrl = config.dependencies.MESS.url;
const { apiKey } = config.dependencies.MESS.apiKey;

const postFile = (nodeId, pathName, fileName, localFilePath, correlationId) => {
  logger.debug('===> postFile', { nodeId, pathName, fileName }, correlationId);
  return rpRetry({
    method: 'POST',
    headers: {
      'x-correlation-id': correlationId,
      apiKey,
    },
    url: `${messUrl}/objects`,
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
    .catch((error) => {
      logger.error('===> error posting object metadata', { error }, correlationId);
    })
    .then(() => rpRetry({
      method: 'PUT',
      headers: {
        'Content-Type': 'multipart/form-data',
        'x-correlation-id': correlationId,
        apiKey,
      },
      url: `${messUrl}/objects/${pathName}/${fileName}/data`,
      formData: {
        file: {
          value: fs.createReadStream(localFilePath),
          options: {
            filename: fileName,
          },
        },
      },
    }))
    .catch((error) => {
      logger.error('===> error posting object DATA', { error }, correlationId);
    });
};

module.exports = {
  postFile,
};
