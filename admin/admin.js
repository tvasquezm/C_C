document.addEventListener('DOMContentLoaded', () => {
    initAdminMenu(); // Inicializa el menú hamburguesa para el admin
    initFileInputs(); // Inicializa los botones de subida de archivos
    // Router simple basado en el ID del body para ejecutar el código correcto en cada página
    switch (document.body.id) {
        case 'admin-dashboard':
            loadProductsAdminPage();
            break;
        case 'admin-manage-categories':
            loadCategoriesAdminPage();
            break;
        case 'admin-add-product':
            loadAddProductPage();
            break;
        case 'admin-edit-product':
            loadEditProductPage();
            break;
        case 'admin-manage-banners':
            loadBannersAdminPage();
            break;
    }
});

/**
 * Inicializa la funcionalidad del menú hamburguesa en el panel de administración.
 */
function initAdminMenu() {
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
}

/**
 * Añade listeners a todos los inputs de archivo para mostrar el nombre del archivo seleccionado.
 */
function initFileInputs() {
    document.querySelectorAll('input[type="file"]').forEach(fileInput => {
        fileInput.addEventListener('change', (e) => {
            const fileNameSpan = e.target.closest('.file-input-wrapper').querySelector('.file-name');
            if (e.target.files.length > 0) {
                fileNameSpan.textContent = e.target.files[0].name;
                fileNameSpan.style.color = 'var(--dark-color)';
            } else {
                fileNameSpan.textContent = 'Ningún archivo seleccionado';
                fileNameSpan.style.color = '#6c757d';
            }
        });
    });
}

/**
 * Carga y renderiza la tabla de productos en el dashboard.
 */
