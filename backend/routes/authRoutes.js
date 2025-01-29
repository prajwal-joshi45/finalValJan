// routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../schema/userSchema');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Register User
router.post('/register', async (req, res) => {
  try {
    console.log('Full request body:', req.body);
    const { name, email, mobile, password, confirmPassword } = req.body;
    console.log('Password comparison:', { password, confirmPassword });
    if (!name || !email || !mobile || !password) {
      return res.status(400).json({ 
        message: 'All fields are required',
        missing: {
          name: !name,
          email: !email,
          mobile: !mobile,
          password: !password
        }
      });
    }
    // Validate password match
    // if (password !== confirmPassword) {
    //   return res.status(400).json({ message: 'Passwords do not match' });
    // }

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = new User({
      name,
      email,
      mobile,
      password: hashedPassword
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Send response
    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error); // Add this line to log error
    res.status(500).json({
      message: 'Registration failed',
      error: error.message
    });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    console.log('Login endpoint hit'); // Add this line to log endpoint hit
    const { email, password } = req.body;
    console.log('Logging in user:', { email }); // Add this line to log user data

    // Find user and validate password
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Send response
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error); // Add this line to log error
    res.status(500).json({
      message: 'Login failed',
      error: error.message
    });
  }
});

// Get User Profile (Protected)
router.get('/user', authMiddleware, async (req, res) => {
  try {
    console.log('Get user profile endpoint hit'); // Add this line to log endpoint hit
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Error fetching user data:', error); // Add this line to log error
    res.status(500).json({ message: 'Error fetching user data' });
  }
});

module.exports = router;