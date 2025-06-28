const express = require('express');
const router = express.Router();
const ProdutoController = require('../controllers/ProdutoController');
const TransacaoController = require('../controllers/TransacaoController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Produto:
 *       type: object
 *       required:
 *         - sku
 *         - nome
 *         - valor
 *       properties:
 *         id:
 *           type: string
 *           description: ID do produto.
 *         sku:
 *           type: string
 *           description: Código único do produto.
 *         nome:
 *           type: string
 *           description: Nome do produto.
 *         descricao:
 *           type: string
 *           description: Descrição detalhada do produto.
 *         valor:
 *           type: number
 *           format: float
 *           description: Preço do produto.
 *         quantidadeEmEstoque:
 *           type: integer
 *           description: Quantidade disponível em estoque.
 *       example:
 *         sku: "HW-101"
 *         nome: "Headset Gamer"
 *         descricao: "Headset com microfone para jogos online"
 *         valor: 199.99
 *         quantidadeEmEstoque: 50
 * 
 *     TransacaoEntrada:
 *       type: object
 *       properties:
 *         sku:
 *           type: string
 *         quantidade:
 *           type: integer
 *         nome:
 *           type: string
 *         descricao:
 *           type: string
 *         valor:
 *           type: number
 * 
 *     TransacaoSaida:
 *       type: object
 *       properties:
 *         sku:
 *           type: string
 *         quantidade:
 *           type: integer
 */

/**
 * @swagger
 * tags:
 *   - name: Produtos
 *     description: API para gerenciar o CRUD de produtos
 *   - name: Transações
 *     description: API para gerenciar transações de estoque
 */

// --- Rotas de Produtos (CRUD) ---
/**
 * @swagger
 * /produtos:
 *   post:
 *     summary: Cria um novo produto
 *     tags: [Produtos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Produto'
 *     responses:
 *       201:
 *         description: Produto criado com sucesso.
 */
router.post('/produtos', ProdutoController.criarProduto);

/**
 * @swagger
 * /produtos:
 *   get:
 *     summary: Lista todos os produtos
 *     tags: [Produtos]
 *     responses:
 *       200:
 *         description: Lista de produtos.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Produto'
 */
router.get('/produtos', ProdutoController.listarProdutos);

/**
 * @swagger
 * /produtos/{sku}:
 *   get:
 *     summary: Obtém um produto pelo seu SKU
 *     tags: [Produtos]
 *     parameters:
 *       - in: path
 *         name: sku
 *         schema:
 *           type: string
 *         required: true
 *         description: SKU do produto
 *     responses:
 *       200:
 *         description: Dados do produto.
 *       404:
 *         description: Produto não encontrado.
 */
router.get('/produtos/:sku', ProdutoController.obterProduto);

/**
 * @swagger
 * /produtos/{sku}:
 *   put:
 *     summary: Atualiza um produto pelo seu SKU
 *     tags: [Produtos]
 *     parameters:
 *       - in: path
 *         name: sku
 *         schema:
 *           type: string
 *         required: true
 *         description: SKU do produto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Produto'
 *     responses:
 *       200:
 *         description: Produto atualizado com sucesso.
 */
router.put('/produtos/:sku', ProdutoController.atualizarProduto);

/**
 * @swagger
 * /produtos/{sku}:
 *   delete:
 *     summary: Deleta um produto pelo seu SKU
 *     tags: [Produtos]
 *     parameters:
 *       - in: path
 *         name: sku
 *         schema:
 *           type: string
 *         required: true
 *         description: SKU do produto
 *     responses:
 *       200:
 *         description: Produto deletado com sucesso.
 */
router.delete('/produtos/:sku', ProdutoController.deletarProduto);

// --- Rotas de Transação ---
/**
 * @swagger
 * /transacao/entrada:
 *   post:
 *     summary: Realiza a entrada de produtos no estoque.
 *     tags: [Transações]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TransacaoEntrada'
 *     responses:
 *       200:
 *         description: Entrada de estoque realizada com sucesso.
 */
router.post('/transacao/entrada', TransacaoController.entradaEstoque);

/**
 * @swagger
 * /transacao/saida:
 *   post:
 *     summary: Realiza a baixa de produtos no estoque.
 *     tags: [Transações]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TransacaoSaida'
 *     responses:
 *       200:
 *         description: Saída de estoque realizada com sucesso.
 */
router.post('/transacao/saida', TransacaoController.saidaEstoque);

/**
 * @swagger
 * /solicitar-estoque:
 *   post:
 *     summary: Inicia o fluxo completo de solicitação de estoque para outro CD via HUB.
 *     tags: [Transações]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sku:
 *                 type: string
 *               quantidade:
 *                 type: integer
 *               hubApiUrl:
 *                 type: string
 *                 description: URL base da API do HUB (ex localhost:3000)
 *               meuEndereco:
 *                 type: string
 *                 description: Endereço deste CD (ex localhost:3001)
 *     responses:
 *       200:
 *         description: Transação iniciada ou concluída com sucesso.
 *       404:
 *         description: Nenhum CD com o produto/estoque foi encontrado.
 *       500:
 *         description: Erro interno durante o processo.
 */
router.post('/solicitar-estoque', TransacaoController.solicitarEstoque);

module.exports = router;
