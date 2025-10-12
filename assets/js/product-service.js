// ==================== SERVICIO DE PRODUCTOS (API Backend) ====================
// Este servicio maneja la lógica para obtener, añadir, editar y eliminar productos
// interactuando con un backend a través de una API REST.

const ProductService = {
    // La URL base de nuestra futura API.
    // Por ahora, apunta a un servidor local, pero podría ser cualquier URL en producción.
    _apiUrl: 'http://localhost:3000/api/products',

    // NOTA: Los métodos ahora son 'async' porque las peticiones de red no son instantáneas.
    // El código que los usa (admin.js, script.js) deberá ser ajustado para manejar esto.
    // Por simplicidad en esta explicación, mantenemos la estructura síncrona en el resto de archivos,
    // pero en un proyecto real, se usaría async/await en todo el flujo.

    // Obtiene todos los productos
    getAll: async function() {
        try {
            const response = await fetch(this._apiUrl);
            if (!response.ok) throw new Error('Error al obtener los productos.');
            return await response.json();
        } catch (error) {
            console.error('ProductService Error:', error);
            return []; // Devuelve un array vacío en caso de error
        }
    },

    // Obtiene un producto por su ID
    getById: async function(id) {
        try {
            const response = await fetch(`${this._apiUrl}/${id}`);
            if (!response.ok) throw new Error('Producto no encontrado.');
            return await response.json();
        } catch (error) {
            console.error('ProductService Error:', error);
            return null; // Devuelve null si no se encuentra o hay un error
        }
    },

    // Añade un nuevo producto
    add: async function(productData) {
        try {
            const response = await fetch(this._apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
            if (!response.ok) throw new Error('Error al añadir el producto.');
            return await response.json();
        } catch (error) {
            console.error('ProductService Error:', error);
            return null;
        }
    },

    // Actualiza un producto existente
    update: async function(updatedProduct) {
        try {
            const response = await fetch(`${this._apiUrl}/${updatedProduct.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedProduct)
            });
            if (!response.ok) throw new Error('Error al actualizar el producto.');
            return await response.json();
        } catch (error) {
            console.error('ProductService Error:', error);
            return null;
        }
    },

    // Elimina un producto por su ID
    delete: async function(id) {
        try {
            const response = await fetch(`${this._apiUrl}/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Error al eliminar el producto.');
            // La respuesta de un DELETE exitoso a menudo no tiene cuerpo,
            // así que solo confirmamos que todo fue bien.
            return { success: true };
        } catch (error) {
            console.error('ProductService Error:', error);
            return { success: false };
        }
    }
};

// NOTA IMPORTANTE:
// El código en `admin.js` y `script.js` ahora necesita ser modificado para usar `async/await`
// al llamar a estas funciones. Por ejemplo:
// const products = await ProductService.getAll();
// Esto asegura que el código espera la respuesta de la API antes de continuar.