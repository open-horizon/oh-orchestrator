const oAuthHelper = require('@bananabread/oauth-helper');

const config = require('../configuration/config');

const mdeployUrl = config.dependencies.MDEPLOY.url;
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

const healthcheck = (correlationId) => rpAuth('MDEPLOY', {
  url: `${mdeployUrl}/healthcheck`,
  headers: {
    'x-correlation-id': correlationId,
  },
});

const getClient = (correlationId) => rpAuth('MDEPLOY', {
  url: `${mdeployUrl}/clients`,
  headers: {
    'x-correlation-id': correlationId,
  },
});

const getClientForExternalNode = (externalNodeIds, correlationId) => rpAuth('MDEPLOY', {
  url: `${mdeployUrl}/batchOps`,
  method: 'POST',
  headers: {
    'x-correlation-id': correlationId,
  },
  body: {
    nodes: externalNodeIds,
    request: {
      endpoint: '/clients',
      method: 'GET',
    },
  },
  json: true,
});

const getNodes = (correlationId) => rpAuth('MDEPLOY', {
  url: `${mdeployUrl}/nodes`,
  headers: {
    'x-correlation-id': correlationId,
  },
});

const clientStatusValues = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

module.exports = {
  getNodes,
  getClient,
  healthcheck,
  getClientForExternalNode,
  clientStatusValues,
};
