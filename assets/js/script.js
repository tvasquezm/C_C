// Seleccionamos los elementos del DOM que necesitamos
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

// ==================== RENDERIZADO DINÁMICO DE PRODUCTOS ====================

/**
 * Crea el HTML para una tarjeta de producto.
 * @param {object} product - El objeto del producto.
 * @returns {string} - El string HTML de la tarjeta.
 */
function createProductCard(product) {
    const buttonText = product.category === 'Galletas y Tortas Temáticas' ? 'Cotizar' : 'Añadir al Carrito';
    return `
        <a href="/pages/product-detail.html?id=${product.id}" class="product-card-link">
            <div class="product-card">
                <img src="${product.img}" alt="${product.name}">
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-price">${product.price}</p>
                    <button class="add-to-cart-btn">${buttonText}</button>
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
async function renderProducts(containerSelector, categoryFilter = null) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    container.innerHTML = '<p>Cargando productos...</p>'; // Mensaje de carga
    const allProducts = await ProductService.getAll();
    const productsToRender = categoryFilter ? allProducts.filter(p => p.category === categoryFilter) : allProducts;

    container.innerHTML = productsToRender.map(createProductCard).join('');
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
    // Renderizar productos en la página de inicio
    await renderProducts("#tortas-kuchen .product-grid", "Tortas y Kuchen");
    await renderProducts("#galletas-tematicas .product-grid", "Galletas y Tortas Temáticas");
    await renderProducts("#reposteria-dulces .product-grid", "Repostería y Otros Dulces");

    // Renderizar productos en las páginas de categoría
    await renderProducts("#category-tortas-kuchen .product-grid-full", "Tortas y Kuchen");
    await renderProducts("#category-galletas-tematicas .product-grid-full", "Galletas y Tortas Temáticas");
    await renderProducts("#category-reposteria-dulces .product-grid-full", "Repostería y Otros Dulces");

    // Inicializar carruseles DESPUÉS de renderizar los productos
    inicializarCarrusel("#tortas-kuchen");
    inicializarCarrusel("#galletas-tematicas");
    inicializarCarrusel("#reposteria-dulces");
});