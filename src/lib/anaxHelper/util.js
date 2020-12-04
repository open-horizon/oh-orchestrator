const scriptFileValues = {
  ANAX_DEPLOYMENT_SCRIPT: 'deploy_anax.sh',
};

const scriptCommandValues = {
  REGISTER_ANAX: 'hzn register',
  UNREGISTER_ANAX: 'echo "y" | hzn unregister',
  NUKE_DOCKER: 'docker rm -f $(docker ps -a -q)',
};

module.exports = {
  scriptFileValues,
  scriptCommandValues,
};
