const mongoose = require('mongoose');

// Define the Reminder schema
const reminderSchema = new mongoose.Schema({
    medication: {
        type: String,
        required: true,
        trim: true,
    },
    dose: {
        type: String,
        required: true,
        trim: true,
    },
    time: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                return value > Date.now();
            },
            message: "Reminder time must be in the future.",
        },
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled'],
        default: 'pending',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
},
    {
        timestamps: true
    });

// Middleware to update `updatedAt` before saving
reminderSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Compile the schema into a model
const Reminder = mongoose.model('Reminder', reminderSchema, "Reminders");

module.exports = Reminder;
