const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: [true, 'Appointment date is required'],
      validate: {
        validator: function (v) {
          return v > Date.now(); // Ensure future date
        },
        message: 'Appointment date must be in the future.',
      },
    },
    timeSlot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TimeSlot',
      required: [true, 'Time slot is required'],
    },
    appointmentType: {
      type: String,
      required: [true, 'Appointment type is required'],
      enum: ['Consultation', 'Follow-up', 'Routine Checkup', 'Dental Appointment', 'Mental Health Session'],
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor is required'],
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient is required'],
    },
    status: {
      type: String,
      default: 'Scheduled',
      enum: ['Scheduled', 'Completed', 'Canceled'],
    },
  },
  { timestamps: true }
);

// Pre-save middleware to mark the associated time slot as booked
appointmentSchema.pre('save', async function (next) {
  const timeSlot = await mongoose.model('TimeSlot').findById(this.timeSlot);
  if (!timeSlot || timeSlot.isBooked) {
    return next(new Error('Time slot is not available.'));
  }

  timeSlot.isBooked = true;
  timeSlot.status = 'Booked';
  await timeSlot.save();
  next();
});

// Post-remove middleware to mark the associated time slot as available
appointmentSchema.post('remove', async function (doc) {
  const timeSlot = await mongoose.model('TimeSlot').findById(doc.timeSlot);
  if (timeSlot) {
    timeSlot.isBooked = false;
    timeSlot.status = 'Available';
    await timeSlot.save();
  }
});

module.exports = mongoose.model('Appointment', appointmentSchema, 'Appointments');
