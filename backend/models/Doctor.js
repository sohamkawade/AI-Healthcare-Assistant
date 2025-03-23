const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const timeSlotSchema = new mongoose.Schema({
    date: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    }
});

const workingHoursSchema = new mongoose.Schema({
    dayOfWeek: {
        type: Number, 
        required: true
    },
    startTime: {
        type: String,
        default: '09:00'
    },
    endTime: {
        type: String,
        default: '17:00'
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
});

const doctorSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
        select: false 
    },
    contactNumber: {
        type: String,
        required: [true, 'Contact number is required']
    },
    fees: {
        type: Number,
        required: [true, 'Consultation fee is required']
    },
    degree: {
        type: String,
        required: [true, 'Degree is required']
    },
    specialization: {
        type: String,
        required: [true, 'Specialization is required'],
    },
    profilePicture: {
        type: String,
        required: [true, 'Profile picture is required']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    available: {
        type: Boolean,
        default: true
    },
    dailyAvailability: {
        type: Map,
        of: Boolean,
        default: () => new Map()
    },
    workingHours: {
        type: [workingHoursSchema],
        default: function() {
            const hours = [];
            for (let i = 0; i < 7; i++) {
                hours.push({
                    dayOfWeek: i,
                    startTime: '09:00',
                    endTime: '17:00',
                    isAvailable: true
                });
            }
            return hours;
        },
        required: true
    },
    bookedSlots: [timeSlotSchema],
    slotDuration: {
        type: Number,
        default: 30, // duration in minutes
    },
    breakTime: {
        start: {
            type: String,
            default: '13:00'
        },
        end: {
            type: String,
            default: '14:00'
        }
    },
    currentAppointment: {
        type: Boolean,
        default: false
    },
    fixedSlots: {
        type: [String],
        default: function() {
            return ['10:00', '12:00', '14:00', '16:00'];
        }
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function(doc, ret) {
            // Remove sensitive fields
            delete ret.password;
            delete ret.__v;
            delete ret.createdAt;
            delete ret.updatedAt;

            // Add availability status with safe defaults
            try {
                const today = new Date().toISOString().split('T')[0];
                ret.availabilityStatus = {
                    isActive: Boolean(doc.isActive),
                    available: Boolean(doc.available),
                    isFullyBooked: false,
                    availableSlots: doc.fixedSlots || ['10:00', '12:00', '14:00', '16:00'],
                    totalSlots: (doc.fixedSlots || ['10:00', '12:00', '14:00', '16:00']).length,
                    bookedCount: (doc.bookedSlots || []).length,
                    reason: null
                };
            } catch (error) {
                console.error('Error in transform:', error);
                ret.availabilityStatus = {
                    isActive: true,
                    available: true,
                    isFullyBooked: false,
                    availableSlots: ['10:00', '12:00', '14:00', '16:00'],
                    totalSlots: 4,
                    bookedCount: 0,
                    reason: null
                };
            }
            return ret;
        }
    }
});

// Method to check if a specific time slot is available
doctorSchema.methods.isSlotAvailable = function(date, time) {
    if (!this.isActive || !this.available) return false;
    if (!this.fixedSlots.includes(time)) return false;
    
    const isBooked = this.bookedSlots.some(slot => 
        slot.date === date && slot.time === time
    );
    return !isBooked;
};

// Method to update availability for a specific date
doctorSchema.methods.updateDailyAvailability = async function(date) {
    const dateBookings = Array.isArray(this.bookedSlots) ? this.bookedSlots.filter(slot => slot.date === date) : [];
    const isAvailable = dateBookings.length < this.fixedSlots.length;

    this.dailyAvailability.set(date, isAvailable);
    return this.save();
};

// Method to get available slots for a specific date
doctorSchema.methods.getAvailableSlots = function(date) {
    try {
        // Check basic availability
        if (!this.isActive || !this.available) {
            return [];
        }

        // Ensure proper initialization
        const fixedSlots = Array.isArray(this.fixedSlots) ? this.fixedSlots : ['10:00', '12:00', '14:00', '16:00'];
        const bookedSlots = Array.isArray(this.bookedSlots) ? this.bookedSlots : [];

        // Get booked times for the date
        const bookedTimes = bookedSlots
            .filter(slot => slot.date === date)
            .map(slot => slot.time);

        // Get available slots
        return fixedSlots.filter(time => !bookedTimes.includes(time));
    } catch (error) {
        console.error('Error in getAvailableSlots:', error);
        return [];
    }
};

doctorSchema.methods.getAvailabilityStatus = function(date) {
    try {
        // Ensure fixedSlots has default values
        const fixedSlots = Array.isArray(this.fixedSlots) ? this.fixedSlots : ['10:00', '12:00', '14:00', '16:00'];
        const bookedSlots = Array.isArray(this.bookedSlots) ? this.bookedSlots : [];

        // Get bookings for the specific date
        const dateBookings = bookedSlots.filter(slot => slot.date === date);
        const isFullyBooked = dateBookings.length >= fixedSlots.length;

        // Initialize status object
        let status = {
            isActive: Boolean(this.isActive),
            available: Boolean(this.available),
            isFullyBooked: isFullyBooked,
            availableSlots: [],
            totalSlots: fixedSlots.length,
            bookedCount: dateBookings.length,
            reason: null
        };

        // Check doctor's basic availability
        if (!status.isActive) {
            status.reason = 'Doctor is not active';
            status.available = false;
            return status;
        }

        if (!status.available) {
            status.reason = 'Doctor is not available for appointments';
            return status;
        }

        // Check if fully booked
        if (isFullyBooked) {
            status.reason = `All ${status.totalSlots} slots are booked for this date`;
            status.available = false;
            return status;
        }

        // Get available slots
        const availableSlots = this.getAvailableSlots(date);
        status.availableSlots = Array.isArray(availableSlots) ? availableSlots : [];

        // Update status based on available slots
        if (status.availableSlots.length === 0) {
            status.reason = 'No available slots for this date';
            status.isFullyBooked = true;
            status.available = false;
        } else {
            status.reason = `${status.availableSlots.length} slots available`;
        }

        return status;
    } catch (error) {
        console.error('Error in getAvailabilityStatus:', error);
        // Return a safe default status
        return {
            isActive: Boolean(this.isActive),
            available: false,
            isFullyBooked: true,
            availableSlots: [],
            totalSlots: 4,
            bookedCount: 0,
            reason: 'Error checking availability status'
        };
    }
};

// Register the model
const Doctor = mongoose.model('Doctor', doctorSchema, "Doctors");

module.exports = Doctor; 