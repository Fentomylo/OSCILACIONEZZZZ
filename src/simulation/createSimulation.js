// La simulación de agentes (personalidades Kuramoto, mallas three.js,
// deambular por el escritorio, arrastre, acople por ventana, etc.) se
// quitó por completo. Este archivo ya no importa ese sistema desde
// main.js.
//
// En su lugar, este archivo ahora aloja al ARAÑAVIRUS: un bichito de
// escritorio estilo BonziBuddy (deambula, tira diálogos, ofrece "ayuda"
// y cuando aceptás hace cosas que no tienen nada que ver). Se activa
// desde ui/labPanel.js cuando se abre Paint.

export function createSimulation() {
  return null;
}

// ARAÑAVIRUS — asistente de escritorio estilo BonziBuddy, pero con forma
// de araña y comportamiento de "virus" gracioso: aparece solo, deambula
// lento por la pantalla, te ofrece "ayuda" y cuando aceptás, hace cosas
// que no tienen nada que ver con lo que pediste (o directamente boludeces).
//
// Se activa la primera vez que se abre la ventana de Paint (ver labPanel.js).
// No tiene botón de cerrar a propósito: es un "virus", se queda dando
// vueltas para siempre una vez que se instaló.

import aranavirusImg from '../ARAÑAVIRUS.png';

let active = false;
let rootEl = null;
let spiderImg = null;
let bubbleEl = null;

let pos = { x: 0, y: 0 };
let wanderTimeoutId = null;
let idleTalkTimeoutId = null;
let reofferTimeoutId = null;
let bubbleHideTimeoutId = null;

// --- Diálogos --------------------------------------------------------

// La primera frase es fija, tal cual la pide el guion. El resto de
// "reofertas" son inventadas, en el mismo tono molesto/entrañable de
// BonziBuddy.
const FIRST_GREETING = '¿Puedo ayudarte con algo?';

const REOFFER_LINES = [
  '¿Seguro que no querés mi ayuda? Insisto.',
  'Sigo acá. ¿Te ayudo con algo?',
  'Noté que no me hiciste caso antes. Otra oportunidad: ¿te ayudo?',
  'Como buen virus, no me voy a ir. ¿Aceptás mi ayuda esta vez?',
];

const IDLE_LINES = [
  'Ocho patas, cero utilidad.',
  'Estoy tejiendo algo en una esquina de tu escritorio. No mires.',
  'Dato random: no sé pintar, pero igual voy a opinar.',
  '01100001 01110010 01100001 11 (esto no significa nada, tranquilo)',
  'Sigo instalado. Para siempre. Es joda. O no.',
  'Si me cerrás la ventana de Paint no me voy, ya avisé.',
];

const DECLINE_LINES = [
  'Como quieras. Igual te voy a seguir preguntando.',
  'Está bien, está bien... por ahora.',
  'Ok. Vuelvo en un rato con la misma pregunta.',
];

// Menú de "ayudas" que ofrece — cada una dispara algo que no tiene nada
// que ver, al mejor estilo BonziBuddy.
const HELP_OPTIONS = [
  { label: 'Ayudame a dibujar', action: reactionDrawHelp },
  { label: 'Optimizá mi computadora', action: reactionOptimize },
  { label: 'Contame un secreto', action: reactionSecret },
  { label: 'Buscá algo en internet', action: reactionSearch },
];

// --- Utilidades --------------------------------------------------------

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function clearAllTimers() {
  clearTimeout(wanderTimeoutId);
  clearTimeout(idleTalkTimeoutId);
  clearTimeout(reofferTimeoutId);
  clearTimeout(bubbleHideTimeoutId);
}

// --- Deambular lentamente ------------------------------------------------

function scheduleWander() {
  wanderTimeoutId = setTimeout(() => {
    wanderTo(
      rand(20, window.innerWidth - 120),
      rand(20, window.innerHeight - 160)
    );
    scheduleWander();
  }, rand(4500, 8000));
}

function wanderTo(x, y) {
  if (!rootEl) return;
  const facingLeft = x < pos.x;
  pos = { x, y };
  const duration = rand(6, 10).toFixed(2);
  rootEl.style.transition = `left ${duration}s linear, top ${duration}s linear`;
  rootEl.style.left = `${x}px`;
  rootEl.style.top = `${y}px`;
  if (spiderImg) {
    // La animación de "respiración" (aranavirus-bob) ya controla
    // `transform` vía keyframes, así que el volteo horizontal se pasa
    // como variable CSS para no pisar esa animación.
    spiderImg.style.setProperty('--aranavirus-face', facingLeft ? '-1' : '1');
  }
}

