document.addEventListener("DOMContentLoaded", () => {
    const emergencyModal = document.getElementById("emergency-modal");
    const consultationModal = document.getElementById("consultation-modal");

    const openEmergencyBtn = document.getElementById("open-emergency-modal");
    const openConsultationBtn = document.getElementById("open-consultation-modal");

    const cancelEmergencyBtn = document.getElementById("cancel-emergency");
    const cancelConsultationBtn = document.getElementById("cancel-consultation");

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
    
    window.addEventListener("click", (event) => {
        if (event.target === emergencyModal) {
            closeModal(emergencyModal);
        }
        if (event.target === consultationModal) {
            closeModal(consultationModal);
        }
    });
});

