/**
 * @param {Event} event 
 * @param {string} sectionId 
 */
function scrollToSection(event, sectionId) {
  event.preventDefault(); 
  const section = document.getElementById(sectionId);

  if (section) {
      section.style.display = 'block';
      section.scrollIntoView({ behavior: 'smooth' });
  }
}
