const nodemailer = require('nodemailer');

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendSubscriptionEmail = async (email, subject, html) => {
  const mailOptions = {
    from: `"AI Healthcare Assistant" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: subject,
    html: html
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending subscription email:', error);
    return false;
  }
};

module.exports = {
  sendSubscriptionEmail
}; 