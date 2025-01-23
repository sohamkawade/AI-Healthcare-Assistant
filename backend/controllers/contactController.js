const Contact = require('../models/Contact');

const createContactMessage = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required.',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format.',
      });
    }

    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must be a 10-digit number.',
      });
    }

    const newContact = new Contact({
      name,
      email,
      phone,
      message,
      userId: req.user.id, 
    });

    await newContact.save();

    res.status(201).json({
      success: true,
      message: 'Message sent successfully.',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

module.exports = { createContactMessage };
