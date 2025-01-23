const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateToken } = require("../utils/generateToken");

module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await Patient.findOne({ email });
    let userType = 'patient';

    if (!user) {
      user = await Doctor.findOne({ email });
      userType = 'doctor';
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid password.' });
    }

    const token = generateToken(user);
    res.cookie("token", token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict' 
    });

    res.status(200).json({
      success: true,
      message: `${userType.charAt(0).toUpperCase() + userType.slice(1)} login successful.`,
      data: { token }
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

module.exports.logout = async (req, res) => {
  res.cookie("token", "", { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Strict' });
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
};
