const fs = require('fs-extra');

const { getRichError } = require('@mimik/response-helper');

const { getNodePolicyFilePath } = require('./util');

const createPolicyFile = (nodeId, properties = [], constraints = [], correlationId) => {
  const filePath = getNodePolicyFilePath(nodeId);

  return fs.ensureFile(filePath)
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
  const filePath = getNodePolicyFilePath(nodeId);

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
