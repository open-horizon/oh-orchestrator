const { rpRetry } = require('@mimik/request-retry');

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

const getClientForExternalNodes = (externalNodeIds, correlationId) => rp({
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

const getContainersForExternalNode = (externalNodeId, correlationId) => rp({
  method: 'POST',
  headers: {
    'x-correlation-id': correlationId,
    apiKey,
  },
  url: `${mdeployUrl}/batchOps`,
  data: {
    nodes: [externalNodeId],
    request: {
      endpoint: '/containers',
      method: 'GET',
    },
  },
})
  .then((response) => {
    if (!response.data || !Array.isArray(response.data) || !response.data[0] || response.data[0].responseType !== 'success') {
      throw new Error(response);
    }
    const { data } = response.data[0].responseBody;
    return data;
  })

const deleteContainersForExternalNode = (externalNodeId, containerIds, correlationId) => Promise.map(containerIds, (containerId) => rp({
  method: 'POST',
  headers: {
    'x-correlation-id': correlationId,
    apiKey,
  },
  url: `${mdeployUrl}/batchOps`,
  data: {
    nodes: externalNodeId,
    request: {
      endpoint: `/containers/${containerIds}`,
      method: 'DELETE',
    },
  },
})
.catch(() => {}));

const clientStatusValues = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

module.exports = {
  getNodes,
  getClient,
  healthcheck,
  getClientForExternalNodes,
  getContainersForExternalNode,
  deleteContainersForExternalNode,
  clientStatusValues,
};
