const edgeNodeSyncJob = require('./edgeNodeSyncJob');
const gatewayNodeSyncJob = require('./gatewayNodeSyncJob');

const startJobs = () => gatewayNodeSyncJob.start()
  .then(() => edgeNodeSyncJob.start());

// const startJobs = () => edgeNodeSyncJob.start();

module.exports = {
  startJobs,
};
