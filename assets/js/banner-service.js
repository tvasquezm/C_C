// ==================== SERVICIO DE BANNERS (CONEXIÓN CON BACKEND) ====================
// Este archivo es la capa que se comunica con el backend para gestionar los banners.

const BannerService = {
    // --- PUNTO DE CONFIGURACIÓN ---
    _apiUrl: 'http://localhost:3000/api/banners',

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
        // Implementación similar a ProductService.add
    },

    /**
     * Actualiza un banner existente.
     * --- CONEXIÓN BACKEND ---
     * Endpoint: PUT /api/banners/:id
     */
    update: async function(updatedBanner) {
        try {
            const response = await fetch(`${this._apiUrl}/${updatedBanner.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedBanner)
            });
            if (!response.ok) throw new Error('Error al actualizar el banner.');
            return await response.json();
        } catch (error) {
            console.error('BannerService Error:', error);
            return null;
        }
    },

    /**
     * Elimina un banner por su ID.
     * --- CONEXIÓN BACKEND ---
     * Endpoint: DELETE /api/banners/:id
     */
    delete: async function(id) {
        // Implementación similar a ProductService.delete
    }
};