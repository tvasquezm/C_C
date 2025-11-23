// c:/Users/tmmsv/Documents/pasteleria/backend/app.js

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise'); // Usamos la versión con promesas para async/await

const app = express();
const port = 3000;

// --- Middlewares Esenciales ---

// 1. CORS (Cross-Origin Resource Sharing): Permite que tu frontend (que se ejecuta en un origen diferente)
// se comunique con este backend. Sin esto, el navegador bloquearía las peticiones.
app.use(cors());

// 2. Express.json(): Permite al servidor entender los datos enviados en formato JSON.
app.use(express.json());

// --- Configuración de la Base de Datos ---
const dbConfig = {
    host: 'localhost',
    user: 'root',       // Usuario por defecto de XAMPP
    password: '',       // Contraseña por defecto de XAMPP es vacía
    database: 'pasteleriadb'
};

// Creamos un "pool" de conexiones para reutilizarlas y mejorar el rendimiento
const pool = mysql.createPool(dbConfig);

// --- Rutas de la API (Endpoints) ---

// Ruta para todos los productos (conectada a la BD)
app.get('/api/products', async (req, res) => {
    try {
        // MODIFICACIÓN: Usamos un JOIN para obtener también el nombre de la categoría.
        const query = `
            SELECT p.*, c.nombre AS category 
            FROM productos p
            JOIN categorias c ON p.category_id = c.id_categoria
            WHERE p.is_active = 1`;
        const [rows] = await pool.query(query);
        
        // Convertimos las imágenes a un formato que el navegador pueda mostrar
        const productsWithImages = rows.map(product => {
            if (product.img && product.img_mimetype) {
                const imageBase64 = Buffer.from(product.img).toString('base64');
                return {
                    ...product,
                    img: `data:${product.img_mimetype};base64,${imageBase64}`
                };
            }
            return product;
        });

        res.json(productsWithImages);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener productos.' });
    }
});

// Ruta para obtener un producto por ID
app.get('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM productos WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }

        const product = rows[0];
        if (product.img && product.img_mimetype) {
            const imageBase64 = Buffer.from(product.img).toString('base64');
            product.img = `data:${product.img_mimetype};base64,${imageBase64}`;
        }

        res.json(product);
    } catch (error) {
        console.error(`Error al obtener producto con ID ${id}:`, error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// Ruta para obtener todas las categorías (conectada a la BD)
app.get('/api/categories', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM categorias ORDER BY id_categoria ASC');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener categorías.' });
    }
});

// Ruta para obtener todos los banners (conectada a la BD)
app.get('/api/banners', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM banners WHERE activo = 1 ORDER BY orden ASC');

        const bannersWithImages = rows.map(banner => {
            if (banner.img && banner.img_mimetype) {
                const imageBase64 = Buffer.from(banner.img).toString('base64');
                return {
                    ...banner,
                    img: `data:${banner.img_mimetype};base64,${imageBase64}`
                };
            }
            return banner;
        });

        res.json(bannersWithImages);
    } catch (error) {
        console.error('Error al obtener banners:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener banners.' });
    }
});


// --- Iniciar el Servidor ---
app.listen(port, async () => {
    // Probamos la conexión al iniciar el servidor
    await pool.query('SELECT 1');
    console.log(`Servidor corriendo en http://localhost:${port}`);
    console.log('¡Conexión a la base de datos establecida con éxito!');
});