const API_BASE_URL = "https://21d64cmx-3000.usw3.devtunnels.ms/";

function protegerRutaPaciente() {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "medico") {
        alert("Acceso denegado. No cuentas con los permisos necesarios.");
        window.location.href = "login.html";
    }
}

protegerRutaPaciente();

async function buscarConsultaEmergencia() {
    const inputField = document.getElementById("search-input");
    const CURP = inputField.value.trim();

    if (!CURP) {
        alert("Por favor, ingresa una CURP para buscar.");
        return;
    }

    try {
        const token = localStorage.getItem("token");

        if (!token) {
            alert("No se encontró un token válido. Por favor, inicia sesión nuevamente.");
            return;
        }

        const response = await fetch(`${API_BASE_URL}api/consultaEmergencia/obtenerConsultaEmergencia/${CURP}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                alert("No se encontraron consultas de emergencia para la CURP proporcionada.");
            } else if (response.status === 400) {
                alert("La CURP es un parámetro requerido.");
            } else {
                alert("Error al obtener la consulta de emergencia.");
            }
            return;
        }

        const data = await response.json();
        mostrarConsultaEmergencia(data.consultaEmergencia);
    } catch (error) {
        alert("Ocurrió un error inesperado. Por favor, intenta de nuevo más tarde.");
    }
}

function mostrarConsultaEmergencia(consultaEmergencia) {
    if (!consultaEmergencia) {
        alert("No se encontraron datos para mostrar.");
        return;
    }

    const container = document.getElementById("emergency-entries-container");
    container.innerHTML = '';
    const pacienteNombre = "Nombre de paciente:" + consultaEmergencia.nombre || "Nombre no disponible";
    const patientNameElement = document.getElementById("patient-name");
    patientNameElement.textContent = pacienteNombre;

    const fechaFormateada = formatearFecha(consultaEmergencia.fechaEmergencia);

    const emergencyEntry = document.createElement("div");
    emergencyEntry.classList.add("emergency-entry");

    emergencyEntry.innerHTML = `
        <p><strong>Fecha de emergencia:</strong> <span>${fechaFormateada || "No disponible"}</span></p>
        <p><strong>Diagnóstico de emergencia:</strong> <span>${consultaEmergencia.diagnosticoEmergencia || "No disponible"}</span></p>
        <p><strong>Tratamiento de emergencia:</strong> <span>${consultaEmergencia.tratamientoEmergencia || "No disponible"}</span></p>
        <p><strong>Alergias:</strong> <span>${consultaEmergencia.alergias || "No disponible"}</span></p>
        <p><strong>Enfermedades crónicas:</strong> <span>${consultaEmergencia.enfermedadesCronicas || "No disponible"}</span></p>
        <p><strong>Tratamiento actual:</strong> <span>${consultaEmergencia.tratamientoActual || "No disponible"}</span></p>
    `;

    container.appendChild(emergencyEntry);
}

function formatearFecha(fechaISO) {
    if (!fechaISO) return "Fecha no disponible";

    const opcionesFormato = { year: 'numeric', month: 'long', day: 'numeric' };
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-MX', opcionesFormato);
}

document.addEventListener("DOMContentLoaded", () => {
    const searchButton = document.querySelector(".search-button");
    searchButton.addEventListener("click", buscarConsultaEmergencia);
});