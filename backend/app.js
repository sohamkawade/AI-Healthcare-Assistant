const express = require('express');
const app = express();
const contactRoutes = require('./routes/contactRoutes');

// Routes
app.use('/api/contact', contactRoutes);

// ... rest of the code ... 