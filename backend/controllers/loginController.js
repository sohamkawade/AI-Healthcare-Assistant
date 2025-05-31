const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateToken } = require("../utils/generateToken");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide both email and password.' 
      });
    }

    // First try to find a patient
    let user = await Patient.findOne({ email }).select('+password');
    let userType = 'patient';

    // If not a patient, try to find a doctor
    if (!user) {
      user = await Doctor.findOne({ email }).select('+password');
      userType = 'doctor';
    }

    // If no user found at all
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'No account found with this email.' 
      });
    }

    // Verify password
    if (!user.password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Account password is not set properly. Please contact support.' 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid password.' 
      });
    }

    // Generate token with additional user data
    const tokenData = {
      _id: user._id,
      email: user.email,
      userType,
      specialization: user.specialization || null
    };
    const token = generateToken(tokenData);

    // Set the token as an HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    // Return user data and token
    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          userType,
          specialization: user.specialization || null,
          profilePicture: user.profilePicture || null,
          breakTime: user.breakTime || null
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error', 
      error: error.message 
    });
  }
};

const logout = async (req, res) => {
  try {
    // Clear the token cookie
    res.clearCookie('token');
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during logout',
      error: error.message
    });
  }
};

module.exports = {
  login,
  logout
};
