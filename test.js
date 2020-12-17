/* eslint-disable no-unused-vars */
const {
  markObjectReceived,
  getObjectsByType,
  downloadObjectFile,
  establishObectTypeWebhook,
} = require('./src/external/essRequests');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const nodeId = 'bc8ebd2abf8398338c9f8a64cc6ffb14167601a684c953f3aac39c1d';
// const nodeId = 'nodeId';
const agreementId = '0a152a3d0e9f77024fa7092f339649406638ec09f4a21454611f7b43ed0fd375';
const objectType = 'imageRecognition';
// const objectType = 'model';
const objectId = 'img_reco_poc.zip';

const correlationId = '--correlation--';

getObjectsByType(nodeId, agreementId, objectType, correlationId)
  // DELETE ME
  .then((data) => {
    console.log('===> getObjectsByType success', data);
    return data;
  })
  .catch((error) => {
    console.log('===> getObjectsByType error', error);
    throw error;
  });

// markObjectReceived(nodeId, agreementId, objectType, objectId, correlationId)
//   // DELETE ME
//   .then((data) => {
//     console.log('===> markObjectConsumed success', data);
//     return data;
//   })
//   .catch((error) => {
//     console.log('===> markObjectConsumed error', error);
//     throw error;
//   });

// downloadObjectFile(nodeId, agreementId, objectType, objectId, correlationId)
//   // DELETE ME
//   .then((data) => {
//     console.log('===> getObjectsByType success', data);
//     return data;
//   })
//   .catch((error) => {
//     console.log('===> getObjectsByType error', error);
//     throw error;
//   });

const receiverUrl = 'http://localhost:3000';

// establishObectTypeWebhook(nodeId, agreementId, objectType, receiverUrl, correlationId)
//   // DELETE ME
//   .then((data) => {
//     console.log('===> establishObjectTypeWebhook success', data);
//     return data;
//   })
//   .catch((error) => {
//     console.log('===> establishObjectTypeWebhook error', error);
//     throw error;
//   });
