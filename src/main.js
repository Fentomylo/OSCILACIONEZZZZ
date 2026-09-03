import * as THREE from 'three';
import * as Tone from 'tone';
import './styles.css';

import { createParameters } from './simulation/parameters.js';
import { createSimulation } from './simulation/createSimulation.js';
import { createLabPanel } from './ui/labPanel.js';

// ============================================================
// Motor de sonido (Tone.js) — reescrito desde cero
// ------------------------------------------------------------
// La base rítmica ya no es un four-on-the-floor genérico: es una
// fusión hyperpop/PC music (tipo "iPod Touch" de ninajirachi —
// brillante, glitchy, saturado a propósito) con groove de merengue
// dominicano (tipo "El Niágara en Bicicleta" de Juan Luis Guerra —
// tambora, güira, bajo de tumbao y metales sincopados). Esa base
// suena SIEMPRE, sola, aunque nadie toque un slider: es el pegamento
// que hace que la canción tenga sentido pase lo que pase.
//
// Encima de esa base, cada uno de los 8 agentes toca su propia voz
// (su timbre, su patrón melódico, su ritmo), pero SIEMPRE dentro de
// la misma escala y el mismo acorde vigente (`chordStep`, compartido
// por todo el motor) — así nunca pueden chocar armónicamente entre
// sí, sin importar qué tan sincronizada o caótica esté la simulación
// o cómo se muevan los sliders del panel. Un compresor + limitador en
// el bus master evita que el volumen salte al mover agentes entre
// ventanas.
// ============================================================

// escala pentatónica mayor (C D E G A): CUALQUIER combinación de estas
// notas suena consonante entre sí — es lo que permite que 8 voces
// independientes, gobernadas por Kuramoto, nunca choquen armónicamente.
const SCALE_DEGREES = [0, 2, 4, 7, 9];
const BASE_MIDI = 60; // C4

// cuántos "8n" del transport tiene que esperar cada agente entre notas,
// y en qué octava vive — define su personalidad rítmica
const AGENT_RHYTHM = [
  { every: 2, octave: 1 },  // Static-Tan: nerviosa, pero ya no satura cada paso
  { every: 4, octave: 0 },  // Core-Tan: terca, notas largas y graves
  { every: 2, octave: 1 },  // Mirror-Tan: sigue el pulso medio
  { every: 3, octave: 2 },  // Signal-Tan: errática, entra a destiempo
  { every: 2, octave: 2 },  // Petal: juguetona, aguda
  { every: 4, octave: 0 },  // Disko: analítica, pulso regular y lento
  { every: 2, octave: 2 },  // Pixel-Boy: blips
  { every: 3, octave: 1 }   // Moth: flotante, dotted feel
];

// patrones melódicos fijos (índices dentro de SCALE_DEGREES, 0..4) —
// le dan a cada personaje un contorno melódico real (saltos, vaivenes)
// en vez de una rampa que solo sube o solo baja.
const MELODY_PATTERNS = [
  [0, 2, 1, 3, 0, 4, 2, 1], // Static-Tan: saltos nerviosos
  [0, 0, 3, 2],             // Core-Tan: poco movimiento, grave y terco
  [4, 2, 3, 1, 4, 0, 2, 3], // Mirror-Tan: vaivén brillante
  [1, 4, 0, 3, 2, 4, 1, 3], // Signal-Tan: errático, sin patrón obvio
  [2, 4, 1, 3, 4, 2, 0, 3], // Petal: juguetona, rebota arriba y abajo
  [0, 3, 1, 4],             // Disko: patrón corto y regular
  [4, 1, 3, 0, 2, 4, 1, 3], // Pixel-Boy: contorno tipo arpegio digital
  [1, 3, 4, 0, 2, 1, 4, 3]  // Moth: impulsiva, sin dirección fija
];

// duración de nota por agente: cada timbre nuevo tiene su propio
// "aliento" (blips cortos, campanas que florecen, pads que respiran)
const NOTE_DURATIONS = ['16n', '8n', '8n', '16n', '8n', '4n', '16n', '4n'];

function midiToNote(midi) {
  return Tone.Frequency(midi, 'midi').toNote();
}

