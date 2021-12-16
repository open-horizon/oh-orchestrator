const { getRichError } = require('@mimik/response-helper');
const { rpRetry } = require('@mimik/request-retry');

const config = require('../configuration/config');

const edgedaemonUrl = config.dependencies.EDGEDAEMON.url;
const { apiKey } = config.dependencies.EDGEDAEMON;

const getNodes = (correlationId) => {
  const rpOptions = {
    method: 'GET',
    headers: {
      'x-correlation-id': correlationId,
      apiKey,
    },
    url: `${edgedaemonUrl}/nodes`,
  };
  return rpRetry(rpOptions)
    .catch((err) => {
      throw getRichError('System', 'Failed to get nodes from edgedaemon', null, err, 'error', correlationId);
    })
    .then((res) => res.data);
};

const findNode = (nodeId, correlationId) => getNodes(correlationId)
  .then((nodes) => nodes.find((node) => node.id === nodeId));

const createNode = (id, dockerSocketPath, correlationId) => {
  const rpOptions = {
    method: 'POST',
    headers: {
      'x-correlation-id': correlationId,
      apiKey,
    },
    url: `${edgedaemonUrl}/nodes`,
    data: {
      id,
      dockerSocketPath,
    },
  };
  return rpRetry(rpOptions)
    .catch((err) => {
      throw getRichError('System', 'Failed to post node from edgedaemon', { id, dockerSocketPath }, err, 'error', correlationId);
    })
    .then((res) => res.data);
};

const deleteNode = (id, correlationId) => {
  const rpOptions = {
    method: 'DELETE',
    headers: {
      'x-correlation-id': correlationId,
      apiKey,
    },
    url: `${edgedaemonUrl}/nodes/${id}`,
  };
  return rpRetry(rpOptions)
    .catch((err) => {
      throw getRichError('System', 'Failed to delete node in edgedaemon', { id }, err, 'error', correlationId);
    })
    .then((res) => res.data);
};

module.exports = {
  findNode,
  createNode,
  deleteNode,
};
