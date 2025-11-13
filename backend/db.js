import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
    host: 'localhost', //DIRECCIÓN DEL SERVIDOR
    port: 3306, //PUERTO PERTENECIENE A LA BDD
    user: 'root', // NOMBRE PARA ACCEDER A LA BDD
    password: '', // La contraseña por defecto en XAMPP está vacía
    database: 'pasteleria_db' // Este es el nombre de la base de datos que vamos a crear
})