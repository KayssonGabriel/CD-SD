const express = require('express');
const router = express.Router();
const ProdutoController = require('../controllers/ProdutoController');
const TransacaoController = require('../controllers/TransacaoController');

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Verifica se o serviço está ativo
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Serviço funcionando
 */
router.get('/health', (req, res) => res.status(200).send('OK'));

/**
 * @swagger
 * /api/register-self:
 *   post:
 *     summary: Registra o CD no HUB
 *     tags: [Transações]
 *     responses:
 *       200:
 *         description: Registro realizado com sucesso
 */
router.post('/register-self', TransacaoController.registerSelf);

/**
 * @swagger
 * /api/estoque/{sku}/{quantidade}:
 *   get:
 *     summary: Verifica se há estoque suficiente para um SKU
 *     tags: [Estoque]
 *     parameters:
 *       - in: path
 *         name: sku
 *         schema:
 *           type: string
 *         required: true
 *         description: SKU do produto
 *       - in: path
 *         name: quantidade
 *         schema:
 *           type: integer
 *         required: true
 *         description: Quantidade desejada
 *     responses:
 *       200:
 *         description: Estoque suficiente
 */
router.get('/estoque/:sku/:quantidade', ProdutoController.verificarEstoqueParaHub);

/**
 * @swagger
 * /api/transacao/saida:
 *   post:
 *     summary: Realiza baixa de estoque para outro CD
 *     tags: [Transações]
 *     responses:
 *       200:
 *         description: Transação realizada com sucesso
 */
router.post('/transacao/saida', TransacaoController.realizarBaixaEstoque);

/**
 * @swagger
 * /api/solicitar-reforco:
 *   post:
 *     summary: Inicia solicitação de reforço de estoque
 *     tags: [Transações]
 *     responses:
 *       200:
 *         description: Reforço solicitado
 */
router.post('/solicitar-reforco', TransacaoController.iniciarSolicitacaoDeReforco);

/**
 * @swagger
 * /api/produtos:
 *   post:
 *     summary: Cria um novo produto
 *     tags: [Produtos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sku
 *               - nome
 *               - quantidade
 *               - valor
 *             properties:
 *               sku:
 *                 type: string
 *               nome:
 *                 type: string
 *               quantidade:
 *                 type: integer
 *               valor:
 *                 type: number
 *     responses:
 *       201:
 *         description: Produto criado com sucesso
 *
 *   get:
 *     summary: Lista todos os produtos
 *     tags: [Produtos]
 *     responses:
 *       200:
 *         description: Lista de produtos
 */
router.post('/produtos', ProdutoController.criarProduto);
router.get('/produtos', ProdutoController.listarProdutos);

/**
 * @swagger
 * /api/produtos/{sku}:
 *   get:
 *     summary: Retorna um produto específico
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
 *         description: Produto encontrado
 *
 *   put:
 *     summary: Atualiza os dados de um produto
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
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               quantidade:
 *                 type: integer
 *               valor:
 *                 type: number
 *     responses:
 *       200:
 *         description: Produto atualizado
 *
 *   delete:
 *     summary: Remove um produto
 *     tags: [Produtos]
 *     parameters:
 *       - in: path
 *         name: sku
 *         schema:
 *           type: string
 *         required: true
 *         description: SKU do produto
 *     responses:
 *       204:
 *         description: Produto removido com sucesso
 */
router.get('/produtos/:sku', ProdutoController.obterProduto);
router.put('/produtos/:sku', ProdutoController.atualizarProduto);
router.delete('/produtos/:sku', ProdutoController.deletarProduto);

module.exports = router;