// ------------------------------------------------------------
// Instrumentos de los 8 agentes, todos construidos desde cero. Cada
// uno conserva la personalidad descrita arriba, pero con un timbre
// nuevo pensado para convivir con la base de tambora/güira/metales:
// nadie pisa el rango donde vive el bajo ni el de los metales.
// ------------------------------------------------------------
function buildInstrument(index) {
  switch (index) {
    case 0: // Static-Tan: pluck FM nervioso y filoso — el glitch hyperpop del grupo
      return new Tone.FMSynth({
        harmonicity: 3, modulationIndex: 14,
        oscillator: { type: 'square' }, modulation: { type: 'square' },
        envelope: { attack: 0.001, decay: 0.07, sustain: 0, release: 0.05 },
        volume: -20
      });
    case 1: // Core-Tan: pluck grave y redondo, terco — ancla tonal entre los agentes
      return new Tone.MonoSynth({
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.01, decay: 0.22, sustain: 0.12, release: 0.3 },
        filterEnvelope: { attack: 0.01, decay: 0.18, sustain: 0.15, release: 0.35, baseFrequency: 180, octaves: 2.5 },
        volume: -10
      });
    case 2: // Mirror-Tan: shimmer AM que "dobla" la voz, brillante y elástica
      return new Tone.AMSynth({
        harmonicity: 2, oscillator: { type: 'triangle' }, modulation: { type: 'sine' },
        envelope: { attack: 0.004, decay: 0.12, sustain: 0.04, release: 0.15 },
        volume: -14
      });
    case 3: // Signal-Tan: FM errático con bitcrush — la voz "rota" del grupo
      return new Tone.FMSynth({
        harmonicity: 3.7, modulationIndex: 18,
        envelope: { attack: 0.002, decay: 0.08, sustain: 0, release: 0.05 },
        volume: -17
      });
    case 4: // Petal: campana ligera y juguetona
      return new Tone.Synth({
        oscillator: { type: 'fattriangle', count: 2, spread: 10 },
        envelope: { attack: 0.003, decay: 0.16, sustain: 0.02, release: 0.18 },
        volume: -14
      });
    case 5: // Disko: campana FM lenta y analítica, florece despacio
      return new Tone.FMSynth({
        harmonicity: 4, modulationIndex: 5,
        envelope: { attack: 0.015, decay: 0.4, sustain: 0.08, release: 0.8 },
        volume: -16
      });
    case 6: // Pixel-Boy: blip chiptune cuadrado, digital y seco
      return new Tone.Synth({
        oscillator: { type: 'square' },
        envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.05 },
        volume: -22
      });
    default: // Moth: shimmer AM aéreo y flotante — la voz más larga del grupo
      return new Tone.AMSynth({
        harmonicity: 1.5, oscillator: { type: 'sine' }, modulation: { type: 'sine' },
        envelope: { attack: 0.06, decay: 0.35, sustain: 0.22, release: 0.9 },
        volume: -17
      });
  }
}

