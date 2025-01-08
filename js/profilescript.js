const API_BASE_URL = "https://21d64cmx-3000.usw3.devtunnels.ms/";
let contactoEnEdicion = 0;
let contactos;
let token;
function protegerRutaPaciente() {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "paciente") {
        alert("Acceso denegado. No cuentas con los permisos necesarios.");
        window.location.href = "login.html";
    }
}

protegerRutaPaciente();

document.addEventListener("DOMContentLoaded", () => {
    const editModal = document.getElementById("edit-modal");
    const addModal = document.getElementById("add-modal");
    const emergencyContactList = document.getElementById("emergency-contact-list");

    async function obtenerContactos(idPaciente) {
        try {
            token = localStorage.getItem("token");

            const response = await fetch(API_BASE_URL + `api/contactos/obtenerContactos/${idPaciente}`, {
                method: "GET",
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
            });

            if (!response.ok) throw new Error('Error al obtener contactos');

            contactos = await response.json();
            emergencyContactList.innerHTML = ''; 

            let tutor = "";

            contactos.forEach(contacto => {
                tutor = contacto.esTutor ? "Sí" : "No";

                const contactElement = document.createElement('div');
                contactElement.classList.add('emergency-contact');
                contactElement.id = `contact-${contacto.idInformacionEmergencia}`;
                contactElement.innerHTML = `
                    <div class="contact-info">
                        <p><strong>${contacto.contactoEmergencia}</strong></p>
                        <p><strong>Teléfono:</strong> ${contacto.telefonoContacto1}</p>
                        <p><strong>Parentesco:</strong> ${contacto.parentesco}</p>
                        <p><strong>Es tutor:</strong>${tutor}</p>
                    </div>
                    <div class="contact-actions">
                        <button class="icon-btn" onclick="openEditModal(
                            ${contacto.idInformacionEmergencia},
                            ${contacto.telefonoContacto1},
                            '${contacto.parentesco}',
                            '${contacto.esTutor}')">✏️</button>
                        <button class="icon-btn" onclick="deleteContact(${contacto.idInformacionEmergencia})">🗑️</button>
                    </div>
                `;
                emergencyContactList.appendChild(contactElement);
            });

            const addContactBtn = document.getElementById("add-contact-btn");
            if (contactos.length >= 2) {
                addContactBtn.disabled = true;  
            } else {
                addContactBtn.disabled = false; 
            }
        } catch (err) {
            console.error(error);
            alert('Error al cargar los contactos de emergencia');
        }
    }

    obtenerContactos(localStorage.getItem("id"));

    window.openEditModal = (id, telefono, parentesco, tutor) => {
        contactoEnEdicion = id;
        document.getElementById("edit-number").value = telefono;
        document.getElementById("edit-family").value = parentesco;
        document.getElementById("is-tutor-edit").checked = tutor === 'true';
        editModal.style.display = "flex";
    };

    window.closeEditModal = () => {
        editModal.style.display = "none";
    };

    window.saveChanges = () => {
        const number = document.getElementById("edit-number").value;
        const family = document.getElementById("edit-family").value;
        const esTutor = document.getElementById("is-tutor-edit").checked;

        if (!validatePhone(number)) {
            alert("El teléfono debe contener solo números y tener al menos 10 dígitos.");
            return;
        }

        if (!validateText(family)) {
            alert("El parentesco solo puede contener letras y espacios.");
            return;
        }

        const contactoActualizado = {
            idPaciente: localStorage.getItem("id"),
            idInformacionEmergencia: contactoEnEdicion, 
            telefonoContacto1: number,
            parentesco: family,
            esTutor: esTutor
        };

        editContacto(contactoActualizado);
    };

    window.deleteContact = (id) => {
        deleteContacto(id);
    };

    document.getElementById("add-contact-btn").addEventListener("click", () => {
        addModal.style.display = "flex";
    });

    window.closeAddModal = () => {
        addModal.style.display = "none";
        document.getElementById("add-contact-form").reset();
    };

    window.addContact = () => {
        const name = document.getElementById("contact-name").value;
        const relationship = document.getElementById("contact-relationship").value;
        const phone = document.getElementById("contact-phone").value;
        const esTutor = document.getElementById("is-tutor").checked;

        if (!validateText(name)) {
            alert("El nombre solo puede contener letras y espacios.");
            return;
        }

        if (!validateText(relationship)) {
            alert("El parentesco solo puede contener letras y espacios.");
            return;
        }

        if (!validatePhone(phone)) {
            alert("El teléfono debe contener solo números y tener al menos 10 dígitos.");
            return;
        }

        const nuevoContacto = {
            contactoEmergencia: name,
            telefonoContacto1: phone,
            parentesco: relationship,
            esTutor: esTutor,
            idPaciente: localStorage.getItem("id"),
            esRegistroPaciente: 0
        };

        addContacto(nuevoContacto);
    };
});

async function addContacto(nuevoContacto) {
    try {
        const response = await fetch(API_BASE_URL + 'api/contactos/insertarContacto', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevoContacto)
        });

        const data = await response.json();
        alert(data.mensaje);

        if (response.ok) {
            window.location.reload(); 
        }
    } catch (error) {
        console.error(error);
        alert('Error al agregar el contacto');
    }
}

async function editContacto(contacto) {
    try {
        const response = await fetch(API_BASE_URL + 'api/contactos/actualizarContacto', {
            method: 'PUT',
            headers: {
                "Authorization": `Bearer ${token}`,
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

async function deleteContacto(idContacto) {
    try {
        const response = await fetch(API_BASE_URL + `api/contactos/eliminarContacto/${idContacto}`, {
            method: 'DELETE',
            headers: {
                "Authorization": `Bearer ${token}`
            },
        });

        const data = await response.json();
        alert(data.mensaje);

        if (response.ok) {
            window.location.reload();
        }
    } catch (error) {
        console.error(error);
        alert('Error al eliminar el contacto');
    }
}

const validateText = (text) => {
    const regex = /^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]+$/;
    return regex.test(text);
};

const validatePhone = (phone) => {
    const regex = /^[0-9]{10,}$/;
    return regex.test(phone);
};