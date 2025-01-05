document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");
    const form = document.getElementById("registration-form");

    let idUsuarioTemporal = null;
    
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

                alert("Información encontrada y cargada en el formulario.");
            } else {
                alert(result.error || "No se encontraron datos con la CURP ingresada.");
                idUsuarioTemporal = null;
            }
        } catch (error) {
            console.error("Error al buscar médico:", error);
            alert("Ocurrió un error al realizar la búsqueda.");
            idUsuarioTemporal = null;
        }
    });

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

