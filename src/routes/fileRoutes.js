const express = require('express');
const { uploadFile, upload } = require('../controllers/fileController');
const { transcribeAudio } = require('../controllers/audioFileController');

const router = express.Router();

router.post('/', upload.single('file'), uploadFile);
router.post('/transcribe', transcribeAudio);

module.exports = router;
