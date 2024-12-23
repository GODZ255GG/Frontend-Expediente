document.addEventListener("DOMContentLoaded", () => {
    const editModal = document.getElementById("edit-modal");
    const addModal = document.getElementById("add-modal");
    const editForm = document.getElementById("edit-form");
    const emergencyContactList = document.getElementById("emergency-contact-list");
    let currentEditId = null;

    // Función para abrir el modal de edición
    window.openEditModal = (id) => {
        currentEditId = id;
        const contact = document.getElementById(id);
        document.getElementById("edit-date").value = "2024-01-22"; // Reemplazar con datos dinámicos
        document.getElementById("edit-diagnosis").value = "Influenza"; // Reemplazar con datos dinámicos
        document.getElementById("edit-treatment").value = "Tomar 5ml de jarabe..."; // Reemplazar con datos dinámicos
        editModal.style.display = "flex";
    };

    // Función para cerrar el modal de edición
    window.closeEditModal = () => {
        editModal.style.display = "none";
    };

    // Guardar cambios al editar un contacto
    window.saveChanges = () => {
        const date = document.getElementById("edit-date").value;
        const diagnosis = document.getElementById("edit-diagnosis").value;
        const treatment = document.getElementById("edit-treatment").value;
        const contact = document.getElementById(currentEditId);

        contact.querySelector("p:nth-of-type(2)").innerText = `Fecha: ${date}`;
        contact.querySelector("p:nth-of-type(3)").innerText = `Diagnóstico: ${diagnosis}`;
        contact.querySelector("p:nth-of-type(4)").innerText = `Tratamiento: ${treatment}`;
        closeEditModal();
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

        const newId = `contact-${Date.now()}`; 
        const newContact = document.createElement("div");
        newContact.classList.add("emergency-contact");
        newContact.id = newId;
        newContact.innerHTML = `
            <div class="contact-info">
                <p><strong>${name}</strong></p>
                <p><strong>Parentesco:</strong> ${relationship}</p>
                <p><strong>Teléfono:</strong> ${phone}</p>
            </div>
            <div class="contact-actions">
                <button class="icon-btn" onclick="openEditModal('${newId}')">✏️</button>
                <button class="icon-btn" onclick="deleteContact('${newId}')">🗑️</button>
            </div>
        `;

        emergencyContactList.appendChild(newContact);
        closeAddModal();
    };
});

