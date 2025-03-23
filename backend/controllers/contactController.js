const Contact = require('../models/Contact');

const submitContact = async (req, res) => {
  try {
    const { name, email, message, phone } = req.body;
    const userId = req.user?._id; // Get userId from authenticated user if available

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and message'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Create new contact message
    const contactMessage = new Contact({
      name,
      email,
      message,
      phone: phone || undefined, // Only include phone if provided
      userId: userId || undefined // Only include userId if user is authenticated
    });

    await contactMessage.save();

    res.status(201).json({
      success: true,
      message: 'Contact message submitted successfully',
      data: contactMessage
    });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit contact form. Please try again later.'
    });
  }
};

module.exports = {
  submitContact
};
