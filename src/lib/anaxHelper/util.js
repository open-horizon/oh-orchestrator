const {
  nodesDir,
  nodeConfigsDir,
  nodePoliciesDir,
  essObjectsStorageDir,
} = require('../../configuration/config');

const scriptCommandValues = {
  REGISTER_ANAX: 'hzn register',
  UNREGISTER_ANAX: 'echo "y" | hzn unregister',
  NUKE_DOCKER: 'docker rm -f $(docker ps -a -q)',
};

const getNodeDir = (nodeId) => `${nodesDir}/${nodeId}`;

const getNodeConfigFilePath = (nodeId) => `${nodeConfigsDir}/${nodeId}`;

const getNodePolicyFilePath = (nodeId) => `${nodePoliciesDir}/${nodeId}.json`;

const getESSObjectsStorageDir = (nodeId) => `${essObjectsStorageDir}/${nodeId}`;

module.exports = {
  getNodeDir,
  getNodePolicyFilePath,
  getNodeConfigFilePath,
  getESSObjectsStorageDir,
  scriptCommandValues,
};
