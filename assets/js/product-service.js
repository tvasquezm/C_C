// ==================== SERVICIO DE PRODUCTOS (CONEXIÓN CON BACKEND) ====================
// Este archivo es la capa que se comunica con el backend para gestionar los productos.

const ProductService = {
    // --- PUNTO DE CONFIGURACIÓN ---
    // Apuntamos a la URL de nuestra API creada con Node.js y Express.
    _apiUrl: 'http://localhost:3000/api/products',

   /**
    * Obtiene productos desde el backend.
    * @param {boolean} all - Si es true, obtiene todos (para admin). Si es false, solo los activos (para el público).
    */
    getAll: async function(all = false) {
        try {
            // El sitio público llamará a /api/products/active
            // El admin llamará a /api/products
            const url = all ? this._apiUrl : `${this._apiUrl}/active`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Error al obtener los productos.');
            return await response.json();
        } catch (error) {
            console.error('ProductService Error:', error);
            return [];
        }
    },

    /**
     * Obtiene un producto por su ID desde el backend.
     * --- CONEXIÓN BACKEND ---
     * Endpoint: GET /api/products/:id
     */
    getById: async function(id) {
        try {
            const response = await fetch(`${this._apiUrl}/${id}`);
            if (!response.ok) throw new Error('Producto no encontrado.');
            return await response.json();
        } catch (error) {
            console.error('ProductService Error:', error);
            return null;
        }
    },

    /**
     * Obtiene productos por ID de categoría desde el backend.
     * --- CONEXIÓN BACKEND ---
     * Endpoint: GET /api/products/category/:id
     */
    getByCategoryId: async function(categoryId) {
        try {
            const response = await fetch(`${this._apiUrl}/category/${categoryId}`);
            if (!response.ok) throw new Error('Error al obtener productos de la categoría.');
            return await response.json();
        } catch (error) {
            console.error('ProductService Error:', error);
            return { categoryName: 'Error', products: [] };
        }
    },

    /**
     * Añade un nuevo producto enviándolo al backend.
     * --- CONEXIÓN BACKEND ---
     * Endpoint: POST /api/products
     */
    add: async function(formData) { // Ahora recibe FormData
        try {
            const response = await fetch(this._apiUrl, {
                method: 'POST',
                // No se necesita 'Content-Type', el navegador lo pone automáticamente para FormData
                body: formData
            });
            if (!response.ok) throw new Error('Error al añadir el producto.');
            return await response.json();
        } catch (error) {
            console.error('ProductService Error:', error);
            return null;
        }
    },

    /**
     * Actualiza un producto existente en el backend.
     * --- CONEXIÓN BACKEND ---
     * Endpoint: PUT /api/products/:id
     */
    update: async function(id, formData) { // Ahora recibe id y FormData
        try {
            const response = await fetch(`${this._apiUrl}/${id}`, {
                method: 'PUT',
                // No se necesita 'Content-Type'
                body: formData
            });
            if (!response.ok) throw new Error('Error al actualizar el producto.');
            return await response.json();
        } catch (error) {
            console.error('ProductService Error:', error);
            return null;
        }
    },

    /**
     * Cambia el estado de habilitado/deshabilitado de un producto.
     * --- CONEXIÓN BACKEND ---
     * Endpoint: PATCH /api/products/:id/toggle
     */
    toggleStatus: async function(id) {
        try {
            const response = await fetch(`${this._apiUrl}/${id}/toggle`, {
                method: 'PATCH'
            });
            if (!response.ok) throw new Error('Error al cambiar el estado del producto.');
            return await response.json();
        } catch (error) {
            console.error('ProductService Error:', error);
            return null;
        }
    },

    /**
     * Elimina un producto por su ID en el backend.
     * --- CONEXIÓN BACKEND ---
     * Endpoint: DELETE /api/products/:id
     */
    delete: async function(id) {
        try {
            const response = await fetch(`${this._apiUrl}/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Error al eliminar el producto.');
            return await response.json();
        } catch (error) {
            console.error('ProductService Error:', error);
            return { success: false };
        }
    }
};