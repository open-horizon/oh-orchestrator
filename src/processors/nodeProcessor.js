const nodeModel = require('../models/nodeModel');

const getNodes = (mdeployStatuses, correlationId) => nodeModel.getAllNodes(correlationId)
  .then((nodes) => {
    if (!mdeployStatuses) return nodes;

    return nodes.filter((node) => mdeployStatuses.includes(node.mdeployStatus));
  });

const getNodeDetails = (nodeId, correlationId) => nodeModel.getNodeById(nodeId, correlationId);

module.exports = {
  getNodes,
  getNodeDetails,
};
