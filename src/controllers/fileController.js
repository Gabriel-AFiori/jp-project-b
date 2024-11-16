const sql = require('../config/db');  // Importando a instância do banco de dados

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

async function uploadFile(req, res) {
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
}

module.exports = { uploadFile, upload };
