// Lógica para el panel de administración de PastelArte

// ==================== FUNCIÓN DE NOTIFICACIÓN ====================
/**
 * Muestra una notificación flotante en la pantalla.
 * @param {string} message El mensaje a mostrar.
 * @param {'success'|'error'} type El tipo de notificación.
 */
function showNotification(message, type = 'success') {
    // Busca el contenedor de notificaciones. Si no existe, lo crea y lo añade al body.
    const container = document.getElementById('notification-container');
    if (!container) {
        console.error('El elemento #notification-container no se encuentra en el HTML.');
        // Como fallback, usamos un alert simple si el contenedor no existe.
        alert(message);
        return;
    }

    // Crea y añade la notificación al contenedor.
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    container.appendChild(notification);

    // La notificación se elimina sola después de 3 segundos (la animación dura 0.5s + 2.5s)
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

/**
 * Muestra una notificación y redirige a una URL después de un breve retraso.
 * @param {string} message Mensaje para la notificación.
 * @param {string} url URL a la que se redirigirá.
 * @param {'success'|'error'} type Tipo de notificación.
 */
function redirectWithNotification(message, url, type = 'success') {
    showNotification(message, type);
    setTimeout(() => {
        window.location.href = url;
    }, 1500); // Retraso para que el usuario pueda leer la notificación.
}

// ==================== INICIALIZADORES DE PÁGINA ====================

/**
 * Inicializa la lógica para la página del dashboard.
 */
async function initDashboardPage() {
    const tableBody = document.querySelector('.product-table tbody');
    if (!tableBody) return;

    // 1. Función para renderizar la tabla
    async function renderTable() {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Cargando productos...</td></tr>';
        const products = await ProductService.getAll(true); // Pedimos TODOS los productos para el admin
        tableBody.innerHTML = ''; // Limpiar mensaje de "cargando"
        if (products.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No hay productos para mostrar.</td></tr>';
            return;
        }

        products.forEach(product => {
            const row = document.createElement('tr');
            // Añadimos una clase si el producto está inactivo para poder darle un estilo diferente
            if (!product.is_active) {
                row.classList.add('inactive-product');
            }
            row.innerHTML = `
                <td><img src="${product.img}" alt="${product.name}"></td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>${product.price}</td>
                <td>${product.size || 'N/A'}</td>
                <td>${product.is_active ? '<span class="status-active">Activo</span>' : '<span class="status-inactive">Inactivo</span>'}</td>
                <td class="action-buttons">
                    <button class="admin-btn toggle-status" data-id="${product.id}">${product.is_active ? 'Deshabilitar' : 'Habilitar'}</button>
                    <a href="edit-product.html?id=${product.id}" class="admin-btn edit"><i class="fas fa-edit"></i> Editar</a>
                    <button class="admin-btn delete" data-id="${product.id}"><i class="fas fa-trash"></i> Eliminar</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // 2. Función para manejar los clics en la tabla
    async function handleTableClick(event) {
        const deleteButton = event.target.closest('.delete');
        const toggleButton = event.target.closest('.toggle-status');

        if (deleteButton) {
            const productId = deleteButton.dataset.id;
            if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
                await ProductService.delete(productId);
                showNotification('Producto eliminado con éxito.', 'success');
                await renderTable(); // Re-renderizar la tabla inmediatamente
            }
        }

        if (toggleButton) {
            const productId = toggleButton.dataset.id;
            if (confirm('¿Estás seguro de que quieres cambiar el estado de este producto?')) {
                await ProductService.toggleStatus(productId); // 1. Espera a que el backend confirme el cambio.
                await renderTable(); // 2. Vuelve a dibujar la tabla con los datos actualizados.
            }
        }
    }

    // 3. Asignar el manejador de eventos y renderizar la tabla por primera vez
    tableBody.addEventListener('click', handleTableClick);
    await renderTable();
}

/**
 * Rellena un <select> con las categorías obtenidas de la base de datos.
 * @param {string} selectId - El ID del elemento <select> a rellenar.
 * @param {string|number|null} selectedValue - El valor que debe quedar seleccionado (opcional).
 */
async function populateCategoryDropdown(selectId, selectedValue = null) {
    const selectElement = document.getElementById(selectId);
    if (!selectElement) return;

    const categories = await CategoryService.getAll();
    selectElement.innerHTML = '<option value="">Selecciona una categoría</option>'; // Opción por defecto

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id; // Usamos el ID numérico como valor
        option.textContent = category.nombre;
        if (selectedValue && category.id == selectedValue) {
            option.selected = true;
        }
        selectElement.appendChild(option);
    });
}

/**
 * Inicializa la lógica para la página de añadir producto.
 */
async function initAddProductPage() {
    const form = document.getElementById('addProductForm');
    if (!form) return;

    // Rellenar el dropdown de categorías
    await populateCategoryDropdown('product-category');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        // Usamos FormData para poder enviar el archivo de imagen
        const formData = new FormData(form);

        // El nombre del campo en formData.append debe coincidir con el de upload.single() en el backend
        // formData.append('product-image', document.getElementById('product-image').files[0]);
        // FormData ya lo hace automáticamente si el input tiene name="product-image"

        await ProductService.add(formData); // Enviamos el objeto FormData directamente
        redirectWithNotification('¡Producto añadido con éxito!', 'dashboard.html');
    });
}

/**
 * Inicializa la lógica para la página de editar producto.
 */
async function initEditProductPage() {
    const form = document.getElementById('editProductForm');
    if (!form) return;

    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    if (!productId) {
        redirectWithNotification('ID de producto no especificado.', 'dashboard.html', 'error');
        return;
    }

    const product = await ProductService.getById(productId);

    if (!product) {
        redirectWithNotification('Producto no encontrado.', 'dashboard.html', 'error');
        return;
    }

    // Rellenar el dropdown de categorías y seleccionar la correcta
    await populateCategoryDropdown('product-category', product.category_id);

    // Rellenar el formulario con los datos del producto
    document.getElementById('product-id').value = product.id;
    document.getElementById('product-name').value = product.name;
    // El precio se guarda como número, lo formateamos para mostrarlo si es necesario, o lo dejamos como número.
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-size').value = product.size || '';
    document.getElementById('product-description').value = product.description || '';
    
    // --- ¡AQUÍ ESTÁ LA MEJORA! ---
    // Mostramos la imagen actual del producto.
    const imagePreview = document.querySelector('#current-image-preview img');
    if (product.img && imagePreview) {
        imagePreview.src = product.img;
        imagePreview.style.display = 'block';
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        // Usamos FormData para poder enviar el archivo de imagen si se selecciona uno nuevo
        const formData = new FormData(form);
        const id = formData.get('product-id');

        // El servicio se encargará de enviar el FormData
        await ProductService.update(id, formData);
        redirectWithNotification('¡Producto actualizado con éxito!', 'dashboard.html');
    });
}

/**
 * Inicializa la lógica para la página de gestión de categorías.
 */
async function initManageCategoriesPage() {
    const tableBody = document.getElementById('categories-table-body');
    const form = document.getElementById('addCategoryForm');
    if (!tableBody || !form) return;

    // Función para renderizar la tabla de categorías
    const renderCategories = async () => {
        tableBody.innerHTML = '<tr><td colspan="2" style="text-align:center;">Cargando categorías...</td></tr>';
        const categories = await CategoryService.getAll();
        tableBody.innerHTML = '';

        if (categories.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="2" style="text-align:center;">No hay categorías para mostrar.</td></tr>';
            return;
        }

        categories.forEach(category => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${category.nombre}</td>
                <td class="action-buttons">
                    <button class="admin-btn edit-category" data-id="${category.id}" data-name="${category.nombre}"><i class="fas fa-edit"></i> Editar</button>
                    <button class="admin-btn delete-category" data-id="${category.id}"><i class="fas fa-trash"></i> Eliminar</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    };

    // Manejar la adición de una nueva categoría
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const categoryNameInput = document.getElementById('category-name');
        const newName = categoryNameInput.value.trim();
        if (newName) {
            await CategoryService.add({ nombre: newName });
            showNotification('Categoría añadida con éxito.');
            categoryNameInput.value = ''; // Limpiar el input
            await renderCategories();
        }
    });

    // Manejar clics en botones de editar y eliminar
    tableBody.addEventListener('click', async (event) => {
        const editButton = event.target.closest('.edit-category');
        const deleteButton = event.target.closest('.delete-category');

        if (editButton) {
            const categoryId = editButton.dataset.id;
            const currentName = editButton.dataset.name;
            const newName = prompt('Introduce el nuevo nombre para la categoría:', currentName);
            if (newName && newName.trim() !== '' && newName !== currentName) {
                await CategoryService.update(categoryId, { nombre: newName });
                showNotification('Categoría actualizada con éxito.');
                await renderCategories();
            }
        }

        if (deleteButton) {
            const categoryId = deleteButton.dataset.id;
            if (confirm('¿Estás seguro de que quieres eliminar esta categoría? Ten en cuenta que los productos asociados a ella no se eliminarán, pero quedarán sin categoría visible.')) {
                await CategoryService.delete(categoryId);
                showNotification('Categoría eliminada con éxito.');
                await renderCategories();
            }
        }
    });

    await renderCategories();
}

/**
 * Inicializa la lógica para la página de gestión de banners.
 */
async function initManageBannersPage() {
    const tableBody = document.getElementById('banners-table-body');
    const form = document.getElementById('addBannerForm');
    if (!tableBody || !form) return;

    // Función para renderizar la tabla de banners
    const renderBanners = async () => {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Cargando banners...</td></tr>';
        const banners = await BannerService.getAll();
        tableBody.innerHTML = '';

        if (banners.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No hay banners para mostrar.</td></tr>';
            return;
        }

        banners.forEach(banner => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><img src="${banner.img}" alt="${banner.titulo || 'Banner'}"></td>
                <td>${banner.titulo || 'Sin título'}</td>
                <td>${banner.activo ? '<span class="status-active">Activo</span>' : '<span class="status-inactive">Inactivo</span>'}</td>
                <td>${banner.orden}</td>
                <td class="action-buttons">
                    <button class="admin-btn toggle-status-banner" data-id="${banner.id}">${banner.activo ? 'Deshabilitar' : 'Habilitar'}</button>
                    <button class="admin-btn delete-banner" data-id="${banner.id}"><i class="fas fa-trash"></i> Eliminar</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    };

    // Manejar la adición de un nuevo banner
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        await BannerService.add(formData);
        showNotification('Banner añadido con éxito.');
        form.reset(); // Limpiar el formulario
        await renderBanners();
    });

    // Manejar clics en botones de la tabla
    tableBody.addEventListener('click', async (event) => {
        const toggleButton = event.target.closest('.toggle-status-banner');
        const deleteButton = event.target.closest('.delete-banner');

        if (toggleButton) {
            const bannerId = toggleButton.dataset.id;
            await BannerService.toggleStatus(bannerId);
            await renderBanners();
        }

        if (deleteButton) {
            const bannerId = deleteButton.dataset.id;
            if (confirm('¿Estás seguro de que quieres eliminar este banner?')) {
                await BannerService.delete(bannerId);
                showNotification('Banner eliminado con éxito.');
                await renderBanners();
            }
        }
    });

    await renderBanners();
}

// ==================== ENRUTADOR PRINCIPAL ====================

document.addEventListener('DOMContentLoaded', () => {
    const pageInitializers = {
        'admin-dashboard': initDashboardPage,
        'admin-add-product': initAddProductPage,
        'admin-edit-product': initEditProductPage,
        'admin-manage-categories': initManageCategoriesPage,
        'admin-manage-banners': initManageBannersPage,
    };

    const pageId = document.body.id;
    const initFunction = pageInitializers[pageId];

    if (initFunction) {
        initFunction();
    }
});