// --- Globo de texto ------------------------------------------------------

function positionBubble() {
  if (!rootEl || !bubbleEl) return;
  const rect = rootEl.getBoundingClientRect();
  bubbleEl.style.left = `${rect.left + rect.width / 2}px`;
  bubbleEl.style.top = `${rect.top - 10}px`;
}

let bubbleSyncRaf = null;
function startBubbleSync() {
  const loop = () => {
    positionBubble();
    bubbleSyncRaf = requestAnimationFrame(loop);
  };
  bubbleSyncRaf = requestAnimationFrame(loop);
}
function stopBubbleSync() {
  if (bubbleSyncRaf) cancelAnimationFrame(bubbleSyncRaf);
  bubbleSyncRaf = null;
}

function hideBubble() {
  clearTimeout(bubbleHideTimeoutId);
  if (!bubbleEl) return;
  bubbleEl.classList.remove('visible');
  stopBubbleSync();
}

function showBubble({ text, buttons = null, autoHideMs = null }) {
  clearTimeout(bubbleHideTimeoutId);
  if (!bubbleEl) return;
  bubbleEl.innerHTML = '';

  const textEl = document.createElement('div');
  textEl.className = 'aranavirus-bubble-text';
  textEl.textContent = text;
  bubbleEl.append(textEl);

  if (buttons && buttons.length) {
    const optionsWrap = document.createElement('div');
    optionsWrap.className = 'aranavirus-options';
    buttons.forEach((btnDef) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'aranavirus-option';
      btn.textContent = btnDef.label;
      btn.addEventListener('click', () => btnDef.onClick());
      optionsWrap.append(btn);
    });
    bubbleEl.append(optionsWrap);
  }

  bubbleEl.classList.add('visible');
  positionBubble();
  startBubbleSync();

  if (autoHideMs) {
    bubbleHideTimeoutId = setTimeout(hideBubble, autoHideMs);
  }
}

// --- Charla de fondo (sin pedir nada) ------------------------------------

function scheduleIdleTalk() {
  idleTalkTimeoutId = setTimeout(() => {
    if (!bubbleEl.classList.contains('visible')) {
      showBubble({ text: pick(IDLE_LINES), autoHideMs: 4200 });
    }
    scheduleIdleTalk();
  }, rand(11000, 19000));
}

function scheduleReoffer() {
  reofferTimeoutId = setTimeout(() => {
    offerHelp(pick(REOFFER_LINES));
    scheduleReoffer();
  }, rand(28000, 42000));
}

// --- Flujo de "ayuda" -----------------------------------------------------

function offerHelp(line) {
  showBubble({
    text: line,
    buttons: [
      { label: 'Sí, ayudame', onClick: openHelpMenu },
      { label: 'No, gracias', onClick: declineHelp },
    ],
  });
}

function declineHelp() {
  showBubble({ text: pick(DECLINE_LINES), autoHideMs: 3200 });
}

function openHelpMenu() {
  showBubble({
    text: '¿Con qué te ayudo?',
    buttons: HELP_OPTIONS.map((opt) => ({
      label: opt.label,
      onClick: () => opt.action(),
    })),
  });
}

// --- Reacciones absurdas (lo que pediste, pero no) ------------------------

function reactionOptimize() {
  showBubble({ text: 'Optimizando sistema... no toques nada.' });

  const progressWrap = document.createElement('div');
  progressWrap.className = 'aranavirus-progress';
  const progressFill = document.createElement('div');
  progressFill.className = 'aranavirus-progress-fill';
  progressWrap.append(progressFill);
  bubbleEl.append(progressWrap);

  requestAnimationFrame(() => {
    progressFill.style.width = '100%';
  });

  // Mientras "optimiza", tira arañas fantasma que se desvanecen: la
  // optimización, claramente, consistió en multiplicarse.
  spawnGhostSpiders(4);
  spiderImg.classList.add('aranavirus-spin');

  setTimeout(() => {
    spiderImg.classList.remove('aranavirus-spin');
    showBubble({
      text: 'Listo. Tu computadora ahora tiene 40% más arañas.',
      autoHideMs: 3600,
    });
  }, 2600);
}

