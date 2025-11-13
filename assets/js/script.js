// ==================== MENÚ HAMBURGUESA ====================
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

// ==================== LÓGICA DEL CARRITO DE COMPRAS ====================

const cartIcon = document.querySelector('.fa-shopping-cart');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const closeCartBtn = document.getElementById('close-cart-btn');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total');

/**
 * Obtiene el carrito desde localStorage.
 * @returns {Array} El array de items del carrito.
 */
function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

/**
 * Guarda el carrito en localStorage.
 * @param {Array} cart - El array de items del carrito.
 */
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
}

/**
 * Añade un producto al carrito.
 * @param {string} productId - El ID del producto a añadir.
 */
async function addToCart(productId) {
    const product = await ProductService.getById(productId);
    if (!product) return;

    const cart = getCart();
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart(cart);
    // Aquí podrías añadir una notificación de "Producto añadido"
    console.log(`Producto "${product.name}" añadido al carrito.`);
    openCart(); // Abrir el carrito para mostrar el producto añadido
}

/**
 * Elimina un producto del carrito.
 * @param {string} productId - El ID del producto a eliminar.
 */
function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
}

/**
 * Calcula el precio total del carrito.
 * @param {Array} cart - El array de items del carrito.
 * @returns {string} - El total formateado como moneda.
 */
function calculateTotal(cart) {
    const total = cart.reduce((sum, item) => {
        // Extraer el número del string de precio (ej: "$25.000" -> 25000)
        const price = parseFloat(item.price.replace(/[^0-9.-]+/g, '')) || 0;
        return sum + (price * item.quantity);
    }, 0);

    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(total);
}

/**
 * Actualiza la interfaz de usuario del carrito (sidebar y contador).
 */
function updateCartUI() {
    const cart = getCart();
    cartItemsContainer.innerHTML = ''; // Limpiar items anteriores

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="cart-empty-msg">Tu carrito está vacío.</p>'; // Mensaje de carrito vacío
    } else {
        cart.forEach(item => {
            const cartItemEl = document.createElement('div');
            cartItemEl.className = 'cart-item';
            cartItemEl.innerHTML = `
                <img src="${item.img}" alt="${item.name}">
                <div class="cart-item-info">
                    <p>${item.name}</p>
                    <small>${item.price} x ${item.quantity}</small>
                </div>
                <button class="cart-item-remove" data-id="${item.id}">&times;</button>
            `;
            cartItemsContainer.appendChild(cartItemEl);
        });
    }

    // Actualizar contador del ícono
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartIcon.dataset.count = totalItems > 0 ? totalItems : '';

    // Actualizar el total
    cartTotalEl.textContent = calculateTotal(cart);
}

function openCart() {
    cartSidebar.classList.add('active');
    cartOverlay.classList.add('active');
}

function closeCart() {
    cartSidebar.classList.remove('active');
    cartOverlay.classList.remove('active');
}

// Event Listeners para el carrito
cartIcon.addEventListener('click', openCart);
closeCartBtn.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

// ==================== RENDERIZADO DINÁMICO DE PRODUCTOS ====================

/**
 * Crea el HTML para una tarjeta de producto.
 * @param {object} product - El objeto del producto.
 * @returns {string} - El string HTML de la tarjeta.
 */
function createProductCard(product) {
    const buttonText = product.category === 'Galletas y Tortas Temáticas' ? 'Cotizar' : 'Añadir al Carrito';
    return `
        <div class="product-card" data-id="${product.id}">
            <img src="${product.img}" alt="${product.name}">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price">${product.price}</p>
                <button class="add-to-cart-btn" data-id="${product.id}">${buttonText}</button>
            </div>
        </div>
    `;
}

/**
 * Renderiza los productos en un contenedor específico, opcionalmente filtrados por categoría.
 * @param {string} containerSelector - El selector CSS del contenedor de la grilla.
 * @param {string|null} categoryFilter - El nombre de la categoría para filtrar, o null para mostrar todos.
 */
