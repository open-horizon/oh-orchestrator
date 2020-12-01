const Promise = require('bluebird');

const { getRichError } = require('@bananabread/response-helper');
const logger = require('@bananabread/sumologic-winston-logger');
const { getCorrelationId } = require('@bananabread/request-helper');

const { nodeSync } = require('../../configuration/config');
const { mdeployStatusValues } = require('../../util/nodeUtil');
const { getCurrentNode } = require('../../external/jsonRPCRequests');

const {
  initializeAnaxNodeForEdgeNode,
  terminateAnaxNodeForEdgeNode,
} = require('../anaxHelper');

const {
  findNodeById,
  saveAndUpdateNode,
} = require('../../models/nodeModel');

const {
  clientStatusValues,
  getNodes,
  getClient,
  getClientForExternalNode,
} = require('../../external/mdeployRequests');

const nodesToBeTerminated = {};

const processNode = (discoveredNode, correlationId) => {
  if (discoveredNode.isGatewayNode) return Promise.resolve();

  const saveAndInitialize = () => saveAndUpdateNode(discoveredNode, correlationId)
    .then(() => initializeAnaxNodeForEdgeNode(discoveredNode, correlationId))
    .catch((error) => error);

  return findNodeById(discoveredNode.id)
    .then((persistedNode) => {
      if (!persistedNode) return saveAndInitialize();

      if (persistedNode.mdeployStatus === discoveredNode.mdeployStatus) return undefined;

      if (persistedNode.mdeployStatus !== mdeployStatusValues.ACTIVE
        && discoveredNode.mdeployStatus === mdeployStatusValues.ACTIVE) {
        return saveAndInitialize();
      }

      if (persistedNode.mdeployStatus === mdeployStatusValues.ACTIVE
        && discoveredNode.mdeployStatus !== mdeployStatusValues.ACTIVE) {
        if (!nodesToBeTerminated[discoveredNode.id]) {
          nodesToBeTerminated[discoveredNode.id] = true;
          return undefined;
        }

        return saveAndUpdateNode(discoveredNode, correlationId)
          .then(() => terminateAnaxNodeForEdgeNode(persistedNode))
          .then(() => {
            delete nodesToBeTerminated[discoveredNode.id];
          });
      }

      return saveAndUpdateNode(discoveredNode, correlationId);
    });
};

const syncNodes = () => {
  const correlationId = getCorrelationId();
  logger.debug('Starting edgeNodeSyncJob', { correlationId });
  return getCurrentNode()
    .then((gatewayNode) => getNodes(correlationId)
      .then((foundNodes) => getClientForExternalNode(foundNodes.map((foundNode) => foundNode.id), correlationId)
        .catch((error) => {
          throw getRichError('System', 'Error occured while fetching nodes client status using super mdeploy', { error }, null, 'error', correlationId);
        })
        .then((responses) => {
          const nodes = [];
          foundNodes.forEach((foundNode) => {
            const node = {
              id: foundNode.id,
              attributes: foundNode.attributes,
              characteristics: foundNode.characteristics,
            };
            if (foundNode.id === gatewayNode.nodeId) {
              node.isGatewayNode = true;
            }
            responses.forEach((response) => {
              if (response.nodeId === foundNode.id) {
                if (response.responseBody && response.responseBody.data) {
                  if (response.responseBody.data.status === clientStatusValues.ACTIVE) {
                    node.mdeployStatus = mdeployStatusValues.ACTIVE;
                  }
                  else {
                    node.mdeployStatus = mdeployStatusValues.INACTIVE;
                  }
                }
                else {
                  node.mdeployStatus = mdeployStatusValues.NOT_FOUND;
                }
              }
            });
            nodes.push(node);
          });
          return nodes;
        })))
    .then((nodes) => Promise.mapSeries(nodes, (node) => processNode(node)))
    .then((errorResponses) => {
      const errors = errorResponses.filter((resp) => resp !== undefined);

      if (errors.length > 0) logger.debug('Completed edgeNodeSyncJob with errors', { errors, correlationId });
      else logger.debug('Completed edgeNodeSyncJob', { correlationId });
    });
};

const start = () => getClient()
  .catch((error) => {
    throw getRichError('System', 'Could not connect to super mdeploy, error occured while fetching client status', { error }, null, 'error');
  })
  .then((data) => {
    if (data.status === clientStatusValues.INACTIVE) {
      throw getRichError('System', 'Super mdeploy client is not activated', null, null, 'error');
    }
  })
  .then(() => {
    syncNodes();
    setInterval(syncNodes, nodeSync.jobInterval * 1000);
  });

module.exports = {
  start,
};
