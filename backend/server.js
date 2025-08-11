const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const multer = require("multer");
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const expressSession = require('express-session');
const flash = require("connect-flash");
const killPort = require('kill-port');
const fs = require('fs');
const http = require('http');
const WebSocket = require('ws');
require("dotenv").config();
const db = require('./config/db');
const { cleanupAppointments } = require('./cron/appointmentCleanup');

app.use(express.static(path.join(__dirname, "client/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/build", "index.html"));
});

// Import models
require('./models/Doctor');
require('./models/Patient');
require('./models/Appointment');
require('./models/Prescription');
require('./models/Record');
require('./models/Subscriber');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
try {
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }
} catch (error) {
    console.error('Error creating uploads directory:', error);
}

// Import routes
const authRoutes = require('./routes/auth');
const appointmentRoutes = require('./routes/appointmentRoutes');
const contactRoutes = require('./routes/contactRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const subscriberRoutes = require('./routes/subscriberRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const patientRoutes = require('./routes/patientRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// WebSocket connections store
const connections = new Map();

wss.on('connection', (ws, req) => {

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      const { type, appointmentId, from, to, offer, answer, candidate } = data;

      // Store connection
      if (type === 'join') {
        connections.set(from, { ws, appointmentId });
        return;
      }

      // Find recipient's connection
      const recipientConn = connections.get(to);
      if (!recipientConn) {
        return;
      }

      // Forward the message to recipient
      recipientConn.ws.send(JSON.stringify({
        type,
        from,
        offer,
        answer,
        candidate
      }));
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });

  ws.on('close', () => {
    // Remove connection on close
    for (const [userId, conn] of connections.entries()) {
      if (conn.ws === ws) {
        connections.delete(userId);
        break;
      }
    }
  });
});

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://ai-healthcare-assistant.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin', 'Accept']
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Session configuration
app.use(
    expressSession({
        resave: false,
        saveUninitialized: false,
        secret: process.env.EXPRESS_SESSION_SECRET || 'fallback_secret',
    })
);

app.use(flash());

// Static file serving
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/subscribers', subscriberRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api', contactRoutes);


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Run the cleanup function immediately

cleanupAppointments();
