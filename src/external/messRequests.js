// const oAuthHelper = require('@bananabread/oauth-helper');
const rp = require('request-promise');

const config = require('../configuration/config');

const messUrl = config.dependencies.MESS.url;

const postFile = (nodeId, pathName, fileName, localFilePath, correlationId) => rp({
  url: `${messUrl}/objects`,
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
});

module.exports = {
  postFile,
};
