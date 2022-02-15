const Promise = require('bluebird');
const childProcess = require('child_process');

const logger = require('@mimik/sumologic-winston-logger');
const { getRichError } = require('@mimik/response-helper');

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

module.exports = {
  runScriptFile,
  runScriptCommand,
};
