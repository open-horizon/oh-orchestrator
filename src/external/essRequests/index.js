const { getRequestData } = require('./requestDataHelper');

const {
  dataRequest,
  fileDownloadRequest,
} = require('./socketHelper');

const ESS_REQUEST_BASE_PATH = 'https://localhost/api/v1';

const getObjectsByType = (nodeId, agreementId, objectType, correlationId) => getRequestData(nodeId, agreementId, correlationId)
  .then((requestData) => {
    const request = {
      method: 'GET',
      path: `${ESS_REQUEST_BASE_PATH}/objects/${objectType}`,
    };

    const completeRequest = { ...request, ...requestData };

    return dataRequest(nodeId, completeRequest, correlationId);
  });

const downloadObjectFile = (nodeId, agreementId, objectType, objectId, outputFilePath, correlationId) => getRequestData(nodeId, agreementId, correlationId)
  .then((requestData) => {
    const request = {
      method: 'GET',
      path: `${ESS_REQUEST_BASE_PATH}/objects/${objectType}/${objectId}/data`,
    };

    const completeRequest = { ...request, ...requestData };

    return fileDownloadRequest(nodeId, outputFilePath, completeRequest, correlationId);
  });

module.exports = {
  getObjectsByType,
  downloadObjectFile,
};
