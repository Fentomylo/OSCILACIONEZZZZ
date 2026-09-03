import * as THREE from 'three';

// 8 personajes: nombre, color, ω_i (temperamento), forma base, y un estilo
// de movimiento propio (move.style) que hace que el rasgo descrito en "desc"
// se note en cómo deambulan, no solo en su omega o en su timbre.
//
// shape.type controla la silueta 2D (ver buildAgentGeometry):
//   'star'    -> polígono con picos afilados (nerviosismo)
//   'hex'     -> hexágono sólido y grande (peso/estabilidad)
//   'ring'    -> anillo hueco (refleja/deja ver lo que hay detrás)
//   'blob'    -> silueta orgánica con lóbulos irregulares
//   'petal'   -> flor de lóbulos suaves y redondeados
//   'diamond' -> rombo (geometría precisa, "de circuito")
//   'square'  -> cuadrado alineado a los ejes ("píxel")
//
// move.style controla cómo elige y persigue su destino de deambulación
// (ver stepWander): 'jittery', 'anchor', 'mimic', 'erratic', 'floaty',
// 'gridSnap', 'idleJump', 'impulsive'.
// Paleta repensada: colores "neón-Aero" muy saturados, repartidos lejos
// entre sí en el círculo cromático (cian, verde, magenta, naranja,
// amarillo, índigo, turquesa, violeta) para que ningún par de agentes
// comparta familia de color, y para que ninguno caiga en los mismos
// tonos pastel azul/celeste/verde-agua que domina el wallpaper. El
// contraste real contra el fondo, sin embargo, lo da sobre todo el
// contorno oscuro tipo "sticker" que se agrega en createAgentMesh.
const PERSONALITIES = [
  {
    name: 'Static-Tan', desc: 'nerviosa, reactiva', color: '#00eaff', omega: 1.8,
    shape: { type: 'star', radius: 0.28, lobes: 10, amp: 0.55, power: 5 },
    move: { speedMult: 1.0, retargetMult: 0.55, style: 'jittery' }
  },
  {
    name: 'Core-Tan', desc: 'terco, estable', color: '#33ff85', omega: 0.6,
    shape: { type: 'hex', radius: 0.40 },
    move: { speedMult: 0.35, retargetMult: 2.4, style: 'anchor' }
  },
  {
    name: 'Mirror-Tan', desc: 'mimetiza vecinos', color: '#ff2d9e', omega: 1.1,
    shape: { type: 'ring', radius: 0.34 },
    move: { speedMult: 0.9, retargetMult: 1.0, style: 'mimic' }
  },
  {
    name: 'Signal-Tan', desc: 'errática, fricción', color: '#ff7a1a', omega: 1.5,
    shape: { type: 'blob', radius: 0.30, lobes: 5, amp: 0.42, power: 3, jitter: 2.7 },
    move: { speedMult: 1.15, retargetMult: 0.35, style: 'erratic' }
  },
  {
    name: 'Petal', desc: 'juguetona, ligera', color: '#ffd93d', omega: 1.3,
    shape: { type: 'petal', radius: 0.26, lobes: 5, amp: 0.32, power: 1.3 },
    move: { speedMult: 1.35, retargetMult: 0.65, style: 'floaty' }
  },
  {
    name: 'Disko', desc: 'analítica, hardware', color: '#7a5cff', omega: 1.0,
    shape: { type: 'diamond', radius: 0.32 },
    move: { speedMult: 1.0, retargetMult: 1.0, style: 'gridSnap' }
  },
  {
    name: 'Pixel-Boy', desc: 'observador, digital', color: '#00ffc2', omega: 1.2,
    shape: { type: 'square', radius: 0.30 },
    move: { speedMult: 1.0, retargetMult: 3.2, style: 'idleJump' }
  },
  {
    name: 'Moth', desc: 'impulsiva, flotante', color: '#c86bff', omega: 1.4,
    shape: { type: 'blob', radius: 0.31, lobes: 3, amp: 0.26, power: 1.4, jitter: 0 },
    move: { speedMult: 1.0, retargetMult: 0.9, style: 'impulsive' }
  }
];

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

