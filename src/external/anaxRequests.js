const rp = require('request-promise');

const logger = require('@bananabread/sumologic-winston-logger');
const { getRichError } = require('@bananabread/response-helper');

const fetchActiveAgreements = (containerPort, correlationId) => rp({
  uri: `http://localhost:${containerPort}/agreement`,
})
  .then((response) => {
    let parsedResponse = {};

    try {
      parsedResponse = JSON.parse(response);
    }
    catch (error) {
      throw getRichError('System', 'Error occured while parsing response from Anax', { containerPort }, error, 'error', correlationId);
    }
    if (!parsedResponse.agreements) return [];
    return parsedResponse.agreements.active;
  })
  .catch((error) => {
    logger.error('Error occured while fetching agreements', { error }, correlationId);
  });

module.exports = {
  fetchActiveAgreements,
};
