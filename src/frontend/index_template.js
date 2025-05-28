// variables globales
const API_URL = 'http://localhost:3000/api'; //URL base de la API backend
let personas = []; //arreglo donde se almacena las personas obtenidas del servidor

//elementos del DOM
const personaForm = document.getElementById('personaForm');//Formulario principal
const tablaPersonasBody = document.getElementById('tablaPersonasBody');//cuerpo de la tabla donde se lsitan las personas
const btnCancelar = document.getElementById('btnCancelar'); //boton para limpiar el formulario
const imagenInput = document.getElementById('imagen')//input de imagen
const previewImagen = document.getElementById('previewImagen'); // imagen para previsualizar la subida

//event listeners
document.addEventListener('DOMContentLoaded', () => {
// verificar si el usuarioa esta autentificado
    verificarAutenticacion();
    
    //mostrar nombre del usuario si esta autenticado
    const usuarioNombre = localStorage.getItem('usuarioNombre');
    const usuarioApellido = localStorage.getItem('usuarioApellido');

    if(usuarioNombre && usuarioApellido){
        const infoUsuario = document.createElement('div');
        infoUsuario.innerHTML = `
        <p>Bienvenido, ${usuarioNombre} ${usuarioApellido} |
        <a href="#" id="btnCerrarSesion">Cerrar Sesion</a>
        </p>`;
        document.body.insertBefore(infoUsuario, document.body.firstChild);

        //agregar listener para cerrar sesion
        document.getElementById('btnCerrarSesion').addEventListener('click', cerrarSesion);
    }
    cargarPersonas();
});// cargar personas al iniciar la pagina
personaForm.addEventListener('submit', manejarSubmit); // enviar el formulario
btnCancelar.addEventListener('click', limpiarFormulario); //boton de cancelar limpia el formulario
imagenInput.addEventListener('change', manejarImagen); //cargar previsualizacion cuando se selecciona imagen

function verificarAutenticacion(){
    const usuarioId = localStorage.getItem('usuarioId');

    if(!usuarioId){
        //si no hay id usuario, redirigir al login
        window.location.href = 'login.html';
        return;
    }

    //verificar con el servidor si el usuario es valido
    fetch(`${API_URL}/auth/verificar/${usuarioId}`)
    .then(response =>{
        if(!response.ok){
            throw new Error ('sesion invalida'); 
        }
        return response.json();
    })
    .then(data =>{
        if(data.success){
        //si la verificacion falta , limpiar localstorage y redirigir
        localStorage.clear();
        window.location.href = 'login.html';
    }
})
.catch(error => {
    console.error('error al verificar sesion: ', error);
    localStorage.clear();
    window.location.href = 'login.html'
});
}

function cerrarSesion(e){
    e.preventDefault();
    
    //limpiar datos de autenticacion del localStorage
    localStorage.clear();

    //redirigir al login
    window.location.href = 'login.html';
}

//funcion que obtiene personas del backend
async function cargarPersonas(){
    try{
        const response = await fetch(`${API_URL}/personas`); //solicitud GET a lA API
        personas = await response.json(); //almacena respuestas en array
        await mostrarPersonas();// muestra las personas en la tabla
    }catch(error){
        console.error('error al cargar persona: ', error)
    }
}

//funcion para mostrar todas las personas en la tabla
async function mostrarPersonas(){
    //limpia el contenido actual del cuerpo de la tabla para evitar duplicados
    tablaPersonasBody.innerHTML = '';

    //obtiene el elemento <template> que contiene la estructura de una fila de persona
    const template = document.getElementById('template');

    //recorre la lista de personas obtenidad desde el backend
    for(const persona of personas){
        //clona el contenido del template (la fila predefinida)
        const clone = template.content.cloneNode(true);

        //obtiene todas las celdas <td> dentro del clon
        const tds = clone.querySelectorAll('td');

        //inicializa el contenido de imagen como 'sin imagen' por defecto
        let imagenHTML = 'sin imagen';

        //intenta obtener la imagen de la persona desde el backend
        try{
            //realiza una peticion GET al endpoint de imagen de la persona por su ID
            const response = await fetch (`${API_URL}/imagenes/obtener/personas/id_personas/${persona.id_personas}`);

            //convierte la respuesta en un objeto JSON
            const data = await response.json();

            //si ahy una imagen en la respuesta, se construye la etiqueta con la imagen en base64
            if(data.imagen){
                imagenHTML = `<img src="data:image/jpeg;base64,${data.imagen}" style="max-width: 100px; max-height: 100px;">`;
            }
        }catch(error){
            //si ocurre un error al obtener la imagen, lo muestra en consola
            console.error('error al cargar imagen:', error)
        }

        //llena las celdas con los datos de la persona
        tds[0].textContent = persona.id_personas;    //ID
        tds[1].textContent = persona.nombre;        //nombre
        tds[2].textContent = persona.apellido;      //apellido 
        tds[3].textContent = persona.email;         //email     
        tds[4].innerHTML = imagenHTML;              //imagen(si existe, muestra imagen, si no, "sin imagen")

        //busca los botones de editar y eliminar dentro del clon
        const btnEditar = clone.querySelector('.btn-editar')
        const btnElimina = clone.querySelector('.btn-eliminar')

        //asigna el evento de click  al boton de ditar, llamando a la funcion con ID de la persona
        btnEditar.addEventListener('click', () => editarPersona(persona.id_personas));

        //asigna un evento de click al boton de eliminar, llamado a la funcion con ID de la persona
        btnElimina.addEventListener('click', () => eliminarPersona(persona.eliminarPersona));

        //finalmente, agrega la fila clonada (con datos y botones configurados) al cuerpo de la tabla
        tablaPersonasBody.appendChild(clone);
    }
}

