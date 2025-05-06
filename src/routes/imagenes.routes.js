const express = require ('express');
const router = express.Router();
const multar = require('multer');
const imagenesController = require('../controllers/imagenes.controller');
const { compare } = require('bcrypt');

//ruta actualizar una imagen (recibe la imgaen en base64)
router.put('/subir/:tabla/:campoId/:id', async (req, res)=>{
    const {tabla, campoId, id} = req.params;
    const imagenBase64 = req.body.imaggen;

    if(!imagenBase64){
        return res.status(400).json({error: 'se requiere la imagen en base64'});
    }

    try{
        const resulta = await imagenesController.procesarImagen(tabla, campoId, id, imagenBase64);
        res.json(resultado);
    }catch(error){
        console.error('error al subir la imagen', error);
        res.status(500).json({error: 'error al subir la imagen'});
    }
});

//ruta para obtener una imagen (devuelve la imagen en base64)
router.get('/obtener/:tabla/:campoId/:id', async (req, res)=>{
    const {tabla, campoId, id} = req.params;

    try{
        const imagen = await imagenesController.procesarImagen(tabla, campoId, id);
        res.json(imagen);
    }catch(error){
        console.error('error al obtener la imagen', error);
        res.status(500).json({error: 'error al obtener la imagen'});
    }
});

//ruta para eliminar una imagen(pone el campo imagen a null)
router.delete('/eliminar/:tabla/:campoId/:id', async (req, res)=>{
    const {tabla, campoId, id} = req.params;

    try{
        const resultado = await imagenesController.eliminarImagen(tabla, campoId, id);
        res.json(resultado);
    }catch(error){
        console.error('error al eliminar la imagen: '.error);
        res.status(500).json({error: 'error al eliminar imagen'});
    }
});

//ruta para insertar una imagen(recibe la imagen)
router.post('/insertar/:tabla/:campoId/:id', async (req, res)=>{
    const {tabla, campoId, id} = req.params;
    const imagenesBase64 = req.body.imagen;

    if(!imagenesBase64){
        return res.status(400).json({error: 'se requiere la imagen en base64'});
    }

    try{
        const resultado = await imagenesController.insertarImagen(tabla, campoId, id, imagenesBase64);
        res.json(resultado);
    }catch(error){
        console.error('error al insertar la imagen', error);
        res.status(500).json({error: 'error al insertar la imagen'});
    }
});

module.exports = router;
