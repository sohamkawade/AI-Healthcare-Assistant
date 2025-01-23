const express = require('express');
const {
    scheduleAppointment,
    getPatientAppointments,
    getDoctorAppointments,
    getAvailableTimeSlots, 
} = require('../controllers/appointmentController');
const { getDoctors,  addPredefinedTimeSlotsForMultipleDoctors  } = require('../controllers/doctorController');
const { getPatientById } = require('../controllers/patientController');
const { authenticate } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/patient/:id', authenticate, getPatientById); // Get patient details by ID
router.get('/doctors', authenticate, getDoctors); // Get list of doctors


router.get('/appointment/patient', authenticate, getPatientAppointments); // Get appointments for a patient
router.get('/appointment/doctor', authenticate, getDoctorAppointments); // Get appointments for a doctor
router.get('/appointments/available-time-slots', authenticate, getAvailableTimeSlots); 
router.post('/time-slots/add-time-slots', addPredefinedTimeSlotsForMultipleDoctors);
router.post('/appointment/schedule', authenticate, scheduleAppointment);

module.exports = router;
