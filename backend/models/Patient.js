const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    birthdate: {
      type: Date,
      required: true,
    },
    contactNumber: {
      type: Number,
      required: true,
      trim: true,
    },
    profilePicture: {
      type: String,
      required: true,
  },
    resetToken: {
      type: String,
      default: null,
    },
    resetTokenExpiration: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, 
  }
);

module.exports = mongoose.model('Patient', patientSchema, 'Patients');
