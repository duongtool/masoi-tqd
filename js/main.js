// ================================================
//   MA SÓI - MAIN INIT | T Q D 💗
// ================================================

document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  goScreen('screen-landing');
  updateLang();
});

// ===== PARTICLES =====

function initParticles() {
  const container = document.getElementById('particles');
  const count = 40;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + 'vw';
    p.style.width = (Math.random() * 2 + 1) + 'px';
    p.style.height = p.style.width;
    p.style.animationDuration = (Math.random() * 12 + 8) + 's';
    p.style.animationDelay = (Math.random() * 10) + 's';
    p.style.opacity = Math.random() * 0.5;
    // Vary color: gold or blue-ish
    if (Math.random() > 0.6) {
      p.style.background = '#93c5fd';
    }
    container.appendChild(p);
  }
}

// ===== KEYBOARD SHORTCUTS =====

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
  if (e.key === ' ' && document.getElementById('screen-game').classList.contains('active')) {
    e.preventDefault();
    toggleTimer();
  }
});

// ===== PREVENT MOBILE ZOOM ON DOUBLE TAP =====
let lastTap = 0;
document.addEventListener('touchend', (e) => {
  const now = Date.now();
  if (now - lastTap < 300) e.preventDefault();
  lastTap = now;
}, { passive: false });
