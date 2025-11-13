import express from 'express';
import cors from 'cors';
// Usamos la ruta correcta al archivo de configuración de la base de datos.
import { pool } from './db.js'; 
 
const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json()); // Para entender JSON
// --- RUTAS DE LA API PARA PRODUCTOS (CRUD Completo) ---

/**
 * GET /api/products
 * Obtiene todos los productos de la base de datos.
 */
app.get('/api/products', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM productos ORDER BY id DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener productos.' });
    }
});

/** * GET /api/products/active
 * Obtiene solo los productos activos para el sitio público.
 * ¡IMPORTANTE! Esta ruta debe ir ANTES de /api/products/:id para que no se confundan.
 */
app.get('/api/products/active', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM productos WHERE is_active = 1 ORDER BY id DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener productos activos:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});
/**
 * GET /api/products/:id
 * Obtiene un solo producto por su ID.
 */
app.get('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM productos WHERE id = ?', [id]);
 
        if (rows.length <= 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener el producto:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});
 
/**
 * POST /api/products
 * Crea un nuevo producto en la base de datos.
 */
app.post('/api/products', async (req, res) => {
    try {
        const { name, category, price, size, description, img } = req.body;
        const [result] = await pool.query(
            'INSERT INTO productos (name, category, price, size, description, img) VALUES (?, ?, ?, ?, ?, ?)',
            [name, category, price, size, description, img]
        );
        res.status(201).json({
            id: result.insertId,
            name,
            category,
            price,
            size,
            description,
            img
        });
    } catch (error) {
        console.error('Error al añadir producto:', error);
        res.status(500).json({ message: 'Error interno del servidor al añadir el producto.' });
    }
});

/**
 * PUT /api/products/:id
 * Actualiza un producto existente.
 */
app.put('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, price, size, description, img } = req.body;

        const [result] = await pool.query(
            'UPDATE productos SET name = ?, category = ?, price = ?, size = ?, description = ?, img = ? WHERE id = ?',
            [name, category, price, size, description, img, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Producto no encontrado para actualizar.' });
        }

        res.json({ message: 'Producto actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({ message: 'Error interno del servidor al actualizar.' });
    }
});

/**
 * PATCH /api/products/:id/toggle
 * Habilita o deshabilita un producto.
 */
app.patch('/api/products/:id/toggle', async (req, res) => {
    try {
        const { id } = req.params;
        // Obtenemos el estado actual y lo invertimos (si es 1 se convierte en 0 y viceversa)
        const [result] = await pool.query('UPDATE productos SET is_active = NOT is_active WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }
        res.json({ message: 'Estado del producto actualizado correctamente.' });
    } catch (error) {
        console.error('Error al cambiar estado del producto:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

/**
 * DELETE /api/products/:id
 * Elimina un producto de la base de datos.
 */
app.delete('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM productos WHERE id = ?', [id]);

        if (result.affectedRows <= 0) {
            return res.status(404).json({ message: 'Producto no encontrado para eliminar.' });
        }

        res.json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({ message: 'Error interno del servidor al eliminar.' });
    }
});

// --- RUTAS DE LA API PARA CATEGORÍAS ---

/**
 * GET /api/categories
 * Obtiene todas las categorías de productos.
 */
app.get('/api/categories', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id_categoria as id, nombre FROM categorias ORDER BY nombre ASC');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener las categorías.' });
    }
});

/**
 * POST /api/categories
 * Crea una nueva categoría.
 */
app.post('/api/categories', async (req, res) => {
    try {
        const { nombre } = req.body;
        if (!nombre) {
            return res.status(400).json({ message: 'El nombre es requerido.' });
        }
        const [result] = await pool.query('INSERT INTO categorias (nombre) VALUES (?)', [nombre]);
        res.status(201).json({ id: result.insertId, nombre });
    } catch (error) {
        console.error('Error al añadir categoría:', error);
        res.status(500).json({ message: 'Error interno del servidor al añadir la categoría.' });
    }
});

/**
 * PUT /api/categories/:id
 * Actualiza una categoría existente.
 */
app.put('/api/categories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre } = req.body;
        const [result] = await pool.query('UPDATE categorias SET nombre = ? WHERE id_categoria = ?', [nombre, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Categoría no encontrada.' });
        }
        res.json({ message: 'Categoría actualizada correctamente.' });
    } catch (error) {
        console.error('Error al actualizar categoría:', error);
        res.status(500).json({ message: 'Error interno del servidor al actualizar la categoría.' });
    }
});

/**
 * DELETE /api/categories/:id
 * Elimina una categoría.
 */
app.delete('/api/categories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM categorias WHERE id_categoria = ?', [id]);
        if (result.affectedRows <= 0) {
            return res.status(404).json({ message: 'Categoría no encontrada.' });
        }
        res.json({ message: 'Categoría eliminada correctamente.' });
    } catch (error) {
        console.error('Error al eliminar categoría:', error);
        res.status(500).json({ message: 'Error interno del servidor al eliminar la categoría.' });
    }
});

// --- RUTAS DE LA API PARA BANNERS ---

/**
 * GET /api/banners
 * Obtiene todos los banners.
 */
app.get('/api/banners', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM banners ORDER BY id DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener banners:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener banners.' });
    }
});

/**
 * GET /api/banners/active
 * Obtiene solo los banners que están marcados como activos.
 */
app.get('/api/banners/active', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM banners WHERE activo = 1 ORDER BY orden ASC');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener banners activos:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});