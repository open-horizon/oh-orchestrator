const init = require('@bananabread/init');
const app = require('connect')();

let config = require('./configuration/config');
const { startJobs } = require('./lib/jobs');

init(app, __dirname, config, () => Promise.resolve(), {
  preOps: [
    startJobs,
  ],
}).then((result) => {
  ({ config } = result);
});

module.exports = app;
