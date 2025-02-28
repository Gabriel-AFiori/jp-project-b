const express = require('express');
const { processPrompt, processImage } = require('../controllers/inteligenceController');

const router = express.Router();

router.post('/gemini/audio', processPrompt);
router.post('/gemini/image', processImage);

module.exports = router;
