const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports like 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Test email configuration
const testEmailConfig = async () => {
  try {
    await transporter.verify();
    return true;
  } catch (error) {
    return false;
  }
};

// Forgot Password Controller
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email configuration
    const isEmailConfigValid = await testEmailConfig();
    if (!isEmailConfigValid) {
      return res.status(500).json({
        success: false,
        message: 'Email service is not properly configured',
      });
    }

    // Check if user exists in Doctor or Patient collection
    const doctor = await Doctor.findOne({ email });
    const patient = await Patient.findOne({ email });

    if (!doctor && !patient) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Generate OTP
    const otp = generateOTP();

    // Find user in User collection or create if missing
    let user = await User.findOne({ email });
    if (!user) {
      const existingPassword = doctor?.password || patient?.password || 'defaultPassword123';

      user = new User({
        email,
        password: existingPassword, // Assign a default password if missing
        role: doctor ? 'doctor' : 'patient',
      });

      await user.save();
    }

    // Set OTP and save
    user.setOTP(otp);
    await user.save();

    // Email configuration
    const mailOptions = {
      from: `"AI Healthcare Assistant" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'AI Healthcare Assistant - Password Reset Request',
      html: `<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header Section -->
          <div style="text-align: center; margin-bottom: 30px; padding: 20px 0; border-bottom: 2px solid #E5E7EB;">
            <h1 style="color: #4F46E5; margin: 0; font-size: 28px; font-weight: 600;">AI Healthcare Assistant</h1>
            <p style="color: #6B7280; margin-top: 10px; font-size: 16px;">Your Trusted Healthcare Partner</p>
          </div>
          
          <!-- Main Content Section -->
          <div style="background-color: #F8FAFC; padding: 30px; border-radius: 12px; margin: 20px 0; text-align: center;">
            <h2 style="color: #1F2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Password Reset Request</h2>
            <p style="color: #4B5563; margin: 0 0 25px 0; font-size: 16px; line-height: 1.6;">
              Dear Valued User,<br><br>
              We received a request to reset your password for your AI Healthcare Assistant account. To ensure the security of your healthcare information, please use the following OTP to proceed with the password reset:
            </p>
            
            <!-- OTP Display Box -->
            <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; display: inline-block; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border: 2px solid #E5E7EB;">
              <h1 style="color: #4F46E5; font-size: 36px; letter-spacing: 8px; margin: 0; font-family: '', monospace; font-weight: 800;">${otp}</h1>
            </div>

            <!-- Security Information -->
            <div style="margin-top: 30px; text-align: left; background-color: #FEF2F2; padding: 20px; border-radius: 8px; border-left: 4px solid #EF4444;">
              <h3 style="color: #991B1B; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">Important Security Information</h3>
              <ul style="margin: 0; padding-left: 20px; color: #7F1D1D;">
                <li style="margin-bottom: 8px;">This OTP will expire in 10 minutes for your security</li>
                <li style="margin-bottom: 8px;">If you didn't request this password reset, please contact our support team immediately</li>
                <li style="margin-bottom: 8px;">Never share this OTP with anyone, including healthcare staff</li>
                <li style="margin-bottom: 8px;">Our team will never ask for your OTP or password</li>
              </ul>
            </div>
          </div>

          <!-- Support Section -->
          <div style="background-color: #EEF2FF; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: left;">
            <h3 style="color: #4F46E5; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">Need Help?</h3>
            <p style="color: #4B5563; margin: 0 0 15px 0; font-size: 14px;">
              If you're having trouble resetting your password or have any concerns about your account security, our support team is here to help:
            </p>
            <ul style="margin: 0; padding-left: 20px; color: #4B5563;">
              <li style="margin-bottom: 8px;">📞 Call us: +1 (555) 123-4567</li>
              <li style="margin-bottom: 8px;">✉️ Email: support@aihealthcare.com</li>
              <li style="margin-bottom: 8px;">⏰ Hours: Monday - Friday, 9:00 AM - 6:00 PM EST</li>
            </ul>
          </div>

          <!-- Footer Section -->
          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #E5E7EB; text-align: center;">
            <p style="color: #6B7280; font-size: 14px; margin: 0 0 10px 0;">
              This is an automated message from AI Healthcare Assistant. Please do not reply to this email.
            </p>
            <div style="margin-top: 15px;">
              <a href="#" style="color: #4F46E5; text-decoration: none; margin: 0 10px; font-size: 14px;">Privacy Policy</a>
              <span style="color: #D1D5DB;">|</span>
              <a href="#" style="color: #4F46E5; text-decoration: none; margin: 0 10px; font-size: 14px;">Terms of Service</a>
            </div>
          </div>
        </div>`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process forgot password request',
      error: error.message,
    });
  }
};



// Verify OTP Controller
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify OTP
    const isValid = user.verifyOTP(otp);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully'
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to verify OTP'
    });
  }
};

// Reset Password Controller
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify OTP
    const isValid = user.verifyOTP(otp);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password in User collection
    user.password = hashedPassword;
    user.clearOTP();
    await user.save();

    // Update password in role-specific collection
    if (user.role === 'doctor') {
      await Doctor.findOneAndUpdate(
        { email },
        { password: hashedPassword }
      );
    } else {
      await Patient.findOneAndUpdate(
        { email },
        { password: hashedPassword }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to reset password'
    });
  }
}; 

module.exports = {
    forgotPassword,
    verifyOTP,
    resetPassword
};