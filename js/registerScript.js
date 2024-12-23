document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("registration-form");
    const emergencyButton = document.getElementById("add-emergency-contact");
    const emergencySection = document.getElementById("emergency-contact-section");

    let contactCount = 1; // Contador de contactos de emergencia

    form.addEventListener("submit", function (event) {
        event.preventDefault(); // Evitar envío automático

        const requiredFields = document.querySelectorAll("[required]");
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.style.borderColor = "red";
                isValid = false;
            } else {
                field.style.borderColor = "#ccc";
            }
        });

        const tutorYes = document.getElementById("tutor-yes").checked;
        const tutorNo = document.getElementById("tutor-no").checked;

        if (!tutorYes && !tutorNo) {
            alert("Por favor, seleccione una opción en '¿Es tutor?'.");
            isValid = false;
        }

        if (isValid) {
            alert("Formulario enviado con éxito.");
            form.reset();
        } else {
            alert("Por favor, complete todos los campos obligatorios.");
        }
    });

    form.addEventListener("reset", function () {
        const requiredFields = document.querySelectorAll("[required]");
        requiredFields.forEach(field => {
            field.style.borderColor = "#ccc";
        });

        document.getElementById("tutor-yes").checked = false;
        document.getElementById("tutor-no").checked = false;
    });

    emergencyButton.addEventListener("click", function () {
        contactCount += 1; // Incrementar contador de contactos

        const contactDiv = document.createElement("div");
        contactDiv.innerHTML = `
            <h3>Contacto de emergencia ${contactCount}</h3>
            <label for="emergency-name-${contactCount}">Nombre completo*</label>
            <input type="text" id="emergency-name-${contactCount}" name="emergency-name-${contactCount}" required />

            <label for="emergency-phone-${contactCount}">Número Telefónico*</label>
            <input type="text" id="emergency-phone-${contactCount}" name="emergency-phone-${contactCount}" required />

            <label for="emergency-relationship-${contactCount}">Parentesco*</label>
            <input type="text" id="emergency-relationship-${contactCount}" name="emergency-relationship-${contactCount}" required />

            <label>¿Es tutor?*</label>
            <div>
                <input type="radio" id="tutor-yes-${contactCount}" name="tutor-${contactCount}" value="yes" />
                <label for="tutor-yes-${contactCount}">Sí</label>

                <input type="radio" id="tutor-no-${contactCount}" name="tutor-${contactCount}" value="no" />
                <label for="tutor-no-${contactCount}">No</label>
            </div>
        `;

        contactDiv.style.marginTop = "20px";
        emergencySection.appendChild(contactDiv);
    });
});
