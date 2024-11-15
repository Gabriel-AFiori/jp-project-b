const express = require('express');
const multer = require('multer');
const { neon } = require('@neondatabase/serverless');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const upload = multer({ dest: 'uploads/' });
const sql = neon(process.env.DATABASE_URL);

app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  try {
    const { originalname, path, mimetype } = req.file;
    const userId = req.body.userId;

    if (!userId) {
      return res.status(400).send('User ID is required.');
    }

    const result = await sql`
      INSERT INTO files (user_id, filename, filepath, filetype)
      VALUES (${userId}, ${originalname}, ${path}, ${mimetype})
      RETURNING *;
    `;

    return res.status(200).json({
      message: 'File uploaded successfully!',
      file: result[0],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send('Error saving file to database');
  }
});

// Iniciando servidor (fazer um server.js para isso? boa pratica?)
app.listen(3001, () => {
  console.log('Server running on port 3001');
});
