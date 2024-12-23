/**
 * @param {Event} event - Evento del enlace o botón
 * @param {string} sectionId - ID de la sección destino
 */
function scrollToSection(event, sectionId) {
  event.preventDefault(); 
  const section = document.getElementById(sectionId);

  if (section) {
      section.style.display = 'block';
      section.scrollIntoView({ behavior: 'smooth' });
  }
}
