const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Analytics = require('../schema/analyticsSchema');
const Link = require('../schema/linkSchema');
const authMiddleware = require('../middleware/auth');
const device = require('express-device');

// Add express-device middleware
router.use(device.capture());

// List analytics with proper device and IP detection
router.get('/list', authMiddleware, async (req, res) => {
  try {
    const analytics = await Analytics.aggregate([
      {
        $lookup: {
          from: 'links',
          localField: 'linkId',
          foreignField: '_id',
          as: 'linkData'
        }
      },
      {
        $project: {
          timestamp: 1,
          ipAddress: 1,
          userDevice: 1,
          linkData: 1
        }
      }
    ]);
    
    res.json(analytics || []);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch analytics data',
      details: error.message
    });
  }
});

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    res.json({
      status: 'ok',
      database: {
        connected: dbState === 1
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      error: error.message 
    });
  }
});

// Generate test data with proper device and IP detection
router.post('/seed-test-data', authMiddleware, async (req, res) => {
  try {
    // Get client IP address
    const ipAddress = req.ip || req.connection.remoteAddress;
    
    // Get device type using express-device
    const userDevice = req.device.type.toLowerCase();
    
    const existingLink = await Link.findOne({ shortId: 'gJrUNwl3' });
    if (!existingLink) {
      throw new Error('No existing link found');
    }

    const testAnalytics = {
      linkId: existingLink._id,
      ipAddress: ipAddress,
      userDevice: userDevice,
      browser: req.get('User-Agent'),
      timestamp: new Date()
    };

    const insertedAnalytics = await Analytics.create(testAnalytics);

    res.json({
      message: 'Test data created successfully',
      analytics: insertedAnalytics
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

module.exports = router;