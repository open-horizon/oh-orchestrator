const Router = require('router');
const queryString = require('query-string');
const parseUrl = require('parseurl');
const Ajv = require('ajv');
const getRawBody = require('raw-body');

const initialize = (optionSecurityHandlers) => {
  const noSecurityHandler = (req, authOrSecDef, scopesOrApiKey, cb) => cb();
  const securityHandlers = optionSecurityHandlers || {
      AdminSecurity: noSecurityHandler,
  };

  const validate = (instance, schema, opt) => {
    const ajv = new Ajv(opt);

    const test = ajv.compile(schema);
    const isValid = test(instance);
    if (isValid) {
      return instance;
    }

    const error = new Error(`Request validation failed: Parameter (${opt.name}) failed schema validation`);
    error.info = {
      parameter: opt.name,
      errors: test.errors,
    };

    throw error;
  };

  const systemController = require('../src/controllers/systemController.js');
  const nodeController = require('../src/controllers/nodeController.js');

  const mw = Router();

  const safeJsonParse = (body) => {
    if (!body || body === '') {
      return {};
    }

    if (typeof body === 'object') {
      return body;
    }
    const instance = JSON.parse(body);
    return instance;
  };

  const swaggerPreParse = (opt) => (req, res, next) => {
    /* eslint-disable */
    const swaggerInfo = {
      "description": "This is a mID Configuration Inventory API",
      "version": "1.0.0",
      "title": "mID Configuration Inventory API",
      "contact": {
        "email": "supports@mimik.com"
      },
      "license": {
        "name": "Apache 2.0",
        "url": "http://www.apache.org/licenses/LICENSE-2.0.html"
      }
    };
    /* eslint-enable */

    req.swagger = {};
    req.swagger.info = swaggerInfo;
    req.swagger.operation = { operationId: opt.operationId };
    req.swagger._middleware = 'mimik';

    if (!req._query) {
      parseUrl(req);
      req._query = queryString.parse(req._parsedUrl.query, { arrayFormat: 'comma' }) || {};
    }

    if (req._body) {
      return next();
    }

    getRawBody(req, {
      length: req.headers['content-length'],
      limit: '1mb',
    }, function (err, buf) {
      if (err) return next(err)

      if (Buffer.isBuffer(buf) && buf.length) {
        req.body = buf.toString();
      }

      next();
    });
  };

  const swaggerParams = (params, opt) => (req, res, next) => {
    try {
      req.swagger.params = params.reduce((acc, p) => {
        const {
          in: inType, name, hasSchema, required, schema,
        } = p;
        if (inType === 'body') {
          const { body } = req;
          try {
            if (hasSchema) {
              const instance = safeJsonParse(body);
              validate(instance, schema, { allErrors: true, useDefaults: true, name });
              acc[name] = instance;
            } else {
              acc[name] = body;
            }
          } catch (err) {
            err.statusCode = 400;
            throw err;
          }
        } else if (inType === 'path') {
          acc[name] = req.params[name];
        } else if (inType === 'query') {
          acc[name] = req._query[name];
          if (p.type === 'array' && !Array.isArray(acc[name])) {
            acc[name] = (acc[name] === undefined) ? [] : [acc[name]];
          }
        }

        const nameVal = acc[name];
        if (required && !nameVal) {
          const err = new Error(`${name} is required`);
          err.statusCode = 400;
          throw err;
        }

        if ((inType === 'path' || inType === 'query') && nameVal && schema) {
          try {
            const valObj = { val: nameVal };
            const valSchema ={
              type: 'object',
              properties: {
                val: schema,
              }
            };

            validate(valObj, valSchema, { allErrors: true, name, useDefaults: true, coerceTypes: true });

            acc[name] = valObj.val;
          } catch (err) {
            err.statusCode = 400;
            throw err;
          }
        }

        return acc;
      }, {});
    } catch (e) {
      return next(e);
    }

    return next();
  };

  const swaggerSecurities = securities => {
    /* eslint-disable */
    const securityDefinitions = {
  "AdminSecurity": {
    "type": "oauth2",
    "tokenUrl": "https://mst.mimik360.com/oauth/token",
    "flow": "application",
    "scopes": {
      "read:system": "read system",
      "read:nodes": "read nodes",
      "read:nodeDetails": "read nodes details"
    }
  }
};
    /* eslint-enable */

    const securityRouter = Router();

    securities.forEach((sec, secIndex) => {
      const handle = (req, res, next) => {
        const name = Object.keys(sec)[0];
        const authOrSecDef = securityDefinitions[name];
        const { type, name: apiKeyName, in: inType } = authOrSecDef;
        const getApiKey = () => (inType === 'header'
          ? req.headers[apiKeyName]
          : req._query[apiKeyName]);

        const scopesOrApiKey = type === 'apiKey' ? getApiKey() : sec[name];

        const nextError = (err) => {
          if (err && !err.statusCode) {
            err.statusCode = 403;
          }

          next(err);
        };

        securityHandlers[name](req, authOrSecDef, scopesOrApiKey, nextError);
      };

      if (secIndex === 0) {
        securityRouter.use((req, res, next) => handle(req, res, next));
      } else {
        securityRouter.use((err, req, res, next) => handle(req, res, next));
      }
    });

    return securityRouter;
  };

  function notImplemented(method, path, operationId) {
    return () => {
      const err = new Error(`operation: '${operationId}' not implemented`);
      err.statusCode = 501;
      err.info = {
        errors: [{
          method,
          path,
          operationId,
        }],
      }
      throw err;
    };
  }

  /* eslint-disable */
  const getHealthCheckParams = [];
  const getHealthCheckSecurities = [];

  mw.get(
    '/healthcheck',
    swaggerPreParse({ operationId: 'getHealthCheck' }),
    swaggerSecurities(getHealthCheckSecurities),
    swaggerParams(getHealthCheckParams, { operationId: 'getHealthCheck' }),
    (systemController && systemController.getHealthCheck)
      || notImplemented('get', '/healthcheck', 'getHealthCheck'),
  );
  /* eslint-enable */
  /* eslint-disable */
  const getSystemInfoParams = [];
  const getSystemInfoSecurities = [
  {
    "AdminSecurity": [
      "read:system"
    ]
  }
];

  mw.get(
    '/systeminfo',
    swaggerPreParse({ operationId: 'getSystemInfo' }),
    swaggerSecurities(getSystemInfoSecurities),
    swaggerParams(getSystemInfoParams, { operationId: 'getSystemInfo' }),
    (systemController && systemController.getSystemInfo)
      || notImplemented('get', '/systeminfo', 'getSystemInfo'),
  );
  /* eslint-enable */
  /* eslint-disable */
  const getNodesParams = [
  {
    "in": "query",
    "name": "mdeployStatus",
    "type": "array",
    "hasSchema": false,
    "schema": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": [
          "active",
          "inactive",
          "not_found"
        ]
      },
      "minItems": 1
    }
  }
];
  const getNodesSecurities = [
  {
    "AdminSecurity": [
      "read:nodes"
    ]
  }
];

  mw.get(
    '/nodes',
    swaggerPreParse({ operationId: 'getNodes' }),
    swaggerSecurities(getNodesSecurities),
    swaggerParams(getNodesParams, { operationId: 'getNodes' }),
    (nodeController && nodeController.getNodes)
      || notImplemented('get', '/nodes', 'getNodes'),
  );
  /* eslint-enable */
  /* eslint-disable */
  const getNodeDetailsParams = [
  {
    "in": "path",
    "name": "id",
    "type": "string",
    "required": true,
    "hasSchema": false,
    "schema": {
      "type": "string"
    }
  }
];
  const getNodeDetailsSecurities = [
  {
    "AdminSecurity": [
      "read:nodeDetails"
    ]
  }
];

  mw.get(
    '/nodes/:id',
    swaggerPreParse({ operationId: 'getNodeDetails' }),
    swaggerSecurities(getNodeDetailsSecurities),
    swaggerParams(getNodeDetailsParams, { operationId: 'getNodeDetails' }),
    (nodeController && nodeController.getNodeDetails)
      || notImplemented('get', '/nodes/:id', 'getNodeDetails'),
  );
  /* eslint-enable */

  return mw;
};

const swagger = {
  basePath: '/ohorchestrator/v1',
};

module.exports = {
  initialize,
  swagger,
};
