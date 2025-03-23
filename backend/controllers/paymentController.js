const Payment = require('../models/Payment');
const Appointment = require('../models/Appointment');
const { v4: uuidv4 } = require('uuid');

// Initialize payment for an appointment
exports.initiatePayment = async (req, res) => {
    try {
        const { appointmentId, paymentMethod } = req.body;
        
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Create a new payment record
        const payment = new Payment({
            appointmentId,
            amount: appointment.consultationFee,
            paymentMethod,
            transactionId: uuidv4(),
            status: 'pending'
        });

        await payment.save();

        // Update appointment with payment reference
        appointment.paymentId = payment._id;
        await appointment.save();

        // In a real implementation, you would integrate with a payment gateway here
        // For demo purposes, we'll simulate a successful payment
        setTimeout(async () => {
            payment.status = 'completed';
            await payment.save();
            
            appointment.paymentStatus = 'paid';
            await appointment.save();
        }, 2000);

        res.status(200).json({
            message: 'Payment initiated successfully',
            paymentId: payment._id,
            transactionId: payment.transactionId
        });
    } catch (error) {
        res.status(500).json({ message: 'Error initiating payment', error: error.message });
    }
};

// Get payment details
exports.getPaymentDetails = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const payment = await Payment.findById(paymentId).populate('appointmentId');
        
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        res.status(200).json(payment);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payment details', error: error.message });
    }
};

// Process refund
exports.processRefund = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { reason } = req.body;

        const payment = await Payment.findById(paymentId);
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        if (payment.status !== 'completed') {
            return res.status(400).json({ message: 'Payment is not completed' });
        }

        // Update payment status
        payment.status = 'refunded';
        payment.refundDetails = {
            reason,
            refundedAt: new Date()
        };
        await payment.save();

        // Update appointment payment status
        const appointment = await Appointment.findById(payment.appointmentId);
        appointment.paymentStatus = 'refunded';
        await appointment.save();

        res.status(200).json({
            message: 'Refund processed successfully',
            payment
        });
    } catch (error) {
        res.status(500).json({ message: 'Error processing refund', error: error.message });
    }
};

// Get payment history for a patient
exports.getPatientPaymentHistory = async (req, res) => {
    try {
        const { patientId } = req.params;
        
        const appointments = await Appointment.find({ patientId });
        const paymentIds = appointments.map(apt => apt.paymentId).filter(id => id);
        
        const payments = await Payment.find({
            _id: { $in: paymentIds }
        }).populate('appointmentId');

        res.status(200).json(payments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payment history', error: error.message });
    }
}; 