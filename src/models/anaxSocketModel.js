const Promise = require('bluebird');

const logger = require('@bananabread/sumologic-winston-logger');
const { getRichError } = require('@bananabread/response-helper');

const {
  anaxSocketLogsMaxLength,
  consoleLogAnaxCommunication,
} = require('../configuration/config');

const anaxSockets = {};

const LOG_TYPE = {
  ERROR: 'error',
  INFO: 'info',
};

const SERVER_TYPE = {
  ANAX_FACING: 'Anax facing server',
  DOCKER_FACING: 'Docker facing server',
  DOCKER_PROXY_FACING: 'Docker proxy facing server',
  MDEPLOY_FACING: 'mdeploy facing communication',
};

const checkIfValidAnaxSocket = (anaxSocket, correlationId) => Promise.resolve()
  .then(() => {
    if (!anaxSocket) {
      throw getRichError('System', 'Invalid anaxSocket', { anaxSocket }, null, 'error', correlationId);
    }
    if (!anaxSocket.logs || !Array.isArray(anaxSocket.logs)) {
      throw getRichError('System', 'Invalid anaxSocket, logs array not present', { anaxSocket }, null, 'error', correlationId);
    }
  });

const saveAnaxSocket = (nodeId, anaxSocket, correlationId) => checkIfValidAnaxSocket(anaxSocket, correlationId)
  .catch((err) => {
    throw getRichError('System', 'Could not save anaxSocket, invalid format', { anaxSocket }, err, 'error', correlationId);
  })
  .then(() => {
    if (anaxSockets[nodeId]) {
      throw getRichError('System', 'Could not save anaxSocket, anaxSocket already exists', { anaxSocket }, null, 'error', correlationId);
    }
    anaxSockets[nodeId] = anaxSocket;
    return anaxSocket;
  });

const findAnaxSocketById = (nodeId) => Promise.resolve(anaxSockets[nodeId]);

const saveLog = (nodeId, level, serverType, message, metadata, correlationId) => findAnaxSocketById(nodeId)
  .then((anaxSocket) => {
    if (anaxSocket) return anaxSocket;
    return saveAnaxSocket(nodeId, { logs: [] }, correlationId);
  })
  .then((anaxSocket) => {
    if (anaxSocket.logs.length > anaxSocketLogsMaxLength - 1) anaxSocket.logs.shift();
    const logMessage = `${serverType}: ${message}`;

    if (consoleLogAnaxCommunication) {
      let loggerMetdata = { correlationId };
      if (metadata) loggerMetdata = { ...loggerMetdata, ...metadata };

      if (level !== LOG_TYPE.ERROR) logger.debug(logMessage, loggerMetdata);
      else logger.error(logMessage, loggerMetdata);
    }

    const logObj = {
      level,
      message: logMessage,
      timestamp: (new Date()).toUTCString(),
      correlationId,
    };
    if (metadata) logObj.metadata = metadata;
    anaxSocket.logs.push(logObj);
  });

const getAnaxSocketById = (id, correlationId) => findAnaxSocketById(id)
  .then((node) => {
    if (node) return node;
    throw getRichError('System', 'Could not get node in anaxSocketModel', { id }, null, 'error', correlationId);
  });

const deleteAnaxSocketById = (id) => Promise.resolve()
  .then(() => {
    delete anaxSockets[id];
  });

module.exports = {
  LOG_TYPE,
  SERVER_TYPE,
  saveLog,
  saveAnaxSocket,
  getAnaxSocketById,
  findAnaxSocketById,
  deleteAnaxSocketById,
};
