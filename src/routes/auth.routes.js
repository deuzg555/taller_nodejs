const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const authController = require('../controllers/auth.controller');

//ruta para registrar un nuevo usuario

router.post('/registro', async (req, res) => {
    try {
        const resultado = await authController.registrar(req.body);
        res.json(resultado);
    } catch (error) {
        console.error('error en ruta de registro: ', error);
        res.status(500).json({
            success: false,
            message: 'error al registrar usuario'
        });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, clave } = req.body;
        const resultado = await authController.iniciarSesion(email, clave);

        if (resultado.success) {
            // si se utilizan sesiones, aqui estableceria la sesion
            //por ahora, simplemente devolvemos el resultado exitoso
            res.json(resultado);
        } else {
            res.status(401).json(resultado);
        }
    } catch (error) {
        console.error('error en ruta de login: ', error);
        res.status(500).json({
            success: false,
            message: 'error al iniciar sesion'
        });
    }
});

//ruta para verificar si un usuario esta autenticado
router.get('/verificar/:id', async (req, res) => {
    try {
        const resultado = await authController.verificarUsuario(req.params.id);

        if (resultado.success) {
            res.json(resultado);
        } else {
            res.status(404).json(resultado);
        }
    } catch (error) {
        console.error('error al verificar usuario: ', error);
        res.status(500).json({
            success: false,
            message: 'error al verificar usuario'
        });
    }
});

module.exports = router;