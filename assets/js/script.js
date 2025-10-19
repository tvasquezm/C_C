// ==================== CONFIGURACIÓN ====================
// ¡IMPORTANTE! Reemplaza este número con el WhatsApp de tu negocio.
// Debe incluir el código de país, sin el signo '+' ni ceros al principio. (Ej: 56912345678 para Chile)
const WHATSAPP_NUMBER = '56992228157'; 

const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

// Añadimos un "escuchador de eventos" para el clic en el menú hamburguesa
hamburger.addEventListener("click", () => {
    // Alterna la clase 'active' en el menú hamburguesa y en el menú de navegación
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
});

// Opcional: Cierra el menú cuando se hace clic en un enlace
document.querySelectorAll(".nav-link").forEach(n => n.addEventListener("click", () => {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
}));

// ==================== RENDERIZADO DINÁMICO DE BANNERS (HERO) ====================

/**
 * Renderiza y controla el carrusel de banners en la sección Hero.
 */
async function initHeroSlider() {
    const sliderContainer = document.getElementById('hero-slider');
    if (!sliderContainer) return;

    // --- CONEXIÓN BACKEND ---
    // Obtiene solo los banners marcados como activos desde la API.
    const activeBanners = await BannerService.getActive();

    if (activeBanners.length === 0) {
        sliderContainer.innerHTML = `
            <div class="hero" style="background-image: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080');">
                <div class="hero-content">
                    <h1>El Arte de la Repostería Hecho con Amor</h1>
                    <p>Descubre nuestras creaciones únicas, horneadas cada día para ti.</p>
                    <a href="#tortas-kuchen" class="cta-button">Ver Productos</a>
                </div>
            </div>`;
        return;
    }

    sliderContainer.innerHTML = activeBanners.map(banner => `
        <div class="hero" style="background-image: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('${banner.imageUrl}');">
            <div class="hero-content">
                <h1>${banner.title}</h1>
                <p>${banner.subtitle}</p>
                <a href="${banner.linkUrl}" class="cta-button">${banner.buttonText}</a>
            </div>
        </div>
    `).join('');

    // Aquí se podría añadir lógica para un carrusel automático (fade in/out) si hay más de un banner.
    // Por simplicidad, por ahora solo muestra el primer banner activo.
    const firstBanner = sliderContainer.querySelector('.hero');
    if (firstBanner) firstBanner.classList.add('active');
}

// ==================== RENDERIZADO DINÁMICO DE PRODUCTOS ====================

/**
 * Crea el HTML para una tarjeta de producto.
 * @param {object} product - El objeto del producto.
 * @returns {string} - El string HTML de la tarjeta.
 */
function createProductCard(product) {
    const actionText = product.category === 'Galletas y Tortas Temáticas' ? 'Cotizar por WhatsApp' : 'Pedir por WhatsApp';
    return `
        <a href="/pages/product-detail.html?id=${product.id}" class="product-card-link">
            <div class="product-card">
                <img src="${product.img}" alt="${product.name}">
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-price">${product.price}</p>
                    <button class="add-to-cart-btn" data-id="${product.id}">Añadir al Carrito</button>
                </div>
            </div>
        </a>
    `;
}

/**
 * Renderiza los productos en un contenedor específico, opcionalmente filtrados por categoría.
 * @param {string} containerSelector - El selector CSS del contenedor de la grilla.
 * @param {string|null} categoryFilter - El nombre de la categoría para filtrar, o null para mostrar todos.
 */
function renderProducts(allProducts, containerSelector, categoryFilter = null) {
    const container = document.querySelector(containerSelector);
    if (!container) return []; // Devuelve array vacío si el contenedor no existe

    // 2. Se filtran los productos para mostrar solo los que están activos.
    // El backend debe asegurarse de que cada producto tenga una propiedad 'isActive' (true/false).
    // Si 'isActive' no se encuentra, se asume que el producto es visible (true).
    const activeProducts = allProducts.filter(p => p.isActive !== false); // Asumimos que si isActive no existe, es true.

    // 3. Se aplica el filtro de categoría si es necesario.
    const productsToRender = categoryFilter ? activeProducts.filter(p => p.category === categoryFilter) : activeProducts;

    container.innerHTML = productsToRender.map(createProductCard).join('');
    // Devolvemos los elementos recién creados para que otras funciones puedan usarlos
    return Array.from(container.children);
}

