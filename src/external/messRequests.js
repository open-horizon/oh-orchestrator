const rp = require('request-promise');
const fs = require('fs-extra');

const config = require('../configuration/config');

const {
  edgeEngine: {
    url: edgeEngineUrl,
    projectId: edgeEngineProjectId,
  },
} = config;

const messUrl = `${edgeEngineUrl}/${edgeEngineProjectId}/mess/v1`;

const postFile = (nodeId, pathName, fileName, localFilePath, correlationId) => {
  console.log('===> postFile', { nodeId, pathName, fileName });

  return rp({
    uri: `${messUrl}/objects`,
    method: 'POST',
    headers: {
      'x-correlation-id': correlationId,
    },
    body: {
      id: fileName,
      type: pathName,
      version: '1.0.0',
      destinations: [
        {
          nodeId,
        },
      ],
    },
    json: true,
  })
    .catch(() => {

    })
    .catch((error) => {
      console.log('===> error posting object metadata', error);
    })
    .then(() => rp({
      uri: `${messUrl}/objects/${pathName}/${fileName}/data`,
      method: 'PUT',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
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
      console.log('===> error posting object DATA', error);
    });
};

module.exports = {
  postFile,
};
