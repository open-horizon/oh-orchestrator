const edgeNodeSyncJob = require('./edgeNodeSyncJob');
const gatewayNodeSyncJob = require('./gatewayNodeSyncJob');

const startJobs = (correlationId) => gatewayNodeSyncJob.start(correlationId)
  .then(() => edgeNodeSyncJob.start(correlationId));

module.exports = {
  startJobs,
};
