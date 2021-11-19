const Promise = require('bluebird');
const fs = require('fs-extra');

<<<<<<< HEAD
const logger = require('@bananabread/sumologic-winston-logger');
const { getRichError } = require('@bananabread/response-helper');

=======
>>>>>>> 9f20540672076bbb5e27feafad0401b9a38fb699
const { anaxContainersStorageDir } = require('../../configuration/config');
const { shortenNodeId } = require('../../util/nodeUtil');

const getRequestData = (nodeId, agreementId) => Promise.resolve()
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
<<<<<<< HEAD
        throw getRichError('System', 'Failed to find/access to socketPath for nodeId', { nodeId, essSocketFilePath }, err, 'error', correlationId);
=======
        throw new Error(`Failed to find/access to socketPath for nodeId, error: ${err}`);
>>>>>>> 9f20540672076bbb5e27feafad0401b9a38fb699
      }));

    authDataPromises.push(fs.readJSON(authKeyFilePath)
      .catch((err) => {
<<<<<<< HEAD
        throw getRichError('System', 'ESS Auth key file cannot be read', { nodeId, authKeyFilePath, correlationId }, err, 'error', correlationId);
=======
        throw new Error(`ESS Auth key file cannot be read, error: ${err}`);
>>>>>>> 9f20540672076bbb5e27feafad0401b9a38fb699
      })
      .then(({ id, token }) => Buffer.from(`${id}:${token}`).toString('base64')));

    authDataPromises.push(fs.readFile(certFilePath)
      .then((content) => {
        if (!content) {
<<<<<<< HEAD
          throw getRichError('System', 'ESS Cert file does not contain anything', { nodeId, certFilePath, correlationId }, null, 'error', correlationId);
=======
          throw new Error('ESS Cert file does not contain anything');
>>>>>>> 9f20540672076bbb5e27feafad0401b9a38fb699
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
