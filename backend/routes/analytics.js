const express = require('express');
const router = express.Router();
const Analytics = require('../schema/analyticsSchema');
const Link = require('../schema/linkSchema');
const authMiddleware = require('../middleware/auth');

// Get all analytics
// 1. First, let's fix the Analytics Schema to ensure proper data storage
router.get('/test', (req, res) => {
  res.json({ message: 'Analytics endpoint is working' });
});


// 2. Enhanced tracking endpoint
router.post('/track/:linkId', async (req, res) => {
  try {
    const { linkId } = req.params;
    const clientIP = req.ip || req.connection.remoteAddress;
    
    if (!mongoose.Types.ObjectId.isValid(linkId)) {
      return res.status(400).json({ message: 'Invalid link ID format' });
    }

    // First check if link exists
    const link = await Link.findById(linkId);
    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }

    // Enhanced device detection
    const userDevice = req.device?.type?.toLowerCase() || 
                      req.useragent?.isMobile ? 'mobile' :
                      req.useragent?.isTablet ? 'tablet' : 'desktop';

    // Create analytics entry with validated data
    const analytics = new Analytics({
      linkId: new mongoose.Types.ObjectId(linkId),
      ipAddress: clientIP,
      userDevice,
      browser: req.useragent?.browser || 'unknown',
      timestamp: new Date()
    });

    await analytics.save();

    // Update click count atomically
    await Link.findByIdAndUpdate(
      linkId,
      { $inc: { clicks: 1 } },
      { new: true }
    );

    res.status(201).json({ message: 'Analytics tracked successfully' });
  } catch (error) {
    console.error('Error tracking analytics:', error);
    res.status(500).json({ message: 'Error tracking analytics' });
  }
});

// 3. Improved statistics endpoint
router.get('/statistics', authMiddleware, async (req, res) => {
  try {
    console.log('Fetching statistics...');
    
    // Get date range (last 30 days by default)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    // Enhanced date-wise clicks with date range
    const dateWiseClicks = await Analytics.aggregate([
      {
        $match: {
          timestamp: { 
            $gte: startDate,
            $lte: endDate 
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { 
              format: "%Y-%m-%d", 
              date: "$timestamp",
              timezone: "UTC"
            }
          },
          clicks: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      {
        $project: {
          date: '$_id',
          clicks: 1,
          _id: 0
        }
      }
    ]);

    // Enhanced device-wise clicks
    const deviceClicks = await Analytics.aggregate([
      {
        $match: {
          timestamp: { 
            $gte: startDate,
            $lte: endDate 
          }
        }
      },
      {
        $group: {
          _id: {
            $ifNull: ['$userDevice', 'unknown']
          },
          clicks: { $sum: 1 }
        }
      },
      {
        $project: {
          device: {
            $switch: {
              branches: [
                { case: { $eq: ['$_id', ''] }, then: 'unknown' },
                { case: { $eq: ['$_id', null] }, then: 'unknown' }
              ],
              default: '$_id'
            }
          },
          clicks: 1,
          _id: 0
        }
      },
      { $sort: { clicks: -1 } }
    ]);

    // Add total clicks
    const totalClicks = await Analytics.countDocuments({
      timestamp: { 
        $gte: startDate,
        $lte: endDate 
      }
    });

    const statistics = {
      dateWiseClicks,
      deviceClicks,
      totalClicks,
      dateRange: {
        start: startDate,
        end: endDate
      }
    };

    console.log('Statistics compiled:', statistics);
    res.json(statistics);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ message: 'Error fetching statistics' });
  }
});


router.get('/all', authMiddleware, async (req, res) => {
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
        $unwind: '$linkData'
      },
      {
        $project: {
          timestamp: 1,
          originalLink: '$linkData.originalUrl',
          shortLink: '$linkData.shortUrl',
          ipAddress: 1,
          userDevice: 1,
          _id: 0
        }
      },
      {
        $sort: { timestamp: -1 }
      }
    ]);

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching all analytics:', error);
    res.status(500).json({ message: 'Error fetching analytics data' });
  }
});
module.exports = router;