const app = require('connect')();

const init = require('@mimik/init');
const cluster = require('@mimik/cluster');
const { getCorrelationId } = require('@mimik/request-helper');

let config = require('./configuration/config');
const { startJobs } = require('./lib/jobs');
const { startupTasks } = require('./lib/startHelper');
const { cleanupAllNodes } = require('./lib/mdeployCleanup');

let correlationId = getCorrelationId('service-startup-preOps');

init(app, __dirname, config, [], cluster(config), {
  preOps: [
    () => startupTasks(correlationId)
      .then(() => startJobs(correlationId)),
  ],
}).then((result) => {
  ({ config } = result);
});

let SHUTDOWN = false;
function cleanup() {
  if (!SHUTDOWN) {
    SHUTDOWN = true;

    cleanupAllNodes(getCorrelationId('service-stop-cleanup'))
      .finally(() => {
        process.exit(0);
      });
  }
}
process.on('SIGINT', cleanup);


module.exports = app;
