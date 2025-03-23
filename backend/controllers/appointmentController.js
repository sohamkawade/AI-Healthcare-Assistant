const mongoose = require('mongoose');
const appointmentModel = require('../models/Appointment');
const doctorModel = require('../models/Doctor');
const patientModel = require('../models/Patient');
const { generateVideoLink } = require('../utils/videoUtils');
const moment = require('moment');
const Notification = require("../models/Notification");

// Book Appointment API
const bookAppointment = async (req, res) => {
  try {
    // Validate required fields
    const { docId, slotDate, slotTime, consultationType } = req.body;
    
    if (!docId || !slotDate || !slotTime || !consultationType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Check daily appointment limit
    const dailyCount = await appointmentModel.countDocuments({
      patientId: req.user._id,
      slotDate: slotDate,
      status: { $in: ['pending', 'confirmed'] }
    });


    if (dailyCount >= 2) {
      return res.status(400).json({
        success: false,
        message: 'You can only book 2 appointments per day'
      });
    }

    // Verify doctor exists
    const doctor = await doctorModel.findById(docId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Check if slot is already booked
    const existingAppointment = await appointmentModel.findOne({
      docId,
      slotDate,
      slotTime,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }

    // Check if patient already has an appointment at this time
    const patientExistingAppointment = await appointmentModel.findOne({
      patientId: req.user._id,
      slotDate,
      slotTime,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (patientExistingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'You already have an appointment at this time'
      });
    }

    const appointment = new appointmentModel({
      docId,
      patientId: req.user._id,
      slotDate,
      slotTime,
      consultationType,
      status: 'pending'
    });

    const newAppointment = await appointment.save();

    // Create notification for doctor
    await Notification.create({
      recipientId: docId,
      recipientType: 'Doctor',
      type: 'appointment',
      message: `New appointment request from ${req.user.firstName} ${req.user.lastName}`,
      appointmentId: newAppointment._id
    });

    res.status(201).json({
      success: true,
      data: newAppointment
    });
  } catch (error) {
    console.error('Error in bookAppointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to book appointment',
      error: error.message
    });
  }
};

// Get Appointments
const getAppointments = async (req, res) => {
  try {
    const { role, id } = req.query;
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const query = {
      [role === 'doctor' ? 'docId' : 'patientId']: id,
      $or: [
        { status: { $in: ['pending', 'confirmed'] } },
        { status: 'cancelled' },
        { status: 'completed', completedAt: { $gte: oneDayAgo } }
      ]
    };

    const appointments = await appointmentModel.find(query)
      .populate('docId', 'firstName lastName specialization profilePicture')
      .populate('patientId', 'firstName lastName profilePicture')
      .sort({ slotDate: 1, slotTime: 1 });

    res.json({
      success: true,
      data: appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get Doctor's Appointments
const appointmentsDoctor = async (req, res) => {
  try {
    const { docId } = req.params;
    

    // Find all appointments for the doctor, including cancelled ones
    const appointments = await appointmentModel.find({ 
      docId: docId,
      // No status filter - this ensures we get ALL appointments
    })
      .populate('docId', 'firstName lastName specialization profilePicture email contactNumber')
      .populate('patientId', 'firstName lastName contactNumber profilePicture email')
      .sort({ slotDate: 1, slotTime: 1 });

    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor appointments',
      error: error.message
    });
  }
};

// Cancel Appointment
const appointmentCancel = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { reason, cancelledBy, cancelledById, cancellerName } = req.body;

    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    // Check if appointment can be cancelled
    const appointmentTime = new Date(appointment.startTime);
    const now = new Date();
    const timeUntilAppointment = appointmentTime - now;
    const minutesUntilAppointment = timeUntilAppointment / (1000 * 60);

    if (minutesUntilAppointment < 15) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel appointments less than 15 minutes before the scheduled time"
      });
    }

    // Update appointment with cancellation details
    appointment.status = 'cancelled';
    appointment.cancelledBy = cancelledBy;
    appointment.cancelledById = cancelledById;
    appointment.cancelledAt = new Date();
    appointment.cancellerName = cancellerName;
    appointment.cancellationReason = reason;

    // If payment was made, process refund
    if (appointment.paymentStatus === 'paid') {
      appointment.paymentStatus = 'refunded';
      appointment.refundReason = reason;
      appointment.refundDate = new Date();
    }

    await appointment.save();

    // Create notifications for both doctor and patient
    const doctorNotification = new Notification({
      recipientId: appointment.docId,
      type: 'cancelled',
      message: `Appointment with ${appointment.patientId.firstName} ${appointment.patientId.lastName} has been cancelled by ${cancellerName}`,
      appointmentId: appointment._id,
      timestamp: now
    });
    await doctorNotification.save();

    const patientNotification = new Notification({
      recipientId: appointment.patientId,
      type: 'cancelled',
      message: `Appointment with Dr. ${appointment.docId.firstName} ${appointment.docId.lastName} has been cancelled by ${cancellerName}`,
      appointmentId: appointment._id,
      timestamp: now
    });
    await patientNotification.save();

    res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      data: appointment
    });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel appointment",
      error: error.message
    });
  }
};

