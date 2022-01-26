const app = require('connect')();

const init = require('@mimik/init');
const cluster = require('@mimik/cluster');
const { getCorrelationId } = require('@mimik/request-helper');

let config = require('./configuration/config');
const { startupTasks } = require('./lib/startHelper');
const { startJobs } = require('./lib/jobs');

let correlationId = getCorrelationId('service-startup-preOps');

init(app, __dirname, config, [], cluster(config), {
  preOps: [
    () => startupTasks(correlationId)
      .then(() => startJobs(correlationId)),
  ],
}).then((result) => {
  ({ config } = result);
});

module.exports = app;
