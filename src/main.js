import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import './styles.css';

import { createParameters } from './simulation/parameters.js';
import { createSimulation } from './simulation/createSimulation.js';
import { createLabPanel } from './ui/labPanel.js';



/*
2^15: 32768
2^16: 65536
2^17: 131072
2^18: 262144
2^19: 524288
2^20: 1048576
2^21: 2097152
2^22: 4194304
2^23: 8388608
2^24: 16777216
*/

async function main() {
  const mount = document.querySelector('#app');

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#05151f');

  const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 50);
  camera.position.set(0, 0, 9.5);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  mount.appendChild(renderer.domElement);

  const orbit = new OrbitControls(camera, renderer.domElement);
  orbit.enableDamping = true;
  orbit.enablePan = false;
  orbit.minDistance = 5;
  orbit.maxDistance = 18;

  const params = createParameters();
  const simulation = createSimulation({ scene, params });

  const desktop = new THREE.Group();

  const floor = new THREE.Mesh(
    new THREE.CylinderGeometry(4.8, 5.6, 0.26, 64),
    new THREE.MeshStandardMaterial({
      color: '#0d1a22',
      emissive: '#081c26',
      emissiveIntensity: 0.35,
      metalness: 0.35,
      roughness: 0.7
    })
  );
  floor.position.y = -2.9;
  desktop.add(floor);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(4.4, 0.03, 16, 220),
    new THREE.MeshBasicMaterial({ color: '#4ecbff', transparent: true, opacity: 0.38 })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = -2.75;
  desktop.add(ring);

  const grid = new THREE.GridHelper(11, 22, '#59d7ff', '#123044');
  grid.position.y = -2.78;
  grid.material.transparent = true;
  grid.material.opacity = 0.24;
  desktop.add(grid);
  scene.add(desktop);

  const ambient = new THREE.AmbientLight('#9adfff', 1.3);
  const point = new THREE.PointLight('#7fe0ff', 2.2, 35);
  point.position.set(2.5, 4.5, 5.5);
  const rim = new THREE.PointLight('#cc7bff', 1.5, 28);
  rim.position.set(-4.5, -1, 2.5);
  const top = new THREE.DirectionalLight('#aef0ff', 0.6);
  top.position.set(0, 6, 3);
  scene.add(ambient, point, rim, top);

  const hud = document.createElement('div');
  hud.className = 'hud';
  document.body.append(hud);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let selectedIndex = null;

  const applyPreset = (id) => {
    if (id === 'calm') {
      params.couplingStrength = 0.8;
      params.noise = 0.12;
      params.phaseDrift = 0.2;
      hud.innerHTML = '<strong>💫 CALMA</strong><br>los espíritus respiran juntos';
    } else if (id === 'chaos') {
      params.couplingStrength = 0.3;
      params.noise = 0.42;
      params.phaseDrift = 0.8;
      hud.innerHTML = '<strong>⚡ CAOS</strong><br>cada uno sigue su propio ritmo';
    } else if (id === 'sync') {
      params.couplingStrength = 2.8;
      params.noise = 0.08;
      params.phaseDrift = 0.25;
      hud.innerHTML = '<strong>🔗 UNIÓN</strong><br>la red sincroniza perfecta';
    }
    simulation.reset();
    panel?.refresh();
  };

  const handlePointerClick = (event) => {
    pointer.x = (event.clientX / innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);

    const hits = raycaster.intersectObjects(simulation.nodes.map((node) => node.core), true);
    if (!hits.length) {
      selectedIndex = null;
      return;
    }

    const index = hits[0].object.userData.nodeIndex;
    if (selectedIndex === null) {
      selectedIndex = index;
      return;
    }

    if (selectedIndex !== index) {
      simulation.toggleConnection(selectedIndex, index);
      selectedIndex = null;
    }
  };

  let paused = false;
  const panel = createLabPanel({
    params,
    onReset: () => simulation.reset(),
    onPreset: applyPreset,
    onPauseChange: () => {
      paused = !paused;
      hud.innerHTML = paused
        ? '<strong>PAUSA</strong><br>topología suspendida · reanudar con el botón'
        : '<strong>DESKTOP / SINCRONÍA</strong><br>orden ' + params.order.toFixed(2) + ' · K ' + params.couplingStrength.toFixed(2);
    }
  });

  renderer.domElement.addEventListener('click', handlePointerClick);
  hud.innerHTML = '<strong>DESKTOP / SINCRONÍA</strong><br>orden 0.00 · K 1.80';

  addEventListener('keydown', (event) => {
    if (event.repeat) return;
    if (event.code === 'KeyR') simulation.reset();
    if (event.code === 'KeyP') {
      paused = !paused;
      hud.innerHTML = paused
        ? '<strong>PAUSA</strong><br>topología suspendida · reanudar con el botón'
        : '<strong>DESKTOP / SINCRONÍA</strong><br>orden ' + params.order.toFixed(2) + ' · K ' + params.couplingStrength.toFixed(2);
    }
    if (event.code === 'Digit1') applyPreset('calm');
    if (event.code === 'Digit2') applyPreset('chaos');
    if (event.code === 'Digit3') applyPreset('sync');
  });

  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  simulation.reset();

  for (let i = 0; i < simulation.nodes.length; i++) {
    simulation.nodes[i].core.userData.nodeIndex = i;
  }

  renderer.setAnimationLoop(() => {
    if (!paused) simulation.stepSimulation();
    if (!paused) {
      hud.innerHTML = '<strong>DESKTOP / SINCRONÍA</strong><br>orden ' + params.order.toFixed(2) + ' · K ' + params.couplingStrength.toFixed(2);
    }
    ring.rotation.z += 0.002;
    desktop.rotation.y += 0.0015;
    orbit.update();
    renderer.render(scene, camera);
  });
}

main().catch((error) => {
  console.error(error);
  const pre = document.createElement('pre');
  pre.style.cssText = 'position:fixed;inset:16px;white-space:pre-wrap;color:#fff;z-index:50';
  pre.textContent = String(error?.stack || error);
  document.body.append(pre);
});