// Complete Appointment
const appointmentComplete = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { completedBy } = req.body;

    const appointment = await appointmentModel.findById(appointmentId)
      .populate('docId', 'firstName lastName specialization')
      .populate('patientId', 'firstName lastName contactNumber');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if appointment is already completed or cancelled
    if (appointment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'This appointment has already been completed'
      });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot complete a cancelled appointment'
      });
    }

    // Check if the appointment time has passed and 15 minutes have elapsed
    const appointmentDateTime = new Date(appointment.slotDate);
    const [hours, minutes] = appointment.slotTime.split(':');
    appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));
    
    const now = new Date();
    const timeDiffMinutes = (now - appointmentDateTime) / (1000 * 60);

    // If trying to complete before 15 minutes after appointment time
    if (timeDiffMinutes < 15) {
      return res.status(400).json({
        success: false,
        message: 'Cannot complete appointment before 15 minutes have elapsed from the appointment time'
      });
    }

    // Update appointment status
    appointment.status = 'completed';
    appointment.completedAt = now;
    appointment.completedBy = completedBy;
    await appointment.save();

    // Create notification for patient
    const notification = new Notification({
      recipientId: appointment.patientId._id,
      type: 'completed',
      message: `Your appointment with Dr. ${appointment.docId.firstName} ${appointment.docId.lastName} has been completed`,
      appointmentId: appointment._id,
      timestamp: now
    });
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Appointment completed successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Error completing appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete appointment',
      error: error.message
    });
  }
};

const getAvailableSlots = async (req, res) => {
  try {
    const { docId, date } = req.query;
    
    if (!docId || !date || !mongoose.Types.ObjectId.isValid(docId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID or date"
      });
    }

    const doctor = await doctorModel.findById(docId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Convert dates to same format for comparison
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // If selected date is in the past, return no slots
    if (selectedDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid future date'
      });
    }

    // Define fixed slots
    const fixedSlots = ['10:00', '12:00', '14:00', '16:00'];
    
    // Get booked slots for this date
    const bookedAppointments = await appointmentModel.find({
      docId,
      slotDate: date,
      status: { $in: ['pending', 'confirmed'] }
    });


    // Get booked times
    const bookedTimes = bookedAppointments.map(apt => apt.slotTime);

    // Get current time for today's slots
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Filter available slots
    let availableSlots = fixedSlots.filter(slot => {
      // First check if slot is not booked
      if (bookedTimes.includes(slot)) {
        return false;
      }

      // If it's today, check if slot is in the future
      if (selectedDate.getTime() === today.getTime()) {
        const [slotHour, slotMinute] = slot.split(':').map(Number);
        const isFutureSlot = slotHour > currentHour || 
                            (slotHour === currentHour && slotMinute > currentMinute);
        return isFutureSlot;
      }

      // For future dates, include all unbooked slots
      return true;
    });


    return res.status(200).json({
      success: true,
      message: 'Available slots retrieved successfully',
      data: availableSlots
    });
  } catch (error) {
    console.error('Error getting available slots:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get available slots'
    });
  }
};

