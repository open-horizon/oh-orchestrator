const uuid = require('uuid');

const { getRichError } = require('@bananabread/response-helper');
const logger = require('@bananabread/sumologic-winston-logger');

const { gatewaySync } = require('../../configuration/config');
const {
  removeAllAnaxNodes,
  initializeGatewayNodes,
} = require('../anaxHelper');
const {
  getClient,
  clientStatusValues,
} = require('../../external/mdeployRequests');

const syncNodes = () => {
  const correlationId = uuid.v4();
  logger.debug('Starting gatewayNodeSyncJob', { correlationId });
  return getClient(correlationId)
    .catch((error) => {
      throw getRichError('System', 'Could not connect to super mdeploy, error occured while fetching client status', { error }, null, 'error', correlationId);
    })
    .then((data) => {
      if (data.status === clientStatusValues.INACTIVE) {
        throw getRichError('System', 'Super mdeploy client is not activated', null, null, 'error', correlationId);
      }
    })
    .then(() => {
      logger.debug('Completed gatewayNodeSyncJob', { correlationId });
    })
    .catch(() => {
      logger.error('Completed gatewayNodeSyncJob with errors, EXITING NODE PROCESS', { correlationId });
      process.exit();
    });
};

const start = () => getClient()
  .catch((error) => {
    throw getRichError('System', 'Could not connect to super mdeploy, error occured while fetching client status', { error }, null, 'error');
  })
  .then((data) => {
    if (data.status === clientStatusValues.INACTIVE) {
      throw getRichError('System', 'Super mdeploy client is not activated', null, null, 'error');
    }
  })
  .then(() => removeAllAnaxNodes())
  .then(() => initializeGatewayNodes())
  .catch((error) => {
    throw getRichError('System', 'Cannot start service initializing gateway failed', error, null, 'error');
  })
  .then(() => {
    setInterval(syncNodes, gatewaySync.jobInterval * 1000);
  });

module.exports = {
  start,
};
