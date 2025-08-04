const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
    }, 
  },
  { timestamps: true }
);

module.exports = mongoose.model('Contact', contactSchema, 'Contacts'); 

