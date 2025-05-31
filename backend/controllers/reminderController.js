const Reminder = require('../models/Reminder');
const mongoose = require('mongoose');
const cron = require('node-cron');

// Create a reminder with auto-delete functionality
const createReminder = async (req, res) => {
  const { medication, dose, time } = req.body;

  if (!medication || !dose || !time) {
    return res.status(400).json({ error: 'Missing required fields: medication, dose, or time' });
  }

  const reminder = new Reminder({
    medication,
    dose,
    time,
  });

  try {
    await reminder.save();
    res.status(201).json(reminder);
  } catch (err) {
    res.status(400).json({ error: 'Error creating reminder', message: err.message });
  }
};

// Fetch all reminders
const getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find();
    res.status(200).json(reminders);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching reminders', message: err.message });
  }
};

// Delete a reminder by ID
const deleteReminder = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid reminder ID format' });
  }

  try {
    const reminder = await Reminder.findByIdAndDelete(id);

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    return res.status(200).json({ message: 'Reminder deleted successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Error deleting reminder', error: err.message });
  }
};

// Schedule a cron job to delete reminders 5 minutes after creation
cron.schedule('* * * * *', async () => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000); 
    const deletedReminders = await Reminder.deleteMany({ createdAt: { $lte: fiveMinutesAgo } });
    if (deletedReminders.deletedCount > 0) {
    }
  } catch (err) {
    console.error('Error during reminder cleanup:', err);
  }
});

module.exports = {
  createReminder,
  getReminders,
  deleteReminder,
};
