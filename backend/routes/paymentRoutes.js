const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middlewares/authMiddleware');
const moment = require('moment');

// All routes require authentication
router.use(authenticate);

// Initialize payment for an appointment
router.post('/initiate', paymentController.initiatePayment);

// Get payment details
router.get('/:paymentId', paymentController.getPaymentDetails);

// Process refund
router.post('/:paymentId/refund', paymentController.processRefund);

// Get patient payment history
router.get('/patient/:patientId/history', paymentController.getPatientPaymentHistory);

module.exports = router; 