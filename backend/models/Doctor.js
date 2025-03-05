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
    resetToken: { type: String, default: null },
    resetTokenExpiration: { type: Date, default: null },
    timeSlots: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TimeSlot' }],
    predefinedTimeSlots: [
      {
        date: { type: Date, required: true },
        slots: [
          {
            startTime: { type: Date, required: true },
            endTime: { type: Date, required: true },
            status: { type: String, default: 'Available', enum: ['Available', 'Booked'] },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema, "Doctors");
