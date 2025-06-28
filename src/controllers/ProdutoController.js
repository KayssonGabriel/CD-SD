const Produto = require('../models/ProdutoModel');

// --- CRUD ---
exports.criarProduto = async (req, res) => {
    try {
        const novoProduto = new Produto(req.body);
        await novoProduto.save();
        res.status(201).json(novoProduto);
    } catch (error) {
        res.status(400).json({ message: "Erro ao criar produto", error: error.message });
    }
};

exports.listarProdutos = async (req, res) => {
    try {
        const produtos = await Produto.find();
        res.status(200).json(produtos);
    } catch (error) {
        res.status(500).json({ message: "Erro ao listar produtos", error: error.message });
    }
};

exports.obterProduto = async (req, res) => {
    try {
        const produto = await Produto.findOne({ sku: req.params.sku });
        if (!produto) return res.status(404).json({ message: "Produto não encontrado." });
        res.status(200).json(produto);
    } catch (error) {
        res.status(500).json({ message: "Erro ao obter produto", error: error.message });
    }
};

exports.atualizarProduto = async (req, res) => {
    try {
        const produto = await Produto.findOneAndUpdate({ sku: req.params.sku }, req.body, { new: true });
        if (!produto) return res.status(404).json({ message: "Produto não encontrado." });
        res.status(200).json(produto);
    } catch (error) {
        res.status(400).json({ message: "Erro ao atualizar produto", error: error.message });
    }
};

exports.deletarProduto = async (req, res) => {
    try {
        const produto = await Produto.findOneAndDelete({ sku: req.params.sku });
        if (!produto) return res.status(404).json({ message: "Produto não encontrado." });
        res.status(200).json({ message: "Produto deletado com sucesso." });
    } catch (error) {
        res.status(500).json({ message: "Erro ao deletar produto", error: error.message });
    }
};

// --- Rota para o HUB ---
exports.verificarEstoqueParaHub = async (req, res) => {
    try {
        const { sku, quantidade } = req.params;
        const produto = await Produto.findOne({ sku });

        console.log(`CD ${process.env.MY_NAME}: Recebi consulta do HUB para SKU ${sku}, Qtd: ${quantidade}`);

        if (produto && produto.quantidadeEmEstoque >= parseInt(quantidade)) {
            res.status(200).json({
                possuiEstoque: true,
                valor: produto.valor,
                quantidadeEmEstoque: produto.quantidadeEmEstoque
            });
        } else {
            res.status(200).json({ possuiEstoque: false });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao verificar estoque.' });
    }
};