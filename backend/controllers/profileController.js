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

    // First check if the fees field exists and save it separately
    const hasFees = req.body.fees !== undefined;
    let originalFeeValue = null;
    if (hasFees) {
      originalFeeValue = req.body.fees;
      delete updateData.fees;
    }

    // Clean up updateData to only include valid fields
    const validFields = [
      'firstName', 'lastName', 'email', 'address', 'contactNumber', 
      'birthdate', 'specialization', 'degree', 'profilePicture'  // Removed fees from here
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

    // First save the general profile updates
    await user.save();
    
    // Now, if fees was provided, update it directly with a separate update
    if (hasFees) {      
      try {
        // Use the native MongoDB driver to update directly
        const mongoose = require('mongoose');
        const doctorId = user._id.toString();
        
        // Convert to MongoDB ObjectId
        const objectId = new mongoose.Types.ObjectId(doctorId);
        
        // Get direct MongoDB connection and collection
        const db = mongoose.connection.db;
        const collection = userType === 'doctor' ? 'Doctors' : 'Patients';
        
        // Execute direct MongoDB update
        const updateResult = await db.collection(collection).updateOne(
          { _id: objectId },
          { $set: { fees: originalFeeValue.toString() } } // Store as string to preserve exact value
        );
        
      } catch (error) {
      }
      
    }

    // Get the updated user data to ensure it's correct
    const updatedUser = await (userType === 'doctor' ? Doctor : Patient).findById(user._id);
    

    const token = generateToken(updatedUser);

    res.status(200).json({ 
      success: true, 
      message: 'Profile updated successfully.',
      data: updatedUser,
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
