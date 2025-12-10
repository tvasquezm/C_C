// Constante para la URL base de la API, facilitando cambios futuros.
const API_BASE_URL = 'http://localhost:3001';

// ==================== RENDERIZADO DINÁMICO DE PRODUCTOS ====================

/**
 * Crea el HTML para una tarjeta de producto.
 * @param {object} product - El objeto del producto.
 * @returns {string} - El string HTML de la tarjeta.
 */
function createProductCard(product) {
    let priceDisplay;
    const cleanedPrice = String(product.price || '').replace(/[$.]/g, '');
    const numericPrice = parseFloat(cleanedPrice);

    if (!isNaN(numericPrice) && numericPrice > 0) {
        priceDisplay = `$${numericPrice.toLocaleString('es-CL')}`;
    } else {
        priceDisplay = 'A cotizar';
    }

    const buttonText = 'Añadir al Carrito';

    // Envolvemos la tarjeta en un enlace <a> para la navegación y añadimos la clase .product-card
    // para una mejor semántica, accesibilidad y SEO.
    return `
        <a href="/pages/product-detail.html?id=${product.id}" class="product-card-link">
            <div class="product-card">
                <img src="${API_BASE_URL}/api/products/${product.id}/image" alt="${product.name}">
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-price">${priceDisplay}</p>
                    <button class="add-to-cart-btn" data-id="${product.id}">${buttonText}</button>
                </div>
            </div>
        </a>
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

    const productsToRender = categoryFilter ? allProducts.filter(p => p.category === categoryFilter) : allProducts;

    container.innerHTML = productsToRender.map(createProductCard).join('');

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

    let priceDisplay;
    const cleanedPrice = String(product.price || '').replace(/[$.]/g, '');
    const numericPrice = parseFloat(cleanedPrice);

    if (!isNaN(numericPrice) && numericPrice > 0) {
        priceDisplay = `$${numericPrice.toLocaleString('es-CL')}`;
    } else {
        priceDisplay = 'A cotizar';
    }

    // Actualizamos el título de la página
    document.title = `${product.name} - C & C Cookies and Cakes`;

    // Creamos el HTML para el detalle del producto
    container.innerHTML = `
        <div class="product-detail-image">
            <img src="${API_BASE_URL}/api/products/${product.id}/image" alt="${product.name}">
        </div>
        <div class="product-detail-info">
            <h1 class="product-detail-title">${product.name}</h1>
            <p class="product-detail-category">${categoryName}</p>
            <p class="product-detail-price">${priceDisplay}</p>
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

    try {
        // Hacemos dos peticiones en paralelo: una para obtener los detalles de la categoría (como el nombre)
        // y otra para obtener los productos filtrados por esa categoría.
        const [allCategories, products] = await Promise.all([
            CategoryService.getAll(),
            ProductService.getAll(false, { category: categoryId, limit: 1000 }) // Usamos el filtro de categoría. Aumentamos el límite para asegurar que se carguen todos los productos.
        ]);

        // Buscamos el nombre de la categoría entre todas las que obtuvimos.
        const category = allCategories.find(cat => cat.id == categoryId); // Usamos '==' para comparar string con número.
        const categoryName = category ? category.name : 'Categoría Desconocida';

        document.title = `${categoryName} - C & C Cookies and Cakes`;
        titleElement.textContent = categoryName;

        if (!products || products.length === 0) {
            gridContainer.innerHTML = '<p>No hay productos disponibles en esta categoría en este momento.</p>';
        } else {
            gridContainer.innerHTML = products.map(createProductCard).join('');
        }

        // Añadimos el listener de eventos para los botones de "Añadir al carrito".
        gridContainer.addEventListener('click', handleProductCardClick);

    } catch (error) {
        console.error("Error al renderizar la página de categoría:", error);
        titleElement.textContent = 'Error al cargar';
        gridContainer.innerHTML = '<p>Ocurrió un error al cargar los productos. Por favor, intente más tarde.</p>';
    }
}

/**
 * Maneja los clics en las tarjetas de producto, ya sea para añadir al carrito o para ver el detalle.
 * @param {Event} event - El evento de clic.
 */
function handleProductCardClick(event) {
    const addToCartBtn = event.target.closest('.add-to-cart-btn');

    if (addToCartBtn) {
        event.preventDefault(); 
        const productId = addToCartBtn.dataset.id;
        App.cart.addProduct(productId);
        showToast('¡Producto añadido al carrito!');
    }
}

// ==================== LÓGICA DEL HERO BANNER ====================

