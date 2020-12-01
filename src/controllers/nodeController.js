const { sendResult, sendError } = require('@bananabread/response-helper');
const { convertParams } = require('@bananabread/swagger-helper');

const nodeProcessor = require('../processors/nodeProcessor');

const getNodes = (req, res) => {
  const options = convertParams(req);

  nodeProcessor.getNodes(options.mdeployStatus, options.correlationId)
    .then((results) => sendResult(results, 200, res, options))
    .catch((err) => sendError(err, res, null, options));
};

const getNodeDetails = (req, res) => {
  const options = convertParams(req);

  nodeProcessor.getNodeDetails(options.id, options.correlationId)
    .then((result) => sendResult(result, 200, res, options))
    .catch((err) => sendError(err, res, null, options));
};

module.exports = {
  getNodes,
  getNodeDetails,
};
