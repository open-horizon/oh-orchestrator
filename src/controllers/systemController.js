const systemInfo = require('@bananabread/systeminfo');

const config = require('../configuration/config');

const getHealthCheck = (req, res) => systemInfo.getHealthCheckInfo(req, res);

const getSystemInfo = (req, res) => systemInfo.getSystemInfo(req, res, config);

module.exports = {
  getHealthCheck,
  getSystemInfo,
};
