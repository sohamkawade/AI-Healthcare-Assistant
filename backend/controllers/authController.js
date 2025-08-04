const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/User');

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    let user = await Patient.findOne({ email });
    let userType = 'patient';

    if (!user) {
      user = await Doctor.findOne({ email });
      userType = 'doctor';
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      text: `Hello ${userType},

Please click the link below to reset your password:

${resetUrl}

If you didn't request this, please ignore this email.

Thanks, 
Healthcare Assistant Team`
    });

    res.status(200).json({ success: true, message: 'Password reset link sent to your email.' });

  } catch (error) {
    console.error("Error in forgot password:", error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    let user = await Patient.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } }) ||
               await Doctor.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token.' });
    }

    // Update password
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successful. You can now log in with your new password.' });

  } catch (error) {
    console.error("Error in reset password:", error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const registerDoctor = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      contactNumber,
      fees,
      degree,
      specialization,
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !contactNumber || !fees || !degree || !specialization) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if user already exists in Users collection
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // Check if user is already a doctor
      const existingDoctor = await Doctor.findOne({ email });
      if (existingDoctor) {
        return res.status(400).json({
          success: false,
          message: "Email is already registered as a doctor",
        });
      }
      
      // If user exists but is not a doctor, update their role
      existingUser.role = "doctor";
      await existingUser.save();
    }

    // Check if doctor already exists
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered as a doctor",
      });
    }

    // Handle profile picture upload
    let profilePicture = "/uploads/default-avatar.png";
    if (req.file) {
      profilePicture = req.file.path;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new doctor
    const doctor = new Doctor({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      contactNumber,
      fees,
      degree,
      specialization,
      profilePicture,
    });

    await doctor.save();

    // Generate token
    const token = generateToken(doctor);

    res.status(201).json({
      success: true,
      message: "Doctor registered successfully",
      data: {
        token,
        doctor: {
          _id: doctor._id,
          firstName: doctor.firstName,
          lastName: doctor.lastName,
          email: doctor.email,
          specialization: doctor.specialization,
          profilePicture: doctor.profilePicture,
        },
      },
    });
  } catch (error) {
    console.error("Doctor registration error:", error);
    res.status(500).json({
      success: false,
      message: "Error registering doctor",
      error: error.message,
    });
  }
};

module.exports = {
  forgotPassword,
  resetPassword,
  registerDoctor
};

