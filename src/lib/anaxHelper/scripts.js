const Promise = require('bluebird');
const fs = require('fs-extra');

const logger = require('@mimik/sumologic-winston-logger');
const { getRichError } = require('@mimik/response-helper');

const { scriptFileValues } = require('../../util/scriptUtil');
const { anaxContainersCustomDNSIP } = require('../../configuration/config');
const { getArch, scriptCommandValues } = require('../../util/anaxUtil');
const { checkIfNodeConfigured } = require('../../external/anaxRequests');
const { runScriptFile, runScriptCommand } = require('../scriptHelper');

const {
  hzn: {
    orgId,
    cssUrl,
    agbotUrl,
    exchangeUrl,
    exchangeUserAuth,
    defaultNodeToken,
  },
  anaxDockerTag,
} = require('../../configuration/config');

const {
  getESSAuthDir,
  getESSSocketDir,
  getNodeConfigFilePath,
} = require('../../util/anaxUtil');

const timeout = () => new Promise((resolve) => { setTimeout(resolve, 5000); });

const updateHznCliConfig = (nodeId, correlationId) => {
  const configFilePath = getNodeConfigFilePath(nodeId);
  // eslint-disable-next-line max-len
  const configFileData = `HZN_EXCHANGE_URL=${exchangeUrl}\nHZN_FSS_CSSURL=${cssUrl}\nHZN_NODE_ID=${nodeId}\nHZN_ORG_ID=${orgId}\nHZN_EXCHANGE_USER_AUTH=${exchangeUserAuth}\nHZN_AGBOT_URL=${agbotUrl}\n`;

  return fs.ensureFile(configFilePath)
    .then(() => fs.writeFile(configFilePath, configFileData))
    .catch((error) => {
      throw getRichError('System', 'Error occured while updating hzn cli config file', { error }, null, 'error', correlationId);
    });
};

const undeployAnaxNode = (nodeId, nodePort, correlationId) => {
  const scriptArgs = [
    scriptFileValues.ANAX_DEPLOYMENT_SCRIPT,
    'stop',
    {
      HZN_NODE_ID: nodeId,
    },
    correlationId,
  ];

  return Promise.resolve() // To use .delay function of bluebird
    .then(() => updateHznCliConfig(nodeId, correlationId)
      .then(() => runScriptFile(...scriptArgs))
      .catch((error) => {
        throw getRichError('System', 'Error occured while undeploying anax container', { error }, null, 'error', correlationId);
      })
      .then(() => {
        logger.debug('Undeployed Anax Node', {
          nodeId, nodePort, correlationId,
        });
      }));
};

const deployAnaxNode = (nodeId, nodePort, dockerSocketFilePath, correlationId) => {
  const scriptArgs = [
    scriptFileValues.ANAX_DEPLOYMENT_SCRIPT,
    'start',
    {
      HZN_NODE_ID: nodeId,
      DOCKER_SOCKET: dockerSocketFilePath,
      ESS_AUTH_DIR: getESSAuthDir(nodeId),
      ESS_SOCKET_DIR: getESSSocketDir(nodeId),
      CONFIG_PATH: getNodeConfigFilePath(nodeId),
      HORIZON_AGENT_PORT: nodePort,
      ANAX_TAG: anaxDockerTag,
      ARCH: getArch(),
      CUSTOM_DNS_IP: anaxContainersCustomDNSIP === '' ? undefined : anaxContainersCustomDNSIP,
    },
    correlationId,
  ];

  return undeployAnaxNode(nodeId, nodePort, correlationId)
    .then(() => updateHznCliConfig(nodeId, correlationId))
    .then(() => runScriptFile(...scriptArgs))
    .catch((error) => {
      throw getRichError('System', 'Error occured while deploying anax container', { nodeId, nodePort, error }, null, 'error', correlationId);
    })
    .then(() => {
      logger.debug('Deployed Anax Node', {
        nodeId, nodePort, correlationId,
      });
    });
};

const registerAnaxNode = (nodeId, nodePort, policyFilePath, correlationId) => {
  const cmdArgs = policyFilePath ? ` --policy ${policyFilePath}` : undefined;

  return runScriptCommand(
    scriptCommandValues.REGISTER_ANAX,
    cmdArgs,
    {
      HZN_ORG_ID: orgId,
      HORIZON_URL: `http://localhost:${nodePort}`,
      HZN_EXCHANGE_URL: exchangeUrl,
      HZN_EXCHANGE_USER_AUTH: exchangeUserAuth,
      HZN_EXCHANGE_NODE_AUTH: `${nodeId}:${defaultNodeToken}`,
    },
    correlationId,
  )
    .then(timeout)
    .then(() => checkIfNodeConfigured(nodePort, correlationId))
    .then((isNodeConfigured) => {
      if (!isNodeConfigured) throw getRichError('System', 'Node did not get registered', { nodeId, nodePort, policyFilePath }, null, 'error', correlationId);

      logger.debug('Registered Anax Node', {
        nodeId, nodePort, correlationId,
      });
    });
};

const unregisterAnaxNode = (nodeId, nodePort, correlationId) => runScriptCommand(
  scriptCommandValues.UNREGISTER_ANAX,
  undefined,
  {
    HZN_ORG_ID: orgId,
    HORIZON_URL: `http://localhost:${nodePort}`,
    HZN_EXCHANGE_URL: exchangeUrl,
    HZN_EXCHANGE_USER_AUTH: exchangeUserAuth,
    HZN_EXCHANGE_NODE_AUTH: `${nodeId}:${defaultNodeToken}`,
  },
  correlationId,
)
  .then(timeout)
  .then(() => checkIfNodeConfigured(nodePort, correlationId))
  .then((isNodeConfigured) => {
    if (isNodeConfigured) throw getRichError('System', 'Node did not get unregistered', { nodeId, nodePort }, null, 'error', correlationId);

    logger.debug('Unregistered Anax Node', {
      nodeId, nodePort, correlationId,
    });
  });

const purgeDocker = () => runScriptCommand(scriptCommandValues.NUKE_DOCKER)
  .catch(() => { }); // To catch if no containers found

module.exports = {
  purgeDocker,
  deployAnaxNode,
  undeployAnaxNode,
  registerAnaxNode,
  unregisterAnaxNode,
};
