const AC = window.AudioContext || window.webkitAudioContext;
let ctx = null;
let out = null;
let noiseBuffer = null;
let pan = 0;
let level = 1;
let enabled = true;
let unlocked = false;
let slide = null;
const gates = {};

try { enabled = localStorage.getItem("deskSfx") !== "off"; } catch { enabled = true; }

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const rnd = (min, max) => min + Math.random() * (max - min);
const hash = (text) => {
  let value = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    value ^= text.charCodeAt(index);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
};
const gate = (key, wait) => {
  const now = performance.now();
  if (gates[key] && now - gates[key] < wait) return false;
  gates[key] = now;
  return true;
};

function init() {
  if (!AC) return;
  ctx = new AC();
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -16;
  comp.knee.value = 20;
  comp.ratio.value = 5;
  comp.attack.value = 0.003;
  comp.release.value = 0.25;
  out = ctx.createGain();
  out.gain.value = 0.85;
  out.connect(comp);
  comp.connect(ctx.destination);
  noiseBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 2), ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let index = 0; index < data.length; index += 1) data[index] = Math.random() * 2 - 1;
}

function ready() {
  if (!enabled || !unlocked || !AC) return false;
  if (!ctx) init();
  if (ctx?.state === "suspended") ctx.resume();
  return Boolean(ctx);
}

export function unlockSound() {
  unlocked = true;
  if (enabled) ready();
}

["pointerdown", "keydown", "touchstart"].forEach((type) => {
  window.addEventListener(type, unlockSound, { capture: true, passive: true });
});

const now = () => ctx.currentTime + 0.006;
function route(node) {
  if (ctx.createStereoPanner && pan) {
    const panner = ctx.createStereoPanner();
    panner.pan.value = pan;
    node.connect(panner);
    panner.connect(out);
    return;
  }
  node.connect(out);
}
function envelope(gain, time, attack, duration, volume) {
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.linearRampToValueAtTime(Math.max(volume, 0.0002), time + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + attack + duration);
}
function tone(options) {
  const time = now() + (options.t || 0);
  const attack = options.a == null ? 0.004 : options.a;
  const duration = options.d || 0.15;
  const volume = (options.v == null ? 0.2 : options.v) * level;
  const oscillator = ctx.createOscillator();
  oscillator.type = options.type || "sine";
  oscillator.frequency.setValueAtTime(options.f, time);
  if (options.f2) oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, options.f2), time + (options.glide || duration));
  const gain = ctx.createGain();
  envelope(gain, time, attack, duration, volume);
  let node = oscillator;
  if (options.lp) {
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = options.lp;
    oscillator.connect(filter);
    node = filter;
  }
  node.connect(gain);
  route(gain);
  oscillator.start(time);
  oscillator.stop(time + attack + duration + 0.05);
}
function noise(options) {
  const time = now() + (options.t || 0);
  const attack = options.a == null ? 0.003 : options.a;
  const duration = options.d || 0.1;
  const volume = (options.v == null ? 0.15 : options.v) * level;
  const source = ctx.createBufferSource();
  source.buffer = noiseBuffer;
  source.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = options.type || "bandpass";
  filter.frequency.setValueAtTime(options.f || 2000, time);
  if (options.f2) filter.frequency.exponentialRampToValueAtTime(Math.max(1, options.f2), time + duration);
  filter.Q.value = options.q == null ? 1 : options.q;
  const gain = ctx.createGain();
  envelope(gain, time, attack, duration, volume);
  source.connect(filter);
  filter.connect(gain);
  route(gain);
  source.start(time, Math.random() * 1.5);
  source.stop(time + attack + duration + 0.05);
}
function bell(frequency, options = {}) {
  const time = now() + (options.t || 0);
  const duration = options.d || 1;
  const volume = (options.v == null ? 0.12 : options.v) * level;
  const carrier = ctx.createOscillator();
  const modulator = ctx.createOscillator();
  const modGain = ctx.createGain();
  const gain = ctx.createGain();
  carrier.frequency.value = frequency;
  modulator.frequency.value = frequency * (options.ratio || 2.76);
  modGain.gain.setValueAtTime(options.idx || frequency * 1.1, time);
  modGain.gain.exponentialRampToValueAtTime(1, time + duration * 0.8);
  modulator.connect(modGain);
  modGain.connect(carrier.frequency);
  carrier.connect(gain);
  envelope(gain, time, 0.002, duration, volume);
  route(gain);
  carrier.start(time);
  modulator.start(time);
  carrier.stop(time + duration + 0.05);
  modulator.stop(time + duration + 0.05);
}
function voice(options) {
  const time = now() + (options.t || 0);
  const duration = options.d || 0.5;
  const volume = (options.v || 0.3) * level;
  const oscillator = ctx.createOscillator();
  oscillator.type = options.type || "sawtooth";
  options.p.forEach((point, index) => oscillator.frequency[index ? "linearRampToValueAtTime" : "setValueAtTime"](point[1], time + point[0]));
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = options.q || 4;
  options.fm.forEach((point, index) => filter.frequency[index ? "linearRampToValueAtTime" : "setValueAtTime"](point[1], time + point[0]));
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.linearRampToValueAtTime(volume, time + (options.a || 0.05));
  gain.gain.setValueAtTime(volume, time + duration * 0.55);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
  oscillator.connect(filter);
  filter.connect(gain);
  route(gain);
  oscillator.start(time);
  oscillator.stop(time + duration + 0.05);
}

