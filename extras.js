// ── Device Label Map ──────────────────────────────
const DEVICE_LABELS = {
  'sp-404mk2': { name: 'Roland SP-404MK2', emoji: '🎛', ports: { 0: 'MIDI Principal' } },
  'sp404mk2':  { name: 'Roland SP-404MK2', emoji: '🎛', ports: { 0: 'MIDI Principal' } },
  'sp-404':    { name: 'Roland SP-404MK2', emoji: '🎛', ports: { 0: 'MIDI Principal' } },
  'mpk mini mk4': { name: 'Akai MPK Mini MK4', emoji: '🎹', ports: { 0: 'Keys/Pads', 1: 'DAW Control' } },
  'mpk mini':     { name: 'Akai MPK Mini',     emoji: '🎹', ports: { 0: 'Keys/Pads' } },
  'mpk mini mk3': { name: 'Akai MPK Mini MK3', emoji: '🎹', ports: { 0: 'Keys/Pads' } },
  'sq-64':  { name: 'Korg SQ-64', emoji: '🔢', ports: { 0: 'Track 1', 1: 'Track 2', 2: 'Track 3', 3: 'Track 4' } },
  'sq64':   { name: 'Korg SQ-64', emoji: '🔢', ports: { 0: 'Track 1', 1: 'Track 2', 2: 'Track 3', 3: 'Track 4' } },
  'korg sq': { name: 'Korg SQ-64', emoji: '🔢', ports: { 0: 'Track 1', 1: 'Track 2', 2: 'Track 3', 3: 'Track 4' } },
};

window.portCounters = {};

function getFriendlyName(rawName) {
  const low = rawName.toLowerCase();
  for (const key of Object.keys(DEVICE_LABELS)) {
    if (low.includes(key)) {
      const info = DEVICE_LABELS[key];
      // Count ports per device
      const base = key;
      if (window.portCounters[base] === undefined) window.portCounters[base] = 0;
      const idx = window.portCounters[base]++;
      const portLabel = info.ports[idx] || `Puerto ${idx + 1}`;
      return { name: `${info.name}`, sub: portLabel, emoji: info.emoji };
    }
  }
  return { name: rawName, sub: '', emoji: '🎵' };
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
  // Store connections by device name (not ID, IDs change on reconnect)
  presets[name] = connections.map(c => ({
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

// Returns array of {inputId, outputId} matched from current devices
function resolvePreset(name, inputMap, outputMap) {
  const presets = loadPresets();
  const preset = presets[name];
  if (!preset) return [];
  const resolved = [];
  for (const c of preset) {
    let inputId = null, outputId = null;
    inputMap.forEach((dev, id) => { if (dev.name === c.inputName) inputId = id; });
    outputMap.forEach((dev, id) => { if (dev.name === c.outputName) outputId = id; });
    if (inputId && outputId) resolved.push({ inputId, outputId });
  }
  return resolved;
}

window.MidiHubExtras = { getFriendlyName, resetPortCounters, loadPresets, savePreset, deletePreset, resolvePreset };
