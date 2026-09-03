import * as THREE from 'three';
import * as Tone from 'tone';
import './styles.css';

import { createParameters } from './simulation/parameters.js';
import { createSimulation } from './simulation/createSimulation.js';
import { createLabPanel } from './ui/labPanel.js';

// ============================================================
// Motor Generativo: Frutiger Aero OS + Efectos de Ventanas
// ============================================================

const AGENT_AMBIENTS = [
  { name: 'Static-Tan',  type: 'clair-arp', notes: ['Db5', 'F5', 'Ab5', 'C6', 'Db6'], vol: -10 },
  { name: 'Core-Tan',    type: 'debussy-pad', notes: [['Db4', 'F4', 'Ab4', 'C5'], ['Gb3', 'Bb3', 'Db4', 'F4']], vol: -12 },
  { name: 'Mirror-Tan',  type: 'crystal-bird', notes: ['Ab6', 'C7', 'Eb7', 'F7'], vol: -16 },
  { name: 'Signal-Tan',  type: 'water-bubble', notes: ['Db5', 'Ab5', 'F6'], vol: -13 },
  { name: 'Petal',       type: 'glass-chime', notes: ['F6', 'Ab6', 'C7'], vol: -14 },
  { name: 'Disko',       type: 'liquid-drop', notes: ['Db4', 'Ab4'], vol: -10 },
  { name: 'Pixel-Boy',   type: 'rainbow-lead', notes: ['Db5', 'F5', 'Ab5', 'Db6', 'Eb6'], vol: -12 },
  { name: 'Moth',        type: 'space-breeze', notes: ['Db4'], vol: -15 }
];

function buildAmbientSynth(config) {
  switch (config.type) {
    case 'clair-arp':
      return new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.02, decay: 0.6, sustain: 0.1, release: 0.8 },
        volume: config.vol
      });
    case 'debussy-pad':
      return new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 1.2, decay: 0.8, sustain: 0.7, release: 2.5 },
        volume: config.vol
      });
    case 'crystal-bird':
      return new Tone.FMSynth({
        harmonicity: 3.2, modulationIndex: 4,
        oscillator: { type: 'sine' }, modulation: { type: 'sine' },
        envelope: { attack: 0.005, decay: 0.15, sustain: 0, release: 0.1 },
        volume: config.vol
      });
    case 'water-bubble':
      return new Tone.FMSynth({
        harmonicity: 1.5, modulationIndex: 2,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.005, decay: 0.25, sustain: 0, release: 0.15 },
        volume: config.vol
      });
    case 'glass-chime':
      return new Tone.FMSynth({
        harmonicity: 4.0, modulationIndex: 2.5,
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.01, decay: 0.8, sustain: 0, release: 1.2 },
        volume: config.vol
      });
    case 'liquid-drop':
      return new Tone.MembraneSynth({
        pitchDecay: 0.015, octaves: 3.5,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.2 },
        volume: config.vol
      });
    case 'rainbow-lead':
      return new Tone.Synth({
        oscillator: { type: 'fatsine', count: 4, spread: 22 },
        envelope: { attack: 0.02, decay: 0.4, sustain: 0.3, release: 1.2 },
        volume: config.vol
      });
    case 'space-breeze':
    default:
      return new Tone.NoiseSynth({
        noise: { type: 'pink' },
        envelope: { attack: 2.0, decay: 1.5, sustain: 0.4, release: 2.5 },
        volume: config.vol
      });
  }
}

