const { rpRetry } = require('@bananabread/request-retry');

const config = require('../configuration/config');

const mdeployUrl = config.dependencies.MDEPLOY.url;
const { apiKey } = config.dependencies.MDEPLOY;

const rp = (...args) => rpRetry(...args)
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

const healthcheck = (correlationId) => rp({
  method: 'GET',
  headers: {
    'x-correlation-id': correlationId,
  },
  url: `${mdeployUrl}/healthcheck`,
});

const getClient = (correlationId) => rp({
  method: 'GET',
  url: `${mdeployUrl}/clients`,
  headers: {
    'x-correlation-id': correlationId,
    apiKey,
  },
});

const getClientForExternalNode = (externalNodeIds, correlationId) => rp({
  method: 'POST',
  headers: {
    'x-correlation-id': correlationId,
    apiKey,
  },
  url: `${mdeployUrl}/batchOps`,
  data: {
    nodes: externalNodeIds,
    request: {
      endpoint: '/clients',
      method: 'GET',
    },
  },
});

const getNodes = (correlationId) => rp({
  method: 'GET',
  headers: {
    'x-correlation-id': correlationId,
    apiKey,
  },
  url: `${mdeployUrl}/nodes`,
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
