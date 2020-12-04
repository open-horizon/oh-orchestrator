const nodeModel = require('../models/nodeModel');
const anaxSocketModel = require('../models/anaxSocketModel');

const getNodes = (mdeployStatuses, correlationId) => nodeModel.getAllNodes(correlationId)
  .then((nodes) => {
    if (!mdeployStatuses) return nodes;

    return nodes.filter((node) => mdeployStatuses.includes(node.mdeployStatus));
  });

const getNodeDetails = (nodeId, correlationId) => nodeModel.getNodeById(nodeId, correlationId)
  .then((node) => anaxSocketModel.findAnaxSocketById(nodeId, correlationId)
    .then((nodeDetails) => {
      const responseData = { ...node, anaxSocketDetails: { ...nodeDetails } };
      if (responseData.anaxSocketDetails && responseData.anaxSocketDetails.logs) {
        responseData.anaxSocketDetails.logs = [...responseData.anaxSocketDetails.logs];
        responseData.anaxSocketDetails.logs.reverse();
      }
      return responseData;
    }));

module.exports = {
  getNodes,
  getNodeDetails,
};
