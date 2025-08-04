const express = require('express');
const { subscribe } = require('../controllers/subscriberController');
const router = express.Router();

// Newsletter subscription route
router.post('/subscribe', subscribe);

module.exports = router; 