const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticate } = require('../middlewares/authMiddleware');
const Appointment = require('../models/Appointment');
const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');


router.post("/:id/pay", authenticate, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    appointment.status = "completed";
    appointment.paymentStatus = "paid";
    await appointment.save();

    res.json({ success: true, message: "Payment successful!", appointment });
  } catch (error) {
    console.error("Payment API Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Check time slot availability (place this route before any routes with :id parameter)
router.get('/check-timeslot', authenticate, appointmentController.checkTimeSlotAvailability);

// Book appointment
router.post('/book', authenticate, appointmentController.bookAppointment);

// Get appointments
router.get('/', authenticate, appointmentController.getAppointments);

// Get doctor's appointments
router.get('/doctor/:docId', authenticate, appointmentController.appointmentsDoctor);

// Get available slots
router.get('/available-slots', authenticate, appointmentController.getAvailableSlots);

// Get patient's daily appointment count
router.get('/patient/:patientId/daily-count', authenticate, appointmentController.getPatientDailyAppointmentCount);

// Get Patient's Appointments API
router.get('/patient/:patientId', authenticate, async (req, res) => {
  try {
    const { patientId } = req.params;
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);


    // Convert patientId to ObjectId
    const objectIdPatientId = new mongoose.Types.ObjectId(patientId);

    const query = {
      patientId: objectIdPatientId,
      $or: [
        // Show all pending and confirmed appointments
        { status: { $in: ['pending', 'confirmed'] } },
        // Show cancelled and completed appointments from last 24 hours
        {
          status: { $in: ['cancelled', 'completed'] },
          $or: [
            { cancelledAt: { $gte: oneDayAgo } },
            { completedAt: { $gte: oneDayAgo } },
            // Include appointments that were cancelled/completed today
            {
              updatedAt: {
                $gte: new Date(now.setHours(0, 0, 0, 0)),
                $lte: new Date(now.setHours(23, 59, 59, 999))
              }
            }
          ]
        }
      ]
    };


    const appointments = await Appointment.find(query)
      .populate('docId', 'firstName lastName specialization profilePicture email contactNumber')
      .populate('patientId', 'firstName lastName contactNumber profilePicture email')
      .sort({ updatedAt: -1, slotDate: 1, slotTime: 1 });


    res.json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    console.error("Error fetching patient appointments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch appointments",
      error: error.message,
    });
  }
});

// Get Doctor's Appointments API
router.get('/doctor/:doctorId', authenticate, async (req, res) => {
  try {
    const { doctorId } = req.params;
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // Convert doctorId to ObjectId
    const objectIdDoctorId = new mongoose.Types.ObjectId(doctorId);

    // Modified query to show cancelled appointments only from last 24 hours
    const query = {
      docId: objectIdDoctorId,
      $or: [
        // Show all pending and confirmed appointments
        { status: { $in: ['pending', 'confirmed'] } },
        // Show cancelled and completed appointments from last 24 hours
        {
          status: { $in: ['cancelled', 'completed'] },
          $or: [
            { cancelledAt: { $gte: oneDayAgo } },
            { completedAt: { $gte: oneDayAgo } },
            // Include appointments that were cancelled/completed today
            {
              updatedAt: {
                $gte: new Date(now.setHours(0, 0, 0, 0)),
                $lte: new Date(now.setHours(23, 59, 59, 999))
              }
            }
          ]
        }
      ]
    };


    // Get filtered appointments
    const appointments = await Appointment.find(query)
      .populate('docId', 'firstName lastName specialization profilePicture email contactNumber')
      .populate('patientId', 'firstName lastName contactNumber profilePicture email')
      .sort({ updatedAt: -1, slotDate: 1, slotTime: 1 });

    // Debug logging for cancelled appointments
    const cancelledAppointments = appointments.filter(apt => apt.status === 'cancelled');

    res.json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    console.error("Error fetching doctor appointments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch appointments",
      error: error.message,
    });
  }
});

