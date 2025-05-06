const multer = require('multer');
//importar el modulo 'multer' que sirve para manejar la subida de archivos desde formulario en Node.js

const storage = multer.memoryStorage();
//se define una estrategia de almacenamiento en memoria (RAM) temporal para los archivos subidos. esto significa que los archivos no se guardan en el disco, si no en un buffer en memoria

const upload = multer((storage));
//se crea una instancia del middelware de subida con la configuracion de almacenamiento definida (en memoria). esta instancia pueder ser utilizada en las rutas donde se acepten archivos, por ejemplo, imagenes de perfil.

module.exports = upload;
//se espera la configuracion para poder utilizarla en otros archivos del proyecto (como en rutas de Express)