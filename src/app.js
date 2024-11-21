const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const fileRoutes = require('./routes/fileRoutes');
const errorMiddleware = require('./middlewares/errorMiddleware');

dotenv.config();

const app = express();

app.use(cors({
  origin: ['https://jp-project-f.vercel.app', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'multipart/form-data'],
}));

app.use(bodyParser.json());

// Usar as rotas
app.use('/user', userRoutes);
app.use('/upload', fileRoutes);

// Adicionar um Middleware para tratamento de erros
app.use(errorMiddleware);

module.exports = app;
