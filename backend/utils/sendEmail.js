const nodemailer = require('nodemailer');

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.verify(function(error, success) {
  if (error) {
    process.exit(1);
  }
});

const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: {
      name: 'AI Healthcare Assistant',
      address: process.env.EMAIL_USER
    },
    to: email,
    subject: 'Secure Access Code - AI Healthcare Assistant',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #2c5282;">AI Healthcare Assistant</h2>
          <p style="color: #718096; font-size: 16px;">Your Trusted Healthcare Partner</p>
        </div>
        
        <div style="background-color: #f7fafc; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h3 style="color: #2d3748; margin-bottom: 15px;">Verification Code</h3>
          <p style="margin-bottom: 20px;">For your security, we require verification of your account. Please use the following code:</p>
          <div style="background-color: #fff; padding: 15px; border-radius: 6px; text-align: center; font-size: 24px; letter-spacing: 8px; font-weight: bold; color: #2c5282; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #718096; font-size: 14px;">This code will expire in 10 minutes for security purposes.</p>
        </div>

        <div style="color: #718096; font-size: 14px; text-align: center; margin-top: 30px;">
          <p>If you didn't request this code, please ignore this email or contact support if you have concerns.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p>© ${new Date().getFullYear()} AI Healthcare Assistant. All rights reserved.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    return false;
  }
};

module.exports = { sendOTPEmail }; 