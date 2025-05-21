//variables globales
const API_URL = 'http://localhost:3000/api'; //constante que almacena la URL que se conecta al servidor
let personas = []; //variables  que almacenara el listado de personas obtenidas del backend

//Elementos del DOM
const personaForm = document.getElementById('personaForm'); //formulario principal
const tablaPersonaBody = document.getElementById('tablaPersonasBody');//cuerpo de la tabla donde se insertan las filas
const btnCancelar = document.getElementById('btnCancelar');// este boton de cancelar limpia el formulario 
const imagenInput = document.getElementById('previewImagen');//elemento imagen de previsualizacion

//even listeners
document.addEventListener('DOMContentLoaded', cargarPersonas); //cuando el DOM este listo, se cargan las personas
personaForm.addEventListener('submit', manejarSubmit);// al enviar el formulario, se ejecuta la funcion manejarSubmit que escucha el click
btnCancelar.addEventListener('click', limpiarFormulario); //al hacer click en cancelar, se limpia el formulario
imagenInput.addEventListener('change', manejarImagen); //al cambiar la imagen, se llama manejarImagen para previsualizar

//funciones para el manejo de personas
async function cargarPersonas() {
    try {
        const response = await fetch(`${API_URL}/personas`);//se hace peticion GET al endpoint personas
        personas = await response.json(); //se almacena la respuesta como lista de personas
        await mostrarPersonas();
    } catch (error) {
        console.error('error al cargar personas: ', error);
    }
}

//iterar sobre cada persona y crear una fila en la tabla
async function mostrarPersonas() {
    tablaPersonaBody.innerHTML = ''; //limpiar el contenido actual

    for (const persona of personas) {
        const tr = document.createElement('tr');// crea una fila HTMl

        let imagenHTML = 'sin imagen';
        try {
            const response = await fetch(`${API_URL}/imagenes/obtener/personas/id_persona/${persona.id_personas}`);
            // se realiza una peticion al backend para obtener la imagen de la persona en base64
            const data = await response.json();
            if (data.imagen) {
                imagenHTML = `<img src="sata:image/jpeg;base64,${data.imagen}" style="max-width: 100px; max-height: 100px;">`;
            }
        } catch (error) {
            console.error('error al cargar imagen: ', error);
        }
        //se construye la fila html con los datos de la persona y los botones de accion
        //se utiliza template literals para facilitar la insercion de variables en el html
        tr.innerHTMl = `
                <td style="border: 1px solid #ddd; text-align: center; padding: 8px;">${persona.id_persona}</td>
                <td  style="border: 1px solid #ddd; text-align: center; padding: 8px;">${persona.nombre}</td>
                <td  style="border: 1px solid #ddd; text-align: center; padding: 8px;">${persona.apellido}</td>
                <td  style="border: 1px solid #ddd; text-align: center; padding: 8px;">${persona.email}</td>
                <td  style="border: 1px solid #ddd; text-align: center; padding: 8px;">
                    <button onclick="editarPersona(${persona.id_persona})">Editar</button>
                    <button onclick="eliminarPersona(${persona.id_persona})">Eliminar</button>
                </td>`;
        tablaPersonaBody.appendChild(tr); //se añade la fila a la tabla
    }
}

async function manejarSubmit(e) {
    e.preventDefault(); //evita que el formulario recargue la pagina

    //obtener o recopila los valores el formulario y crear un objeto persona
    // se utiliza el metodo getElementById para obtener los valores de cada campo del formulario
    //se utiliza parseInt y parseFloat para convertir los valores de cada campo del formulario
    //se utiliza el operador || para asignar null si el campo esta vacio

    const persona = {
        id_persona: document.getElementById('id_persona').value || null,
        nombre: document.getElementById('nombre').value,
        apellido: document.getElementById('apellido').value,
        tipo_identificacion: document.getElementById('tipo_identificacion').value,
        nuip: parseInt(document.getElementById('nuip').value),
        email: document.getElementById('email').value,
        clave: document.getElementById('clave').value,
        salario: parseFloat(document.getElementById('salario').value),
        activo: document.getElementById('activo').checked
    };

    try {
        if (persona.id_persona) {
            // si hay una imagen seleccionada, se actualiza primero la imagen
            if (imagenInput.files[0]) {
                const imagenBase64 = await convertirImagenABase64(imagenInput.files[0]);
                await fetch(`${API_URL}/imagenes/subir/personas/id_persona/${persona.id_persona}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ imagen: imagenBase64 })
                });
            }
            //luego se actualizan los datos de la persona
            await actualizarPersona(persona);
        } else {
            // si es una persona nueva se procede a crearla
            const nuevaPersona = await crearPersona(persona);
            // si hay una imagen seleccionada, se sube
            if (imagenInput.files[0]) {
                const imagenBase64 = await convertirImagenABase64(imagenInput.files[0]);
                await fetch(`${API_URL}/imagenes/insertar/personas/id_persona/${nuevaPersona.id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ imagen: imagenBase64 })
                });
            }
        }
        limpiarFormulario(); //limpiar formulario
        cargarPersonas();
    } catch (error) {
        console.error('error al guardar persona: ', error);
        alert('error al guardar los datos: ' + error.message);
    }
}

