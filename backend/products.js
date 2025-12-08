const express = require('express');
const pool = require('./db'); // Importamos nuestro pool de conexiones
const multer = require('multer');

// Configuración de Multer para guardar las imágenes en memoria como un buffer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

// GET /api/products - Obtener todos los productos desde la BD
router.get('/', async (req, res) => {
    try {
        const { all, page, limit, name, category, status, sortBy, sortOrder } = req.query;
        let whereClauses = [];
        let queryParams = [];

        // Si no se solicita 'all=true', solo devolvemos los productos activos.
        if (all !== 'true') {
            whereClauses.push('p.is_active = 1');
        }
        if (name) {
            whereClauses.push('p.name LIKE ?');
            queryParams.push(`%${name}%`);
        }
        if (category && category !== 'all') {
            whereClauses.push('p.category_id = ?');
            queryParams.push(category);
        }
        if (status && status !== 'all') {
            whereClauses.push('p.is_active = ?');
            queryParams.push(status === 'active' ? 1 : 0);
        }

        // Si se proporcionan 'page' y 'limit', aplicamos paginación (para el admin)
        if (req.query.page && req.query.limit) {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

            const [totalRows] = await pool.query(`SELECT COUNT(*) as count FROM productos p ${whereString}`, queryParams);
            const totalProducts = totalRows[0].count;
            const totalPages = Math.ceil(totalProducts / limit);

            // Lógica de ordenamiento segura
            const validSortColumns = {
                name: 'p.name',
                category: 'c.nombre',
                status: 'p.is_active',
                id: 'p.id'
            };
            const sortColumn = validSortColumns[sortBy] || validSortColumns.id;
            const sortDirection = sortOrder === 'desc' ? 'DESC' : 'ASC';

            const query = `SELECT p.id, p.name, p.category_id, p.price, p.size, p.description, p.is_active, c.nombre as category_name 
                         FROM productos p LEFT JOIN categorias c ON p.category_id = c.id_categoria 
                         ${whereString} ORDER BY ${sortColumn} ${sortDirection} LIMIT ? OFFSET ?`;
            const finalParams = [...queryParams, limit, offset];
            const [products] = await pool.query(query, finalParams);

            return res.json({
                products,
                totalPages,
                currentPage: page
            });
        } else {
            // Si no hay paginación, devolvemos todos los productos (para el sitio público)
            const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
            const query = `SELECT p.id, p.name, p.category_id, p.price, p.size, p.description, p.is_active, c.nombre as category_name 
                         FROM productos p LEFT JOIN categorias c ON p.category_id = c.id_categoria 
                         ${whereString}`;
            const [products] = await pool.query(query, queryParams);
            return res.json(products);
        }
    } catch (error) {
        console.error('Error al obtener los productos:', error);
        // Mejora: Enviar un mensaje de error más detallado en desarrollo.
        const message = process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor al obtener los productos.';
        res.status(500).json({ message: message });
    }
});

// GET /api/products/:id - Obtener un producto por ID desde la BD
router.get('/:id', async (req, res) => {
    try {
        // Tampoco seleccionamos el BLOB aquí.
        const query = 'SELECT id, name, category_id, price, size, description, is_active FROM productos WHERE id = ?';
        const [rows] = await pool.query(query, [req.params.id]);
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ message: 'Producto no encontrado' });
        }
    } catch (error) {
        console.error(`Error al obtener el producto ${req.params.id}:`, error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// --- NUEVO ENDPOINT PARA SERVIR IMÁGENES ---
// GET /api/products/:id/image
router.get('/:id/image', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT img, img_mimetype FROM productos WHERE id = ?', [req.params.id]);
        if (rows.length > 0 && rows[0].img) {
            // Establecemos el tipo de contenido correcto (ej: 'image/jpeg')
            res.setHeader('Content-Type', rows[0].img_mimetype);
            // Enviamos los datos binarios de la imagen
            res.send(rows[0].img);
        } else {
            res.status(404).json({ message: 'Imagen no encontrada' });
        }
    } catch (error) {
        console.error(`Error al obtener la imagen del producto ${req.params.id}:`, error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// --- RUTAS CRUD (Create, Read, Update, Delete) ---

// POST /api/products - Añadir un nuevo producto
router.post('/', upload.single('product-image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ errors: [{ msg: 'La imagen del producto es requerida.' }] });
        }

        const { 'product-name': name, 'product-category': category_id, 'product-price': price, 'product-size': size, 'product-description': description } = req.body;
        const img = req.file.buffer;
        const img_mimetype = req.file.mimetype;

        const query = 'INSERT INTO productos (name, category_id, price, size, description, img, img_mimetype, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        const [result] = await pool.query(query, [name, category_id, price, size, description, img, img_mimetype, 1]); // Por defecto se crea como activo

        res.status(201).json({ id: result.insertId, name, category_id });
    } catch (error) {
        console.error('Error al añadir el producto:', error);
        res.status(500).json({ message: 'Error interno del servidor al añadir el producto.' });
    }
});

// PUT /api/products/:id - Actualizar un producto existente
router.put('/:id', upload.single('product-image'), async (req, res) => {
    try {
        const { id } = req.params;

        const { 'product-name': name, 'product-category': category_id, 'product-price': price, 'product-size': size, 'product-description': description } = req.body;

        let query;
        let params;

        if (req.file) {
            // Si se sube una nueva imagen
            const img = req.file.buffer;
            const img_mimetype = req.file.mimetype;
            query = 'UPDATE productos SET name = ?, category_id = ?, price = ?, size = ?, description = ?, img = ?, img_mimetype = ? WHERE id = ?';
            params = [name, category_id, price, size, description, img, img_mimetype, id];
        } else {
            // Si no se sube una nueva imagen
            query = 'UPDATE productos SET name = ?, category_id = ?, price = ?, size = ?, description = ? WHERE id = ?';
            params = [name, category_id, price, size, description, id];
        }

        const [result] = await pool.query(query, params);

        if (result.affectedRows > 0) {
            res.json({ message: 'Producto actualizado con éxito' });
        } else {
            res.status(404).json({ message: 'Producto no encontrado para actualizar' });
        }
    } catch (error) {
        console.error(`Error al actualizar el producto ${req.params.id}:`, error);
        res.status(500).json({ message: 'Error interno del servidor al actualizar el producto.' });
    }
});

// DELETE /api/products/:id - Eliminar un producto
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'DELETE FROM productos WHERE id = ?';
        const [result] = await pool.query(query, [id]);

        if (result.affectedRows > 0) {
            res.status(204).send(); // 204 No Content
        } else {
            res.status(404).json({ message: 'Producto no encontrado para eliminar' });
        }
    } catch (error) {
        console.error(`Error al eliminar el producto ${req.params.id}:`, error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// PUT /api/products/:id/status - Cambiar el estado de un producto (activo/inactivo)
router.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        // Obtenemos el estado actual y lo invertimos
        const [current] = await pool.query('SELECT is_active FROM productos WHERE id = ?', [id]);
        if (current.length === 0) {
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }
        const newStatus = !current[0].is_active;
        await pool.query('UPDATE productos SET is_active = ? WHERE id = ?', [newStatus, id]);
        res.json({ success: true, newStatus: newStatus });
    } catch (error) {
        res.status(500).json({ message: 'Error interno del servidor al cambiar el estado.' });
    }
});

module.exports = router;