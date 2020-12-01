const { getRichError } = require('@bananabread/response-helper');

const { requestTypes, identifyRequest } = require('./requestIdentifier');
const { SERVER_TYPE, LOG_TYPE, saveLog } = require('../../models/anaxSocketModel');

const {
  converContainerResponse,
} = require('./converters/mdeployDockerResponseConverter');

const {
  request: dockerRequest,
  fetchContainerById: dockerFetchContainerById,
} = require('./requesters/dockerRequester');

const {
  createContainer: mdeployCreateContainer,
  fetchContainers: mdeployFetchContainers,
  deleteContainerById: mdeployDeleteContainerById,
  createImage: mdeployCreateImage,
} = require('./requesters/mdeployRequester');

const adjustContentLength = (dockerResponse) => {
  if (!dockerResponse.headers['content-length']) return dockerResponse;
  const updatedResponse = dockerResponse;
  updatedResponse.headers['content-length'] = updatedResponse.data[0].length;
  return updatedResponse;
};

const createImage = (nodeId, formattedRequest, { user, image, tag }, correlationId) => dockerRequest(nodeId, formattedRequest, correlationId)
  .then((dockerResponse) => {
    if (dockerResponse.status.code === 200) return dockerResponse;

    return mdeployCreateImage(nodeId, image, correlationId)
      .then(() => {
        const successfulDockerResponse = dockerResponse;
        successfulDockerResponse.status.code = 200;
        successfulDockerResponse.status.message = 'OK';
        delete successfulDockerResponse.headers['content-length'];
        successfulDockerResponse.headers['transfer-encoding'] = 'chunked';
        successfulDockerResponse.data = [
          `{"status":"Pulling from ${user}/${image}","id":"1.0.0"}`,
          `{"status":"Digest: ${tag}"}`,
          `{"status":"Pulling from ${user}/${image}","id":"latest"}`,
          `{"status":"Digest: ${tag}"}`,
          `{"status":"Status: Image is up to date for ${user}/${image}"}`,
        ];
        return successfulDockerResponse;
      })
      .catch(() => dockerResponse);
  });

const fetchAllContainers = (nodeId, formattedRequest, correlationId) => dockerRequest(nodeId, formattedRequest, correlationId)
  .then((dockerResponse) => mdeployFetchContainers(nodeId, correlationId)
    .then((mdeployResponse) => {
      const dockerContainers = JSON.parse(dockerResponse.data[0]);
      const mdeployContainers = mdeployResponse.map((container) => converContainerResponse(nodeId, container, correlationId));
      const allContainers = [...dockerContainers, ...mdeployContainers];

      const completeResponse = { ...dockerResponse };
      completeResponse.data = [`${JSON.stringify(allContainers)}\n`];
      return adjustContentLength(completeResponse);
    })
    .catch(() => dockerResponse));

const fetchContainerById = (nodeId, containerId, correlationId) => dockerFetchContainerById(nodeId, containerId, correlationId)
  .then((dockerResponse) => {
    if (Array.isArray(dockerResponse.data[0]) && dockerResponse.data[0].length > 0) {
      return dockerResponse;
    }
    return mdeployFetchContainers(nodeId, correlationId)
      .then((mdeployResponse) => {
        const foundContainer = mdeployResponse.find((container) => container.id === containerId);

        if (!foundContainer) return dockerResponse;

        const convertedResponse = converContainerResponse(nodeId, foundContainer, correlationId);
        const completeResponse = { ...dockerResponse };
        completeResponse.data = [`${JSON.stringify(convertedResponse)}\n`];
        return adjustContentLength(completeResponse);
      })
      .catch(() => dockerResponse);
  });

const createContainer = (
  nodeId,
  formattedRequest,
  {
    agreementId,
    name,
    body,
    isGatewayDeployment,
  },
  correlationId,
) => {
  if (isGatewayDeployment) return dockerRequest(nodeId, formattedRequest, correlationId);

  return mdeployCreateContainer(nodeId, agreementId, name, body, correlationId);
};

const routeRequest = (nodeId, formattedRequest, correlationId) => identifyRequest(nodeId, formattedRequest, correlationId)
  .then((identifiedRequest) => {
    const { type, data } = identifiedRequest;
    saveLog(nodeId, LOG_TYPE.INFO, SERVER_TYPE.ANAX_FACING, 'Incoming request identified', { identifiedRequest, formattedRequest }, correlationId);

    switch (type) {
      case requestTypes.UNIDENTIFIED: // Docker Only
        return dockerRequest(nodeId, formattedRequest, correlationId);

      case requestTypes.NON_IMAGE_CONTAINER: // Docker Only
        return dockerRequest(nodeId, formattedRequest, correlationId);

      case requestTypes.CREATE_IMAGE:
        return createImage(nodeId, formattedRequest, data, correlationId);

      case requestTypes.FETCH_IMAGE: // TODO Update when service image posting mechanism is changed for HZN Exchange
        return dockerRequest(nodeId, formattedRequest, correlationId);

      case requestTypes.CREATE_CONTAINER:
        return createContainer(nodeId, formattedRequest, data, correlationId);

      case requestTypes.START_CONTAINER: // Docker Only
        return dockerRequest(nodeId, formattedRequest, correlationId);

      case requestTypes.KILL_CONTAINER: // Docker Only
        return dockerRequest(nodeId, formattedRequest, correlationId);

      case requestTypes.DELETE_CONTAINER:
        return mdeployDeleteContainerById(nodeId, data.containerId, correlationId)
          .catch(() => { })
          .then(() => dockerRequest(nodeId, formattedRequest, correlationId));

      case requestTypes.FETCH_ALL_CONTAINERS:
        return fetchAllContainers(nodeId, formattedRequest, correlationId);

      case requestTypes.FETCH_CONTAINER:
        return fetchContainerById(nodeId, data.containerId, correlationId);

      default:
        return Promise.reject(getRichError('System', 'Unknown identification for request received', { nodeId, identifiedRequest }, null, 'error', correlationId));
    }
  });

module.exports = {
  routeRequest,
};
