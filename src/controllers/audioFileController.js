const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const ffprobePath = require('ffprobe-static').path;
const fs = require('fs');
const path = require('path');
const { Storage } = require('@google-cloud/storage');
const { SpeechClient } = require('@google-cloud/speech');
const sql = require('../config/db');


ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const storage = new Storage();
const bucketName = 'speech-to-text-intermediate-audios';
const speechClient = new SpeechClient();
const storageMemory = multer.memoryStorage();
const upload = multer({ storage: storageMemory });

const getAudioDuration = (filePath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        resolve(metadata.format.duration);
      }
    });
  });
};

const transcribeAudio = async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No audio file uploaded.');
  }

  const filePath = req.file.path;
  const audioBuffer = fs.readFileSync(filePath);
  
  const uploadDir = path.resolve(__dirname, '../uploads'); // Caminho da pasta uploads no nível correto
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  const tempFilePath = path.join(uploadDir, 'temp_audio.wav');
  fs.writeFileSync(tempFilePath, audioBuffer);

  // Ajuste o áudio com FFmpeg
  const outputPath = path.join(uploadDir, 'converted_audio.wav');
  ffmpeg(tempFilePath)
    .audioFrequency(16000) // Ajuste o sample rate
    .audioChannels(1) // Ajuste o número de canais
    .audioCodec('pcm_s16le') // Codec Linear16
    .output(outputPath)
    .on('end', async () => {
      try {
        const duration = await getAudioDuration(outputPath);
        const gcsFileName = `audio/${Date.now()}_${path.basename(outputPath)}_audio.wav`;
        const file = storage.bucket(bucketName).file(gcsFileName);

        await file.save(fs.readFileSync(outputPath), {
          metadata: {
            contentType: 'audio/wav',
          },
        });

        const fileUrl = `gs://${bucketName}/${gcsFileName}`;

        const audio = {
          uri: fileUrl,
        };

        const request = {
          audio: audio,
          config: {
            encoding: 'LINEAR16',
            sampleRateHertz: 16000,
            languageCode: 'pt-BR',
          },
        };

        let response;
        if (duration > 50) {
          const [operation] = await speechClient.longRunningRecognize(request);
          [response] = await operation.promise();
        } else {
          [response] = await speechClient.recognize(request);
        }

        const transcription = response.results
          .map(result => result.alternatives[0].transcript)
          .join(' ');

        const { userId, fileName } = req.body;
        const filename = fileName || req.file.originalname;
        const filePath = req.file.path;
        const fileType = req.file.mimetype;

        await sql`
        INSERT INTO files (user_id, filename, filepath, filetype, transcription)
        VALUES (${userId}, ${filename}, ${filePath}, ${fileType}, ${transcription})
        RETURNING *;
        `

        res.status(200).json({
          message: 'Audio file transcribed and saved successfully!',
          file: response.results[0],
          transcription,
        });
      } catch (error) {
        console.error('Error transcribing audio:', error);
        res.status(500).send('Error transcribing audio');
      } finally {
        fs.unlinkSync(tempFilePath);
        fs.unlinkSync(outputPath);
      }
    })
    .on('error', (err) => {
      console.error('Error processing audio with FFmpeg:', err);
      res.status(500).send('Error processing audio');
    })
    .run();
};

module.exports = {
  transcribeAudio,
  upload,
};