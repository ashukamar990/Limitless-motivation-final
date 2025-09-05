// script.js

// Show given page and hide others
function showPage(pageId) {
  // saare pages hide karo
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  // target page ko dikhao
  const target = document.getElementById(pageId);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// Footer links (with inline onclick fallback)
document.querySelectorAll('footer a').forEach(link => {
  link.addEventListener('click', e => {
    const onclickAttr = link.getAttribute('onclick');
    if (onclickAttr) {
      e.preventDefault();
      const match = onclickAttr.match(/showPage\('(.+)'\)/);
      if (match) showPage(match[1]);
    }
  });
});

// Back buttons
document.querySelectorAll('.back-button, .back-to-products, #backToProducts, #goHome')
  .forEach(btn => {
    btn.addEventListener('click', () => showPage('productsPage'));
  });