const click = (time, frequency, volume) => noise({ t: time, d: 0.012, type: "highpass", f: frequency || 2500, v: volume == null ? 0.1 : volume, a: 0.001 });
const rustle = (time, duration, volume, frequency) => {
  for (let index = 0; index < 5; index += 1) {
    noise({ t: time + index * duration / 5 * rnd(0.7, 1.3), d: duration / 3, type: "bandpass", f: (frequency || 4200) * rnd(0.7, 1.4), q: 0.6, v: (volume || 0.1) * rnd(0.5, 1.2), a: 0.005 });
  }
};
const whoosh = (time, duration, from, to, volume) => noise({ t: time, d: duration, type: "bandpass", f: from, f2: to, q: 0.9, v: volume == null ? 0.08 : volume, a: duration * 0.35 });
const ding = (frequency, time, volume, duration) => bell(frequency, { t: time, v: volume == null ? 0.1 : volume, d: duration || 1 });
const drip = (time, frequency, volume) => tone({ t: time, f: frequency, f2: frequency * 2.1, d: 0.09, v: volume == null ? 0.14 : volume, a: 0.002 });
const wood = (time, frequency, volume) => tone({ t: time, f: frequency, f2: frequency * 0.8, d: 0.07, type: "triangle", v: volume == null ? 0.2 : volume, a: 0.001 });
const meow = (time, frequency) => voice({ t: time, d: 0.6, v: 0.6, q: 5, type: "sawtooth", p: [[0, frequency * 0.8], [0.12, frequency * 1.25], [0.6, frequency * 0.7]], fm: [[0, 900], [0.16, 2300], [0.6, 1000]] });

