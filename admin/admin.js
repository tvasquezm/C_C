// Lógica para el panel de administración de PastelArte

// ==================== LÓGICA DE LAS PÁGINAS ====================

document.addEventListener('DOMContentLoaded', () => {
    const pageId = document.body.id;

    // --- Lógica para la página del Dashboard ---
    if (pageId === 'admin-dashboard') {
        const tableBody = document.querySelector('.product-table tbody');

        const renderTable = () => {
            tableBody.innerHTML = ''; // Limpiar tabla
            const products = ProductService.getAll();

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

        tableBody.addEventListener('click', (event) => {
            if (event.target.closest('.delete')) {
                const button = event.target.closest('.delete');
                const productId = button.dataset.id;
                if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
                    ProductService.delete(productId);
                    renderTable(); // Volver a renderizar la tabla
                }
            }
        });

        renderTable();
    }

    // --- Lógica para la página de Añadir Producto ---
    if (pageId === 'admin-add-product') {
        const form = document.getElementById('addProductForm');
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const formData = new FormData(form);
            const productData = {
                name: formData.get('product-name'),
                category: formData.get('product-category'),
                price: formData.get('product-price'),
                img: formData.get('product-image') || 'https://via.placeholder.com/400x220.png?text=Sin+Imagen'
            };
            ProductService.add(productData);
            alert('¡Producto añadido con éxito!');
            window.location.href = 'dashboard.html';
        });
    }

    // --- Lógica para la página de Editar Producto ---
    if (pageId === 'admin-edit-product') {
        const form = document.getElementById('editProductForm');
        const params = new URLSearchParams(window.location.search);
        const productId = params.get('id');

        const product = ProductService.getById(productId);

        if (product) {
            // Rellenar el formulario
            document.getElementById('product-id').value = product.id;
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-category').value = product.category;
            document.getElementById('product-price').value = product.price;
            document.getElementById('product-image').value = product.img;
        } else {
            alert('Producto no encontrado.');
            window.location.href = 'dashboard.html';
        }

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const formData = new FormData(form);
            const updatedProduct = {
                id: formData.get('product-id'),
                name: formData.get('product-name'),
                category: formData.get('product-category'),
                price: formData.get('product-price'),
                img: formData.get('product-image')
            };
            ProductService.update(updatedProduct);
            alert('¡Producto actualizado con éxito!');
            window.location.href = 'dashboard.html';
        });
    }
});