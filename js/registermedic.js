document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("registration-form");

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const requiredFields = document.querySelectorAll("[required]");
        let isValid = true;

        requiredFields.forEach((field) => {
            if (!field.value.trim()) {
                field.style.borderColor = "red";
                isValid = false;
            } else {
                field.style.borderColor = "#ccc";
            }
        });

        if (isValid) {
            alert("Formulario enviado correctamente.");
            form.reset();
        } else {
            alert("Por favor, complete los campos requeridos.");
        }
    });

    form.addEventListener("reset", () => {
        const requiredFields = document.querySelectorAll("[required]");
        requiredFields.forEach((field) => (field.style.borderColor = "#ccc"));
    });
});
