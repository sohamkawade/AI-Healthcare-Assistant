const mongoose = require('mongoose');
const appointmentModel = require('../models/Appointment');
const doctorModel = require('../models/Doctor');
const userModel = require('../models/Patient'); // Assuming you have a User model

// Book Appointment API
const bookAppointment = async (req, res) => {
  try {
    // Destructuring data from the request body
    const { userId, docId, slotDate, slotTime } = req.body;

    // Validate that all required fields are present
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }
    if (!docId) {
      return res.status(400).json({ success: false, message: 'Doctor ID is required' });
    }
    if (!slotDate) {
      return res.status(400).json({ success: false, message: 'Slot date is required' });
    }
    if (!slotTime) {
      return res.status(400).json({ success: false, message: 'Slot time is required' });
    }

    // Check if the doctor ID is valid
    if (!mongoose.Types.ObjectId.isValid(docId)) {
      return res.status(400).json({ success: false, message: 'Invalid doctor ID' });
    }
    
    // Find doctor by ID
    const docData = await doctorModel.findById(docId).select('-password');
    
    // If doctor not found, return 404 response
    if (!docData) {
      console.log(`Doctor not found for id: ${docId}`);
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Check if the doctor is available
    if (!docData.available) {
      return res.status(400).json({ success: false, message: 'Doctor not available' });
    }

    // Checking if the slot is already booked
    let slots_booked = docData.slots_booked || {};
    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) {
        return res.status(400).json({ success: false, message: 'Slot Not Available' });
      } else {
        // If slot is available, add the new slot
        slots_booked[slotDate].push(slotTime);
      }
    } else {
      // If no slots for the given date, create a new entry for the date
      slots_booked[slotDate] = [slotTime];
    }

    // Find the user by ID and exclude password field
    const userData = await userModel.findById(userId).select('-password');
    
    // If user not found, return 404 response
    if (!userData) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Remove the 'slots_booked' field from docData before sending it to the frontend
    delete docData.slots_booked;

    const appointmentData = {
      userId,
      docId,
      patient: userData, 
      doctor: docData,  
      amount: docData.fees,
      slotTime,
      slotDate,
      date: Date.now()
    };

    // Create a new appointment instance and save it to the database
    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    // Update the doctor's available slots
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    // Return success response
    res.json({ success: true, message: 'Appointment booked successfully' });

  } catch (error) {
    console.error('Error booking appointment:', error);
    
    // Check if the error is due to missing doctor or user
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid data format' });
    }
    
    // General server error response
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};

// API to get doctor appointments
const appointmentsDoctor = async (req, res) => {
  try {
    const { docId } = req.body;

    // Validate doctor ID
    if (!mongoose.Types.ObjectId.isValid(docId)) {
      return res.status(400).json({ success: false, message: 'Invalid doctor ID' });
    }

    const doctor = await doctorModel.findById(docId);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    const appointments = await appointmentModel
      .find({ doctor: docId, cancelled: false })
      .populate('patient', 'firstName lastName email contactNumber')
      .sort({ slotDate: 1, slotTime: 1 });

    res.status(200).json({ success: true, appointments });

  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to cancel an appointment
const appointmentCancel = async (req, res) => {
  try {
    const { docId, appointmentId } = req.body;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(docId) || !mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({ success: false, message: 'Invalid doctor or appointment ID' });
    }

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (appointmentData && appointmentData.doctor.toString() === docId && !appointmentData.cancelled) {
      await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });
      return res.status(200).json({ success: true, message: 'Appointment Cancelled' });
    }

    res.status(400).json({ success: false, message: 'Appointment not found or already cancelled' });

  } catch (error) {
    console.error('Error canceling appointment:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to mark appointment as completed
const appointmentComplete = async (req, res) => {
  try {
    const { docId, appointmentId } = req.body;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(docId) || !mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({ success: false, message: 'Invalid doctor or appointment ID' });
    }

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (appointmentData && appointmentData.doctor.toString() === docId && !appointmentData.isCompleted) {
      await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true });
      return res.status(200).json({ success: true, message: 'Appointment Completed' });
    }

    res.status(400).json({ success: false, message: 'Appointment not found or already completed' });

  } catch (error) {
    console.error('Error completing appointment:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  bookAppointment,
  appointmentCancel,
  appointmentComplete,
  appointmentsDoctor,
};
