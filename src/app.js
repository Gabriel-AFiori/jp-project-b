const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const fileRoutes = require('./routes/fileRoutes');
const errorMiddleware = require('./middlewares/errorMiddleware');

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Usar as rotas
app.use('/user', userRoutes);
app.use('/upload', fileRoutes);

// Adicionar um Middleware para tratamento de erros
app.use(errorMiddleware);

app.listen(3001, () => {
  console.log('Server running on port 3001');
});
