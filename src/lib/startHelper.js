const Promise = require('bluebird');
const fs = require('fs-extra');

const { getRichError } = require('@mimik/response-helper');

const { scriptFileValues } = require('../util/scriptUtil');

let correlationId;

const anaxScript = `src/scripts/${scriptFileValues.ANAX_DEPLOYMENT_SCRIPT}`;

const makeScriptExecutable = () => fs.chmod(anaxScript, '774')
  .catch((err) => {
    throw getRichError('System', 'Error occured while making scripts executable', null, err, 'error', correlationId);
  });

const startupTasks = (newCorrelationId) => {
  correlationId = newCorrelationId;

  return makeScriptExecutable();
}
module.exports = {
  startupTasks,
}