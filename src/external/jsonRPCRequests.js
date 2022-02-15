const { rpRetry } = require('@mimik/request-retry');

const config = require('../configuration/config');

const jsonRPCUrl = `${config.edgeEngine.url}/jsonrpc/v1`;

const getCurrentNode = (correlationId) => rpRetry({
  method: 'POST',
  headers: {
    'x-correlation-id': correlationId,
  },
  data: {
    jsonrpc: '2.0',
    method: 'getMe',
    params: [''],
    id: 1,
  },
  url: jsonRPCUrl,
})
  .then((response) => response.result);

module.exports = {
  getCurrentNode,
};