/**
 * Renderiza un carrusel de banners en la sección del hero.
 * Asume que existe un BannerService similar a ProductService.
 */
async function renderHeroBanners() {
    const heroContainer = document.getElementById('hero-banner-container');
    if (!heroContainer) return;

    try {
        const banners = await BannerService.getActive();

        if (!banners || banners.length === 0) {
            heroContainer.innerHTML = '<p>No hay banners para mostrar.</p>';
            return;
        }

        let currentBannerIndex = 0;

        function showBanner(index) {
            const banner = banners[index];
            heroContainer.style.backgroundImage = `url('${API_BASE_URL}/api/banners/${banner.id}/image')`;
        }

        showBanner(currentBannerIndex);

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
    // --- 1. Selección de Elementos ---
    const seccion = document.querySelector(selectorSeccion);
    if (!seccion) return;

    const productGrid = seccion.querySelector('.product-grid');
    const prevArrow = seccion.querySelector('.prev-arrow');
    const nextArrow = seccion.querySelector('.next-arrow');
    const paginationContainer = seccion.querySelector('.carousel-pagination');

    // Guardamos las tarjetas originales para poder reconstruir el carrusel al cambiar el tamaño de la ventana.
    const originalProductCards = Array.from(productGrid.children);
    const totalRealProducts = originalProductCards.length;

    if (!productGrid || !prevArrow || !nextArrow || totalRealProducts === 0) {
        if(prevArrow) prevArrow.style.display = 'none';
        if(nextArrow) nextArrow.style.display = 'none';
        if(paginationContainer) paginationContainer.style.display = 'none';
        return;
    }

    // --- 2. Estado del Carrusel ---
    let currentIndex = 0;
    let itemsToShow;
    let isTransitioning = false;
    let activeProductCount = 0; // Contará los productos *actualmente* en el carrusel (puede cambiar en responsive).

    // --- 3. Funciones Auxiliares ---
    const getScrollAmount = () => {
        if (productGrid.children.length === 0) return 0;
        const cardWidth = productGrid.children[0].getBoundingClientRect().width;
        const gap = parseInt(window.getComputedStyle(productGrid).gap) || 20;
        return cardWidth + gap;
    };

    const updateCarouselPosition = (withTransition = true) => {
        const scrollAmount = getScrollAmount();
        // CORRECCIÓN: Se aplica la transición solo cuando es necesario (withTransition = true).
        productGrid.style.transition = withTransition ? 'transform 0.5s ease-in-out' : 'none';
        productGrid.style.transform = `translateX(-${currentIndex * scrollAmount}px)`;
    };

    const updateActiveDot = () => {
        if (!paginationContainer) return;
        const dots = paginationContainer.children;
        if (dots.length === 0) return;

        // Calculamos el índice del primer producto *real* que está visible.
        let realIndex = currentIndex - itemsToShow; // El índice relativo al inicio de los items reales.
        // Normalizamos el índice para que esté siempre entre 0 y (activeProductCount - 1).
        realIndex = (realIndex % activeProductCount + activeProductCount) % activeProductCount;

        // Quitamos la clase activa de todos los puntos y se la añadimos al actual.
        for (let i = 0; i < dots.length; i++) {
            dots[i].classList.remove('active');
        }
        if (dots[realIndex]) {
            dots[realIndex].classList.add('active');
        }
    };

    // --- 4. Lógica del Bucle Infinito (El "Salto Mágico") ---
    const handleLoop = () => {
        isTransitioning = false;
        // Si hemos llegado a los clones del final (que son una copia del principio)...
        if (currentIndex >= activeProductCount + itemsToShow) {
            currentIndex = itemsToShow; // ...saltamos sin animación al primer set de items reales.
            updateCarouselPosition(false);
        }
        // Si hemos llegado a los clones del principio (que son una copia del final)...
        else if (currentIndex < itemsToShow) {
            currentIndex = activeProductCount + currentIndex; // ...saltamos sin animación al set de items reales equivalente al final.
            updateCarouselPosition(false);
        }
        // Actualizamos el punto activo después de cada transición.
        updateActiveDot();
    };

    // --- 5. Controles de Navegación ---
    nextArrow.addEventListener('click', () => {
        if (isTransitioning) return;
        isTransitioning = true;
        currentIndex++;
        updateCarouselPosition();
    });

    prevArrow.addEventListener('click', () => {
        if (isTransitioning) return;
        isTransitioning = true;
        currentIndex--;
        updateCarouselPosition();
    });

    // --- 6. Función para Construir/Reconstruir el Carrusel ---
    const buildCarousel = () => {
        const screenWidth = window.innerWidth;
        const isMobileView = screenWidth < 680;
        const cardsToUse = (isMobileView && originalProductCards.length > 4) 
            ? originalProductCards.slice(0, 4) 
            : originalProductCards;
        const newActiveProductCount = cardsToUse.length;

        let desiredItemsToShow;
        if (isMobileView) {
            desiredItemsToShow = 1;
        } else if (screenWidth <= 1024) { // Tablets grandes
            desiredItemsToShow = 2;
        } else { // Escritorio: ahora muestra 5 productos, como solicitaste.
            desiredItemsToShow = 5;
        }
        const newItemsToShow = Math.min(newActiveProductCount, desiredItemsToShow);

        if (newItemsToShow === itemsToShow && productGrid.children.length > activeProductCount) {
            return;
        }

        itemsToShow = newItemsToShow;
        activeProductCount = newActiveProductCount;
        productGrid.innerHTML = cardsToUse.map(card => card.outerHTML).join('');

        if (activeProductCount <= itemsToShow) {
            prevArrow.style.display = 'none';
            nextArrow.style.display = 'none';
            if (paginationContainer) paginationContainer.style.display = 'none';
            productGrid.classList.add('centered');
            return;
        }

        productGrid.classList.remove('centered');
        prevArrow.style.display = 'block';
        nextArrow.style.display = 'block';
        if (paginationContainer) paginationContainer.style.display = 'flex';

        const lastItems = cardsToUse.slice(-itemsToShow);
        lastItems.reverse().forEach(card => productGrid.prepend(card.cloneNode(true)));
        const firstItems = cardsToUse.slice(0, itemsToShow);
        firstItems.forEach(card => productGrid.append(card.cloneNode(true)));

        // Generamos los puntos de paginación
        if (paginationContainer) {
            paginationContainer.innerHTML = '';
            for (let i = 0; i < activeProductCount; i++) {
                const dot = document.createElement('button');
                dot.classList.add('pagination-dot');
                dot.dataset.index = i;
                paginationContainer.appendChild(dot);
            }
        }

        currentIndex = itemsToShow;
        updateCarouselPosition(false);
        updateActiveDot();
    };

    // --- 7. Asignación de Eventos ---
    productGrid.addEventListener('transitionend', (e) => {
        if (e.target === productGrid) {
            handleLoop();
        }
    });

    if (paginationContainer) {
        paginationContainer.addEventListener('click', (e) => {
            if (isTransitioning || !e.target.matches('.pagination-dot')) return;
            
            isTransitioning = true;
            const targetIndex = parseInt(e.target.dataset.index, 10);
            currentIndex = itemsToShow + targetIndex;
            updateCarouselPosition();
        });
    }

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(buildCarousel, 250);
    });

    setTimeout(buildCarousel, 100);
}

