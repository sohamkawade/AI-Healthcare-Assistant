const express = require('express');
const router = express.Router();
const { submitContact } = require('../controllers/contactController');
const { authenticate } = require('../middlewares/authMiddleware');


// Authenticated contact message route
router.post('/contacts/submit', authenticate, submitContact);

module.exports = router;
