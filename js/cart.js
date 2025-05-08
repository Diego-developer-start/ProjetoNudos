// Classe para gerenciar o carrinho
class CartManager {
    constructor() {
        this.cart = null;
        this.total = 0;
        this.items = [];
        this.init();
    }

    // Inicializar carrinho
    async init() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.log('Usuário não autenticado');
                return;
            }

            const response = await fetch('http://localhost:3000/api/cart', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.cart = data.data;
                this.items = this.cart.items;
                this.total = this.cart.total;
                this.updateUI();
            }
        } catch (error) {
            console.error('Erro ao inicializar carrinho:', error);
        }
    }

    // Adicionar item ao carrinho
    async addItem(productId, quantity = 1) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Por favor, faça login para adicionar itens ao carrinho');
                window.location.href = 'login.html';
                return;
            }

            // Validar quantidade
            if (!quantity || quantity < 1) {
                this.showMessage('Quantidade inválida', 'error');
                return;
            }

            const response = await fetch('http://localhost:3000/api/cart/items', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    productId, 
                    quantity: parseInt(quantity) 
                })
            });

            if (response.ok) {
                const data = await response.json();
                this.cart = data.data;
                this.items = this.cart.items;
                this.total = this.cart.total;
                this.updateUI();
                this.showMessage('Item adicionado ao carrinho', 'success');
            } else {
                const error = await response.json();
                throw new Error(error.message);
            }
        } catch (error) {
            console.error('Erro ao adicionar item:', error);
            this.showMessage(error.message, 'error');
        }
    }

    // Atualizar quantidade
    async updateQuantity(productId, quantity) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Por favor, faça login para atualizar o carrinho');
                window.location.href = 'login.html';
                return;
            }

            const response = await fetch(`http://localhost:3000/api/cart/items/${productId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ quantity })
            });

            if (response.ok) {
                const data = await response.json();
                this.cart = data.data;
                this.items = this.cart.items;
                this.total = this.cart.total;
                this.updateUI();
            } else {
                const error = await response.json();
                throw new Error(error.message);
            }
        } catch (error) {
            console.error('Erro ao atualizar quantidade:', error);
            this.showMessage(error.message, 'error');
        }
    }

    // Remover item
    async removeItem(productId) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Por favor, faça login para remover itens do carrinho');
                window.location.href = 'login.html';
                return;
            }

            const response = await fetch(`http://localhost:3000/api/cart/items/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.cart = data.data;
                this.items = this.cart.items;
                this.total = this.cart.total;
                this.updateUI();
                this.showMessage('Item removido do carrinho', 'success');
            } else {
                const error = await response.json();
                throw new Error(error.message);
            }
        } catch (error) {
            console.error('Erro ao remover item:', error);
            this.showMessage(error.message, 'error');
        }
    }

    // Limpar carrinho
    async clearCart() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Por favor, faça login para limpar o carrinho');
                window.location.href = 'login.html';
                return;
            }

            const response = await fetch('http://localhost:3000/api/cart', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                this.cart = null;
                this.items = [];
                this.total = 0;
                this.updateUI();
                this.showMessage('Carrinho limpo com sucesso', 'success');
            } else {
                const error = await response.json();
                throw new Error(error.message);
            }
        } catch (error) {
            console.error('Erro ao limpar carrinho:', error);
            this.showMessage(error.message, 'error');
        }
    }

    // Atualizar interface
    updateUI() {
        // Atualizar contador do carrinho
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            cartCount.textContent = this.items.reduce((sum, item) => sum + item.quantity, 0);
        }

        // Atualizar lista de itens
        const cartItems = document.getElementById('cart-items');
        if (cartItems) {
            cartItems.innerHTML = this.items.map(item => `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <h6 class="mb-0">${item.product.name}</h6>
                        <p class="mb-0">R$ ${item.price.toFixed(2)} x ${item.quantity}</p>
                        <p class="mb-0">Subtotal: R$ ${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <button class="btn btn-danger btn-sm" onclick="cart.removeItem('${item.product._id}')">
                        <i class="fas fa-trash"></i> Remover
                    </button>
                </div>
            `).join('');
        }

        // Atualizar total
        const cartTotal = document.getElementById('cart-total');
        if (cartTotal) {
            cartTotal.textContent = `R$ ${this.total.toFixed(2)}`;
        }
    }

    // Mostrar mensagem
    showMessage(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        const container = document.querySelector('.container');
        container.insertAdjacentElement('afterbegin', alertDiv);

        setTimeout(() => {
            alertDiv.remove();
        }, 3000);
    }
}

// Criar instância global do gerenciador de carrinho
const cart = new CartManager(); 