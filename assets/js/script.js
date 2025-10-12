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

// ==================== LÓGICA DEL CARRUSEL DE PRODUCTOS ====================

/**
 * Inicializa un carrusel de productos para una sección específica.
 * @param {string} selectorSeccion - El selector CSS de la sección del carrusel (ej: '#tortas-kuchen').
 */
function inicializarCarrusel(selectorSeccion) {
    const seccion = document.querySelector(selectorSeccion);
    if (!seccion) return; // Si la sección no existe, no hace nada

    const productGrid = seccion.querySelector('.product-grid');
    const prevArrow = seccion.querySelector('.prev-arrow');
    const nextArrow = seccion.querySelector('.next-arrow');
    let productCards = Array.from(seccion.querySelectorAll('.product-card'));
    
    if (productCards.length === 0) return;

    const totalProducts = productCards.length;
    // Determina cuántos items se ven a la vez según el tamaño de la pantalla
    const getItemsToShow = () => window.innerWidth <= 768 ? 1 : 4;
    let itemsToShow = getItemsToShow();

    // --- Lógica de clonación para el bucle infinito ---
    // Clonar los primeros 'itemsToShow' y añadirlos al final
    for (let i = 0; i < itemsToShow; i++) {
        const clone = productCards[i].cloneNode(true);
        clone.classList.add('clone');
        productGrid.appendChild(clone);
    }
    // Clonar los últimos 'itemsToShow' y añadirlos al principio
    for (let i = totalProducts - 1; i >= totalProducts - itemsToShow; i--) {
        const clone = productCards[i].cloneNode(true);
        clone.classList.add('clone');
        productGrid.insertBefore(clone, productGrid.firstChild);
    }

    let currentIndex = itemsToShow; // Empezamos en la posición de los primeros items reales

    function updateCarousel(withTransition = true) {
        const cardWidth = productGrid.children[0].getBoundingClientRect().width;
        const gap = parseInt(window.getComputedStyle(productGrid).gap);
        const scrollAmount = cardWidth + gap;
        
        productGrid.style.transition = withTransition ? 'transform 0.5s ease-in-out' : 'none';
        productGrid.style.transform = `translateX(-${currentIndex * scrollAmount}px)`;
    }

    function handleTransitionEnd() {
        // Si estamos en un clon del final, saltamos al principio real
        if (currentIndex >= totalProducts + itemsToShow) {
            currentIndex = itemsToShow;
            updateCarousel(false); // Salto instantáneo sin transición
        }
        // Si estamos en un clon del principio, saltamos al final real
        if (currentIndex <= 0) { // Usamos <= 0 para ser más robustos
            currentIndex = totalProducts;
            updateCarousel(false); // Salto instantáneo sin transición
        }
    }

    nextArrow.addEventListener('click', () => {
        currentIndex++;
        updateCarousel();
    });

    prevArrow.addEventListener('click', () => {
        currentIndex--;
        updateCarousel();
    });

    productGrid.addEventListener('transitionend', handleTransitionEnd);

    // Inicializa la posición del carrusel
    // Usamos un pequeño timeout para asegurar que el DOM está completamente renderizado
    setTimeout(() => updateCarousel(false), 100);

    // Re-inicializar en cambio de tamaño de ventana si cambia el número de items visibles
    window.addEventListener('resize', () => {
        let newItemsToShow = getItemsToShow();
        if (newItemsToShow !== itemsToShow) {
            // Para evitar errores de cálculo al cambiar el número de clones,
            // la forma más robusta es recargar la página para que el script se reinicie.
            location.reload();
        }
    });
}

// Inicializa un carrusel para cada sección de productos
document.addEventListener('DOMContentLoaded', () => {
    inicializarCarrusel('#tortas-kuchen');
    inicializarCarrusel('#galletas-tematicas');
    inicializarCarrusel('#reposteria-dulces');
});