async function renderProducts(containerSelector, categoryFilter = null) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    container.innerHTML = '<p>Cargando productos...</p>'; // Mensaje de carga
    const allProducts = await ProductService.getAll(false); 

    // --- ¡AQUÍ ESTÁ EL ESPÍA! ---
    console.log('Productos recibidos del servidor:', allProducts);

    const productsToRender = categoryFilter ? allProducts.filter(p => p.category === categoryFilter) : allProducts;

    container.innerHTML = productsToRender.map(createProductCard).join('');

    // Añadimos un listener de eventos al contenedor para manejar los clics
    container.addEventListener('click', (event) => {
        const card = event.target.closest('.product-card');
        if (!card) return; // Si no se hizo clic en una tarjeta, no hacemos nada

        const productId = card.dataset.id;

        // Si se hizo clic en el botón de "Añadir al Carrito", no redirigimos.
        // Esto nos permitirá añadir lógica al carrito en el futuro.
        const addToCartBtn = event.target.closest('.add-to-cart-btn');
        if (addToCartBtn) {
            event.preventDefault(); // Prevenir la navegación si el botón está dentro de un <a>
            const buttonText = addToCartBtn.textContent;
            if (buttonText === 'Cotizar') {
                // Lógica para cotizar (ej: abrir email)
                window.location.href = `mailto:hola@pastelarte.cl?subject=Cotización para producto ID: ${productId}`;
            } else {
                addToCart(productId);
            }
        } else {
            // Si se hizo clic en cualquier otra parte de la tarjeta, redirigimos.
            // Usamos una ruta relativa para mayor compatibilidad con servidores de desarrollo.
            window.location.href = `/pages/product-detail.html?id=${productId}`;
        }
    });
}

/**
 * Renderiza la página de detalle de un producto.
 */
async function renderProductDetailPage() {
    const container = document.getElementById('product-detail-container');
    if (!container) return; // Si no estamos en la página de detalle, no hace nada.

    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    if (!productId) {
        container.innerHTML = '<p>Error: No se ha especificado un producto.</p>';
        return;
    }

    const product = await ProductService.getById(productId);

    if (!product) {
        container.innerHTML = '<p>Producto no encontrado.</p>';
        return;
    }

    // Actualizamos el título de la página
    document.title = `${product.name} - Cookies and Cakes`;

    // Creamos el HTML para el detalle del producto
    container.innerHTML = `
        <div class="product-detail-image">
            <img src="${product.img}" alt="${product.name}">
        </div>
        <div class="product-detail-info">
            <h1 class="product-detail-title">${product.name}</h1>
            <p class="product-detail-category">${product.category}</p>
            <p class="product-detail-price">${product.price}</p>
            <p class="product-detail-description">
                ${product.description || 'Descripción no disponible.'}
            </p>
            <button class="add-to-cart-btn large" data-id="${product.id}">Añadir al Carrito</button>
        </div>
    `;
}

/**
 * Renderiza el carrusel principal (hero slider) con los banners activos.
 */
async function renderHeroSlider() {
    const heroSection = document.getElementById('hero-section');
    if (!heroSection) return;

    const activeBanners = await BannerService.getActive();
    if (activeBanners.length === 0) {
        // Si no hay banners, muestra una imagen por defecto
        heroSection.style.backgroundImage = "url('https://images.pexels.com/photos/1721934/pexels-photo-1721934.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')";
        return;
    }

    // Crea los slides
    const sliderContainer = document.createElement('div');
    sliderContainer.className = 'hero-slider';
    sliderContainer.innerHTML = activeBanners.map(banner => 
        `<div class="slide" style="background-image: url('${banner.img_url}');"></div>`
    ).join('');

    // Inserta el slider al principio de la sección hero
    heroSection.prepend(sliderContainer);

    // Lógica para animar el slider
    const slides = sliderContainer.querySelectorAll('.slide');
    let currentSlide = 0;
    slides[currentSlide].classList.add('active');

    setInterval(() => {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }, 5000); // Cambia de imagen cada 5 segundos
}

// ==================== LÓGICA DEL CARRUSEL DE PRODUCTOS ====================

/**
 * Inicializa un carrusel de productos para una sección específica.
 * @param {string} selectorSeccion - El selector CSS de la sección del carrusel (ej: '#tortas-kuchen').
 */
