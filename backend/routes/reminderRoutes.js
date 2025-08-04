const express = require('express');
const { createReminder, getReminders, deleteReminder } = require('../controllers/reminderController');
const { authenticate } = require('../middlewares/authMiddleware');
const router = express.Router();


router.post('/reminders', authenticate, createReminder);


router.get('/reminders', authenticate, getReminders);


router.delete('/reminders/:id', authenticate, deleteReminder);

module.exports = router;
