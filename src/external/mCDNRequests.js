const rp = require('request-promise');
const fs = require('fs-extra');

const {
  mcdnAuthToken,
  edgeEngine: {
    projectId,
  },
  demo3: {
    gatewayNodeIpAddress,
  },
} = require('../configuration/config');

const mCDNURL = `http://${gatewayNodeIpAddress}:8083/${projectId}/mcdn/v1`;
const MCDN_FILES_ENDPOINT = `${mCDNURL}/files`;

const postFile = (pathName, fileName, localFilePath, correlationId) => {
  const mCDNFilePath = `${MCDN_FILES_ENDPOINT}/${pathName}/${fileName}`;

  return rp({
    uri: mCDNFilePath,
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
