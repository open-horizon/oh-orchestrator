const rp = require('request-promise');

const config = require('../../../configuration/config');
const { getCurrentNode } = require('../../../external/jsonRPCRequests');
const { SERVER_TYPE, LOG_TYPE, saveLog } = require('../../../models/anaxSocketModel');

const mdeployUrl = config.dependencies.MDEPLOY.url;
const { projectId } = config.edgeEngine;

const MDEPLOY_ENDPOINTS = {
  IMAGES: '/images',
  CONTAINERS: '/containers',
  BATCHOPS: '/batchOps',
};

const request = (
  nodeId,
  {
    method,
    endpoint,
    body,
  },
  correlationId,
) => {
  const options = {
    uri: `${mdeployUrl}${MDEPLOY_ENDPOINTS.BATCHOPS}`,
    method: 'POST',
    body: {
      nodes: [
        nodeId,
      ],
      request: {
        endpoint,
        method,
      },
    },
    json: true,
  };
  if (body) options.body.request.body = body;

  saveLog(nodeId, LOG_TYPE.INFO, SERVER_TYPE.MDEPLOY_FACING, 'Requesting mdeploy', { options }, correlationId);
  return rp(options)
    .then((response) => {
      if (!response.data || !Array.isArray(response.data) || !response.data[0] || response.data[0].responseType !== 'success') {
        throw new Error(response);
      }
      const { data } = response.data[0].responseBody;
      saveLog(nodeId, LOG_TYPE.INFO, SERVER_TYPE.MDEPLOY_FACING, 'Successful response received from mdeploy', { data }, correlationId);
      return data;
    })
    .catch((error) => {
      saveLog(nodeId, LOG_TYPE.ERROR, SERVER_TYPE.MDEPLOY_FACING, 'Error response received from mdeploy', { error }, correlationId);
      throw new Error();
    });
};

const fetchImages = (nodeId, correlationId) => request(
  nodeId,
  {
    method: 'GET',
    endpoint: MDEPLOY_ENDPOINTS.IMAGES,
  },
  correlationId,
);

const createImage = (nodeId, image, correlationId) => getCurrentNode()
  .then((gatewayNode) => request(
    nodeId,
    {
      method: 'POST',
      endpoint: MDEPLOY_ENDPOINTS.IMAGES,
      body: {
        nodeId: gatewayNode.nodeId,
        imageId: `${projectId}-${image}-v1`,
      },
    },
    correlationId,
  ));

const createContainer = (nodeId, agreementId, name, body, correlationId) => getCurrentNode()
  .then((gatewayNode) => {
    const env = {
      'MCM.BASE_API_PATH': `/${name}/v1`,
    };

    if (body.Env) {
      body.Env.forEach((envEntry) => {
        const [envName, envValue] = envEntry.split('=');
        env[envName] = envValue;
      });
    }

    return request(
      nodeId,
      {
        method: 'POST',
        endpoint: MDEPLOY_ENDPOINTS.CONTAINERS,
        body: {
          name: `${agreementId}-${name}-v1`,
          imageName: `${name}-v1`,
          env,
          imageHostNodeId: gatewayNode.nodeId,
        },
      },
      correlationId,
    );
  });

const deleteContainerById = (nodeId, containerId, correlationId) => request(
  nodeId,
  {
    method: 'DELETE',
    endpoint: `${MDEPLOY_ENDPOINTS.CONTAINERS}/${containerId}`,
  },
  correlationId,
);

const fetchContainers = (nodeId, correlationId) => request(
  nodeId,
  {
    method: 'GET',
    endpoint: MDEPLOY_ENDPOINTS.CONTAINERS,
  },
  correlationId,
);

module.exports = {
  fetchImages,
  createImage,
  fetchContainers,
  createContainer,
  deleteContainerById,
};
