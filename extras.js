// ── Device Label Map ──────────────────────────────
const DEVICE_LABELS = {
  'sp-404':    { name: 'Roland SP-404MK2', emoji: '🎛', ports: { 0: 'MIDI Principal' } },
  'mpk mini':  { name: 'Akai MPK Mini',     emoji: '🎹', ports: { 0: 'Keys/Pads', 1: 'Control Interno' } },
  'sq-64':     { name: 'Korg SQ-64',        emoji: '🔢', ports: { 0: 'USB-A (Track 1/2)', 1: 'USB-B (Track 3)', 2: 'USB-C (Track 4)' } },
  'sq64':      { name: 'Korg SQ-64',        emoji: '🔢', ports: { 0: 'USB-A (Track 1/2)', 1: 'USB-B (Track 3)', 2: 'USB-C (Track 4)' } },
};

window.portCounters = {};

function getFriendlyName(rawName) {
  const low = rawName.toLowerCase();
  
  for (const key of Object.keys(DEVICE_LABELS)) {
    if (low.includes(key)) {
      const info = DEVICE_LABELS[key];
      if (window.portCounters[key] === undefined) window.portCounters[key] = 0;
      const idx = window.portCounters[key]++;
      const portLabel = info.ports[idx] || `Puerto ${idx + 1}`;
      return { name: rawName, sub: portLabel, emoji: info.emoji, raw: rawName };
    }
  }
  
  if (window.portCounters[rawName] === undefined) window.portCounters[rawName] = 0;
  const idx = window.portCounters[rawName]++;
  const portLabel = `Puerto ${idx + 1}`;
  return { name: rawName, sub: portLabel, emoji: '🎵', raw: rawName };
}

function resetPortCounters() { window.portCounters = {}; }

// ── Presets (localStorage) ────────────────────────
const PRESETS_KEY = 'midihub_presets';

function loadPresets() {
  try { return JSON.parse(localStorage.getItem(PRESETS_KEY) || '{}'); }
  catch { return {}; }
}

function savePreset(name, connections, inputMap, outputMap) {
  const presets = loadPresets();
  presets[name] = connections.map(c => {
    const inDev = inputMap.get(c.inputId);
    const outDev = outputMap.get(c.outputId);
    
    let inIndex = 0, outIndex = 0, currIn = 0, currOut = 0;
    inputMap.forEach((d, id) => { if(d.name === inDev?.name) { if(id === c.inputId) inIndex = currIn; currIn++; } });
    outputMap.forEach((d, id) => { if(d.name === outDev?.name) { if(id === c.outputId) outIndex = currOut; currOut++; } });

    return {
      inputId: c.inputId,
      outputId: c.outputId,
      inputName: inDev?.name || '',
      outputName: outDev?.name || '',
      inputIndex: inIndex,
      outputIndex: outIndex
    };
  });
  localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
}

function deletePreset(name) {
  const presets = loadPresets();
  delete presets[name];
  localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
}

function resolvePreset(name, inputMap, outputMap) {
  const presets = loadPresets();
  const preset = presets[name];
  if (!preset) return [];
  const resolved = [];

  for (const c of preset) {
    let inputId = c.inputId;
    let outputId = c.outputId;
    
    const inDev = inputMap.get(inputId);
    if (!inDev || inDev.name !== c.inputName) {
      inputId = null;
      let currIn = 0;
      inputMap.forEach((d, id) => { 
        if (!inputId && d.name === c.inputName) {
            if (currIn === (c.inputIndex || 0)) inputId = id;
            currIn++;
        }
      });
    }

    const outDev = outputMap.get(outputId);
    if (!outDev || outDev.name !== c.outputName) {
      outputId = null;
      let currOut = 0;
      outputMap.forEach((d, id) => { 
        if (!outputId && d.name === c.outputName) {
            if (currOut === (c.outputIndex || 0)) outputId = id;
            currOut++;
        }
      });
    }
    
    if (inputId && outputId) {
      resolved.push({ inputId, outputId });
    }
  }
  return resolved;
}

window.MidiHubExtras = { getFriendlyName, resetPortCounters, loadPresets, savePreset, deletePreset, resolvePreset };