// ==================== LÓGICA DEL CARRUSEL DE PRODUCTOS ====================

/**
 * Inicializa un carrusel de productos para una sección específica.
 * @param {string} selectorSeccion - El selector CSS de la sección del carrusel (ej: '#tortas-kuchen').
 * @param {HTMLElement[]} productCards - Array de elementos de tarjeta de producto para el carrusel.
 */
function inicializarCarrusel(selectorSeccion, productCards) {
    // --- 1. Selección de Elementos y Estado Inicial ---
    const seccion = document.querySelector(selectorSeccion);
    if (!seccion) return; // Si la sección no existe, no hace nada

    const productGrid = seccion.querySelector('.product-grid');
    if (!productGrid || productCards.length === 0) return; // No inicializar si no hay grid o productos

    const prevArrow = seccion.querySelector('.prev-arrow');
    const nextArrow = seccion.querySelector('.next-arrow');

    let currentIndex;
    let itemsToShow;

    // --- 2. Funciones Principales del Carrusel ---

    const updateCarousel = (withTransition = true) => {
        const cardWidth = productGrid.children[0].getBoundingClientRect().width;
        const gap = parseInt(window.getComputedStyle(productGrid).gap);
        const scrollAmount = cardWidth + gap;
        
        productGrid.style.transition = withTransition ? 'transform 0.5s ease-in-out' : 'none';
        productGrid.style.transform = `translateX(-${currentIndex * scrollAmount}px)`;
    };

    const handleTransitionEnd = () => {
        if (currentIndex >= productCards.length + itemsToShow) {
            currentIndex = itemsToShow;
            updateCarousel(false);
        }
        if (currentIndex <= itemsToShow - 1) {
            currentIndex = productCards.length + itemsToShow - 1;
            updateCarousel(false);
        }
    };

    const moveNext = () => {
        currentIndex++;
        updateCarousel();
    };

    const movePrev = () => {
        currentIndex--;
        updateCarousel();
    };

    // --- 3. Función para Construir el Carrusel ---
    const buildCarousel = () => {
        itemsToShow = window.innerWidth <= 768 ? 1 : 4;

        // Clonar elementos para el efecto "infinito"
        const clonesStart = productCards.slice(-itemsToShow).map(card => card.cloneNode(true));
        const clonesEnd = productCards.slice(0, itemsToShow).map(card => card.cloneNode(true));

        // Limpiar el grid y añadir los clones y los originales
        productGrid.innerHTML = '';
        clonesStart.forEach(clone => {
            clone.classList.add('clone');
            productGrid.appendChild(clone);
        });
        productCards.forEach(card => productGrid.appendChild(card));
        clonesEnd.forEach(clone => {
            clone.classList.add('clone');
            productGrid.appendChild(clone);
        });

        for (let i = 0; i < itemsToShow; i++) {
            productGrid.appendChild(productGrid.children[i].cloneNode(true)).classList.add('clone');
        }

        currentIndex = itemsToShow;
        updateCarousel(false);
    };

    // --- 4. Asignación de Eventos y Ejecución Inicial ---
    buildCarousel(); // Construye el carrusel por primera vez

    nextArrow.addEventListener('click', moveNext);
    prevArrow.addEventListener('click', movePrev);
    productGrid.addEventListener('transitionend', handleTransitionEnd);

    // Re-inicializar en cambio de tamaño de ventana si cambia el número de items visibles
    window.addEventListener('resize', () => {
        const newItemsToShow = window.innerWidth <= 768 ? 1 : 4;
        if (newItemsToShow !== itemsToShow) {
            buildCarousel(); // Reconstruye el carrusel en lugar de recargar
        }
    });
}

