const express = require('express');
const { createContactMessage } = require('../controllers/contactController');
const { authenticate } = require('../middlewares/authMiddleware');
const router = express.Router(); 

router.post('/contact', authenticate, createContactMessage);

module.exports = router;
