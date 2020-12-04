const edgeNodeSyncJob = require('./edgeNodeSyncJob');
const gatewayNodeSyncJob = require('./gatewayNodeSyncJob');

const startJobs = () => gatewayNodeSyncJob.start()
  .then(() => edgeNodeSyncJob.start());

module.exports = {
  startJobs,
};
