const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    docId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    slotDate: {
        type: String,
        required: true
    },
    slotTime: {
        type: String,
        required: true
    },
    consultationType: {
        type: String,
        enum: ['video', 'in-person'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled'],
        default: 'pending'
    },
    cancelledBy: {
        type: String,
        enum: ['doctor', 'patient']
    },
    cancelledById: {
        type: mongoose.Schema.Types.ObjectId
    },
    reason: {
        type: String
    },
    completedAt: {
        type: Date
    },
    completedBy: {
        type: String,
        enum: ['doctor', 'patient']
    },
    isTestAppointment: {
        type: Boolean,
        default: false
    },
    webrtcOffer: {
        type: Object,
        default: null
    },
    webrtcAnswer: {
        type: Object,
        default: null
    },
    iceCandidates: {
        type: [Object],
        default: []
    },
    callEnded: {
        type: Boolean,
        default: false
    },
    endedBy: {
        type: String,
        enum: ['doctor', 'patient', null],
        default: null
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    // Demo payment fields - all optional
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded'],
        default: 'pending'
    },
    consultationFee: {
        type: Number,
        default: 500
    },
    paymentMethod: {
        type: String,
        enum: ['card', 'upi', 'netbanking', 'cash', 'demo'],
        default: 'demo'
    },
    paymentDate: {
        type: Date,
        default: null
    },
    refundReason: {
        type: String,
        default: null
    },
    refundDate: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Add index for faster queries
appointmentSchema.index({ docId: 1, slotDate: 1, slotTime: 1 });
appointmentSchema.index({ patientId: 1, slotDate: 1, slotTime: 1 });
appointmentSchema.index({ paymentStatus: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema, 'Appointments');
module.exports = Appointment;
