

const getObjectsByType = (objectType) => {
  
  return httpRequest({
  method: 'GET',
  endpoint: `${basePath}/objects/${config.essObjectType}`,
  cert,
  headers,
});
};


module.exports = {
  getObjectsByType,
};
