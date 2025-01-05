document.addEventListener("DOMContentLoaded", async function () {
    const form = document.getElementById("registration-form");
    const hospitalSelect = document.getElementById("hospital");

    // Llenar el comboBox de hospitales
    async function cargarHospitales() {
        try {
            const response = await fetch("http://localhost:3000/api/hospital/obtenerHospitales");
            if (!response.ok) {
                throw new Error("Error al obtener la lista de hospitales.");
            }

            const hospitales = await response.json();
            hospitalSelect.innerHTML = "<option value=''>Selecciona un hospital</option>"; // Limpiar y agregar opción por defecto

            hospitales.forEach(hospital => {
                const option = document.createElement("option");
                option.value = hospital.idHospital;
                option.textContent = hospital.nombreHospital;
                hospitalSelect.appendChild(option);
            });
        } catch (error) {
            console.error("Error al cargar hospitales:", error);
            hospitalSelect.innerHTML = "<option value=''>Error al cargar hospitales</option>";
        }
    }

    // Llamar a la función para cargar hospitales al inicio
    cargarHospitales();

    // Validación y envío del formulario
    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        let isValid = true;
        const requiredFields = document.querySelectorAll("[required]");

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

        if (!isValid) {
            alert("Por favor, complete todos los campos obligatorios.");
            return;
        }

        // Recolección de datos del formulario
        const formData = {
            nombre: document.getElementById("nombre").value,
            fechaNacimiento: document.getElementById("fecha-nacimiento").value,
            sexo: document.getElementById("sexo").value === "masculino" ? "M" : "F",
            correo: document.getElementById("correo").value,
            telefono: document.getElementById("telefono").value,
            CURP: document.getElementById("curp").value,
            contrasena: document.getElementById("password").value,
            alergias: document.getElementById("alergias").value,
            enfermedadesCronicas: document.getElementById("enfermedades").value,
            tratamientoActual: document.getElementById("tratamiento").value,
            hospitalRegistro: document.getElementById("hospital").value,
        };

        try {
            const response = await fetch("http://localhost:3000/api/crearPaciente/crearPaciente", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Error al registrar al paciente.");
            }

            const result = await response.json();
            alert(result.message || "Paciente registrado exitosamente.");
            form.reset();
        } catch (error) {
            console.error("Error al enviar la solicitud:", error);
            alert("Error al enviar la solicitud: " + error.message);
        }
    });

    // Reiniciar los campos
    form.addEventListener("reset", function () {
        const requiredFields = document.querySelectorAll("[required]");
        requiredFields.forEach(field => {
            field.style.borderColor = "#ccc";
        });

        document.getElementById("tutor-yes").checked = false;
        document.getElementById("tutor-no").checked = false;
    });
});

