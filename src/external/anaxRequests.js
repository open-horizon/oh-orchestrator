const { rpRetry } = require('@mimik/request-retry');
const logger = require('@mimik/sumologic-winston-logger');

const CONFIGURED_FLAG = 'configured';

const fetchActiveAgreements = (containerPort, correlationId) => rpRetry({
  method: 'GET',
  headers: {
    'x-correlation-id': correlationId,
  },
  url: `http://localhost:${containerPort}/agreement`,
})
  .then((response) => {
    if (!response.agreements) return [];
    return response.agreements.active;
  })
  .catch((error) => {
    logger.error('Error occured while fetching agreements', { error }, correlationId);
  });

const checkIfNodeConfigured = (containerPort, correlationId) => rpRetry({
  method: 'GET',
  headers: {
    'x-correlation-id': correlationId,
  },
  url: `http://localhost:${containerPort}/node`,
})
  .then((response) => response.configstate.state === CONFIGURED_FLAG)
  .catch((error) => {
    logger.error('Error occured while fetching configuration state', { error }, correlationId);
  });

module.exports = {
  checkIfNodeConfigured,
  fetchActiveAgreements,
};
