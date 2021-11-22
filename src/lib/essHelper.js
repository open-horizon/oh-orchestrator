const fs = require('fs-extra');

const logger = require('@bananabread/sumologic-winston-logger');
const { getRichError } = require('@bananabread/response-helper');

const { postFile } = require('../external/messRequests');
const { fetchActiveAgreements } = require('../external/anaxRequests');

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

      getCurrentNode()
        .then((gatewayNode) => {
          const outputFileDir = `${essObjectsStorageDir}/${nodeId}/${agreementId}`;
          const outputFilePath = `${outputFileDir}/${objectType}_${objectId}`;

          const destinationNodeId = isGatewayDeployment ? gatewayNode.nodeId : nodeId;

          return fs.ensureDir(outputFileDir)
            .then(() => downloadObjectFile(nodeId, agreementId, objectType, objectId, outputFilePath, correlationId))
            .then((data) => {
              console.log('===> downloadObjectFile success');
              return data;
            })
            .catch((error) => {
              console.log('===> downloadObjectFile error', error);
              throw error;
            })
            .then(() => {
              console.log('===> here', { activationTime, previousDeployment, destinationNodeId });

              previousDeployment = activationTime;
              return postFile(destinationNodeId, objectType, objectId, outputFilePath, correlationId)
                .then((data) => {
                  console.log('===> postFile success', data);
                  return data;
                })
                .catch((error) => {
                  console.log('===> postFile error', error);
                });
            });
        })
        .then(() => markObjectReceived(nodeId, agreementId, objectType, objectId, correlationId))
        .then((data) => {
          console.log('===> markObjectReceived success', data);
          return data;
        })
        .catch((error) => {
          console.log('===> markObjectReceived error', error);
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
