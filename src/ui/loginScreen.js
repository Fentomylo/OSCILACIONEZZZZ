// Pantalla de contraseña estilo Windows Vista, previa al escritorio.
// Flujo: PANTALLA_CONTRASEÑA -> (contraseña correcta) -> transición -> DESKTOP.
//
// El escritorio (createLabPanel) ya se construyó por debajo de este overlay
// cuando esta función se llama, así que "revelar" el escritorio es
// simplemente animar este overlay hasta ocultarlo por completo y quitarlo
// del DOM.

export function createLoginScreen({
  avatarSrc,
  username = 'Usuario',
  correctPassword = '',
  onSuccess = null,
} = {}) {
  const overlay = document.createElement('div');
  overlay.className = 'login-overlay';

  overlay.innerHTML = `
    <div class="login-card">
      <div class="login-avatar"><img src="${avatarSrc}" alt="${username}" /></div>
      <div class="login-username">${username}</div>
      <div class="login-field-row">
        <input type="password" class="login-password" placeholder="Contraseña" />
        <button type="button" class="login-submit" title="Iniciar sesión" aria-label="Iniciar sesión">➜</button>
      </div>
      <div class="login-error">La contraseña es incorrecta. Inténtalo de nuevo.</div>
    </div>
    <div class="login-welcome">Bienvenido</div>
    <button type="button" class="login-switch-user">Cambiar de usuario</button>
  `;

  document.body.appendChild(overlay);

  const passwordInput = overlay.querySelector('.login-password');
  const submitBtn = overlay.querySelector('.login-submit');
  const errorEl = overlay.querySelector('.login-error');
  const card = overlay.querySelector('.login-card');
  const welcomeEl = overlay.querySelector('.login-welcome');

  let locked = false;

  function shakeError() {
    errorEl.classList.add('visible');
    card.classList.remove('shake');
    void card.offsetWidth; // reinicia la animación
    card.classList.add('shake');
    passwordInput.value = '';
    passwordInput.focus();
  }

  function attemptLogin() {
    if (locked) return;
    if (passwordInput.value === correctPassword) {
      locked = true;
      submitBtn.disabled = true;
      passwordInput.disabled = true;
      errorEl.classList.remove('visible');
      card.classList.add('success');
      welcomeEl.classList.add('visible');

      // Pequeña pausa tipo "Bienvenido" antes de abrir el escritorio,
      // luego la transición de iris que revela el escritorio de abajo.
      setTimeout(() => {
        overlay.classList.add('revealing');
        setTimeout(() => {
          overlay.remove();
          if (typeof onSuccess === 'function') onSuccess();
        }, 950);
      }, 850);
    } else {
      shakeError();
    }
  }

  submitBtn.addEventListener('click', attemptLogin);
  passwordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') attemptLogin();
  });

  requestAnimationFrame(() => passwordInput.focus());

  return overlay;
}
