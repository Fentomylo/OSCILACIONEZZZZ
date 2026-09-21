// Ventana "PowerPoint" con estética Office 2007 / Vista (cinta, panel de
// diapositivas, área de notas, barra de estado) y 2 diapositivas con los
// datos numéricos del pitch de Bloque 314.
//
// Uso (desde labPanel.js):
//   body: POWERPOINT_BODY           -> HTML de la ventana
//   initPowerPoint(contentEl)       -> activa cinta, miniaturas, zoom y
//                                      modo presentación (F5 / Slide Show)

import blairImg from '../BLAIR.jpg';
import ilovebeesImg from '../ILOVEBEES.jpg';

const W = 960;
const H = 540;

// ---------------------------------------------------------------------
// Diapositivas (960 x 540). Tema "Flow": ola turquesa arriba, fondo blanco.
// ---------------------------------------------------------------------
const WAVE = `
  <svg class="pp-wave" viewBox="0 0 960 90" preserveAspectRatio="none" aria-hidden="true">
    <path d="M0,0 H960 V40 C830,84 700,8 540,34 C380,60 220,90 0,48 Z" fill="#0F6FC6" opacity="0.92"/>
    <path d="M0,0 H960 V24 C830,66 690,0 540,20 C380,42 200,74 0,32 Z" fill="#0BD0D9" opacity="0.8"/>
    <path d="M0,0 H960 V10 C800,40 660,-6 520,8 C360,24 200,44 0,14 Z" fill="#04617B" opacity="0.9"/>
  </svg>`;

const bar = (label, pct) => `
  <div class="pp-barrow">
    <span class="pp-barlabel">${label}</span>
    <div class="pp-bar"><i style="--w:${pct}%"></i></div>
    <span class="pp-barval">${pct}%</span>
  </div>`;

// ---- Diapositiva 1: por qué transmedia y por qué terror ----
const SLIDE_1 = `
<div class="pp-slide">
  ${WAVE}
  <div class="pp-title">¿Por qué transmedia y por qué terror?</div>
  <div class="pp-sub">Dos decisiones, respaldadas por datos</div>

  <div class="pp-sec l">
    <div class="pp-pill">TRANSMEDIA <small>la historia en varias plataformas</small></div>

    <div class="pp-stat">
      <div class="pp-badge up">▲</div>
      <div class="pp-stat-n">+19%</div>
      <div class="pp-stat-t"><strong>más engagement</strong><span>La audiencia participa más cuando el contenido se reparte entre plataformas.</span></div>
    </div>
    <div class="pp-stat">
      <div class="pp-badge down">▼</div>
      <div class="pp-stat-n">−23%</div>
      <div class="pp-stat-t"><strong>menos costos de distribución</strong><span>Optimizar el contenido por plataforma sale más barato.</span></div>
    </div>
    <div class="pp-tag">Resultados de escenarios modelados ¹</div>
  </div>

  <div class="pp-sec r">
    <div class="pp-pill hot">TERROR <small>el género de la Generación Z</small></div>

    <div class="pp-terror">
      <div class="pp-ring">
        <svg viewBox="0 0 140 140" aria-hidden="true">
          <circle class="t" cx="70" cy="70" r="54"/>
          <circle class="v" cx="70" cy="70" r="54" style="--d:308.8"/>
        </svg>
        <div class="pp-ring-c"><b>91%</b><span>Gen Z</span></div>
      </div>
      <div class="pp-gens">
        <div class="pp-gens-h">También ven terror ²</div>
        ${bar('Millennials', 87)}
        ${bar('Gen X', 76)}
        ${bar('Boomers', 58)}
      </div>
    </div>

    <div class="pp-taq">
      <b>4%</b><i>➜</i><b class="hot">17%</b>
      <span>de los boletos de cine en Norteamérica ya son de terror (hace una década → hoy) ³</span>
    </div>
  </div>

  <div class="pp-take"><b>💡 En resumen:</b> el público joven ya consume terror, y repartir la experiencia entre plataformas engancha más y cuesta menos.</div>

  <div class="pp-src">¹ Entertainment Computing (ScienceDirect), 2025 · ² Encuesta Prime Video, oct. 2024 (vía Statista) · ³ Dentsu, citada por CNN, jun. 2026</div>
  <div class="pp-foot"><span>Bloque 314 · Estrategia transmedia</span><span>1</span></div>
</div>`;

