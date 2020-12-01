const Promise = require('bluebird');
const { getRichError } = require('@bananabread/response-helper');

const nodes = {};

const checkIfValidNode = (node, correlationId) => Promise.resolve()
  .then(() => {
    if (!node || !node.id) {
      throw getRichError('System', 'Invalid node', { node }, null, 'error', correlationId);
    }
  });

const saveNode = (node, correlationId) => checkIfValidNode(node, correlationId)
  .catch((err) => {
    throw getRichError('System', 'Could not save node, invalid format', { node }, err, 'error', correlationId);
  })
  .then(() => {
    if (nodes[node.id]) {
      throw getRichError('System', 'Could not save node, node already exists', { node }, null, 'error', correlationId);
    }
    nodes[node.id] = node;
    return node;
  });

const getAllNodes = () => Promise.resolve(Object.values(nodes));

const findNodeById = (id) => Promise.resolve(nodes[id]);

const getNodeById = (id, correlationId) => findNodeById(id)
  .then((node) => {
    if (node) return node;
    throw getRichError('NotFound', 'Could not get node in nodeModel', { id }, null, 'error', correlationId);
  });

const deleteNodeById = (id) => Promise.resolve()
  .then(() => {
    delete nodes[id];
  });

const saveAndUpdateNode = (newNode, correlationId) => checkIfValidNode(newNode, correlationId)
  .catch((err) => {
    throw getRichError('System', 'Could not saveAndUpdateNode node, invalid format', { newNode }, err, 'error', correlationId);
  })
  .then(() => {
    if (!nodes[newNode.id]) {
      nodes[newNode.id] = newNode;
      return newNode;
    }
    const updatedNode = { ...nodes[newNode.id], ...newNode };
    nodes[newNode.id] = updatedNode;
    return nodes[newNode.id];
  });

const updateAnaxState = (nodeId, anaxState) => getNodeById(nodeId)
  .then(() => {
    nodes[nodeId].anaxState = anaxState;
  });

module.exports = {
  saveNode,
  getAllNodes,
  getNodeById,
  findNodeById,
  deleteNodeById,
  updateAnaxState,
  saveAndUpdateNode,
};
