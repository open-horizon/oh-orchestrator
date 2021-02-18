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
 * | EDGE_ENGINE_URL | Url for the edgeEngine (gateway) | http://localhost:8083 |
 * | EDGE_ENGINE_PROJECT_ID | mimik developer project id | | should be same for mdeploy
 * | EDGE_ENGINE_MDEPLOY_ENDPOINT | mdeploy endpoint | /mdeploy/v1 |
 * | EDGE_ENGINE_MDEPLOY_ENDPOINT | mdeploy endpoint | /mdeploy/v1 |
 * | HZN_ORG_ID | Hzn organization id to be used for registering anax nodes | myorg |
 * | HZN_CSS_URL | Hzn CSS Url | | example: http://192.168.1.77:9443
 * | HZN_EXCHANGE_URL | Hzn Exchange Url | | example: http://192.168.1.77:3090/v1/
 * | HZN_EXCHANGE_USER_AUTH | Hzn exchange user auth to be used for registering anax nodes | | example: admin:password
 * | HZN_DEFAULT_NODE_TOKEN | Hzn node token to use to register anax node with exchange | nodeToken | default nodeId is first 6 chars of edge nodeId. So node auth will be nodeId:nodeToken
 * | HZN_CLI_CONFIG_FILE | File location where hzn config is stored | /etc/default/horizon | example file content: HZN_EXCHANGE_URL=http://192.168.1.77:3090/v1/\nHZN_FSS_CSSURL=http://192.168.1.77:9443\n
 * | HZN_ESS_TRACKED_OBJECT_TYPES | HZN Object types to fetch from ESS and serve using mCDN | | example: ml_model,reco_model
 * | DOCKER_SOCKET_PATH | Path to the docker daemon socket | /var/run/docker.sock |
 * | NODE_POLICIES_DIR | Directory to temporarily store node policies in | /var/tmp/oh/policies |
 * | ANAX_CONTAINERS_STORAGE_DIR | Directory to store anax data for container in | /var/tmp/oh/storage |
 * | EDGE_NODES_SYNC_JOB_INTERVAL | Job interval to sync edge nodes using super (gateway) mdeploy | 60 |
 * | GATEWAY_NODE_SYNC_JOB_INTERVAL | Job interval to sync gateway node using super (gateway) mdeploy | 120 |
 * | ANAX_CONTAINERS_PORT_NUM_START | Port range starting point to use for anax containers | 8200 |
 * | ANAX_CONTAINERS_PORT_NUM_END | Port range ending point to use for anax containers | 8299 |
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

  const trackedObjectTypesStr = process.env.HZN_ESS_TRACKED_OBJECT_TYPES;
  let trackedObjectTypes;
  if (trackedObjectTypesStr && trackedObjectTypesStr !== '') {
    trackedObjectTypes = trackedObjectTypesStr.split(',');
  }

  // const isDemo3On = process.env.IS_DEMO3_ONGOING === 'yes';

  const configuration = setConfig(pack, {
    dependencies: {
      MDEPLOY: {
        url: `${edgeEngineUrl}/${edgeEngineProjectId}${edgeEngineMdeployEndpoint}`,
        audience: process.env.MDEPLOY_AUDIENCE,
      },
      EDGEDAEMON: {
        url: process.env.EDGEDAEMON_URL,
        audience: process.env.EDGEDAEMON_AUDIENCE,
      },
    },
    custom: {
      hzn: {
        orgId: process.env.HZN_ORG_ID || 'myorg',
        cssUrl: process.env.HZN_CSS_URL,
        exchangeUrl: process.env.HZN_EXCHANGE_URL,
        exchangeUserAuth: process.env.HZN_EXCHANGE_USER_AUTH,
        defaultNodeToken: process.env.HZN_DEFAULT_NODE_TOKEN || 'nodeToken',
        cliConfigFile: process.env.HZN_CLI_CONFIG_FILE || '/etc/default/horizon',
        ess: {
          trackedObjectTypes,
          gatewayDeploymentPropertyType: process.env.HZN_ESS_GATEWAY_DEPLOYMENT_PROPERTY_TYPE || 'deployment',
          gatewayDeploymentPropertyName: process.env.HZN_ESS_GATEWAY_DEPLOYMENT_PROPERTY_NAME || 'location',
          gatewayDeploymentPropertyValue: process.env.HZN_ESS_GATEWAY_DEPLOYMENT_PROPERTY_VALUE || 'gatewayNode',
        },
      },
      edgeEngine: {
        url: edgeEngineUrl,
        projectId: edgeEngineProjectId,
        mdeployEndpoint: edgeEngineMdeployEndpoint,
      },
      mcdnAuthToken: process.env.MCDN_AUTH_TOKEN || '1234',
      dockerSocketPath: process.env.DOCKER_SOCKET_PATH || '/var/run/docker.sock',
      nodePoliciesDir: process.env.NODE_POLICIES_DIR || '/var/tmp/oh/policies',
      essObjectsStorageDir: process.env.ESS_OBJECTS_STORAGE_DIR || '/var/tmp/oh/essStorage',
      anaxContainersStorageDir: process.env.ANAX_CONTAINERS_STORAGE_DIR || '/var/tmp/oh/anaxStorage',
      essObjectsPollingInterval: parseInt(process.env.ESS_OBJECTS_POLLING_INTERVAL, 10) || 30000,
      edgeNodesSyncJobInterval: parseInt(process.env.EDGE_NODES_SYNC_JOB_INTERVAL, 10) || 60,
      gatewayNodeSyncJobInterval: parseInt(process.env.GATEWAY_NODE_SYNC_JOB_INTERVAL, 10) || 120,
      anaxContainersPortNumStart: parseInt(process.env.ANAX_CONTAINERS_PORT_NUM_START, 10) || 8200,
      anaxContainersPortNumEnd: parseInt(process.env.ANAX_CONTAINERS_PORT_NUM_END, 10) || 8299,
      demo3: {
        // isOn: isDemo3On,/
        // systemToken: isDemo3On ? process.env.DEMO3_SYSTEM_TOKEN : '',
        // appIpAddress: isDemo3On ? process.env.APP_IP_ADDRESS : '192.168.68.119',
        // gatewayNodeIpAddress: isDemo3On ? process.env.GATEWAY_NODE_IP_ADDRESS : '192.168.68.102',
      },
    },
  });

  return configuration;
})();
