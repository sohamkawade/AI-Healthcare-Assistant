const express = require('express');
const router = express.Router();
const { registerPatient } = require('../controllers/patientController');
const { registerDoctor, getDoctors, updateDoctorAvailability } = require('../controllers/doctorController');
const { login, logout } = require('../controllers/loginController');
const { getProfile, updateProfile } = require('../controllers/profileController');
const { forgotPassword, resetPassword } = require('../controllers/authController');
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
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Error handling middleware
router.use(errorHandler);

module.exports = router;
