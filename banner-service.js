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
            // --- DATOS DE EJEMPLO ---
            // Si la conexión con el backend falla, se usarán estos datos de ejemplo.
            // ¡¡¡IMPORTANTE!!! Borrar o comentar este bloque 'catch' cuando el backend esté funcionando.
            console.warn('ADVERTENCIA: No se pudo conectar al backend. Usando datos de banners de ejemplo para el admin.');
            return [
                { id: 'banner-1', title: 'El Arte de la Repostería', subtitle: 'Descubre nuestras creaciones únicas.', imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=1920', linkUrl: '#tortas-kuchen', buttonText: 'Ver Productos', isActive: true },
                { id: 'banner-2', title: 'Nuevas Galletas Temáticas', subtitle: 'Perfectas para cualquier celebración.', imageUrl: 'https://images.unsplash.com/photo-1590089563236-595522441443?auto=format&fit=crop&q=80&w=1920', linkUrl: '/pages/galletas-tematicas.html', buttonText: 'Cotizar Ahora', isActive: false }
            ];
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bannerData)
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
        try {
            const response = await fetch(`${this._apiUrl}/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Error al eliminar el banner.');
            return { success: true };
        } catch (error) {
            console.error('BannerService Error:', error);
            return { success: false };
        }
    }
};