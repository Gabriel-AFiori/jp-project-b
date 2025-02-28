const fs = require('fs');
const path = require('path');

async function getFile(filepath) {
  return new Promise((resolve, reject) => {
    const sanitizedFilepath = filepath.replace(/^uploads[\\/]/, '');
    const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
    const filePath = path.join(uploadsDir, sanitizedFilepath);
    
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        return reject(new Error('Arquivo não encontrado'));
      }
      resolve({ filepath: filePath });
    });
  });
}

module.exports = { getFile };