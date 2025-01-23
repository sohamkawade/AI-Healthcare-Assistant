const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const { generateToken } = require("../utils/generateToken");

module.exports.getProfile = async (req, res) => {
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
