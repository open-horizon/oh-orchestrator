const Promise = require('bluebird');
const fs = require('fs-extra');

const logger = require('@mimik/sumologic-winston-logger');
const { getRichError } = require('@mimik/response-helper');

const { anaxContainersStorageDir } = require('../../configuration/config');
const { shortenNodeId } = require('../../util/nodeUtil');

const getRequestData = (nodeId, agreementId, correlationId) => Promise.resolve()
  .then(() => {
    const authDataPromises = [];

    const shortenedNodeId = shortenNodeId(nodeId);
    const certFilePath = `${anaxContainersStorageDir}/${shortenedNodeId}/ess-auth/SSL/cert/cert.pem`;
    const essSocketFilePath = `${anaxContainersStorageDir}/${shortenedNodeId}/fss-domain-socket/essapi.sock`;
    const authKeyFilePath = `${anaxContainersStorageDir}/${shortenedNodeId}/ess-auth/${agreementId}/auth.json`;

    logger.debug(
      'Configured request files',
      {
        certFilePath,
        essSocketFilePath,
        authKeyFilePath,
      },
      correlationId,
    );

    authDataPromises.push(fs.access(essSocketFilePath)
      .then(() => essSocketFilePath)
      .catch((err) => {
        throw getRichError('System', 'Failed to find/access to socketPath for nodeId', { nodeId, essSocketFilePath }, err, 'error', correlationId);
      }));

    authDataPromises.push(fs.readJSON(authKeyFilePath)
      .catch((err) => {
        throw getRichError('System', 'ESS Auth key file cannot be read', { nodeId, authKeyFilePath, correlationId }, err, 'error', correlationId);
      })
      .then(({ id, token }) => Buffer.from(`${id}:${token}`).toString('base64')));

    authDataPromises.push(fs.readFile(certFilePath)
      .then((content) => {
        if (!content) {
          throw getRichError('System', 'ESS Cert file does not contain anything', { nodeId, certFilePath, correlationId }, null, 'error', correlationId);
        }

        let fetchedCert;
        try {
          fetchedCert = Buffer.from(content).toString();
          return fetchedCert;
        }
        catch (err) {
          throw getRichError('System', 'ESS Cert file content cannot be  converted to string', { nodeId, certFilePath, correlationId }, err, 'error', correlationId);
        }
      }));

    return Promise.all(authDataPromises)
      .then(([socketPath, authToken, cert]) => {
        const requestData = {
          cert,
          headers: {
            Authorization: `Basic ${authToken}`,
          },
          socketPath,
        };

        return requestData;
      });
  });

module.exports = {
  getRequestData,
};
