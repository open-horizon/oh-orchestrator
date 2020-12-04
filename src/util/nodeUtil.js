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
  EDGE_ENGINE: 'gatewayEdgeEngine',
};

const gatewayNodeIdsPortsMap = {};
gatewayNodeIdsPortsMap[gatewayNodeIds.DOCKER] = 8071;

module.exports = {
  gatewayNodeIds,
  gatewayNodeIdsPortsMap,
  mdeployStatusValues,
  anaxStatusValues,
};
