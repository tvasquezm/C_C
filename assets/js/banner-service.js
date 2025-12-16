// ==================== SERVICIO DE BANNERS (CONEXIÓN CON BACKEND) ====================
// Este archivo es la capa que se comunica con el backend para gestionar los banners.

const BannerService = {
    // --- PUNTO DE CONFIGURACIÓN ---
    _apiUrl: 'http://localhost/C_C/backend/api/banners',

    /**
     * Obtiene todos los banners (para el panel de administración).
     * --- CONEXIÓN BACKEND ---
     * Endpoint: GET /api/banners
     */
    getAll: async function() {
        try {
            const response = await fetch(this._apiUrl);
            if (!response.ok) throw new Error('Error al obtener los banners.');
            return await response.json();
        } catch (error) {
            console.error('BannerService Error:', error);
            return [];
        }
    },

    /**
     * Obtiene solo los banners activos (para el sitio público).
     * --- CONEXIÓN BACKEND ---
     * Endpoint: GET /api/banners/active
     */
    getActive: async function() {
        try {
            const response = await fetch(`${this._apiUrl}/active`);
            if (!response.ok) throw new Error('Error al obtener los banners activos.');
            return await response.json();
        } catch (error) {
            console.error('BannerService Error:', error);
            return [];
        }
    },

    /**
     * Obtiene un banner por su ID.
     * --- CONEXIÓN BACKEND ---
     * Endpoint: GET /api/banners/:id
     */
    getById: async function(id) {
        try {
            const response = await fetch(`${this._apiUrl}/${id}`);
            if (!response.ok) throw new Error('Banner no encontrado.');
            return await response.json();
        } catch (error) {
            console.error('BannerService Error:', error);
            return null;
        }
    },

    /**
     * Añade un nuevo banner.
     * --- CONEXIÓN BACKEND ---
     * Endpoint: POST /api/banners
     */
    add: async function(bannerData) {
        try {
            const response = await fetch(this._apiUrl, {
                method: 'POST',
                body: bannerData // FormData
            });
            if (!response.ok) throw new Error('Error al añadir el banner.');
            return await response.json();
        } catch (error) {
            console.error('BannerService Error:', error);
            return null;
        }
    },

    /**
     * Actualiza un banner existente.
     * --- CONEXIÓN BACKEND ---
     * Endpoint: PUT /api/banners/:id
     */
    update: async function(id, bannerData) {
        try {
            // Use POST with method override so PHP can receive multipart/form-data
            const response = await fetch(`${this._apiUrl}/${id}?_method=PUT`, {
                method: 'POST',
                body: bannerData
            });
            if (!response.ok) throw new Error('Error al actualizar el banner.');
            return await response.json();
        } catch (error) {
            console.error('BannerService Error:', error);
            return null;
        }
    },

    /**
     * Cambia el estado de un banner.
     * --- CONEXIÓN BACKEND ---
     * Endpoint: PUT /api/banners/:id/status
     */
    toggleStatus: async function(id) {
        try {
            const response = await fetch(`${this._apiUrl}/${id}/status`, {
                method: 'PUT'
            });
            if (!response.ok) throw new Error('Error al cambiar el estado del banner.');
            return await response.json();
        } catch (error) {
            console.error('BannerService Error:', error);
            return { success: false };
        }
    },

    /**
     * Elimina un banner por su ID.
     * --- CONEXIÓN BACKEND ---
     * Endpoint: DELETE /api/banners/:id
     */
    delete: async function(id) {
        try {
            const response = await fetch(`${this._apiUrl}/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Error al eliminar el banner.');
            // Una respuesta 204 (No Content) no tiene cuerpo, así que no intentamos leerla.
            return { success: true };
        } catch (error) {
            console.error('BannerService Error:', error);
            return { success: false };
        }
    },

    /**
     * Actualiza el orden de los banners.
     * --- CONEXIÓN BACKEND ---
     * Endpoint: PATCH /api/banners/order
     */
    updateOrder: async function(orderedIds) {
        try {
            const response = await fetch(`${this._apiUrl}/order`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: orderedIds })
            });
            if (!response.ok) throw new Error('Error al reordenar los banners.');
            return await response.json();
        } catch (error) {
            console.error('BannerService Error al reordenar:', error);
            return null;
        }
    }
};