// ==================== SERVICIO DE PRODUCTOS (CONEXIÓN CON BACKEND) ====================
// Este archivo es la ÚNICA capa que se comunica con el backend.
// Actúa como un puente: el resto del código (admin.js, script.js) le pide datos
// y este servicio se encarga de obtenerlos de la API.

const ProductService = {
    // --- PUNTO DE CONFIGURACIÓN ---
    // El backend debe estar corriendo en esta URL. Cambiar si es necesario.
    _apiUrl: 'http://localhost:3000/api/products',

    /**
     * Obtiene todos los productos.
     * --- CONEXIÓN BACKEND ---
     * El backend debe implementar un endpoint en: GET /api/products
     * que devuelva un array de objetos JSON con todos los productos.
     * Ejemplo de respuesta: [{id: "1", name: "Torta", ...}, {id: "2", name: "Galleta", ...}]
     */
    getAll: async function() {
        try {
            // No es necesario cambiar esta lógica.
            const response = await fetch(this._apiUrl);
            if (!response.ok) throw new Error('Error al obtener los productos.');
            return await response.json();
        } catch (error) {
            console.error('ProductService Error:', error);
            return []; // Devuelve un array vacío en caso de error
        }
    },

    /**
     * Obtiene un producto por su ID.
     * --- CONEXIÓN BACKEND ---
     * El backend debe implementar un endpoint en: GET /api/products/:id
     * que devuelva un único objeto JSON con los datos del producto solicitado.
     * Ejemplo de respuesta: {id: "1", name: "Torta de Chocolate", ...}
     */
    getById: async function(id) {
        try {
            // No es necesario cambiar esta lógica.
            const response = await fetch(`${this._apiUrl}/${id}`);
            if (!response.ok) throw new Error('Producto no encontrado.');
            return await response.json();
        } catch (error) {
            console.error('ProductService Error:', error);
            return null; // Devuelve null si no se encuentra o hay un error
        }
    },

    /**
     * Añade un nuevo producto.
     * --- CONEXIÓN BACKEND ---
     * El backend debe implementar un endpoint en: POST /api/products
     * que reciba un objeto JSON en el body con los datos del nuevo producto.
     * Debe devolver el producto recién creado, incluyendo el ID asignado por la base de datos.
     * Ejemplo de body recibido: {name: "Nuevo Kuchen", price: "$15.000", ...}
     */
    add: async function(productData) {
        try {
            // No es necesario cambiar esta lógica.
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

    /**
     * Actualiza un producto existente.
     * --- CONEXIÓN BACKEND ---
     * El backend debe implementar un endpoint en: PUT /api/products/:id
     * que reciba un objeto JSON en el body con los datos actualizados del producto.
     * Debe devolver el producto ya actualizado.
     * Ejemplo de body recibido: {id: "1", name: "Torta de Chocolate (Editado)", ...}
     */
    update: async function(updatedProduct) {
        try {
            // No es necesario cambiar esta lógica.
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

    /**
     * Elimina un producto por su ID.
     * --- CONEXIÓN BACKEND ---
     * El backend debe implementar un endpoint en: DELETE /api/products/:id
     * que elimine el producto de la base de datos.
     * No es necesario que devuelva un body, con un status 200 o 204 es suficiente.
     */
    delete: async function(id) {
        try {
            // No es necesario cambiar esta lógica.
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