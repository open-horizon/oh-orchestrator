const nodeModel = require('../models/nodeModel');

const { edgeDeploymentContainerEnv } = require('../configuration/config');
const { getContainersForExternalNode, deleteContainersForExternalNode } = require('../external/mdeployRequests');

const [edgeDeploymentContainerEnvKey, edgeDeploymentContainerEnvValue] = edgeDeploymentContainerEnv.split('=');

const cleanupNode = (id, correlationId) => getContainersForExternalNode(id, correlationId)
  .then((containers) => {
    const containersToDelete = containers
      .filter((container) => container.env[edgeDeploymentContainerEnvKey] === edgeDeploymentContainerEnvValue)
      .map((container) => container.id);

    if (containersToDelete.length < 1) return undefined;

    return deleteContainersForExternalNode(id, containersToDelete, correlationId);
  })
  // TODO Handle error
  .catch(() => { });

const cleanupAllNodes = (correlationId) => nodeModel.getAllNodes(correlationId)
  .then((nodes) => Promise.map(nodes, ({ id }) => cleanupNode(id, correlationId)));

module.exports = {
  cleanupNode,
  cleanupAllNodes,
};