function inicializarCarrusel(selectorSeccion) {
    // --- 1. Selección de Elementos y Estado Inicial ---
    const seccion = document.querySelector(selectorSeccion);
    if (!seccion) return; // Si la sección no existe, no hace nada

    const productGrid = seccion.querySelector('.product-grid');
    const prevArrow = seccion.querySelector('.prev-arrow');
    const nextArrow = seccion.querySelector('.next-arrow');
    const productCards = Array.from(productGrid.children);

    let currentIndex;
    let itemsToShow;
    let totalProducts = productCards.length;

    // --- 2. Funciones Principales del Carrusel ---

    const updateCarousel = (withTransition = true) => {
        const cardWidth = productGrid.children[0].getBoundingClientRect().width;
        const gap = parseInt(window.getComputedStyle(productGrid).gap);
        const scrollAmount = cardWidth + gap;
        
        productGrid.style.transition = withTransition ? 'transform 0.5s ease-in-out' : 'none';
        productGrid.style.transform = `translateX(-${currentIndex * scrollAmount}px)`;
    };

    const handleTransitionEnd = () => {
        if (currentIndex >= totalProducts + itemsToShow) {
            currentIndex = itemsToShow;
            updateCarousel(false);
        }
        if (currentIndex <= 0) {
            currentIndex = totalProducts;
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

    // --- 3. Función para Construir y Reconstruir el Carrusel ---
    const buildCarousel = () => {
        // Limpiar clones y listeners anteriores
        productGrid.querySelectorAll('.clone').forEach(clone => clone.remove());
        productGrid.innerHTML = productCards.map(card => card.outerHTML).join('');

        totalProducts = productGrid.children.length;
        if (totalProducts === 0) return;

        itemsToShow = window.innerWidth <= 768 ? 1 : 4;

        // Añadir nuevos clones
        for (let i = 0; i < itemsToShow; i++) {
            productGrid.appendChild(productGrid.children[i].cloneNode(true)).classList.add('clone');
        }
        for (let i = totalProducts - 1; i >= totalProducts - itemsToShow; i--) {
            productGrid.insertBefore(productGrid.children[i].cloneNode(true), productGrid.firstChild).classList.add('clone');
        }

        currentIndex = itemsToShow;
        updateCarousel(false);
    };

    // --- 4. Asignación de Eventos y Ejecución Inicial ---
    nextArrow.addEventListener('click', moveNext);
    prevArrow.addEventListener('click', movePrev);
    productGrid.addEventListener('transitionend', handleTransitionEnd);

    // Inicializa la posición del carrusel
    // Usamos un pequeño timeout para asegurar que el DOM está completamente renderizado
    setTimeout(() => updateCarousel(false), 100);

    // Re-inicializar en cambio de tamaño de ventana si cambia el número de items visibles
    window.addEventListener('resize', () => {
        const newItemsToShow = window.innerWidth <= 768 ? 1 : 4;
        if (newItemsToShow !== itemsToShow) {
            buildCarousel(); // Reconstruye el carrusel en lugar de recargar
        }
    });

    buildCarousel(); // Construye el carrusel por primera vez
}

// Inicializa un carrusel para cada sección de productos
document.addEventListener("DOMContentLoaded", async () => {
    // Renderizar el slider principal
    await renderHeroSlider();

    // Renderizar la página de detalle si estamos en ella
    await renderProductDetailPage();

    // Renderizar productos en la página de inicio
    await renderProducts("#tortas-kuchen .product-grid", "Tortas y Kuchen");
    await renderProducts("#galletas-tematicas .product-grid", "Galletas y Tortas Temáticas");
    await renderProducts("#reposteria-dulces .product-grid", "Repostería y Otros Dulces");

    // Inicializar la UI del carrito al cargar la página
    updateCartUI();

    // Inicializar carruseles DESPUÉS de renderizar los productos
    inicializarCarrusel("#tortas-kuchen");
    inicializarCarrusel("#galletas-tematicas");
    inicializarCarrusel("#reposteria-dulces");


    cartItemsContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('cart-item-remove')) {
            removeFromCart(event.target.dataset.id);
        }
    });

    // --- ¡NUEVO! Lógica para finalizar la compra por WhatsApp ---
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            const cart = getCart();
            if (cart.length === 0) {
                alert('Tu carrito está vacío. Añade productos antes de finalizar la compra.');
                return;
            }

            // --- 1. Construir el mensaje para WhatsApp ---
            let message = '¡Hola Cookies and Cakes! Quisiera cotizar el siguiente pedido:\n\n';
            cart.forEach(item => {
                message += `*Producto:* ${item.name}\n`;
                message += `*Cantidad:* ${item.quantity}\n`;
                message += '------------------------\n';
            });

            message += `\nQuedo a la espera de la cotización. ¡Gracias!`;

            // --- 2. Crear la URL de WhatsApp ---
            // ¡IMPORTANTE! Reemplaza este número con tu número de WhatsApp real, incluyendo el código de país (56 para Chile).
            const phoneNumber = '56961961556'; 
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

            // --- 3. Redirigir al usuario y limpiar el carrito ---
            window.open(whatsappUrl, '_blank');
            
            // Opcional: Limpiar el carrito después de enviar el pedido
            saveCart([]);
            closeCart();
        });
    }
});