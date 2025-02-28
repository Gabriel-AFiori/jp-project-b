const express = require('express');
const { getFiles, uploadFile, upload } = require('../controllers/fileController');
const { transcribeAudio } = require('../controllers/audioFileController');
const authenticate = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/files', authenticate, getFiles);
router.post('/', upload.single('file'), uploadFile);
router.post('/transcribe', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No audio file uploaded.');
  }
  transcribeAudio(req, res);
});


module.exports = router;
