const express = require('express');
const controller = require('../controllers/billetera.controller');
const movementController = require('../controllers/movimiento.controller');
const { authorizeService } = require('../middlewares/service-auth.middleware');
const { asyncHandler } = require('../middlewares/error.middleware');
const router = express.Router();

router.post('/', asyncHandler(controller.create));
router.post('/:id/movimientos', authorizeService, asyncHandler(movementController.apply));
router.get('/:id/movimientos', asyncHandler(movementController.list));
router.get('/:id/saldo', asyncHandler(controller.getBalance));
router.patch('/:id/activar', asyncHandler(controller.activate));
router.patch('/:id/inactivar', asyncHandler(controller.deactivate));
router.get('/:id', asyncHandler(controller.getById));

module.exports = router;
