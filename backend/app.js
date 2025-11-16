import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
// Usamos la ruta correcta al archivo de configuración de la base de datos.
import { pool } from './db.js'; 
 
const app = express();
const PORT = 3000;

// Configuración de Multer para guardar archivos en memoria
const storage = multer.memoryStorage();

// --- ¡AQUÍ ESTÁ LA MEJORA! ---
// Creamos un filtro para asegurarnos de que solo se suban imágenes.
const fileFilter = (req, file, cb) => {
    // Lista de formatos de imagen permitidos (mimetypes)
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    
    // Comprueba tanto la extensión del archivo como el mimetype
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        // Si el formato es válido, permite la subida
        return cb(null, true);
    } else {
        // Si no, rechaza el archivo con un error
        cb(new Error('Error: Solo se permiten imágenes en formato JPG, PNG, GIF o WEBP.'));
    }
};

const upload = multer({ 
    storage: storage, 
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Límite de 5MB por archivo
});
// Middlewares
app.use(cors());
app.use(express.json()); // Para entender JSON

// Servir archivos estáticos (para nuestra imagen de placeholder)
app.use('/static', express.static(path.join(process.cwd(), '..', 'assets', 'images')));

// --- RUTAS DE LA API PARA PRODUCTOS (CRUD Completo) ---

/**
 * GET /api/products
 * Obtiene todos los productos de la base de datos.
 */
