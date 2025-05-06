CREATE DATABASE IF NOT EXISTS crud;
USE crud;

-- crear tabla personas

CREATE TABLE IF NOT EXISTS personas (
id_personas INT AUTO_INCREMENT PRIMARY KEY,   	-- identificador unico autoincremental
nombre VARCHAR(100),							-- cadena para el nombre
apellido VARCHAR(100),							-- cade para el apellido
tipo_identificacion VARCHAR(50),				-- tipo de documento: CC, TI, CE, etc.
nuip INT,										-- numero unico de identificacion (ej: cedula)
email VARCHAR(100),								-- correo electronico del usuario
clave VARCHAR(500),								-- contraseña encriptada
salario DECIMAL(10,2),							-- valor numerico decimal para el salario
activo BOOLEAN DEFAULT TRUE,					-- valor booleano: 1 (activo), 0 (inactivo)
fecha_registro DATE DEFAULT (CURRENT_DATE),		-- fecha en la que se registra a la persona
imagen LONGBLOB									-- imagen binariio (para subir una foto)
);

-- ver los registros actuales de la tabla personas

SELECT * FROM personajes;