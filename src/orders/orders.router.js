const router = require('express').Router();
const controller = require('./orders.controller');
const methodNotAllowed = require('../errors/methodNotAllowed');
// This file specifies the routing of components
router
  .route('/')
  .get(controller.list)
  .post(controller.create)
  .all(methodNotAllowed);

router
  .route('/:orderId')
  .get(controller.read)
  .put(controller.update)
  .post(controller.create)
  .delete(controller.delete)
  .all(methodNotAllowed);

module.exports = router;