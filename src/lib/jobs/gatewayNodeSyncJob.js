const logger = require('@mimik/sumologic-winston-logger');
const { getRichError } = require('@mimik/response-helper');
const { getCorrelationId } = require('@mimik/request-helper');

const { gatewayNodeSyncJobInterval } = require('../../configuration/config');
const {
  removeAllAnaxNodes,
  initializeGatewayNodes,
} = require('../anaxHelper');
const {
  getClient,
  clientStatusValues,
} = require('../../external/mdeployRequests');

let interval;

const syncNodes = () => {
  const correlationId = getCorrelationId('gateway-node-sync');
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
      process.exit(1);
    });
};

const start = (correlationId) => getClient(correlationId)
  .catch((error) => {
    throw getRichError('System', 'Could not connect to super mdeploy, error occured while fetching client status', { error }, null, 'error');
  })
  .then((data) => {
    if (data.status === clientStatusValues.INACTIVE) {
      throw getRichError('System', 'Super mdeploy client is not activated', null, null, 'error');
    }
  })
  .then(removeAllAnaxNodes)
  .then(() => initializeGatewayNodes(correlationId))
  .catch((error) => {
    throw getRichError('System', 'Cannot start service, initializing gateway failed', error, null, 'error');
  })
  .then(() => {
    interval = setInterval(syncNodes, gatewayNodeSyncJobInterval * 1000);
  });

const stop = () => Promise.resolve()
  .then(() => {
    clearInterval(interval);
  });

module.exports = {
  start,
  stop,
};
