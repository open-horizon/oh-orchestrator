const Promise = require('bluebird');
const fs = require('fs-extra');

const { getRichError } = require('@mimik/response-helper');

const { scriptFileValues } = require('../util/scriptUtil');
const { runScriptCommand } = require('./scriptHelper');

let correlationId;

const anaxScript = `src/scripts/${scriptFileValues.ANAX_DEPLOYMENT_SCRIPT}`;

const validateIfSudo = () => Promise.resolve()
  .then(() => {
    if (process.getuid() !== 0) throw getRichError('System', 'Service requires root priviledges', null, null, 'error', correlationId);
  });

const makeScriptExecutable = () => fs.chmod(anaxScript, '774')
  .then(() => fs.chown(anaxScript, 0, 0))
  .catch((err) => {
    throw getRichError('System', 'Error occured while making scripts executable', null, err, 'error', correlationId);
  });

const startupTasks = (newCorrelationId) => {
  correlationId = newCorrelationId;

  return validateIfSudo()
    .then(makeScriptExecutable);
}
module.exports = {
  startupTasks,
}