const materials = {
  paper: { lift: (pitch) => noise({ type: "bandpass", f: 3400 * pitch, f2: 5200 * pitch, q: 0.7, d: 0.1, v: 0.08, a: 0.01 }), drop: (pitch) => { noise({ type: "lowpass", f: 1100 * pitch, d: 0.07, v: 0.12 }); noise({ t: 0.02, type: "bandpass", f: 4200 * pitch, q: 0.7, d: 0.08, v: 0.05 }); }, slide: 3200 },
  card: { lift: (pitch) => noise({ type: "bandpass", f: 5200 * pitch, f2: 3000 * pitch, q: 1.2, d: 0.05, v: 0.1 }), drop: (pitch) => { tone({ f: 260 * pitch, f2: 170 * pitch, d: 0.05, type: "triangle", v: 0.16, a: 0.001 }); noise({ d: 0.03, type: "highpass", f: 3000, v: 0.07 }); }, slide: 4200 },
  book: { lift: (pitch) => noise({ type: "lowpass", f: 700 * pitch, d: 0.12, v: 0.12, a: 0.02 }), drop: (pitch) => { tone({ f: 190 * pitch, f2: 95 * pitch, d: 0.14, v: 0.3, a: 0.002 }); noise({ type: "lowpass", f: 900, d: 0.08, v: 0.1 }); }, slide: 900 },
  ceramic: { lift: (pitch) => bell(2300 * pitch, { d: 0.12, v: 0.05, ratio: 2.4 }), drop: (pitch) => { bell(1500 * pitch, { d: 0.28, v: 0.11, ratio: 2.4 }); tone({ f: 280 * pitch, f2: 140, d: 0.06, v: 0.18, a: 0.002 }); }, slide: 2200 },
  plastic: { lift: (pitch) => tone({ f: 1700 * pitch, d: 0.04, type: "square", v: 0.07, a: 0.001, lp: 5000 }), drop: (pitch) => { tone({ f: 420 * pitch, f2: 300 * pitch, d: 0.06, type: "triangle", v: 0.2, a: 0.001 }); noise({ d: 0.03, type: "bandpass", f: 2400, v: 0.07 }); }, slide: 2000 },
  metal: { lift: (pitch) => bell(3000 * pitch, { d: 0.15, v: 0.04, ratio: 2.76 }), drop: (pitch) => { bell(780 * pitch, { d: 0.5, v: 0.12, ratio: 2.76, idx: 600 }); noise({ d: 0.04, type: "highpass", f: 2500, v: 0.07 }); }, slide: 2600 },
  wood: { lift: (pitch) => wood(0, 900 * pitch, 0.1), drop: (pitch) => { wood(0, 520 * pitch, 0.22); wood(0.07, 430 * pitch, 0.1); }, slide: 1000 },
  rubber: { lift: (pitch) => tone({ f: 900 * pitch, f2: 1500 * pitch, d: 0.08, v: 0.06 }), drop: (pitch) => tone({ f: 300 * pitch, f2: 150 * pitch, d: 0.1, v: 0.28, a: 0.002 }), slide: 600 },
  plush: { lift: () => noise({ type: "lowpass", f: 900, d: 0.14, v: 0.07, a: 0.04 }), drop: (pitch) => { tone({ f: 260 * pitch, f2: 130 * pitch, d: 0.09, v: 0.2, a: 0.002 }); noise({ type: "lowpass", f: 700, d: 0.1, v: 0.06 }); }, slide: 500 },
  crystal: { lift: (pitch) => bell(3600 * pitch, { d: 0.2, v: 0.04, ratio: 1.5 }), drop: (pitch) => bell(2400 * pitch, { d: 0.9, v: 0.1, ratio: 1.4 }), slide: 5000 }
};

function material(item) {
  if (!item) return "paper";
  if (item.kind === "mug") return "ceramic";
  if (item.kind === "clock" || item.isDustbin || item.themeLamp) return "metal";
  if (item.kind === "cat") return item.mascot === "crystal" ? "crystal" : item.mascot === "axo" ? "rubber" : "plush";
  if (item.kind === "pen" || item.kind === "phone") return "plastic";
  if (item.kind === "pencil" || item.kind === "stamp") return item.kind === "pencil" ? "wood" : "card";
  if (item.kind === "eraser") return "rubber";
  if (item.kind === "notes") return "book";
  if (item.kind === "skill" || item.kind === "cert" || item.kind === "biz") return "card";
  return "paper";
}
const pitchOf = (item) => 0.88 + (hash(item?.id || "desk") % 1000) / 1000 * 0.3;

function withItem(item, play) {
  if (!ready()) return;
  pan = item?.w ? clamp(((item.x + item.w / 2) / 1400 - 0.5) * 1.4, -0.7, 0.7) : 0;
  try { play(); } catch { /* a missed sound should not stop the desk */ }
  pan = 0;
}