async function loadProductsAdminPage(page = 1, filters = {}) {
    // Elementos del DOM
    const tableBody = document.querySelector('.product-table tbody');
    const filterNameInput = document.getElementById('filter-by-name');
    const filterCategorySelect = document.getElementById('filter-by-category');
    const filterStatusSelect = document.getElementById('filter-by-status');
    const paginationContainer = document.getElementById('pagination-controls');
    
    if (!tableBody) return;

    tableBody.innerHTML = '<tr class="loader-row"><td colspan="7"><div class="spinner"></div></td></tr>';
    if (paginationContainer) paginationContainer.innerHTML = '';
    
    try {
        const queryOptions = {
            page,
            limit: 10,
            ...filters
        };
        const state = {
            sortColumn: filters.sortBy || 'id',
            sortDirection: filters.sortOrder || 'desc'
        };

        // Obtenemos todas las categorías y productos en paralelo para mayor eficiencia
        const [allCategories, allProducts] = await Promise.all([
            CategoryService.getAll(),
            ProductService.getAll(true, queryOptions) // Pedimos la página actual con filtros
        ]);

        // --- Estado de la tabla (filtros y ordenamiento) ---
        state.products = allProducts.products;

        // Función para renderizar la tabla con los productos filtrados
        const renderTable = () => {
            const productsToRender = state.products;
            tableBody.innerHTML = ''; // Limpiamos la tabla
            if (productsToRender.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="7">No se encontraron productos con los filtros aplicados.</td></tr>';
                return;
            }

            productsToRender.forEach(product => {
                const category = allCategories.find(cat => cat.id === product.category_id);
                const categoryName = category ? category.name : 'Sin categoría';

                // Definimos el texto y la clase del botón de estado
                const toggleButtonText = product.is_active ? 'Desactivar' : 'Activar';
                const rowClass = product.is_active ? '' : 'inactive-product';

                const productRow = document.createElement('tr');
                productRow.innerHTML = `
                    <td>
                        <img src="/C_C/backend/api/products/${product.id}/image" alt="${product.name}" class="table-img-preview">
                    </td>
                    <td>${product.name}</td>
                    <td>${categoryName}</td>
                    <td>${product.price}</td>
                    <td>${product.size || 'N/A'}</td>
                    <td>
                        <span class="status ${product.is_active ? 'active' : 'inactive'}">
                            ${product.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                    </td>
                    <td class="actions">
                        <a href="edit-product.html?id=${product.id}" class="admin-btn">Editar</a>
                        <button class="admin-btn danger" data-id="${product.id}">Eliminar</button>
                        <button class="admin-btn toggle-status" data-id="${product.id}">${toggleButtonText}</button>
                    </td>
                `;
                tableBody.appendChild(productRow);
            });
        };

        // Función para manejar los cambios en los filtros
        const handleFilterChange = () => {
            const nameFilter = filterNameInput.value;
            const categoryFilter = filterCategorySelect.value;
            const statusFilter = filterStatusSelect.value;
            // Volvemos a cargar desde la página 1 con los nuevos filtros
            loadProductsAdminPage(1, { name: nameFilter, category: categoryFilter, status: statusFilter });
        };

        // --- MEJORA: Implementación de Debounce para evitar peticiones excesivas ---
        let debounceTimer;
        const debouncedFilterChange = () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                handleFilterChange();
            }, 400); // Espera 400ms después de la última pulsación antes de buscar
        };

        // --- Inicialización ---

        // Populamos el dropdown de categorías para el filtro
        filterCategorySelect.innerHTML = '<option value="all">Todas las categorías</option>';
        allCategories.forEach(cat => {
            // CORRECCIÓN: La API devuelve la propiedad como 'name' debido a un alias.
            filterCategorySelect.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
        });

        // --- MEJORA: Preservar el estado de los filtros en la UI ---
        filterNameInput.value = filters.name || '';
        filterCategorySelect.value = filters.category || 'all';
        filterStatusSelect.value = filters.status || 'all';

        // Añadimos los event listeners a los filtros
        filterNameInput.addEventListener('input', debouncedFilterChange);
        filterCategorySelect.addEventListener('change', handleFilterChange); // 'change' no necesita debounce
        filterStatusSelect.addEventListener('change', handleFilterChange); // 'change' no necesita debounce

        // Añadimos listeners a los encabezados de tabla ordenables
        document.querySelectorAll('.product-table th.sortable').forEach(header => {
            header.addEventListener('click', () => {
                const column = header.dataset.sort;
                let newSortDirection = 'asc';
                if (state.sortColumn === column) {
                    newSortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
                }
                
                const currentFilters = {
                    name: filterNameInput.value,
                    category: filterCategorySelect.value,
                    status: filterStatusSelect.value,
                    sortBy: column,
                    sortOrder: newSortDirection
                };
                loadProductsAdminPage(1, currentFilters);

                // Actualizar clases CSS para los indicadores visuales
                document.querySelectorAll('.product-table th.sortable').forEach(th => th.classList.remove('sort-asc', 'sort-desc'));
                header.classList.add(state.sortDirection === 'asc' ? 'sort-asc' : 'sort-desc');

                // Aquí se podría implementar ordenamiento en el backend también, por ahora es solo visual
            });
        });

        // Renderizado inicial de la tabla
        renderTable();

        // Renderizado de la paginación
        renderPagination(allProducts.totalPages, allProducts.currentPage);

    } catch (error) {
        console.error('Error al cargar la página de administración de productos:', error);
        tableBody.innerHTML = '<tr><td colspan="7">Error al cargar los productos. Revise la consola.</td></tr>';
    }

    // Añadimos el listener para los botones de eliminar después de renderizar la tabla
    tableBody.addEventListener('click', async (e) => {
        if (e.target.classList.contains('danger') && e.target.dataset.id) {
            const productId = e.target.dataset.id;
            if (confirm('¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.')) {
                await ProductService.delete(productId);
                // Recargamos la página actual para reflejar los cambios
                const currentPage = parseInt(paginationContainer.querySelector('.active')?.textContent || '1');
                loadProductsAdminPage(currentPage);
            }
        } else if (e.target.classList.contains('toggle-status')) {
            const productId = e.target.dataset.id;
            const row = e.target.closest('tr');
            const statusSpan = row.querySelector('.status');

            try {
                const result = await ProductService.toggleStatus(productId);
                if (result.success) {
                    statusSpan.textContent = result.newStatus ? 'Activo' : 'Inactivo';
                    statusSpan.className = `status ${result.newStatus ? 'active' : 'inactive'}`;
                    row.classList.toggle('inactive-product', !result.newStatus);
                    e.target.textContent = result.newStatus ? 'Desactivar' : 'Activar';
                }
            } catch (error) {
                showNotification('Error al cambiar el estado del producto.', 'error');
            }
        }
    });

    function renderPagination(totalPages, currentPage) {
        let paginationHTML = '';
        if (!paginationContainer || totalPages <= 1) return;

        if (currentPage > 1) {
            paginationHTML += `<button class="pagination-btn" data-page="${currentPage - 1}">&laquo; Anterior</button>`;
        }

        for (let i = 1; i <= totalPages; i++) {
            const activeClass = i === currentPage ? 'active' : '';
            paginationHTML += `<button class="pagination-btn ${activeClass}" data-page="${i}">${i}</button>`;
        }

        if (currentPage < totalPages) {
            paginationHTML += `<button class="pagination-btn" data-page="${currentPage + 1}">Siguiente &raquo;</button>`;
        }

        if (paginationContainer) paginationContainer.innerHTML = paginationHTML;

        paginationContainer.querySelectorAll('.pagination-btn').forEach(button => {
            button.addEventListener('click', () => {
                const currentFilters = {
                    name: filters.name,
                    category: filters.category,
                    status: filters.status,
                    sortBy: filters.sortBy,
                    sortOrder: filters.sortOrder
                };
                const newPage = parseInt(button.dataset.page);
                loadProductsAdminPage(newPage, currentFilters);
            });
        });
    }
}

