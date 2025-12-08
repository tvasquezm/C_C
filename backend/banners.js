const express = require('express');
const pool = require('./db'); // Importamos nuestro pool de conexiones
const multer = require('multer');

// Configuración de Multer para guardar las imágenes en memoria como un buffer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

// GET /api/banners - Obtener todos los banners desde la BD
router.get('/', async (req, res) => {
    try {
        // Usamos alias (AS) para que las columnas coincidan con lo que espera el frontend (id, title).
        const query = 'SELECT id, activo, orden FROM banners';
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener los banners:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener los banners.' });
    }
});

// --- NUEVO ENDPOINT PARA SERVIR IMÁGENES DE BANNERS ---
// GET /api/banners/:id/image
router.get('/:id/image', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT img, img_mimetype FROM banners WHERE id = ?', [req.params.id]);
        if (rows.length > 0 && rows[0].img) {
            // Establecemos el tipo de contenido correcto
            res.setHeader('Content-Type', rows[0].img_mimetype);
            // Enviamos los datos binarios de la imagen
            res.send(rows[0].img);
        } else {
            res.status(404).json({ message: 'Imagen de banner no encontrada' });
        }
    } catch (error) {
        console.error(`Error al obtener la imagen del banner ${req.params.id}:`, error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// GET /api/banners/active - Obtener solo los banners activos para el sitio público
// ¡CORRECCIÓN! Esta ruta debe ir ANTES de las rutas con parámetros como /:id para evitar conflictos.
router.get('/active', async (req, res) => {
    try {
        // Selecciona solo los banners activos y los ordena
        const query = 'SELECT id FROM banners WHERE activo = 1 ORDER BY orden ASC';
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener los banners activos:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// POST /api/banners - Añadir un nuevo banner
router.post('/', upload.single('banner-image'), async (req, res) => {
    try {
        const { titulo } = req.body; // El título es opcional para los banners
        const img = req.file.buffer;
        const img_mimetype = req.file.mimetype;

        const query = 'INSERT INTO banners (titulo, img, img_mimetype, activo, orden) VALUES (?, ?, ?, ?, ?)';
        // Por defecto se crea como activo y con orden 0
        const [result] = await pool.query(query, [titulo || null, img, img_mimetype, 1, 0]);

        res.status(201).json({ id: result.insertId, titulo });
    } catch (error) {
        console.error('Error al añadir el banner:', error);
        res.status(500).json({ message: 'Error interno del servidor al añadir el banner.' });
    }
});

// DELETE /api/banners/:id - Eliminar un banner
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'DELETE FROM banners WHERE id = ?';
        const [result] = await pool.query(query, [id]);

        if (result.affectedRows > 0) {
            res.status(204).send(); // Éxito, sin contenido
        } else {
            res.status(404).json({ message: 'Banner no encontrado para eliminar' });
        }
    } catch (error) {
        console.error(`Error al eliminar el banner ${req.params.id}:`, error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// PUT /api/banners/:id/status - Cambiar el estado de un banner (activo/inactivo)
router.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        // Obtenemos el estado actual y lo invertimos
        const [current] = await pool.query('SELECT activo FROM banners WHERE id = ?', [id]);
        if (current.length === 0) {
            return res.status(404).json({ message: 'Banner no encontrado.' });
        }
        const newStatus = !current[0].activo;
        await pool.query('UPDATE banners SET activo = ? WHERE id = ?', [newStatus, id]);
        res.json({ success: true, newStatus: newStatus });
    } catch (error) {
        res.status(500).json({ message: 'Error interno del servidor al cambiar el estado.' });
    }
});

module.exports = router;