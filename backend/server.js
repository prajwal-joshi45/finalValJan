const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const device = require('express-device');

const linkRoutes = require('./routes/link');
const analyticsRoutes = require('./routes/analytics');
const authRoutes = require('./routes/authRoutes'); // Import auth routes

const app = express();

// Middleware
app.use(device.capture());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());

// Database connection
connectDB();

// Routes
app.use('/api/auth', authRoutes); // Add auth routes
app.use('/api/links', linkRoutes);
app.use('/api/analytics', analyticsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
