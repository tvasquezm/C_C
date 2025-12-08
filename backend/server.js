const express = require('express');
require('dotenv').config(); // Cargar variables de entorno al inicio de la app
const cors = require('cors');

const productRoutes = require('./products.js'); // Corregido: apunta al archivo local
const categoryRoutes = require('./categories.js'); // Importamos las nuevas rutas de categorías
const bannerRoutes = require('./banners.js');   // Corregido: apunta al archivo local

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors()); // Permite que tu frontend se comunique con este backend
app.use(express.json()); // Permite al servidor entender JSON en las peticiones

// Rutas de la API
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes); // Usamos las rutas de categorías
app.use('/api/banners', bannerRoutes);

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});