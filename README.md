<a name="config"></a>

## config() ⇒ <code>object</code>
The following environment variables are needed to configure ohorchestrator:

| Env variable name | Description | Default | Comments |
| ----------------- | ----------- | ------- | -------- |
| EDGE_ENGINE_URL | Url for the edgeEngine (gateway) | http://localhost:8083 |
| EDGE_ENGINE_PROJECT_ID | mimik developer project id | | should be same for mdeploy
| EDGE_ENGINE_MDEPLOY_ENDPOINT | mdeploy endpoint | /mdeploy/v1 |
| EDGE_ENGINE_MESS_ENDPOINT | mESS endpoint | /mess/v1 |
| EDGEDAEMON_URL | edgeDaemon endpoint | |
| MESS_APIKEY | apiKey to use to reach mESS | |
| MDEPLOY_APIKEY | apiKey to use to reach mdeploy | |
| EDGEDAEMON_APIKEY | apiKey to use to reach edgedeamon | |
| HZN_ORG_ID | Hzn organization id to be used for registering anax nodes | myorg |
| HZN_CSS_URL | Hzn CSS Url | | example: http://192.168.1.77:9443
| HZN_EXCHANGE_URL | Hzn Exchange Url | | example: http://192.168.1.77:3090/v1/
| HZN_EXCHANGE_USER_AUTH | Hzn exchange user auth to be used for registering anax nodes | | example: admin:password
| HZN_DEFAULT_NODE_TOKEN | Hzn node token to use to register anax node with exchange | nodeToken | default nodeId is first 6 chars of edge nodeId. So node auth will be nodeId:nodeToken
| HZN_CLI_CONFIG_FILE | File location where hzn config is stored | /etc/default/horizon | example file content: HZN_EXCHANGE_URL=http://192.168.1.77:3090/v1/\nHZN_FSS_CSSURL=http://192.168.1.77:9443\n
| ESS_OBJECTS_STORAGE_DIR | ESS gateway deployment objects storage directory | |
| ESS_TRACKED_OBJECT_TYPES | HZN Object types to fetch from ESS and serve using mCDN | | example: ml_model,reco_model
| ESS_GATEWAY_DEPLOYMENT_NODE_IP | ESS gateway deployment node IP | |
| ESS_GATEWAY_DEPLOYMENT_PROPERTY_TYPE | ESS gateway deployment property type | deployment |
| ESS_GATEWAY_DEPLOYMENT_PROPERTY_NAME | ESS gateway deployment property name | location |
| ESS_GATEWAY_DEPLOYMENT_PROPERTY_VALUE | ESS gateway deployment property value  | gatewayNode |
| ESS_OBJECTS_POLLING_INTERVAL | interval at which oh-orchestrator will poll mcdn | 30000 | in ms |
| DOCKER_SOCKET_PATH | Path to the docker daemon socket | /var/run/docker.sock |
| NODE_POLICIES_DIR | Directory to temporarily store node policies in | /var/tmp/oh/policies |
| ANAX_CONTAINERS_STORAGE_DIR | Directory to store anax data for container in | /var/tmp/oh/storage |
| EDGE_NODES_SYNC_JOB_INTERVAL | Job interval to sync edge nodes using super (gateway) mdeploy | 60 |
| GATEWAY_NODE_SYNC_JOB_INTERVAL | Job interval to sync gateway node using super (gateway) mdeploy | 120 |
| ANAX_CONTAINERS_PORT_NUM_START | Port range starting point to use for anax containers | 8200 |
| ANAX_CONTAINERS_PORT_NUM_END | Port range ending point to use for anax containers | 8299 |
| MCDN_AUTH_TOKEN | auth token to comminicate with mCDN service | 1234 |

These values are on top of what is needed in the [configuration](https://bitbucket.org/mimiktech/configuration) library.

The api is in [swaggerhub](https://app.swaggerhub.com/apis/mimik/ohorchestrator)

**Kind**: global function  
**Returns**: <code>object</code> - configuration - Server configuration.  
