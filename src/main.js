import './styles.css';
import FONDO from './FONDO.jpg';
import brunoImg from './bruno.jpg';

import { createLabPanel } from './ui/labPanel.js';
import { createLoginScreen } from './ui/loginScreen.js';

// ============================================================
// Escritorio Frutiger Aero — solo interfaz visual.
//
// Los agentes (Kuramoto/three.js), el motor de sonido (Tone.js) y todo
// el "funcionamiento" que conectaba cada ventana con un agente (arrastrar
// agentes adentro, desacoplarlos, forzar su sincronía, etc.) se quitaron
// por completo. Lo único que queda es el escritorio: fondo, iconos,
// ventanas arrastrables/redimensionables/minimizables y la barra de
// tareas, todo puramente visual.
//
// Antes de llegar al escritorio se muestra una pantalla de contraseña
// (estilo Windows Vista). El escritorio ya se arma por debajo del
// overlay de login; al acertar la contraseña, el overlay se cierra con
// una transición y queda revelado el escritorio.
//   PANTALLA_CONTRASEÑA -> (contraseña correcta) -> DESKTOP
// ============================================================

async function main() {
  // Fondo de escritorio: se inyecta como variable CSS para que el bundler
  // resuelva la ruta final del asset (hash incluido) y para poder mantener
  // el resto de capas atmosféricas (scanlines, viñeta) definidas en el CSS.
  document.body.style.setProperty('--wallpaper', `url(${FONDO})`);

  createLabPanel();

  createLoginScreen({
    avatarSrc: brunoImg,
    username: 'peanuts animation club',
    correctPassword: 'miedo',
  });
}

main().catch(console.error);