const skills = {
  JavaScript: () => { tone({ f: 330, f2: 660, d: 0.1, type: "square", v: 0.08, lp: 3200, a: 0.002 }); tone({ t: 0.09, f: 880, d: 0.16, type: "square", v: 0.08, lp: 3200, a: 0.002 }); },
  React: () => { noise({ d: 0.5, f: 500, f2: 2600, q: 4, v: 0.07, a: 0.15 }); [523, 659, 784].forEach((frequency, index) => tone({ t: index * 0.07, f: frequency, d: 0.45, v: 0.08 })); ding(1568, 0.3, 0.06, 0.8); },
  "Node.js": () => { tone({ f: 196, f2: 392, d: 0.16, v: 0.2, a: 0.005 }); tone({ t: 0.1, f: 392, d: 0.3, type: "triangle", v: 0.16, lp: 1400 }); },
  Python: () => { noise({ d: 0.25, type: "highpass", f: 6000, v: 0.08, a: 0.06 }); tone({ t: 0.1, f: 220, f2: 330, d: 0.3, v: 0.15 }); },
  SQL: () => { tone({ f: 190, f2: 95, d: 0.12, v: 0.3, a: 0.002 }); ding(988, 0.2, 0.06, 0.5); },
  Git: () => { tone({ f: 440, f2: 660, d: 0.3, v: 0.14 }); tone({ f: 440, f2: 330, d: 0.3, v: 0.14 }); ding(1100, 0.35, 0.1, 0.9); },
  Docker: () => { tone({ f: 130, d: 0.8, type: "sawtooth", v: 0.14, a: 0.08, lp: 520 }); bell(300, { t: 0.4, d: 0.5, v: 0.08, ratio: 2.4 }); }
};
const skillAlias = { "React.js": "React", MySQL: "SQL", "Express.js": "Node.js", "MongoDB": "SQL" };

function signature(item) {
  if (!item) return () => {};
  if (item.isDustbin) return () => { bell(540, { d: 0.5, v: 0.1, ratio: 2.3, idx: 700 }); rustle(0.1, 0.25, 0.1, 2500); };
  if (item.id === "resume") return () => { rustle(0, 0.16, 0.09); ding(659, 0.1, 0.1, 0.9); ding(831, 0.2, 0.1, 1.1); };
  if (item.id === "about") return () => { [392, 523, 659].forEach((frequency, index) => tone({ t: index * 0.1, f: frequency, d: 0.4, type: "triangle", v: 0.2, a: 0.002 })); };
  if (item.id === "mail") return () => { rustle(0, 0.18, 0.1, 2400); ding(1480, 0.2, 0.1, 0.9); };
  if (item.id === "phone") return () => { tone({ f: 1046, d: 0.12, v: 0.13, a: 0.003 }); tone({ t: 0.16, f: 1318, d: 0.2, v: 0.13, a: 0.003 }); };
  if (item.id === "mug") return () => { bell(1800, { d: 0.3, v: 0.1, ratio: 2.4 }); drip(0.14, 420, 0.12); };
  if (item.id === "clock") return () => { [0, 1, 2, 3].forEach((index) => wood(index * 0.22, index % 2 ? 1100 : 1500, 0.2)); ding(1760, 0.9, 0.07, 1.4); };
  if (item.kind === "project") return () => { tone({ f: 300 + (item.projectIndex || 0) * 80, f2: 1600, d: 0.28, type: "sawtooth", v: 0.05, lp: 3200 }); ding(1200 + (item.projectIndex || 0) * 180, 0.25, 0.08, 0.8); };
  if (item.kind === "cert") return () => { rustle(0, 0.2, 0.08, 3000); ding(1046, 0.16, 0.1, 0.9); ding(1568, 0.32, 0.08, 1); };
  if (item.kind === "cat" && item.mascot === "cat") return () => meow(0, 720);
  if (item.kind === "cat" && item.mascot === "crystal") return () => { [4186, 3520, 2794].forEach((frequency, index) => bell(frequency, { t: index * 0.06, d: 1, v: 0.04, ratio: 1.4 })); };
  if (item.kind === "cat") return () => { tone({ f: 280, f2: 700, d: 0.12, v: 0.12, a: 0.002 }); tone({ t: 0.14, f: 200, f2: 330, d: 0.4, v: 0.08 }); };
  if (item.kind === "skill") return skills[skillAlias[item.skill?.name] || item.skill?.name] || (() => ding(523 + (hash(item.name) % 8) * 40, 0, 0.08, 0.6));
  if (item.kind === "pen" || item.kind === "pencil") return () => { wood(0, 800, 0.12); click(0.08, 3200, 0.1); };
  if (item.id === "timeline" || item.kind === "experience") return () => { [392, 494, 587, 698].forEach((frequency, index) => tone({ t: index * 0.08, f: frequency, d: 0.3, type: "triangle", v: 0.16, a: 0.002 })); };
  return () => { ding(440 + (hash(item.id) % 7) * 50, 0, 0.08, 0.7); rustle(0, 0.1, 0.06); };
}

