const Patient = require('../models/Patient');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateToken } = require("../utils/generateToken");

module.exports.registerPatient = async (req, res) => {
  try {
    const { firstName, lastName, email, password, address, contactNumber, birthdate } = req.body;
    if (!email || !password || !firstName || !lastName || !contactNumber || !address || !birthdate) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long and include both letters and numbers.',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format.' });
    }

    const contactNumberRegex = /^[0-9]{10}$/;
    if (!contactNumberRegex.test(contactNumber)) {
      return res.status(400).json({ success: false, message: 'Contact number must be a 10-digit number.' });
    }
    
    const existingPatient = await Patient.findOne({ email });
    if (existingPatient) {
      return res.status(400).json({ success: false, message: 'Email is already registered, Please login' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newPatient = new Patient({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      address,
      contactNumber,
      birthdate,
    });
    const savedPatient = await newPatient.save();

    const token = generateToken(newPatient)
    res.cookie("token", token, { httpOnly: true });
    res.status(201).json({
      success: true,
      message: 'Patient registered successfully.',
      data: { token },
    });
  } catch (error) {
    console.error("Error during patient registration:", error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
},

  module.exports.getPatientById = async (req, res) => {
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
  }
