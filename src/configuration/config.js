const { setConfig } = require('@mimik/configuration');
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
 * | EDGE_ENGINE_URL | Url for the edgeEngine (gateway) | http://localhost:8083 |
 * | EDGE_ENGINE_PROJECT_ID | mimik developer project id | | should be same for mdeploy
 * | EDGE_ENGINE_MDEPLOY_ENDPOINT | mdeploy endpoint | /mdeploy/v1 |
 * | EDGE_ENGINE_MESS_ENDPOINT | mESS endpoint | /mess/v1 |
 * | EDGEDAEMON_URL | edgeDaemon endpoint | |
 * | MESS_APIKEY | apiKey to use to reach mESS | |
 * | MDEPLOY_APIKEY | apiKey to use to reach mdeploy | |
 * | EDGEDAEMON_APIKEY | apiKey to use to reach edgedeamon | |
 * | HZN_ORG_ID | Hzn organization id to be used for registering anax nodes | myorg |
 * | HZN_CSS_URL | Hzn CSS Url | | example: http://192.168.1.77:9443
 * | HZN_AGBOT_URL | Hzn Agbot Url | | example: http://192.168.1.77:3111
 * | HZN_EXCHANGE_URL | Hzn Exchange Url | | example: http://192.168.1.77:3090/v1/
 * | HZN_EXCHANGE_USER_AUTH | Hzn exchange user auth to be used for registering anax nodes | | example: admin:password
 * | HZN_DEFAULT_NODE_TOKEN | Hzn node token to use to register anax node with exchange | nodeToken | default nodeId is first 6 chars of edge nodeId. So node auth will be nodeId:nodeToken
 * | ESS_TRACKED_OBJECT_TYPES | HZN Object types to fetch from ESS and serve using mESS | | example: ml_model,reco_model
 * | ESS_GATEWAY_DEPLOYMENT_NODE_IP | ESS gateway deployment node IP | |
 * | ESS_GATEWAY_DEPLOYMENT_PROPERTY_TYPE | ESS gateway deployment property type | deployment |
 * | ESS_GATEWAY_DEPLOYMENT_PROPERTY_NAME | ESS gateway deployment property name | location |
 * | ESS_GATEWAY_DEPLOYMENT_PROPERTY_VALUE | ESS gateway deployment property value  | gatewayNode |
 * | ESS_OBJECTS_POLLING_INTERVAL | interval at which oh-orchestrator will poll ESS | 5000 | in ms |
 * | ESS_MAXIMUM_FILE_SIZE | Maximum file size to be allowed to deployed | 1000 | in MBs
 * | DOCKER_SOCKET_PATH | Path to the docker daemon socket | /var/run/docker.sock |
 * | NODES_MAPPING_DIR | Directory to temporarily store node policies, configs, ess content in | ~/.oh/nodes |
 * | EDGE_NODES_SYNC_JOB_INTERVAL | Job interval to sync edge nodes using super (gateway) mdeploy | 60 |
 * | GATEWAY_NODE_SYNC_JOB_INTERVAL | Job interval to sync gateway node using super (gateway) mdeploy | 120 |
 * | ANAX_CONTAINERS_PORT_NUM_START | Port range starting point to use for anax containers | 8200 |
 * | ANAX_CONTAINERS_PORT_NUM_END | Port range ending point to use for anax containers | 8299 |
 * | EDGE_DEPLOYMENT_CONTAINER_ENV | edgeEngine container env representing edge deployment | HZN_DEPLOYMENT_LOCATION=edgeNode |
 * | ANAX_DOCKER_TAG | Anax container version | 2.30.0-794 |
 * | MAXIMUM_FILE_SIZE | Maximum file size that can be shared using content delivery (ESS/mess) | 100 | in MB
 * | ANAX_CONTAINERS_CUSTOM_DNS_IP | Ip address of the DNS server for anax docker containers | 'empty string' | Not required
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
  const edgeEngineMESSEndpoint = process.env.EDGE_ENGINE_MESS_ENDPOINT || '/mess/v1';

  const trackedObjectTypesStr = process.env.ESS_TRACKED_OBJECT_TYPES;
  let trackedObjectTypes;
  if (trackedObjectTypesStr && trackedObjectTypesStr !== '') {
    trackedObjectTypes = trackedObjectTypesStr.split(',');
  }

  // eslint-disable-next-line @mimik/document-env/validate-document-env
  const homeDir = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];

  const configuration = setConfig(pack, {
    dependencies: {
      MDEPLOY: {
        url: `${edgeEngineUrl}/${edgeEngineProjectId}${edgeEngineMdeployEndpoint}`,
        apiKey: process.env.MDEPLOY_APIKEY,
      },
      EDGEDAEMON: {
        url: process.env.EDGEDAEMON_URL,
        apiKey: process.env.EDGEDAEMON_APIKEY,
      },
      MESS: {
        url: `${edgeEngineUrl}/${edgeEngineProjectId}${edgeEngineMESSEndpoint}`,
        apiKey: process.env.MESS_APIKEY,
      },
    },
    custom: {
      hzn: {
        orgId: process.env.HZN_ORG_ID || 'myorg',
        cssUrl: process.env.HZN_CSS_URL,
        agbotUrl: process.env.HZN_AGBOT_URL,
        exchangeUrl: process.env.HZN_EXCHANGE_URL,
        exchangeUserAuth: process.env.HZN_EXCHANGE_USER_AUTH,
        defaultNodeToken: process.env.HZN_DEFAULT_NODE_TOKEN || 'nodeToken',
        ess: {
          trackedObjectTypes,
          gatewayDeploymentPropertyType: process.env.ESS_GATEWAY_DEPLOYMENT_PROPERTY_TYPE || 'deployment',
          gatewayDeploymentPropertyName: process.env.ESS_GATEWAY_DEPLOYMENT_PROPERTY_NAME || 'location',
          gatewayDeploymentPropertyValue: process.env.ESS_GATEWAY_DEPLOYMENT_PROPERTY_VALUE || 'gatewayNode',
          gatewayNodeIpAddress: process.env.ESS_GATEWAY_DEPLOYMENT_NODE_IP || 'localhost',
          maxFileSize: parseInt(process.env.MAXIMUM_FILE_SIZE, 10) * 1024 * 1024 || 100 * 1024 * 1024,
        },
      },
      edgeEngine: {
        url: edgeEngineUrl,
        projectId: edgeEngineProjectId,
        mdeployEndpoint: edgeEngineMdeployEndpoint,
        mESSEndpoint: edgeEngineMESSEndpoint,
      },
      anaxDockerTag: process.env.ANAX_DOCKER_TAG || '2.30.0-794',
      dockerSocketPath: process.env.DOCKER_SOCKET_PATH || '/var/run/docker.sock',
      nodesDir: process.env.NODES_MAPPING_DIR || `${homeDir}/.oh/nodes`,
      essObjectsPollingInterval: parseInt(process.env.ESS_OBJECTS_POLLING_INTERVAL, 10) || 5000,
      edgeNodesSyncJobInterval: parseInt(process.env.EDGE_NODES_SYNC_JOB_INTERVAL, 10) || 60,
      gatewayNodeSyncJobInterval: parseInt(process.env.GATEWAY_NODE_SYNC_JOB_INTERVAL, 10) || 120,
      anaxContainersPortNumStart: parseInt(process.env.ANAX_CONTAINERS_PORT_NUM_START, 10) || 8200,
      anaxContainersPortNumEnd: parseInt(process.env.ANAX_CONTAINERS_PORT_NUM_END, 10) || 8999,
      anaxContainersCustomDNSIP: process.env.ANAX_CONTAINERS_CUSTOM_DNS_IP || '',
      edgeDeploymentContainerEnv: process.env.EDGE_DEPLOYMENT_CONTAINER_ENV || 'HZN_DEPLOYMENT_LOCATION=edgeNode',
    },
  });

  return configuration;
})();
