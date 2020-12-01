const fs = require('fs-extra');

const { getRichError } = require('@bananabread/response-helper');

const {
  hzn: {
    nodePoliciesDir,
  },
} = require('../../configuration/config');

const getPolicyFilePath = (nodeId) => `${nodePoliciesDir}/policy_${nodeId}.json`;

const createPolicyFile = (nodeId, properties = [], constraints = [], correlationId) => {
  const filePath = getPolicyFilePath(nodeId);

  return fs.ensureDir(nodePoliciesDir)
    .then(() => fs.writeJSON(filePath, { properties, constraints })
      .then(() => filePath)
      .catch((error) => {
        throw getRichError(
          'System', 'Error occured while writing policy file',
          {
            nodeId,
            filePath,
            properties,
            constraints,
            error,
          },
          null, 'error', correlationId,
        );
      }));
};

const removePolicyFile = (nodeId, correlationId) => {
  const filePath = getPolicyFilePath(nodeId);

  return fs.remove(filePath)
    .catch((error) => {
      throw getRichError(
        'System', 'Error occured while writing policy file',
        {
          nodeId,
          filePath,
          error,
        },
        null, 'error', correlationId,
      );
    });
};

module.exports = {
  createPolicyFile,
  removePolicyFile,
};