// Add a new route to clean up old appointments
router.delete('/cleanup', authenticate, async (req, res) => {
  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Only delete completed appointments after 24 hours
    // Keep cancelled appointments for 30 days
    const result = await Appointment.deleteMany({
      $or: [
        { status: 'completed', updatedAt: { $lt: oneDayAgo } },
        { status: 'cancelled', updatedAt: { $lt: thirtyDaysAgo } }
      ]
    });

    res.json({
      success: true,
      message: `Cleaned up ${result.deletedCount} old appointments`,
    });
  } catch (error) {
    console.error("Error cleaning up appointments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clean up appointments",
      error: error.message
    });
  }
});

// Video consultation routes
router.post('/:appointmentId/video-offer', authenticate, appointmentController.handleVideoOffer);
router.post('/:appointmentId/video-answer', authenticate, appointmentController.handleVideoAnswer);
router.post('/:appointmentId/ice-candidate', authenticate, appointmentController.handleIceCandidate);

// Get active video consultation for the current user
router.get('/active-video-consultation', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const userType = req.user.role;

    // Find the most recent video consultation for the current user
    const appointment = await Appointment.findOne({
      consultationType: 'video',
      status: { $in: ['pending', 'confirmed'] },
      [userType === 'doctor' ? 'docId' : 'patientId']: userId,
      isTestAppointment: false
    })
    .populate('docId', 'firstName lastName specialization profilePicture')
    .populate('patientId', 'firstName lastName contactNumber profilePicture')
    .sort({ slotDate: -1, slotTime: -1 });

    if (!appointment) {
      // Create a test appointment if none exists
      const testAppointment = await Appointment.create({
        docId: userId,
        patientId: userId, // Use same user ID for testing
        slotDate: new Date().toISOString().split('T')[0],
        slotTime: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        consultationType: 'video',
        status: 'confirmed',
        isTestAppointment: true,
        webrtcOffer: null,
        webrtcAnswer: null,
        iceCandidates: [],
        callEnded: false,
        endedBy: null,
        lastUpdated: new Date()
      });

      const populatedAppointment = await Appointment.findById(testAppointment._id)
        .populate('docId', 'firstName lastName specialization profilePicture')
        .populate('patientId', 'firstName lastName contactNumber profilePicture');

      return res.json({
        success: true,
        data: populatedAppointment
      });
    }

    // Return appointment data
    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Error getting active video consultation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get active video consultation',
      error: error.message
    });
  }
});

// Cancel Appointment API
router.post('/cancel/:appointmentId', authenticate, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { reason, cancelledBy, cancelledById } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    // Check if appointment can be cancelled
    const appointmentDateTime = new Date(appointment.slotDate);
    const [hours, minutes] = appointment.slotTime.split(':');
    appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));
    
    const now = new Date();
    if (appointmentDateTime < now) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel past appointments"
      });
    }

    const timeUntilAppointment = appointmentDateTime - now;
    const hoursUntilAppointment = timeUntilAppointment / (1000 * 60 * 60);

    if (hoursUntilAppointment < 1) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel appointments less than 1 hour before the scheduled time"
      });
    }

    // Update appointment with cancellation details
    appointment.status = 'cancelled';
    appointment.cancelledBy = cancelledBy;
    appointment.cancelledById = cancelledById;
    appointment.cancelledAt = new Date();
    appointment.reason = reason;

    // If payment was made, process refund
    if (appointment.paymentStatus === 'paid') {
      appointment.paymentStatus = 'refunded';
      appointment.refundReason = reason;
      appointment.refundDate = new Date();
    }

    await appointment.save();

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
});

// Complete Appointment API
router.post('/complete/:appointmentId', authenticate, appointmentController.appointmentComplete);

// Confirm Appointment after Payment API
router.post('/:appointmentId/confirm', authenticate, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot confirm a cancelled appointment'
      });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Appointment is already completed'
      });
    }

    // Update appointment status
    appointment.status = 'confirmed';
    appointment.paymentStatus = 'paid';
    appointment.confirmedAt = new Date();
    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Appointment confirmed successfully',
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to confirm appointment',
      error: error.message
    });
  }
});

