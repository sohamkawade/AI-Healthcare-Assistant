const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
    },
    status: {
      type: String,
      default: 'Available',
      enum: ['Available', 'Booked', 'Completed', 'Canceled'],
    },
  },
  { timestamps: true }
);

// Index to prevent overlapping time slots for the same doctor and date
timeSlotSchema.index({ doctor: 1, date: 1, startTime: 1, endTime: 1 }, { unique: true });

// Pre-save middleware to prevent overlapping time slots for the same doctor
timeSlotSchema.pre('save', async function (next) {
  const overlappingSlot = await mongoose.model('TimeSlot').findOne({
    doctor: this.doctor,
    date: this.date,
    $or: [
      { startTime: { $lte: this.endTime, $gte: this.startTime } },
      { endTime: { $gte: this.startTime, $lte: this.endTime } },
    ],
  });

  if (overlappingSlot) {
    return next(new Error('Time slot overlaps with an existing booking.'));
  }
  next();
});

module.exports = mongoose.model('TimeSlot', timeSlotSchema, "TimeSlots");
