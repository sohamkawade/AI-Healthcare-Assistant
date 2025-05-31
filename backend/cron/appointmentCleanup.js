const cron = require('node-cron');
const Appointment = require('../models/Appointment');

const cleanupAppointments = async () => {
  try {
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
    });

  } catch (error) {
    console.error('Error during appointment cleanup:', error);
  }
};

// Schedule cleanup to run daily at midnight
cron.schedule('0 0 * * *', cleanupAppointments);

module.exports = { cleanupAppointments }; 