// controllers/doctorController.js
const Doctor = require('../models/Doctor');
const bcrypt = require('bcryptjs');
const path = require('path');
const { generateToken } = require("../utils/generateToken");


const registerDoctor = async (req, res) => {
  try {

    const { email, password, firstName, lastName, contactNumber, specialization, fees, degree } = req.body;

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'Profile picture is required' 
      });
    }

    // Validate required fields
    if (![email, password, firstName, lastName, contactNumber, specialization, fees, degree].every(Boolean)) {

      return res.status(400).json({ 
        success: false, 
        message: 'Please fill in all required fields: First Name, Last Name, Email, Password, Contact Number, Specialization, Fees, and Degree.' 
      });
    }

    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({ success: false, message: 'Email is already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Store the file path relative to the uploads directory
    const profilePicturePath = `/uploads/${req.file.filename}`;

    const doctor = await Doctor.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      contactNumber,
      fees,
      degree,
      specialization,
      profilePicture: profilePicturePath,
      isActive: true,
      available: true
    });


    // Generate token
    const token = generateToken(doctor);
    res.cookie("token", token, { httpOnly: true });

    res.status(201).json({
      success: true,
      message: 'Doctor registered successfully',
      data: {
        id: doctor._id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        email: doctor.email,
        contactNumber: doctor.contactNumber,
        fees: doctor.fees,
        degree: doctor.degree,
        specialization: doctor.specialization,
        profilePicture: doctor.profilePicture,
        token
      }
    });
  } catch (error) {
    console.error('Error in registerDoctor:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error during registration.' 
    });
  }
};

const getDoctors = async (req, res) => {
  try {
    const { page = 1, limit = 10, specialization } = req.query;
    const skip = (page - 1) * limit;

    const query = specialization ? { specialization: { $regex: specialization, $options: 'i' } } : {};

    // Log the total count before applying pagination
    const totalCount = await Doctor.countDocuments(query);

    const doctors = await Doctor.find(query).skip(skip).limit(parseInt(limit)).select('-password');


    const totalDoctors = await Doctor.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Doctors fetched successfully.',
      data: doctors,
      pagination: { currentPage: page, totalPages: Math.ceil(totalDoctors / limit), totalDoctors, limit: parseInt(limit) },
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ success: false, message: 'Error fetching doctors.' });
  }
};

const updateDoctorAvailability = async (req, res) => {
    try {
        const { docId, slotDate, slotTime, isAvailable } = req.body;
        
        // Update the doctor's availability for the specific time slot
        const doctor = await Doctor.findById(docId);
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        // If the doctor doesn't have a bookedSlots array, create it
        if (!doctor.bookedSlots) {
            doctor.bookedSlots = [];
        }

        if (!isAvailable) {
            // Add the slot to bookedSlots
            doctor.bookedSlots.push({
                date: slotDate,
                time: slotTime
            });
        } else {
            // Remove the slot from bookedSlots
            doctor.bookedSlots = doctor.bookedSlots.filter(
                slot => !(slot.date === slotDate && slot.time === slotTime)
            );
        }

        // Save the updated doctor
        await doctor.save();

        res.status(200).json({
            success: true,
            message: 'Doctor availability updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating doctor availability'
        });
    }
};

module.exports = {
    registerDoctor,
    getDoctors,
    updateDoctorAvailability
};
