const express = require('express');
const Link = require('../schema/linkSchema');
const crypto = require('crypto');

const router = express.Router();

const generateShortCode = (length = 8) => {
  const alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let shortCode = '';
  const bytes = crypto.randomBytes(length);
  
  for (let i = 0; i < length; i++) {
    shortCode += alphabet[bytes[i] % alphabet.length];
  }
  
  return shortCode;
};

// Create a new short link
router.post('/', async (req, res) => {
  try {
    const { originalLink, remarks, expirationDate, status = 'active' } = req.body;
    
    if (!originalLink) {
      return res.status(400).json({ message: 'Original link is required' });
    }

    const shortId = generateShortCode();
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const shortLink = `${baseUrl}/api/links/s/${shortId}`;

    const newLink = new Link({
      originalLink,
      shortId,
      shortLink,
      remarks,
      status,
      expirationDate: expirationDate || null,
      clicks: 0
    });

    const savedLink = await newLink.save();
    res.status(201).json(savedLink);
  } catch (error) {
    console.error('Error creating link:', error);
    res.status(500).json({ message: 'Error creating link', error: error.message });
  }
});

// Get all links
router.get('/', async (req, res) => {
  try {
    const links = await Link.find().sort({ createdAt: -1 });
    res.json(links);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a link
router.delete('/:id', async (req, res) => {
  try {
    const deletedLink = await Link.findByIdAndDelete(req.params.id);
    if (!deletedLink) {
      return res.status(404).json({ message: 'Link not found' });
    }
    res.json({ message: 'Link deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Redirect short URL
router.get('/s/:shortId', async (req, res) => {
  try {
    const link = await Link.findOne({ shortId: req.params.shortId });
    
    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }
    
    if (link.status === 'inactive') {
      return res.status(403).json({ error: 'Link is inactive' });
    }
    
    if (link.expirationDate && new Date() > new Date(link.expirationDate)) {
      link.status = 'inactive';
      await link.save();
      return res.status(410).json({ error: 'Link has expired' });
    }
    
    link.clicks += 1;
    await link.save();
    
    res.redirect(link.originalLink);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;