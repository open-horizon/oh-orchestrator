const app = require('connect')();

const init = require('@mimik/init');
const cluster = require('@mimik/cluster');
const { getCorrelationId } = require('@mimik/request-helper');

let config = require('./configuration/config');
const { startJobs } = require('./lib/jobs');
const { startupTasks } = require('./lib/startHelper');
const { cleanupAllNodes } = require('./lib/mdeployCleanup');

const correlationId = getCorrelationId('service-startup-preOps');

init(app, __dirname, config, [], cluster(config), {
  preOps: [
    () => startupTasks(correlationId)
      .then(() => startJobs(correlationId)),
  ],
  exitOps: [
    () => cleanupAllNodes(getCorrelationId('service-stop-cleanup')),
  ],
}).then((result) => {
  ({ config } = result);
});

module.exports = app;
