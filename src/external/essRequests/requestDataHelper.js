const Promise = require('bluebird');
const fs = require('fs-extra');

const { anaxContainersStorageDir } = require('../../configuration/config');
const { shortenNodeId } = require('../../util/nodeUtil');

const getRequestData = (nodeId, agreementId) => Promise.resolve()
  .then(() => {
    const authDataPromises = [];

    const shortenedNodeId = shortenNodeId(nodeId);
    const certFilePath = `${anaxContainersStorageDir}/${shortenedNodeId}/ess-auth/SSL/cert/cert.pem`;
    const essSocketFilePath = `${anaxContainersStorageDir}/${shortenedNodeId}/fss-domain-socket/essapi.sock`;
    const authKeyFilePath = `${anaxContainersStorageDir}/${shortenedNodeId}/ess-auth/${agreementId}/auth.json`;

    console.log('===> files', {
      certFilePath,
      essSocketFilePath,
      authKeyFilePath,
    });

    authDataPromises.push(fs.access(essSocketFilePath)
      .then(() => essSocketFilePath)
      .catch((err) => {
        throw new Error(`Failed to find/access to socketPath for nodeId, error: ${err}`);
      }));

    authDataPromises.push(fs.readJSON(authKeyFilePath)
      .catch((err) => {
        throw new Error(`ESS Auth key file cannot be read, error: ${err}`);
      })
      .then(({ id, token }) => Buffer.from(`${id}:${token}`).toString('base64')));

    authDataPromises.push(fs.readFile(certFilePath)
      .then((content) => {
        if (!content) {
          throw new Error('ESS Cert file does not contain anything');
        }

        let fetchedCert;
        try {
          fetchedCert = Buffer.from(content).toString();
          return fetchedCert;
        }
        catch (err) {
          throw new Error(`ESS Cert file content cannot be  converted to string, error: ${err}`);
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
