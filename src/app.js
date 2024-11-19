const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const fileRoutes = require('./routes/fileRoutes');
const errorMiddleware = require('./middlewares/errorMiddleware');

dotenv.config();

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://jp-project-f.vercel.app'); // Permite apenas esse domínio
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use(bodyParser.json());

// Usar as rotas
app.use('/user', userRoutes);
app.use('/upload', fileRoutes);

// Adicionar um Middleware para tratamento de erros
app.use(errorMiddleware);

module.exports = app;