// Inicializa un carrusel para cada sección de productos
let allProductsList = []; // Almacenaremos todos los productos aquí para un acceso rápido

document.addEventListener("DOMContentLoaded", async () => {
    const loadingElements = document.querySelectorAll('.product-grid, .product-grid-full');
    loadingElements.forEach(el => el.innerHTML = '<p>Cargando productos...</p>');

    // Cargar banners dinámicos en la sección Hero
    await initHeroSlider();

    // --- CONEXIÓN BACKEND ---
    // Se obtienen TODOS los productos UNA SOLA VEZ al cargar la página para optimizar el rendimiento.
    allProductsList = await ProductService.getAll();

    // Renderizar productos en la página de inicio
    const tortasCards = renderProducts(allProductsList, "#tortas-kuchen .product-grid", "Tortas y Kuchen");
    const galletasCards = renderProducts(allProductsList, "#galletas-tematicas .product-grid", "Galletas y Tortas Temáticas");
    const reposteriaCards = renderProducts(allProductsList, "#reposteria-dulces .product-grid", "Repostería y Otros Dulces");

    // Renderizar productos en las páginas de categoría
    renderProducts(allProductsList, "#category-tortas-kuchen .product-grid-full", "Tortas y Kuchen");
    renderProducts(allProductsList, "#category-galletas-tematicas .product-grid-full", "Galletas y Tortas Temáticas");
    renderProducts(allProductsList, "#category-reposteria-dulces .product-grid-full", "Repostería y Otros Dulces");

    // Inicializar carruseles DESPUÉS de renderizar los productos, pasando las tarjetas
    inicializarCarrusel("#tortas-kuchen", tortasCards);
    inicializarCarrusel("#galletas-tematicas", galletasCards);
    inicializarCarrusel("#reposteria-dulces", reposteriaCards);
});

// ==================== LÓGICA DEL CARRITO DE COMPRAS ====================

const cartFab = document.getElementById('cart-fab');
const cartModalOverlay = document.getElementById('cart-modal-overlay');
const closeCartBtn = document.getElementById('close-cart-btn');
const cartCounter = document.getElementById('cart-counter');
const cartModalBody = document.getElementById('cart-modal-body');
const sendWhatsappOrderBtn = document.getElementById('send-whatsapp-order');

const Cart = {
    get: () => JSON.parse(localStorage.getItem('shoppingCart')) || [],
    save: (cart) => localStorage.setItem('shoppingCart', JSON.stringify(cart)),
    add: (productId) => {
        const cart = Cart.get();
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ id: productId, quantity: 1, selected: true }); // Añadido con 'selected' por defecto
        }
        Cart.save(cart);
        updateCartUI();
    },
    increment: (productId) => {
        const cart = Cart.get();
        const item = cart.find(i => i.id === productId);
        if (item) item.quantity++;
        Cart.save(cart);
        renderCartModal();
        updateCartUI();
    },
    decrement: (productId) => {
        let cart = Cart.get();
        const item = cart.find(i => i.id === productId);
        if (item && item.quantity > 1) {
            item.quantity--;
        } else {
            cart = cart.filter(i => i.id !== productId);
        }
        Cart.save(cart);
        renderCartModal();
        updateCartUI();
    },
    updateQuantity: (productId, quantity) => {
        let cart = Cart.get();
        if (quantity <= 0) {
            cart = cart.filter(item => item.id !== productId);
        } else {
            const item = cart.find(i => i.id === productId);
            if (item) item.quantity = quantity;
        }
        Cart.save(cart);
        renderCartModal();
        updateCartUI();
    },
    remove: (productId) => {
        let cart = Cart.get().filter(item => item.id !== productId);
        Cart.save(cart);
        renderCartModal();
        updateCartUI();
    },
    toggleSelect: (productId, isSelected) => {
        const cart = Cart.get();
        const item = cart.find(i => i.id === productId);
        if (item) {
            item.selected = isSelected;
        }
        Cart.save(cart);
        // No es necesario re-renderizar, el estado del checkbox se mantiene visualmente.
    },
    getTotalItems: () => {
        return Cart.get().reduce((total, item) => total + item.quantity, 0);
    }
};

