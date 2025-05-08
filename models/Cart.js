const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Produto é obrigatório']
    },
    quantity: {
        type: Number,
        required: [true, 'Quantidade é obrigatória'],
        min: [1, 'Quantidade deve ser maior que zero']
    },
    price: {
        type: Number,
        required: [true, 'Preço é obrigatório'],
        min: [0, 'Preço não pode ser negativo']
    }
});

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Usuário é obrigatório']
    },
    items: [cartItemSchema],
    total: {
        type: Number,
        default: 0,
        min: [0, 'Total não pode ser negativo']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware para atualizar o total e updatedAt antes de salvar
cartSchema.pre('save', function(next) {
    this.total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    this.updatedAt = new Date();
    next();
});

// Método para adicionar item ao carrinho
cartSchema.methods.addItem = async function(productId, quantity, price) {
    const existingItem = this.items.find(item => item.product.toString() === productId.toString());
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        this.items.push({
            product: productId,
            quantity: quantity,
            price: price
        });
    }
    
    return this.save();
};

// Método para remover item do carrinho
cartSchema.methods.removeItem = async function(productId) {
    this.items = this.items.filter(item => item.product.toString() !== productId.toString());
    return this.save();
};

// Método para atualizar quantidade
cartSchema.methods.updateQuantity = async function(productId, quantity) {
    const item = this.items.find(item => item.product.toString() === productId.toString());
    if (item) {
        item.quantity = quantity;
        return this.save();
    }
    throw new Error('Item não encontrado no carrinho');
};

// Método para limpar carrinho
cartSchema.methods.clear = async function() {
    this.items = [];
    this.total = 0;
    return this.save();
};

module.exports = mongoose.model('Cart', cartSchema); 