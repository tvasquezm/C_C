// ==================== SERVICIO DE CATEGORÍAS (CONEXIÓN CON BACKEND) ====================

const CategoryService = {
    _apiUrl: '/backend/api/categories',

    /**
     * Obtiene todas las categorías desde el backend.
     * --- CONEXIÓN BACKEND ---
     * Endpoint: GET /api/categories
     */
    getAll: async function() {
        try {
            const response = await fetch(this._apiUrl);
            if (!response.ok) throw new Error('Error al obtener las categorías.');
            return await response.json();
        } catch (error) {
            console.error('CategoryService Error:', error);
            return [];
        }
    },

    /**
     * Añade una nueva categoría.
     * --- CONEXIÓN BACKEND ---
     * Endpoint: POST /api/categories
     */
    add: async function(categoryData) {
        try {
            const response = await fetch(this._apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(categoryData)
            });
            if (!response.ok) throw new Error('Error al añadir la categoría.');
            return await response.json();
        } catch (error) {
            console.error('CategoryService Error:', error);
            return null;
        }
    },

    /**
     * Actualiza una categoría existente.
     * --- CONEXIÓN BACKEND ---
     * Endpoint: PUT /api/categories/:id
     */
    update: async function(id, categoryData) {
        try {
            const response = await fetch(`${this._apiUrl}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(categoryData)
            });
            if (!response.ok) throw new Error('Error al actualizar la categoría.');
            return await response.json();
        } catch (error) {
            console.error('CategoryService Error:', error);
            return null;
        }
    },

    /**
     * Elimina una categoría por su ID.
     * --- CONEXIÓN BACKEND ---
     * Endpoint: DELETE /api/categories/:id
     */
    delete: async function(id, options = {}) {
        try {
            const params = new URLSearchParams();
            if (options.reassignTo) params.append('reassign_to', options.reassignTo);
            if (options.force) params.append('force', '1');

            const url = `${this._apiUrl}/${id}` + (params.toString() ? `?${params.toString()}` : '');
            const response = await fetch(url, {
                method: 'DELETE'
            });
            if (response.status === 204) {
                return { success: true };
            }
            const data = await response.json().catch(() => null);
            if (response.ok) {
                return { success: true, ...data };
            }
            // Return backend message when possible
            const msg = (data && (data.msg || data.message)) || JSON.stringify(data) || 'Error al eliminar la categoría.';
            return { success: false, message: msg };
        } catch (error) {
            console.error('CategoryService Error:', error);
            return { success: false, message: error.message };
        }
    }
};