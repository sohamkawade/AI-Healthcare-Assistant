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


module.exports = mongoose.model('Appointment', appointmentSchema, 'Appointments');
