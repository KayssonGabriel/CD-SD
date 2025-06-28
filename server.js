require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const cdRoutes = require('./src/routes/cdRoutes');
const setupSwagger = require('./src/config/swaggerConfig');

const app = express();
const PORT = process.env.PORT || 3001;

// Conectar ao Banco de Dados
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api', cdRoutes);

// Inicializa a documentação da API
setupSwagger(app);

// Rota raiz
app.get('/', (req, res) => {
    res.send(`API do ${process.env.MY_NAME} está funcionando!`);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`CD Server ${process.env.MY_NAME} rodando na porta ${PORT}`);
    console.log(`Documentação da API disponível em http://localhost:${PORT}/api-docs`);
});