/**
 * Muestra una notificación temporal (toast) en la pantalla.
 * @param {string} message - El mensaje a mostrar.
 * @param {string} type - El tipo de notificación ('success' o 'error').
 */
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('visible');
    }, 10);

    setTimeout(() => {
        toast.classList.remove('visible');
        toast.addEventListener('transitionend', () => toast.remove());
    }, 3000); // La notificación dura 3 segundos
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
            const originalProductsForCategory = allProducts.filter(p => p.category_id === category.id);
            if (originalProductsForCategory.length === 0) return '';

            const productsForCarousel = originalProductsForCategory;

            const productCount = originalProductsForCategory.length;
            const productCountText = productCount === 1 ? '1 producto' : `${productCount} productos`;

            const sectionId = `category-${category.id}`;
            return `
                <section class="featured-products" id="${sectionId}">
                    <h2 class="section-title">${category.name}</h2>
                    <p class="section-subtitle">Contamos con ${productCountText} en esta categoría.</p>
                    <div class="product-slider-container">
                        <button class="slider-arrow prev-arrow"><i class="fas fa-chevron-left"></i></button>
                        <div class="product-slider-wrapper">
                            <div class="product-grid">${productsForCarousel.map(createProductCard).join('')}</div>
                        </div>
                        <button class="slider-arrow next-arrow"><i class="fas fa-chevron-right"></i></button>
                        <div class="carousel-pagination"></div>
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
                sectionElement.querySelector('.product-grid').addEventListener('click', handleProductCardClick);
            }
        });
    }
};

// Inicializa la aplicación cuando el DOM está listo.
document.addEventListener("DOMContentLoaded", () => App.init());