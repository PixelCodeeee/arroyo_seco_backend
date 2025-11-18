const express = require('express');
const router = express.Router();
const paypalController = require('../controllers/paypalController');

// Create PayPal order (no auth required for order creation)
router.post('/create-order', paypalController.createOrder);

// Capture payment (auth required)
router.post('/capture-order', paypalController.captureOrder);

// Get order details
router.get('/orders/:orderID', paypalController.getOrderDetails);

module.exports = router;