const express = require('express');
const multer = require("multer");
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const path = require('path');
const expressSession = require('express-session');
const flash = require("connect-flash");
const killPort = require('kill-port');
require("dotenv").config();
const db = require('./config/db');

// Importing Routes
const authRoutes = require('./routes/auth');
const appointmentRoutes = require('./routes/appointment');
const contactRoutes = require('./routes/contactRoutes');
const reminderRoutes = require('./routes/reminderRoutes');

// Middleware Setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
app.use(
  expressSession({
    resave: false,
    saveUninitialized: false,
    secret: process.env.EXPRESS_SESSION_SECRET,
  })
);
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static('frontend/public/uploads'));

app.use('/api', appointmentRoutes);
app.use('/api/auth', authRoutes); 
app.use('/api/appointments', appointmentRoutes); 
app.use('/api/contacts', contactRoutes);
app.use('/api/reminders', reminderRoutes); 

// Error Handling Middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected error occurred',
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Server Setup
const port = process.env.PORT || 5000;
killPort(port)
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error(`Error killing port ${port}:`, error);
  });
