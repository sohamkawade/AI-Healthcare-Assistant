const cron = require('node-cron');
const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');

const cleanupAppointments = async () => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return;
    }

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Delete all appointments except cancelled ones that are less than 24 hours old
    const result = await Appointment.deleteMany({
      $or: [
        { status: 'completed' },
        { status: 'pending' },
        { status: 'confirmed' },
        { status: 'cancelled', updatedAt: { $lt: oneDayAgo } }
      ]
    }).maxTimeMS(30000); // Set maximum execution time to 30 seconds

  } catch (error) {
    console.error('Error during appointment cleanup:', error);
    // Retry after 5 minutes if there's an error
    setTimeout(cleanupAppointments, 5 * 60 * 1000);
  }
};

// Wait for MongoDB connection before scheduling cleanup
const scheduleCleanup = () => {
  if (mongoose.connection.readyState === 1) {
    // Schedule cleanup to run daily at midnight
    cron.schedule('0 0 * * *', cleanupAppointments);
    // Run initial cleanup
    cleanupAppointments();
  } else {
    // If not connected, wait 5 seconds and try again
    setTimeout(scheduleCleanup, 5000);
  }
};

// Start scheduling when the module is loaded
scheduleCleanup();

module.exports = { cleanupAppointments }; 