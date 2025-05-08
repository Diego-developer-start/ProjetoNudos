const mongoose = require('mongoose');
const Product = require('./models/Product');

// Conexão com MongoDB
mongoose.connect('mongodb://localhost:27017/donut-shop', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Conectado ao MongoDB'))
.catch(err => console.error('Erro na conexão com MongoDB:', err));

// Dados de teste
const produtos = [
    {
        name: "Donut Chocolate",
        description: "Donut com cobertura de chocolate",
        price: 5.99,
        image: "chocolate.jpg"
    },
    {
        name: "Donut Morango",
        description: "Donut com cobertura de morango",
        price: 6.99,
        image: "morango.jpg"
    },
    {
        name: "Donut Caramelo",
        description: "Donut com cobertura de caramelo",
        price: 5.99,
        image: "caramelo.jpg"
    }
];

// Inserir produtos
async function inserirProdutos() {
    try {
        await Product.deleteMany({}); // Limpa produtos existentes
        await Product.insertMany(produtos);
        console.log('Produtos inseridos com sucesso!');
        process.exit(0);
    } catch (error) {
        console.error('Erro ao inserir produtos:', error);
        process.exit(1);
    }
}

inserirProdutos();