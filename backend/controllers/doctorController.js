const Doctor = require('../models/Doctor');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateToken } = require("../utils/generateToken");
// Register a new doctor
module.exports.registerDoctor = async (req, res) => {
  try {
    const { email, password, firstName, lastName, contactNumber, specialization, licenseNumber } = req.body;
    if (!email || !password || !firstName || !lastName || !contactNumber || !specialization || !licenseNumber) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long and include both letters and numbers.',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format.' });
    }

    const contactNumberRegex = /^[0-9]{10}$/;
    if (!contactNumberRegex.test(contactNumber)) {
      return res.status(400).json({ success: false, message: 'Contact number must be a 10-digit number.' });
    }

    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({ success: false, message: 'Email is already registered.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create and save new doctor
    const newDoctor = new Doctor({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      contactNumber,
      specialization,
      licenseNumber,
    });
    const savedDoctor = await newDoctor.save();

    const token = generateToken(newDoctor);
    res.cookie("token", token, { httpOnly: true });

    res.status(201).json({
      success: true,
      message: 'Doctor registered successfully.',
      token,
    });
  } catch (error) {
    console.error('Error in doctor registration:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration.',
    });
  }
};

// Forgot Password
module.exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    const resetToken = jwt.sign({ doctorId: doctor._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await sendEmail(email, 'Password Reset', `Click the link to reset your password: ${resetLink}`);

    res.status(200).json({
      success: true,
      message: 'Password reset link sent successfully.',
    });
  } catch (error) {
    console.error('Error in forgot password:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating password reset link.',
    });
  }
};

module.exports.addPredefinedTimeSlotsForMultipleDoctors = async (req, res) => {
  const { doctors } = req.body;
  try {
    if (!Array.isArray(doctors) || doctors.length === 0) {
      return res.status(400).json({ message: 'Doctors array is required and cannot be empty.' });
    }

    for (const doctorData of doctors) {
      const { doctorId, timeSlots } = doctorData;

      const doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        console.warn(`Doctor with ID ${doctorId} not found. Skipping.`);
        continue;
      }

      for (const slot of timeSlots) {
        const { date, startTime, endTime } = slot;

        const timeSlot = new TimeSlot({
          doctor: doctor._id,
          date: new Date(date),
          startTime: new Date(`${date}T${startTime}:00`),
          endTime: new Date(`${date}T${endTime}:00`),
          isBooked: false,
          status: 'Available',
        });

        await timeSlot.save();
        console.log(`Time slot added for doctor ${doctorId}: ${startTime} to ${endTime} on ${date}`);
      }
    }

    res.status(200).json({ message: 'Predefined time slots added successfully for all doctors.' });
  } catch (error) {
    console.error('Error adding time slots:', error.message);
    res.status(500).json({ message: 'Error adding time slots', error: error.message });
  }
};


// Get doctors with pagination and filtering by specialization
module.exports.getDoctors = async (req, res) => {
  try {
    const { page = 1, limit = 10, specialization } = req.query;

    const skip = (page - 1) * limit;

    let query = {};
    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }

    const doctors = await Doctor.find(query)
      .skip(skip)
      .limit(limit)
      .select('-password');

    const totalDoctors = await Doctor.countDocuments(query);
    return res.status(200).json({
      success: true,
      message: 'Doctors fetched successfully.',
      data: doctors,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalDoctors / limit),
        totalDoctors,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching doctors.',
    });
  }
};