export function soundIsOn() { return enabled; }

export function toggleSound() {
  enabled = !enabled;
  try { localStorage.setItem("deskSfx", enabled ? "on" : "off"); } catch { /* ignore private mode */ }
  if (enabled) {
    unlockSound();
    withItem(null, () => { tone({ f: 660, d: 0.1, v: 0.1 }); tone({ t: 0.08, f: 990, d: 0.16, v: 0.1 }); });
  } else if (slide) {
    slideStop();
  }
  return enabled;
}

export function playOpen(item) { if (gate(`open:${item?.id}`, 120)) withItem(item, signature(item)); }
export function playClose(item) { if (gate("close", 200)) withItem(item, () => { whoosh(0, 0.2, 3200, 1200, 0.06); }); }
export function playHover(item) { if (gate("hover", 70)) withItem(item, () => tone({ f: 300 + (hash(item.id) % 10) * 35, d: 0.09, v: 0.03, type: "triangle", a: 0.002 })); }
export function playLift(item) { withItem(item, () => materials[material(item)].lift(pitchOf(item))); }
export function playDrop(item) { withItem(item, () => materials[material(item)].drop(pitchOf(item))); }
export function playTheme(dark) {
  withItem(null, () => {
    tone({ f: 1500, f2: 260, d: 0.03, type: "square", v: 0.08, a: 0.001, lp: 4000 });
    if (dark) tone({ t: 0.04, f: 90, f2: 200, d: 0.35, v: 0.13, a: 0.03 });
    else tone({ t: 0.03, f: 210, f2: 70, d: 0.3, v: 0.1 });
  });
}
export function playSweep() { withItem(null, () => { whoosh(0, 0.7, 500, 3500, 0.14); tone({ t: 0.7, f: 160, f2: 80, d: 0.25, v: 0.3, a: 0.002 }); }); }
export function playRestore() { withItem(null, () => { whoosh(0.05, 0.6, 3500, 600, 0.12); }); }
export function playBinDrop(item) { withItem(item, () => { tone({ f: 180, f2: 90, d: 0.16, v: 0.3, a: 0.002 }); bell(520, { d: 0.3, v: 0.05, ratio: 2.5 }); }); }
export function playCoffee() { withItem(null, () => { noise({ d: 0.35, f: 1800, f2: 600, q: 0.8, v: 0.18, a: 0.01 }); for (let index = 0; index < 6; index += 1) drip(index * 0.08, rnd(400, 900), 0.1); }); }
export function playWipe() { withItem(null, () => { for (let index = 0; index < 3; index += 1) noise({ t: index * 0.12, d: 0.1, f: index % 2 ? 1600 : 2400, q: 3, v: 0.08, a: 0.03 }); }); }
export function playSplat() { if (gate("splat", 40)) withItem(null, () => { tone({ f: rnd(260, 520), f2: rnd(120, 220), d: 0.08, v: 0.07, a: 0.002 }); noise({ d: 0.05, type: "lowpass", f: 900, v: 0.05 }); }); }

export function slideStart(item) {
  if (!ready()) return;
  slideStop();
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = materials[material(item)].slide;
  filter.Q.value = 0.8;
  const source = ctx.createBufferSource();
  source.buffer = noiseBuffer;
  source.loop = true;
  const gain = ctx.createGain();
  gain.gain.value = 0;
  source.connect(filter);
  filter.connect(gain);
  route(gain);
  source.start();
  slide = { source, gain, timer: 0 };
}
export function slideMove(distance) {
  if (!slide || !ctx) return;
  slide.gain.gain.setTargetAtTime(Math.min(0.06, distance * 0.0022), ctx.currentTime, 0.025);
  clearTimeout(slide.timer);
  const gain = slide.gain;
  slide.timer = setTimeout(() => { try { gain.gain.setTargetAtTime(0, ctx.currentTime, 0.06); } catch { /* context closed */ } }, 70);
}
export function slideStop() {
  if (!slide) return;
  const current = slide;
  slide = null;
  clearTimeout(current.timer);
  try {
    current.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.03);
    current.source.stop(ctx.currentTime + 0.2);
  } catch { /* already stopped */ }
}
