const oAuthHelper = require('@bananabread/oauth-helper');
const { getRichError } = require('@bananabread/response-helper');

const config = require('../configuration/config');

const edgedaemonUrl = config.dependencies.EDGEDAEMON.url;
const { rpAuth } = oAuthHelper(config);

const getNodes = (correlationId) => {
  const rpOptions = {
    method: 'GET',
    headers: {
      'x-correlation-id': correlationId,
    },
    url: `${edgedaemonUrl}/nodes`,
    json: true,
  };
  return rpAuth('EDGEDAEMON', rpOptions)
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
    },
    url: `${edgedaemonUrl}/nodes`,
    body: {
      id,
      dockerSocketPath,
    },
    json: true,
  };
  return rpAuth('EDGEDAEMON', rpOptions)
    .then((res) => res.data);
};

const deleteNode = (id, correlationId) => {
  const rpOptions = {
    method: 'DELETE',
    headers: {
      'x-correlation-id': correlationId,
    },
    url: `${edgedaemonUrl}/nodes/${id}`,
    json: true,
  };
  return rpAuth('EDGEDAEMON', rpOptions)
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
