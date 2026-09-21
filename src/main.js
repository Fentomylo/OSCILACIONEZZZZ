import './styles.css';
import FONDO from './FONDO.jpg';
import FONDOBLOCKEO from './FONDOBLOCKEO.jpg';
import brunoImg from './bruno.jpg';

import { createLabPanel } from './ui/labPanel.js';
import { createLoginScreen } from './ui/loginScreen.js';
import { createLockScreen } from './ui/lockScreen.js';

// ============================================================
// Escritorio Frutiger Aero — solo interfaz visual.
//
// Flujo:
//   BLOQUEO (arrastrar hacia arriba) -> CONTRASEÑA -> DESKTOP
//
// Todo se arma en capas: el escritorio abajo, el login encima y la
// pantalla de bloqueo hasta arriba. Deslizar el bloqueo revela el login,
// y acertar la contraseña revela el escritorio.
// ============================================================

async function main() {
  document.body.style.setProperty('--wallpaper', `url(${FONDO})`);

  // Fondo de la pantalla de contraseña (inicio de sesión)
  document.body.style.setProperty('--login-bg', `url(${FONDOBLOCKEO})`);

  createLabPanel();

  createLoginScreen({
    avatarSrc: brunoImg,
    username: 'peanuts animation club',
    correctPassword: 'miedo',
  });

  createLockScreen({
    backgroundSrc: FONDOBLOCKEO,
    message: '¿Qué hace que una experiencia se sienta diferente a simplemente ver una animación?',
  });
}

main().catch(console.error);