// ---- Diapositiva 2: las tres apuestas y sus referentes ----
const SLIDE_2 = `
<div class="pp-slide">
  ${WAVE}
  <div class="pp-title">Nuestras 3 apuestas y quién ya lo logró</div>

  <div class="pp-cards">

    <div class="pp-card">
      <div class="pp-cardhead"><span class="pp-num">1</span><div>La Wiki<small>capta público</small></div></div>
      <div class="pp-photo">
        <img src="${blairImg}" alt="The Blair Witch Project" />
        <div class="pp-photocap">Referente · The Blair Witch Project (1999)</div>
      </div>
      <div class="pp-bigrow"><b>$248.6 M</b><span>de taquilla mundial con solo $0.2–0.75 M de presupuesto ²</span></div>
      <div class="pp-line">🔎 En un estudio con +1,000 personas, la curiosidad transmedia aumentó las ganas de ver la obra ¹</div>
    </div>

    <div class="pp-card">
      <div class="pp-cardhead"><span class="pp-num">2</span><div>Videos interactivos<small>suben la participación</small></div></div>
      <div class="pp-photo yt">
        <div class="pp-ytmock">
          <div class="pp-play">▶</div>
          <div class="pp-choices"><span>Abrir la puerta</span><span>Salir corriendo</span></div>
        </div>
        <div class="pp-photocap">Referente · Black Mirror: Bandersnatch (Netflix)</div>
      </div>
      <div class="pp-bigrow"><b>2,000 M</b><span>de usuarios mensuales en YouTube: fácil de compartir ³</span></div>
      <div class="pp-line">📈 Estudio 2026: los videos interactivos gustan y retienen más que los lineales ¹</div>
    </div>

    <div class="pp-card">
      <div class="pp-cardhead"><span class="pp-num">3</span><div>La Araña<small>construye reconocimiento</small></div></div>
      <div class="pp-photo">
        <img src="${ilovebeesImg}" alt="I Love Bees, campaña de Halo 2" />
        <div class="pp-photocap">Referente · I Love Bees, campaña de Halo 2 (2004)</div>
      </div>
      <div class="pp-bigrow"><b>2.5 M+</b><span>de personas participaron en solo 4 meses ⁴</span></div>
      <div class="pp-line">🎮 Halo 2 vendió $125 M en su primer día. La araña busca esa misma conexión ⁴</div>
    </div>

  </div>

  <div class="pp-metrics">
    <strong>Qué mediremos:</strong>
    <span>Alcance</span><span>Interacciones</span><span>Retención</span><span>Visitas</span><span class="hot">Quién ve el cortometraje</span>
  </div>

  <div class="pp-src">¹ Estudios citados en el pitch · ² Wikipedia · ³ YouTube Press · ⁴ 42 Entertainment / GameSpot (estimación de los creadores)</div>
  <div class="pp-foot"><span>Bloque 314 · Estrategia transmedia</span><span>2</span></div>
</div>`;

const SLIDES = [SLIDE_1, SLIDE_2];

const NOTES = [
  'Fuentes: (1) "Optimizing transmedia storytelling strategies across platforms for maximum audience engagement", Entertainment Computing, 2025 — resultados de un modelo de optimización en distintos escenarios (+19% engagement, −23% costos). (2) Encuesta de Prime Video reportada por Statista y Advanced Television, oct. 2024: Gen Z 91%, Millennials 87%, Gen X 76%, Boomers 58%. (3) Cathy Boxall (Dentsu), citada por CNN en jun. 2026: el terror pasó de 4% a 17% de las compras de boletos en Norteamérica.',
  'Fuentes: Blair Witch: presupuesto $200k–$750k y taquilla de $248.6 M (Wikipedia). YouTube: más de 2,000 M de usuarios mensuales con sesión y más de 500 horas subidas por minuto (YouTube Press). I Love Bees: más de 2.5 M de participantes según 42 Entertainment (GameSpot, 2011); las estimaciones varían según la fuente. Halo 2: $125 M el primer día (42 Entertainment). Los estudios de curiosidad (n > 1,000) y de videos interactivos (2026) son los citados en el pitch. La araña toma su estética de asistentes de escritorio como BonziBuddy.',
];

