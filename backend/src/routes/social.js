const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Social route' });
});

module.exports = router; 