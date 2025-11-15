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
        // --- CORRECCIÓN: Guardamos una versión ligera del producto en el carrito ---
        // En lugar de guardar el objeto completo con la imagen Base64,
        // guardamos solo los datos necesarios y una URL para la miniatura.
        const cartItem = {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            // Usamos la misma URL que el dashboard para la miniatura.
            img: `http://localhost:3000/api/products/${product.id}/image`
        };
        cart.push(cartItem);
    }

    saveCart(cart);
    // Aquí podrías añadir una notificación de "Producto añadido"
    console.log(`Producto "${product.name}" añadido al carrito.`);
    openCart(); // Abrir el carrito para mostrar el producto añadido
}

/**
 * Aumenta la cantidad de un producto en el carrito.
 * @param {string} productId - El ID del producto.
 */
function increaseQuantity(productId) {
    const cart = getCart();
    const item = cart.find(p => p.id === productId);
    if (item) {
        item.quantity++;
        saveCart(cart);
    }
}

/**
 * Disminuye la cantidad de un producto en el carrito.
 * Si la cantidad llega a 0, elimina el producto.
 * @param {string} productId - El ID del producto.
 */
function decreaseQuantity(productId) {
    let cart = getCart();
    const item = cart.find(p => p.id === productId);
    if (item) {
        item.quantity--;
        if (item.quantity <= 0) {
            cart = cart.filter(p => p.id !== productId);
        }
        saveCart(cart);
    }
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
                    <small>${item.price}</small>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn decrease-quantity" data-id="${item.id}">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn increase-quantity" data-id="${item.id}">+</button>
                </div>
                <button class="cart-item-remove" data-id="${item.id}">&times;</button>
            `;
            cartItemsContainer.appendChild(cartItemEl);
        });
    }

    // Actualizar contador del ícono
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartIcon.dataset.count = totalItems > 0 ? totalItems : '';
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
    const buttonText = product.price === 'Cotizar' ? 'Cotizar' : 'Añadir al Carrito';
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
 * @param {string} sectionSelector - El selector CSS de la sección que contiene el carrusel.
 * @param {string|null} categoryFilter - El nombre de la categoría para filtrar, o null para mostrar todos.
 */
async function renderProducts(sectionSelector, categoryFilter = null) {
    const container = document.querySelector(`${sectionSelector} .product-grid`);
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

    // Una vez que los productos están renderizados, inicializamos el carrusel de esa sección.
    inicializarCarrusel(sectionSelector);
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
 * Renderiza la página de una categoría específica.
 */
async function renderCategoryPage() {
    // Verificamos si estamos en la página de categoría por el ID del body.
    if (document.body.id !== 'page-category') return;

    const titleElement = document.getElementById('category-page-title');
    const gridContainer = document.getElementById('category-product-grid');
    const params = new URLSearchParams(window.location.search);
    const categoryId = params.get('id');

    if (!categoryId) {
        titleElement.textContent = 'Categoría no encontrada';
        gridContainer.innerHTML = '<p>No se ha especificado una categoría.</p>';
        return;
    }

    const { categoryName, products } = await ProductService.getByCategoryId(categoryId);

    document.title = `${categoryName} - Cookies and Cakes`;
    titleElement.textContent = categoryName;

    if (products.length === 0) {
        gridContainer.innerHTML = '<p>No hay productos disponibles en esta categoría en este momento.</p>';
    } else {
        gridContainer.innerHTML = products.map(createProductCard).join('');
    }

    // Añadimos el listener de eventos para los botones de "Añadir al carrito".
    gridContainer.addEventListener('click', handleProductCardClick);
}

/**
 * Maneja los clics en las tarjetas de producto, ya sea para añadir al carrito o para ver el detalle.
 * @param {Event} event - El evento de clic.
 */
function handleProductCardClick(event) {
    const card = event.target.closest('.product-card');
    if (!card) return;

    const productId = card.dataset.id;
    const addToCartBtn = event.target.closest('.add-to-cart-btn');

    if (addToCartBtn) {
        event.preventDefault();
        const buttonText = addToCartBtn.textContent;
        if (buttonText === 'Cotizar') {
            window.location.href = `mailto:hola@pastelarte.cl?subject=Cotización para producto ID: ${productId}`;
        } else {
            addToCart(productId);
        }
    } else {
        window.location.href = `/pages/product-detail.html?id=${productId}`;
    }
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

    // --- ¡AQUÍ ESTÁ LA SOLUCIÓN! ---
    // Si no hay productos en esta sección, no inicializamos el carrusel.
    if (productCards.length === 0) return;

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

        // Si no hay productos, no hay nada que clonar.
        if (totalProducts === 0) return;

        // Añadir nuevos clones
        for (let i = 0; i < itemsToShow; i++) {
            productGrid.appendChild(productGrid.children[i].cloneNode(true)).classList.add('clone');
        }
        for (let i = totalProducts - 1; i >= totalProducts - itemsToShow; i--) {
            // CORRECCIÓN: Verificamos que el nodo exista antes de clonar e insertar.
            const nodeToClone = productGrid.children[i];
            if (nodeToClone) productGrid.insertBefore(nodeToClone.cloneNode(true), productGrid.firstChild).classList.add('clone');
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
    // Renderizar la página de detalle si estamos en ella
    await renderProductDetailPage();

    // Renderizar la página de categoría si estamos en ella
    await renderCategoryPage();

    // Renderizar productos en la página de inicio
    const sectionsContainer = document.getElementById('product-sections-container');
    if (sectionsContainer) {
        // --- ¡NUEVA LÓGICA OPTIMIZADA! ---
        // 1. Pedimos todos los datos necesarios al mismo tiempo.
        const categories = await CategoryService.getAll();
        const allProducts = await ProductService.getAll(false);

        let allSectionsHTML = ''; // Creamos un string para acumular todo el HTML.

        // 2. Para cada categoría, construimos el HTML de su sección.
        categories.forEach(category => {
            // Filtramos los productos que pertenecen a esta categoría.
            const productsForCategory = allProducts.filter(p => p.category === category.nombre);

            // Si no hay productos para esta categoría, no creamos la sección.
            if (productsForCategory.length === 0) return;

            // Creamos un ID único para la sección.
            const sectionId = `category-${category.id}`;

            // Construimos el HTML para la nueva sección.
            const sectionHTML = `
                <section class="featured-products" id="${sectionId}">
                    <h2 class="section-title">${category.nombre}</h2>
                    <div class="product-slider-container">
                        <button class="slider-arrow prev-arrow"><i class="fas fa-chevron-left"></i></button>
                        <div class="product-slider-wrapper">
                            <div class="product-grid">${productsForCategory.map(createProductCard).join('')}</div>
                        </div>
                        <button class="slider-arrow next-arrow"><i class="fas fa-chevron-right"></i></button>
                    </div>
                    <div class="view-all-container">
                        <a href="/pages/category.html?id=${category.id}" class="view-all-btn">Ver todos los productos</a>
                    </div>
                </section>
            `;
            allSectionsHTML += sectionHTML; // Lo añadimos al string acumulador.
        });

        // 3. Insertamos todo el HTML en el DOM de una sola vez.
        sectionsContainer.innerHTML = allSectionsHTML;

        // 4. Ahora que todo está en el DOM, inicializamos los carruseles y los listeners.
        categories.forEach(category => {
            const sectionId = `category-${category.id}`;
            const sectionElement = document.getElementById(sectionId);
            if (sectionElement) {
                inicializarCarrusel(`#${sectionId}`);
                // Añadimos el listener para los botones "Añadir al carrito"
                sectionElement.querySelector('.product-grid').addEventListener('click', handleProductCardClick);
            }
        });
    }

    // Inicializar la UI del carrito al cargar la página
    updateCartUI();


    cartItemsContainer.addEventListener('click', (event) => {
        const target = event.target;
        if (target.classList.contains('cart-item-remove')) {
            removeFromCart(event.target.dataset.id);
        }
        if (target.classList.contains('increase-quantity')) {
            increaseQuantity(target.dataset.id);
        }
        if (target.classList.contains('decrease-quantity')) {
            decreaseQuantity(target.dataset.id);
        }
    });

    // --- Lógica para finalizar la compra por WhatsApp ---
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
            const phoneNumber = '56961961556'; 
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

            // --- 3. Redirigir al usuario y limpiar el carrito ---
            window.open(whatsappUrl, '_blank');
            saveCart([]);
            closeCart();
        });
    }
});