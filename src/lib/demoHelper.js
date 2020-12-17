const rp = require('request-promise');

const {
  mcdnAuthToken,
  edgeEngine: {
    projectId,
  },
  demo3: {
    systemToken,
    appIpAddress,
  },
} = require('../configuration/config');

let modelVersion = 1;

const deployModelToApp = (mcdnModelUrl) => {
  modelVersion += 1;

  return rp({
    uri: `http://${appIpAddress}:8083/${projectId}/mdeploy/v1/containers`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${systemToken}`,
    },
    body: {
      env: {
        AUTHORIZATION_KEY: 'test',
        'MCM.BASE_API_PATH': '/mmodelshare/v1',
        'MCM.WEBSOCKET_SUPPORT': 'false',
        MODEL_URL: mcdnModelUrl,
        MODEL_VERSION: `model-1.0.${modelVersion}`,
        MAX_EVENT_COUNT: '5',
      },
      id: 'mmodelshare-v1',
      imageName: 'mmodelshare-v1',
      imageId: 'mmodelshare-v1',
      name: 'mmodelshare-v1',
      state: 'started',
    },
    json: true,
  })
    .delay(5000)
    .then(() => rp({
      uri: mcdnModelUrl,
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${mcdnAuthToken}`,
      },
      json: true,
    }));
};

module.exports = {
  deployModelToApp,
};
