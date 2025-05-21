//variables globales



//url base de la api
const API_URL='http://localhost:3000/api';

//arreglo donde se almacenaran las persona traidas desde la api
let personas = [];

//variable para determinar si estamos editando o creando
let modoEdicion = false;

//elementos DOM

//referencia al formulario de personas
const form = document.querySelector('#personaForm');

//cuerpo de la tabla se insertaran las filas dinamicamente
const tablaBody = document.querySelector('#tablaPersonasBody');

//template html para generar filas de tabla
const template = document.querySelector('#template');

//boton para guardar(crear o actualizar)
const btnGuardar = document.querySelector('#btnGuardar');

//boton para cancelar la edicion
const btnCancelar = document.querySelector('#btnCancelar')

//input de imagen y su previsualizacion
const inputImagen = document.querySelector('#imagen')
const previewImagen = document.querySelector('#previewImagen')

//campos del formulario

const campos = {
    id: document.querySelector('#id_personas'),
    nombre: document.querySelector('#nombre'),
    apellido: document.querySelector('#apellido'),
    tipo_identificacion: document.querySelector('#tipo_identificacion'),
    nuip: document.querySelector('#nuip'),
    email: document.querySelector('#email'),
    clave: document.querySelector('#clave'),
    salario: document.querySelector('#salario'),
    activo: document.querySelector('#activo')
};

//eventos principales

document.addEventListener('DOMContentLoaded', () =>{
    cargarPersonas(); // cargar lista inicial
    form.addEventListener('submit', manejarSubmit), //guardar datos
    btnCancelar.addEventListener('click', resetearFormulario); //cancelar edicion
    inputImagen.addEventListener('change', manejarCambioImagen); //cargar imagen
});

//funciones de logica

//cargar todas las personas desde la api

async function cargarPersonas(){
    try{
        const response = await fetch(`${API_URL}/personas`);
        personas = await response.json();
        mostrarPersonas();
    }catch(error){
        console.error('error al cargar personas: ', error);
    }
}

//muestra en la tabla todas las personas cargadas
async function mostrarPersonas(){
    tablaBody.innerHTML = ''; //limpiar tabla

    personas.forEach(async persona => {
        const clone = template.content.cloneNode(true); //clonar template
        const celdas = clone.querySelectorAll('td');

        //llenar celdas con datos de la persona
        celdas[0].textContent = persona.id_personas;
        celdas[1].textContent = persona.nombre;
        celdas[2].textContent = persona.apellido;
        celdas[3].textContent = persona.email;

        //imagen por defecto
        let imagenHTML = 'sin imagen';

        try{
            const response = await fetch(`${API_URL}/imagenes/obtener/personas/id_personas/${persona.id_personas}`);
            const data = await response.json();
            if(data.imagen){
                imagenHTML = `<img src="data:image/jpeg;base64,${data.imagen}" style="max-width: 100px; max-height: 100px;">`;
            }
        }catch(error){
            console.error('error al cargar imagen: ', error);
        }

        celdas[4].innerHTML = imagenHTML;

        //botones de accion
        const btnEditar = clone.querySelector('.btn-editar');
        const btnEliminar = clone.querySelector('.btn-eliminar');

        btnEditar.addEventListener('click', () => editarPersona(persona));
        btnEliminar.addEventListener('click', () => eliminarPersona(persona.id_personas));

        tablaBody.appendChild(clone);
    });
}

