// Constante para la URL base de la API, facilitando cambios futuros.
const API_BASE_URL = 'http://localhost:3001';

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
            <img src="${API_BASE_URL}/api/products/${product.id}/image" alt="${product.name}">
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
            handleProductCardClick(event);
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

    // Obtenemos el producto y todas las categorías al mismo tiempo para ser más eficientes.
    const [product, allCategories] = await Promise.all([
        ProductService.getById(productId),
        CategoryService.getAll()
    ]);

    if (!product) {
        container.innerHTML = '<p>Producto no encontrado.</p>';
        return;
    }

    // Buscamos el nombre de la categoría usando el category_id del producto.
    const category = allCategories.find(cat => cat.id === product.category_id);
    const categoryName = category ? category.name : 'Categoría desconocida';

    // Actualizamos el título de la página
    document.title = `${product.name} - Cookies and Cakes`;

    // Creamos el HTML para el detalle del producto
    container.innerHTML = `
        <div class="product-detail-image">
            <img src="${API_BASE_URL}/api/products/${product.id}/image" alt="${product.name}">
        </div>
        <div class="product-detail-info">
            <h1 class="product-detail-title">${product.name}</h1>
            <p class="product-detail-category">${categoryName}</p>
            <p class="product-detail-price">${product.price}</p>
            <p class="product-detail-description">
                ${product.description || 'Descripción no disponible.'}
            </p>
            <button class="add-to-cart-btn large" data-id="${product.id}">Añadir al Carrito</button>
        </div>
    `;

    // --- ¡AQUÍ ESTÁ LA SOLUCIÓN! ---
    // Añadimos un listener de eventos al botón recién creado.
    const addToCartBtn = container.querySelector('.add-to-cart-btn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            App.cart.addProduct(product.id);
        });
    }
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
            App.cart.addProduct(productId);
        }
    } else {
        window.location.href = `/pages/product-detail.html?id=${productId}`;
    }
}

// ==================== LÓGICA DEL HERO BANNER ====================

/**
 * Renderiza un carrusel de banners en la sección del hero.
 * Asume que existe un BannerService similar a ProductService.
 */
async function renderHeroBanners() {
    const heroContainer = document.getElementById('hero-banner-container');
    // Si no estamos en una página con el hero banner, no hacemos nada.
    if (!heroContainer) return;

    try {
        // CORRECCIÓN: Usamos getActive() para obtener solo los banners activos y ordenados.
        const banners = await BannerService.getActive();

        if (!banners || banners.length === 0) {
            heroContainer.innerHTML = '<p>No hay banners para mostrar.</p>';
            return;
        }

        let currentBannerIndex = 0;

        function showBanner(index) {
            const banner = banners[index];
            // Usamos el estilo 'background-image' para un mejor ajuste y efecto visual.
            heroContainer.style.backgroundImage = `url('${API_BASE_URL}/api/banners/${banner.id}/image')`;
            // El contenido de texto ahora es estático y está en el index.html
        }

        showBanner(currentBannerIndex);

        // Leemos la velocidad guardada desde localStorage, con 5 segundos como valor por defecto.
        const bannerSpeed = localStorage.getItem('bannerSpeed') || 5000;

        // Cambiar el banner cada 5 segundos
        setInterval(() => {
            currentBannerIndex = (currentBannerIndex + 1) % banners.length;
            showBanner(currentBannerIndex);
        }, bannerSpeed);

    } catch (error) {
        console.error('Error al cargar los banners del hero:', error);
        heroContainer.innerHTML = '<p>No se pudieron cargar los banners en este momento.</p>';
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

/**
 * Objeto principal de la aplicación que encapsula la inicialización y módulos.
 */
const App = {
    cart: null,

    async init() {
        this.cart = new ShoppingCart();
        this.initMenu();
        
        await renderHeroBanners();
        await renderProductDetailPage();
        await renderCategoryPage();
        await this.renderHomepageSections();
    },

    initMenu() {
        const hamburger = document.querySelector(".hamburger");
        const navMenu = document.querySelector(".nav-menu");
        if (!hamburger || !navMenu) return;

        hamburger.addEventListener("click", () => {
            hamburger.classList.toggle("active");
            navMenu.classList.toggle("active");
        });

        document.querySelectorAll(".nav-link").forEach(n => n.addEventListener("click", () => {
            hamburger.classList.remove("active");
            navMenu.classList.remove("active");
        }));
    },

    async renderHomepageSections() {
        const sectionsContainer = document.getElementById('product-sections-container');
        if (!sectionsContainer) return;

        const [categories, allProducts] = await Promise.all([
            CategoryService.getAll(),
            ProductService.getAll(false) // Sin paginación, debe devolver un array
        ]);

        const allSectionsHTML = categories.map(category => {
            // CORRECCIÓN: `allProducts` es ahora un array, por lo que .filter funcionará.
            const productsForCategory = allProducts.filter(p => p.category_id === category.id);
            if (productsForCategory.length === 0) return '';

            const sectionId = `category-${category.id}`;
            return `
                <section class="featured-products" id="${sectionId}">
                    <h2 class="section-title">${category.name}</h2>
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
                </section>`;
        }).join('');

        sectionsContainer.innerHTML = allSectionsHTML;

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
};

// Inicializa la aplicación cuando el DOM está listo.
document.addEventListener("DOMContentLoaded", () => App.init());