const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: `API do Centro de Distribuição - ${process.env.MY_NAME || 'CD'}`,
      version: '1.0.0',
      description: `
        Documentação da API para Centro de Distribuição do sistema distribuído.
        
        ## Funcionalidades Principais:
        - **CRUD de Produtos**: Gerenciamento completo de produtos (SKU, nome, descrição, valor, estoque)
        - **Transações de Estoque**: Entrada e saída de produtos
        - **Comunicação com HUB**: Credenciamento e solicitação de produtos
        - **Solicitação de Estoque**: Busca automática por produtos em outros CDs
        
        ## Fluxo de Solicitação de Estoque:
        1. CD solicita produto via endpoint /solicitar-estoque
        2. Sistema consulta HUB para encontrar CDs com o produto
        3. Seleciona o CD com menor preço
        4. Realiza transação direta entre CDs
        5. Atualiza estoque local e notifica HUB
        
        ## Modelos de Dados:
        - **Produto**: SKU (ID único), nome, descrição, valor, quantidade em estoque
        - **Transação**: Controle de entrada e saída de produtos
        
        Este CD está configurado como: **${process.env.MY_NAME || 'CD Local'}**
        Porta: **${process.env.PORT || '3001'}**
      `,
      contact: {
        name: `Centro de Distribuição - ${process.env.MY_NAME || 'CD Local'}`,
        email: 'suporte@cd-sistema.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3001}/api`,
        description: 'Servidor Local do CD'
      },
      {
        url: `http://${process.env.MY_IP || '192.168.1.10'}:${process.env.PORT || 3001}/api`,
        description: 'Servidor de Rede do CD'
      }
    ],
    components: {
      schemas: {
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Mensagem de erro'
            },
            error: {
              type: 'string',
              description: 'Detalhes técnicos do erro'
            }
          }
        }
      },
      responses: {
        NotFound: {
          description: 'Produto não encontrado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        BadRequest: {
          description: 'Requisição inválida',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        InternalError: {
          description: 'Erro interno do servidor',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        }
      }
    }
  },
  // Caminho para os arquivos que contêm as anotações da API
  apis: ['./src/routes/*.js', './src/models/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: `API Docs - ${process.env.MY_NAME || 'CD Local'}`,
    swaggerOptions: {
      persistAuthorization: true,
    }
  }));
};