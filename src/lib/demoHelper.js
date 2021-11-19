const rp = require('request-promise');
const Promise = require('bluebird');

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

const deployModelToApp = (mcdnFileProp) => {
  modelVersion += 1;
  const { mCDNURL, pathName, fileName } = mcdnFileProp;

  return Promise.resolve(rp({
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
        MODEL_URL: `${mCDNURL}/dl/${pathName}/${fileName}`,
        MODEL_VERSION: `model-1.0.${modelVersion}`,
        MAX_EVENT_COUNT: '5',
      },
      imageId: `${projectId}-mmodelshare-v1`,
      name: 'mmodelshare-v1',
    },
    json: true,
  })).delay(5000)
    .then(() => rp({
      uri: `${mCDNURL}/files/${pathName}/${fileName}`,
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
