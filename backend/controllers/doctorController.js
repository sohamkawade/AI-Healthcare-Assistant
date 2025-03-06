// controllers/doctorController.js
const Doctor = require('../models/Doctor');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateToken } = require('../utils/generateToken');

module.exports.registerDoctor = async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      contactNumber,
      specialization,
      fees,
      degree
    } = req.body;

    // Check if all required fields are provided
    if (![email, password, firstName, lastName, contactNumber, specialization, fees, degree].every(Boolean)) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format.' });
    }

    // Validate password format
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long and include both letters and numbers.' });
    }

    // Validate contact number format
    const contactNumberRegex = /^[0-9]{10}$/;
    if (!contactNumberRegex.test(contactNumber)) {
      return res.status(400).json({ success: false, message: 'Contact number must be a 10-digit number.' });
    }

    // Validate fees
    if (isNaN(fees) || fees <= 0) {
      return res.status(400).json({ success: false, message: 'Fees must be a positive number.' });
    }

    // Check if the doctor is already registered
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({ success: false, message: 'Email is already registered.' });
    }

    // Hash the password and save the new doctor
    const hashedPassword = await bcrypt.hash(password, 10);
    const newDoctor = new Doctor({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      contactNumber,
      specialization,
      fees,
      degree
    });

    await newDoctor.save();

    // Generate token and send response
    const token = generateToken(newDoctor);
    res.cookie('token', token, { httpOnly: true });

    res.status(201).json({ success: true, message: 'Doctor registered successfully.', token });
  } catch (error) {
    console.error('Error in doctor registration:', error);
    res.status(500).json({ success: false, message: 'Internal server error during registration.' });
  }
};


// Get doctors with pagination and filtering
module.exports.getDoctors = async (req, res) => {
  try {
    const { page = 1, limit = 10, specialization } = req.query;
    const skip = (page - 1) * limit;

    const query = specialization ? { specialization: { $regex: specialization, $options: 'i' } } : {};
    const doctors = await Doctor.find(query).skip(skip).limit(parseInt(limit)).select('-password');

    const totalDoctors = await Doctor.countDocuments(query);
    res.status(200).json({
      success: true,
      message: 'Doctors fetched successfully.',
      data: doctors,
      pagination: { currentPage: page, totalPages: Math.ceil(totalDoctors / limit), totalDoctors, limit: parseInt(limit) },
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ success: false, message: 'Error fetching doctors.' });
  }
};

module.exports.generateToken = (doctor) => {
  return jwt.sign({ id: doctor._id, email: doctor.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
};