app.get('/api/products', async (req, res) => {
    try {
        // MEJORA: Hacemos un JOIN para obtener el nombre de la categoría en lugar del ID.
        // Seleccionamos todas las columnas necesarias de la tabla de productos.
        const query = `
            SELECT p.id, p.name, IFNULL(c.nombre, 'Sin Categoría') as category, p.price, p.size, p.description, p.is_active 
            FROM productos p
            -- CORRECCIÓN: Usamos LEFT JOIN para incluir productos incluso si su categoría fue eliminada.
            LEFT JOIN categorias c ON p.category_id = c.id_categoria 
            ORDER BY p.id DESC
        `;
        const [rows] = await pool.query(query);
        // Para la tabla del admin, necesitamos una URL de imagen. Podemos crear un endpoint específico para la miniatura.
        const productsWithImageUrls = rows.map(p => ({
            ...p,
            // Creamos una URL virtual para obtener la imagen de cada producto.
            img: `http://localhost:3000/api/products/${p.id}/image`
        }));
        res.json(productsWithImageUrls);
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
        // MEJORA: Hacemos un JOIN para obtener el nombre de la categoría.
        const query = `
            SELECT p.*, c.nombre as category 
            FROM productos p 
            JOIN categorias c ON p.category_id = c.id_categoria WHERE p.is_active = 1 ORDER BY p.id DESC
        `;
        const [rows] = await pool.query(query);
        // Convertimos el blob a Base64 para que el frontend lo pueda usar
        const productsWithBase64Image = rows.map(product => {
            if (product.img) {
                const imageBase64 = Buffer.from(product.img).toString('base64');
                // MEJORA: Usamos el mimetype guardado en la BD para mostrar la imagen correctamente.
                product.img = `data:${product.img_mimetype};base64,${imageBase64}`;
            } else {
                // CORRECCIÓN: Usamos una imagen local para evitar errores de red.
                product.img = 'http://localhost:3000/static/placeholder.png';
            }
            return product;
        });
        res.json(productsWithBase64Image);
    } catch (error) {
        console.error('Error al obtener productos activos:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

/**
 * GET /api/products/category/:id
 * Obtiene todos los productos activos de una categoría específica.
 */
app.get('/api/products/category/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT p.*, c.nombre as category 
            FROM productos p 
            JOIN categorias c ON p.category_id = c.id_categoria 
            WHERE p.is_active = 1 AND p.category_id = ?
        `;
        const [products] = await pool.query(query, [id]);

        // También obtenemos el nombre de la categoría para el título de la página
        const [categoryRows] = await pool.query('SELECT nombre FROM categorias WHERE id_categoria = ?', [id]);
        const categoryName = categoryRows.length > 0 ? categoryRows[0].nombre : 'Categoría';

        // Convertimos el blob a Base64 para las imágenes
        const productsWithBase64Image = products.map(product => {
            if (product.img) {
                product.img = `data:${product.img_mimetype};base64,${Buffer.from(product.img).toString('base64')}`;
            } else {
                product.img = 'http://localhost:3000/static/placeholder.png';
            }
            return product;
        });

        res.json({ categoryName, products: productsWithBase64Image });
    } catch (error) {
        console.error('Error al obtener productos por categoría:', error);
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
        // MEJORA: Hacemos un JOIN para obtener también el nombre de la categoría.
        const query = `
            SELECT p.*, c.nombre as category 
            FROM productos p 
            JOIN categorias c ON p.category_id = c.id_categoria WHERE p.id = ?
        `;
        const [rows] = await pool.query(query, [id]);
 
        if (rows.length <= 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        const product = rows[0];
        // Convertimos el blob a Base64
        if (product.img) {
            const imageBase64 = Buffer.from(product.img).toString('base64');
            product.img = `data:${product.img_mimetype};base64,${imageBase64}`;
        } else {
            // CORRECCIÓN: Usamos una imagen local.
            product.img = 'http://localhost:3000/static/placeholder.png';
        }
        res.json(product);
    } catch (error) {
        console.error('Error al obtener el producto:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

/**
 * GET /api/products/:id/image
 * Endpoint especial para servir la imagen de un producto para el dashboard.
 */
app.get('/api/products/:id/image', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT img, img_mimetype FROM productos WHERE id = ?', [id]);
        if (rows.length > 0 && rows[0].img) {
            res.setHeader('Content-Type', rows[0].img_mimetype); // MEJORA: Usamos el mimetype correcto.
            res.send(rows[0].img);
        } else {
            // CORRECCIÓN: Redirigimos a nuestra imagen local.
            res.redirect('http://localhost:3000/static/placeholder.png');
        }
    } catch (error) {
        res.status(500).send('Error del servidor');
    }
});
 
/**
 * POST /api/products
 * Crea un nuevo producto en la base de datos.
 */
app.post('/api/products', upload.single('product-image'), async (req, res) => {
    try {
        const { name, 'product-category': categoryId, price, size, description } = req.body;
        // El archivo de la imagen está en req.file.buffer
        const img = req.file ? req.file.buffer : null; // Guardamos el buffer de la imagen
        const img_mimetype = req.file ? req.file.mimetype : null; // Guardamos el mimetype

        const [result] = await pool.query(
            'INSERT INTO productos (name, category_id, price, size, description, img, img_mimetype) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, categoryId, price, size, description, img, img_mimetype]
        );
        res.status(201).json({
            id: result.insertId,
            name,
            categoryId,
            price,
            size,
            description
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
app.put('/api/products/:id', upload.single('product-image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, size, description } = req.body;
        // El ID de la categoría viene con un nombre diferente desde el formulario
        const categoryId = req.body['product-category'];
        
        // --- CORRECCIÓN DEFINITIVA DEL BUG DE EDICIÓN ---
        // Construimos un objeto solo con los campos que tienen valor.
        const fieldsToUpdate = {};
        if (name) fieldsToUpdate.name = name;
        if (categoryId) fieldsToUpdate.category_id = categoryId;
        if (price) fieldsToUpdate.price = price;
        if (size) fieldsToUpdate.size = size;
        if (description) fieldsToUpdate.description = description;

        // Si se subió una nueva imagen, la añadimos a los campos a actualizar.
        if (req.file) {
            fieldsToUpdate.img = req.file.buffer;
            fieldsToUpdate.img_mimetype = req.file.mimetype;
        }

        // Ejecutamos la actualización en la base de datos.
        // Verificamos si hay algo que actualizar para no enviar una consulta vacía.
        if (Object.keys(fieldsToUpdate).length === 0) return res.json({ message: 'No hay campos para actualizar.' });

        const [result] = await pool.query('UPDATE productos SET ? WHERE id = ?', [fieldsToUpdate, id]);
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
        const [rows] = await pool.query('SELECT id, activo, orden FROM banners ORDER BY orden ASC');
        // Creamos URLs virtuales para las imágenes, igual que con los productos
        const bannersWithImageUrls = rows.map(b => ({
            ...b,
            img: `http://localhost:3000/api/banners/${b.id}/image`
        }));
        res.json(bannersWithImageUrls);
    } catch (error) {
        console.error('Error al obtener banners:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener banners.' });
    }
});

/**
 * GET /api/banners/:id
 * Obtiene un solo banner por su ID.
 */
