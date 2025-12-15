/**
 * @class ShoppingCart
 * Encapsula toda la lógica y el estado del carrito de compras.
 */
class ShoppingCart {
    constructor() {
        this.cartIcon = document.querySelector('.fa-shopping-cart');
        this.cartSidebar = document.getElementById('cart-sidebar');
        this.cartOverlay = document.getElementById('cart-overlay');
        this.closeCartBtn = document.getElementById('close-cart-btn');
        this.cartItemsContainer = document.getElementById('cart-items');
        this.checkoutBtn = document.querySelector('.checkout-btn');
        // Se crea dinámicamente un contenedor para el total, que se insertará antes del botón de checkout.
        this.cartTotalEl = document.createElement('div');
        this.cartTotalEl.className = 'cart-total';
        if (this.checkoutBtn && this.checkoutBtn.parentElement) {
            this.checkoutBtn.parentElement.insertBefore(this.cartTotalEl, this.checkoutBtn);
        }
        this.cart = this._getCart();
        this._addEventListeners();
        this.updateUI();
    }

    _getCart() {
        return JSON.parse(localStorage.getItem('cart')) || [];
    }

    _saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
        this.updateUI();
    }

    async addProduct(productId) {
        const numericProductId = parseInt(productId, 10);
        const product = await ProductService.getById(productId);
        if (!product) return;

        const existingItem = this.cart.find(item => item.id === numericProductId);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            // Limpiamos y convertimos el precio a un número antes de guardarlo.
            // Esto asegura que las operaciones (suma, formato) funcionen correctamente.
            const cleanedPrice = String(product.price || '').replace(/[$.]/g, '');
            const numericPrice = parseFloat(cleanedPrice) || 0;
            const cartItem = {
                id: product.id,
                name: product.name,
                price: numericPrice,
                quantity: 1,
                img: `${API_BASE_URL}/products/${product.id}/image`
            };
            this.cart.push(cartItem);
        }

        this._saveCart();
        this.open();
    }

    _increaseQuantity(productId) {
        const item = this.cart.find(p => p.id === productId);
        if (item) {
            item.quantity++;
            this._saveCart();
        }
    }

    _decreaseQuantity(productId) {
        const itemIndex = this.cart.findIndex(p => p.id === productId);
        if (itemIndex > -1) {
            this.cart[itemIndex].quantity--;
            if (this.cart[itemIndex].quantity <= 0) {
                this.cart.splice(itemIndex, 1);
            }
            this._saveCart();
        }
    }

    _removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this._saveCart();
    }

    updateUI() {
        this.cartItemsContainer.innerHTML = '';
        let grandTotal = 0;
        let hasItemsToQuote = false;

        if (this.cart.length === 0) {
            this.cartItemsContainer.innerHTML = '<p class="cart-empty-msg">Tu carrito está vacío.</p>';
        } else {
            this.cart.forEach(item => {
                const cartItemEl = document.createElement('div');
                cartItemEl.className = 'cart-item';

                const itemSubtotal = item.price * item.quantity;
                let subtotalDisplay;

                if (item.price > 0) {
                    grandTotal += itemSubtotal;
                    // Muestra el subtotal del item formateado.
                    subtotalDisplay = `$${itemSubtotal.toLocaleString('es-CL')}`;
                } else {
                    hasItemsToQuote = true;
                    // Si es a cotizar, no hay subtotal numérico.
                    subtotalDisplay = 'A cotizar';
                }

                const priceDisplay = item.price > 0 ? `$${item.price.toLocaleString('es-CL')}` : 'A cotizar';
                
                cartItemEl.innerHTML = `
                    <img src="${item.img}" alt="${item.name}">
                    <div class="cart-item-info">
                        <p>${item.name}</p>
                        <small>Unitario: ${priceDisplay}</small>
                    </div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn decrease-quantity" data-id="${item.id}">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn increase-quantity" data-id="${item.id}">+</button>
                    </div>
                    <div class="cart-item-subtotal">
                        <p>${subtotalDisplay}</p>
                    </div>
                    <button class="cart-item-remove" data-id="${item.id}">&times;</button>
                `;
                this.cartItemsContainer.appendChild(cartItemEl);
            });
        }
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        this.cartIcon.dataset.count = totalItems > 0 ? totalItems : '';

        this._updateGrandTotal(grandTotal, hasItemsToQuote);
    }

    open() {
        this.cartSidebar.classList.add('active');
        this.cartOverlay.classList.add('active');
    }

    close() {
        this.cartSidebar.classList.remove('active');
        this.cartOverlay.classList.remove('active');
    }

    _checkout() {
        if (this.cart.length === 0) {
            showNotification('Tu carrito está vacío. Añade productos antes de finalizar la compra.', 'error');
            return;
        }
        // Se reconstruye el mensaje para incluir precios, subtotales y el total general.
        let message = '¡Hola Cookies and Cakes! Quisiera cotizar el siguiente pedido:\n\n';
        let grandTotal = 0;
        let hasItemsToQuote = false;

        this.cart.forEach(item => {
            message += `*Producto:* ${item.name}\n`;
            message += `*Cantidad:* ${item.quantity}\n`;

            if (item.price > 0) {
                const subtotal = item.price * item.quantity;
                grandTotal += subtotal;
                message += `*Precio Unitario:* $${item.price.toLocaleString('es-CL')}\n`;
                message += `*Subtotal:* $${subtotal.toLocaleString('es-CL')}\n`;
            } else {
                hasItemsToQuote = true;
                message += `*Precio:* A cotizar\n`;
            }
            message += `------------------------\n`;
        });

        if (grandTotal > 0) {
            message += `\n*TOTAL (referencial):* $${grandTotal.toLocaleString('es-CL')}\n`;
        }
        message += `\nQuedo a la espera de su confirmación. ¡Gracias!`;
        
        const phoneNumber = '56992228157';
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

        window.open(whatsappUrl, '_blank');
        this.cart = [];
        this._saveCart();
        this.close();
    }

    /**
     * Actualiza el elemento que muestra el total general del carrito.
     * @param {number} total - La suma total de los productos con precio.
     * @param {boolean} hasQuoteItems - True si hay productos "a cotizar".
     */
    _updateGrandTotal(total, hasQuoteItems) {
        if (!this.cartTotalEl) return;

        let totalHTML = '';
        if (total > 0) {
            totalHTML += `<p>Total: <span>$${total.toLocaleString('es-CL')}</span></p>`;
        }

        if (hasQuoteItems) {
            totalHTML += `<small class="quote-note">+ productos a cotizar</small>`;
        }

        this.cartTotalEl.style.display = this.cart.length === 0 ? 'none' : 'block';
        this.cartTotalEl.innerHTML = totalHTML;
    }

    _addEventListeners() {
        this.cartIcon.addEventListener('click', () => this.open());
        this.closeCartBtn.addEventListener('click', () => this.close());
        this.cartOverlay.addEventListener('click', () => this.close());

        this.cartItemsContainer.addEventListener('click', (event) => {
            const target = event.target;
            const productId = parseInt(target.dataset.id, 10);
            if (target.classList.contains('cart-item-remove')) this._removeFromCart(productId);
            if (target.classList.contains('increase-quantity')) this._increaseQuantity(productId);
            if (target.classList.contains('decrease-quantity')) this._decreaseQuantity(productId);
        });

        if (this.checkoutBtn) {
            this.checkoutBtn.addEventListener('click', () => this._checkout());
        }
    }
}