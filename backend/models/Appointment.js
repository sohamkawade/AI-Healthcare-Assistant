const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },
    slotDate: { type: String, required: true },
    slotTime: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    cancelled: { type: Boolean, default: false },
    payment: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Create the Appointment model
module.exports = mongoose.model('Appointment', appointmentSchema, 'Appointments');