function createSoundEngine(params, nodes) {
  let started = false;

  const limiter = new Tone.Limiter(-0.8).toDestination();
  const masterGain = new Tone.Gain(0.9).connect(limiter);
  
  const aeroReverb = new Tone.Reverb({ decay: 7.5, wet: 0.55 }).connect(masterGain);
  const aeroDelay = new Tone.FeedbackDelay({ delayTime: '4n.', feedback: 0.35, wet: 0.25 }).connect(aeroReverb);
  const aeroChorus = new Tone.Chorus(3, 2.0, 0.5).connect(aeroDelay);

  // Efecto Chorus dedicado para la Galería de Fotos (multiplica el sonido como un coro rico)
  const galleryChorus = new Tone.Chorus({ frequency: 2.5, delayTime: 40, depth: 0.8, wet: 0.9 }).connect(aeroChorus);

  const chains = [];
  for (let i = 0; i < params.nodeCount; i++) {
    const config = AGENT_AMBIENTS[i];
    const instrument = buildAmbientSynth(config);
    const filter = new Tone.Filter(4500, 'lowpass');
    const panner = new Tone.Panner(0);
    const volumeNode = new Tone.Gain(0.85);

    if (config.type === 'space-breeze') {
      filter.type = 'bandpass';
      filter.frequency.value = 600;
      filter.Q.value = 1.0;
    }

    // Si está en la galería, pasa por galleryChorus; si no, directo al aeroChorus
    instrument.chain(filter, panner, volumeNode, aeroChorus);
    chains.push({ instrument, filter, panner, volumeNode, config, noteCounter: 0, inGallery: false });
  }

  async function ensureStarted() {
    if (!started) {
      await Tone.start();
      started = true;
    }
  }

  // Actualizador continuo de filtros y enrutamiento
  setInterval(() => {
    if (!started) return;
    for (const node of nodes) {
      const chain = chains[node.index];
      if (!chain) continue;

      const screenNormX = Math.max(-1, Math.min(1, node.wrapper.position.x / 7.0));
      chain.panner.pan.rampTo(screenNormX, 0.1);

      const inGalleryNow = (node.windowType === 'gallery');
      if (inGalleryNow !== chain.inGallery) {
        chain.inGallery = inGalleryNow;
        chain.instrument.disconnect();
        if (inGalleryNow) {
          chain.instrument.chain(chain.filter, chain.panner, chain.volumeNode, galleryChorus);
        } else {
          chain.instrument.chain(chain.filter, chain.panner, chain.volumeNode, aeroChorus);
        }
      }

      if (node.state === 'dragging') {
        chain.volumeNode.gain.rampTo(1.6, 0.1);
        chain.filter.frequency.rampTo(12000, 0.1);
        continue;
      }

      switch (node.windowType) {
        case 'trash':
          chain.volumeNode.gain.rampTo(0, 0.2); 
          break;
        case 'google':
          chain.volumeNode.gain.rampTo(0.35, 0.2);
          chain.filter.frequency.rampTo(800, 0.2); 
          break;
        case 'files':
          chain.volumeNode.gain.rampTo(1.1, 0.2);
          chain.filter.frequency.rampTo(3200, 0.2); 
          break;
        case 'player':
          chain.volumeNode.gain.rampTo(1.4, 0.2);
          chain.filter.frequency.rampTo(9000, 0.2); 
          break;
        case 'paint':
          chain.volumeNode.gain.rampTo(1.2, 0.2);
          // Modulamos la frecuencia del filtro del agente basado en cuánto hay pintado en el canvas
          chain.filter.frequency.rampTo(2000 + (params.paintDensity || 0) * 8000, 0.2);
          break;
        case 'gmail':
          chain.volumeNode.gain.rampTo(1.0, 0.2);
          chain.filter.frequency.rampTo(5000, 0.2);
          break;
        case 'gallery':
          chain.volumeNode.gain.rampTo(1.5, 0.2); // Más presencia y riqueza coral en la galería del perro
          chain.filter.frequency.rampTo(10000, 0.2);
          break;
        case 'messenger':
          chain.volumeNode.gain.rampTo(0.9, 0.2);
          chain.filter.frequency.rampTo(4000, 0.2);
          break;
        default: 
          chain.volumeNode.gain.rampTo(0.85, 0.2);
          chain.filter.frequency.rampTo(chain.config.type === 'space-breeze' ? 600 : 4500, 0.2);
          break;
      }
    }
  }, 100);

  function triggerBeatAccent(node) {
    ensureStarted();
    const chain = chains[node.index];
    if (!chain || node.windowType === 'trash') return;

    chain.noteCounter++;
    const config = chain.config;
    // Si está en la galería, se realza el volumen para acentuar el efecto chorus múltiple
    const velocityMultiplier = (node.windowType === 'gallery') ? 1.3 : 1.0;
    const velocity = node.state === 'dragging' ? 1.0 : Math.min((0.4 + params.order * 0.5 + node.kick * 0.3) * velocityMultiplier, 1.0);

    try {
      if (config.type === 'space-breeze') {
        chain.instrument.triggerAttackRelease('1m', undefined, velocity);
      } else if (config.type === 'debussy-pad') {
        const chord = config.notes[chain.noteCounter % config.notes.length];
        chain.instrument.triggerAttackRelease(chord, '1m', undefined, velocity * 0.55);
      } else if (config.type === 'crystal-bird') {
        const note1 = config.notes[chain.noteCounter % config.notes.length];
        const note2 = config.notes[(chain.noteCounter + 1) % config.notes.length];
        const now = Tone.now();
        chain.instrument.triggerAttackRelease(note1, '32n', now, velocity);
        chain.instrument.triggerAttackRelease(note2, '32n', now + 0.07, velocity * 0.7);
      } else if (config.type === 'water-bubble') {
        const note = config.notes[chain.noteCounter % config.notes.length];
        chain.instrument.detune.value = (Math.random() - 0.5) * 80;
        chain.instrument.triggerAttackRelease(note, '16n', undefined, velocity);
      } else {
        const note = config.notes[chain.noteCounter % config.notes.length];
        chain.instrument.triggerAttackRelease(note, '8n', undefined, velocity);
      }
    } catch (e) {}
  }

  function updateCollectiveState() {
    aeroReverb.wet.rampTo(0.35 + params.order * 0.45, 0.5);
    aeroDelay.feedback.rampTo(0.15 + params.order * 0.35, 0.5);
  }

  return { ensureStarted, triggerBeat: triggerBeatAccent, updateCollectiveState };
}