// Construye un polígono relleno (triangle-fan) cuyo radio varía con el ángulo,
// según lobes/amp/power. Con amp=0 da un círculo liso; con amp alto y power
// alto da picos afilados (estrella); con power bajo da lóbulos redondeados
// (flor); con "jitter" se agrega una silueta irregular fija (no aleatoria
// cuadro a cuadro, para que el contorno se vea "orgánico" pero estable).
function buildRadialGeometry(baseRadius, { lobes = 5, amp = 0.3, power = 2, segments = 64, jitter = 0 } = {}) {
  const verts = [];
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    let r = baseRadius * (1 + amp * Math.pow(Math.abs(Math.sin((lobes * t) / 2)), power));
    if (jitter) {
      r *= 1 + 0.12 * Math.sin(t * 7 + jitter) + 0.06 * Math.sin(t * 13 + jitter * 2);
    }
    verts.push([Math.cos(t) * r, Math.sin(t) * r]);
  }
  const positions = [];
  for (let i = 0; i < segments; i++) {
    positions.push(0, 0, 0);
    positions.push(verts[i][0], verts[i][1], 0);
    positions.push(verts[i + 1][0], verts[i + 1][1], 0);
  }
  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  return geom;
}

// Traduce shape.type a una geometría concreta. Los polígonos regulares
// (hex/diamond/square) se resuelven con un CircleGeometry de pocos lados,
// que en three.js ya da un polígono recto (no suavizado).
function buildAgentGeometry(shape) {
  const r = shape.radius;
  switch (shape.type) {
    case 'ring':
      return new THREE.RingGeometry(r * 0.52, r, 48);
    case 'hex':
      return new THREE.CircleGeometry(r, 6);
    case 'diamond':
      return new THREE.CircleGeometry(r, 4);
    case 'square':
      return new THREE.CircleGeometry(r, 4); // se rota 45° al crear el mesh
    case 'star':
    case 'petal':
    case 'blob':
      return buildRadialGeometry(r, shape);
    default:
      return new THREE.CircleGeometry(r, 40);
  }
}

// --- Vestuario "más Frutiger Aero / más slay" ------------------------------
// La forma + el contorno negro grueso (outline, arriba) siguen siendo la
// base que hace reconocible a cada agente; todo esto de aquí es capas
// EXTRA encima: un aura difuminada tipo burbuja de cristal, un filo con luz
// (bisel), un brillo grande suave (además del destello duro que ya había) y
// unos destellitos que titilan. three.js no difumina formas planas solo, así
// que el degradado del aura/brillo se "hornea" una sola vez en un canvas y
// se reusa como textura en todos los agentes.
let _radialTexture = null;
function getRadialTexture() {
  if (_radialTexture) return _radialTexture;
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.4, 'rgba(255,255,255,0.65)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  _radialTexture = new THREE.CanvasTexture(canvas);
  return _radialTexture;
}

// Geometría de destello (4 puntas finas, tipo brillito Y2K/aero), compartida
// entre todos los agentes: cada instancia solo cambia opacidad/escala/giro.
const SPARKLE_GEOMETRY = buildRadialGeometry(1, { lobes: 4, amp: 0.9, power: 0.35, segments: 32 });

// Versión "con luz encima" de un color, para el filo/bisel entre el contorno
// oscuro y el núcleo — como el borde iluminado de un botón/orbe de cristal.
function lightenColor(hex, amount) {
  const c = new THREE.Color(hex);
  const hsl = {};
  c.getHSL(hsl);
  c.setHSL(hsl.h, Math.max(0.35, hsl.s * 0.85), Math.min(0.92, hsl.l + amount));
  return c;
}

