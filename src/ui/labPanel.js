import brunoImg from '../bruno.jpg';

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
  refreshers.push(rangeRow(sim, 'velocidad', () => params.dt, (v) => { params.dt = v; }, 0.01, 0.15, 0.005));
  refreshers.push(rangeRow(sim, 'sincronía (r)', () => params.order, () => {}, 0, 1, 0.01));

  const presets = document.createElement('div');
  presets.className = 'group';
  presets.innerHTML = '<h2>estados colectivos</h2>';
  container.append(presets);
  button(presets, '💫 Calma', () => onPreset('calm'));
  button(presets, '⚡ Caos', () => onPreset('chaos'));
  button(presets, '🔗 Unión', () => onPreset('sync'));

  const cast = document.createElement('div');
  cast.className = 'group';
  cast.innerHTML = `<h2>elenco</h2><div class="cast-list" style="font-size:10px;line-height:1.7;">
    1. Static-Tan (Rainbow)<br>2. Core-Tan (Coro)<br>3. Mirror-Tan (Pájaros)<br>4. Signal-Tan (Burbujas)<br>
    5. Petal (Campanas)<br>6. Disko (Gota)<br>7. Pixel-Boy (Ping UI)<br>8. Moth (Brisa)
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

const WINDOW_DEFS = {
  google: {
    title: 'Google', icon: '🌐',
    body: `<div class="browser-toolbar"><span class="browser-btn">◀</span><span class="browser-btn">▶</span><span class="browser-btn">⟳</span><div class="browser-address">https://www.google.com</div></div><div class="google-body"><div class="google-logo">Google</div><div class="google-search"><span>🔍</span><span class="ph">buscar algo que no importa…</span></div></div>`
  },
  files: {
    title: 'Mis Archivos', icon: '🗂️',
    body: `<div class="files-toolbar"><span>⬅</span><span>📁 Mis Archivos</span></div><div class="files-grid"><div class="file-item"><span class="glyph">📁</span>fotos</div><div class="file-item"><span class="glyph">📁</span>proyectos</div></div>`
  },
  player: {
    title: 'Reproductor', icon: '🎵',
    body: `<div class="player-art">🎧</div><div class="player-track">pista 03 — sin título</div><div class="player-progress"><div class="player-progress-fill"></div></div><div class="player-controls"><span>⏮</span><span class="play">▶</span><span>⏭</span></div>`
  },
  gallery: {
    title: 'Galería de Bruno', icon: '🐶',
    body: `<div style="text-align:center; padding: 4px;"><p style="font-size:11px; margin-bottom:6px; opacity:0.8;">Bruno 🐾 (¡Arrastra un agente aquí para activar el coro!)</p><img src="${brunoImg}" style="max-width:100%; height:auto; border-radius:6px; border:1px solid rgba(255,255,255,0.2); max-height: 200px;" alt="Bruno" /></div>`
  },
  messenger: {
    title: 'Messenger', icon: '💬',
    body: `
      <div style="font-family:Tahoma,sans-serif; font-size:11px; color:#fff; background:rgba(10,20,30,0.85); padding:6px; border-radius:4px;">
        <div style="display:flex; align-items:center; gap:8px; padding-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.15); margin-bottom:6px;">
          <div style="width:32px; height:32px; background:#1f6fd6; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold;">🐱</div>
          <div>
            <div style="font-weight:bold; font-size:12px;">Tomy :3</div>
            <div style="font-size:10px; color:#7fe2ff;">🟢 Disponible para hablar</div>
          </div>
        </div>
        
        <div style="font-size:10px; text-transform:uppercase; opacity:0.6; margin-bottom:4px; letter-spacing:0.05em;">Amigos Conectados</div>

        <div style="display:flex; flex-direction:column; gap:4px; max-height:190px; overflow-y:auto; padding-right:2px;">
          
          <div style="display:flex; align-items:center; gap:6px; background:rgba(255,255,255,0.06); padding:4px 6px; border-radius:4px;">
            <div style="width:8px; height:8px; background:#2fa32f; border-radius:50%;"></div>
            <span style="font-size:14px;">⭐</span>
            <div style="flex:1;"><div style="font-weight:bold; color:#ff9bd4;">lady gaga</div><div style="font-size:9px; opacity:0.7;">bad_romance_92 · En línea</div></div>
          </div>

          <div style="display:flex; align-items:center; gap:6px; background:rgba(255,255,255,0.06); padding:4px 6px; border-radius:4px;">
            <div style="width:8px; height:8px; background:#2fa32f; border-radius:50%;"></div>
            <span style="font-size:14px;">🐾</span>
            <div style="flex:1;"><div style="font-weight:bold; color:#70e6ff;">brunaenae</div><div style="font-size:9px; opacity:0.7;">bruna_bae · En línea</div></div>
          </div>

          <div style="display:flex; align-items:center; gap:6px; background:rgba(255,255,255,0.06); padding:4px 6px; border-radius:4px;">
            <div style="width:8px; height:8px; background:#2fa32f; border-radius:50%;"></div>
            <span style="font-size:14px;">🐶</span>
            <div style="flex:1;"><div style="font-weight:bold; color:#88ffca;">bru</div><div style="font-size:9px; opacity:0.7;">bru_master · Escuchando música</div></div>
          </div>

          <div style="display:flex; align-items:center; gap:6px; background:rgba(255,255,255,0.06); padding:4px 6px; border-radius:4px;">
            <div style="width:8px; height:8px; background:#d93a3a; border-radius:50%;"></div>
            <span style="font-size:14px;">🏝️</span>
            <div style="flex:1;"><div style="font-weight:bold; color:#ff5c7a;">J. Epstein</div><div style="font-size:9px; opacity:0.7;">private_island · Ausente</div></div>
          </div>

          <div style="display:flex; align-items:center; gap:6px; background:rgba(255,255,255,0.06); padding:4px 6px; border-radius:4px;">
            <div style="width:8px; height:8px; background:#2fa32f; border-radius:50%;"></div>
            <span style="font-size:14px;">🐻</span>
            <div style="flex:1;"><div style="font-weight:bold; color:#fbbc05;">Kanye west</div><div style="font-size:9px; opacity:0.7;">ye_yeezy · Escuchando Donda</div></div>
          </div>

          <div style="display:flex; align-items:center; gap:6px; background:rgba(255,255,255,0.06); padding:4px 6px; border-radius:4px;">
            <div style="width:8px; height:8px; background:#2fa32f; border-radius:50%;"></div>
            <span style="font-size:14px;">⚡</span>
            <div style="flex:1;"><div style="font-weight:bold; color:#7fe2ff;">Skrillex</div><div style="font-size:9px; opacity:0.7;">dubstep_god · En línea</div></div>
          </div>

          <div style="display:flex; align-items:center; gap:6px; background:rgba(255,255,255,0.06); padding:4px 6px; border-radius:4px;">
            <div style="width:8px; height:8px; background:#e5a900; border-radius:50%;"></div>
            <span style="font-size:14px;">⛏️</span>
            <div style="flex:1;"><div style="font-weight:bold; color:#ffb261;">El minero</div><div style="font-size:9px; opacity:0.7;">diamond_hunter · Ocupado minando</div></div>
          </div>

        </div>

        <div style="margin-top:6px; display:flex; gap:4px;">
          <input type="text" placeholder="Escribe un estado..." style="flex:1; background:rgba(255,255,255,0.9); border:none; border-radius:3px; padding:3px 6px; font-size:10px; color:#000;" />
        </div>
      </div>
    `
  },
  trash: {
    title: 'Papelera', icon: '🗑️',
    body: `<div class="trash-body"><span class="trash-glyph">🗑️</span><p style="opacity:.6">está vacía… por ahora</p></div>`
  }
};

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

export function createLabPanel({ params, onReset, onPreset, onPauseChange }) {
  const openWindows = new Map();
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

  return { getWindowAt, refresh() { for (const item of refreshers) item.refresh(); } };
}