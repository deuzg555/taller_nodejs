// API URL base

const API_URL = 'http://localhost:3000/api';

//elementos deñ DOM
const loginForm = document.getElementById('loginForm');
const mensajeDiv = document.getElementById('mensaje');

//event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loginForm.addEventListener('submit', manejarLogin);

    //verificar si el usuario ya esta autenticado
    const usuarioId = localStorage.getItem('usuarioId');
    if(usuarioId){
        // si ya esta autenticado, redirigir a la pagina principal
        window.location.href = 'index_template.html';
    }
});

async function manejarLogin(e){
    e.preventDefault();

    //obtener valores del formulario
    const email = document.getElementById('email').value;
    const clave = document.getElementById('clave').value;

    try{
        //enviar solicitud de inicio de sesion
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, clave})
        });

        const resultado = await response.json();

        if(resultado.success){
            //guardar informacion del usuario en localstorage
            localStorage.setItem('usuarioId', resultado.usuario.id_usuario);
            localStorage.setItem('usuarioNombre', resultado.usuario.nombre);
            localStorage.setItem('usuarioApellido', resultado.usuario.apellido);
            localStorage.setItem('usuarioEmail', resultado.usuario.email);
            localStorage.setItem('usuarioRol', resultado.usuario.rol);

            mostrarMensaje('inicio de sesion exitoso. redirigiendo...', true);

            //redirigir a la pagina principal
            setTimeout(() => {
                window.location.href = 'index_template.html';
            }, 1000);
        }else{
            mostrarMensaje(resultado.message, false)
        }
    }catch(error){
        console.error('error al iniciar sesion: ', error);
        mostrarMensaje('error al procesar el inicio de sesion, intente nuevamente. ', false)
    }
}

//funcion para mostrar mensajes
function mostrarMensaje(texto, esExito){
    mensajeDiv.textContent = texto;
    mensajeDiv.style.display = 'block';

    if(esExito){
        mensajeDiv.style.backgroundColor = '#d4edda';
        mensajeDiv.style.color = '#155724';
    }else{
        mensajeDiv.style.backgroundColor = '#f8d7da';
    }
}