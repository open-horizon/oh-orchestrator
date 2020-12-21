const fs = require('fs-extra');

const { fetchActiveAgreements } = require('../external/anaxRequests');

const { postFile } = require('../external/mCDNRequests');

const {
  getObjectsByType,
  downloadObjectFile,
  markObjectReceived,
} = require('../external/essRequests');

const { deployModelToApp } = require('./demoHelper');

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
  demo3: {
    isOn: isDemo3On,
  },
} = require('../configuration/config');

const pollForObjectByType = (nodeId, agreementId, objectType, correlationId) => getObjectsByType(nodeId, agreementId, objectType, correlationId)
  .then((objectsResponse) => {
    // console.log('===> ', );
    console.log('===> pollingForObjectType', { nodeId, agreementId, objectType });
    if (!objectsResponse || !Array.isArray(objectsResponse)) return;

    objectsResponse.forEach((object) => {
      const {
        objectID: objectId,
        destinationPolicy: {
          properties: objectProperties,
        },
      } = object;

      const isGatewayDeployment = objectProperties.some(
        (property) => property.type === gatewayDeploymentPropertyType
          && property.name === gatewayDeploymentPropertyName
          && property.value === gatewayDeploymentPropertyValue,
      );

      if (isGatewayDeployment) return;

      const outputFileDir = `${essObjectsStorageDir}/${nodeId}/${agreementId}`;
      const outputFilePath = `${outputFileDir}/${objectType}_${objectId}`;

      fs.ensureDir(outputFileDir)
        .then(() => downloadObjectFile(nodeId, agreementId, objectType, objectId, outputFilePath, correlationId))
        .then((data) => {
          console.log('===> downloadObjectFile success', data);
          return data;
        })
        .catch((error) => {
          console.log('===> downloadObjectFile error', error);
          throw error;
        })
        .then(() => postFile(objectType, objectId, outputFilePath, correlationId))
        .then((data) => {
          console.log('===> postFile success', data);
          return data;
        })
        .catch((error) => {
          console.log('===> postFile error', error);
          throw error;
        })
        .then((mcdnFileProp) => {
          if (isDemo3On) return deployModelToApp(mcdnFileProp);
          return undefined;
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
  console.log('===> Initializing Polling', { node });
  const { id: nodeId } = node;
  setInterval(() => {
    console.log('===> Polling', { node });
    if (!node.anaxState || !node.anaxState.nodePort) return;

    console.log('===> fetching agreements');
    fetchActiveAgreements(node.anaxState.nodePort, correlationId)
      .then((activeAgreements) => {
        activeAgreements.forEach((activeAgreement) => {
          const { current_agreement_id: agreementId } = activeAgreement;
          console.log('===> fetched agreement', { agreementId });

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
