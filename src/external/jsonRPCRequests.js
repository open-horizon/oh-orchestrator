const rp = require('request-promise');

const config = require('../configuration/config');

const jsonRPCUrl = `${config.edgeEngine.url}/jsonrpc/v1`;

const getCurrentNode = () => rp({
  url: jsonRPCUrl,
  method: 'POST',
  body: {
    jsonrpc: '2.0',
    method: 'getMe',
    params: [''],
    id: 1,
  },
  json: true,
})
  .then((response) => response.result);

module.exports = {
  getCurrentNode,
};
