const { rpRetry } = require('@mimik/request-retry');
const logger = require('@mimik/sumologic-winston-logger');

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

module.exports = {
  fetchActiveAgreements,
};