function reactionSecret() {
  showBubble({ text: 'Acercate... te voy a contar un secreto.', autoHideMs: 1800 });

  setTimeout(() => {
    flashScreen();
    showBubble({
      text: pick([
        'El secreto es que no tengo ningún secreto.',
        'Shhh. Tu fondo de pantalla también me da miedo a mí.',
        'En realidad quería que parpadee la pantalla. Listo, ya está.',
      ]),
      autoHideMs: 3800,
    });
  }, 1900);
}

function reactionSearch() {
  showBubble({ text: 'Buscando en internet...', autoHideMs: 1600 });
  setTimeout(() => {
    showBubble({
      text: pick([
        'Resultado: no encontré nada, pero encontré más arañas.',
        'Según internet, deberías pintar más telarañas y menos paisajes.',
        '0 resultados relevantes. 8,000 resultados de arañas.',
      ]),
      autoHideMs: 3800,
    });
  }, 1700);
}

function reactionDrawHelp() {
  const canvas = document.querySelector('.paint-canvas');
  if (!canvas) {
    showBubble({
      text: 'Quería dibujarte algo pero no encuentro el lienzo. Típico.',
      autoHideMs: 3400,
    });
    return;
  }

  showBubble({ text: 'Dejame a mí, esto va a quedar hermoso.' });
  spiderImg.classList.add('aranavirus-dance');

  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  let x = rand(0, w);
  let y = rand(0, h);
  ctx.save();
  ctx.lineWidth = 2;
  ctx.strokeStyle = pick(['#000000', '#7a2fb0', '#0a7a3c', '#b02020']);
  ctx.beginPath();
  ctx.moveTo(x, y);

  let strokes = 0;
  const drawStep = () => {
    x = Math.min(w, Math.max(0, x + rand(-60, 60)));
    y = Math.min(h, Math.max(0, y + rand(-60, 60)));
    ctx.lineTo(x, y);
    ctx.stroke();
    strokes += 1;
    if (strokes < 26) {
      setTimeout(drawStep, 60);
    } else {
      ctx.restore();
      spiderImg.classList.remove('aranavirus-dance');
      showBubble({
        text: pick([
          'Ya terminé tu obra maestra. De nada.',
          'Es una telaraña. Todo lo que dibujo es una telaraña.',
          'Arte abstracto. No se toca.',
        ]),
        autoHideMs: 3600,
      });
    }
  };
  drawStep();
}

// --- Efectos visuales auxiliares ------------------------------------------

function flashScreen() {
  const flash = document.createElement('div');
  flash.className = 'aranavirus-flash';
  document.body.append(flash);
  requestAnimationFrame(() => flash.classList.add('go'));
  setTimeout(() => flash.remove(), 700);
}

function spawnGhostSpiders(count) {
  if (!rootEl) return;
  const rect = rootEl.getBoundingClientRect();
  for (let i = 0; i < count; i += 1) {
    const ghost = document.createElement('img');
    ghost.src = aranavirusImg;
    ghost.className = 'aranavirus-ghost';
    ghost.style.left = `${rect.left + rand(-40, 40)}px`;
    ghost.style.top = `${rect.top + rand(-40, 40)}px`;
    document.body.append(ghost);
    setTimeout(() => ghost.remove(), 1300);
  }
}

// --- Activación pública ----------------------------------------------------

export function activateAranavirus() {
  if (active) return; // ya está instalado, no se duplica
  active = true;

  rootEl = document.createElement('div');
  rootEl.className = 'aranavirus';

  spiderImg = document.createElement('img');
  spiderImg.className = 'aranavirus-img';
  spiderImg.src = aranavirusImg;
  spiderImg.alt = 'ARAÑAVIRUS';
  rootEl.append(spiderImg);

  bubbleEl = document.createElement('div');
  bubbleEl.className = 'aranavirus-bubble';
  document.body.append(bubbleEl);

  pos = {
    x: rand(40, window.innerWidth - 160),
    y: rand(60, window.innerHeight - 220),
  };
  rootEl.style.left = `${pos.x}px`;
  rootEl.style.top = `${pos.y}px`;

  document.body.append(rootEl);

  scheduleWander();
  scheduleIdleTalk();
  scheduleReoffer();

  setTimeout(() => offerHelp(FIRST_GREETING), 1800);
}