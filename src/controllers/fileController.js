const sql = require('../config/db');  // Importando a instância do banco de dados

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

async function uploadFile(req, res) {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  try {
    const { path, mimetype } = req.file;
    const { userId, fileName } = req.body;
    console.log(`userId: ${userId}, fileName: ${fileName}`);

    if (!userId) {
      return res.status(400).send('User ID is required.');
    }

    const result = await sql`
      INSERT INTO files (user_id, filename, filepath, filetype)
      VALUES (${userId}, ${fileName}, ${path}, ${mimetype})
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

async function getFiles(req, res) {
  try {
    const { uid } = req.user;
    if (!uid) {
      return res.status(400).send('User ID is required.');
    }
    
    const rows = await sql`
    SELECT id, filename, filetype, filepath, transcription 
    FROM files
    WHERE user_id = ${uid}
    ORDER BY id DESC;
    `;

    if (rows.length === 0) {
      return res.status(404).send('Nenhum arquivo encontrado.');
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar arquivos.' });
  } 
}

module.exports = { getFiles, uploadFile, upload };
