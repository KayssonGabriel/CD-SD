const Produto = require('../models/ProdutoModel');
const axios = require('axios');

// Agora, se o produto não existe, ele é criado com todos os dados necessários.
exports.entradaEstoque = async (req, res) => {
    const { sku, quantidade, nome, descricao, valor } = req.body;

    try {
        let produto = await Produto.findOne({ sku: sku });

        if (produto) {
            produto.quantidadeEmEstoque += quantidade;
        } else {
            // Cria um novo produto se ele não existir neste CD
            produto = new Produto({
                sku,
                nome,
                descricao,
                valor,
                quantidadeEmEstoque: quantidade
            });
        }

        await produto.save();
        res.status(200).json({ message: 'Entrada de estoque realizada com sucesso!', produto });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao dar entrada no estoque.', error: error.message });
    }
};

exports.saidaEstoque = async (req, res) => {
    const { sku, quantidade } = req.body;

    try {
        const produto = await Produto.findOne({ sku: sku });

        if (!produto) {
            return res.status(404).json({ message: 'Produto não encontrado.' });
        }

        if (produto.quantidadeEmEstoque < quantidade) {
            return res.status(400).json({ message: 'Estoque insuficiente.' });
        }

        produto.quantidadeEmEstoque -= quantidade;
        await produto.save();
        res.status(200).json({ message: 'Baixa no estoque realizada com sucesso!', produto });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao dar baixa no estoque.', error: error.message });
    }
};


// ** NOVA FUNÇÃO PARA IMPLEMENTAR O FLUXO COMPLETO **
exports.solicitarEstoque = async (req, res) => {
    const { sku, quantidade, hubApiUrl, meuEndereco } = req.body;

    if (!sku || !quantidade || !hubApiUrl || !meuEndereco) {
        return res.status(400).json({ message: 'SKU, quantidade, hubApiUrl e meuEndereco são obrigatórios.' });
    }

    try {
        // Passo 3: CD ‘A” solicita ao HUB lista de CD Ativos
        console.log(`Solicitando ao HUB ${hubApiUrl} por ${quantidade} unidades do SKU ${sku}`);
        const hubResponse = await axios.get(`${hubApiUrl}/produtos`, {
            params: { sku, quantidade },
            headers: {
                'x-cd-solicitante-endereco': meuEndereco
            }
        });

        const cdsDisponiveis = hubResponse.data;

        if (cdsDisponiveis.length === 0) {
            return res.status(404).json({ message: 'Nenhum CD encontrado com o produto e quantidade necessários.' });
        }

        // Passo 7: CD “A” seleciona o CD para transação (critério: menor preço)
        cdsDisponiveis.sort((a, b) => a.valor - b.valor);
        const cdAlvo = cdsDisponiveis[0];

        console.log(`CD alvo selecionado: ${cdAlvo.nome} no endereço ${cdAlvo.endereco} com valor R$${cdAlvo.valor}`);

        // Realiza a transação direta com o CD alvo
        const transacaoSaidaUrl = `http://${cdAlvo.endereco}/transacao/saida`;
        const produtoCompleto = {
            sku: cdAlvo.sku,
            quantidade,
            nome: cdAlvo.nome,
            descricao: cdAlvo.descricao, // Idealmente o HUB retornaria isso também
            valor: cdAlvo.valor
        };
        
        // Passo 8: CD selecionado realiza baixa no estoque
        await axios.post(transacaoSaidaUrl, { sku, quantidade });
        console.log(`Baixa de ${quantidade} do SKU ${sku} solicitada ao CD ${cdAlvo.nome}`);

        // Passo 9: CD “A” incrementa o estoque (chamada interna para sua própria API de entrada)
        const transacaoEntradaUrl = `http://${meuEndereco}/transacao/entrada`;
        await axios.post(transacaoEntradaUrl, produtoCompleto);
        console.log(`Incrementando estoque local com ${quantidade} do SKU ${sku}`);

        res.status(200).json({ message: `Transação completa! Compra realizada do CD ${cdAlvo.nome}.` });

    } catch (error) {
        console.error('Erro ao solicitar estoque:', error.response ? error.response.data : error.message);
        res.status(500).json({ message: 'Falha no processo de solicitação de estoque.', error: error.message });
    }
};