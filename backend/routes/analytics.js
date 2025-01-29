const express = require('express');
const router = express.Router();
const Analytics = require('../schema/analyticsSchema');
const mongoose = require('mongoose');

router.get('/', async (req, res) => {
  try {
    const analytics = await Analytics.aggregate([
      {
        $addFields: {
          linkObjectId: { $toObjectId: "$linkId" }
        }
      },
      {
        $lookup: {
          from: 'links',
          localField: 'linkObjectId',
          foreignField: '_id',
          as: 'linkDetails'
        }
      },
      {
        $unwind: {
          path: '$linkDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          timestamp: 1,
          ipAddress: 1,
          userDevice: 1,
          deviceName: 1,
          originalLink: { $ifNull: ['$linkDetails.originalLink', 'Link not found'] },
          shortLink: { $ifNull: ['$linkDetails.shortLink', 'Link not found'] },
          shortId: '$linkDetails.shortId',
          remarks: '$linkDetails.remarks',
          status: '$linkDetails.status'
        }
      },
      {
        $sort: { timestamp: -1 }
      }
    ]);

    console.log('Fetched analytics:', analytics);
    res.json(analytics);
  } catch (error) {
    console.error('Analytics fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/track/:linkId', async (req, res) => {
  try {
    const { linkId } = req.params;
    const clientIP = req.ip || req.connection.remoteAddress;
    
    if (!mongoose.Types.ObjectId.isValid(linkId)) {
      return res.status(400).json({ message: 'Invalid link ID format' });
    }

    // Create analytics entry
    const analytics = new Analytics({
      linkId: new mongoose.Types.ObjectId(linkId),
      ipAddress: clientIP,
      userDevice: req.device.type.toLowerCase(),
      deviceName: req.device.name
    });

    await analytics.save();

    // Update click count in the Link document
    await mongoose.model('Link').findByIdAndUpdate(
      linkId,
      { $inc: { clicks: 1 } }
    );

    res.status(201).json({ message: 'Analytics tracked successfully' });
  } catch (error) {
    console.error('Error tracking analytics:', error);
    res.status(500).json({ message: 'Error tracking analytics' });
  }
});

module.exports = router;