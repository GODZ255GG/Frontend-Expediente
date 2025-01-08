
function protegerRutaPaciente() {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "medico") {
        alert("Acceso denegado. No cuentas con los permisos necesarios.");
        window.location.href = "login.html";
    }
}
protegerRutaPaciente();