const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    paymentMethod: {
        type: String,
        enum: ['card', 'upi', 'netbanking', 'cash'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    transactionId: {
        type: String,
        unique: true
    },
    paymentDetails: {
        type: Object,
        default: null
    },
    refundDetails: {
        type: Object,
        default: null
    }
}, {
    timestamps: true
});

// Add index for faster queries
paymentSchema.index({ appointmentId: 1 });
paymentSchema.index({ transactionId: 1 });

const Payment = mongoose.model('Payment', paymentSchema, "Payments");
module.exports = Payment; 