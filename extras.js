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
  presets[name] = connections.map(c => ({
    inputId: c.inputId,
    outputId: c.outputId,
    inputName: inputMap.get(c.inputId)?.name || '',
    outputName: outputMap.get(c.outputId)?.name || '',
  }));
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
  
  // Track assigned fallbacks to avoid assigning the same port twice if names match
  const usedInputs = new Set();
  const usedOutputs = new Set();

  for (const c of preset) {
    let inputId = c.inputId;
    let outputId = c.outputId;
    
    // If exact ID not found, fallback to name (matching first unused)
    if (!inputMap.has(inputId)) {
      inputId = null;
      inputMap.forEach((dev, id) => { 
        if (!inputId && dev.name === c.inputName && !usedInputs.has(id)) inputId = id; 
      });
    }
    if (!outputMap.has(outputId)) {
      outputId = null;
      outputMap.forEach((dev, id) => { 
        if (!outputId && dev.name === c.outputName && !usedOutputs.has(id)) outputId = id; 
      });
    }
    
    if (inputId && outputId) {
      resolved.push({ inputId, outputId });
      usedInputs.add(inputId);
      usedOutputs.add(outputId);
    }
  }
  return resolved;
}

window.MidiHubExtras = { getFriendlyName, resetPortCounters, loadPresets, savePreset, deletePreset, resolvePreset };
