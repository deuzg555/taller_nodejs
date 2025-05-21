const db = require ('../config/db');
// se importa la conexion a la base de datos desde el archibo db.js

//se crea una clase llamada CrudController que manejara todas las operaciones CRUD
class CrudController {

    //metodo para obtener todos los registros de una tabla
    async obtenerTodos(tabla) {
        try{
            //realiza una consulta SQL para seleccionar todos los registros de la tabña indicada
            const [resultados] = await db.query(`SELECT * FROM ${tabla}`);
            return resultados;// devuelve el array de resultado
        }catch(error){
            throw error; // lanza el error para que sea manejado en otro lugar
        }
    }

    // metodo para obtener un unico registro por su id
    async obtenerUno(tabla, idcampo, id){
        try{
            // se utiliza el doble interrogante ?? para escapar nombres de tabla/campo, y un interrogante ? para el valor
            const [resultado] = await db.query(`SELECT * FROM ?? WHERE ?? = ?`, [tabla, idcampo, id]);
            return resultado[0]; //devuelve solo el primer resultado
        }catch (error) {
            throw error;
        }
    } 

    //metodo para crear un nuevo registro
    async crear(tabla, data){
        try{
            // inserta los datos en la tabla indicada
            const [resultado] = await db.query(`INSERT INTO ?? SET ?`, [tabla, data]);
            //devuelve el objeto creado, incluyendo el ID generado automaticamente
            return {...data,id: resultado.insertId};
        }catch (error) {
            throw error;
        }
    }

    //metodo para actualizar un registro existente
    async actualizar(tabla, idcampo, id, data){
        try{
            // ejecuta una consulta UPDATE con los datos nuevos
            const [resultado] = await db.query(`UPDATE ?? SET ? WHERE ?? = ?`, [tabla, data,  idcampo, id]);
            //si no se afecto ninguna fila es que el registro no existia
            if(resultado.affectedRows === 0){
                throw new error ('registro no encontrado')
            }
            return await this.obtenerUno(tabla, idcampo, id); //devuelve el registro actualizado
        }catch (error) {
            throw error;
        }
    }

    //metodo para eliminar un registro
    async eliminar(tabla, idcampo, id){
        try{
            // ejecuta la eliminacion del registro
            const [resultado] = await db.query(`DELETE FROM ?? WHERE ?? = ?`, [tabla, idcampo, id]);
            //si no se elimino ninguna fila, es que el ID no existe
            if(resultado.affectedRows === 0){
                throw new error ('registro no encontrado')
            }
            return { mensaje: 'registro eliminado correctamente'}; //devuelve el mensaje de exito
        }catch (error) {
            throw error;
        }
    }
}

// se exporta la clase para poder utilizarla en otros archivos
module.exports = CrudController;