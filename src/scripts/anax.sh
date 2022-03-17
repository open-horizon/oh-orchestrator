#!/bin/bash

# This script starts or stops the horizon edge node agent in a container. Supports linux.
# https://github.com/open-horizon/anax/blob/master/docs/agent_container_manual_deploy.md#starting-the-agent#7831541

### Required envs
#
# export HZN_NODE_ID=bc8ebd2abf839833
# export DOCKER_SOCKET=/var/run/docker.sock
# export HORIZON_AGENT_PORT=8200
# export HOST_SHARE_PATH="${HOME}/.oh/${HZN_NODE_ID}"
# export ESS_AUTH_DIR="${HOST_SHARE_PATH}/essAuth"
# export ESS_SOCKET_DIR="${HOST_SHARE_PATH}/essSocket"
# export CONTAINER_LABEL=containerType=anaxNode
#
### Required envs in config file
#
# HZN_EXCHANGE_URL=http://192.168.1.115:3090/v1/
# HZN_FSS_CSSURL=http://192.168.1.115:9443
# HZN_NODE_ID=bc8ebd2abf839833
# HZN_ORG_ID=myorg
# HZN_EXCHANGE_USER_AUTH=admin:password
# HZN_AGBOT_URL=http://192.168.1.115:3111\
#
### Required for hzn cli
#
# export HORIZON_URL=http://localhost:8200
# export HZN_EXCHANGE_URL=http://192.168.1.115:3090/v1/ 
# export HZN_EXCHANGE_USER_AUTH=admin:password
# export HZN_ORG_ID=myorg
# export HZN_EXCHANGE_NODE_AUTH=bc8ebd2abf839833:nodeToken
#

ARCH=${ARCH:-$(dpkg --print-architecture)}
DOCKER_NAME=anax_${HZN_NODE_ID}
ANAX_IMAGE=${ANAX_IMAGE:-openhorizon/${ARCH}_anax}
ANAX_TAG=${ANAX_TAG:-2.30.0-794}
CONTAINER_LABEL=${CONTAINER_LABEL:-containerType=anaxNode}

validateStart() {
  [[ -z "${HZN_NODE_ID}" ]] && echo "HZN_NODE_ID is required env" 1>&2 && exit 1
  [[ -z "${HORIZON_AGENT_PORT}" ]] && echo "HORIZON_AGENT_PORT is required env" 1>&2 && exit 1
  [[ -z "${ESS_AUTH_DIR}" ]] && echo "ESS_AUTH_DIR is required env" 1>&2 && exit 1
  [[ -z "${ESS_SOCKET_DIR}" ]] && echo "ESS_SOCKET_DIR is required env" 1>&2 && exit 1

  [[ ! -f "${CONFIG_PATH}" ]] && echo "CONFIG_PATH: $CONFIG_PATH file does not exist" 1>&2 && exit 1
  [[ ! -S "${DOCKER_SOCKET}" ]] && echo "DOCKER_SOCKET: $DOCKER_SOCKET file does not exist" 1>&2 && exit 1
}

validateStop() {
  [[ -z "${HZN_NODE_ID}" ]] && echo "HZN_NODE_ID is required env" 1>&2 && exit 1
}

start() {
  validateStart

docker run -d -t --restart always --name $DOCKER_NAME --privileged \
-p 127.0.0.1:${HORIZON_AGENT_PORT}:8510 -e DOCKER_NAME=${DOCKER_NAME} \
-e HZN_VAR_RUN_BASE=/var/tmp/horizon/${DOCKER_NAME} -l ${CONTAINER_LABEL} \
-v ${DOCKER_SOCKET}:/var/run/docker.sock -v ${CONFIG_PATH}:/etc/default/horizon \
-v ${ESS_AUTH_DIR}:/var/horizon/ess-auth -v ${ESS_SOCKET_DIR}:/var/tmp/horizon/${DOCKER_NAME} \
${ANAX_IMAGE}:${ANAX_TAG}

# -v ${DOCKER_NAME}_etc:/etc/horizon/ -v ${DOCKER_NAME}_var:/var/horizon/ \ Mappings not required
}

stop() {
  validateStop

  docker stop -t 60 $DOCKER_NAME
  docker rm -f $DOCKER_NAME
  docker volume rm ${DOCKER_NAME}_var ${DOCKER_NAME}_etc
}

restart() {
  stop
  start
}

case "$1" in
	start)
		start
		;;
	stop)
		stop
		;;
	restart|update)
		restart
		;;
	*)
    echo "Unknown value: use either start, stop, restart/update with ./anax.sh"
		exit 1;
esac

exit