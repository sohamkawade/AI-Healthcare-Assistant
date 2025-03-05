const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

module.exports.forgotPassword = async (req, res) => {
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

If you didn’t request this, please ignore this email.

Thanks, 
Healthcare Assistant Team`
    });

    res.status(200).json({ success: true, message: 'Password reset link sent to your email.' });

  } catch (error) {
    console.error("Error in forgot password:", error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

module.exports.resetPassword = async (req, res) => {
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

