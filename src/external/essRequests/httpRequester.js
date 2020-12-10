

const fs = require('fs-extra');
const uuid = require('uuid');

const { httpRequest, fileRequest } = require('./socketRequester');
const config = require('../configuration/config').getConfig();
const { deployModel } = require('./deploymentHelper');

const NOT_FOUND_RESPONSE = 'Unauthorized';

const basePath = 'https://localhost/api/v1';

const authToken = (new Buffer(`${config.essUsername}:${config.essPassword}`)).toString('base64');
const headers = {
  Authorization: `Basic ${authToken}`,
};

const filename = './~fetchedModel';

const getCert = () => fs.readFile(config.essCert)
  .then((content) => {
    const fetchedCert = (Buffer.from(content)).toString();
    // Buffer.toString();
    if (!config.essCert) {
      throw new Error('Cert file does not contain anything');
    }
    return fetchedCert;
  })
  .catch((err) => {
    console.log('Error occured while fetching cert file:', err);
    process.exit(1);
  });

let previousInstanceId = '';
let currentInstanceId = '';

const checkIfObjectExists = () => fs.exists(filename)
  .then((modelExists) => getCert()
    .then((cert) => httpRequest({
      method: 'GET',
      endpoint: `${basePath}/objects/${config.essObjectType}`,
      cert,
      headers,
    })
      .then((objects) => {
        objects.forEach((object) => {
          if (object.objectID === config.essObjectId) {
            // console.log('===> object', object);
            currentInstanceId = object.objectSize;
            const { properties } = object.destinationPolicy;
            let isGatewayDeployment = false;
            properties.forEach((property) => {
              if (property.type === 'deployment' && property.name === 'location' && property.value === 'gatewayNode') {
                isGatewayDeployment = true;
              }
            });
            return fileRequest({
              method: 'GET',
              endpoint: `${basePath}/objects/${config.essObjectType}/${config.essObjectId}/data`,
              cert,
              headers,
              filePath: filename,
            })
              .then(() => {
                if (previousInstanceId === currentInstanceId) {
                  console.log('No updates on the currently deployed model');
                  return;
                }
                console.log('Deployment type:', isGatewayDeployment ? 'gatewayNode' : 'edgeNode');
                previousInstanceId = currentInstanceId;
                console.log('Updating the currently deployed model to newer version');
                return deployModel(config.essObjectType, config.essObjectId, isGatewayDeployment);
              })
              .catch((error) => {
                console.log('===> error occured while writing file or deploying mode', error);
              });
          }
        });
      })));


module.exports = {
  checkIfObjectExists,
};

