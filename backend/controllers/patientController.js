const Patient = require('../models/Patient');
const bcrypt = require("bcryptjs");
const path = require('path');
const { generateToken } = require("../utils/generateToken");
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const mongoose = require('mongoose');

const registerPatient = async (req, res) => {
  try {
    const { firstName, lastName, email, password, address, contactNumber, birthdate } = req.body;

    // Validate required fields
    if (![firstName, lastName, email, password, address, contactNumber, birthdate].every(Boolean)) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Profile picture is required' });
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long and include both letters and numbers.' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format.' });
    }

    // Validate contact number
    const contactNumberRegex = /^[0-9]{10}$/;
    if (!contactNumberRegex.test(contactNumber)) {
      return res.status(400).json({ success: false, message: 'Contact number must be a 10-digit number.' });
    }

    // Check for existing patient
    const existingPatient = await Patient.findOne({ email });
    if (existingPatient) {
      return res.status(400).json({ success: false, message: 'Email is already registered. Please login.' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Store the file path relative to the uploads directory
    const profilePicturePath = `/uploads/${path.basename(req.file.path)}`;
    
    // Create new patient
    const patient = await Patient.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      address,
      contactNumber,
      birthdate,
      profilePicture: profilePicturePath,
    });

    // Generate token
    const token = generateToken(patient);
    res.cookie("token", token, { httpOnly: true });

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully.',
      data: {
        id: patient._id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email:patient.email,
        contactNumber: patient.contactNumber,
        address: patient.address,
        birthdate: patient.birthdate,
        profilePicture: patient.profilePicture,
        token,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const getPatientById = async (req, res) => {
  try {
    const patientId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ success: false, message: 'Invalid patient ID format' });
    }

    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    return res.status(200).json({ success: true, patient });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all patients for a doctor (based on appointments)
const getDoctorPatients = async (req, res) => {
  try {
    // Get unique patient IDs from appointments
    const appointments = await Appointment.find({ 
      docId: req.params.docId,
      status: { $in: ['completed', 'pending'] }
    }).distinct('patientId');

    // Get patient details
    const patients = await User.find({
      _id: { $in: appointments },
      specialization: { $exists: false } // Only get patients (not doctors)
    }).select('firstName lastName email contactNumber profilePicture');

    // For each patient, get their appointment and prescription count
    const patientsWithDetails = await Promise.all(patients.map(async (patient) => {
      const appointmentCount = await Appointment.countDocuments({
        docId: req.params.docId,
        patientId: patient._id,
        status: { $in: ['completed', 'pending'] }
      });

      const prescriptionCount = await Prescription.countDocuments({
        doctorId: req.params.docId,
        patientId: patient._id
      });

      const lastAppointment = await Appointment.findOne({
        docId: req.params.docId,
        patientId: patient._id,
        status: 'completed'
      }).sort({ slotDate: -1, slotTime: -1 });

      return {
        _id: patient._id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        contactNumber: patient.contactNumber,
        profilePicture: patient.profilePicture,
        appointmentCount,
        prescriptionCount,
        lastVisit: lastAppointment ? lastAppointment.slotDate : null
      };
    }));

    res.json({
      success: true,
      data: patientsWithDetails
    });
  } catch (error) {
    console.error('Error fetching doctor patients:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patients'
    });
  }
};

// Get patient count for a doctor
const getDoctorPatientCount = async (req, res) => {
  try {
    const uniquePatients = await Appointment.find({
      docId: req.params.docId,
      status: { $in: ['completed', 'pending'] }
    }).distinct('patientId');

    res.json({
      success: true,
      count: uniquePatients.length
    });
  } catch (error) {
    console.error('Error getting patient count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get patient count'
    });
  }
};

// Get specific patient details
const getPatientDetails = async (req, res) => {
  try {
    const patient = await User.findById(req.params.patientId)
      .select('firstName lastName email contactNumber profilePicture');

    if (!patient || patient.specialization) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Get appointment history
    const appointments = await Appointment.find({
      patientId: req.params.patientId,
      docId: req.user._id
    }).sort({ startTime: -1 });

    // Get prescription history
    const prescriptions = await Prescription.find({
      patientId: req.params.patientId,
      docId: req.user._id
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        _id: patient._id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        contactNumber: patient.contactNumber,
        profilePicture: patient.profilePicture,
        appointments: appointments.map(apt => ({
          _id: apt._id,
          startTime: apt.startTime,
          status: apt.status,
          type: apt.type,
          reason: apt.reason
        })),
        prescriptions: prescriptions.map(pres => ({
          _id: pres._id,
          diagnosis: pres.diagnosis,
          symptoms: pres.symptoms,
          medications: pres.medications,
          instructions: pres.instructions,
          status: pres.status,
          createdAt: pres.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching patient details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patient details'
    });
  }
};

module.exports = {
  registerPatient,
  getPatientById,
  getDoctorPatients,
  getPatientDetails,
  getDoctorPatientCount
};