//manejo del submit del formulario (crear o actualizar persona)
async function manejarSubmit(e){
    e.preventDefault();

    //recolectar datos desde el formulario
    const persona = {
        nombre: campos.nombre.value,
        apellido: campos.apellido.value,
        tipo_identificacion: campos.tipo_identificacion.value,
        nuip: campos.nuip.value,
        email: campos.email.value,
        clave: campos.clave.value,
        salario: parseFloat(campos.salario.value),
        activo: campos.activo.checked
    };

    try{
        if(modoEdicion){
                persona.id_personas = campos.id.value;
            

            if(inputImagen.files[0]){
                const imagenBase64 = await convertirImagenBase64(inputImagen.files[0]);
                await fetch(`${API_URL}/imagenes/subir/personas/id_personas/${persona.id_personas}`,{
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({imagen: imagenBase64})
                });
            }

            await actualizarPersona(persona);
        }else{
            const response = await crearPersona(persona);

            if(!response.id){
                throw new Error('el servidor no devolvio el id de la persona creada');
            }

            if(inputImagen.files[0]){
                const imagenBase64 = await convertirImagenBase64(inputImagen.files[0]);
                await fetch(`${API_URL}/imagenes/insertar/personas/id_personas/${response.id}`,{
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({imagen: imagenBase64})
                });
            }
        }
        resetearFormulario();
        cargarPersonas();
    }catch(error){
        console.error('error al guardar persona: ', error);
        alert('error al guardar los datos: ' + error.message);
    }
}

//crear una nuevz persona en la base de datos

async function crearPersona(persona){
    const response = await fetch(`${API_URL}/personas`,{
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(persona)
    });

    if(!response.ok){
        throw new Error(`error HTTP: ${response.status}`);
    }

    const data = await response.json();

    if(!data.id){
        throw new Error('la respuesta del servidor no contiene el id de la persona');
    }

    return data;
}

//actualiza los datos de una persona existente
async function actualizarPersona(persona){
    const response = await fetch(`${API_URL}/personas/${persona.id_personas}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(persona)
    });
    const data = await response.json();
    return data;
}

//elimina una persona y su imagen asociada

async function eliminarPersona(id){
    if(!confirm('¿esta seguro de eliminar esta persona')) return;

    try{
        await fetch(`${API_URL}/imagenes/eliminar/personas/id_personas/${id}`,{
            method: 'DELETE'
        });

        await fetch(`${API_URL}/personas/${id}`,{
            method: 'DELETE'
        });
        cargarPersonas();
    }catch(error){
        console.error('error al elimianr persona: ', error);
        alert('error al elimianr la persona: '+ error.message);
    }
}

//cargar los datos de la persona al formulario para editar
async function editarPersona(persona){
    modoEdicion = true;

    //cargar campos
    if (campos.id) {
        campos.id.value = persona.id_personas;
    }
    campos.nombre.value = persona.nombre;
    campos.apellido.value = persona.apellido;
    campos.tipo_identificacion.value = persona.tipo_identificacion;
    campos.nuip.value = persona.nuip;
    campos.email.value = persona.email;
    campos.clave.value = persona.clave;
    campos.salario.value = persona.salario;
    campos.activo.checked = persona.activo;

    //cargar imagen

    try{
        const response = await fetch(`${API_URL}/imagenes/obtener/personas/id_personas/${persona.id_personas}`);
        const data = await response.json();

        if(data.imagen){
            previewImagen.src = `data:image/jpeg;base64,${data.imagen}`;
            previewImagen.style.display = 'block';
        }else{
            previewImagen.style.display = 'none';
            previewImagen.src = '';
        }
    }catch (error){
        console.error('error al cargar imagen', error);
        previewImagen.style.display = 'none';
        previewImagen.src = '';
    }
    btnGuardar.textContent = 'Actualizar';
}

//restablece el formulario al estado original
function resetearFormulario(){
    modoEdicion = false;
    form.reset();
    previewImagen.style.display = 'none';
    previewImagen.src = '';
    btnGuardar.textContent = 'Guardar';
}

//previsualiza imagen cuando se selecciona una
function manejarCambioImagen(e){
    const file = e.target.files[0];

    if(file){
        const reader = new FileReader();
        reader.onload = function(e){
            previewImagen.src = e.target.result;
            previewImagen.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }else{
        previewImagen.style.display = 'none';
        previewImagen.src = '';
    }
}

//convierte una imagen a base64 para enviar al servidor
function convertirImagenBase64(file){
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.readAsDataURL(file);

        reader.onload = () => {
            const base64 = reader.result.split(',')[1]; //  quitar prefijo MIME
            resolve(base64);
        };

        reader.onerror = error => reject(error);
    });
}