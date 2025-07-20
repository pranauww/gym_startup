const express = require('express');
const auth = require('../middleware/auth');
const { upload, uploadToS3 } = require('../services/s3');

const router = express.Router();

// Upload workout video
router.post('/video', auth, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No video file provided' });
    }

    const videoUrl = await uploadToS3(req.file);
    
    res.json({
      message: 'Video uploaded successfully',
      videoUrl: videoUrl
    });
  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({ message: 'Failed to upload video' });
  }
});

module.exports = router; 