const express = require ('express');
//importar el framework express para crear el servidor

const cors = require('cors');
//importar CORS para permitir soliciotudes desde otros dominios(muy util cuando el frontend y backend estan separados)

const app = express();
//crear una instacia de aplicaciones express

const imagenesRoutes = require('./routes/imagenes.routes');
//importar las rutas para el manejos de imagenes desde el achivo correspondiente

//middleware
app.use(cors());
//habilita los CORS (permite que el servidor reciba peticiones desde otros origenes)

app.use(express.json({limit: '50mb'}));
//permite recibir datos en formatos json, estableciendo un limite de 50mb(ideal para datos grandes como imagenes en base64)

app.use(express.urlencoded({extended: true, limit: '50mb'}));
//permite recibir datos codificados desde formularios(como los enviados por POST desde HTMl), tambien con limite de 50mb

//rutas
app.use('/api/imagenes', imagenesRoutes);
//asocia todas las rutas de imagenes bajo el prefijo /api/imagnes

app.use('/api/personas', require('./routes/personas.routes'));
//asocia todas las rutas de pesosnas bajo el prefijo /api/personas

app.use('/api/proveedores', require('./routes/proveedores.routes'));

module.exports = app;
//exportar la app configurada para ser utilizada por el archivo principal del servidor (en este caso, el archivo server.js)