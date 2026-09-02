import * as THREE from 'three';

export function createSimulation({ scene, params }) {
  const nodeCount = params.nodeCount;
  const nodes = [];
  const lines = [];
  const adjacency = Array.from({ length: nodeCount }, () => Array(nodeCount).fill(0));
  const phases = new Array(nodeCount).fill(0);

  // 8 personajes con Kuramoto: nombre, tipo, color, ω_i, forma, descripción
  const personalities = [
    { name: 'Static-Tan', desc: 'nerviosa, reactiva', type: 'chica tech', color: '#70e6ff', omega: 1.8, shape: 'orb', radius: 2.6 },
    { name: 'Core-Tan', desc: 'terco, estable', type: 'chico central', color: '#88ffca', omega: 0.6, shape: 'sphere', radius: 2.9 },
    { name: 'Mirror-Tan', desc: 'mimetiza vecinos', type: 'híbrido', color: '#ff9bd4', omega: 1.1, shape: 'diamond', radius: 2.3 },
    { name: 'Signal-Tan', desc: 'errática, fricción', type: 'robot/gadget', color: '#ffb261', omega: 1.5, shape: 'hex', radius: 2.7 },
    { name: 'Petal', desc: 'juguetona, ligera', type: 'animal+tech', color: '#9fe5ff', omega: 1.3, shape: 'petal', radius: 2.2 },
    { name: 'Disko', desc: 'analítica, hardware', type: 'objeto/disco', color: '#9fbcff', omega: 1.0, shape: 'ring', radius: 2.8 },
    { name: 'Pixel-Boy', desc: 'observador, digital', type: 'retro-PC', color: '#7af7d3', omega: 1.2, shape: 'cube', radius: 2.5 },
    { name: 'Moth', desc: 'impulsiva, flotante', type: 'animal-robot', color: '#d7a4ff', omega: 1.4, shape: 'star', radius: 2.4 }
  ];

  const group = new THREE.Group();
  scene.add(group);

  const connectionMaterial = new THREE.LineBasicMaterial({
    color: '#8fe1ff',
    transparent: true,
    opacity: 0.45
  });

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function createNodeShape(persona) {
    const shapes = {
      orb: new THREE.TorusKnotGeometry(0.18, 0.035, 96, 12),
      sphere: new THREE.IcosahedronGeometry(0.22, 5),
      diamond: new THREE.OctahedronGeometry(0.22),
      hex: new THREE.CylinderGeometry(0.18, 0.18, 0.32, 8, 1),
      petal: new THREE.IcosahedronGeometry(0.16, 4),
      ring: new THREE.TorusGeometry(0.19, 0.05, 24, 80),
      cube: new THREE.BoxGeometry(0.26, 0.26, 0.26),
      star: new THREE.IcosahedronGeometry(0.2, 4)
    };
    const mesh = new THREE.Mesh(
      shapes[persona.shape] || new THREE.IcosahedronGeometry(0.2, 4),
      new THREE.MeshStandardMaterial({
        color: persona.color,
        emissive: persona.color,
        emissiveIntensity: 0.7,
        metalness: 0.3,
        roughness: 0.25
      })
    );
    return mesh;
  }

  function createAvatarShape(persona, tint) {
    const geometryMap = {
      orb: new THREE.TorusKnotGeometry(0.18, 0.035, 72, 10),
      diamond: new THREE.OctahedronGeometry(0.2),
      hex: new THREE.CylinderGeometry(0.17, 0.17, 0.28, 6),
      cube: new THREE.BoxGeometry(0.26, 0.26, 0.26),
      petal: new THREE.SphereGeometry(0.14, 16, 16),
      ring: new THREE.TorusGeometry(0.17, 0.04, 12, 48),
      capsule: new THREE.CapsuleGeometry(0.12, 0.26, 4, 12),
      star: new THREE.DodecahedronGeometry(0.18)
    };

    const mesh = new THREE.Mesh(
      geometryMap[persona.shape] || new THREE.SphereGeometry(0.18, 18, 18),
      new THREE.MeshStandardMaterial({
        color: tint,
        emissive: tint,
        emissiveIntensity: 0.6,
        metalness: 0.2,
        roughness: 0.35
      })
    );

    mesh.rotation.x = Math.random() * Math.PI;
    mesh.rotation.y = Math.random() * Math.PI;
    mesh.rotation.z = Math.random() * Math.PI;
    return mesh;
  }

  function buildTopology() {
    for (let i = 0; i < nodeCount; i++) {
      for (let j = 0; j < nodeCount; j++) {
        adjacency[i][j] = 0;
      }
    }

    const ringPattern = [1, 2, 3, 4, 5, 6, 7];
    for (let i = 0; i < nodeCount; i++) {
      const next = (i + 1) % nodeCount;
      const prev = (i + nodeCount - 1) % nodeCount;
      adjacency[i][next] = 1;
      adjacency[i][prev] = 1;
      if (i % 2 === 0) adjacency[i][(i + 3) % nodeCount] = 1;
    }

    if (nodeCount > 2) {
      for (const index of ringPattern) {
        const other = (index + 2) % nodeCount;
        adjacency[index][other] = 1;
      }
    }

    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        if (adjacency[i][j] || adjacency[j][i]) continue;
        if (Math.random() < 0.12) {
          adjacency[i][j] = 1;
          adjacency[j][i] = 1;
        }
      }
    }
  }

  function createNode(index) {
    const persona = personalities[index];
    const wrapper = new THREE.Group();
    
    // Core shape
    const core = createNodeShape(persona);
    
    // Inner glow sphere
    const glowSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 32, 32),
      new THREE.MeshBasicMaterial({
        color: persona.color,
        transparent: true,
        opacity: 0.15
      })
    );
    
    // Outer halo torus (rotating)
    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(0.38, 0.05, 16, 80),
      new THREE.MeshBasicMaterial({
        color: persona.color,
        transparent: true,
        opacity: 0.6
      })
    );
    halo.rotation.x = Math.PI / 2.5;
    
    // Accent cylinder (rotating)
    const accent = new THREE.Mesh(
      new THREE.CylinderGeometry(0.038, 0.038, 0.7, 12),
      new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.65 })
    );
    accent.rotation.z = index * 0.785;
    accent.position.set(0.32, 0.22, 0.16);
    
    // Point light for glow
    const pointLight = new THREE.PointLight(persona.color, 0.8, 2.5);
    
    wrapper.add(core, glowSphere, halo, accent, pointLight);
    group.add(wrapper);

    const node = {
      index,
      name: persona.name,
      desc: persona.desc,
      type: persona.type,
      wrapper,
      core,
      glowSphere,
      halo,
      accent,
      pointLight,
      color: persona.color,
      omega: persona.omega,
      radius: persona.radius,
      angle: (Math.PI * 2 * index) / nodeCount + randomBetween(-0.8, 0.8),
      rotationSpeed: randomBetween(0.01, 0.04)
    };
    nodes.push(node);
  }

  function createConnections() {
    for (const line of lines) {
      group.remove(line.line);
      if (line.geometry) line.geometry.dispose();
      if (line.material) line.material.dispose();
    }
    lines.length = 0;

    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        if (!adjacency[i][j]) continue;
        const geometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(),
          new THREE.Vector3()
        ]);
        const mat = new THREE.LineBasicMaterial({
          color: '#7eabff',
          transparent: true,
          opacity: 0.35,
          linewidth: 3
        });
        const line = new THREE.Line(geometry, mat);
        group.add(line);
        lines.push({ i, j, line, geometry, material: mat });
      }
    }
  }

  function reset() {
    buildTopology();
    createConnections();

    for (let i = 0; i < nodeCount; i++) {
      const node = nodes[i];
      phases[i] = randomBetween(-Math.PI, Math.PI);
      node.angle = (Math.PI * 2 * i) / nodeCount + randomBetween(-0.8, 0.8);
      node.wrapper.position.set(
        Math.cos(node.angle) * node.radius,
        Math.sin(node.angle) * node.radius * 0.7,
        Math.sin(node.angle * 2.0) * 0.7
      );
      node.core.scale.setScalar(1.0);
      node.halo.material.opacity = 0.75;
      node.accent.material.opacity = 0.65;
    }

    computeOrder();
  }

  function computeOrder() {
    const complex = { re: 0, im: 0 };
    for (let i = 0; i < nodeCount; i++) {
      const phase = phases[i];
      complex.re += Math.cos(phase);
      complex.im += Math.sin(phase);
    }
    const magnitude = Math.hypot(complex.re, complex.im) / nodeCount;
    params.order = Number(magnitude.toFixed(3));
  }

  function toggleConnection(indexA, indexB) {
    if (indexA === indexB) return;
    adjacency[indexA][indexB] = adjacency[indexA][indexB] ? 0 : 1;
    adjacency[indexB][indexA] = adjacency[indexA][indexB];
    createConnections();
    computeOrder();
  }

  function stepSimulation() {
    for (let i = 0; i < nodeCount; i++) {
      const node = nodes[i];
      let sum = 0;
      let neighbors = 0;

      for (let j = 0; j < nodeCount; j++) {
        if (i === j || !adjacency[i][j]) continue;
        neighbors += 1;
        sum += Math.sin(phases[j] - phases[i]);
      }

      const effectiveK = neighbors > 0 ? (params.couplingStrength * sum) / neighbors : 0;
      const drift = params.phaseDrift * (node.omega - 1.0);
      const noise = (Math.random() - 0.5) * params.noise;
      const next = phases[i] + (drift + effectiveK + noise) * params.dt;
      phases[i] = ((next + Math.PI) % (Math.PI * 2)) - Math.PI;

      const x = Math.cos(node.angle + phases[i]) * node.radius;
      const y = Math.sin(node.angle + phases[i]) * node.radius * 0.7;
      const z = Math.sin(node.angle * 2.0 + phases[i]) * 0.7;
      node.wrapper.position.set(x, y, z);

      const pulse = 0.7 + (Math.sin(phases[i]) + 1) * 0.7;
      const size = (0.9 + pulse * 0.75) * params.nodeScale;
      node.core.scale.setScalar(size);
      node.glowSphere.scale.setScalar(1.0 + pulse * 0.3);
      node.glowSphere.material.opacity = 0.08 + pulse * 0.15;
      node.halo.material.opacity = 0.3 + pulse * 0.8;
      node.accent.material.opacity = 0.3 + pulse * 0.7;
      node.accent.rotation.z += node.rotationSpeed + params.dt * 0.6;
      node.pointLight.intensity = 0.5 + pulse * 0.8;
    }

    for (const entry of lines) {
      const a = nodes[entry.i].wrapper.position;
      const b = nodes[entry.j].wrapper.position;
      entry.geometry.setFromPoints([a.clone(), b.clone()]);
      const syncColor = params.order > 0.75 ? new THREE.Color('#a3f9ff') : new THREE.Color('#7eabff');
      entry.material.color.copy(syncColor);
      entry.material.opacity = 0.25 + params.order * 0.7;
    }

    computeOrder();
  }

  for (let i = 0; i < nodeCount; i++) {
    createNode(i);
  }

  buildTopology();
  createConnections();
  reset();

  return {
    nodes,
    lines,
    adjacency,
    reset,
    stepSimulation,
    toggleConnection,
    get order() {
      return params.order;
    }
  };
}