// ============================================================
// App Principal
// ============================================================
async function main() {
  const mount = document.querySelector('#app');
  const scene = new THREE.Scene();
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
  const soundEngine = createSoundEngine(params, simulation.nodes);
  
  for (const node of simulation.nodes) node.core.userData.nodeIndex = node.index;

  const hud = document.createElement('div');
  hud.className = 'hud';
  document.body.append(hud);
  function updateHud() {
    let estadoTexto = '⚡ DESORDEN';
    if (params.order >= 0.7) {
      estadoTexto = '🔗 ORGANIZACIÓN ESTABLE';
    } else if (params.order >= 0.35) {
      estadoTexto = '💫 ORGANIZACIÓN PARCIAL';
    }
    hud.innerHTML = `<strong>FRUTIGER AERO OS</strong><br>Estado: ${estadoTexto}<br>Orden (r): ${params.order.toFixed(2)} · K: ${params.couplingStrength.toFixed(2)}`;
  }
  updateHud();

  function applyPreset(id) {
    if (id === 'calm') {
      params.couplingStrength = 0.9; params.noise = 0.10; params.phaseDrift = 0.2; params.dt = 0.03;
    } else if (id === 'chaos') {
      params.couplingStrength = 0.2; params.noise = 0.45; params.phaseDrift = 0.85; params.dt = 0.04;
    } else if (id === 'sync') {
      params.couplingStrength = 3.2; params.noise = 0.05; params.phaseDrift = 0.15; params.dt = 0.05;
    }
    simulation.reset();
    panel?.refresh();
  }

  let paused = false;
  function togglePause() {
    paused = !paused;
  }

  const panel = createLabPanel({
    params,
    onReset: () => simulation.reset(),
    onPreset: applyPreset,
    onPauseChange: () => togglePause(),
    // Convertimos los píxeles arrastrados a unidades mundiales del motor 3D
    onWindowMove: (windowId, dxPixels, dyPixels) => {
      const aspect = innerWidth / innerHeight;
      const viewWidth = viewHeight * aspect;
      const worldDx = (dxPixels / innerWidth) * viewWidth;
      const worldDy = -(dyPixels / innerHeight) * viewHeight;
      simulation.moveWindowAgents(windowId, worldDx, worldDy);
    }
  });

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

  document.addEventListener('pointerdown', async (e) => {
    await soundEngine.ensureStarted();
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

main().catch(console.error);