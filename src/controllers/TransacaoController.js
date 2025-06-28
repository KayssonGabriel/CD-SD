const axios = require('axios');
const Produto = require('../models/ProdutoModel');

exports.registerSelf = async (req, res) => {
    try {
        console.log(`CD ${process.env.MY_NAME}: Tentando se registrar no HUB em ${process.env.HUB_API_URL}/register`);
        const response = await axios.post(`${process.env.HUB_API_URL}/register`, {
            nome: process.env.MY_NAME,
            endereco: {
                ip: process.env.MY_IP,
                porta: process.env.PORT
            }
        });
        res.status(200).json({ message: "Registro no HUB realizado com sucesso!", response: response.data });
    } catch (error) {
        console.error("Falha ao se registrar no HUB:", error.response ? error.response.data : error.message);
        res.status(500).json({ message: "Falha ao se registrar no HUB", error: error.response ? error.response.data : error.message });
    }
};


exports.iniciarSolicitacaoDeReforco = async (req, res) => {
    const { sku, quantidadeNecessaria } = req.body;
    if (!sku || !quantidadeNecessaria) {
        return res.status(400).json({ message: "SKU e quantidadeNecessaria são obrigatórios" });
    }

    console.log(`CD ${process.env.MY_NAME}: Iniciando solicitação de reforço para ${quantidadeNecessaria} unidades do SKU ${sku}`);

    try {
        const responseDoHub = await axios.post(`${process.env.HUB_API_URL}/consulta-estoque`, {
            sku,
            quantidadeNecessaria,
            solicitante: {
                ip: process.env.MY_IP,
                porta: process.env.PORT
            }
        });

        const fornecedores = responseDoHub.data;
        console.log(`CD ${process.env.MY_NAME}: HUB retornou ${fornecedores.length} fornecedores.`);

        if (fornecedores.length === 0) {
            return res.status(404).json({ message: 'Nenhum CD fornecedor encontrado com o estoque necessário.' });
        }

        fornecedores.sort((a, b) => a.valor - b.valor);
        const melhorFornecedor = fornecedores[0];
        console.log(`CD ${process.env.MY_NAME}: Melhor fornecedor selecionado: ${melhorFornecedor.nome} (Preço: ${melhorFornecedor.valor})`);

        console.log(`CD ${process.env.MY_NAME} -> Solicitando transferência para ${melhorFornecedor.nome}`);
        await axios.post(`http://${melhorFornecedor.endereco.ip}:${melhorFornecedor.endereco.porta}/api/transacao/saida`, {
            sku,
            quantidade: quantidadeNecessaria
        });

        const produtoLocal = await Produto.findOne({ sku });
        if (!produtoLocal) {
            return res.status(500).json({ message: "Produto não existe localmente para incrementar." });
        }

        produtoLocal.quantidadeEmEstoque += parseInt(quantidadeNecessaria);
        await produtoLocal.save();
        console.log(`CD ${process.env.MY_NAME}: Estoque incrementado com sucesso. Novo estoque: ${produtoLocal.quantidadeEmEstoque}`);

        res.status(200).json({
            message: 'Transação completada com sucesso!',
            fornecedor: melhorFornecedor.nome,
            estoqueAtualizado: produtoLocal
        });

    } catch (error) {
        const errorMsg = error.response ? error.response.data : error.message;
        console.error(`CD ${process.env.MY_NAME}: Erro ao solicitar reforço de estoque:`, errorMsg);
        res.status(500).json({ message: 'Falha no processo de solicitação de reforço.', error: errorMsg });
    }
};

exports.realizarBaixaEstoque = async (req, res) => {
    try {
        const { sku, quantidade } = req.body;
        console.log(`CD ${process.env.MY_NAME}: Recebida solicitação de baixa de ${quantidade} para SKU ${sku}`);
        const produto = await Produto.findOne({ sku });

        if (!produto || produto.quantidadeEmEstoque < parseInt(quantidade)) {
            console.error(`CD ${process.env.MY_NAME}: Estoque insuficiente. Solicitado: ${quantidade}, Disponível: ${produto ? produto.quantidadeEmEstoque : 0}`);
            return res.status(400).json({ message: 'Estoque insuficiente para completar a transação.' });
        }

        produto.quantidadeEmEstoque -= parseInt(quantidade);
        await produto.save();
        console.log(`CD ${process.env.MY_NAME}: Baixa no estoque realizada. Novo estoque: ${produto.quantidadeEmEstoque}`);

        res.status(200).json({ message: 'Baixa no estoque realizada com sucesso.', sku, estoqueAtual: produto.quantidadeEmEstoque });

    } catch (error) {
        console.error(`CD ${process.env.MY_NAME}: Erro ao dar baixa em estoque:`, error.message);
        res.status(500).json({ message: 'Erro ao dar baixa no estoque.' });
    }
};