document.addEventListener("DOMContentLoaded", async function () {
    const form = document.getElementById("registration-form");
    const hospitalSelect = document.getElementById("hospital");

    const API_BASE_URL = "http://localhost:3000/api";

    const regexTelefono = /^[0-9]{10}$/;
    const regexCorreo = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const regexContrasena = /^(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{15,20}$/;

    async function cargarHospitales() {
        try {
            const response = await fetch(`${API_BASE_URL}/hospital/obtenerHospitales`);
            if (!response.ok) {
                throw new Error("Error al obtener la lista de hospitales.");
            }

            const hospitales = await response.json();
            hospitalSelect.innerHTML = "<option value=''>Selecciona un hospital</option>";

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

    cargarHospitales();

    form.addEventListener("input", function (event) {
        const target = event.target;

        if (target.id === "nombre") {
            target.value = target.value.slice(0, 100);
        } else if (target.id === "telefono" || target.id === "telefono-emergencia") {
            target.value = target.value.replace(/[^0-9]/g, "").slice(0, 10);
        } else if (target.id === "correo") {
            target.value = target.value.slice(0, 100);
        } else if (target.id === "nombre-emergencia") {
            target.value = target.value.slice(0, 100);
        } else if (target.id === "parentesco") {
            target.value = target.value.slice(0, 20);
        } else if (target.id === "password") {
            const mensajeError = document.getElementById("password-error");
            if (!regexContrasena.test(target.value)) {
                mensajeError.innerHTML =
                    "La contraseña debe:<br>- Tener entre 15 y 20 caracteres.<br>- Incluir al menos un número.<br>- Incluir al menos un carácter especial (!@#$%^&*).";
                mensajeError.style.color = "red";
                mensajeError.style.fontSize = "0.9em";
                mensajeError.style.marginTop = "5px";
                mensajeError.style.display = "block";
            } else {
                mensajeError.style.display = "none";
            }
        }
    });
    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        let isValid = true;

        const nombre = document.getElementById("nombre").value;
        const telefono = document.getElementById("telefono").value;
        const correo = document.getElementById("correo").value;
        const contrasena = document.getElementById("password").value;
        const nombreEmergencia = document.getElementById("nombre-emergencia").value;
        const telefonoEmergencia = document.getElementById("telefono-emergencia").value;
        const parentesco = document.getElementById("parentesco").value;

        if (!regexTelefono.test(telefono) || !regexTelefono.test(telefonoEmergencia)) {
            alert("El número de teléfono debe tener 10 caracteres numéricos.");
            isValid = false;
        }
        if (!regexCorreo.test(correo)) {
            alert("Por favor, ingrese un correo válido.");
            isValid = false;
        }
        if (!regexContrasena.test(contrasena)) {
            alert(
                "La contraseña debe:\n- Tener entre 15 y 20 caracteres.\n- Incluir al menos un número.\n- Incluir al menos un carácter especial (!@#$%^&*)."
            );
            isValid = false;
        }
        if (!isValid) {
            return;
        }

        const pacienteData = {
            nombre,
            fechaNacimiento: document.getElementById("fecha-nacimiento").value,
            sexo: document.getElementById("sexo").value === "masculino" ? "M" : "F",
            correo,
            telefono,
            CURP: document.getElementById("curp").value,
            contrasena,
            alergias: document.getElementById("alergias").value,
            enfermedadesCronicas: document.getElementById("enfermedades").value,
            tratamientoActual: document.getElementById("tratamiento").value,
            hospitalRegistro: document.getElementById("hospital").value,
        };

        const contactoData = {
            contactoEmergencia: nombreEmergencia,
            telefonoContacto1: telefonoEmergencia,
            parentesco,
            esTutor: document.getElementById("tutor-yes").checked ? 1 : 0,
            esRegistroPaciente: 1,
        };

        try {
            const pacienteResponse = await fetch(`${API_BASE_URL}/crearPaciente/crearPaciente`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(pacienteData),
            });

            if (!pacienteResponse.ok) {
                const errorData = await pacienteResponse.json();
                throw new Error(errorData.error || "Error al registrar al paciente.");
            }

            const pacienteResult = await pacienteResponse.json();
            const idPaciente = pacienteResult.idPaciente;

            if (!idPaciente) {
                throw new Error("No se obtuvo el ID del paciente registrado.");
            }

            contactoData.idPaciente = idPaciente;

            const contactoResponse = await fetch(`${API_BASE_URL}/contactos/insertarContacto`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(contactoData),
            });

            if (!contactoResponse.ok) {
                const errorContacto = await contactoResponse.json();
                throw new Error(errorContacto.error || "Error al registrarse, inténtelo más tarde.");
            }

            const contactoResult = await contactoResponse.json();
            alert(contactoResult.mensaje || "Registro exitoso, por favor inicia sesión.");
            form.reset();
            window.location.href = "login.html";
        } catch (error) {
            console.error("Error al enviar la solicitud:", error);
            alert("Error al registrar: " + error.message);
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
});

