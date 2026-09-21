// Pantalla de bloqueo estilo Windows 10, previa a la pantalla de contraseña.
// Flujo: BLOQUEO -> (arrastrar hacia arriba / clic / Enter) -> CONTRASEÑA -> DESKTOP.
//
// Se monta ENCIMA del overlay de login (que ya está creado por debajo), así
// que al deslizar el bloqueo hacia arriba va revelando la pantalla de
// contraseña, igual que en Windows.

export function createLockScreen({
  backgroundSrc = null,
  message = '',
  locale = 'es-ES',
  onUnlock = null,
} = {}) {
  // Tipografías (con fallback si no hay internet)
  if (!document.getElementById('lock-fonts')) {
    const link = document.createElement('link');
    link.id = 'lock-fonts';
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@800&family=Poppins:wght@600;700&display=swap';
    document.head.appendChild(link);
  }

  const overlay = document.createElement('div');
  overlay.className = 'lock-overlay';
  if (backgroundSrc) overlay.style.setProperty('--lock-bg', `url(${backgroundSrc})`);

  overlay.innerHTML = `
    <div class="lock-message"></div>
    <div class="lock-clock">
      <div class="lock-time"></div>
      <div class="lock-date"></div>
    </div>
    <div class="lock-hint">Desliza hacia arriba para continuar</div>
  `;
  overlay.querySelector('.lock-message').textContent = message;
  document.body.appendChild(overlay);

  const timeEl = overlay.querySelector('.lock-time');
  const dateEl = overlay.querySelector('.lock-date');

  // --- Reloj y fecha reales ------------------------------------------------
  function updateClock() {
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    dateEl.textContent = now.toLocaleDateString(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  }
  updateClock();
  const clockId = setInterval(updateClock, 1000);

  // --- Arrastre hacia arriba -----------------------------------------------
  const THRESHOLD = 0.22; // fracción de la altura para soltar y abrir
  let dragging = false;
  let startY = 0;
  let offset = 0;
  let unlocking = false;
  let moved = false;

  function setOffset(px) {
    offset = Math.min(0, px);
    overlay.style.transform = `translateY(${offset}px)`;
  }

  function unlock() {
    if (unlocking) return;
    unlocking = true;
    overlay.classList.remove('dragging');
    overlay.classList.add('unlocking');
    document.body.classList.add('lock-opening');
    overlay.style.transform = 'translateY(-100%)';
    setTimeout(() => {
      document.body.classList.remove('lock-opening');
      clearInterval(clockId);
      overlay.remove();
      window.removeEventListener('keydown', onKey);
      if (typeof onUnlock === 'function') onUnlock();
    }, 1300);
  }

  function snapBack() {
    overlay.classList.remove('dragging');
    overlay.style.transform = 'translateY(0)';
  }

  overlay.addEventListener('pointerdown', (e) => {
    if (unlocking) return;
    dragging = true;
    moved = false;
    startY = e.clientY;
    overlay.setPointerCapture(e.pointerId);
    overlay.classList.add('dragging');
  });

  overlay.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dy = e.clientY - startY;
    if (Math.abs(dy) > 4) moved = true;
    setOffset(dy);
  });

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    const shouldOpen = -offset > window.innerHeight * THRESHOLD;
    // Un clic simple (sin arrastrar) también abre, como en Windows.
    if (shouldOpen || !moved) unlock();
    else snapBack();
  }
  overlay.addEventListener('pointerup', endDrag);
  overlay.addEventListener('pointercancel', () => {
    dragging = false;
    snapBack();
  });

  // Rueda del mouse hacia arriba / teclas
  overlay.addEventListener('wheel', (e) => {
    if (e.deltaY > 20) unlock();
  }, { passive: true });

  function onKey(e) {
    if (['Enter', ' ', 'ArrowUp'].includes(e.key)) {
      e.preventDefault();
      unlock();
    }
  }
  window.addEventListener('keydown', onKey);

  return overlay;
}