async function crearPersona(persona)
//se utliza el metodo POST para crear una nueva persona en el backend
// se envia el objeto de persona como cuerpo de la peticion en formato JSON
// se espera la respuesta y se convierte a JSON
{
    const response = await fetch(`${API_URL}/personas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(persona)
    });
    return await response.json();
}

async function actualizarPersona(persona)
//se utiliza el metodo PUT para actualizar los datos de una persona existente 
//se envia el objeto persona como cuerpo de la peticion en formato JSON
// se espera la respuesta y se convierte a JSON
//se utiliza el ID de la persona para identificarla en el backend
{
    const response = await fetch(`${API_URL}/persona/${persona.id_persona}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(persona)
    });
    return await response.json();
}

async function eliminarPersona(id)
// se utiliza el metodo DELETE para eliminar una persona existente
// se utiliza el ID de la persona para identificarla en el backend
// se espera la respuesta y se convierte a JSON
// se utiliza el metodo DELETE para eliminar la imagen asociada a la persona
// se utiliza el ID de la persona para identificarle en el backend
// se espera la respuesta y se convierte a JSON
{
    if (confirm('¿Esta seguro de eliminar esta persona?')) {
        try {
            //primero se intenta eliminar la imagen si existe
            await fetch(`${API_URL}/imagenes/eliminar/persona/id_persona/${id}`, {
                method: 'DELETE',
            });
            //luego se elimina la persona
            await fetch(`${API_URL}/persona/${id}`, { method: 'PUT', })
            cargarPersonas();
        } catch (error) {
            console.error('error al eliminar persona: ', error);
            alert('error al eliminar la persona:' + error.message);
        }
    }
}

async function editarPersona(id)
// se utiliza el metodo GET para obtener los datos de una persona existente 
// se utiliza el ID de la persona para identificarla en el backend
// se espera la respuesta y se convierte a JSON
{
    const persona = personas.find(p => p.id_persona === id);
    // se utiliza el ID de la persona para identificarla en el backend
    // se espera la respuesta y se convierte a JSON
    // se utiliza el metodo GET para obtener los datos de una persona existente
    if(persona){
        document.getElementById('id_persona').value = persona.id_persona;
        document.getElementById('nombre').value = persona.nombre;
        document.getElementById('apellido').value = persona.apellido;
        document.getElementById('tipo_identificacion').value = persona.tipo_identificacion;
        document.getElementById('nuip').value = persona.nuip;
        document.getElementById('email').value = persona.email;
        document.getElementById('clave').value = ''; // no mostramos la contraseña
        document.getElementById('salario').value = persona.salario;
        document.getElementById('activo').checked = persona.activo;

        //cargar imagen si existe

        try{
            const response = await fetch(`${API_URL}/imagenes/obtener/personas/id_persona/${id}`);
            const data = await response.json();

            if(data.imagen){
                previewImagen.src = `data:image/jpeg;base64,${data.imagen}`;
                previewImagen.style.display = 'block';
            } else {
                previewImagen.style.display = 'none';
                previewImagen.src = '';
            }
        }catch(error){
            console.error('error al cargar imagen: ', error);
            previewImagen.style.display = 'none';
            previewImagen.src = '';
        }
    }
}

function limpiarFormulario()
//se utiliza el metodo reset para limpiar todos los campos del formulario
//se utiliza el metodo getElementById para obtener el ID de la persona y se establece en vacio
//se utiliza el metodo getElementById para obtener el elemento de previsualizacion de la imagen y se establece en vacio
{
    personaForm.reset();
    document.getElementById('id_persona').value = '';
    previewImagen.style.display = 'none';
    previewImagen.src = '';
}

//funcionea para el manejo de imagenes
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
    //se utiliza el metodo readAsDataURL para leer el archivo como una URL de datos
}

//funcion para convertir imagen a base64
function convertirImagenABase64(file){
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            //eliminar el prefijo "data:image/jpeg;base64," del resultado
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = error => reject(error);
    });
}