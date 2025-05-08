const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const auth = require('../middleware/auth');

// Criar um novo pedido
router.post('/', auth, async (req, res) => {
    try {
        const { products, total, address } = req.body;
        const userId = req.user._id;

        // Validação dos dados
        if (!products || !Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ message: 'Produtos inválidos' });
        }

        if (!total || isNaN(total) || total <= 0) {
            return res.status(400).json({ message: 'Total inválido' });
        }

        if (!address || typeof address !== 'object') {
            return res.status(400).json({ message: 'Endereço é obrigatório e deve ser um objeto' });
        }
        // Ajuste para aceitar tanto 'rua' quanto 'street', 'numero' quanto 'number', etc.
        const rua = address.rua || address.street;
        const numero = address.numero || address.number;
        const bairro = address.bairro || address.neighborhood;
        const cidade = address.cidade || address.city;
        const estado = address.estado || address.state;
        const cep = address.cep;
        const complemento = address.complemento || address.complement;

        if (!rua || !numero || !bairro || !cidade || !estado || !cep) {
            return res.status(400).json({ message: 'Todos os campos de endereço (rua, número, bairro, cidade, estado, cep) são obrigatórios' });
        }

        // Criar o pedido
        const order = new Order({
            user: userId,
            products,
            total,
            address: {
                rua,
                numero,
                bairro,
                cidade,
                estado,
                cep,
                complemento
            }
        });

        // Salvar o pedido
        await order.save();

        res.status(201).json({
            message: 'Pedido criado com sucesso',
            order
        });
    } catch (error) {
        console.error('Erro ao criar pedido:', error);
        res.status(500).json({ message: 'Erro ao criar pedido' });
    }
});

// Buscar pedidos do usuário
router.get('/my-orders', auth, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate('products.product')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
        res.status(500).json({ message: 'Erro ao buscar pedidos' });
    }
});

module.exports = router;