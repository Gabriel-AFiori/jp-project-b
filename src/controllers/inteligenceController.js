const fs = require('fs');
const path = require('path');
const axios = require('axios');
const openai = require('openai');
const GEMINI_KEY = process.env.GEMINI_KEY;
const DEEPSEEK_KEY = process.env.DEEPSEEK_KEY;
const { getFile } = require('../utils/fileUtils');
const { GoogleGenerativeAI } = require('@google/generative-ai')

const genAI = new GoogleGenerativeAI(GEMINI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


async function callDeepSeek(payload) {
  try {
    console.log(`prompt dentro do deepseek payload: ${payload}`);
    
    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant.",
          },
          {
            role: "user",
            content: payload,
          },
        ],
        max_tokens: 150,
      },
      {
        headers: {
          Authorization: `Bearer ${DEEPSEEK_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    
    return response.data.choices[0].message.content;
  } catch (error) {
    if (error.response && error.response.status === 503) {
      throw new Error('DeepSeek API está temporariamente indisponível');
    }
    throw error;
  }
}

async function processPrompt(req, res) {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt é obrigatório." });
  }

  try {
    const deepseekResponse = await callDeepSeek(prompt);
    return res.json({ response: deepseekResponse });
  } catch (error) {
    console.error("Erro ao processar o prompt com DeepSeek:", error);
    if (error.message === 'DeepSeek API está temporariamente indisponível' || error.response.status === 503 || error.response.status === 402) {
      try {
        console.log("DeepSeek falhou. Tentando com Gemini...");
        const result = await model.generateContent(prompt);
        const text = await result.response.text();

        return res.json({ response: text});
      } catch (geminiError) {
        console.error("Erro ao processar o prompt com Gemini:", geminiError);
        return res.status(500).json({ error: "Erro ao processar o prompt com Gemini." });
      }
    }

    return res.status(500).json({ error: "Erro ao processar o prompt com DeepSeek." });
  }
}

async function processImage(req, res) {
  const { file_path } = req.body;
  if (!file_path) {
    return res.status(400).json({ error: "Localização do arquivo é obrigatório" });
  }

  
  try {
    const file = await getFile(file_path);
    if (!file) {
      return res.status(404).json({ error: "Arquivo não encontrado" });
    }
    
    const imageBuffer = fs.readFileSync(file.filepath);
    const imageBase64 = imageBuffer.toString("base64");

    const payload = [
      { text: "Analise a imagem e retorne uma descrição" },
      { inlineData: { mimeType: "image/png", data: imageBase64 } },
    ];

    const result = await model.generateContent(payload);
    const response = await result.response;
    const analysis = response.text();

    return res.json({response: analysis});
  } catch (error) {
    console.error("Erro ao processar a imagem:", error);
    return res.status(500).json({ error: "Erro ao processar a imagem" });
  }
}

module.exports = { processPrompt, processImage };