export function createSimulation({ scene, params, onBeat }) {
  const nodeCount = params.nodeCount;
  const nodes = [];
  let simTime = 0;

  const group = new THREE.Group();
  scene.add(group);

  function createAgentMesh(persona) {
    const wrapper = new THREE.Group();
    const shape = persona.shape;
    const r = shape.radius;
    const isSquareLike = shape.type === 'square';

    // Sombra proyectada: elipse oscura y aplastada, siempre circular sin
    // importar la silueta (así se lee como "sombra" y no como parte del
    // cuerpo). Ancla al agente sobre la foto de fondo, dándole volumen
    // como si fuera un sticker/figurita pegada encima del escritorio.
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(r * 1.05, 28),
      new THREE.MeshBasicMaterial({ color: '#001018', transparent: true, opacity: 0.34 })
    );
    shadow.scale.set(1, 0.55, 1);
    shadow.position.set(r * 0.16, -r * 0.6, -0.03);

    const glow = new THREE.Mesh(
      buildAgentGeometry({ ...shape, radius: r * 1.75 }),
      new THREE.MeshBasicMaterial({ color: persona.color, transparent: true, opacity: 0.2 })
    );
    if (isSquareLike) glow.rotation.z = Math.PI / 4;
    glow.position.z = -0.02;

    // Aura difuminada tipo burbuja de cristal: circular siempre (no sigue la
    // silueta, es atmósfera detrás del personaje), con caída suave gracias a
    // la textura radial — el "glow" de arriba ya cubre la lectura de forma.
    const aura = new THREE.Mesh(
      new THREE.PlaneGeometry(r * 3.4, r * 3.4),
      new THREE.MeshBasicMaterial({
        map: getRadialTexture(),
        color: persona.color,
        transparent: true,
        opacity: 0.32,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    aura.position.z = -0.024;

    // Contorno tipo "sticker": copia opaca, casi negra, ligeramente más
    // grande que el núcleo, detrás de él. Es el truco principal para que
    // CADA agente se separe del wallpaper sin importar qué colores tenga
    // detrás (agua, cielo, follaje...): siempre hay un borde oscuro que
    // corta la silueta contra cualquier fondo.
    const outline = new THREE.Mesh(
      buildAgentGeometry({ ...shape, radius: r * 1.2 }),
      new THREE.MeshBasicMaterial({ color: '#03121c', transparent: true, opacity: 1 })
    );
    if (isSquareLike) outline.rotation.z = Math.PI / 4;
    outline.position.z = -0.006;

    // Filo/bisel: un anillo fino de un tono más claro del propio color,
    // justo entre el contorno oscuro y el núcleo — como el borde iluminado
    // de un botón/orbe de cristal Aero, en vez de pasar de golpe de negro a
    // color plano.
    const rim = new THREE.Mesh(
      buildAgentGeometry({ ...shape, radius: r * 1.08 }),
      new THREE.MeshBasicMaterial({ color: lightenColor(persona.color, 0.22), transparent: true, opacity: 0.9 })
    );
    if (isSquareLike) rim.rotation.z = Math.PI / 4;
    rim.position.z = -0.003;

    const core = new THREE.Mesh(
      buildAgentGeometry(shape),
      new THREE.MeshBasicMaterial({ color: persona.color })
    );
    if (isSquareLike) core.rotation.z = Math.PI / 4; // cuadrado alineado a los ejes

    // Brillo grande y suave (además del destello duro de abajo): una
    // elipse difuminada arriba-izquierda, como el barrido de luz sobre un
    // botón de cristal Aero. La elipse se logra estirando el plano (la
    // textura en sí es un círculo perfecto) y el giro la deja diagonal.
    const sheen = new THREE.Mesh(
      new THREE.PlaneGeometry(r * 1.5, r * 1.1),
      new THREE.MeshBasicMaterial({
        map: getRadialTexture(),
        color: '#ffffff',
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    sheen.position.set(-r * 0.32, r * 0.34, 0.004);
    sheen.rotation.z = 0.4;

    // Brillo "glossy" tipo botón/orbe Frutiger Aero: resalte blanco chico
    // arriba-izquierda del núcleo, como el bevel de luz de los íconos XP.
    const gloss = new THREE.Mesh(
      new THREE.CircleGeometry(r * 0.32, 18),
      new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.55 })
    );
    gloss.scale.set(1, 0.82, 1);
    gloss.position.set(-r * 0.3, r * 0.32, 0.006);

    // Destellitos: 2 brillitos de 4 puntas que titilan de forma
    // independiente (fase/velocidad propias) — el toque "slay" encima de
    // todo lo demás, sutil y esporádico, no un parpadeo constante.
    const sparkleDefs = [
      { ox: r * 0.55, oy: r * 0.5, size: r * 0.16, speed: 2.4, phase: Math.random() * Math.PI * 2 },
      { ox: -r * 0.15, oy: -r * 0.42, size: r * 0.11, speed: 1.7, phase: Math.random() * Math.PI * 2 }
    ];
    const sparkles = sparkleDefs.map((d) => {
      const mesh = new THREE.Mesh(
        SPARKLE_GEOMETRY,
        new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0 })
      );
      mesh.scale.setScalar(d.size);
      mesh.position.set(d.ox, d.oy, 0.008);
      mesh.userData.speed = d.speed;
      mesh.userData.phase = d.phase;
      return mesh;
    });

    // aro de "parlante" que se expande/contrae con el beat (siempre circular:
    // es una señal universal de pulso, no parte de la silueta del personaje)
    const halo = new THREE.Mesh(
      new THREE.RingGeometry(r * 1.15, r * 1.32, 40),
      new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.55 })
    );
    halo.position.z = 0.012;

    // aro extra que marca "en ventana" (aparece solo cuando está dentro de una)
    const windowRing = new THREE.Mesh(
      new THREE.RingGeometry(r * 1.75, r * 1.88, 40),
      new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0 })
    );
    windowRing.position.z = 0.02;

    wrapper.add(shadow, aura, glow, outline, rim, core, sheen, gloss, ...sparkles, halo, windowRing);
    return { wrapper, core, glow, halo, windowRing, outline, gloss, shadow, aura, rim, sheen, sparkles };
  }

  function createNode(index) {
    const persona = PERSONALITIES[index];
    const { wrapper, core, glow, halo, windowRing, outline, gloss, shadow, aura, rim, sheen, sparkles } = createAgentMesh(persona);
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
      outline,
      gloss,
      shadow,
      aura,
      rim,
      sheen,
      sparkles,

      // --- fase (Kuramoto) ---
      cumPhase: randomBetween(-Math.PI, Math.PI), // fase SIN envolver, crece con el tiempo
      lastBeatCount: 0,

      // --- estado en el escritorio ---
      state: 'free',        // 'free' | 'dragging' | 'window'
      windowType: null,     // 'google' | 'files' | 'player' | 'trash' | 'paint' | 'gmail'
      windowId: null,       // id de la instancia de ventana concreta (para agrupar "files")
      minimized: false,     // true si su ventana está minimizada: se esconde y se pausa,
                             // pero conserva windowType/windowId para reaparecer igual
      wanderTarget: new THREE.Vector2(startX, startY),
      wanderTimer: randomBetween(0.5, params.wanderRetarget),

      // --- identidad de movimiento propia (ver stepWander / computePersonalityOffset) ---
      move: persona.move,
      shape: persona.shape,
      floatPhase: randomBetween(0, Math.PI * 2),
      personalityOffset: new THREE.Vector2(0, 0),

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
      node.minimized = false;
      node.wrapper.visible = true;
      node.windowRing.material.opacity = 0;
      node.hatKick = 0;
      node.shakeOffset.set(0, 0);
      node.personalityOffset.set(0, 0);
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
    // evita que un temblor/flote residual deje un offset fantasma mientras el
    // cursor tiene el control absoluto de la posición
    node.shakeOffset.set(0, 0);
    node.personalityOffset.set(0, 0);
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

  // Cuando una ventana se CIERRA para siempre: cualquier agente que hubiera
  // quedado adentro se libera y vuelve a deambular con normalidad, en vez de
  // quedarse congelado en el punto donde estaba la ventana.
  function ejectWindowAgents(windowId) {
    if (!windowId) return;
    for (const node of nodes) {
      if (node.windowId !== windowId) continue;
      node.cumPhase += randomBetween(-Math.PI, Math.PI);
      node.state = 'free';
      node.windowType = null;
      node.windowId = null;
      node.minimized = false;
      node.wrapper.visible = true;
      node.windowRing.material.opacity = 0;
      node.wanderTarget.set(node.wrapper.position.x, node.wrapper.position.y);
    }
  }

  // Cuando una ventana se MINIMIZA: los agentes que están adentro se
  // esconden y se pausan junto con ella (no avanzan de fase ni se mueven),
  // pero SIN perder su windowType/windowId — así, al restaurar la ventana,
  // reaparecen exactamente en el mismo estado de acople en el que quedaron.
  function setWindowAgentsMinimized(windowId, minimized) {
    if (!windowId) return;
    for (const node of nodes) {
      if (node.windowId !== windowId) continue;
      node.minimized = minimized;
      node.wrapper.visible = !minimized;
    }
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

  // Cada personalidad elige y persigue su destino de deambulación de forma
  // distinta (move.style), para que el rasgo descrito en PERSONALITIES se
  // note en el comportamiento y no solo en omega o en el timbre:
  //
  //  jittery   (Static-Tan) : retargeting rápido + temblor constante (ver computePersonalityOffset)
  //  anchor    (Core-Tan)   : muy lenta y con destinos que casi no cambian -> "terca, estable"
  //  mimic     (Mirror-Tan) : su próximo destino se acerca al de sus vecinos libres -> "mimetiza"
  //  erratic   (Signal-Tan) : la velocidad fluctúa cuadro a cuadro (fricción) + retargeting muy frecuente
  //  floaty    (Petal)      : deambula rápido y ligero, con vaivén vertical suave
  //  gridSnap  (Disko)      : sus destinos se ajustan a una grilla -> movimiento "digital", preciso
  //  idleJump  (Pixel-Boy)  : casi no se mueve, y cuando lo hace "salta" en vez de desplazarse
  //  impulsive (Moth)       : ráfagas rápidas justo tras elegir destino, luego flota
  function stepWander(node, dt, nodes) {
    const move = node.move;
    const style = move.style;

    node.wanderTimer -= dt;
    if (node.wanderTimer <= 0) {
      let tx, ty;

      if (style === 'mimic') {
        const free = nodes.filter((n) => n !== node && n.state === 'free');
        if (free.length > 0) {
          free.sort(
            (a, b) =>
              node.wrapper.position.distanceTo(a.wrapper.position) -
              node.wrapper.position.distanceTo(b.wrapper.position)
          );
          const near = free.slice(0, Math.min(2, free.length));
          let avgX = 0, avgY = 0;
          for (const n of near) { avgX += n.wrapper.position.x; avgY += n.wrapper.position.y; }
          avgX /= near.length; avgY /= near.length;
          tx = avgX + randomBetween(-1.2, 1.2);
          ty = avgY + randomBetween(-1.2, 1.2);
        } else {
          tx = randomBetween(params.desktopBounds.minX, params.desktopBounds.maxX);
          ty = randomBetween(params.desktopBounds.minY, params.desktopBounds.maxY);
        }
      } else {
        tx = randomBetween(params.desktopBounds.minX, params.desktopBounds.maxX);
        ty = randomBetween(params.desktopBounds.minY, params.desktopBounds.maxY);
      }

      if (style === 'gridSnap') {
        const grid = 0.6;
        tx = Math.round(tx / grid) * grid;
        ty = Math.round(ty / grid) * grid;
      }

      tx = Math.min(params.desktopBounds.maxX, Math.max(params.desktopBounds.minX, tx));
      ty = Math.min(params.desktopBounds.maxY, Math.max(params.desktopBounds.minY, ty));

      node.wanderTarget.set(tx, ty);
      const baseRetarget = params.wanderRetarget * move.retargetMult;
      node.wanderTimer = randomBetween(baseRetarget * 0.5, baseRetarget * 1.5);
      node.justRetargeted = 0.6; // ventana corta para la ráfaga impulsiva de Moth
    }

    if (node.justRetargeted !== undefined && node.justRetargeted > 0) {
      node.justRetargeted -= dt;
    }

    if (style === 'idleJump') {
      // Pixel-Boy: no se desplaza de forma continua, "salta" directo al destino
      const dist = Math.hypot(node.wanderTarget.x - node.wrapper.position.x, node.wanderTarget.y - node.wrapper.position.y);
      if (dist > 0.05) {
        node.wrapper.position.x = node.wanderTarget.x;
        node.wrapper.position.y = node.wanderTarget.y;
      }
      return;
    }

    const pos = node.wrapper.position;
    const dx = node.wanderTarget.x - pos.x;
    const dy = node.wanderTarget.y - pos.y;
    const dist = Math.hypot(dx, dy);

    let speed = params.wanderSpeed * move.speedMult;
    if (style === 'erratic') {
      // Signal-Tan: fricción -> velocidad que fluctúa bruscamente en vez de constante
      speed *= 0.35 + Math.random() * 1.4;
    }
    if (style === 'impulsive' && node.justRetargeted > 0) {
      // Moth: ráfaga impulsiva justo después de elegir nuevo destino
      speed *= 2.4;
    }

    if (dist > 0.05) {
      const step = Math.min(dist, speed * dt);
      pos.x += (dx / dist) * step;
      pos.y += (dy / dist) * step;
    }
  }

  // Pequeño offset de posición (además del temblor por hi-hat) propio de cada
  // personalidad: Static-Tan tiembla todo el tiempo (nerviosa), Petal/Moth
  // flotan con un vaivén vertical (ligera/flotante). El resto no se mueve por
  // esta vía y depende solo de stepWander.
  function computePersonalityOffset(node, t) {
    if (node.windowType === 'trash') return { x: 0, y: 0 };
    const style = node.move.style;

    if (style === 'jittery') {
      const amt = 0.016 + node.kick * 0.018;
      return { x: (Math.random() - 0.5) * 2 * amt, y: (Math.random() - 0.5) * 2 * amt };
    }
    if (style === 'floaty' || style === 'impulsive') {
      const amp = style === 'impulsive' ? 0.07 : 0.05;
      const freq = style === 'impulsive' ? 1.1 : 1.6;
      return { x: 0, y: Math.sin(t * freq + node.floatPhase) * amp };
    }
    return { x: 0, y: 0 };
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
      // El agente "lee" el dibujo en vez de solo reaccionar a cuánta tinta
      // hay: la posición X de lo último dibujado define una fase objetivo
      // que persigue (igual mecanismo que el metrónomo del Reproductor,
      // pero guiado por el trazo en vez de un tempo fijo) — así se nota que
      // sigue el dibujo, en lugar de agitarse igual sin importar qué se
      // dibuje. Más colores usados = persecución más firme (más "voces"
      // tirando de él). Un trazo delgado y suelto (línea, garabato) lo deja
      // inquieto; una forma sólida y rellena (fillRatio alto) lo calma.
      const p = params.paint;
      const targetPhase = (p.nx * 2 - 1) * Math.PI;
      const pull = (0.5 + Math.min(p.colorCount, 4) * 0.18) * Math.sin(targetPhase - node.cumPhase);
      const restlessness = 1 - p.fillRatio;
      const drift = params.phaseDrift * (node.omega - 1.0) * (0.3 + restlessness * 0.6);
      const noise = (Math.random() - 0.5) * params.noise * (0.35 + restlessness * 0.5);
      return (drift + pull + noise) * params.dt;
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
    simTime += dt;

    // metrónomo del reproductor avanza siempre, independiente del resto
    const bpm = params.windowEffects.player.beatBpm;
    params.playerMetronomePhase += (bpm / 60) * Math.PI * 2 * dt;

    for (const node of nodes) {
      // agente escondido porque su ventana está minimizada: no avanza fase,
      // no se mueve, no laten sus mallas — queda en pausa hasta que la
      // ventana se restaure (ver setWindowAgentsMinimized)
      if (node.minimized) continue;

      // los offsets de temblor/flote se restan ANTES de mover al agente, así
      // el wander/drag siempre trabajan sobre su posición "real" y no sobre
      // la sacudida o el vaivén visual
      node.wrapper.position.x -= node.shakeOffset.x + node.personalityOffset.x;
      node.wrapper.position.y -= node.shakeOffset.y + node.personalityOffset.y;

      if (node.state === 'dragging') continue; // el cursor manda mientras se arrastra

      if (node.state === 'free') stepWander(node, dt, nodes);

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
      node.outline.scale.setScalar(scale);
      node.rim.scale.setScalar(scale);
      node.gloss.scale.set(scale, scale * 0.82, 1);
      node.sheen.scale.setScalar(1 + node.kick * params.beatKickScale * 0.5);
      node.glow.scale.setScalar(1 + node.kick * params.beatKickScale * 1.4);
      node.aura.scale.setScalar(1 + node.kick * params.beatKickScale * 1.6);
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

      const pOffset = computePersonalityOffset(node, simTime);
      node.personalityOffset.set(pOffset.x, pOffset.y);

      node.wrapper.position.x += node.shakeOffset.x + node.personalityOffset.x;
      node.wrapper.position.y += node.shakeOffset.y + node.personalityOffset.y;

      if (node.windowType === 'trash') {
        node.wrapper.visible = true;
        node.core.material.opacity = 0.25;
        node.glow.material.opacity = 0.04;
        node.outline.material.opacity = 0.35;
        node.gloss.material.opacity = 0.15;
        node.shadow.material.opacity = 0.1;
        node.aura.material.opacity = 0.05;
        node.rim.material.opacity = 0.2;
        node.sheen.material.opacity = 0.08;
        for (const sp of node.sparkles) sp.material.opacity = 0;
      } else {
        node.core.material.opacity = 1;
        node.glow.material.opacity = 0.2;
        node.outline.material.opacity = 1;
        node.gloss.material.opacity = 0.55;
        node.shadow.material.opacity = 0.34;
        node.aura.material.opacity = 0.32;
        node.rim.material.opacity = 0.9;
        node.sheen.material.opacity = 0.5;
        // titileo: fogonazos breves y esporádicos, no un parpadeo constante
        for (const sp of node.sparkles) {
          const tw = Math.max(0, Math.sin(simTime * sp.userData.speed + sp.userData.phase));
          sp.material.opacity = Math.pow(tw, 3) * 0.9;
          sp.rotation.z = simTime * 0.6 + sp.userData.phase;
        }
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
    ejectWindowAgents,
    setWindowAgentsMinimized,
    triggerHatShake,
    moveWindowAgents, // <- Añadido para exponerlo a main.js
    get order() {
      return params.order;
    }
  };
}