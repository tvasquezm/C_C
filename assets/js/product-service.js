// c:/Users/tmmsv/Documents/pasteleria/assets/js/product-service.js

const ProductService = {
    // La URL base de nuestra API de productos. Apunta al servidor local que crearemos.
    _apiUrl: 'http://localhost:3000/api/products',

    /**
     * Maneja las respuestas de la API, convirtiendo errores HTTP en excepciones de JavaScript.
     * @param {Response} response El objeto de respuesta de fetch.
     * @returns {Promise<any>} El cuerpo de la respuesta en formato JSON.
     */
    async _handleResponse(response) {
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error desconocido en el servidor' }));
            console.error('Error de API:', errorData.message);
            throw new Error(errorData.message || `Error HTTP ${response.status}`);
        }
        // Si la respuesta no tiene contenido (ej. en un DELETE), devolvemos un objeto vacío.
        if (response.status === 204) {
            return {};
        }
        return response.json();
    },

    /**
     * Obtiene todos los productos.
     * @param {boolean} all - Si es true, obtiene todos los productos (activos e inactivos).
     * @returns {Promise<Array>} Una lista de productos.
     */
    async getAll(all = false) {
        const url = all ? `${this._apiUrl}?all=true` : this._apiUrl;
        const response = await fetch(url);
        return this._handleResponse(response);
    },

    /**
     * Obtiene un producto por su ID.
     * @param {string|number} id El ID del producto.
     * @returns {Promise<Object>} El objeto del producto.
     */
    async getById(id) {
        const response = await fetch(`${this._apiUrl}/${id}`);
        return this._handleResponse(response);
    },

    /**
     * Añade un nuevo producto.
     * @param {FormData} formData Los datos del producto, incluyendo la imagen.
     * @returns {Promise<Object>} El producto recién creado.
     */
    async add(formData) {
        const response = await fetch(this._apiUrl, {
            method: 'POST',
            body: formData, // No se necesita 'Content-Type', el navegador lo establece para FormData.
        });
        return this._handleResponse(response);
    },

    /**
     * Actualiza un producto existente.
     * @param {string|number} id El ID del producto a actualizar.
     * @param {FormData} formData Los nuevos datos del producto.
     * @returns {Promise<Object>} El producto actualizado.
     */
    async update(id, formData) {
        const response = await fetch(`${this._apiUrl}/${id}`, {
            method: 'PUT',
            body: formData,
        });
        return this._handleResponse(response);
    },

    /**
     * Elimina un producto por su ID.
     * @param {string|number} id El ID del producto a eliminar.
     * @returns {Promise<Object>} Una respuesta vacía si tiene éxito.
     */
    async delete(id) {
        const response = await fetch(`${this._apiUrl}/${id}`, {
            method: 'DELETE',
        });
        return this._handleResponse(response);
    },

    /**
     * Cambia el estado (activo/inactivo) de un producto.
     * @param {string|number} id El ID del producto.
     * @returns {Promise<Object>} El producto con su estado actualizado.
     */
    async toggleStatus(id) {
        // Usamos PUT en una ruta específica para cambiar el estado. Es una buena práctica REST.
        const response = await fetch(`${this._apiUrl}/${id}/status`, {
            method: 'PUT',
        });
        return this._handleResponse(response);
    }
};

// NOTA: Deberías crear archivos similares para CategoryService y BannerService.