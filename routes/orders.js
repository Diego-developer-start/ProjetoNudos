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
        // Padroniza os campos do endereço para os nomes usados no frontend
        const street = address.street;
        const number = address.number;
        const neighborhood = address.neighborhood;
        const city = address.city;
        const state = address.state;
        const cep = address.cep;
        const complement = address.complement;
        const instructions = address.instructions;

        if (!street || !number || !neighborhood || !city || !state || !cep) {
            return res.status(400).json({ message: 'Todos os campos de endereço (street, number, neighborhood, city, state, cep) são obrigatórios' });
        }

        // Criar o pedido
        const order = new Order({
            user: userId,
            products,
            total,
            address: {
                street,
                number,
                neighborhood,
                city,
                state,
                cep,
                complement,
                instructions
            }
        });

        // Salvar o pedido
        await order.save();

        // Populando as informações do pedido
        const populatedOrder = await Order.findById(order._id)
            .populate('user', 'name email')
            .populate('products.product', 'name price');

        // Exibindo informações detalhadas no console
        console.log('\n' + '='.repeat(50));
        console.log('📦 Pedido Criado com Sucesso!');
        console.log('👤 Cliente:', populatedOrder.user.name, `<${populatedOrder.user.email}>`);
        
        console.log('\n📍 Endereço de Entrega:');
        console.log(`  Rua: ${populatedOrder.address.street}, Nº: ${populatedOrder.address.number}`);
        console.log(`  Bairro: ${populatedOrder.address.neighborhood}`);
        console.log(`  Cidade: ${populatedOrder.address.city} - ${populatedOrder.address.state}`);
        console.log(`  CEP: ${populatedOrder.address.cep}`);
        if (populatedOrder.address.complement) {
            console.log(`  Complemento: ${populatedOrder.address.complement}`);
        }

        console.log('\n🛒 Itens do Pedido:');
        populatedOrder.products.forEach((item, index) => {
            const nome = item.product?.name || 'Produto desconhecido';
            const preco = item.product?.price || 0;
            const subtotal = preco * item.quantity;
            console.log(`  ${index + 1}. ${nome}`);
            console.log(`     Quantidade: ${item.quantity}`);
            console.log(`     Preço unitário: R$ ${preco.toFixed(2)}`);
            console.log(`     Subtotal: R$ ${subtotal.toFixed(2)}`);
        });

        console.log('\n💰 Total do Pedido: R$ ' + populatedOrder.total.toFixed(2));
        console.log('📦 Status: ' + populatedOrder.status);
        console.log('🕒 Criado em: ' + new Date(populatedOrder.createdAt).toLocaleString());
        console.log('='.repeat(50) + '\n');

        // Retornar a resposta com as informações detalhadas
        res.status(201).json({
            message: 'Pedido criado com sucesso',
            order: populatedOrder
        });
    } catch (error) {
        console.error('❌ Erro ao criar pedido:', error);
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
        console.error('❌ Erro ao buscar pedidos:', error);
        res.status(500).json({ message: 'Erro ao buscar pedidos' });
    }
});

module.exports = router;