function createSoundEngine(params, nodes, { onHat } = {}) {
  let started = false;
  let lastBpm = params.musicBpm;

  // --- bus master: siempre balanceado, nunca satura al cambiar de ventana ---
  const limiter = new Tone.Limiter(-1).toDestination();
  const compressor = new Tone.Compressor({ threshold: -20, ratio: 3.2, attack: 0.015, release: 0.22 }).connect(limiter);
  const masterGain = new Tone.Gain(0.85).connect(compressor);
  const groupReverb = new Tone.Reverb({ decay: 3, wet: 1 }).connect(masterGain);
  const reverbSend = new Tone.Gain(0.32).connect(groupReverb);

  const chains = [];
  for (let i = 0; i < params.nodeCount; i++) {
    const instrument = buildInstrument(i);
    const filter = new Tone.Filter(3400, 'lowpass');
    const crusher = i === 3 ? new Tone.BitCrusher(6) : null; // Signal-Tan: glitch digital
    const panner = new Tone.Panner(0);
    const dryGain = new Tone.Gain(0.8);

    if (crusher) instrument.chain(filter, crusher, panner);
    else instrument.chain(filter, panner);
    panner.connect(dryGain);
    dryGain.connect(masterGain);
    panner.connect(reverbSend);

    chains.push({ instrument, filter, panner, dryGain, stepCounter: 0, noteIndex: 0 });
  }

  // ------------------------------------------------------------
  // Base rítmica: tambora + güira + bajo de tumbao + metales — la
  // parte "merengue" de la mezcla. Suena constante e independiente de
  // los agentes; es lo que le da a la canción su columna vertebral y
  // hace que siempre sea agradable de escuchar, se mueva lo que se
  // mueva arriba.
  // ------------------------------------------------------------

  // Tambora: golpe grave ("boom") + golpe seco y agudo ("tak"), el
  // vaivén característico del merengue dominicano.
  const tamboraBoom = new Tone.MembraneSynth({
    pitchDecay: 0.035, octaves: 3.5,
    envelope: { attack: 0.001, decay: 0.26, sustain: 0 },
    volume: -5
  }).connect(masterGain);
  const tamboraTak = new Tone.MembraneSynth({
    pitchDecay: 0.008, octaves: 1.2,
    envelope: { attack: 0.001, decay: 0.05, sustain: 0 },
    volume: -15
  }).connect(masterGain);

  const TAMBORA_PATTERN = ['B', null, 't', 'B', null, 't', 'B', 't'];
  const tamboraSeq = new Tone.Sequence((time, hit) => {
    if (hit === 'B') {
      tamboraBoom.triggerAttackRelease('C1', '8n', time);
      // bombeo de sidechain sobre el "boom": la mezcla respira con la
      // tambora, como el pump del hyperpop/PC music.
      masterGain.gain.cancelScheduledValues(time);
      masterGain.gain.setValueAtTime(0.44, time);
      masterGain.gain.linearRampToValueAtTime(0.85, time + 0.2);
    }
    if (hit === 't') tamboraTak.triggerAttackRelease('G2', '16n', time, 0.55);
  }, TAMBORA_PATTERN, '8n');

  // Güira: barrido metálico continuo con acentos — el motor de energía
  // del merengue, filtrado bien agudo para que combine con el brillo
  // hyperpop en vez de sonar a percusión "orgánica".
  const guira = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.045, sustain: 0 },
    volume: -26
  });
  const guiraFilter = new Tone.Filter(7200, 'highpass');
  guira.chain(guiraFilter, reverbSend);
  guiraFilter.connect(masterGain);

  const GUIRA_PATTERN = ['x', 'x', 'X', 'x', 'x', 'x', 'X', 'x', 'x', 'x', 'X', 'x', 'x', 'X', 'x', 'X'];
  const guiraSeq = new Tone.Sequence((time, hit) => {
    const vel = hit === 'X' ? 0.85 : 0.45;
    guira.triggerAttackRelease('16n', time, vel);
    // Tone.Draw alinea el callback visual con el instante de audio real
    // (compensa el lookahead del Transport), el temblor sigue pegado a la güira.
    if (onHat) Tone.Draw.schedule(() => onHat(hit === 'X' ? 'o' : 'c'), time);
  }, GUIRA_PATTERN, '16n');
  guiraSeq.humanize = '128n';

  // Metales (horns): golpes cortos y brillantes tipo sección de vientos
  // de merengue, sintetizados con sierras "gordas" — el gancho hyperpop
  // de la mezcla. Siempre tocan las notas del acorde vigente.
  const horns = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'fatsawtooth', count: 3, spread: 22 },
    envelope: { attack: 0.004, decay: 0.09, sustain: 0, release: 0.1 },
    volume: -14
  });
  const hornFilter = new Tone.Filter(2600, 'bandpass');
  hornFilter.Q.value = 1.1;
  horns.chain(hornFilter, reverbSend);
  hornFilter.connect(masterGain);

  const HORN_PATTERN = [null, 'hit', null, 'hit', null, null, 'hit', null];

  // Bajo de tumbao: raíz y quinta del acorde vigente, con el bote
  // sincopado típico del merengue — el ancla grave de toda la mezcla.
  const bass = new Tone.MonoSynth({
    oscillator: { type: 'fmsawtooth', modulationType: 'square' },
    envelope: { attack: 0.005, decay: 0.14, sustain: 0.05, release: 0.12 },
    filterEnvelope: { attack: 0.005, decay: 0.12, sustain: 0.1, release: 0.2, baseFrequency: 90, octaves: 2 },
    volume: -9
  }).connect(masterGain);

  const BASS_PATTERN = ['R', null, 'F', null, 'R', 'R', null, 'F'];

  // Colchón de acordes de fondo — más discreto que antes, porque ahora
  // los metales llevan el peso del "gancho" de la canción.
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'fatsawtooth', count: 3, spread: 16 },
    envelope: { attack: 1.2, decay: 0.5, sustain: 0.6, release: 3 },
    volume: -25
  });
  const padFilter = new Tone.Filter(2000, 'lowpass');
  pad.chain(padFilter, reverbSend);
  padFilter.connect(masterGain);

  // ------------------------------------------------------------
  // Progresión I–IV–V en Do mayor: el vamp armónico más típico del
  // merengue (y de buena parte del pop). Un acorde por compás — motion
  // rápido y bailable. TODOS (agentes, metales, bajo, pad) leen el
  // mismo `chordStep`, así nunca chocan entre sí sin importar qué tan
  // sincronizada o caótica esté la simulación.
  // ------------------------------------------------------------
  const CHORD_PROGRESSION = [
    { rootOffset: 0, padNotes: ['C3', 'G3', 'C4', 'E4'], hornNotes: ['C4', 'E4', 'G4'] }, // I (C)
    { rootOffset: 5, padNotes: ['F3', 'C4', 'F4', 'A4'], hornNotes: ['F4', 'A4', 'C5'] }, // IV (F)
    { rootOffset: 7, padNotes: ['G3', 'D4', 'G4', 'B4'], hornNotes: ['G4', 'B4', 'D5'] }  // V (G)
  ];
  // arranca en -1: el primer tick de chordLoop lo sube a 0 (el I / C)
  let chordStep = -1;

  const bassSeq = new Tone.Sequence((time, hit) => {
    if (!hit) return;
    const chord = CHORD_PROGRESSION[Math.max(chordStep, 0)];
    const rootMidi = BASE_MIDI + chord.rootOffset - 24; // dos octavas abajo para el bajo
    const midi = hit === 'F' ? rootMidi + 7 : rootMidi;
    bass.triggerAttackRelease(midiToNote(midi), '8n', time, 0.75);
  }, BASS_PATTERN, '8n');

  const hornSeq = new Tone.Sequence((time, hit) => {
    if (!hit) return;
    const chord = CHORD_PROGRESSION[Math.max(chordStep, 0)];
    horns.triggerAttackRelease(chord.hornNotes, '16n', time, 0.55);
  }, HORN_PATTERN, '8n');

  const chordLoop = new Tone.Loop((time) => {
    // avanza la progresión ANTES de tocar, así el pad y los agentes
    // arrancan la nueva sección armónica exactamente juntos
    chordStep = (chordStep + 1) % CHORD_PROGRESSION.length;
    pad.triggerAttackRelease(CHORD_PROGRESSION[chordStep].padNotes, '1m', time, 0.35);
  }, '1m');

  function ensureStarted() {
    if (started) return;
    started = true;
    Tone.start();
    Tone.Transport.bpm.value = params.musicBpm;
    tamboraSeq.start(0);
    guiraSeq.start(0);
    bassSeq.start(0);
    hornSeq.start(0);
    chordLoop.start(0);
    Tone.Transport.start();
  }

  // targets de timbre por tipo de ventana — todo con rampTo, sin saltos bruscos
  function applyWindowTimbre(chain, node) {
    switch (node.windowType) {
      case 'trash':
        chain.dryGain.gain.rampTo(0, 0.4);
        break;
      case 'google':
        // desacoplado: suena lejano y amortiguado, como en otra pestaña
        chain.filter.frequency.rampTo(1000, 0.3);
        chain.panner.pan.rampTo(node.index % 2 === 0 ? -0.55 : 0.55, 0.3);
        chain.dryGain.gain.rampTo(0.5, 0.3);
        break;
      case 'files':
        // agrupado: brillante y centrado, casi "unísono" con sus compañeros de ventana
        chain.filter.frequency.rampTo(5400, 0.3);
        chain.panner.pan.rampTo(0, 0.3);
        chain.dryGain.gain.rampTo(0.85, 0.3);
        break;
      case 'player':
        // sincronía forzada: totalmente abierto, pegado a la pista de baile
        chain.filter.frequency.rampTo(7600, 0.15);
        chain.panner.pan.rampTo(0, 0.15);
        chain.dryGain.gain.rampTo(0.95, 0.15);
        break;
      default:
        chain.filter.frequency.rampTo(3400, 0.4);
        chain.panner.pan.rampTo(Math.sin(node.wrapper.position.x * 0.3) * 0.5, 0.4);
        chain.dryGain.gain.rampTo(0.8, 0.4);
    }
  }

  function noteForNode(node, stepIndex) {
    const rhythm = AGENT_RHYTHM[node.index];
    const pattern = MELODY_PATTERNS[node.index];
    const patternStep = pattern[stepIndex % pattern.length];

    let degree = SCALE_DEGREES[patternStep];
    if (node.windowType === 'google') degree = SCALE_DEGREES[(patternStep + 1) % SCALE_DEGREES.length]; // ligeramente "desconectado"
    if (node.windowType === 'files') degree = SCALE_DEGREES[0]; // todos los de "archivos" convergen a la fundamental del acorde actual
    if (node.windowType === 'player') degree = SCALE_DEGREES[stepIndex % 2 === 0 ? 0 : 2]; // groove simple y fijo

    // clamp defensivo: si chordStep aún no arrancó (antes del primer tick
    // de chordLoop) usa el acorde I por defecto
    const chord = CHORD_PROGRESSION[Math.max(chordStep, 0)];
    const midi = BASE_MIDI + chord.rootOffset + degree + rhythm.octave * 12;
    return midiToNote(midi);
  }

  function triggerLoopStep() {
    for (const node of nodes) {
      const chain = chains[node.index];
      if (!chain || node.windowType === 'trash') {
        if (chain) chain.dryGain.gain.rampTo(0, 0.4);
        continue;
      }

      applyWindowTimbre(chain, node);

      const rhythm = AGENT_RHYTHM[node.index];
      chain.stepCounter += 1;
      if (chain.stepCounter % rhythm.every !== 0) continue;

      // solo avanza el patrón melódico cuando el agente REALMENTE toca una
      // nota (no en cada 8n) — así el contorno se recorre a su propio ritmo
      chain.noteIndex += 1;

      const velocity = 0.32 + params.order * 0.25 + node.kick * 0.3;
      const note = noteForNode(node, chain.noteIndex);
      const duration = NOTE_DURATIONS[node.index] || '8n';
      try {
        chain.instrument.triggerAttackRelease(note, duration, undefined, Math.min(velocity, 1));
      } catch (err) {
        // Tone puede quejarse si el contexto no arrancó todavía; se ignora ese frame
      }
    }
  }

  const mainLoop = new Tone.Loop(() => triggerLoopStep(), '8n');
  mainLoop.start(0);

  // acento extra en el instante exacto del "beat" de Kuramoto (cruce de fase),
  // capado por el mismo bus con compresor/limitador para que nunca desbalancee la mezcla
  function triggerBeatAccent(node) {
    ensureStarted();
    const chain = chains[node.index];
    if (!chain || node.windowType === 'trash') return;
    try {
      chain.noteIndex += 1;
      const duration = NOTE_DURATIONS[node.index] || '8n';
      chain.instrument.triggerAttackRelease(noteForNode(node, chain.noteIndex), duration, undefined, 0.5 + params.order * 0.3);
    } catch (err) {
      // se ignora si el instrumento está en release
    }
  }

  function updateCollectiveState() {
    // el bombeo de masterGain lo maneja el sidechain de la tambora; aquí
    // solo se controla cuánta reverb entra según qué tan sincronizado
    // está el colectivo — más orden, más "unidos" suenan.
    groupReverb.wet.rampTo(0.26 + Math.min(0.42, params.order * 0.42), 0.5);
    // los metales se abren un poco cuando el colectivo está más sincronizado,
    // como si la sección de vientos se destapara al bailar todos juntos
    hornFilter.frequency.rampTo(2400 + params.order * 900, 0.5);

    // tempo controlable en vivo desde el Lab Panel
    if (started && Math.abs(params.musicBpm - lastBpm) > 0.5) {
      lastBpm = params.musicBpm;
      Tone.Transport.bpm.rampTo(params.musicBpm, 0.3);
    }
  }

  return { ensureStarted, triggerBeat: triggerBeatAccent, updateCollectiveState };
}


