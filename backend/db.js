import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Carga las variables de entorno desde un archivo .env (para desarrollo local)
dotenv.config();

export const pool = mysql.createPool({
    // Usa las variables de entorno si existen, si no, usa los valores por defecto para desarrollo local.
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'pasteleriadb'
})