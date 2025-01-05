document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");
    const form = document.getElementById("registration-form");
    const hospitalSelect = document.getElementById("hospital");

    const API_BASE_URL = "http://localhost:3000/api";
    let idUsuarioTemporal = null;

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

    const limpiarFormulario = () => {
        form.reset();
        idUsuarioTemporal = null;
        document.getElementById("curp").value = "";
        document.getElementById("name").value = "";
        document.getElementById("dob").value = "";
        document.getElementById("gender").value = "";
        document.getElementById("email").value = "";
        document.getElementById("phone").value = "";
    };

    searchButton.addEventListener("click", async () => {
        limpiarFormulario();

        const curp = searchInput.value.trim();

        if (!curp) {
            alert("Por favor, ingrese una CURP válida.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/obtenerPaciente/porCURP/${curp}`);
            const result = await response.json();

            if (response.status === 200 && result.data) {
                idUsuarioTemporal = result.data.idUsuario;
                document.getElementById("curp").value = result.data.CURP;
                document.getElementById("name").value = result.data.nombre;
                document.getElementById("dob").value = new Date(result.data.fechaNacimiento).toLocaleDateString();
                document.getElementById("gender").value = result.data.sexo === "M" ? "Hombre" : "Mujer";
                document.getElementById("email").value = result.data.correo;
                document.getElementById("phone").value = result.data.telefono;
            } else {
                alert(result.error || "No se encontraron datos con la CURP ingresada, intenta nuevamente.");
                idUsuarioTemporal = null;
            }
        } catch (error) {
            console.error("Error al buscar médico:", error);
            alert("Ocurrió un error al realizar la búsqueda.");
            idUsuarioTemporal = null;
        }
    });

    const validarContrasena = (contrasena) => {
        const regex = /^(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{15,20}$/;
        return regex.test(contrasena);
    };

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!idUsuarioTemporal) {
            alert("Primero debe buscar una CURP válida antes de registrar al médico.");
            return;
        }

        const cedulaProfesional = document.getElementById("license").value.trim();
        const contrasena = document.getElementById("password").value.trim();
        const tipoPersonal = document.querySelector("input[name='role']:checked")?.value;
        const hospitalTrabajo = document.getElementById("hospital").value.trim();

        if (!validarContrasena(contrasena)) {
            alert("La contraseña debe tener entre 15 y 20 caracteres, un número y un carácter especial.");
            return;
        }

        if (!cedulaProfesional || !contrasena || !tipoPersonal || !hospitalTrabajo) {
            alert("Por favor, complete todos los campos requeridos.");
            return;
        }

        let tipoPersonalAPI = tipoPersonal === "doctor" ? "Médico" : "Emergencia";

        try {
            const response = await fetch("http://localhost:3000/api/crearMedico", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    CURP: document.getElementById("curp").value,
                    cedulaProfesional,
                    contrasena,
                    tipoPersonal: tipoPersonalAPI,
                    hospitalTrabajo,
                    idUsuario: idUsuarioTemporal,
                }),
            });

            const result = await response.json();

            if (response.status === 201) {
                alert("Personal médico registrado exitosamente.");
                limpiarFormulario();
                window.location.href = "indexadmin.html";
            } else {
                alert(result.error || "Ocurrió un error al registrar al personal médico.");
            }
        } catch (error) {
            console.error("Error al registrar médico:", error);
            alert("Error interno del servidor.");
        }
    });

    form.addEventListener("reset", () => {
        const requiredFields = document.querySelectorAll("[required]");
        requiredFields.forEach((field) => (field.style.borderColor = "#ccc"));
    });
});
