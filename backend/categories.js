const express = require('express');
const pool = require('./db'); // Importamos nuestro pool de conexiones centralizado

const router = express.Router();

// Definimos la ruta GET / que corresponde a /api/categories/
router.get('/', async (req, res) => {
    try {
        // Usamos directamente el pool para hacer la consulta.
        // 'mysql2/promise' se encarga de obtener y liberar la conexión.
        // Usamos alias (AS) para que los nombres de las columnas coincidan con lo que espera el frontend (id, name).
        const query = 'SELECT id_categoria AS id, nombre AS name FROM categorias';
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener las categorías:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener las categorías.' });
    }
});

// POST /api/categories - Añadir una nueva categoría
router.post('/', async (req, res) => {
    try {
        const { name } = req.body;
        const query = 'INSERT INTO categorias (nombre) VALUES (?)';
        const [result] = await pool.query(query, [name]);
        res.status(201).json({ id: result.insertId, name });
    } catch (error) {
        console.error('Error al añadir la categoría:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// DELETE /api/categories/:id - Eliminar una categoría
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Verificar si la categoría está en uso por algún producto.
        const [products] = await pool.query('SELECT COUNT(*) AS count FROM productos WHERE category_id = ?', [id]);
        const productCount = products[0].count;

        if (productCount > 0) {
            // 2. Si está en uso, devolver un error 409 (Conflicto).
            return res.status(409).json({ message: `No se puede eliminar. Hay ${productCount} producto(s) usando esta categoría.` });
        }

        // 3. Si no está en uso, proceder con la eliminación.
        const [deleteResult] = await pool.query('DELETE FROM categorias WHERE id_categoria = ?', [id]);

        if (deleteResult.affectedRows > 0) {
            res.json({ success: true, message: 'Categoría eliminada.' });
        } else {
            res.status(404).json({ message: 'Categoría no encontrada.' });
        }
    } catch (error) {
        console.error('Error al eliminar la categoría:', error);
        res.status(500).json({ message: 'Error interno del servidor. Asegúrate de que no haya productos usando esta categoría.' });
    }
});

module.exports = router;