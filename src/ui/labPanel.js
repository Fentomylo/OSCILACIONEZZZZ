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

export function createLabPanel({ params, onReset, onPreset, onPauseChange }) {
  const refreshers = [];
  const panel = document.createElement('aside');
  panel.className = 'panel';
  panel.innerHTML = '<h1>DESKTOP RITUAL</h1><p>8 espíritus · trama viviente · sincronía emergente.</p>';

  const sim = document.createElement('div');
  sim.className = 'group';
  sim.innerHTML = '<h2>Kuramoto</h2>';
  panel.append(sim);

  refreshers.push(rangeRow(sim, 'acoplamiento (K)', () => params.couplingStrength, (v) => { params.couplingStrength = v; }, 0, 4, 0.05));
  refreshers.push(rangeRow(sim, 'ruido', () => params.noise, (v) => { params.noise = v; }, 0, 1, 0.02));
  refreshers.push(rangeRow(sim, 'deriva', () => params.phaseDrift, (v) => { params.phaseDrift = v; }, 0, 1.5, 0.05));
  refreshers.push(rangeRow(sim, 'velocidad', () => params.dt, (v) => { params.dt = v; }, 0.01, 0.08, 0.005));
  refreshers.push(rangeRow(sim, 'sincronía', () => params.order, () => {}, 0, 1, 0.01));

  const presets = document.createElement('div');
  presets.className = 'group';
  presets.innerHTML = '<h2>ritmo global</h2>';
  panel.append(presets);

  button(presets, '💫 Calma / Paz', () => onPreset('calm'));
  button(presets, '⚡ Caos / Libertad', () => onPreset('chaos'));
  button(presets, '🔗 Sincro / Unión', () => onPreset('sync'));

  const cast = document.createElement('div');
  cast.className = 'group';
  cast.innerHTML = `<h2>elenco</h2><div class="cast-list" style="font-size: 10px; line-height: 1.7;">
    1. Static-Tan | nerviosa, reactiva | w=1.8<br>
    2. Core-Tan | terco, estable | w=0.6<br>
    3. Mirror-Tan | mimetiza vecinos | w=1.1<br>
    4. Signal-Tan | erratica, friccion | w=1.5<br>
    5. Petal | juguetona, ligera | w=1.3<br>
    6. Disko | analitica, hardware | w=1.0<br>
    7. Pixel-Boy | observador, digital | w=1.2<br>
    8. Moth | impulsiva, flotante | w=1.4
  </div>`;
  panel.append(cast);

  const actions = document.createElement('div');
  actions.className = 'group';
  actions.innerHTML = '<h2>control</h2>';
  panel.append(actions);
  button(actions, '🔄 Reset', onReset);
  button(actions, '⏸ Pausar', onPauseChange);

  document.body.append(panel);

  return {
    element: panel,
    refresh() {
      for (const item of refreshers) item.refresh();
    }
  };
}
