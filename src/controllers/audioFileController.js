const speech = require('@google-cloud/speech');
const fs = require('fs');
const sql = require('../config/db'); // Importando o banco de dados

// Talvez alterar para a pessoa falar algo e fazer a transcrição em tempo real? (não sei se é o desejado)
async function transcribeAudio(req, res) {
  const { fileId } = req.body;

  if (!fileId) {
    return res.status(400).send('File ID is required.');
  }

  try {
    const file = await sql`
      SELECT * FROM files WHERE id = ${fileId};
    `;

    if (file.length === 0) {
      return res.status(404).send('File not found.');
    }

    const filePath = file[0].filepath;
    const client = new speech.SpeechClient();
    const audio = fs.readFileSync(filePath).toString('base64');

    const request = {
      audio: { content: audio },
      config: {
        // Pesquisar sobre encondings e sampleRateHertz dinâmicos
        encoding: 'MP3', // enconding testados (LINEAR16, FLAC, MP3) - MP3 me parece ser o tipo de audio mais comum, devo utilizar este encoding?
        sampleRateHertz: 44100, // sampleRateHertz testados (8000, 16000, 44100) - Pelo que entendi 44100 combina melhor com MP3, devo utilizar este sampleRateHertz?
        languageCode: 'pt-BR',
      },
    };

    const [response] = await client.recognize(request);
    // console.log(response.results);
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join(' ');

    await sql`
      UPDATE files SET transcription = ${transcription} WHERE id = ${fileId};
    `;

    res.status(200).json({
      message: 'Transcription successful!',
      transcription,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error transcribing audio');
  }
}

module.exports = { transcribeAudio };