// ---------------------------------------------------------------------
// Cinta de opciones (decorativa, salvo Slide Show)
// ---------------------------------------------------------------------
// [etiqueta, icono, 'big' | 'small', acción opcional]
const B = (label, icon, act = '') => ({ label, icon, big: true, act });
const S = (label, icon, act = '') => ({ label, icon, big: false, act });
const STACK = (...items) => ({ stack: items });
const RAW = (html) => ({ raw: html });

const RIBBONS = {
  Home: [
    { label: 'Clipboard', items: [B('Paste', '📋'), STACK(S('Cut', '✂️'), S('Copy', '📄'), S('Format Painter', '🖌️'))] },
    { label: 'Slides', items: [B('New Slide', '🖼️'), STACK(S('Layout', '▦'), S('Reset', '↺'), S('Delete', '✖'))] },
    { label: 'Font', items: [RAW(`
      <div class="ppt-fontbox">
        <div><span class="ppt-select" style="width:92px">Calibri</span><span class="ppt-select" style="width:38px">18</span></div>
        <div class="ppt-fmt"><b>B</b><i>I</i><u>U</u><s>S</s><span>Aa</span><span>A▾</span></div>
      </div>`)] },
    { label: 'Paragraph', items: [RAW(`
      <div class="ppt-fontbox">
        <div class="ppt-fmt"><span>☰</span><span>≣</span><span>⇥</span><span>⇤</span></div>
        <div class="ppt-fmt"><span>⬅</span><span>↔</span><span>➡</span><span>⇔</span></div>
      </div>`)] },
    { label: 'Drawing', items: [B('Shapes', '🔷'), B('Arrange', '🗂️'), B('Quick Styles', '🎨')] },
    { label: 'Editing', items: [STACK(S('Find', '🔍'), S('Replace', '🔁'), S('Select', '🖱️'))] },
  ],
  Insert: [
    { label: 'Tables', items: [B('Table', '▦')] },
    { label: 'Illustrations', items: [B('Picture', '🖼️'), B('Clip Art', '🎨'), B('Photo Album', '📷'), B('Shapes', '🔷'), B('SmartArt', '🔗'), B('Chart', '📊')] },
    { label: 'Links', items: [B('Hyperlink', '🌐'), B('Action', '▶️')] },
    { label: 'Text', items: [B('Text Box', '🅰️'), B('Header & Footer', '📑'), B('WordArt', '🔠'), B('Date & Time', '📅'), B('Slide Number', '#️⃣'), B('Symbol', 'Ω'), B('Object', '📎')] },
    { label: 'Media Clips', items: [B('Movie', '🎬'), B('Sound', '🔊')] },
  ],
  Design: [
    { label: 'Page Setup', items: [B('Page Setup', '📄'), S('Slide Orientation', '↕')] },
    { label: 'Themes', items: [RAW(`
      <div class="ppt-themes">
        <span style="background:linear-gradient(135deg,#0BD0D9,#0F6FC6)" class="sel" title="Flow">Aa</span>
        <span style="background:linear-gradient(135deg,#e9e9e9,#7a7a7a)" title="Office">Aa</span>
        <span style="background:linear-gradient(135deg,#f6b26b,#b45f06)" title="Solstice">Aa</span>
        <span style="background:linear-gradient(135deg,#b6d7a8,#38761d)" title="Verve">Aa</span>
        <span style="background:linear-gradient(135deg,#d5a6bd,#741b47)" title="Opulent">Aa</span>
      </div>`)] },
    { label: 'Background', items: [B('Background Styles', '🎨'), S('Hide Background Graphics', '🙈')] },
  ],
  Animations: [
    { label: 'Preview', items: [B('Preview', '▶️')] },
    { label: 'Animations', items: [B('Animate', '✨'), B('Custom Animation', '🎞️')] },
    { label: 'Transition to This Slide', items: [B('Fade', '🌫️'), B('Wipe', '➡️'), B('Push', '⬆️'), B('Cover', '🗂️')] },
  ],
  'Slide Show': [
    { label: 'Start Slide Show', items: [B('From Beginning', '🖥️', 'showStart'), B('From Current Slide', '▶️', 'showCurrent'), B('Custom Slide Show', '📋')] },
    { label: 'Set Up', items: [B('Set Up Slide Show', '⚙️'), STACK(S('Hide Slide', '🙈'), S('Rehearse Timings', '⏱️'), S('Record Narration', '🎙️'))] },
    { label: 'Resolution', items: [RAW('<div class="ppt-fontbox"><div><span class="ppt-select" style="width:110px">Use Current Resolution</span></div></div>')] },
  ],
  Review: [
    { label: 'Proofing', items: [B('Spelling', '✔️'), B('Research', '📚'), B('Thesaurus', '📖')] },
    { label: 'Comments', items: [B('New Comment', '💬'), STACK(S('Delete', '✖'), S('Previous', '◀'), S('Next', '▶'))] },
    { label: 'Protect', items: [B('Protect Presentation', '🔒')] },
  ],
  View: [
    { label: 'Presentation Views', items: [B('Normal', '🖼️'), B('Slide Sorter', '▦'), B('Notes Page', '📝'), B('Slide Show', '🖥️', 'showStart')] },
    { label: 'Show/Hide', items: [STACK(S('Ruler', '📏'), S('Gridlines', '#'), S('Message Bar', '✉️'))] },
    { label: 'Zoom', items: [B('Zoom', '🔍'), B('Fit to Window', '⛶', 'fit')] },
  ],
};

