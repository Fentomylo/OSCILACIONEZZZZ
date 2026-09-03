// ============================================================
// Sliders del panel de control (sin cambios respecto a tu versión)
// ============================================================
function rangeRow(parent, label, valueRef, setter, min, max, step) {
  const wrap = document.createElement('div');
  wrap.className = 'row';

  const lab = document.createElement('label');
  const name = document.createElement('span');
  const value = document.createElement('span');
  value.className = 'value';
  name.textContent = label;

  const input = document.createElement('input');
  input.type = 'range';
  input.min = String(min);
  input.max = String(max);
  input.step = String(step);
  input.value = String(valueRef());

  const sync = () => {
    const next = Number(input.value);
    setter(next);
    value.textContent = Number(next).toFixed(step < 0.1 ? 2 : 1);
  };

  input.addEventListener('input', sync);
  sync();
  lab.append(name, value);
  wrap.append(lab, input);
  parent.append(wrap);

  return {
    refresh() {
      const next = Number(valueRef());
      input.value = String(next);
      value.textContent = Number(next).toFixed(step < 0.1 ? 2 : 1);
    }
  };
}

function button(parent, label, onClick) {
  const b = document.createElement('button');
  b.textContent = label;
  b.addEventListener('click', onClick);
  parent.append(b);
  return b;
}

function buildSliders(container, { params, onReset, onPreset, onPauseChange }) {
  const refreshers = [];
  container.innerHTML = '<p>8 espíritus de escritorio · sincronía emergente.</p>';

  const sim = document.createElement('div');
  sim.className = 'group';
  sim.innerHTML = '<h2>Kuramoto</h2>';
  container.append(sim);

  refreshers.push(rangeRow(sim, 'acoplamiento (K)', () => params.couplingStrength, (v) => { params.couplingStrength = v; }, 0, 4, 0.05));
  refreshers.push(rangeRow(sim, 'ruido', () => params.noise, (v) => { params.noise = v; }, 0, 1, 0.02));
  refreshers.push(rangeRow(sim, 'deriva', () => params.phaseDrift, (v) => { params.phaseDrift = v; }, 0, 1.5, 0.05));
  refreshers.push(rangeRow(sim, 'velocidad', () => params.dt, (v) => { params.dt = v; }, 0.01, 0.08, 0.005));
  refreshers.push(rangeRow(sim, 'sincronía (r)', () => params.order, () => {}, 0, 1, 0.01));

  const music = document.createElement('div');
  music.className = 'group';
  music.innerHTML = '<h2>música</h2>';
  container.append(music);
  refreshers.push(rangeRow(music, 'tempo (BPM)', () => params.musicBpm, (v) => { params.musicBpm = v; }, 60, 190, 1));

  const presets = document.createElement('div');
  presets.className = 'group';
  presets.innerHTML = '<h2>ritmo global</h2>';
  container.append(presets);
  button(presets, '💫 Calma', () => onPreset('calm'));
  button(presets, '⚡ Caos', () => onPreset('chaos'));
  button(presets, '🔗 Unión', () => onPreset('sync'));

  const cast = document.createElement('div');
  cast.className = 'group';
  cast.innerHTML = `<h2>elenco</h2><div class="cast-list" style="font-size:10px;line-height:1.7;">
    1. Static-Tan | w=1.8<br>2. Core-Tan | w=0.6<br>3. Mirror-Tan | w=1.1<br>4. Signal-Tan | w=1.5<br>
    5. Petal | w=1.3<br>6. Disko | w=1.0<br>7. Pixel-Boy | w=1.2<br>8. Moth | w=1.4
  </div>`;
  container.append(cast);

  const actions = document.createElement('div');
  actions.className = 'group';
  actions.innerHTML = '<h2>control</h2>';
  container.append(actions);
  button(actions, '🔄 Reset', onReset);
  button(actions, '⏸ Pausar', onPauseChange);

  return refreshers;
}

// ============================================================
// Ventanas de escritorio + iconos + barra de tareas
// ============================================================
const WINDOW_DEFS = {
  google: {
    title: 'Google', icon: '🌐',
    body: `
      <div class="browser-toolbar">
        <span class="browser-btn">◀</span><span class="browser-btn">▶</span><span class="browser-btn">⟳</span>
        <div class="browser-address">https://www.google.com</div>
      </div>
      <div class="google-body">
        <div class="google-logo">Google</div>
        <div class="google-search"><span>🔍</span><span class="ph">buscar algo que no importa…</span></div>
        <div class="google-actions"><span>Buscar con Google</span><span>Voy a tener suerte</span></div>
      </div>`
  },
  files: {
    title: 'Mis Archivos', icon: '🗂️',
    body: `
      <div class="files-toolbar"><span>⬅</span><span>📁 Mis Archivos</span></div>
      <div class="files-grid">
        <div class="file-item"><span class="glyph">📁</span>fotos</div>
        <div class="file-item"><span class="glyph">📁</span>proyectos</div>
        <div class="file-item"><span class="glyph">📄</span>tarea_final.docx</div>
      </div>
      <div class="files-status">3 elementos</div>`
  },
  player: {
    title: 'Reproductor', icon: '🎵',
    body: `
      <div class="player-art">🎧</div>
      <div class="player-track">pista 03 — sin título</div>
      <div class="player-progress"><div class="player-progress-fill"></div></div>
      <div class="player-controls"><span>⏮</span><span class="play">▶</span><span>⏭</span></div>`
  },
  trash: {
    title: 'Papelera', icon: '🗑️',
    body: `<div class="trash-body"><span class="trash-glyph">🗑️</span><p style="opacity:.6">está vacía… por ahora</p></div>`
  }
};

