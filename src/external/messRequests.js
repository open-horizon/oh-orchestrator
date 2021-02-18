const oAuthHelper = require('@bananabread/oauth-helper');

const config = require('../configuration/config');

const messUrl = config.dependencies.MESS.url;

const { rpAuth: rpAuthOrig } = oAuthHelper(config);

const rpAuth = (...args) => rpAuthOrig(...args)
  .then((response) => {
    if (!response) return undefined;

    let parsedResponse;

    if (typeof response === 'object') parsedResponse = response;
    else {
      try {
        parsedResponse = JSON.parse(response);
      }
      catch (e) {
        return response;
      }
    }
    if (parsedResponse.data && Object.keys(parsedResponse).length === 1) return parsedResponse.data;
    return parsedResponse;
  });

const postFile = (nodeId, pathName, fileName, localFilePath, correlationId) => {
  console.log('===> postFile', { nodeId, pathName, fileName });

  return rpAuth('MESS', {
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
};

module.exports = {
  postFile,
};