function itemHTML(it) {
  if (it.raw) return it.raw;
  if (it.stack) return `<div class="ppt-stack">${it.stack.map(itemHTML).join('')}</div>`;
  const act = it.act ? ` data-act="${it.act}"` : '';
  return it.big
    ? `<button type="button" class="ppt-btn big"${act}><span class="ppt-ico">${it.icon}</span><span class="ppt-lbl">${it.label}</span></button>`
    : `<button type="button" class="ppt-btn small"${act}><span class="ppt-ico">${it.icon}</span><span class="ppt-lbl">${it.label}</span></button>`;
}

// ---------------------------------------------------------------------
// HTML de la ventana
// ---------------------------------------------------------------------
export const POWERPOINT_BODY = `
<div class="ppt-app" tabindex="0">
  <div class="ppt-top">
    <div class="ppt-orb" title="Office"><svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true">
      <path d="M6 9 L18 4 L26 8 L26 24 L18 28 L6 23 Z" fill="#e8511f"/><path d="M18 4 L26 8 L26 24 L18 28 Z" fill="#c23a12"/>
      <path d="M11 12 L18 10 L18 22 L11 20 Z" fill="#fff"/></svg></div>
    <div class="ppt-qat"><span>💾</span><span>↶</span><span>↷</span></div>
    <div class="ppt-help">?</div>
  </div>
  <div class="ppt-tabs"></div>
  <div class="ppt-ribbon"></div>

  <div class="ppt-main">
    <div class="ppt-panel-left">
      <div class="ppt-panel-tabs"><span class="on">Slides</span><span>Outline</span></div>
      <div class="ppt-thumbs"></div>
    </div>
    <div class="ppt-center">
      <div class="ppt-workspace"><div class="ppt-slidewrap"><div class="ppt-slidehost"></div></div></div>
      <div class="ppt-vscroll">
        <button type="button" data-act="prev" title="Anterior">▲</button>
        <div class="ppt-vtrack"><i></i></div>
        <button type="button" data-act="next" title="Siguiente">▼</button>
        <button type="button" data-act="prev" class="dbl" title="Diapositiva anterior">⏫</button>
        <button type="button" data-act="next" class="dbl" title="Diapositiva siguiente">⏬</button>
      </div>
      <div class="ppt-notes" contenteditable="true" spellcheck="false" data-placeholder="Click to add notes"></div>
    </div>
  </div>

  <div class="ppt-status">
    <span class="ppt-st-slide">Slide 1 of 2</span>
    <span class="ppt-st-theme">"Flow"</span>
    <span class="ppt-st-spacer"></span>
    <span class="ppt-views">
      <button type="button" title="Normal" class="on">▣</button>
      <button type="button" title="Clasificador">▦</button>
      <button type="button" title="Presentación con diapositivas" data-act="showCurrent">🖥️</button>
    </span>
    <span class="ppt-zoomval">56%</span>
    <button type="button" class="ppt-zbtn" data-act="zoomout">−</button>
    <input type="range" class="ppt-zoom" min="20" max="200" value="56" />
    <button type="button" class="ppt-zbtn" data-act="zoomin">+</button>
    <button type="button" class="ppt-zbtn" data-act="fit" title="Ajustar a la ventana">⛶</button>
  </div>
</div>`;