//funcion que maneja el envio del formulario (crear o editar persona)
async function manejarSubmit(e){
    e.preventDefault(); //previene el comportamiento por defecto del formulario

    //obtiene los datos del formulario
    const persona = {
        id_personas: document.getElementById('id_personas').value || null,
        nombre: document.getElementById('nombre').value,
        apellido: document.getElementById('apellido').value,
        tipo_identificacion: document.getElementById('tipo_identificacion').value,
        nuip: parseInt(document.getElementById('nuip').value),
        email: document.getElementById('email').value,
        clave: document.getElementById('clave').value,
        salario: parseFloat(document.getElementById('salario').value),
        activo: document.getElementById('activo').checked
    }

    try{
        if(persona.id_personas){
            // si estamos editando (id_persona existe)

            //subir imagen si fue seleccionada
        if(imagenInput.file[0]){
            const imagenBase64 = await convertirImagenBase64(imagenInput.file[0]);
            await fetch(`${API_URL}/imagenes/subir/personas/id_personas/${persona.id_personas}`,{
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({imagen: imagenBase64})
            });
        }
        
        //actualizar los datos de la persona
        await actualizarPersona(persona);
    }else{
        //si es nueva persona
        const nuevaPersona = await crearPersona(persona); //crear persona
        if(imagenInput.file[0]){
            const imagenBase64 = await convertirImagenBase64(imagenInput.files[0]);
            await fetch(`${API_URL}/imagenes/insertar/personas/id_personas/${nuevaPersona.id}`,{
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({imagen: imagenBase64})
            });
        }
    }
    limpiarFormulario(); //limpia el formulario
    cargarPersonas(); //recargar la lista
    } catch(error){
        console.error('error al guardar persona: ',error);
        alert('error al guardar los datos: '+ error.message);
    }
}

//crea una persona nueva en la base de datos
async function crearPersona(persona){
    const response = await fetch(`${API_URL}/personas`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(persona)
    });
    return await response.json(); //devuelve el objeto persona nuva con id
}

// actualiza una persona existente
async function actualizarPersona(persona){
    const response = await fetch(`${API_URL}/persona/${persona.id_personas}`,{
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(person)
    });
    return await response.json();
}

//elimina persona (y su imagen si existe)
async function eliminarPersona(id){
    if(confirm('¿esta seguro de eliminar esta persona?')){
        try{
            await fetch(`${API_URL}/imagenes/eliminar/personas/id_persona/${id}`,{method: 'DELETE'});//elimina imagen
            await fetch(`${API_URL}/persona/${id}`, {method: 'DELETE'}); //elimina persona
            cargarPersonas(); //recarga la lista
        }catch(error){
            console.error('error al eliminar persona: ', error);
            alert('error al eliminar la persona: ' + error.message);
        }
    }
}

//llena el formulario con los datos de una persona para editar
async function editarPersona(id){
    const persona = personas.find(p => p.id_personas === id);
    if(persona){
        document.getElementById('id_personas').value = persona.id_personas;
        document.getElementById('nombre').value = persona.nombre;
        document.getElementById('apellido').value = persona.apellido;
        document.getElementById('tipo_identificacion').value = persona.tipo_identificacion;
        document.getElementById('nuip').value = persona.nuip;
        document.getElementById('email').value = persona.email;
        document.getElementById('clave').value = ''; // no se muestra la contraseña
        document.getElementById('salario').value = persona.salario;
        document.getElementById('activo').checked = persona.activo;
    
        //cargar la imagen si existe
        try{
            const response = await fetch(`${API_URL}/imagenes/obtener/personas/id_personas/${id}`);
            const data = await response.json();
            if(data.imagen){
                previewImagen.src = `data:image/jpeg;base64,${data.imagen}`;
                previewImagen.style.display = 'block';
            }else{
                previewImagen.style.display = 'none';
                previewImagen.src = '';
            }
        } catch (error){
            console.error('error al cargar imagen:', error)
            previewImagen.style.display = 'none';
            previewImagen.src = '';
        }
    }
}

//limpia todos los campos
function limpiarFormulario(){
    personaForm.reset();
    document.getElementById('id_personas').value = '';
    previewImagen.style.display = 'none';
    previewImagen.src = '';
}

//muestra una previsualizacion de la imagen seleccionada
function manejarImagen(e){
    const file = e.target.files[0];
    if(file){
        const reader = new FileReader();
        reader.onload = function(e){
            previewImagen.src = e.target.result;
            previewImagen.style.display = 'block';
        }
        reader.readAsDataURL(file);
    }else{
        previewImagen.style.display = 'none';
        previewImagen.src = '';
    }
}

//convierte imagen a base 64 para enviarla al backend
function convertirImagenBase64(file){
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const base64 = reader.result.split(',')[1]; // elimina el prefijo del data URI
            resolve(base64);
        };
        reader.onerror = error => reject(error);
    });
}