const { setConfig } = require('@bananabread/configuration');
const pack = require('../../package.json');

/**
 *
 * ohorchestrator Configuration.
 *
 * @function config
 * @return {object} configuration - Server configuration.
 * @description The following environment variables are needed to configure ohorchestrator:
 *
 * | Env variable name | Description | Default | Comments |
 * | ----------------- | ----------- | ------- | -------- |
 * | NODE_SYNC_JOB_INTERVAL | Interval to check for updates in edge nodes | 5 | in seconds
 * | EDGE_ENGINE_URL | edgeEngine url | http://localhost:8083 |
 *
 * These values are on top of what is needed in the [configuration](https://bitbucket.org/mimiktech/configuration) library.
 *
 * The api is in [swaggerhub](https://app.swaggerhub.com/apis/mimik/ohorchestrator)
 *
 */
module.exports = (() => {
  const edgeEngineUrl = process.env.EDGE_ENGINE_URL || 'http://localhost:8083';
  const edgeEngineProjectId = process.env.EDGE_ENGINE_PROJECT_ID;
  const edgeEngineMdeployEndpoint = process.env.EDGE_ENGINE_MDEPLOY_ENDPOINT || '/mdeploy/v1';

  const configuration = setConfig(pack, {
    dependencies: {
      MDEPLOY: {
        url: `${edgeEngineUrl}/${edgeEngineProjectId}${edgeEngineMdeployEndpoint}`,
        audience: process.env.MDEPLOY_AUDIENCE,
      },
    },
    custom: {
      nodeSync: {
        jobInterval: parseInt(process.env.NODE_SYNC_JOB_INTERVAL, 10) || 60, // in seconds
      },
      gatewaySync: {
        jobInterval: parseInt(process.env.NODE_SYNC_JOB_INTERVAL, 10) || 120,
      },
      hzn: {
        exchangeUrl: process.env.HZN_EXCHANGE_URL,
        cssUrl: process.env.HZN_CSS_URL,
        exchangeUserAuth: process.env.HZN_EXCHANGE_USER_AUTH,
        orgId: process.env.HZN_ORG_ID || 'myorg',
        defaultNodeToken: process.env.HZN_DEFAULT_NODE_TOKEN || 'nodeToken',
        nodePoliciesDir: process.env.HZN_POLICIES_DIR || '/var/tmp/oh/policies',
        nodeSocketsDir: process.env.HZN_SOCKETS_DIR || '/var/tmp/oh/sockets',
        anaxStorageBasePath: process.env.HZN_ANAX_STORAGE_BASE_PATH || '/var/tmp/oh/storage',
        cliConfigFile: process.env.HZN_CLI_CONFIG_FILE || '/etc/default/horizon',
        anaxContainersPortNumStart: parseInt(process.env.HZN_ANAX_CONTAINERS_PORT_NUM_START, 10) || 8200,
        anaxContainersPortNumEnd: parseInt(process.env.HZN_ANAX_CONTAINERS_PORT_NUM_END, 10) || 8299,
        essObjectTypes: process.env.HZN_ESS_OBJECT_TYPES,
        gatewayDeploymentContainerEnv: process.env.HZN_GATEWAY_DEPLOYMENT_CONTAINER_ENV || 'HZN_DEPLOYMENT_LOCATION=gatewayNode',
        anaxSocketLogsMaxLength: parseInt(process.env.HZN_ANAX_SOCKET_LOGS_MAX_LENGTH, 10) || 50,
        consoleLogAnaxCommunication: process.env.HZN_CONSOLE_LOG_ANAX_COMMUNICATION === 'yes',
      },
      edgeEngine: {
        url: edgeEngineUrl,
        projectId: edgeEngineProjectId,
        mdeployEndpoint: edgeEngineMdeployEndpoint,
      },
      dockerSocketPath: process.env.DOCKER_SOCKET_PATH || '/var/run/docker.sock',
    },
  });

  return configuration;
})();
