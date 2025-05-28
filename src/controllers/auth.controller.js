const db = require ('../config/db')
const bcrypt = require('bcrypt')

class AuthController{
    //registro de nuevos usuarios
    async registrar (userData){
        try{
            //verificar si el email ya existente
            const [emailExistente] = await db.query('SELECT email FROM personas WHERE email = ?', [userData.email]);

            if(emailExistente.length > 0){
                return {
                    success: false,
                    message: 'El email ya esta registrado'
                };
            }

            //encriptar la contraseña
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(userData.clave, saltRounds);
            
            //crear el objeto de usuario con la controaseña encriptada
            const usuario = {
                ...userData,
                clave: hashedPassword
            };

            //insertar el usuario en la base de datos
            const [resultado] = await db.query('INSERT INTO personas SET ?', [usuario]);

            return {
                success: true,
                message: 'Usuario registrado correctamente',
                userId: resultado.insertId
            };
        }catch (error){
            console.error('Error al registrar usuario: ', error);
            throw error;
        }

    }

    //inicio de sesion
    async iniciarSesion(email, clave){
        try{
            //buscar el usuario por email
            const [usuarios] = await db.query('SELECT * FROM personas WHERE email = ?', [email]);

            if(usuarios.length === 0){
                return {
                    success: false,
                    message: 'credenciales invalidas'
                };
            }

            const persona = usuarios[0];

            //verificar la contraseña
            const passwordMatch = await bcrypt.compare(clave, usuario.clave);

            if(!passwordMatch){
                return{
                    success: false,
                    message: 'Credenciales validas'
                }
            }

            //crear un objeto con los datos del usuario (excluyendo la contraseña)
            const usuarioData = {
                id_usuario: persona.id_usuario,
                nombre: persona.nombre,
                apellido: persona.apellido,
                email: persona.email,
                rol: persona.rol
            };

            return{
                success: true,
                message: 'inicio de sesion exitoso',
                usuario: usuarioData
            };
        }catch (error){
            console.error('error al iniciar sesion', error);
            throw error;
        }
    }

    //verificar si un usuario esta autenticado
    async verificarUsuario(userId){
        try{
            const [usuarios] = await db.query('SELECT id_usuario, nombre, apellido,email, rol FROM usuarios WHERE id_usuario = ?', [userId]);

            if(usuarios.length === 0){
                return {
                    success: false,
                    message: 'usuario no encontrado'
                };
            }

            return{
                success: true,
                usuario: usuarios[0]
            };
        }catch (error){
            console.error('error al verifcar usuario: ', error);
            throw error;
        }
    }
}

module.exports = new AuthController();