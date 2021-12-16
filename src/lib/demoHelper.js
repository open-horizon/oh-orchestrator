const { rpRetry } = require('@mimik/request-retry');

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

const deployModelToApp = (mcdnFileProp, correlationId) => {
  modelVersion += 1;
  const { mCDNURL, pathName, fileName } = mcdnFileProp;

  return rpRetry({
    url: `http://${appIpAddress}:8083/${projectId}/mdeploy/v1/containers`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${systemToken}`,
      'x-correlation-id': correlationId,
    },
    data: {
      env: {
        AUTHORIZATION_KEY: 'test',
        'MCM.BASE_API_PATH': '/mmodelshare/v1',
        'MCM.WEBSOCKET_SUPPORT': 'false',
        MODEL_URL: `${mCDNURL}/dl/${pathName}/${fileName}`,
        MODEL_VERSION: `model-1.0.${modelVersion}`,
        MAX_EVENT_COUNT: '5',
      },
      imageId: `${projectId}-mmodelshare-v1`,
      name: 'mmodelshare-v1',
    },
  }).delay(5000)
    .then(() => rpRetry({
      url: `${mCDNURL}/files/${pathName}/${fileName}`,
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${mcdnAuthToken}`,
      },
    }));
};

module.exports = {
  deployModelToApp,
};