// Auto-cancel past appointments
const autoCancelPastAppointments = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find all uncancelled and uncompleted appointments in the past
    const pastAppointments = await appointmentModel.find({
      slotDate: { $lt: today },
      status: { $nin: ['cancelled', 'completed'] }
    });

    for (const appointment of pastAppointments) {
      // Mark appointment as cancelled while preserving all required fields
      await appointmentModel.findByIdAndUpdate(appointment._id, { 
        status: 'cancelled',
        cancelledBy: 'system',
        cancelledById: appointment.docId,
        reason: 'Auto-cancelled due to being in the past',
        // Preserve required fields
        docId: appointment.docId,
        patientId: appointment.patientId,
        slotDate: appointment.slotDate,
        slotTime: appointment.slotTime,
        consultationType: appointment.consultationType
      });

      // Remove the slot from doctor's booked slots
      const doctor = await doctorModel.findById(appointment.docId);
      if (doctor) {
        doctor.bookedSlots = doctor.bookedSlots.filter(slot => 
          !(slot.date === appointment.slotDate && slot.time === appointment.slotTime)
        );
        await doctor.save();
      }
    }
  } catch (error) {
    console.error('Error auto-cancelling past appointments:', error);
  }
};

// Run auto-cancel every day at midnight
setInterval(autoCancelPastAppointments, 24 * 60 * 60 * 1000);
// Run once when server starts
autoCancelPastAppointments();

// Auto-delete cancelled appointments after 30 days
const autoDeleteCancelledAppointments = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await appointmentModel.deleteMany({
      status: 'cancelled',
      cancelledAt: { $lt: thirtyDaysAgo }
    });

    // Log deletion count
  } catch (error) {
    console.error('Error in autoDeleteCancelledAppointments:', error);
  }
};

// Schedule the auto-delete function to run daily
setInterval(autoDeleteCancelledAppointments, 24 * 60 * 60 * 1000);

// Run initial cleanup
autoDeleteCancelledAppointments();

// Video consultation handlers
const handleVideoOffer = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { offer } = req.body;
    const userId = req.user._id;

    const appointment = await appointmentModel.findById(appointmentId)
      .populate('doctor', 'firstName lastName')
      .populate('patient', 'firstName lastName');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user is authorized
    if (appointment.doctor._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only doctors can initiate video call'
      });
    }

    // Store offer temporarily (you might want to use Redis in production)
    appointment.videoOffer = offer;
    await appointment.save();

    res.json({
      success: true,
      message: 'Video offer sent successfully'
    });
  } catch (error) {
    console.error('Error handling video offer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to handle video offer'
    });
  }
};

const handleVideoAnswer = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { answer } = req.body;
    const userId = req.user._id;

    const appointment = await appointmentModel.findById(appointmentId)
      .populate('doctor', 'firstName lastName')
      .populate('patient', 'firstName lastName');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user is authorized
    if (appointment.patient._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only patients can answer video call'
      });
    }

    // Store answer temporarily
    appointment.videoAnswer = answer;
    await appointment.save();

    res.json({
      success: true,
      message: 'Video answer sent successfully'
    });
  } catch (error) {
    console.error('Error handling video answer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to handle video answer'
    });
  }
};

