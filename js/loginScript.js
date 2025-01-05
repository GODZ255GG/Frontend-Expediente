const API_BASE_URL = "http://localhost:3000";

function showForm(role) {
    document.getElementById('form-paciente').style.display = 'none';
    document.getElementById('form-medico').style.display = 'none';
    document.getElementById('form-admin').style.display = 'none';

    document.getElementById('tab-paciente').classList.remove('active');
    document.getElementById('tab-medico').classList.remove('active');
    document.getElementById('tab-admin').classList.remove('active');

    if (role === 'paciente') {
        document.getElementById('form-paciente').style.display = 'block';
        document.getElementById('tab-paciente').classList.add('active');
    } else if (role === 'medico') {
        document.getElementById('form-medico').style.display = 'block';
        document.getElementById('tab-medico').classList.add('active');
    } else if (role === 'administrador') {
        document.getElementById('form-admin').style.display = 'block';
        document.getElementById('tab-admin').classList.add('active');
    }
}

function redirectToPage(role) {
    if (role === 'admin') {
        window.location.href = "indexadmin.html";
    } else if (role === 'medico') {
        window.location.href = "indexdoctor.html";
    } else if (role === 'paciente') {
        window.location.href = "indexpacient.html";
    }
}

async function iniciarSesion(email, password, role) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/iniciarSesion/iniciarSesion`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, role }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Error al iniciar sesión");
        }

        const data = await response.json();
        console.log("Sesión iniciada:", data);

        localStorage.setItem("token", data.token);
        localStorage.setItem("idPersonalMedico", data.additionalData.idPersonalMedico);

        redirectToPage(role);
    } catch (err) {
        console.error("Error al iniciar sesión:", err.message);
        alert("Error: " + err.message);
    }
}

document.querySelectorAll(".form").forEach(form => {
    const inputs = form.querySelectorAll("input");
    inputs.forEach(input => {
        input.addEventListener("input", () => {
            input.value = input.value.slice(0, 20); 
        });
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const role = form.id.split("-")[1];
        const emailField = form.querySelector("input[type='text'], input[type='email']");
        const passwordField = form.querySelector("input[type='password']");

        const email = emailField.value.trim();
        const password = passwordField.value.trim();

        if (!email || !password) {
            alert("Por favor, completa todos los campos solicitados para iniciar sesión.");
            return;
        }
        await iniciarSesion(email, password, role);
    });
});
