const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const { generateToken } = require("../utils/generateToken");

const getProfile = async (req, res) => {
  try {
    const { email, id } = req.user;

    let user = await Patient.findOne({ email });
    let userType = 'patient';

    if (!user) {
      user = await Doctor.findOne({ email });
      userType = 'doctor';
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (id && user._id.toString() !== id) {
      return res.status(400).json({ success: false, message: 'User ID mismatch.' });
    }

    const token = generateToken(user);

    res.status(200).json({ success: true, data: user, userType, token });
  } catch (error) {
    console.error('Error in getProfile:', error);
    res.status(500).json({ success: false, message: 'Error fetching profile data.' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { email, id } = req.user;
    const updateData = { ...req.body };

    // Handle profile picture upload
    if (req.file) {
      updateData.profilePicture = `/uploads/${req.file.filename}`;
    }

    let user = await Patient.findOne({ email });
    let userType = 'patient';

    if (!user) {
      user = await Doctor.findOne({ email });
      userType = 'doctor';
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (id && user._id.toString() !== id) {
      return res.status(400).json({ success: false, message: 'User ID mismatch.' });
    }

    // Clean up updateData to only include valid fields
    const validFields = [
      'firstName', 'lastName', 'email', 'address', 'contactNumber', 
      'birthdate', 'specialization', 'degree', 'profilePicture'
    ];

    const cleanedUpdateData = {};
    validFields.forEach(field => {
      if (updateData[field] !== undefined) {
        cleanedUpdateData[field] = updateData[field];
      }
    });

    // Update user data
    Object.assign(user, cleanedUpdateData);

    // Validate the updated data
    const validationError = user.validateSync();
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationError.errors
      });
    }

    await user.save();

    const token = generateToken(user);

    res.status(200).json({ 
      success: true, 
      message: 'Profile updated successfully.',
      data: user,
      userType,
      token 
    });
  } catch (error) {
    console.error('Error in updateProfile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating profile.',
      error: error.message
    });
  }
};

module.exports = {
  getProfile,
  updateProfile
};