// ============================================================
// App principal
// ============================================================
async function main() {
  const mount = document.querySelector('#app');

  const scene = new THREE.Scene();
  // El canvas ahora vive por ENCIMA del escritorio (ver .sim-canvas en
  // styles.css), así que ya no puede tener un color de fondo sólido o
  // taparía los íconos/ventanas de abajo. El fondo del "escritorio" lo
  // pinta el CSS de body; el canvas queda transparente y solo se ven los
  // agentes.
  scene.background = null;

  const viewHeight = 9;
  let camera;
  function makeCamera() {
    const aspect = innerWidth / innerHeight;
    const viewWidth = viewHeight * aspect;
    camera = new THREE.OrthographicCamera(-viewWidth / 2, viewWidth / 2, viewHeight / 2, -viewHeight / 2, 0.1, 10);
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);
  }
  makeCamera();

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.domElement.classList.add('sim-canvas');
  mount.appendChild(renderer.domElement);

  const params = createParameters();
  const simulation = createSimulation({ scene, params, onBeat: (node) => soundEngine.triggerBeat(node) });
  const soundEngine = createSoundEngine(params, simulation.nodes, {
    onHat: (hit) => simulation.triggerHatShake(hit)
  });
  for (const node of simulation.nodes) node.core.userData.nodeIndex = node.index;

  const hud = document.createElement('div');
  hud.className = 'hud';
  document.body.append(hud);
  function updateHud() {
    hud.innerHTML = `<strong>DESKTOP / SINCRONÍA</strong><br>orden ${params.order.toFixed(2)} · K ${params.couplingStrength.toFixed(2)}`;
  }
  updateHud();

  function applyPreset(id) {
    if (id === 'calm') {
      params.couplingStrength = 0.8; params.noise = 0.12; params.phaseDrift = 0.2;
      hud.innerHTML = '<strong>💫 CALMA</strong><br>los espíritus respiran juntos';
    } else if (id === 'chaos') {
      params.couplingStrength = 0.3; params.noise = 0.42; params.phaseDrift = 0.8;
      hud.innerHTML = '<strong>⚡ CAOS</strong><br>cada uno sigue su propio ritmo';
    } else if (id === 'sync') {
      params.couplingStrength = 2.8; params.noise = 0.08; params.phaseDrift = 0.25;
      hud.innerHTML = '<strong>🔗 UNIÓN</strong><br>la red sincroniza perfecta';
    }
    simulation.reset();
    panel?.refresh();
  }

  let paused = false;
  function togglePause() {
    paused = !paused;
    if (paused) hud.innerHTML = '<strong>PAUSA</strong><br>reanudar desde el panel o con P';
  }

  const panel = createLabPanel({
    params,
    onReset: () => simulation.reset(),
    onPreset: applyPreset,
    onPauseChange: () => togglePause()
  });

  // --- arrastre de agentes con el cursor ---
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const groundPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  let draggingIndex = null;

  function screenToWorld(clientX, clientY) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hit = new THREE.Vector3();
    raycaster.ray.intersectPlane(groundPlane, hit);
    return hit;
  }

  function pickAgentAt(clientX, clientY) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(simulation.nodes.map((n) => n.core), true);
    return hits.length ? hits[0].object.userData.nodeIndex : null;
  }

  // Fase de captura: si el punto coincide con un agente, nos quedamos con el
  // gesto (el agente está "encima" de cualquier ventana); si no, el evento
  // sigue su curso normal y las ventanas manejan su propio arrastre/click.
  document.addEventListener('pointerdown', (e) => {
    soundEngine.ensureStarted();
    const index = pickAgentAt(e.clientX, e.clientY);
    if (index === null) return;
    e.stopPropagation();
    e.preventDefault();
    draggingIndex = index;
    simulation.startDrag(index);
  }, true);

  document.addEventListener('pointermove', (e) => {
    if (draggingIndex === null) return;
    const world = screenToWorld(e.clientX, e.clientY);
    simulation.updateDragPosition(draggingIndex, world.x, world.y);
  });

  document.addEventListener('pointerup', (e) => {
    if (draggingIndex === null) return;
    const drop = panel.getWindowAt(e.clientX, e.clientY);
    simulation.endDrag(draggingIndex, drop);
    draggingIndex = null;
  });

  // Doble click sobre un agente en una ventana = "desconexión" brusca
  // (mecanismo de perturbación explícito).
  document.addEventListener('dblclick', (e) => {
    const index = pickAgentAt(e.clientX, e.clientY);
    if (index === null) return;
    simulation.ejectFromWindow(index);
  });

  addEventListener('keydown', (e) => {
    if (e.repeat) return;
    if (e.code === 'KeyR') simulation.reset();
    if (e.code === 'KeyP') togglePause();
    if (e.code === 'Digit1') applyPreset('calm');
    if (e.code === 'Digit2') applyPreset('chaos');
    if (e.code === 'Digit3') applyPreset('sync');
  });

  addEventListener('resize', () => {
    makeCamera();
    renderer.setSize(innerWidth, innerHeight);
  });

  renderer.setAnimationLoop(() => {
    if (!paused) {
      simulation.stepSimulation();
      soundEngine.updateCollectiveState();
      updateHud();
    }
    renderer.render(scene, camera);
  });
}

main().catch((error) => {
  console.error(error);
  const pre = document.createElement('pre');
  pre.style.cssText = 'position:fixed;inset:16px;white-space:pre-wrap;color:#fff;z-index:9999';
  pre.textContent = String(error?.stack || error);
  document.body.append(pre);
});