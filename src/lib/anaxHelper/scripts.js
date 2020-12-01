/* eslint-disable arrow-body-style */
/* eslint-disable no-unused-vars */
const Promise = require('bluebird');
const childProcess = require('child_process');
const fs = require('fs-extra');

const logger = require('@bananabread/sumologic-winston-logger');
const { getRichError } = require('@bananabread/response-helper');

const {
  hzn: {
    exchangeUrl,
    cssUrl,
    cliConfigFile,
    exchangeUserAuth,
    orgId,
    defaultNodeToken,
    anaxStorageBasePath,
  },
} = require('../../configuration/config');
const {
  scriptFileValues,
  scriptCommandValues,
} = require('./util');

const runScriptFile = (scriptFileName, args = '', env = {}, correlationId) => {
  let scriptEnvs = '';
  Object.keys(env).forEach((envName) => {
    scriptEnvs += `export ${envName}=${env[envName]} && `;
  });

  const terminalStatement = `${scriptEnvs} src/scripts/${scriptFileName} ${args}`;
  logger.debug(`Running script file: ${scriptFileName}`, {
    scriptFileName, args, env, terminalStatement, correlationId,
  });

  return new Promise((resolve, reject) => {
    try {
      let output = '';
      const outputAggregator = (data) => {
        output = data;
      };

      const execInstance = childProcess.exec(terminalStatement, (error, stdOut) => {
        outputAggregator(stdOut);
        logger.debug(`stdOut received from script file: ${scriptFileName}`, {
          stdOut, terminalStatement, correlationId,
        });
      });

      execInstance.on('exit', () => {
        logger.debug(`Ended running script file: ${scriptFileName}`, {
          output, terminalStatement, correlationId,
        });
        resolve(output);
      });
    }
    catch (error) {
      reject(error);
    }
  });
};

const runScriptCommand = (command, args = '', env = {}, correlationId) => {
  let scriptEnvs = '';
  Object.keys(env).forEach((envName) => {
    scriptEnvs += `export ${envName}=${env[envName]} && `;
  });

  const terminalStatement = `${scriptEnvs} ${command} ${args}`;
  logger.debug(`Running script command: '${command}'`, {
    command, env, terminalStatement, correlationId,
  });

  return new Promise((resolve, reject) => {
    try {
      let output = '';
      const outputAggregator = (data) => {
        output = data;
      };

      const execInstance = childProcess.exec(terminalStatement, (error, stdOut) => {
        outputAggregator(stdOut);
        logger.debug(`stdOut received from script command: '${command}'`, {
          stdOut, terminalStatement, correlationId,
        });
      });

      execInstance.on('exit', () => {
        logger.debug(`Ended running script command: '${command}'`, {
          output, terminalStatement, correlationId,
        });
        resolve(output);
      });
    }
    catch (error) {
      reject(error);
    }
  });
};

const updateHznCliConfig = (nodeId, correlationId) => {
  const configFileData = `HZN_EXCHANGE_URL=${exchangeUrl}\nHZN_FSS_CSSURL=${cssUrl}\nHZN_DEVICE_ID=${nodeId}\n`;
  return fs.ensureFile(cliConfigFile)
    .then(() => fs.writeFile(cliConfigFile, configFileData))
    .catch((error) => {
      throw getRichError('System', 'Error occured while updating hzn cli config file', { error }, null, 'error', correlationId);
    });
};

const undeployAnaxNode = (nodeId, nodePort, correlationId) => {
  const scriptArgs = [
    scriptFileValues.ANAX_DEPLOYMENT_SCRIPT,
    'stop',
    {
      HZN_EXCHANGE_URL: exchangeUrl,
      HZN_FSS_CSSURL: cssUrl,
      ANAX_NODE_ID: nodeId,
      ANAX_NODE_PORT: nodePort,
      ANAX_STORAGE_BASE_PATH: anaxStorageBasePath,
      HORIZON_URL: `http://localhost:${nodePort}`,
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
      HZN_EXCHANGE_URL: exchangeUrl,
      HZN_FSS_CSSURL: cssUrl,
      ANAX_NODE_ID: nodeId,
      ANAX_NODE_PORT: nodePort,
      ANAX_STORAGE_BASE_PATH: anaxStorageBasePath,
      HORIZON_URL: `http://localhost:${nodePort}`, // test only
      DOCKER_SOCKET: dockerSocketFilePath,
    },
    correlationId,
  ];

  return undeployAnaxNode(nodeId, nodePort, correlationId)
    .catch(() => {
      console.log('===> catch 1');
    })
    .then(() => updateHznCliConfig(nodeId, correlationId))
    .then(() => {
      console.log('===> here 1');
      return runScriptFile(...scriptArgs);
    })
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
  const successStatement = 'Horizon agent started successfully';
  const cmdArgs = policyFilePath ? ` --policy ${policyFilePath}` : undefined;

  // runScriptCommand(
  //   'hzn env',
  //   undefined,
  //   {
  //     HORIZON_URL: `http://localhost:${nodePort}`,
  //     HZN_EXCHANGE_URL: exchangeUrl,
  //     HZN_EXCHANGE_USER_AUTH: exchangeUserAuth,
  //     HZN_ORG_ID: orgId,
  //     HZN_EXCHANGE_NODE_AUTH: `${nodeId}:${defaultNodeToken}`,
  //   },
  // )

  return runScriptCommand(
    scriptCommandValues.REGISTER_ANAX,
    cmdArgs,
    {
      HORIZON_URL: `http://localhost:${nodePort}`,
      HZN_EXCHANGE_URL: exchangeUrl,
      HZN_EXCHANGE_USER_AUTH: exchangeUserAuth,
      HZN_ORG_ID: orgId,
      HZN_EXCHANGE_NODE_AUTH: `${nodeId}:${defaultNodeToken}`,
    },
    correlationId,
  )
    .then((output) => {
      // if (output.indexOf(successStatement) < 0) {
      //   throw getRichError('System', 'Error received while registering anax node', { nodeId, nodePort, output }, null, 'error', correlationId);
      // }
      logger.debug('Registered Anax Node', {
        nodeId, nodePort, correlationId,
      });
    });
};

const unregisterAnaxNode = (nodeId, nodePort, correlationId) => {
  const successStatement = 'Horizon node unregistered';

  return runScriptCommand(
    scriptCommandValues.UNREGISTER_ANAX,
    undefined,
    {
      HORIZON_URL: `http://localhost:${nodePort}`,
      HZN_EXCHANGE_URL: exchangeUrl,
      HZN_EXCHANGE_USER_AUTH: exchangeUserAuth,
      HZN_ORG_ID: orgId,
      HZN_EXCHANGE_NODE_AUTH: `${nodeId}:${defaultNodeToken}`,
    },
    correlationId,
  )
    .then((output) => {
      // if (output.indexOf(successStatement) < 0) {
      //   throw getRichError('System', 'Error received while unregistering anax node', { nodeId, nodePort, output }, null, 'error', correlationId);
      // }
      logger.debug('Unregistered Anax Node', {
        nodeId, nodePort, correlationId,
      });
    });
};

const purgeDocker = () => runScriptCommand(scriptCommandValues.NUKE_DOCKER);

module.exports = {
  purgeDocker,
  deployAnaxNode,
  undeployAnaxNode,
  registerAnaxNode,
  unregisterAnaxNode,
};
