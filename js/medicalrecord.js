document.addEventListener("DOMContentLoaded", () => {
    const emergencyModal = document.getElementById("emergency-modal");
    const consultationModal = document.getElementById("consultation-modal");

    const openEmergencyBtn = document.getElementById("open-emergency-modal");
    const openConsultationBtn = document.getElementById("open-consultation-modal");

    const cancelEmergencyBtn = document.getElementById("cancel-emergency");
    const cancelConsultationBtn = document.getElementById("cancel-consultation");

    const prevButton = document.getElementById("prev-page");
    const nextButton = document.getElementById("next-page");

    const openModal = (modal) => {
        if (modal) {
            modal.classList.remove("hidden");
        } else {
            console.error("Modal no encontrado.");
        }
    };

    const closeModal = (modal) => {
        if (modal) {
            modal.classList.add("hidden");
        } else {
            console.error("Modal no encontrado.");
        }
    };

    openEmergencyBtn?.addEventListener("click", () => openModal(emergencyModal));
    openConsultationBtn?.addEventListener("click", () => openModal(consultationModal));

    cancelEmergencyBtn?.addEventListener("click", () => closeModal(emergencyModal));
    cancelConsultationBtn?.addEventListener("click", () => closeModal(consultationModal));

    document.getElementById('save-emergency').addEventListener('click', async () => {
        try {

            const fechaConsulta = new Date(); 
            const fechaConsultaFormateada = fechaConsulta.toISOString(); 
            
            const consultaEmergencia = {
                diagnosticoEmergencia: document.getElementById("emergency-diagnosis").value.trim(),
                tratamientoEmergencia: document.getElementById("emergency-treatment").value.trim(),
                fechaEmergencia: fechaConsultaFormateada,
                idPaciente: idPacienteTemporal,
                idPersonalMedico: localStorage.getItem("id")
            };
    
            // Llamada a tu API REST
            const response = await fetch(API_BASE_URL + '/api/consultaEmergencia/insertar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(consultaEmergencia)
            });
    
            const data = await response.json();
    
            if (response.ok) {
                alert('Consulta de emergencia guardada correctamente.');
                closeModal(emergencyModal);
            } else {
                alert(`Error: ${data.mensaje}`);
            }
        } catch (error) {
            alert('Hubo un error al guardar la consulta de emergencia.');
            console.error(error);
        }
    });    

    window.addEventListener("click", (event) => {
        if (event.target === emergencyModal) {
            closeModal(emergencyModal);
        }
        if (event.target === consultationModal) {
            closeModal(consultationModal);
        }
    });

    const API_BASE_URL = "http://localhost:3000";
    const searchButton = document.querySelector(".search-button");
    const inputField = document.querySelector(".search-bar input");
    let idPacienteTemporal = null; 
    let paginaActual = 1; 
    let totalConsultas = 0; 
    let totalPaginas = 1; 
    const tamanioPagina = 5; 

    const saveConsultationBtn = document.getElementById("save-consultation");

    saveConsultationBtn?.addEventListener("click", async () => {
        const diagnostico = document.getElementById("consultation-diagnosis").value.trim();
        const tratamiento = document.getElementById("consultation-treatment").value.trim();

        if (!diagnostico || !tratamiento) {
            alert("Por favor, ingresa el diagnóstico y el tratamiento.");
            return;
        }

        await registrarConsultaMedica(diagnostico, tratamiento);
    });

    searchButton.addEventListener("click", async () => {
        const CURP = inputField.value.trim();

        if (!CURP) {
            alert("Por favor, ingresa una CURP para buscar.");
            return;
        }

        const expedienteData = await obtenerExpedienteMedico(CURP);
        if (expedienteData) {
            mostrarExpedienteMedico(expedienteData);
            validarPaciente();
        }

        const total = await obtenerTotalConsultas(CURP);
        if (total !== null) {
            totalConsultas = total;
            totalPaginas = Math.ceil(totalConsultas / tamanioPagina); 

            actualizarPaginacion();

            const consultasData = await obtenerConsultasMedicas(CURP, paginaActual);
            if (consultasData) {
                mostrarConsultas(consultasData);
            }
        }

        openEmergencyBtn.classList.remove("disabled");
        openConsultationBtn.classList.remove("disabled");
        openEmergencyBtn.classList.remove("disabled");
        document.getElementById("validated-button").classList.remove("disabled");
    });

    function actualizarPaginacion() {
        prevButton.disabled = paginaActual === 1; 
        nextButton.disabled = paginaActual === totalPaginas; 
    }

    async function obtenerExpedienteMedico(CURP) {
        try {
            const token = localStorage.getItem("token");
    
            if (!token) {
                alert("No se encontró un token válido. Por favor, inicia sesión nuevamente.");
                return;
            }
    
            const expedienteResponse = await fetch(`${API_BASE_URL}/api/expedienteMedico/recuperar`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ CURP: CURP })
            });
    
            if (!expedienteResponse.ok) {
                if (expedienteResponse.status === 404) {
                    alert("No se encontraron datos para la CURP proporcionada.");
                } else {
                    alert("Error al recuperar los datos del expediente médico.");
                }
                return null;
            }
    
            const expedienteData = await expedienteResponse.json();    
            idPacienteTemporal = expedienteData.resultado[0].idPaciente;    
            return expedienteData;
        } catch (error) {
            alert("Ocurrió un error inesperado al obtener el expediente médico.");
            console.error(error);
            return null;
        }
    }

    async function obtenerConsultasMedicas(CURP, pagina) {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("No se encontró un token válido. Por favor, inicia sesión nuevamente.");
                return null;
            }

            const consultasResponse = await fetch(`${API_BASE_URL}/api/consultaMedica/recuperarConsultas`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    CURP: CURP,
                    pagina: pagina,
                    tamanioPagina: tamanioPagina
                })
            });

            if (consultasResponse.ok) {
                const consultasData = await consultasResponse.json();
                return consultasData;
            } else {
                console.error("Error al recuperar las consultas médicas.");
                return null;
            }
        } catch (error) {
            alert("Ocurrió un error inesperado al obtener las consultas médicas.");
            console.error(error);
            return null;
        }
    }

    function mostrarExpedienteMedico(data) {
        if (!data || !data.resultado || data.resultado.length === 0) {
            alert("No se encontraron datos para mostrar.");
            return;
        }

        const profileContainer = document.getElementById("profile-container");

        profileContainer.innerHTML = '';

        const expediente = data.resultado[0];

        const pacienteNombre = expediente.nombre || "No disponible";
        const pacienteFechaNacimiento = formatearFecha(expediente.fechaNacimiento) || "No disponible";
        const pacienteSexo = expediente.sexo === "M" ? "Masculino" : expediente.sexo === "F" ? "Femenino" : "No disponible";
        const pacienteAlergias = expediente.alergias || "No disponible";
        const pacienteEnfermedadesCronicas = expediente.enfermedadesCronicas || "No disponible";
        const pacienteTratamientoActual = expediente.tratamientoActual || "No disponible";

        const expedienteInfo = document.createElement('div');
        expedienteInfo.classList.add('expediente-info');

        expedienteInfo.innerHTML = `
            <h1 id="patient-name">${pacienteNombre}</h1>
            <p><strong>Fecha de nacimiento:</strong> <span id="patient-dob">${pacienteFechaNacimiento}</span></p>
            <p><strong>Sexo:</strong> <span id="patient-gender">${pacienteSexo}</span></p>
            <p><strong>Alergias:</strong> <span id="patient-allergies">${pacienteAlergias}</span></p>
            <p><strong>Enfermedades crónicas:</strong> <span id="patient-chronic-diseases">${pacienteEnfermedadesCronicas}</span></p>
            <p><strong>Tratamiento actual:</strong> <span id="patient-current-treatment">${pacienteTratamientoActual}</span></p>
            <button id="edit-expediente-btn">Editar Expediente</button>
        `;

        profileContainer.appendChild(expedienteInfo);

        //profileContainer.closest('.profile').classList.remove('hidden');
        const editButton = document.getElementById("edit-expediente-btn");
        editButton.addEventListener("click", () => {
            openModal(document.getElementById("edit-expediente-modal"));
            document.getElementById("edit-allergies").value = pacienteAlergias;
            document.getElementById("edit-chronic-diseases").value = pacienteEnfermedadesCronicas;
        });
    }

    async function actualizarExpediente(CURP, alergias, enfermedadesCronicas) {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(`${API_BASE_URL}/api/expedienteMedico/modificar`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ CURP, alergias, enfermedadesCronicas })
            });

            if (!response.ok) {
                alert("Error al actualizar el expediente médico.");
                return;
            }

            alert("Expediente médico actualizado con éxito.");

            const updatedData = await obtenerExpedienteMedico(CURP);
            if (updatedData) {
                mostrarExpedienteMedico(updatedData);
            }
        } catch (error) {
            alert("Ocurrió un error inesperado al actualizar el expediente médico.");
            console.error(error);
        }
    }

    document.getElementById("save-edit-expediente")?.addEventListener("click", async () => {
        const alergias = document.getElementById("edit-allergies").value.trim();
        const enfermedades = document.getElementById("edit-chronic-diseases").value.trim();

        if (!idPacienteTemporal) {
            alert("ID de paciente no encontrado.");
            return;
        }

        await actualizarExpediente(inputField.value.trim(), alergias, enfermedades);
        closeModal(document.getElementById("edit-expediente-modal"));
    });

    document.getElementById("cancel-edit-expediente")?.addEventListener("click", () =>{
        closeModal(document.getElementById("edit-expediente-modal"));
    });

    function mostrarConsultas(data) {
        const consultationList = document.getElementById("consultation-list");
        consultationList.innerHTML = '';
    
        if (data && data.length > 0) {
            data.forEach(consulta => {
                const consultationDiv = document.createElement("div");
                consultationDiv.classList.add("consultation");
    
                consultationDiv.innerHTML = `
                    <p><strong>Fecha:</strong> <span class="consultation-date">${formatearFecha(consulta.fechaConsulta)}</span></p>
                    <p><strong>Diagnóstico:</strong> <span class="consultation-diagnosis">${consulta.diagnostico}</span></p>
                    <p><strong>Tratamiento:</strong> <span class="consultation-treatment">${consulta.tratamiento}</span></p>
                `;
                consultationList.appendChild(consultationDiv);
            });
        } else {
            consultationList.innerHTML = "<p>No hay consultas registradas para este paciente.</p>";
        }
    }

    prevButton.addEventListener("click", () => {
        if (paginaActual > 1) {
            paginaActual--;
            actualizarPaginacion();

            const CURP = inputField.value.trim();
            obtenerConsultasMedicas(CURP, paginaActual).then(consultasData => {
                if (consultasData) {
                    mostrarConsultas(consultasData);
                }
            });
        }
    });

    nextButton.addEventListener("click", () => {
        if (paginaActual < totalPaginas) {
            paginaActual++;
            actualizarPaginacion();

            const CURP = inputField.value.trim();
            obtenerConsultasMedicas(CURP, paginaActual).then(consultasData => {
                if (consultasData) {
                    mostrarConsultas(consultasData);
                }
            });
        }
    });

    function formatearFecha(fechaISO) {
        if (!fechaISO) return "Fecha no disponible";
        
        const fecha = new Date(fechaISO);
        const dia = fecha.getUTCDate();
        const mes = fecha.getUTCMonth(); 
        const año = fecha.getUTCFullYear();
        const meses = [
            'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
            'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
        ];
    
        return `${dia} de ${meses[mes]} de ${año}`;
    }    

    async function obtenerTotalConsultas(CURP) {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("No se encontró un token válido. Por favor, inicia sesión nuevamente.");
                return null;
            }

            const response = await fetch(`${API_BASE_URL}/api/consultaMedica/totalConsultas`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ CURP: CURP })
            });

            if (response.ok) {
                const data = await response.json();
                return data.totalConsultas;
            } else {
                console.error("Error al obtener el total de consultas.");
                return null;
            }
        } catch (error) {
            alert("Ocurrió un error inesperado al obtener el total de consultas.");
            console.error(error);
            return null;
        }
    }

    async function registrarConsultaMedica(diagnostico, tratamiento) {
        try {
            const idPaciente = idPacienteTemporal;
            const idPersonalMedico = obtenerIdUsuario();
    
            if (!idPaciente || isNaN(parseInt(idPaciente, 10))) {
                alert("El idPaciente no es válido o no está presente.");
                return;
            }
    
            if (!idPersonalMedico) {
                alert("No se pudo obtener el id del médico.");
                return;
            }
    
            const fechaConsulta = new Date(); 
            const fechaConsultaFormateada = fechaConsulta.toISOString(); 
    
            const consultaResponse = await fetch(`${API_BASE_URL}/api/consultaMedica/insertarConsultaMedica`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    diagnostico: diagnostico,
                    tratamiento: tratamiento,
                    fechaConsulta: fechaConsultaFormateada,
                    idPaciente: idPaciente,
                    idPersonalMedico: idPersonalMedico
                })
            });
    
            if (consultaResponse.ok) {
                alert("Consulta médica registrada con éxito.");
    
                setTimeout(async () => {
                    const CURP = document.querySelector(".search-bar input").value.trim();
                    const consultasData = await obtenerConsultasMedicas(CURP);
                    if (consultasData) {
                        mostrarConsultas(consultasData);
                    }
    
                    const expedienteData = await obtenerExpedienteMedico(CURP);
                    if (expedienteData) {
                        mostrarExpedienteMedico(expedienteData);
                    }
    
                    closeModal(consultationModal);
                }, 1000);
            } else {
                alert("Error al registrar la consulta médica.");
            }
        } catch (error) {
            console.error("Error al registrar consulta médica:", error);
            alert("Ocurrió un error al registrar la consulta médica.");
        }
    }
    

    //Validar paciente
    const validarPaciente = async () => {
        if (!idPacienteTemporal) {
            alert("No se ha encontrado un paciente. Por favor, realiza una búsqueda primero.");
            return;
        }
    
        try {
            const token = localStorage.getItem("token");
    
            if (!token) {
                alert("No se encontró un token válido. Por favor, inicia sesión.");
                return;
            }
    
            const response = await fetch(`${API_BASE_URL}/api/paciente/verificarValidacion/${idPacienteTemporal}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
    
            const data = await response.json();
    
            const openConsultationBtn = document.getElementById("open-consultation-modal");
            const validatedButton = document.getElementById("validated-button");
    
            if (data.mensaje === 'El paciente está validado.') {
                validatedButton.setAttribute("disabled", "true");
                validatedButton.style.display = 'none';
    
                openConsultationBtn.style.display = 'block';
                openConsultationBtn.removeAttribute("disabled"); 
                openConsultationBtn.classList.remove("disabled");
            } else if (data.mensaje === 'El paciente no está validado.') {
                validatedButton.removeAttribute("disabled");
                validatedButton.style.display = 'block';
    
                openConsultationBtn.style.display = 'none'; 
                openConsultationBtn.setAttribute("disabled", "true");
                openConsultationBtn.classList.add("disabled");
            } else {
                console.error('Error al verificar la validación');
                validatedButton.style.display = 'none';
                openConsultationBtn.style.display = 'none';
            }
        } catch (error) {
            console.error("Error al verificar el estado de validación:", error);
            document.getElementById("validated-button").style.display = 'none';
            document.getElementById("open-consultation-modal").style.display = 'none';
        }
    };

    const validarPacientePorCURP = async () => {
        const CURP = document.querySelector(".search-bar input").value.trim();

        if (!CURP) {
            alert("Por favor, ingresa una CURP para validar al paciente.");
            return;
        }

        if (!idPacienteTemporal) {
            alert("No se ha encontrado un paciente. Por favor, realiza una búsqueda primero.");
            return;
        }

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                alert("No se encontró un token válido. Por favor, inicia sesión.");
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/paciente/validarPaciente/${CURP}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.mensaje === 'Paciente validado correctamente.') {
                const validatedButton = document.getElementById("validated-button");
                validatedButton.setAttribute("disabled", "true");
                validatedButton.style.display = 'none';
                alert('Paciente validado correctamente.');
            } else {
                console.error('Error al validar al paciente:', data.mensaje);
                alert('Error al validar al paciente.');
            }
        } catch (error) {
            console.error("Error al validar al paciente:", error);
            alert('Error al validar al paciente.');
        }
    };

    document.getElementById("validated-button")?.addEventListener("click", validarPacientePorCURP);

    function obtenerIdUsuario() {
        const token = localStorage.getItem("token");
    
        if (!token) {
            alert("No se encontró un token válido. Por favor, inicia sesión.");
            return null;
        }
    
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));     
            const idUsuario = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/primarysid"];
    
            if (!idUsuario) {
                console.error("No se encontró el idUsuario en el token.");
                return null;
            }
    
            return idUsuario;
        } catch (error) {
            console.error("Error al decodificar el token:", error);
            return null;
        }
    }
});