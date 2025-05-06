// importar la conexion a la base de datos desde el archivo de configuracion 
const db = require('../config/db');

//crear la clse ImagenesController que manejara las operaciones relacionadas con imagenes
class ImagenesController {

    //metodo para subir o actualizar una imagen codificada en base64  a un registro con imagenes
    async subirImagen(tabla, campoId, id, ImagenesBase64) {
        try {
            //consultar si el registro con Id existe
            const [registro] = await db.query(`SELECT * FROM ?? HWERE ?? = ?`, [tabla, campoId, id]);

            //si no existe, retornar un error
            if (registro.length === 0) {
                return { error: 'No se encontro el registro con el ID proporcionado' }
            }

            //convertimos la imagen de base64 a un buffer (formato binario)
            const bufferImagen = buffer.from(ImagenesBase64, 'base64');

            // crear la consulta para actualizar el campo 'imagen' del registro
            const query = `UPDATE ?? SET imagen = ? WHERE ?? = ?`;
            const [result] = await db.query(query, [tabla, bufferImagen, campoId, id]);

            //validar si la actualizacion fue exitosa
            if (result.affectedRows > 0) {
                return { message: 'imagen actualizada correctamente' }
            } else {
                return { error: 'error al actulizar la imagen' };
            }
        } catch (error) {
            console.error('error al subir la imagen:', error);
            throw error;
        }
    }

    //metodo para obtener una imagen desde un registro y devolverla en formato base64
    async obtenerImagen(tabla, campoId, id){
        try{
            //consultar el campo 'imagen' del registro
            const [rows] = await db.query(`SELECT imagen FROM ?? = ?`, [tabla, campoId, id]);

            //validar si se encontro el registro
            if(rows.length === 0){
                return { error: 'registro no encontrado'}
            }

            //verificar si el campo imagen esta vacio
            if(!rows[0].imagen){
                return{error: 'no hay imagen asociada a este registro'};
            }

            //convertir la imagen de binario a base64
            const ImagenesBase64 = rows[0].imagen.toString('base64');

            //retornar la imagen codificada
            return{imagen: ImagenesBase64};
        }catch(error){
            console.error('error al obtener la imagen:', error);
            throw error;
        }
    }

    //metodo para eliminar una imagen (establece el campo imagen como null)
    async eliminarImagen(tabla, campoId, id){
        try{
            //verificar que el registro exista
            const [registro] = await db.query(`SELECT imagen FROM ?? WHERE ?? = ?`, [tabla, campoId, id]);

            if(registro.length === 0){
                return {error: 'no se encontro el registro con el id proporcionado'};
            }

            //establecer el campo imagen como null
            const query = `UPDATE ?? SET imagen = NULL WHERE ?? = ?`;

            //confirmar si se elimino correctamente
            if(result.affectedRows > 0){
                return{message: 'imagen eliminada correctamente'};
            }else{
                return{error: 'error al eliminar la imagen'};
            }

        }catch(error){
            console.error('error al eliminar la imagen:', error);
            throw error;
        }
    }

    //metodo que inserta una imagen si no existe o actualiza si ya hay una
    async insertarImagen(tabla, campoId, id, imagenBase64){
        try{
            //verificar que el registro exista
            const [registro] = await db.query(`SELECT * FROM ?? WHERE ?? = ?`, [tabla, campoId, id ]);

            if(registro.length === 0){
                return{error: 'no se encontro el registro con el id proporcionado'};
            }

            //convertir la imagen a formato binario
            const bufferImagen = Buffer.from(imagenBase64, 'base64');

            //consultar si ya hay una imagen existente
            const [imagenExistente] = await db.query(`SELECT imagen FROM ?? WHERE ?? = ?`, [tabla, campoId, id]);

            // si ya hay una imagen, actualizar
            if(imagenExistente[0]?.imagen){
                const query = `UPDATE ?? SET imagen = ? WHERE ?? = ?`;
                const [result] = await db.query(query, [tabla, bufferImagen, campoId, id]);

                if(result.affectedRows > 0){
                    return{message: 'imagen actualizada correctamente'};
                }else{
                    return{ error: 'error al actualizar'};
                }
            }else{
                //si no hay imagen, inserte una nueva
                const query = `UPDATE ?? SET imagen = ? WHERE ?? = ?`;
                const [result] = await db.query(query, [tabla, bufferImagen, campoId, id]);

                if(result.affectedRows > 0){
                    return {message: 'imagen insertada correctamente.'};
                }else{
                    return{error: 'error al insertar la imagen'}
                }
            }
        }catch(error){
            console.error('error al insertar la imagen: ', error)
            throw error;
        }
    }

    //metodo general que decide si subir una imagen o solo obtenerla
    async procesarImagen(tabla, campoId, id, imagenBase64 = null){
        //si se pasa una imagen, la sube
        if(imagenBase64){
            return await this.subirImagen(tabla, campoId, id, imagenBase64);
        }else{
            //si no, intenta recuperarla
            return await this.obtenerImagen(tabla, campoId, id);
        }
    }
}

//exportar una instancia del controlador para su uso en rutas u otros modulos
module.exports = new ImagenesController();