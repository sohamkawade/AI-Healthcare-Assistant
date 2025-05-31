const jwt = require('jsonwebtoken');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({
        success: false,
        message: 'No authentication token, access denied'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    let user;
    if (decoded.role === 'doctor') {
      user = await Doctor.findById(decoded.id).select('-password');
    } else {
      user = await Patient.findById(decoded.id).select('-password');
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Set the complete user object in the request
    req.user = {
      _id: user._id,
      email: user.email,
      role: decoded.role,
      specialization: user.specialization || null,
      firstName: user.firstName,
      lastName: user.lastName
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    console.error('Error stack:', error.stack);
    res.status(401).json({
      success: false,
      message: 'Token is invalid or expired',
      error: error.message
    });
  }
};

module.exports = { authenticate };
