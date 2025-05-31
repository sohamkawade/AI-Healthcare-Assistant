const express = require('express');
const router = express.Router();
const { registerPatient } = require('../controllers/patientController');
const { registerDoctor, getDoctors, updateDoctorAvailability } = require('../controllers/doctorController');
const { login, logout } = require('../controllers/loginController');
const { getProfile, updateProfile } = require('../controllers/profileController');
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/authMiddleware');
const uploadMiddleware = require('../middlewares/uploadMiddleware');

// Create uploads directory if it doesn't exist
const fs = require('fs');
const path = require('path');
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors,
    });
  }

  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: 'File upload error',
      error: err.message
    });
  }

  return res.status(500).json({
    success: false,
    message: 'An unexpected error occurred.',
    error: err.message
  });
};

// Authentication routes
router.post('/register-patient', uploadMiddleware, registerPatient);
router.post('/register-doctor', uploadMiddleware, registerDoctor);
router.post('/login', login);
router.post('/logout', authenticate, logout);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, uploadMiddleware, updateProfile);
router.get('/doctors', getDoctors);
router.put('/doctor/availability', authenticate, updateDoctorAvailability);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-otp', authController.verifyOTP);
router.post('/reset-password', authController.resetPassword);

// Add a new route to get raw doctor fee directly from MongoDB
router.get('/raw-doctor-fee/:id', authenticate, async (req, res) => {
  try {
    const doctorId = req.params.id;
    console.log('Getting raw fee for doctor:', doctorId);
    
    // Use direct MongoDB connection to avoid Mongoose transformation
    const mongoose = require('mongoose');
    const db = mongoose.connection.db;
    
    // Convert ID to MongoDB ObjectId
    const objectId = new mongoose.Types.ObjectId(doctorId);
    
    // Get doctor directly from MongoDB
    const doctor = await db.collection('Doctors').findOne({ _id: objectId });
    
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    
    console.log('Raw doctor data from MongoDB:', doctor);
    console.log('Raw fee value:', doctor.fees, 'Type:', typeof doctor.fees);
    
    // Return the raw fee
    res.json({ 
      success: true, 
      fee: doctor.fees,
      feeType: typeof doctor.fees
    });
  } catch (error) {
    console.error('Error getting raw doctor fee:', error);
    res.status(500).json({ success: false, message: 'Error getting fee' });
  }
});

// Error handling middleware
router.use(errorHandler);

module.exports = router;
