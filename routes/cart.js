const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Obter carrinho do usuário
router.get('/', async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id })
            .populate('items.product', 'name price image');

        if (!cart) {
            cart = new Cart({ user: req.user._id, items: [] });
            await cart.save();
        }

        res.json({
            success: true,
            data: cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar carrinho',
            error: error.message
        });
    }
});

// Adicionar item ao carrinho
router.post('/items', async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        // Validar produto
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Produto não encontrado'
            });
        }

        // Buscar ou criar carrinho
        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            cart = new Cart({ user: req.user._id, items: [] });
        }

        // Adicionar item
        await cart.addItem(productId, quantity, product.price);

        // Retornar carrinho atualizado
        const updatedCart = await Cart.findById(cart._id)
            .populate('items.product', 'name price image');

        res.json({
            success: true,
            message: 'Item adicionado ao carrinho',
            data: updatedCart
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Erro ao adicionar item ao carrinho',
            error: error.message
        });
    }
});

// Atualizar quantidade de item
router.patch('/items/:productId', async (req, res) => {
    try {
        const { quantity } = req.body;
        const { productId } = req.params;

        // Validar quantidade
        if (quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Quantidade deve ser maior que zero'
            });
        }

        // Buscar carrinho
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Carrinho não encontrado'
            });
        }

        // Atualizar quantidade
        await cart.updateQuantity(productId, quantity);

        // Retornar carrinho atualizado
        const updatedCart = await Cart.findById(cart._id)
            .populate('items.product', 'name price image');

        res.json({
            success: true,
            message: 'Quantidade atualizada',
            data: updatedCart
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Erro ao atualizar quantidade',
            error: error.message
        });
    }
});

// Remover item do carrinho
router.delete('/items/:productId', async (req, res) => {
    try {
        const { productId } = req.params;

        // Buscar carrinho
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Carrinho não encontrado'
            });
        }

        // Remover item
        await cart.removeItem(productId);

        // Retornar carrinho atualizado
        const updatedCart = await Cart.findById(cart._id)
            .populate('items.product', 'name price image');

        res.json({
            success: true,
            message: 'Item removido do carrinho',
            data: updatedCart
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Erro ao remover item do carrinho',
            error: error.message
        });
    }
});

// Limpar carrinho
router.delete('/', async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Carrinho não encontrado'
            });
        }

        await cart.clear();

        res.json({
            success: true,
            message: 'Carrinho limpo com sucesso'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Erro ao limpar carrinho',
            error: error.message
        });
    }
});

module.exports = router; 