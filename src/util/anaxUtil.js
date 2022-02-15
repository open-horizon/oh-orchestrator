const {
  nodesDir,
} = require('../configuration/config');

const scriptCommandValues = {
  REGISTER_ANAX: 'hzn register',
  UNREGISTER_ANAX: 'echo "y" | hzn unregister',
  NUKE_DOCKER: 'docker rm -f $(docker ps -a -q)',
};

const getNodeDir = (nodeId) => `${nodesDir}/${nodeId}`;

const getESSAuthDir = (nodeId) => `${getNodeDir(nodeId)}/essAuth`;
const getESSSocketDir = (nodeId) => `${getNodeDir(nodeId)}/essSocket`;
const getESSSocketPath = (nodeId) => `${getNodeDir(nodeId)}/essSocket/essapi.sock`;
const getESSStorageDir = (nodeId, agreementId, objectType) => `${getNodeDir(nodeId)}/essStorage/${agreementId}/${objectType}`;

const getNodeConfigFilePath = (nodeId) => `${getNodeDir(nodeId)}/anaxConfig`;
const getNodePolicyFilePath = (nodeId) => `${getNodeDir(nodeId)}/nodePolicy.json`;

const getESSAuthCerificatePath = (nodeId) => `${getESSAuthDir(nodeId)}/SSL/cert/cert.pem`
const getESSAgreementAuthFilePath = (nodeId, agreeementId) => `${getESSAuthDir(nodeId)}/${agreeementId}/auth.json`;

module.exports = {
  getESSAuthDir,
  getESSSocketDir,
  getESSStorageDir,
  getESSSocketPath,
  getNodePolicyFilePath,
  getNodeConfigFilePath,
  getESSAuthCerificatePath,
  getESSAgreementAuthFilePath,
  scriptCommandValues,
};
