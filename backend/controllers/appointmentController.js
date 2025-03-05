const Appointment = require('../models/Appointment');
const mongoose = require('mongoose');

// Schedule Appointment
const parseTimeToDate = (date, time) => {
  const [timePart, period] = time.split(' '); 
  const [hours, minutes] = timePart.split(':'); 

  const parsedDate = new Date(date); // Base date
  let hour = parseInt(hours);

  // Convert to 24-hour format
  if (period === 'PM' && hour !== 12) {
    hour += 12;
  } else if (period === 'AM' && hour === 12) {
    hour = 0;
  }

  parsedDate.setHours(hour);
  parsedDate.setMinutes(parseInt(minutes));
  parsedDate.setSeconds(0);

  return parsedDate;
};

exports.scheduleAppointment = async (req, res) => {
  try {
    const { date, appointmentType, doctor, patient, status } = req.body;

    // Validate required fields
    if (!date || !appointmentType || !doctor || !patient) {
      return res.status(400).json({
        success: false,
        message: 'All fields (date, appointmentType, doctor, patient) are required.',
      });
    }

    // Convert date string to Date object
    const appointmentDate = new Date(date);
    if (isNaN(appointmentDate)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Please provide a valid date.',
      });
    }

    // Fetch available time slots based on the selected date and doctor
    const timeSlots = await TimeSlot.find({
      doctor,
      date: appointmentDate.toISOString().split('T')[0], // Compare only the date part
      isBooked: false,  // Only fetch unbooked slots
    });

    if (timeSlots.length === 0) {
      return res.status(404).json({ success: false, message: 'No available time slots for the selected date.' });
    }

    // Allow the patient to select one of the available time slots (assuming the front-end will pass this time)
    const selectedTimeSlot = req.body.selectedTimeSlot;  // You need to get this from the patient interface

    if (!selectedTimeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Please select a time slot for your appointment.',
      });
    }

    // Find the selected time slot
    const timeSlotObj = timeSlots.find(slot => slot.startTime === selectedTimeSlot);

    if (!timeSlotObj) {
      return res.status(404).json({ success: false, message: 'Time slot not found for the selected time.' });
    }

    // Convert time string to Date object
    const startDateTime = parseTimeToDate(appointmentDate, timeSlotObj.startTime);
    const endDateTime = parseTimeToDate(appointmentDate, timeSlotObj.endTime);

    // Create the new appointment
    const newAppointment = new Appointment({
      date: appointmentDate,
      timeSlot: timeSlotObj._id,  // Save the TimeSlot reference (ObjectId)
      appointmentType,
      doctor,
      patient,
      startTime: startDateTime,
      endTime: endDateTime,
      status: status || 'Scheduled',  
    });

    // Save the new appointment
    await newAppointment.save();

    // Mark the time slot as booked
    timeSlotObj.isBooked = true;
    timeSlotObj.patient = patient;
    await timeSlotObj.save();

    res.status(201).json({
      success: true,
      message: 'Appointment scheduled successfully.',
      appointment: newAppointment,
    });
  } catch (error) {
    console.error('Error scheduling appointment:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while scheduling the appointment.',
      error: error.message,
    });
  }
};


// Get Available Time Slots
exports.getAvailableTimeSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({ success: false, message: 'Doctor ID and Date are required.' });
    }

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ success: false, message: 'Invalid Doctor ID format.' });
    }

    const doctorObjectId = new mongoose.Types.ObjectId(doctorId);

    const appointmentDate = new Date(date);
    const startOfDay = new Date(appointmentDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(appointmentDate.setHours(23, 59, 59, 999));

    const availableTimeSlots = await TimeSlot.find({
      doctor: doctorObjectId,
      date: { $gte: startOfDay, $lte: endOfDay },
      isBooked: false,
    }).populate('doctor', 'firstName lastName specialization');

    if (availableTimeSlots.length === 0) {
      return res.status(404).json({ success: false, message: 'No available time slots found.' });
    }

    res.status(200).json({ success: true, availableTimeSlots });
  } catch (error) {
    console.error('Error fetching available time slots:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch available time slots.', error: error.message });
  }
};


// Get all appointments for a patient
exports.getPatientAppointments = async (req, res) => {
  try {
    const { patientId } = req.query;

    if (!patientId) {
      return res.status(400).json({ success: false, message: 'Patient ID is required.' });
    }

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ success: false, message: 'Invalid Patient ID format.' });
    }

    const patientAppointments = await Appointment.find({ patient: patientId })
      .populate('doctor', 'name specialty')  // Optionally populate doctor details
      .populate('timeSlot', 'startTime endTime')  // Optionally populate time slot details
      .sort({ date: -1 }); // Sort by date, descending

    if (patientAppointments.length === 0) {
      return res.status(404).json({ success: false, message: 'No appointments found for this patient.' });
    }

    res.status(200).json({ success: true, patientAppointments });
  } catch (error) {
    console.error('Error fetching patient appointments:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch patient appointments.', error: error.message });
  }
};

exports.getDoctorAppointments = async (req, res) => {
  try {
    const { doctorId } = req.query;

    if (!doctorId) {
      return res.status(400).json({ success: false, message: 'Doctor ID is required.' });
    }

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ success: false, message: 'Invalid Doctor ID format.' });
    }

    const doctorAppointments = await Appointment.find({ doctor: doctorId })
      .populate('patient', 'name email') // Optionally populate patient details
      .populate('timeSlot', 'startTime endTime')  // Optionally populate time slot details
      .sort({ date: -1 }); // Sort by date, descending

    if (doctorAppointments.length === 0) {
      return res.status(404).json({ success: false, message: 'No appointments found for this doctor.' });
    }

    res.status(200).json({ success: true, doctorAppointments });
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch doctor appointments.', error: error.message });
  }
};