// z-index de las ventanas normales: siempre por DEBAJO del canvas de los
// agentes (ver .sim-canvas en styles.css) para que las "chicas" pasen por
// encima del escritorio. El panel de laboratorio es la única excepción y
// se queda fijo por ENCIMA del canvas.
const WINDOW_Z_MIN = 5;
const WINDOW_Z_MAX = 14;
const LAB_Z = 500;
let zTop = WINDOW_Z_MIN;

function bringToFront(el) {
  if (el.classList.contains('is-lab')) {
    el.style.zIndex = String(LAB_Z);
    return;
  }
  zTop = zTop >= WINDOW_Z_MAX ? WINDOW_Z_MIN : zTop + 1;
  el.style.zIndex = String(zTop);
}

function makeDraggable(el, handle) {
  let dragging = false;
  let offsetX = 0, offsetY = 0;

  handle.addEventListener('pointerdown', (e) => {
    dragging = true;
    bringToFront(el);
    offsetX = e.clientX - el.offsetLeft;
    offsetY = e.clientY - el.offsetTop;
  });
  window.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    el.style.left = `${e.clientX - offsetX}px`;
    el.style.top = `${e.clientY - offsetY}px`;
  });
  window.addEventListener('pointerup', () => { dragging = false; });
}

// Crea todo el escritorio (iconos + ventanas + taskbar + panel de control) y
// devuelve las funciones que main.js necesita para conectar el drag de agentes.
export function createLabPanel({ params, onReset, onPreset, onPauseChange }) {
  const openWindows = new Map(); // id -> { el, type, isDropTarget }
  let windowCounter = 0;
  let refreshers = [];

  function openWindow(type, { title, bodyEl, isLab = false } = {}) {
    const def = WINDOW_DEFS[type] || { title: title || 'Ventana', icon: '🪟' };
    const id = `win-${type}-${windowCounter++}`;

    const el = document.createElement('div');
    el.className = isLab ? 'desktop-window is-lab' : 'desktop-window';
    el.style.left = `${120 + Math.random() * 160}px`;
    el.style.top = `${90 + Math.random() * 120}px`;

    const titleBar = document.createElement('div');
    titleBar.className = 'title-bar';
    titleBar.innerHTML = `<span>${def.icon || ''} ${title || def.title}</span>`;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-btn';
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', () => closeWindow(id));
    titleBar.append(closeBtn);

    const content = document.createElement('div');
    content.className = isLab ? 'window-content panel-body' : 'window-content';
    if (bodyEl) content.append(bodyEl);
    else content.innerHTML = def.body || '';

    el.append(titleBar, content);
    document.body.append(el);
    bringToFront(el);
    makeDraggable(el, titleBar);

    openWindows.set(id, { el, type, isDropTarget: !isLab });
    return id;
  }

  function closeWindow(id) {
    const entry = openWindows.get(id);
    if (!entry) return;
    entry.el.remove();
    openWindows.delete(id);
  }

  // Ventana (soltable por un agente) bajo un punto de la pantalla, o null.
  function getWindowAt(clientX, clientY) {
    const entries = [...openWindows.entries()]
      .filter(([, v]) => v.isDropTarget)
      .sort((a, b) => Number(b[1].el.style.zIndex) - Number(a[1].el.style.zIndex));

    for (const [id, entry] of entries) {
      const rect = entry.el.getBoundingClientRect();
      if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
        return { windowId: id, windowType: entry.type };
      }
    }
    return null;
  }

  // --- iconos del escritorio ---
  const desktop = document.createElement('div');
  desktop.className = 'desktop-icons';
  document.body.append(desktop);

  Object.keys(WINDOW_DEFS).forEach((type) => {
    const def = WINDOW_DEFS[type];
    const icon = document.createElement('button');
    icon.className = 'desktop-icon';
    icon.innerHTML = `<span class="glyph">${def.icon}</span><span>${def.title}</span>`;
    icon.addEventListener('click', () => openWindow(type));
    desktop.append(icon);
  });

  // --- ventana "Lab" con los sliders, controlada desde el Start ---
  let labWindowId = null;
  let labOpen = false;

  function toggleLab() {
    if (labOpen) {
      closeWindow(labWindowId);
      labOpen = false;
      return;
    }
    const content = document.createElement('div');
    labWindowId = openWindow('lab', { title: '⚙️ Panel de control', bodyEl: content, isLab: true });
    refreshers = buildSliders(content, { params, onReset, onPreset, onPauseChange });
    labOpen = true;
  }

  // --- barra de tareas ---
  const bar = document.createElement('div');
  bar.className = 'taskbar';

  const startBtn = document.createElement('button');
  startBtn.className = 'start-btn';
  startBtn.innerHTML = '🪟 <span>Start</span>';
  startBtn.addEventListener('click', toggleLab);

  const clock = document.createElement('div');
  clock.className = 'clock';
  function tick() {
    const now = new Date();
    clock.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }
  tick();
  setInterval(tick, 1000 * 15);

  bar.append(startBtn, clock);
  document.body.append(bar);

  return {
    getWindowAt,
    refresh() {
      for (const item of refreshers) item.refresh();
    }
  };
}