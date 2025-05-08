const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
        minlength: [10, 'A descrição deve ter pelo menos 10 caracteres'],
        maxlength: [500, 'A descrição deve ter no máximo 500 caracteres']
    },
    price: {
        type: Number,
        required: true,
        min: [0.01, 'O preço deve ser maior que zero']
    },
    image: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);