// Get Single Appointment by ID
router.get('/:appointmentId', authenticate, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId)
      .populate('docId', 'firstName lastName specialization profilePicture')
      .populate('patientId', 'firstName lastName contactNumber profilePicture');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Add time status for video consultation
    const appointmentDateTime = new Date(appointment.appointmentDate);
    const [hours, minutes] = appointment.appointmentTime.split(':');
    appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));
    
    const now = new Date();
    const timeDiffMinutes = (appointmentDateTime - now) / (1000 * 60);

    // Return appointment data with time status
    res.json({
      success: true,
      data: {
        ...appointment.toObject(),
        timeStatus: {
          canJoin: true, // Always allow joining in test mode
          minutesUntilJoin: Math.round(timeDiffMinutes),
          hasEnded: false
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching appointment details',
      error: error.message
    });
  }
});

// Auto-cancel video consultation if not joined within 15 minutes
router.put('/:appointmentId/auto-cancel', authenticate, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    if (appointment.consultationType !== 'video') {
      return res.status(400).json({
        success: false,
        message: 'Auto-cancel is only available for video consultations'
      });
    }

    if (appointment.cancelled || appointment.isCompleted) {
      return res.status(400).json({
        success: false,
        message: 'Appointment is already cancelled or completed'
      });
    }

    const appointmentDateTime = new Date(appointment.appointmentDate);
    const [hours, minutes] = appointment.appointmentTime.split(':');
    appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));
    
    const now = new Date();
    const timeDiffMinutes = (now - appointmentDateTime) / (1000 * 60);
    
    if (timeDiffMinutes < 15 || timeDiffMinutes > 60) {
      return res.status(400).json({
        success: false,
        message: 'Appointment can only be auto-cancelled between 15 and 60 minutes after scheduled time'
      });
    }

    appointment.cancelled = true;
    appointment.status = 'cancelled';
    appointment.cancelledAt = new Date();
    appointment.cancelledBy = 'system';
    appointment.cancellationReason = 'Auto-cancelled due to no-show';

    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment auto-cancelled successfully',
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to auto-cancel appointment'
    });
  }
});

// Call status routes
router.get('/:id/call-status', authenticate, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    
    res.json({
      success: true,
      isStarted: appointment.videoStarted,
      startTime: appointment.videoStartTime
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/:id/start-call', authenticate, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    
    appointment.videoStarted = true;
    appointment.videoStartTime = new Date();
    await appointment.save();
    
    res.json({ success: true, message: 'Call started successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// WebRTC signaling routes
router.post('/:appointmentId/offer', authenticate, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { offer } = req.body;

    // Store the offer in the appointment
    await Appointment.findByIdAndUpdate(appointmentId, {
      webrtcOffer: offer,
      lastUpdated: Date.now()
    });

    res.status(200).json({ message: 'Offer stored successfully' });
  } catch (error) {
    console.error('Error storing offer:', error);
    res.status(500).json({ message: 'Failed to store offer' });
  }
});

router.post('/:appointmentId/answer', authenticate, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { answer } = req.body;

    // Store the answer in the appointment
    await Appointment.findByIdAndUpdate(appointmentId, {
      webrtcAnswer: answer,
      lastUpdated: Date.now()
    });

    res.status(200).json({ message: 'Answer stored successfully' });
  } catch (error) {
    console.error('Error storing answer:', error);
    res.status(500).json({ message: 'Failed to store answer' });
  }
});

router.post('/:appointmentId/ice-candidate', authenticate, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { candidate } = req.body;

    if (!candidate) {
      return res.status(400).json({ 
        success: false,
        message: 'ICE candidate is required' 
      });
    }

    // Get the current appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ 
        success: false,
        message: 'Appointment not found' 
      });
    }

    // Initialize iceCandidates array if it doesn't exist
    if (!appointment.iceCandidates) {
      appointment.iceCandidates = [];
    }

    // Add the new candidate to the array
    appointment.iceCandidates.push(candidate);
    appointment.lastUpdated = new Date();

    // Save the updated appointment
    await appointment.save();

    res.status(200).json({ 
      success: true,
      message: 'ICE candidate stored successfully' 
    });
  } catch (error) {
    console.error('Error storing ICE candidate:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to store ICE candidate',
      error: error.message 
    });
  }
});

