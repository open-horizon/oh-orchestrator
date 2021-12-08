const { rpRetry } = require('@bananabread/request-retry');
const fs = require('fs-extra');

const {
  mcdnAuthToken,
  hzn: {
    ess: {
      gatewayNodeIpAddress,
    },
  },
  edgeEngine: {
    projectId,
  },
} = require('../configuration/config');

const mCDNURL = `http://${gatewayNodeIpAddress}:8083/${projectId}/mcdn/v1`;
const MCDN_FILES_ENDPOINT = `${mCDNURL}/files`;

const postFile = (nodeId, pathName, fileName, localFilePath) => {
  const mCDNFilePath = `${MCDN_FILES_ENDPOINT}/${pathName}/${fileName}`;

  return rpRetry({
    url: mCDNFilePath,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${mcdnAuthToken}`,
      'Content-Type': 'multipart/form-data',
    },
    formData: {
      file: {
        value: fs.createReadStream(localFilePath),
        options: {
          filename: fileName,
          contentType: 'application/zip',
        },
      },
      metadata: JSON.stringify({
        mimeType: 'application/zip',
      }),
    },
  })
    .then(() => ({ mCDNURL, pathName, fileName }));
};

module.exports = {
  postFile,
};
