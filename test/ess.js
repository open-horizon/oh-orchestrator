/* eslint-disable no-console */
const {
  markObjectReceived,
  getObjectsByType,
  downloadObjectFile,
  establishObectTypeWebhook,
} = require('../src/external/essRequests');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
process.env.LOG_MODE="none";

const nodeId = '89b5345b4a3d01ed5d053417e96bd9df320e765adb12dd9971485dc5';
const agreementId = '6bec1300d84a95d0acca516f1855dd22fe8ec17bb36a165683ae2777e18baebf';
const objectType = 'model';
const objectId = 'img_reco_poc.zip';

const correlationId = '--correlation--';

getObjectsByType(nodeId, agreementId, objectType, correlationId)
  .then((data) => {
    console.log('===> getObjectsByType success', data);
    return data;
  })
  .catch((error) => {
    console.log('===> getObjectsByType error', error);
    throw error;
  });

markObjectReceived(nodeId, agreementId, objectType, objectId, correlationId)
  .then((data) => {
    console.log('===> markObjectConsumed success', data);
    return data;
  })
  .catch((error) => {
    console.log('===> markObjectConsumed error', error);
    throw error;
  });

downloadObjectFile(nodeId, agreementId, objectType, objectId, correlationId)
  .then((data) => {
    console.log('===> getObjectsByType success', data);
    return data;
  })
  .catch((error) => {
    console.log('===> getObjectsByType error', error);
    throw error;
  });

const receiverUrl = 'http://localhost:3000';

establishObectTypeWebhook(nodeId, agreementId, objectType, receiverUrl, correlationId)
  .then((data) => {
    console.log('===> establishObjectTypeWebhook success', data);
    return data;
  })
  .catch((error) => {
    console.log('===> establishObjectTypeWebhook error', error);
    throw error;
  });
