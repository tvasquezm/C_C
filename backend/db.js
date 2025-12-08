const mysql = require('mysql2/promise');

// La configuración de la base de datos se lee desde las variables de entorno
// que ya cargamos en server.js
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Creamos un "pool" de conexiones que puede ser reutilizado por toda la aplicación.
const pool = mysql.createPool(dbConfig);

module.exports = pool;