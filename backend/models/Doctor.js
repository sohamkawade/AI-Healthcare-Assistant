const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    specialization: { type: String, required: true, trim: true },
    contactNumber: { type: String, required: true, trim: true },
    fees: { type: Number, required: true },
    degree: { type: String, required: true },
    available: { type: Boolean, default: true },
    slots_booked: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' }],
    resetToken: { type: String, default: null },
    resetTokenExpiration: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema, 'Doctors');