app.get('/api/banners/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM banners WHERE id = ?', [id]);

        if (rows.length <= 0) {
            return res.status(404).json({ message: 'Banner no encontrado' });
        }
        const banner = rows[0];
        // Creamos una URL para la imagen para mostrarla en el formulario de edición
        if (banner.img) {
            banner.img = `http://localhost:3000/api/banners/${banner.id}/image`;
        } else {
            banner.img = 'http://localhost:3000/static/placeholder.png';
        }
        res.json(banner);
    } catch (error) {
        console.error('Error al obtener el banner:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

/**
 * GET /api/banners/active
 * Obtiene solo los banners que están marcados como activos.
 */
app.get('/api/banners/active', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, img, img_mimetype FROM banners WHERE activo = 1 ORDER BY orden ASC');
        const bannersWithBase64 = rows.map(banner => {
            if (banner.img) {
                banner.img = `data:${banner.img_mimetype};base64,${Buffer.from(banner.img).toString('base64')}`;
            } else {
                banner.img = 'http://localhost:3000/static/placeholder.png';
            }
            return banner;
        });
        res.json(bannersWithBase64);
    } catch (error) {
        console.error('Error al obtener banners activos:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

/**
 * GET /api/banners/:id/image
 * Sirve la imagen de un banner.
 */
app.get('/api/banners/:id/image', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT img, img_mimetype FROM banners WHERE id = ?', [id]);
        if (rows.length > 0 && rows[0].img) {
            res.setHeader('Content-Type', rows[0].img_mimetype);
            res.send(rows[0].img);
        } else {
            res.redirect('http://localhost:3000/static/placeholder.png');
        }
    } catch (error) {
        res.status(500).send('Error del servidor');
    }
});

/**
 * POST /api/banners
 * Crea un nuevo banner.
 */
app.post('/api/banners', upload.single('banner-image'), async (req, res) => {
    try {
        const img = req.file ? req.file.buffer : null;
        const img_mimetype = req.file ? req.file.mimetype : null;

        const [result] = await pool.query(
            'INSERT INTO banners (img, img_mimetype) VALUES (?, ?)',
            [img, img_mimetype]
        );
        res.status(201).json({ id: result.insertId });
    } catch (error) {
        console.error('Error al añadir banner:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

/**
 * PUT /api/banners/:id
 * Actualiza un banner existente.
 */
app.put('/api/banners/:id', upload.single('banner-image'), async (req, res) => {
    try {
        const { id } = req.params;
        
        // Ahora solo actualizamos la imagen si se sube una nueva.
        const fieldsToUpdate = {};
        if (req.file) {
            fieldsToUpdate.img = req.file.buffer;
            fieldsToUpdate.img_mimetype = req.file.mimetype;
        }
        const [result] = await pool.query('UPDATE banners SET ? WHERE id = ?', [fieldsToUpdate, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Banner no encontrado para actualizar.' });
        }

        if (Object.keys(fieldsToUpdate).length === 0) {
            return res.json({ message: 'No se subió una nueva imagen, no se realizaron cambios.' });
        }

        res.json({ message: 'Banner actualizado correctamente.' });
    } catch (error) {
        console.error('Error al actualizar banner:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

/**
 * PATCH /api/banners/order
 * Actualiza el orden de los banners.
 */
app.patch('/api/banners/order', async (req, res) => {
    try {
        const { ids } = req.body; // Recibe un array de IDs en el nuevo orden.
        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({ message: 'Se requiere un array de IDs.' });
        }

        // Creamos una promesa para cada actualización.
        const updatePromises = ids.map((id, index) => {
            return pool.query('UPDATE banners SET orden = ? WHERE id = ?', [index, id]);
        });

        // Ejecutamos todas las promesas.
        await Promise.all(updatePromises);

        res.json({ message: 'Orden de los banners actualizado correctamente.' });
    } catch (error) {
        console.error('Error al reordenar banners:', error);
        res.status(500).json({ message: 'Error interno del servidor al reordenar.' });
    }
});

/**
 * PATCH /api/banners/:id/toggle
 * Cambia el estado de un banner.
 */
app.patch('/api/banners/:id/toggle', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('UPDATE banners SET activo = NOT activo WHERE id = ?', [id]);
        res.json({ message: 'Estado del banner actualizado.' });
    } catch (error) {
        console.error('Error al cambiar estado del banner:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

/**
 * DELETE /api/banners/:id
 * Elimina un banner.
 */
app.delete('/api/banners/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM banners WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Banner no encontrado.' });
        }
        res.json({ message: 'Banner eliminado correctamente.' });
    } catch (error) {
        console.error('Error al eliminar banner:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});