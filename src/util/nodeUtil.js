const mdeployStatusValues = {
  NOT_FOUND: 'not_found',
  INACTIVE: 'inactive',
  ACTIVE: 'active',
};

const anaxStatusValues = {
  CONFIGURED: 'configured',
  UNCONFIGURED: 'unconfigured',
};

const gatewayNodeIds = {
  DOCKER: 'gatewayDocker',
};

const gatewayNodeIdsPortsMap = {};
gatewayNodeIdsPortsMap[gatewayNodeIds.DOCKER] = 8071;

const shortenNodeId = (nodeId) => nodeId.substr(0, 16);

module.exports = {
  gatewayNodeIds,
  gatewayNodeIdsPortsMap,
  mdeployStatusValues,
  anaxStatusValues,
  shortenNodeId,
};
