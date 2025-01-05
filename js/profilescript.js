const API_BASE_URL = "https://21d64cmx-3000.usw3.devtunnels.ms/";

document.addEventListener("DOMContentLoaded", () => {
    const editModal = document.getElementById("edit-modal");
    const addModal = document.getElementById("add-modal");
    const editForm = document.getElementById("edit-form");
    const emergencyContactList = document.getElementById("emergency-contact-list");
    let currentEditId = null;

    // Función para enviar credenciales y recibir el token
    async function obtenerContactos(idPaciente) {
        try {
            // Capturamos la respuesta en la variable response
            const response = await fetch(API_BASE_URL + `api/contactos/obtenerContactos/${idPaciente}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            // Validamos si la respuesta no es satisfactoria (status >= 400)
            if (!response.ok) throw new Error('Error al obtener contactos');

            const contactos = await response.json();
                emergencyContactList.innerHTML = ''; // Limpiar la lista

                // Crear los elementos de contacto
                contactos.forEach(contacto => {
                    const contactElement = document.createElement('div');
                    contactElement.classList.add('emergency-contact');
                    contactElement.id = `contact-${contacto.idInformacionEmergencia}`;
                    contactElement.innerHTML = `
                        <div class="contact-info">
                            <p><strong>${contacto.contactoEmergencia}</strong></p>
                            <p><strong>Teléfono:</strong> ${contacto.telefonoContacto1}</p>
                            <p><strong>Parentesco:</strong> ${contacto.parentesco}</p>
                        </div>
                        <div class="contact-actions">
                            <button class="icon-btn" onclick="openEditModal('contact-${contacto.idInformacionEmergencia}')">✏️</button>
                            <button class="icon-btn" onclick="deleteContact(${contacto.idInformacionEmergencia})">🗑️</button>
                        </div>
                    `;
                    emergencyContactList.appendChild(contactElement);
                });
        } catch (err) {
            console.error(error);
            alert('Error al cargar los contactos de emergencia');
        }
    }

    obtenerContactos(1);

    // Función para abrir el modal de edición
    window.openEditModal = (id) => {
        
        editModal.style.display = "flex";
    };

    // Función para cerrar el modal de edición
    window.closeEditModal = () => {
        editModal.style.display = "none";
    };

    // Guardar cambios al editar un contacto
    window.saveChanges = () => {
        const number = document.getElementById("edit-number").value;
        const family = document.getElementById("edit-family").value;
        const contact = document.getElementById(currentEditId);

        const contactoActualizado = {
            idPaciente: 1,
            idInformacionEmergencia: 6, //parseInt(currentEditId.split('-')[1]), // Obtener el ID del contacto
            telefonoContacto1: number,
            parentesco: family,
            esTutor: 1 //treatment === 'Sí' ? 1 : 0
        };

        editContacto(contactoActualizado);
    };

    // Función para eliminar un contacto
    window.deleteContact = (id) => {
        const contact = document.getElementById(id);
        contact.remove();
    };

    // Abrir el modal para agregar un nuevo contacto
    document.getElementById("add-contact-btn").addEventListener("click", () => {
        addModal.style.display = "flex";
    });

    // Cerrar el modal de agregar contacto
    window.closeAddModal = () => {
        addModal.style.display = "none";
        document.getElementById("add-contact-form").reset();
    };

    // Agregar un nuevo contacto
    window.addContact = () => {
        const name = document.getElementById("contact-name").value;
        const relationship = document.getElementById("contact-relationship").value;
        const phone = document.getElementById("contact-phone").value;

        const nuevoContacto = {
            contactoEmergencia: name,
            telefonoContacto1: phone,
            parentesco: relationship,
            esTutor: 0,
            idPaciente: 1,
            esRegistroPaciente: 1
        };

        addContacto(nuevoContacto);
    };
});

async function addContacto(nuevoContacto) {
    try {
        const response = await fetch('https://21d64cmx-3000.usw3.devtunnels.ms/api/contactos/insertarContacto', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevoContacto)
        });

        const data = await response.json();
        alert(data.mensaje);

        if (response.ok) {
            window.location.reload(); // Recargar la página para ver el nuevo contacto
        }
    } catch (error) {
        console.error(error);
        alert('Error al agregar el contacto');
    }
}

async function editContacto(contacto) {
    try {
        const response = await fetch('https://21d64cmx-3000.usw3.devtunnels.ms/api/contactos/actualizarContacto', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contacto)
        });

        const data = await response.json();
        alert(data.mensaje);

        if (response.ok) {
            window.location.reload();
        }
    } catch (error) {
        console.error(error);
        alert('Error al actualizar el contacto');
    }
}