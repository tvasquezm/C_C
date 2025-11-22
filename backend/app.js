// c:/Users/tmmsv/Documents/pasteleria/backend/app.js

const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;

// --- Middlewares Esenciales ---

// 1. CORS (Cross-Origin Resource Sharing): Permite que tu frontend (que se ejecuta en un origen diferente)
// se comunique con este backend. Sin esto, el navegador bloquearía las peticiones.
app.use(cors());

// 2. Express.json(): Permite al servidor entender los datos enviados en formato JSON.
app.use(express.json());

// --- Rutas de la API (Endpoints) ---

// Esta es una ruta de ejemplo para que veas cómo funciona.
// Corresponde a la petición `ProductService.getAll()`.
app.get('/api/products', (req, res) => {
    console.log('Petición recibida en /api/products');

    // Por ahora, devolveremos datos falsos (mock) para probar.
    // En el futuro, aquí es donde consultarías la base de datos.
    const mockProducts = [
        { id: 1, name: 'Torta de Chocolate (desde API)', category: 'Tortas', price: 25000, is_active: true, img: 'https://via.placeholder.com/150' },
        { id: 2, name: 'Galletas de Avena (desde API)', category: 'Galletas', price: 5000, is_active: false, img: 'https://via.placeholder.com/150' }
    ];

    res.json(mockProducts);
});

// Ruta para obtener un producto por ID
app.get('/api/products/:id', (req, res) => {
    const { id } = req.params;
    console.log(`Petición para obtener producto con ID: ${id}`);
    // Devolvemos un producto falso
    res.json({ id: id, name: `Producto de prueba ${id}`, price: 10000, category_id: 1 });
});

// --- Iniciar el Servidor ---
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
    console.log('¡El backend está listo para recibir peticiones!');
});