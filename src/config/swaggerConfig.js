const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API do Centro de Distribuição (CD)',
      version: '1.0.0',
      description: 'Documentação da API para comunicação entre o HUB e os Centros de Distribuição.',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3001}`,
        description: 'Servidor Local'
      }
    ]
  },
  // Caminho para os arquivos que contêm as anotações da API
  apis: ['./src/routes/*.js', './src/models/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
};