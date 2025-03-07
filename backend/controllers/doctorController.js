// controllers/doctorController.js
const Doctor = require('../models/Doctor');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateToken } = require('../utils/generateToken');

// Doctor registration controller
module.exports.registerDoctor = async (req, res) => {
  try {

    const { email, password, firstName, lastName, contactNumber, specialization, fees, degree } = req.body;

    if (![email, password, firstName, lastName, contactNumber, specialization, fees, degree].every(Boolean)) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }


    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({ success: false, message: 'Email is already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newDoctor = new Doctor({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      contactNumber,
      specialization,
      fees,
      degree,
    });

    await newDoctor.save();
    res.status(201).json({ 
      success: true, 
      doctor: { 
        firstName, 
        lastName, 
        email, 
      },
    });
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
