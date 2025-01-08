document.addEventListener("DOMContentLoaded", () => {
    const emergencyModal = document.getElementById("emergency-modal");
    const consultationModal = document.getElementById("consultation-modal");
    const uploadFileModal = document.getElementById("upload-file-modal");

    const openEmergencyBtn = document.getElementById("open-emergency-modal");
    const openConsultationBtn = document.getElementById("open-consultation-modal");

    const cancelEmergencyBtn = document.getElementById("cancel-emergency");
    const cancelConsultationBtn = document.getElementById("cancel-consultation");

    const prevButton = document.getElementById("prev-page");
    const nextButton = document.getElementById("next-page");

    const updateButton = document.getElementById("update-button");
    const cancelUploadButton = document.getElementById("cancel-upload");

    const openModal = (modal) => {
        if (modal) {
            modal.classList.remove("hidden");
        } else {
            console.error("Modal no encontrado.");
        }
    };

    const closeModal = (modal) => {
        if (modal) {
            document.getElementById("consultation-diagnosis").value = '';
            document.getElementById("consultation-treatment").value = '';
            modal.classList.add("hidden");
        } else {
            console.error("Modal no encontrado.");
        }
    };

    openEmergencyBtn?.addEventListener("click", () => openModal(emergencyModal));
    openConsultationBtn?.addEventListener("click", () => openModal(consultationModal));

    cancelEmergencyBtn?.addEventListener("click", () => closeModal(emergencyModal));
    cancelConsultationBtn?.addEventListener("click", () => closeModal(consultationModal));
    cancelUploadButton?.addEventListener("click", () => closeModal(uploadFileModal));

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

            const token = localStorage.getItem("token");

            const response = await fetch(API_BASE_URL + 'api/consultaEmergencia/insertar', {
                method: 'POST',
                headers: {
                    "Authorization": `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(consultaEmergencia)
            });
    
            const data = await response.json();
    
            if (response.ok) {
                alert('Consulta de emergencia guardada correctamente.');
                document.getElementById("emergency-diagnosis").value = '';
                document.getElementById("emergency-treatment").value = '';
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
        if (event.target === uploadFileModal) {
            closeModal(uploadFileModal);
        }
    });

    const API_BASE_URL = "https://21d64cmx-3000.usw3.devtunnels.ms/";
    const searchButton = document.querySelector(".search-button");
    const inputField = document.querySelector(".search-bar input");
    let idPacienteTemporal = null; 
    let paginaActual = 1; 
    let totalConsultas = 0; 
    let totalPaginas = 1; 
    const tamanioPagina = 5;
    let auxAlergias = "", auxEnfermedadesCronicas = "";

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
        if (!expedienteData) {
            return;
        }
    
        mostrarExpedienteMedico(expedienteData);
        validarPaciente();
    
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
    
            const expedienteResponse = await fetch(`${API_BASE_URL}api/expedienteMedico/recuperar`, {
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
            if (expedienteData.resultado && expedienteData.resultado.length > 0) {
                idPacienteTemporal = expedienteData.resultado[0].idPaciente;
                return expedienteData;
            } else {
                alert("No se encontraron datos para la CURP proporcionada.");
            }
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

            const consultasResponse = await fetch(`${API_BASE_URL}api/consultaMedica/recuperarConsultas`, {
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

        auxAlergias = pacienteAlergias;
        auxEnfermedadesCronicas = pacienteEnfermedadesCronicas;

        const expedienteInfo = document.createElement('div');
        expedienteInfo.classList.add('expediente-info');

        expedienteInfo.innerHTML = `
            <h1 id="patient-name">${pacienteNombre}</h1>
            <p><strong>Fecha de nacimiento:</strong> <span id="patient-dob">${pacienteFechaNacimiento}</span></p>
            <p><strong>Sexo:</strong> <span id="patient-gender">${pacienteSexo}</span></p>
            <p><strong>Alergias:</strong> <div id="patient-allergies" class="editable-field" >${pacienteAlergias}</div></p>
            <p><strong>Enfermedades crónicas:</strong> <div id="patient-chronic-diseases" class="editable-field" >${pacienteEnfermedadesCronicas}</div></p>
            <p><strong>Tratamiento actual:</strong> <div id="patient-current-treatment" class="editable-field" >${pacienteTratamientoActual}</div></p>
            <button id="edit-expediente-btn">Editar Expediente</button>
        `;

        profileContainer.appendChild(expedienteInfo);

        const editButton = document.getElementById("edit-expediente-btn");
        editButton.addEventListener("click", () => {
            openModal(document.getElementById("edit-expediente-modal"));
        });
    }

    async function actualizarExpediente(CURP, alergias, enfermedadesCronicas) {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(`${API_BASE_URL}api/expedienteMedico/modificar`, {
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
                document.getElementById("edit-allergies").value = '';
                document.getElementById("edit-chronic-diseases").value = '';
                mostrarExpedienteMedico(updatedData);
            }
        } catch (error) {
            alert("Ocurrió un error inesperado al actualizar el expediente médico.");
            console.error(error);
        }
    }

    document.getElementById("save-edit-expediente")?.addEventListener("click", async () => {
        if(document.getElementById("edit-allergies").value.trim() === "" && 
        document.getElementById("edit-chronic-diseases").value.trim() === ""){
            alert("No se puede guardar información vacía.");
            return;
        }
        
        let alergias = "";
        if( !(document.getElementById("edit-allergies").value.trim() === "") ){
            if(document.getElementById("edit-allergies").value.trim() === "No disponible"){
                document.getElementById("edit-allergies").value = "";
            }

            alergias = auxAlergias + ', ' + document.getElementById("edit-allergies").value.trim();
        }else{
            alergias = auxAlergias;
        }

        let enfermedades = "";
        if( !(document.getElementById("edit-chronic-diseases").value.trim() === "")){
            if(document.getElementById("edit-chronic-diseases").value.trim() === "No disponible"){
                document.getElementById("edit-chronic-diseases").value = "";
            }

            enfermedades = auxEnfermedadesCronicas + ', ' + document.getElementById("edit-chronic-diseases").value.trim();
        }else{
            enfermedades = auxEnfermedadesCronicas
        }

        if (!idPacienteTemporal) {
            alert("ID de paciente no encontrado.");
            return;
        }

        await actualizarExpediente(inputField.value.trim(), alergias, enfermedades);
        document.getElementById("edit-allergies").value = '';
        document.getElementById("edit-chronic-diseases").value = '';
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
                    <button class="button-top-right" data-id="${consulta.idConsultaMedica}">Descargar receta</button>
                    <button class="button-bottom-right" data-id="${consulta.idConsultaMedica}">Subir receta</button>
                `;
    
                consultationList.appendChild(consultationDiv);
                verificarArchivoEnConsulta(consulta.idConsultaMedica);

                const downloadButton = consultationDiv.querySelector(".button-top-right");
                downloadButton.addEventListener("click", () => {
                    const idConsultaMedica = downloadButton.getAttribute("data-id");
                    descargarArchivo(idConsultaMedica);
                });

                const uploadButton = consultationDiv.querySelector(".button-bottom-right");
                uploadButton.addEventListener("click", () => {
                    const idConsultaMedica = uploadButton.getAttribute("data-id");
                    openModal(uploadFileModal); 
                    uploadFileModal.setAttribute('data-id-consulta', idConsultaMedica); 
                });
            });
        } else {
            consultationList.innerHTML = "<p>No hay consultas registradas para este paciente.</p>";
        }
    }

    //Paginación
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

            const response = await fetch(`${API_BASE_URL}api/consultaMedica/totalConsultas`, {
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

    //Registro
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

            if (diagnostico.length > 500) {
                alert("El diagnóstico no puede tener más de 500 caracteres.");
                return;
            }
    
            if (tratamiento.length > 500) {
                alert("El tratamiento no puede tener más de 500 caracteres.");
                return;
            }
    
            const fechaConsulta = new Date(); 
            const fechaConsultaFormateada = fechaConsulta.toISOString(); 
    
            const consultaResponse = await fetch(`${API_BASE_URL}api/consultaMedica/insertarConsultaMedica`, {
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
    
            const response = await fetch(`${API_BASE_URL}api/paciente/verificarValidacion/${idPacienteTemporal}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
    
            const data = await response.json();
    
            const openConsultationBtn = document.getElementById("open-consultation-modal");
            const validatedButton = document.getElementById("validated-button");
            const updateButton = document.getElementById("update-button");
    
            if (data.mensaje === 'El paciente está validado.') {
                validatedButton.style.display = 'none';

                deshabilitarCamposEdicion();
                updateButton.style.display = 'none';
    
                openConsultationBtn.style.display = 'block';
                openConsultationBtn.removeAttribute("disabled");
                openConsultationBtn.classList.remove("disabled");
            } else if (data.mensaje === 'El paciente no está validado.') {
                validatedButton.removeAttribute("disabled");
                validatedButton.style.display = 'inline-block';

                habilitarCamposEdicion();
                updateButton.removeAttribute("disabled");
                updateButton.style.display = 'inline-block';

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
    
            const response = await fetch(`${API_BASE_URL}api/paciente/validarPaciente/${CURP}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
    
            const data = await response.json();
    
            if (data.mensaje === 'Paciente validado correctamente.') {
                const validatedButton = document.getElementById("validated-button");
                const updateButton = document.getElementById("update-button");
                validatedButton.style.display = 'none';
                updateButton.style.display = 'none';
    
                alert('Paciente validado correctamente.');
    
                await validarPaciente();
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

    //Corregir expediente
    updateButton.addEventListener("click", async () => {
        const alergiasField = document.getElementById("patient-allergies");
        const enfermedadesCronicasField = document.getElementById("patient-chronic-diseases");
        const tratamientoActualField = document.getElementById("patient-current-treatment");
    
        const alergias = alergiasField.textContent.trim();
        const enfermedadesCronicas = enfermedadesCronicasField.textContent.trim();
        const tratamientoActual = tratamientoActualField.textContent.trim();
    
        if (!alergias || !enfermedadesCronicas || !tratamientoActual) {
            alert("Por favor, complete todos los campos antes de actualizar.");
            return;
        }

        if (alergias.length > 500) {
            alert("Las alergías no pueden tener más de 500 caracteres.");
            return;
        }

        if (enfermedadesCronicas.length > 500) {
            alert("Las enfermedades crónicas no pueden tener más de 500 caracteres.");
            return;
        }

        if (tratamientoActual.length > 500) {
            alert("El tratamiento actual no puede tener más de 500 caracteres.");
            return;
        }
    
        const CURP = inputField.value.trim(); 
    
        if (!CURP) {
            alert("No se encontró un CURP válido. Por favor, realiza una búsqueda primero.");
            return;
        }
    
        try {
            const token = localStorage.getItem("token"); 
    
            if (!token) {
                alert("No se encontró un token válido. Por favor, inicia sesión.");
                return;
            }
    
            const response = await fetch(`${API_BASE_URL}api/expedienteMedico/corregirExpedienteMedico/${CURP}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    alergias: alergias,
                    enfermedadesCronicas: enfermedadesCronicas,
                    tratamientoActual: tratamientoActual
                })
            });       
    
            const data = await response.json();
    
            if (response.ok) {
                alert(data.mensaje); 
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error("Error al actualizar el expediente médico:", error);
            alert("Hubo un error al actualizar el expediente médico.");
        }
    });    

    const habilitarCamposEdicion = () => {
        document.getElementById("patient-allergies").contentEditable = true;
        document.getElementById("patient-chronic-diseases").contentEditable = true;
        document.getElementById("patient-current-treatment").contentEditable = true;
    };

    const deshabilitarCamposEdicion = () => {
        document.getElementById("patient-allergies").contentEditable = false;
        document.getElementById("patient-chronic-diseases").contentEditable = false;
        document.getElementById("patient-current-treatment").contentEditable = false;
    };

    //Archivo de consulta
    const verificarArchivoEnConsulta = async (idConsultaMedica) => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                alert("No se encontró un token válido. Por favor, inicia sesión.");
                return;
            }

            const response = await fetch(`${API_BASE_URL}api/consultaMedica/verificarArchivo`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idConsultaMedica })
            });

            const data = await response.json();    
            const descargarRecetaButton = document.querySelector(`.button-top-right[data-id="${idConsultaMedica}"]`);
            const subirRecetaButton = document.querySelector(`.button-bottom-right[data-id="${idConsultaMedica}"]`);

            if (descargarRecetaButton && subirRecetaButton) {
                if (data.archivoAsociado) {
                    descargarRecetaButton.style.display = 'inline-block';
                    subirRecetaButton.style.display = 'none';
                } else {
                    subirRecetaButton.style.display = 'inline-block';
                    descargarRecetaButton.style.display = 'none';
                }
            }
        } catch (error) {
            console.error(`Error al verificar el archivo para idConsultaMedica ${idConsultaMedica}:`, error);
            alert("Hubo un error al verificar el archivo de la consulta.");
        }
    };

    document.getElementById("upload-button").addEventListener("click", function(event) {
        const fileInput = document.getElementById("file-input");
        const file = fileInput.files[0];
    
        if (!file) {
            alert("Por favor, selecciona un archivo PDF.");
            return;
        }
    
        if (file.type !== "application/pdf") {
            alert("Solo se permiten archivos PDF.");
            return;
        }
    
        const formData = new FormData();
        formData.append("archivo", file);
    
        const idConsultaMedica = document.getElementById("upload-file-modal").getAttribute("data-id-consulta");
        formData.append("idConsultaMedica", idConsultaMedica);
    
        const token = localStorage.getItem("token");
    
        if (!token) {
            alert("No se encontró un token válido. Por favor, inicia sesión.");
            return;
        }
    
        fetch(`${API_BASE_URL}api/consultaMedica/insertarArchivoConsulta`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            if (data.mensaje === 'Archivo subido correctamente') {
                alert("Archivo subido exitosamente.");
                fileInput.value = '';
                document.getElementById("upload-file-modal").classList.add("hidden"); 
                verificarArchivoEnConsulta(idConsultaMedica);
            } else {
                alert("Hubo un error al subir el archivo: " + data.detalle);
            }
        })
        .catch(error => {
            alert("Error en la subida del archivo: " + error.message);
        });
    });
    
    const descargarArchivo = (idConsultaMedica) => {
        const token = localStorage.getItem("token");

        if (!token) {
            alert("No se encontró un token válido. Por favor, inicia sesión.");
            return;
        }

        fetch(`${API_BASE_URL}api/consultaMedica/obtenerArchivoConsulta/${idConsultaMedica}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('No se pudo recuperar el archivo');
            }
            return response.blob(); 
        })
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const ventana = window.open(url, '_blank');
            if (!ventana) {
                alert("No se pudo abrir el archivo en una nueva ventana.");
            }
        })
        .catch(error => {
            alert("Error al mostrar el archivo: " + error.message);
        });
    };
});