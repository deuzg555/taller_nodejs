// importar el modulo express
const express = require ('express');

//crear un nuevo router de express para manejar rutas de manera modular
const router = express.Router();

//importar el controlador generico para oprecaciones CRUD
const CrudController = require('../controllers/crud.controller')

//instanciar una nueva instancia del controlador para usar sus metodos
const curd = new CrudController();

//definir el nombre de la tabla en la base de datos sobre la que operara
const tabla = 'personas';

//definir el nombre del campo identififcador unico de la tabla
const idCampo = 'id_persona';

router.get('/', async(req, res) => {
    try{
        //utilizar el metodo obtenerTodos del controlador para traer todos los registros
        const personas = await curd.obtenerTodos(tablas);

        //repuesta con el arreglo de personas en formato JSON
        res.json(personas);
    }catch(error){
        //si hay un error, se responde con codigo 500 y el mensaje de error
    }
});

//ruta para obtener una especifica por id
router.get('/:id', async(req, res) => {
    try{
        //utilizar el metodo obtenerUno con el id recibido en la url
        const persona = await curd.obtenerUno(tabla, idCampo, req.params.id);

        //respuesta con los datos de la persona del formato JSON
        res.json(persona);
    }catch(error){
        //manejar errores del servidor
        res.status(500).json({error: error.message});
    }
});

//ruta para actualizar una persona existente (por id)
router.put('/:id', async(req, res) => {
    try{
        //utilizar el metodo actualizar con ID y los nuevos datos del cuerpo
        const personaActualizada = await curd.actualizar(tabla, idCampo, req.params.id, req.body);

        //respuesta con el registro actualizado
        res.json(personaActualizada);
    }catch(error){
        //manejar errores del servidor
        res.status(500).json({error: error.message});
    }
});

//ruta para eliminar una persona de la base de datos (por id)
router.delete('/:id', async(req, res) => {
    try{
        //utilizar el metodo eliminar con el id recibido
        const resultado = await curd.eliminar(tabla, idCampo, req.params.id);

        //respuesta con un mensaje o confirmacion de la eliminacion
        res.json(resultado);
    }catch(error){
        //manejar errores del servidor
        res.status(500).json({error: error.message});
    }
});

//exportar el router para que pueda ser usado en la aplicacion principal
module.exports = router;