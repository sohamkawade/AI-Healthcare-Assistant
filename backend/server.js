const express = require('express');
const app = express();
const cors = require('cors');
const authRoutes = require('./routes/auth');
const appointmentRoutes = require('./routes/appointment');
const contactRoutes = require('./routes/contactRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const healthDataRoutes = require('./routes/healthData');
const cookieParser = require('cookie-parser');
const path = require('path');
const expressSession = require('express-session')
const flash = require("connect-flash")
const killPort = require('kill-port');

require("dotenv").config()

const db = require('./config/db');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  expressSession({
    resave: false,
    saveUninitialized: false,
    secret: process.env.EXPRESS_SESSION_SECRET,
  })
)
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api', appointmentRoutes);
app.use('/api', contactRoutes);
app.use("/api", reminderRoutes)
app.use('/api', healthDataRoutes);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected error occurred',
  });
});

app.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  next();
});


app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

const port = process.env.PORT

killPort(port)
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error(`Error killing port ${port}:`, error);
  });
