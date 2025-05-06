//se importa la version de mysql2 que trabaja con promesas (mejor utilidad para async/await)
const mysql = require("mysql2/promise")

//importar dotenv para manejar variables de entorno desde un archivo .env
const dotenv = require('dotenv')
//dotenv permite leer valores como usuario, contraseña o nombre de base de datos desde un archivo .env, y asi evitar poner informacion sensible directamente en el codigo

//cargar las variables de entorno definidas en .env
dotenv.config();
//esta linea lee el archivo .env y carga sus valores en process.env . por ejemplo, process.env.DB_USER

//se crea un "pool" de conexiones a la base de datos. createPool() crea un grupo de conexiones reutilizables, lo cual es mas eficiente que abrir y cerrar una conexion para cada consulta

const pool = mysql.createPool({
    host: process.env.DB_HOST,           //host donde esta la base de datos
    user: process.env.DB_USER,          //usuario de la base de datos
    password: process.env.DB_PASSWORD,  //contraseña de la base de datos 
    database: process.env.DB_NAME,      //nombre de la base de datos
    waitForConnections: true,           //espera cuando todas las conexiones estan ocupadas
    connectionLimit: 10,                //limite de conexiones al mismo tiempo
    queueLimit: 0                       //no hay limite de espera en la cola
});

//las variables hots, user, entre otras; vienen del archivo .env, lo que hace que el codigo sea mas seguro y configurable

//exportar el pool para usarlo en otros archivos del proyecto
module.exports= pool;