const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// URL de conexão com o MongoDB
const url = 'mongodb://localhost:27017';
const dbName = 'donut-shop';

// Função para importar dados
async function importData() {
  const client = new MongoClient(url);

  try {
    // Conectar ao MongoDB
    await client.connect();
    console.log('Conectado ao MongoDB');

    const db = client.db(dbName);

    // Ler o arquivo JSON
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'initialData.json'), 'utf8'));

    // Importar usuários
    if (data.users && data.users.length > 0) {
      await db.collection('users').insertMany(data.users);
      console.log('Usuários importados com sucesso');
    }

    // Importar produtos
    if (data.products && data.products.length > 0) {
      await db.collection('products').insertMany(data.products);
      console.log('Produtos importados com sucesso');
    }

    // Importar lojas
    if (data.stores && data.stores.length > 0) {
      await db.collection('stores').insertMany(data.stores);
      console.log('Lojas importadas com sucesso');
    }

    // Importar pedidos
    if (data.orders && data.orders.length > 0) {
      await db.collection('orders').insertMany(data.orders);
      console.log('Pedidos importados com sucesso');
    }

    console.log('Importação concluída com sucesso!');

  } catch (err) {
    console.error('Erro durante a importação:', err);
  } finally {
    await client.close();
    console.log('Conexão com o MongoDB fechada');
  }
}

// Executar a importação
importData();