/**
 * Carga y gestiona la página de categorías.
 */
async function loadCategoriesAdminPage() {
    const tableBody = document.getElementById('categories-table-body');
    const addForm = document.getElementById('addCategoryForm');

    async function renderCategories() {
        tableBody.innerHTML = '<tr class="loader-row"><td colspan="2"><div class="spinner"></div></td></tr>';
        try {
            const categories = await CategoryService.getAll();
            if (categories.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="2">No hay categorías creadas.</td></tr>';
                return;
            }
            tableBody.innerHTML = categories.map(cat => `
                <tr>
                    <td>${cat.name}</td>
                    <td class="actions">
                        <button class="admin-btn danger" data-id="${cat.id}">Eliminar</button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            tableBody.innerHTML = '<tr><td colspan="2">Error al cargar las categorías.</td></tr>';
        }
    }

    addForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const categoryNameInput = document.getElementById('category-name');
        const name = categoryNameInput.value.trim();
        if (name) {
            await CategoryService.add({ name });
            categoryNameInput.value = '';
            renderCategories(); // Recargar la lista
        }
    });

    // Event listener para los botones de eliminar (usando delegación de eventos)
    tableBody.addEventListener('click', async (e) => {
        if (e.target.classList.contains('danger')) {
            const categoryId = e.target.dataset.id;
            if (confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
                const result = await CategoryService.delete(categoryId);
                if (result.success) {
                    // Si la eliminación fue exitosa, eliminamos la fila y mostramos notificación de éxito.
                    e.target.closest('tr').remove();
                    showNotification('Categoría eliminada con éxito.', 'success');
                } else {
                    // Si hubo un error (ej: categoría en uso), mostramos el mensaje de error del backend.
                    showNotification(result.message || 'No se pudo eliminar la categoría.', 'error');
                }
            }
        }
    });

    renderCategories(); // Carga inicial
}

/**
 * Carga las categorías en un <select> para los formularios de productos.
 * @param {string} selectId - El ID del elemento <select>.
 * @param {number|null} selectedCategoryId - El ID de la categoría que debe estar preseleccionada.
 */
async function populateCategoriesDropdown(selectId, selectedCategoryId = null) {
    const selectElement = document.getElementById(selectId);
    try {
        const categories = await CategoryService.getAll();
        selectElement.innerHTML = '<option value="">Selecciona una categoría</option>';
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name;
            if (cat.id === selectedCategoryId) {
                option.selected = true;
            }
            selectElement.appendChild(option);
        });
    } catch (error) {
        selectElement.innerHTML = '<option value="">Error al cargar categorías</option>';
    }
}

/**
 * Prepara la página para añadir un nuevo producto.
 */
async function loadAddProductPage() {
    await populateCategoriesDropdown('product-category');

    const addForm = document.getElementById('addProductForm');
    addForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(addForm);
        
        // Renombramos los campos para que coincidan con el backend si es necesario
        // En este caso, los nombres del formulario coinciden con los de la BD
        // (name, category_id, price, etc.)

        try {
            const newProduct = await ProductService.add(formData);
            showNotification(`Producto "${newProduct.name}" añadido con éxito.`, 'success');
            window.location.href = 'dashboard.html';
        } catch (error) {
            showNotification('Error al añadir el producto. Revisa la consola.', 'error');
            console.error(error);
        }
    });
}

/**
 * Prepara la página para editar un producto existente.
 */
async function loadEditProductPage() {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');
    if (!productId) {
        alert('No se ha especificado un producto para editar.');
        window.location.href = 'dashboard.html';
        return;
    }

    // Obtenemos los datos del producto y las categorías en paralelo
    const [product, _] = await Promise.all([
        ProductService.getById(productId),
        populateCategoriesDropdown('product-category') // Llenamos el dropdown mientras esperamos
    ]);

    if (!product) {
        alert('Producto no encontrado.');
        return;
    }

    // Rellenamos el formulario con los datos del producto
    document.getElementById('product-id').value = product.id;
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-category').value = product.category_id;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-size').value = product.size || '';
    document.getElementById('product-description').value = product.description || '';

    // Mostramos la imagen actual
    const imagePreview = document.querySelector('#current-image-preview img');
    imagePreview.src = `/C_C/backend/api/products/${product.id}/image`;
    imagePreview.style.display = 'block';

    // Lógica para el envío del formulario de edición
    const editForm = document.getElementById('editProductForm');
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(editForm);
        const updatedProduct = await ProductService.update(productId, formData);
        showNotification(`Producto actualizado con éxito.`, 'success');
        window.location.href = 'dashboard.html';
    });
}

/**
 * Carga y gestiona la página de administración de banners.
 */
async function loadBannersAdminPage() {
    const tableBody = document.getElementById('banners-table-body');
    const addForm = document.getElementById('addBannerForm');
    const settingsForm = document.getElementById('bannerSettingsForm');
    const saveOrderBtn = document.getElementById('save-banner-order-btn');

    async function renderBanners() {
        tableBody.innerHTML = '<tr class="loader-row"><td colspan="4"><div class="spinner"></div></td></tr>';
        try {
            const banners = await BannerService.getAll();
            if (banners.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="3">No hay banners para mostrar.</td></tr>';
            }

            // Mejora: Ordenamos los banners por la columna 'orden' de la BD
            // y luego les asignamos un número consecutivo para mostrar.
            const sortedBanners = banners.sort((a, b) => a.orden - b.orden);

            tableBody.innerHTML = sortedBanners.map((banner, index) => {
                const displayOrder = index + 1; // Creamos el número de orden consecutivo (1, 2, 3...)
                const statusClass = banner.activo ? 'active' : 'inactive';
                const statusText = banner.activo ? 'Activo' : 'Inactivo';
                const toggleButtonText = banner.activo ? 'Desactivar' : 'Activar';
                const rowClass = banner.activo ? '' : 'inactive-product';

                return `
                <tr class="${rowClass}" data-id="${banner.id}">
                    <td>
                        <img src="/backend/api/banners/${banner.id}/image" alt="Banner ${banner.id}" class="table-img-preview">
                    </td>
                    <td>${displayOrder}</td>
                    <td>
                        <span class="status ${statusClass}">${statusText}</span>
                    </td>
                    <td class="actions">
                        <button class="admin-btn toggle-status" data-id="${banner.id}">${toggleButtonText}</button>
                        <button class="admin-btn danger" data-id="${banner.id}">Eliminar</button>
                    </td>
                </tr>
            `}).join('');
        } catch (error) {
            console.error('Error al cargar los banners:', error);
            tableBody.innerHTML = '<tr><td colspan="4">Error al cargar los banners.</td></tr>';
        }
    }

    // Inicializar la funcionalidad de arrastrar y soltar
    const sortable = new Sortable(tableBody, {
        animation: 150, // Animación suave al arrastrar
        handle: 'tr', // Permite arrastrar desde cualquier parte de la fila
        onUpdate: () => {
            // Mostramos el botón de guardar solo cuando se ha hecho un cambio.
            saveOrderBtn.style.display = 'inline-block';
        }
    });

    // Guardar el nuevo orden
    saveOrderBtn.addEventListener('click', async () => {
        const orderedIds = sortable.toArray(); // Obtiene los IDs en el nuevo orden
        await BannerService.updateOrder(orderedIds);
        showNotification('Orden de los banners guardado con éxito.', 'success');
        saveOrderBtn.style.display = 'none'; // Ocultamos el botón de nuevo
        // Recargamos para mostrar el número de orden actualizado
        renderBanners();
    });

    addForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(addForm);
        if (formData.get('banner-image').size > 0) {
            await BannerService.add(formData);
            addForm.reset();
            renderBanners(); // Recargar la lista
        } else {
            alert('Por favor, selecciona una imagen para el banner.');
        }
    });

    // Lógica para el formulario de ajustes de velocidad
    const speedInput = document.getElementById('banner-speed');
    // Cargar la velocidad guardada al iniciar
    const currentSpeedMs = localStorage.getItem('bannerSpeed') || 5000;
    speedInput.value = currentSpeedMs / 1000;

    settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const speedInSeconds = speedInput.value;
        localStorage.setItem('bannerSpeed', speedInSeconds * 1000);
        showNotification(`Velocidad guardada en ${speedInSeconds} segundos.`, 'success');
    });

    tableBody.addEventListener('click', async (e) => {
        const target = e.target;
        if (target.classList.contains('danger')) {
            const bannerId = e.target.dataset.id;
            if (confirm('¿Estás seguro de que quieres eliminar este banner?')) {
                await BannerService.delete(bannerId);
                renderBanners(); // Recargar la lista
            }
        } else if (target.classList.contains('toggle-status')) {
            const bannerId = target.dataset.id;
            const row = target.closest('tr');
            const statusSpan = row.querySelector('.status');

            try {
                const result = await BannerService.toggleStatus(bannerId);
                if (result.success) {
                    statusSpan.textContent = result.newStatus ? 'Activo' : 'Inactivo';
                    statusSpan.className = `status ${result.newStatus ? 'active' : 'inactive'}`;
                    target.textContent = result.newStatus ? 'Desactivar' : 'Activar';
                    row.classList.toggle('inactive-product', !result.newStatus);
                }
            } catch (error) {
                showNotification('Error al cambiar el estado del banner.', 'error');
            }
        }
    });

    renderBanners(); // Carga inicial
}