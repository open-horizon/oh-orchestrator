const fs = require('fs-extra');

const logger = require('@bananabread/sumologic-winston-logger');

const { postFile } = require('../external/messRequests');
const { markObjectReceived } = require('../external/essRequests');
const { fetchActiveAgreements } = require('../external/anaxRequests');
const { getCurrentNode } = require('../external/jsonRPCRequests');

const {
  getObjectsByType,
  downloadObjectFile,
} = require('../external/essRequests');

const {
  hzn: {
    ess: {
      trackedObjectTypes,
      gatewayDeploymentPropertyType,
      gatewayDeploymentPropertyName,
      gatewayDeploymentPropertyValue,
    },
  },
  essObjectsStorageDir,
  essObjectsPollingInterval,
} = require('../configuration/config');

let previousDeployment = 0;

const pollForObjectByType = (nodeId, agreementId, objectType, correlationId) => getObjectsByType(nodeId, agreementId, objectType, correlationId)
  .then((objectsResponse) => {
    logger.info('Polling for object by type', { nodeId, agreementId, objectType }, correlationId);
    if (!objectsResponse || !Array.isArray(objectsResponse)) return;

    objectsResponse.forEach((object) => {
      const {
        objectID: objectId,
        activationTime,
        destinationPolicy: {
          properties: objectProperties,
        },
      } = object;

      const isGatewayDeployment = objectProperties.some(
        (property) => property.type === gatewayDeploymentPropertyType
          && property.name === gatewayDeploymentPropertyName
          && property.value === gatewayDeploymentPropertyValue,
      );

      getCurrentNode(correlationId)
        .then((gatewayNode) => {
          const outputFileDir = `${essObjectsStorageDir}/${nodeId}/${agreementId}`;
          const outputFilePath = `${outputFileDir}/${objectType}_${objectId}`;

          const destinationNodeId = isGatewayDeployment ? gatewayNode.nodeId : nodeId;

          return fs.ensureDir(outputFileDir)
            .then(() => downloadObjectFile(nodeId, agreementId, objectType, objectId, outputFilePath, correlationId))
            .then((data) => {
              logger.debug('===> downloadObjectFile success', { data }, correlationId);
              return data;
            })
            .catch((error) => {
              logger.error('===> downloadObjectFile error', { error }, correlationId);
              throw error;
            })
            .then(() => {
              logger.debug('===> ready to post', { activationTime, previousDeployment, destinationNodeId }, correlationId);
              previousDeployment = activationTime;
              return postFile(destinationNodeId, objectType, objectId, outputFilePath, correlationId)
                .then((data) => {
                  logger.debug('===> postFile success', { data }, correlationId);
                  return data;
                })
                .catch((error) => {
                  logger.error('===> postFile error', { error }, correlationId);
                });
            });
        })
        .then(() => markObjectReceived(nodeId, agreementId, objectType, objectId, correlationId))
        .then((data) => {
          logger.debug('===> markObjectReceived success', { data }, correlationId);
          return data;
        })
        .catch((error) => {
          logger.error('===> markObjectReceived error', { error }, correlationId);
        });
    });
  })
  .catch(() => { });

const initializePolling = (node, correlationId) => {
  const { id: nodeId } = node;

  logger.info('Initializing polling', { nodeId }, correlationId);

  setInterval(() => {
    logger.info('Polling', { nodeId }, correlationId);
    if (!node.anaxState || !node.anaxState.nodePort) return;

    logger.info('Fetching agreements', { nodeId }, correlationId);
    fetchActiveAgreements(node.anaxState.nodePort, correlationId)
      .then((activeAgreements) => {
        activeAgreements.forEach((activeAgreement) => {
          const { current_agreement_id: agreementId } = activeAgreement;
          logger.info('Agreements fetched', { nodeId }, correlationId);

          trackedObjectTypes.forEach((objectType) => {
            pollForObjectByType(nodeId, agreementId, objectType, correlationId);
          });
        });
      })
      .catch(() => { });
  }, essObjectsPollingInterval);
};

module.exports = {
  initializePolling,
};