// ---------------------------------------------------------------------
// Lógica
// ---------------------------------------------------------------------
export function initPowerPoint(container) {
  const app = container.querySelector('.ppt-app');
  if (!app) return;
  const $ = (sel) => app.querySelector(sel);

  const tabsEl = $('.ppt-tabs');
  const ribbonEl = $('.ppt-ribbon');
  const thumbsEl = $('.ppt-thumbs');
  const workspace = $('.ppt-workspace');
  const wrap = $('.ppt-slidewrap');
  const host = $('.ppt-slidehost');
  const notesEl = $('.ppt-notes');
  const stSlide = $('.ppt-st-slide');
  const zoomInput = $('.ppt-zoom');
  const zoomVal = $('.ppt-zoomval');
  const vthumb = $('.ppt-vtrack i');

  const notes = [...NOTES];
  let idx = 0;
  let zoom = null; // null = ajustar a la ventana

  // --- Cinta ---------------------------------------------------------
  function renderRibbon(tab) {
    ribbonEl.innerHTML = RIBBONS[tab]
      .map((g) => `<div class="ppt-group"><div class="ppt-group-body">${g.items.map(itemHTML).join('')}</div><div class="ppt-group-label">${g.label}</div></div>`)
      .join('');
  }
  Object.keys(RIBBONS).forEach((name) => {
    const t = document.createElement('button');
    t.type = 'button';
    t.className = 'ppt-tab';
    t.textContent = name;
    t.addEventListener('click', () => {
      tabsEl.querySelectorAll('.ppt-tab').forEach((x) => x.classList.remove('on'));
      t.classList.add('on');
      ribbonEl.classList.remove('collapsed');
      renderRibbon(name);
      layout();
    });
    // Doble clic en la pestaña: minimiza/expande la cinta (como Office 2007)
    t.addEventListener('dblclick', () => {
      ribbonEl.classList.toggle('collapsed');
      layout();
    });
    tabsEl.append(t);
  });
  tabsEl.firstElementChild.classList.add('on');
  renderRibbon('Home');

  // --- Miniaturas ----------------------------------------------------
  SLIDES.forEach((html, i) => {
    const row = document.createElement('div');
    row.className = 'ppt-thumbrow';
    row.dataset.i = String(i);
    row.innerHTML = `<span class="ppt-thumbn">${i + 1}</span><div class="ppt-thumb"><div class="ppt-thumbinner">${html.replace('class="pp-slide"', 'class="pp-slide in"')}</div></div>`;
    row.addEventListener('click', () => go(i));
    thumbsEl.append(row);
  });

  // --- Navegación ----------------------------------------------------
  function go(i) {
    idx = Math.max(0, Math.min(SLIDES.length - 1, i));
    host.innerHTML = SLIDES[idx];
    // Doble rAF para que las barras animen desde 0
    requestAnimationFrame(() => requestAnimationFrame(() => host.firstElementChild && host.firstElementChild.classList.add('in')));
    thumbsEl.querySelectorAll('.ppt-thumbrow').forEach((r, k) => r.classList.toggle('sel', k === idx));
    notesEl.textContent = notes[idx];
    stSlide.textContent = `Slide ${idx + 1} of ${SLIDES.length}`;
    const frac = SLIDES.length > 1 ? idx / (SLIDES.length - 1) : 0;
    vthumb.style.top = `calc(${frac * 100}% - ${frac * 34}px)`;
  }
  notesEl.addEventListener('input', () => { notes[idx] = notesEl.textContent; });

  // --- Zoom ----------------------------------------------------------
  function layout() {
    const fit = Math.min((workspace.clientWidth - 40) / W, (workspace.clientHeight - 32) / H);
    const scale = zoom ? zoom / 100 : Math.max(0.1, fit);
    wrap.style.width = `${W * scale}px`;
    wrap.style.height = `${H * scale}px`;
    host.style.transform = `scale(${scale})`;
    const pct = Math.round(scale * 100);
    zoomVal.textContent = `${pct}%`;
    zoomInput.value = String(pct);
  }
  zoomInput.addEventListener('input', () => { zoom = Number(zoomInput.value); layout(); });
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(layout).observe(workspace);
  else window.addEventListener('resize', layout);

  // --- Modo presentación ---------------------------------------------
  function startShow(from) {
    let cur = from;
    let entered = false;
    const ov = document.createElement('div');
    ov.className = 'ppt-show';
    ov.tabIndex = 0;
    ov.innerHTML = '<div class="ppt-show-stage"></div><div class="ppt-show-hint">Clic o → para avanzar · ← para volver · Esc para salir</div>';
    app.append(ov);
    const stage = ov.querySelector('.ppt-show-stage');
    const hint = ov.querySelector('.ppt-show-hint');

    const fit = () => {
      const s = Math.min(ov.clientWidth / W, ov.clientHeight / H);
      stage.style.transform = `translate(-50%, -50%) scale(${s})`;
    };
    const draw = () => {
      stage.innerHTML = SLIDES[cur];
      requestAnimationFrame(() => requestAnimationFrame(() => stage.firstElementChild && stage.firstElementChild.classList.add('in')));
    };
    const close = () => {
      document.removeEventListener('fullscreenchange', onFs);
      window.removeEventListener('resize', fit);
      ov.removeEventListener('keydown', onKey);
      ro && ro.disconnect();
      if (document.fullscreenElement === ov) document.exitFullscreen().catch(() => {});
      ov.remove();
      go(cur);
      app.focus();
    };
    const next = () => { if (cur >= SLIDES.length - 1) close(); else { cur += 1; draw(); } };
    const prev = () => { if (cur > 0) { cur -= 1; draw(); } };
    const onKey = (e) => {
      if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); next(); }
      else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(e.key)) { e.preventDefault(); prev(); }
      else if (e.key === 'Escape') { e.preventDefault(); close(); }
    };
    const onFs = () => { if (entered && !document.fullscreenElement) close(); };

    ov.addEventListener('click', next);
    ov.addEventListener('keydown', onKey);
    document.addEventListener('fullscreenchange', onFs);
    window.addEventListener('resize', fit);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fit) : null;
    ro && ro.observe(ov);

    draw();
    fit();
    ov.focus();
    setTimeout(() => hint.classList.add('fade'), 2500);
    if (ov.requestFullscreen) {
      ov.requestFullscreen().then(() => { entered = true; fit(); }).catch(() => {});
    }
  }

  // --- Acciones (botones con data-act) ---------------------------------
  app.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    if (!b || b.closest('.ppt-show')) return;
    switch (b.dataset.act) {
      case 'prev': go(idx - 1); break;
      case 'next': go(idx + 1); break;
      case 'showStart': startShow(0); break;
      case 'showCurrent': startShow(idx); break;
      case 'fit': zoom = null; layout(); break;
      case 'zoomin': zoom = Math.min(200, (zoom || Number(zoomInput.value)) + 10); layout(); break;
      case 'zoomout': zoom = Math.max(20, (zoom || Number(zoomInput.value)) - 10); layout(); break;
      default: break;
    }
  });

  app.addEventListener('keydown', (e) => {
    if (e.target === notesEl || e.target.closest('.ppt-show')) return;
    if (e.key === 'F5') { e.preventDefault(); startShow(e.shiftKey ? idx : 0); }
    else if (['ArrowDown', 'PageDown'].includes(e.key)) { e.preventDefault(); go(idx + 1); }
    else if (['ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); go(idx - 1); }
  });
  workspace.addEventListener('wheel', (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
      zoom = Math.max(20, Math.min(200, (zoom || Number(zoomInput.value)) + (e.deltaY < 0 ? 10 : -10)));
      layout();
    }
  }, { passive: false });

  go(0);
  layout();
}