const handleIceCandidate = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { candidate } = req.body;
    const userId = req.user._id;

    const appointment = await appointmentModel.findById(appointmentId)
      .populate('doctor', 'firstName lastName')
      .populate('patient', 'firstName lastName');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user is authorized
    const isAuthorized = 
      appointment.doctor._id.toString() === userId.toString() ||
      appointment.patient._id.toString() === userId.toString();

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Store ICE candidate temporarily
    if (!appointment.iceCandidates) {
      appointment.iceCandidates = [];
    }
    appointment.iceCandidates.push(candidate);
    await appointment.save();

    res.json({
      success: true,
      message: 'ICE candidate stored successfully'
    });
  } catch (error) {
    console.error('Error handling ICE candidate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to handle ICE candidate'
    });
  }
};

// Create test appointment
const createTestAppointment = async (req, res) => {
  try {
    const { docId, patientId } = req.body;
    
    // Create a test appointment for today
    const today = new Date();
    const appointment = await appointmentModel.create({
      docId: docId,
      patientId: patientId,
      slotDate: today.toISOString().split('T')[0],
      slotTime: '14:00',
      consultationType: 'video',
      status: 'pending'
    });

    const populatedAppointment = await appointmentModel.findById(appointment._id)
      .populate('docId', 'firstName lastName specialization profilePicture')
      .populate('patientId', 'firstName lastName contactNumber profilePicture');

    res.status(201).json({
      success: true,
      message: 'Test appointment created successfully',
      data: populatedAppointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create test appointment',
      error: error.message
    });
  }
};

const getPaymentHistory = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming user ID is available from auth middleware

        const appointments = await appointmentModel.find({
            $or: [
                { patientId: userId },
                { docId: userId }
            ]
        })
        .populate('docId', 'firstName lastName')
        .populate('patientId', 'firstName lastName')
        .sort({ paymentDate: -1 });

        // Filter appointments that have payment information
        const paymentHistory = appointments.filter(appointment => 
            appointment.paymentStatus && appointment.consultationFee
        );

        res.status(200).json({
            success: true,
            data: paymentHistory
        });
    } catch (error) {
        console.error("Error fetching payment history:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch payment history",
            error: error.message
        });
    }
};

// Get patient's daily appointment count
const getPatientDailyAppointmentCount = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { date } = req.query;

    if (!patientId || !date) {
      return res.status(400).json({
        success: false,
        message: "Patient ID and date are required"
      });
    }

    const count = await appointmentModel.countDocuments({
      patientId,
      slotDate: date,
      status: { $in: ['pending', 'confirmed'] }
    });

    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    console.error("Error getting patient daily appointment count:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get appointment count",
      error: error.message
    });
  }
};

const checkTimeSlotAvailability = async (req, res) => {
  try {
    const { patientId, date, time } = req.query;
    

    if (!patientId || !date || !time || !mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient ID, date, or time"
      });
    }

    // Check if patient has any appointment at this time slot
    const existingAppointment = await appointmentModel.findOne({
      patientId: new mongoose.Types.ObjectId(patientId),
      slotDate: date,
      slotTime: time,
      status: { $in: ['pending', 'confirmed'] }
    }).populate('docId', 'firstName lastName');

    let message = "Time slot is available";
    if (existingAppointment) {
      message = `You already have an appointment with Dr. ${existingAppointment.docId.firstName} ${existingAppointment.docId.lastName} at ${time} on ${date}`;
    }

    return res.status(200).json({
      success: true,
      hasAppointment: !!existingAppointment,
      message: message
    });

  } catch (error) {
    console.error("Error checking time slot availability:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to check time slot availability",
      error: error.message
    });
  }
};

module.exports = {
  bookAppointment,
  getAppointments,
  appointmentsDoctor,
  appointmentCancel,
  appointmentComplete,
  getAvailableSlots,
  autoCancelPastAppointments,
  autoDeleteCancelledAppointments,
  handleVideoOffer,
  handleVideoAnswer,
  handleIceCandidate,
  createTestAppointment,
  getPaymentHistory,
  getPatientDailyAppointmentCount,
  checkTimeSlotAvailability
};