function updateCartUI() {
    const totalItems = Cart.getTotalItems();
    cartCounter.textContent = totalItems;
    cartCounter.style.display = totalItems > 0 ? 'flex' : 'none';
}

function renderCartModal() {
    const cart = Cart.get();
    if (cart.length === 0) {
        cartModalBody.innerHTML = '<p>Tu carrito está vacío.</p>';
        return;
    }

    cartModalBody.innerHTML = cart.map(item => {
        const product = allProductsList.find(p => p.id == item.id);
        if (!product) return ''; // Producto no encontrado
        return `
            <div class="cart-item" data-id="${product.id}">
                <input type="checkbox" class="cart-item-select" data-id="${product.id}" ${item.selected ? 'checked' : ''}>
                <img src="${product.img}" alt="${product.name}" class="cart-item-img">
                <div class="cart-item-info">
                    <strong>${product.name}</strong>
                    <p>${product.price}</p>
                </div>
                <div class="cart-item-controls">
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" data-action="decrement" data-id="${product.id}">-</button>
                        <span class="quantity-value">${item.quantity}</span>
                        <button class="quantity-btn" data-action="increment" data-id="${product.id}">+</button>
                    </div>
                    <button class="remove-item-btn" data-id="${product.id}"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>
        `;
    }).join('');
}

// --- Event Listeners para el Carrito ---

document.addEventListener('click', (event) => {
    // Añadir producto al carrito
    const addToCartButton = event.target.closest('.add-to-cart-btn');
    if (addToCartButton) {
        event.preventDefault();
        const productId = addToCartButton.dataset.id;
        Cart.add(productId);
        // Feedback visual
        addToCartButton.textContent = '¡Añadido!';
        setTimeout(() => {
            addToCartButton.textContent = 'Añadir al Carrito';
        }, 1000);
    }
});

cartFab.addEventListener('click', () => {
    renderCartModal();
    cartModalOverlay.classList.add('active');
});

closeCartBtn.addEventListener('click', () => {
    cartModalOverlay.classList.remove('active');
});

cartModalOverlay.addEventListener('click', (event) => {
    if (event.target === cartModalOverlay) {
        cartModalOverlay.classList.remove('active');
    }
});

cartModalBody.addEventListener('click', (event) => {
    const target = event.target;
    const quantityBtn = target.closest('.quantity-btn');
    const removeBtn = target.closest('.remove-item-btn');

    if (quantityBtn) {
        const productId = quantityBtn.dataset.id;
        const action = quantityBtn.dataset.action;
        if (action === 'increment') Cart.increment(productId);
        if (action === 'decrement') Cart.decrement(productId);
    } else if (removeBtn) {
        const productId = removeBtn.dataset.id;
        Cart.remove(productId);
    } else if (target.classList.contains('cart-item-select')) {
        // Manejar clic en el checkbox
        const productId = target.dataset.id;
        const isSelected = target.checked;
        Cart.toggleSelect(productId, isSelected);
    }
});

sendWhatsappOrderBtn.addEventListener('click', () => {
    const cart = Cart.get();
    if (cart.length === 0) {
        alert('Tu carrito está vacío.');
        return;
    }

    // Filtrar solo los productos seleccionados
    const selectedItems = cart.filter(item => item.selected);

    let message = '¡Hola! 👋 Me gustaría consultar por el siguiente pedido:\n\n';
    selectedItems.forEach(item => {
        const product = allProductsList.find(p => p.id == item.id);
        if (product) {
            message += `*${item.quantity}x* - ${product.name} (${product.price})\n`;
        }
    });
    message += '\n¡Muchas gracias!';

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
});

// Inicializar el contador del carrito al cargar la página
document.addEventListener('DOMContentLoaded', updateCartUI);