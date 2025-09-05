// script.js (final navigation fix)

// Make showPage globally accessible for inline onclick
window.showPage = function(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(pageId);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// Ensure back buttons also work
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('#backBtn, .back-button, .back-to-products, #goHome')
    .forEach(btn => btn.addEventListener('click', () => window.showPage('productsPage')));
});