router.get('/:appointmentId/status', authenticate, async (req, res) => {
  try {
    const { appointmentId } = req.params;

    // Get the appointment with WebRTC data
    const appointment = await Appointment.findById(appointmentId);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Return WebRTC connection data and call status
    res.status(200).json({
      offer: appointment.webrtcOffer,
      answer: appointment.webrtcAnswer,
      candidates: appointment.iceCandidates,
      callEnded: appointment.callEnded,
      endedBy: appointment.endedBy
    });
  } catch (error) {
    console.error('Error getting appointment status:', error);
    res.status(500).json({ message: 'Failed to get appointment status' });
  }
});

// Call end notification route
router.post('/:appointmentId/end-call', authenticate, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { endedBy } = req.body;

    // Update appointment with call end status
    await Appointment.findByIdAndUpdate(appointmentId, {
      callEnded: true,
      endedBy: endedBy,
      lastUpdated: Date.now()
    });

    res.status(200).json({ message: 'Call end notification sent successfully' });
  } catch (error) {
    console.error('Error sending call end notification:', error);
    res.status(500).json({ message: 'Failed to send call end notification' });
  }
});

// Create test appointment
router.post('/test', authenticate, async (req, res) => {
  try {
    const { type, status, startTime, duration, isTestAppointment } = req.body;
    const userId = req.user._id;

    // Create new appointment with the current user as both doctor and patient
    const appointment = new Appointment({
      docId: userId,
      patientId: userId,
      slotDate: new Date(startTime).toISOString().split('T')[0],
      slotTime: new Date(startTime).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      consultationType: type || 'video',
      status: status || 'confirmed',
      isTestAppointment: true,
      webrtcOffer: null,
      webrtcAnswer: null,
      iceCandidates: [],
      callEnded: false,
      endedBy: null,
      lastUpdated: new Date()
    });

    await appointment.save();

    // Populate the appointment with user details
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('docId', 'firstName lastName specialization profilePicture')
      .populate('patientId', 'firstName lastName contactNumber profilePicture');

    res.status(201).json({
      success: true,
      message: 'Test appointment created successfully',
      data: populatedAppointment
    });
  } catch (error) {
    console.error('Error creating test appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create test appointment',
      error: error.message
    });
  }
});

// Get Payment History API
router.get('/payment-history/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Find appointments based on user role
    const query = req.user.specialization
      ? { docId: userId } // For doctors
      : { patientId: userId }; // For patients

    const appointments = await Appointment.find({
      ...query,
      $or: [
        { paymentStatus: { $in: ['paid', 'refunded'] } },
        {
          status: { $in: ['cancelled', 'completed'] },
          updatedAt: { $gte: oneDayAgo }
        }
      ]
    })
    .populate('docId', 'firstName lastName specialization')
    .populate('patientId', 'firstName lastName')
    .sort({ updatedAt: -1 });

    // Transform appointments into payment history format
    const paymentHistory = appointments.map(apt => ({
      _id: apt._id,
      doctorName: `Dr. ${apt.docId.firstName} ${apt.docId.lastName}`,
      doctorSpecialization: apt.docId.specialization,
      patientName: `${apt.patientId.firstName} ${apt.patientId.lastName}`,
      amount: apt.consultationFee,
      appointmentDate: apt.slotDate,
      paymentDate: apt.paymentDate || apt.updatedAt,
      paymentStatus: apt.paymentStatus,
      consultationType: apt.consultationType,
      paymentMethod: apt.paymentMethod,
      refundReason: apt.refundReason,
      refundDate: apt.refundDate
    }));

    res.json({
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
});

module.exports = router; 