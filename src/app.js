const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const PORT = process.env.PORT || 3001;
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const fileRoutes = require('./routes/fileRoutes');
const errorMiddleware = require('./middlewares/errorMiddleware');

const corsOptions = {
  origin: 'https://jp-project-f.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

dotenv.config();

const app = express();
app.use(cors(corsOptions));
app.use(bodyParser.json());

app.options('*', cors(corsOptions));

// Usar as rotas
app.use('/user', userRoutes);
app.use('/upload', fileRoutes);

// Adicionar um Middleware para tratamento de erros
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
