// ── Device Label Map ──────────────────────────────
const DEVICE_LABELS = {
  'sp-404':    { name: 'Roland SP-404MK2', emoji: '🎛', ports: { 0: 'MIDI In/Out' } },
  'mpk mini':  { name: 'Akai MPK Mini',     emoji: '🎹', ports: { 0: 'Keys/Pads', 1: 'Control' } },
  'sq-64':     { name: 'Korg SQ-64',        emoji: '🔢', ports: { 0: 'USB-A', 1: 'USB-B', 2: 'USB-C', 3: 'USB-D' } },
  'sq64':      { name: 'Korg SQ-64',        emoji: '🔢', ports: { 0: 'USB-A', 1: 'USB-B', 2: 'USB-C', 3: 'USB-D' } },
};

window.portCounters = {};

function getFriendlyName(rawName) {
  const low = rawName.toLowerCase();
  console.log("Detecting device:", rawName);
  for (const key of Object.keys(DEVICE_LABELS)) {
    if (low.includes(key)) {
      const info = DEVICE_LABELS[key];
      if (window.portCounters[key] === undefined) window.portCounters[key] = 0;
      const idx = window.portCounters[key]++;
      const portLabel = info.ports[idx] || `Puerto ${idx + 1}`;
      return { name: info.name, sub: portLabel, emoji: info.emoji, raw: rawName };
    }
  }
  return { name: rawName, sub: '(Desconocido)', emoji: '🎵', raw: rawName };
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
  for (const c of preset) {
    let inputId = null, outputId = null;
    inputMap.forEach((dev, id) => { if (dev.name === c.inputName) inputId = id; });
    outputMap.forEach((dev, id) => { if (dev.name === c.outputName) outputId = id; });
    if (inputId && outputId) resolved.push({ inputId, outputId });
  }
  return resolved;
}

window.MidiHubExtras = { getFriendlyName, resetPortCounters, loadPresets, savePreset, deletePreset, resolvePreset };
