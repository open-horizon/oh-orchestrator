const { rpRetry } = require('@bananabread/request-retry');
const logger = require('@bananabread/sumologic-winston-logger');

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
