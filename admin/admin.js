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

    const renderTable = async () => {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Cargando productos...</td></tr>';
        const products = await ProductService.getAll();
        tableBody.innerHTML = ''; // Limpiar mensaje de "cargando"

        if (products.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No hay productos para mostrar.</td></tr>';
            return;
        }

        products.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><img src="${product.img}" alt="${product.name}"></td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>${product.price}</td>
                <td class="action-buttons">
                    <a href="edit-product.html?id=${product.id}" class="admin-btn edit"><i class="fas fa-edit"></i> Editar</a>
                    <button class="admin-btn delete" data-id="${product.id}"><i class="fas fa-trash"></i> Eliminar</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    };

    tableBody.addEventListener('click', async (event) => {
        const deleteButton = event.target.closest('.delete');
        if (deleteButton) {
            const productId = deleteButton.dataset.id;
            if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
                await ProductService.delete(productId);
                showNotification('Producto eliminado con éxito.', 'success');
                await renderTable(); // Re-renderizar la tabla inmediatamente
            }
        }
    });

    await renderTable();
}

/**
 * Inicializa la lógica para la página de añadir producto.
 */
function initAddProductPage() {
    const form = document.getElementById('addProductForm');
    if (!form) return;

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const productData = {
            name: formData.get('product-name'),
            category: formData.get('product-category'),
            price: formData.get('product-price'),
            img: formData.get('product-image') || 'https://via.placeholder.com/400x220.png?text=Sin+Imagen'
        };
        await ProductService.add(productData);
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

    // Rellenar el formulario con los datos del producto
    document.getElementById('product-id').value = product.id;
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-category').value = product.category;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-image').value = product.img;

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const updatedProduct = {
            id: formData.get('product-id'),
            name: formData.get('product-name'),
            category: formData.get('product-category'),
            price: formData.get('product-price'),
            img: formData.get('product-image') || 'https://via.placeholder.com/400x220.png?text=Sin+Imagen'
        };
        await ProductService.update(updatedProduct);
        redirectWithNotification('¡Producto actualizado con éxito!', 'dashboard.html');
    });
}

// ==================== ENRUTADOR PRINCIPAL ====================

document.addEventListener('DOMContentLoaded', () => {
    const pageInitializers = {
        'admin-dashboard': initDashboardPage,
        'admin-add-product': initAddProductPage,
        'admin-edit-product': initEditProductPage,
    };

    const pageId = document.body.id;
    const initFunction = pageInitializers[pageId];

    if (initFunction) {
        initFunction();
    }
});