const fs = require('fs-extra');

const logger = require('@mimik/sumologic-winston-logger');

const { postFile } = require('../../external/messRequests');
const { getCurrentNode } = require('../../external/jsonRPCRequests');
const { markObjectReceived } = require('../../external/essRequests');
const { fetchActiveAgreements } = require('../../external/anaxRequests');

const {
  getObjectStatus,
  getObjectsByType,
  downloadObjectFile,
} = require('../../external/essRequests');

const {
  getESSStorageDir,
  getESSAgreementAuthFilePath,
} = require('../../util/anaxUtil');

const {
  hzn: {
    ess: {
      trackedObjectTypes,
      gatewayDeploymentPropertyType,
      gatewayDeploymentPropertyName,
      gatewayDeploymentPropertyValue,
    },
  },
  essObjectsPollingInterval,
} = require('../../configuration/config');

const processingObjects = {};
const ESS_OBJECT_DOWNLOADED_STATUS = 'completelyReceived';
// const ESS_OBJECT_RECEIVED_STATUS = 'objreceived'; TODO remove if not used

const getObjectsBeingDownloadedFlag = (nodeId, agreementId, objectType, objectId) => `${nodeId}_${agreementId}_${objectType}_${objectId}`;

const pollForObjectByType = (nodeId, agreementId, objectType, correlationId) => fs.pathExists(getESSAgreementAuthFilePath(nodeId, agreementId))
  .then((agreementAuthExists) => {
    if (!agreementAuthExists) return;

    return getObjectsByType(nodeId, agreementId, objectType, correlationId)
      .then((objectsResponse) => {
        logger.info('Polling for object by type', { nodeId, agreementId, objectType }, correlationId);
        if (!objectsResponse || !Array.isArray(objectsResponse)) return;

        objectsResponse.forEach((object) => {
          const {
            objectID: objectId,
            destinationPolicy: {
              properties: objectProperties,
            },
          } = object;

          const objectsBeingDownloadedFlag = getObjectsBeingDownloadedFlag(nodeId, agreementId, objectType, objectId);

          if (processingObjects[objectsBeingDownloadedFlag]) return;

          const contentDeploymentInstructionProperty = objectProperties.find(
            (property) => property.type === gatewayDeploymentPropertyType
              && property.name === gatewayDeploymentPropertyName
          )

          if (!contentDeploymentInstructionProperty) return;

          const isGatewayDeployment = contentDeploymentInstructionProperty.value === gatewayDeploymentPropertyValue;

          getObjectStatus(nodeId, agreementId, objectType, objectId, correlationId)
            .then((status) => {
              if (status !== ESS_OBJECT_DOWNLOADED_STATUS) return;

              processingObjects[objectsBeingDownloadedFlag] = true;

              return getCurrentNode(correlationId)
                .then((gatewayNode) => {
                  const outputFileDir = getESSStorageDir(nodeId, agreementId, objectType);
                  const outputFilePath = `${outputFileDir}/${objectId}`;

                  const destinationNodeId = isGatewayDeployment ? gatewayNode.nodeId : nodeId;

                  return fs.ensureDir(outputFileDir)
                    .then(() => downloadObjectFile(nodeId, agreementId, objectType, objectId, outputFilePath, correlationId))
                    .then(() => postFile(destinationNodeId, objectType, objectId, outputFilePath, correlationId))
                    .then(() => markObjectReceived(nodeId, agreementId, objectType, objectId, correlationId))
                    .catch((error) => {
                      logger.error('Error occured while delivering ESS object', { error }, correlationId);
                    });
                })
                .finally(() => {
                  delete processingObjects[objectsBeingDownloadedFlag];
                })
            });
        });
      })
      .catch(() => { });
  });



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
