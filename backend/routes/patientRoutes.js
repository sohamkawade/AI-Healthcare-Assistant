const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const {
  getDoctorPatients,
  getPatientDetails,
  getDoctorPatientCount
} = require('../controllers/patientController');

// Get all patients for a doctor (based on appointments)
router.get('/doctor/:doctorId', authenticate, getDoctorPatients);

// Get patient count for a doctor
router.get('/count/:doctorId', authenticate, getDoctorPatientCount);

// Get specific patient details
router.get('/:patientId', authenticate, getPatientDetails);

module.exports = router; 