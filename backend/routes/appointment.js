const express = require('express');
const router = express.Router();
const {
    appointmentsDoctor,
    appointmentCancel,
    appointmentComplete,
    bookAppointment,
} = require('../controllers/appointmentController');
const { getPatientById } = require('../controllers/patientController');
const { getDoctors } = require('../controllers/doctorController');
const { authenticate } = require('../middlewares/authMiddleware'); // Make sure you have authentication middleware

// Route to book a new appointment
router.post('/book', authenticate, bookAppointment); // Added authenticate middleware if booking appointment requires authentication

// Route to get doctor appointments
router.get('/doctor/:docId', authenticate, appointmentsDoctor); // Added authenticate middleware for security

// Route to cancel an appointment
router.put('/:appointmentId/cancel', authenticate, appointmentCancel); // Added authenticate middleware for security

// Route to get patient profile by ID
router.get('/patient/:id', authenticate, getPatientById); // Added authenticate middleware for security

// Route to fetch list of available doctors
router.get('/doctors', getDoctors);

// Route to mark an appointment as completed
router.put('/:appointmentId/complete', authenticate, appointmentComplete); // Added authenticate middleware to secure the completion route

module.exports = router;
