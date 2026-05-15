// Aktif nav linkini işaretle
document.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelectorAll('nav a');
  const path = window.location.pathname;
  links.forEach(link => {
    if (link.getAttribute('href') && path.includes(link.getAttribute('href').replace('../', '').replace('./', ''))) {
      link.classList.add('active');
    }
  });
});
