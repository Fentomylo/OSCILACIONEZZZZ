import * as THREE from 'three';

// 8 personajes: nombre, color, ω_i (temperamento), forma base
const PERSONALITIES = [
  { name: 'Static-Tan', desc: 'nerviosa, reactiva',      color: '#70e6ff', omega: 1.8 },
  { name: 'Core-Tan',   desc: 'terco, estable',          color: '#88ffca', omega: 0.6 },
  { name: 'Mirror-Tan', desc: 'mimetiza vecinos',        color: '#ff9bd4', omega: 1.1 },
  { name: 'Signal-Tan', desc: 'errática, fricción',      color: '#ffb261', omega: 1.5 },
  { name: 'Petal',      desc: 'juguetona, ligera',       color: '#9fe5ff', omega: 1.3 },
  { name: 'Disko',      desc: 'analítica, hardware',     color: '#9fbcff', omega: 1.0 },
  { name: 'Pixel-Boy',  desc: 'observador, digital',     color: '#7af7d3', omega: 1.2 },
  { name: 'Moth',       desc: 'impulsiva, flotante',     color: '#d7a4ff', omega: 1.4 }
];

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

export function createSimulation({ scene, params, onBeat }) {
  const nodeCount = params.nodeCount;
  const nodes = [];

  const group = new THREE.Group();
  scene.add(group);

  function createAgentMesh(persona) {
    const wrapper = new THREE.Group();

    const core = new THREE.Mesh(
      new THREE.CircleGeometry(0.34, 40),
      new THREE.MeshBasicMaterial({ color: persona.color })
    );

    const glow = new THREE.Mesh(
      new THREE.CircleGeometry(0.55, 40),
      new THREE.MeshBasicMaterial({ color: persona.color, transparent: true, opacity: 0.18 })
    );
    glow.position.z = -0.01;

    // aro de "parlante" que se expande/contrae con el beat
    const halo = new THREE.Mesh(
      new THREE.RingGeometry(0.4, 0.46, 40),
      new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.55 })
    );
    halo.position.z = 0.01;

    // aro extra que marca "en ventana" (aparece solo cuando está dentro de una)
    const windowRing = new THREE.Mesh(
      new THREE.RingGeometry(0.6, 0.64, 40),
      new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0 })
    );
    windowRing.position.z = 0.02;

    wrapper.add(glow, core, halo, windowRing);
    return { wrapper, core, glow, halo, windowRing };
  }

  function createNode(index) {
    const persona = PERSONALITIES[index];
    const { wrapper, core, glow, halo, windowRing } = createAgentMesh(persona);
    group.add(wrapper);

    const startX = randomBetween(params.desktopBounds.minX, params.desktopBounds.maxX);
    const startY = randomBetween(params.desktopBounds.minY, params.desktopBounds.maxY);
    wrapper.position.set(startX, startY, 0);

    const node = {
      index,
      name: persona.name,
      desc: persona.desc,
      color: persona.color,
      omega: persona.omega,
      wrapper,
      core,
      glow,
      halo,
      windowRing,

      // --- fase (Kuramoto) ---
      cumPhase: randomBetween(-Math.PI, Math.PI), // fase SIN envolver, crece con el tiempo
      lastBeatCount: 0,

      // --- estado en el escritorio ---
      state: 'free',        // 'free' | 'dragging' | 'window'
      windowType: null,     // 'google' | 'files' | 'player' | 'trash' | 'paint' | 'gmail'
      windowId: null,       // id de la instancia de ventana concreta (para agrupar "files")
      wanderTarget: new THREE.Vector2(startX, startY),
      wanderTimer: randomBetween(0.5, params.wanderRetarget),

      // --- beat visual (impulso tipo parlante) ---
      kick: 0,

      // --- temblor por hi-hat (jitter de posición, independiente del kick de fase) ---
      hatKick: 0,
      shakeOffset: new THREE.Vector2(0, 0)
    };

    core.userData.nodeIndex = index;
    nodes.push(node);
  }

  function reset() {
    for (const node of nodes) {
      node.cumPhase = randomBetween(-Math.PI, Math.PI);
      node.lastBeatCount = 0;
      node.state = 'free';
      node.windowType = null;
      node.windowId = null;
      node.windowRing.material.opacity = 0;
      node.hatKick = 0;
      node.shakeOffset.set(0, 0);
      const x = randomBetween(params.desktopBounds.minX, params.desktopBounds.maxX);
      const y = randomBetween(params.desktopBounds.minY, params.desktopBounds.maxY);
      node.wrapper.position.set(x, y, 0);
      node.wanderTarget.set(x, y);
    }
    computeOrder();
  }

  function computeOrder() {
    // el parámetro de orden r ignora a los agentes en la Papelera (excluidos del sistema)
    let re = 0, im = 0, count = 0;
    for (const node of nodes) {
      if (node.windowType === 'trash') continue;
      re += Math.cos(node.cumPhase);
      im += Math.sin(node.cumPhase);
      count++;
    }
    params.order = count > 0 ? Number((Math.hypot(re, im) / count).toFixed(3)) : 0;
    params.orderPhase = count > 0 ? Math.atan2(im, re) : 0;
  }

  // --- Drag & drop desde el cursor ---

  function startDrag(index) {
    const node = nodes[index];
    if (!node) return;
    node.state = 'dragging';
    // evita que un temblor residual deje un offset fantasma mientras el
    // cursor tiene el control absoluto de la posición
    node.shakeOffset.set(0, 0);
  }

  function updateDragPosition(index, worldX, worldY) {
    const node = nodes[index];
    if (!node || node.state !== 'dragging') return;
    node.wrapper.position.x = worldX;
    node.wrapper.position.y = worldY;
  }

  // dropInfo: null (soltar en el escritorio libre) o { windowId, windowType }
  function endDrag(index, dropInfo) {
    const node = nodes[index];
    if (!node) return;

    if (dropInfo) {
      node.state = 'window';
      node.windowType = dropInfo.windowType;
      node.windowId = dropInfo.windowId;
      node.windowRing.material.opacity = 0.85;
      node.windowRing.material.color.set(
        dropInfo.windowType === 'trash' ? '#ff5c7a' : '#ffffff'
      );
    } else {
      node.state = 'free';
      node.windowType = null;
      node.windowId = null;
      node.windowRing.material.opacity = 0;
      node.wanderTarget.set(node.wrapper.position.x, node.wrapper.position.y);
    }
  }

  // Saca por la fuerza a un agente de su ventana actual (mecanismo de perturbación
  // explícito: simula "desconectarlo" bruscamente y se observa cómo reacciona el resto)
  function ejectFromWindow(index) {
    const node = nodes[index];
    if (!node || node.state !== 'window') return;
    // salto de fase brusco al momento de la desconexión
    node.cumPhase += randomBetween(-Math.PI, Math.PI);
    node.state = 'free';
    node.windowType = null;
    node.windowId = null;
    node.windowRing.material.opacity = 0;
  }

  // Impulso de temblor sincronizado con el hi-hat. Los golpes abiertos ('o')
  // sacuden más fuerte que los cerrados ('c'). Los agentes en la Papelera
  // están "silenciados" y no tiemblan.
  function triggerHatShake(hit) {
    const amount = hit === 'o' ? 1.0 : 0.6;
    for (const node of nodes) {
      if (node.windowType === 'trash') continue;
      node.hatKick = Math.min(1.4, node.hatKick + amount);
    }
  }

  // --- Movimiento solidario con la ventana ---
  function moveWindowAgents(windowId, deltaWorldX, deltaWorldY) {
    for (const node of nodes) {
      if (node.state === 'window' && node.windowId === windowId) {
        node.wrapper.position.x += deltaWorldX;
        node.wrapper.position.y += deltaWorldY;
        // Actualizamos también su objetivo de deambulación para que no intente
        // regresar al punto donde estaba la ventana antes de moverla
        node.wanderTarget.x += deltaWorldX;
        node.wanderTarget.y += deltaWorldY;
      }
    }
  }

  // --- Física por paso ---

  function stepWander(node, dt) {
    node.wanderTimer -= dt;
    if (node.wanderTimer <= 0) {
      node.wanderTarget.set(
        randomBetween(params.desktopBounds.minX, params.desktopBounds.maxX),
        randomBetween(params.desktopBounds.minY, params.desktopBounds.maxY)
      );
      node.wanderTimer = randomBetween(params.wanderRetarget * 0.5, params.wanderRetarget * 1.5);
    }
    const pos = node.wrapper.position;
    const dx = node.wanderTarget.x - pos.x;
    const dy = node.wanderTarget.y - pos.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 0.05) {
      const step = Math.min(dist, params.wanderSpeed * dt);
      pos.x += (dx / dist) * step;
      pos.y += (dy / dist) * step;
    }
  }

  function computeDelta(node) {
    // devuelve la variación de fase (dθ) para este paso, según su estado
    if (node.windowType === 'trash') return 0;

    if (node.windowType === 'google') {
      // desacoplado: solo su propio temperamento + ruido, sin K, sin vecinos
      const drift = params.phaseDrift * (node.omega - 1.0);
      const noise = (Math.random() - 0.5) * params.noise;
      return (drift + noise) * params.dt;
    }

    if (node.windowType === 'files') {
      // acople fuerte SOLO con quienes compartan la misma instancia de ventana
      const peers = nodes.filter(
        (n) => n !== node && n.windowType === 'files' && n.windowId === node.windowId
      );
      let sum = 0;
      for (const p of peers) sum += Math.sin(p.cumPhase - node.cumPhase);
      const effectiveK = peers.length > 0
        ? (params.couplingStrength * params.windowEffects.files.groupCouplingBoost * sum) / peers.length
        : 0;
      const drift = params.phaseDrift * (node.omega - 1.0);
      const noise = (Math.random() - 0.5) * params.noise * 0.4;
      return (drift + effectiveK + noise) * params.dt;
    }

    if (node.windowType === 'player') {
      // sincronía forzada por el metrónomo del reproductor
      const cfg = params.windowEffects.player;
      const pull = cfg.pullStrength * Math.sin(params.playerMetronomePhase - node.cumPhase);
      const drift = params.phaseDrift * (node.omega - 1.0) * 0.2;
      return (drift + pull) * params.dt;
    }

    if (node.windowType === 'paint') {
      // La cantidad de dibujo acelera su fase internamente
      const paintBoost = (params.paintDensity || 0) * 4.0;
      const drift = params.phaseDrift * (node.omega - 1.0 + paintBoost);
      const noise = (Math.random() - 0.5) * params.noise * 2.0;
      return (drift + noise) * params.dt;
    }

    if (node.windowType === 'gmail') {
      // Pulso rítmico fijo como un "ping" de correo
      const pulse = Math.sin(Date.now() * 0.003 * params.windowEffects.gmail.pulseFrequency);
      const drift = params.phaseDrift * node.omega + pulse * 0.5;
      return drift * params.dt;
    }

    // libre: Kuramoto de campo medio clásico — todos los agentes libres se
    // acoplan entre sí con la misma fuerza K (sin red de cables de por medio).
    let sum = 0, neighbors = 0;
    for (const other of nodes) {
      if (other === node || other.state === 'window') continue;
      neighbors++;
      sum += Math.sin(other.cumPhase - node.cumPhase);
    }
    const effectiveK = neighbors > 0 ? (params.couplingStrength * sum) / neighbors : 0;
    const drift = params.phaseDrift * (node.omega - 1.0);
    const noise = (Math.random() - 0.5) * params.noise;
    return (drift + effectiveK + noise) * params.dt;
  }

  function stepSimulation(dt = params.dt) {
    // metrónomo del reproductor avanza siempre, independiente del resto
    const bpm = params.windowEffects.player.beatBpm;
    params.playerMetronomePhase += (bpm / 60) * Math.PI * 2 * dt;

    for (const node of nodes) {
      // el offset de temblor se resta ANTES de mover al agente, así el wander/drag
      // siempre trabajan sobre su posición "real" y no sobre la sacudida visual
      node.wrapper.position.x -= node.shakeOffset.x;
      node.wrapper.position.y -= node.shakeOffset.y;

      if (node.state === 'dragging') continue; // el cursor manda mientras se arrastra

      if (node.state === 'free') stepWander(node, dt);

      const delta = computeDelta(node);
      node.cumPhase += delta;

      // --- detección de beat (cruce de ciclo completo) ---
      const beatCount = Math.floor(node.cumPhase / (Math.PI * 2));
      if (beatCount !== node.lastBeatCount && node.windowType !== 'trash') {
        node.lastBeatCount = beatCount;
        node.kick = 1.0;
        if (onBeat) onBeat(node);
      }

      // --- visual ---
      node.kick *= Math.exp(-params.beatKickDecay * dt);
      const scale = 1 + node.kick * params.beatKickScale;
      node.core.scale.setScalar(scale);
      node.glow.scale.setScalar(1 + node.kick * params.beatKickScale * 1.4);
      node.halo.scale.setScalar(1 + node.kick * params.beatKickScale * 0.6);
      node.halo.material.opacity = 0.25 + node.kick * 0.6;

      // --- temblor de hi-hat: jitter de posición que decae rápido, tipo "vibración" ---
      node.hatKick *= Math.exp(-params.hatShakeDecay * dt);
      if (node.hatKick > 0.01) {
        const mag = node.hatKick * params.hatShakeAmount;
        node.shakeOffset.set((Math.random() - 0.5) * 2 * mag, (Math.random() - 0.5) * 2 * mag);
      } else {
        node.shakeOffset.set(0, 0);
      }
      node.wrapper.position.x += node.shakeOffset.x;
      node.wrapper.position.y += node.shakeOffset.y;

      if (node.windowType === 'trash') {
        node.wrapper.visible = true;
        node.core.material.opacity = 0.25;
        node.glow.material.opacity = 0.04;
      } else {
        node.core.material.opacity = 1;
        node.glow.material.opacity = 0.18;
      }
    }

    computeOrder();
  }

  for (let i = 0; i < nodeCount; i++) createNode(i);
  reset();

  return {
    nodes,
    reset,
    stepSimulation,
    startDrag,
    updateDragPosition,
    endDrag,
    ejectFromWindow,
    triggerHatShake,
    moveWindowAgents, // <- Añadido para exponerlo a main.js
    get order() {
      return params.order;
    }
  };
}