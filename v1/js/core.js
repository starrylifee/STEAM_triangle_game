/* ═══════════════════════════════════════════════════
   core.js — 효과음 · 유틸 · 삼각형 기하 · GameBase · 화면 전환
   ═══════════════════════════════════════════════════ */

/* ── 1. 효과음 (Web Audio, 음원 파일 없음) ──────── */
class SoundSynth {
  constructor() { this.ctx = null; this.on = true; }
  _ac() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }
  _tone(freq, dur, type = 'sine', vol = 0.12, delay = 0) {
    if (!this.on) return;
    const ac = this._ac(); if (!ac) return;
    const t0 = ac.currentTime + delay;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(ac.destination); o.start(t0); o.stop(t0 + dur + 0.02);
  }
  _sweep(f1, f2, dur, type = 'sine', vol = 0.1) {
    if (!this.on) return;
    const ac = this._ac(); if (!ac) return;
    const t0 = ac.currentTime;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f1, t0);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t0 + dur);
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(ac.destination); o.start(t0); o.stop(t0 + dur + 0.02);
  }
  _noise(dur = 0.1, vol = 0.1, hp = 1200) {
    if (!this.on) return;
    const ac = this._ac(); if (!ac) return;
    const len = Math.floor(ac.sampleRate * dur);
    const buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    f.type = 'highpass'; f.frequency.value = hp;
    s.buffer = buf; g.gain.value = vol;
    s.connect(f).connect(g).connect(ac.destination); s.start();
  }
  select()  { this._tone(620, 0.08, 'triangle', 0.1); }
  turn()    { this._sweep(380, 560, 0.12, 'triangle', 0.08); }
  snip()    { this._noise(0.06, 0.16, 2500); this._tone(1400, 0.03, 'square', 0.04); }
  good()    { [660, 880].forEach((f, i) => this._tone(f, 0.16, 'triangle', 0.11, i * 0.07)); }
  bad()     { this._sweep(300, 120, 0.3, 'sawtooth', 0.07); }
  splash()  { this._noise(0.25, 0.12, 600); }
  reel()    { for (let i = 0; i < 5; i++) this._tone(900 + i * 60, 0.03, 'square', 0.03, i * 0.05); }
  tick()    { this._tone(1200, 0.03, 'square', 0.04); }
  win()     { [523, 659, 784, 1047].forEach((f, i) => this._tone(f, 0.34, 'triangle', 0.12, i * 0.1)); }
  lose()    { [392, 330, 262].forEach((f, i) => this._tone(f, 0.3, 'sine', 0.12, i * 0.14)); }
}
const SFX = new SoundSynth();

/* ── 2. 유틸 ─────────────────────────────────────── */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const SVGNS = 'http://www.w3.org/2000/svg';
function el(tag, cls, html) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
}
function svgEl(tag, attrs = {}, parent) {
  const n = document.createElementNS(SVGNS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
}
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rnd = (a, b) => a + Math.random() * (b - a);
const rndInt = (a, b) => Math.floor(rnd(a, b + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
function shuffle(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const pad2 = (n) => String(n).padStart(2, '0');
const mmss = (s) => `${Math.floor(s / 60)}:${pad2(Math.max(0, Math.floor(s % 60)))}`;

/* ── 3. 삼각형 기하 ──────────────────────────────── */
const TRI = {
  acute:  { name: '예각', full: '예각삼각형', color: 'var(--acute)',  hex: '#FF5A36' },
  right:  { name: '직각', full: '직각삼각형', color: 'var(--right)',  hex: '#3D7CFF' },
  obtuse: { name: '둔각', full: '둔각삼각형', color: 'var(--obtuse)', hex: '#FFB81C' }
};
const TRI_KEYS = ['acute', 'right', 'obtuse'];

/** 세 각을 정한다. opt.acuteMax: 예각삼각형의 가장 큰 각 상한, opt.obtuseMin: 둔각의 하한 */
function makeAngles(cls, opt = {}) {
  const acuteMax = opt.acuteMax ?? 78, obtuseMin = opt.obtuseMin ?? 104, obtuseMax = opt.obtuseMax ?? 138;
  const minA = opt.minA ?? 28;
  for (let k = 0; k < 400; k++) {
    let a;
    if (cls === 'right') {
      const b = rnd(Math.max(minA, 24), 90 - Math.max(minA, 24));
      a = [90, b, 90 - b];
    } else if (cls === 'obtuse') {
      const o = rnd(obtuseMin, obtuseMax);
      const b = rnd(Math.min(minA, 18), 180 - o - Math.min(minA, 18));
      a = [o, b, 180 - o - b];
    } else {
      const lo = Math.max(minA, 180 - 2 * acuteMax);
      const x = rnd(lo, acuteMax), y = rnd(lo, acuteMax), z = 180 - x - y;
      if (z < lo || z > acuteMax) continue;
      a = [x, y, z];
    }
    if (a.every(v => v >= 12)) return shuffle(a);
  }
  return cls === 'right' ? [90, 45, 45] : cls === 'obtuse' ? [120, 30, 30] : [60, 60, 60];
}

/** 각으로 삼각형 꼭짓점을 만든다. 무게중심이 (0,0), 외접원 반지름 R */
function makeTriangle(cls, R = 60, opt = {}) {
  const ang = makeAngles(cls, opt);
  const rad = ang.map(d => d * Math.PI / 180);
  // 변의 길이 = 2R sin(마주 보는 각)
  const c = 2 * R * Math.sin(rad[2]);   // A-B 사이 (C의 맞은편)
  const b = 2 * R * Math.sin(rad[1]);   // A-C 사이
  const A = [0, 0], B = [c, 0], C = [b * Math.cos(rad[0]), -b * Math.sin(rad[0])];
  const gx = (A[0] + B[0] + C[0]) / 3, gy = (A[1] + B[1] + C[1]) / 3;
  const pts = [A, B, C].map(p => [p[0] - gx, p[1] - gy]);
  return { cls, pts, angles: ang.map(Math.round) };
}

/** 꼭짓점 셋 → 각 셋(도). 꼭짓점 순서대로 */
function anglesOf(pts) {
  const out = [];
  for (let i = 0; i < 3; i++) {
    const p = pts[i], q = pts[(i + 1) % 3], r = pts[(i + 2) % 3];
    const v1 = [q[0] - p[0], q[1] - p[1]], v2 = [r[0] - p[0], r[1] - p[1]];
    const dot = v1[0] * v2[0] + v1[1] * v2[1];
    const m = Math.hypot(...v1) * Math.hypot(...v2) || 1;
    out.push(Math.acos(clamp(dot / m, -1, 1)) * 180 / Math.PI);
  }
  return out;
}
/** 가장 큰 각으로 종류 판정. tol 안쪽이면 직각 */
function classify(angles, tol = 2) {
  const mx = Math.max(...angles);
  if (Math.abs(mx - 90) <= tol) return 'right';
  return mx < 90 ? 'acute' : 'obtuse';
}
function areaOf(pts) {
  const [a, b, c] = pts;
  return Math.abs((b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1])) / 2;
}
const ptsAttr = (pts) => pts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
function rotPts(pts, deg) {
  const t = deg * Math.PI / 180, cs = Math.cos(t), sn = Math.sin(t);
  return pts.map(([x, y]) => [x * cs - y * sn, x * sn + y * cs]);
}

/* ── 4. 토스트 ───────────────────────────────────── */
const Toast = {
  t: null,
  show(msg, kind = '') {
    const n = $('#toast');
    n.hidden = true; void n.offsetWidth;
    n.className = 'toast ' + kind; n.textContent = msg; n.hidden = false;
    clearTimeout(this.t);
    this.t = setTimeout(() => { n.hidden = true; }, 1150);
  }
};

/* ── 5. 결과 오버레이 ───────────────────────────── */
const Overlay = {
  keyHandler: null,
  /** opt: { kicker, title, body(html), actions: [{label, key, primary, onClick}] } */
  show(opt) {
    if (!$('#modal').hidden) { $('#modal').hidden = true; resumeGame(); }
    $('#ov-kicker').textContent = opt.kicker || '';
    $('#ov-title').textContent = opt.title || '';
    $('#ov-body').innerHTML = opt.body || '';
    const box = $('#ov-actions'); box.innerHTML = '';
    (opt.actions || []).forEach(a => {
      const b = el('button', 'btn' + (a.primary ? ' primary' : ''), `${a.label}${a.key ? ` <kbd>${a.key}</kbd>` : ''}`);
      b.type = 'button';
      b.onclick = () => { this.hide(); a.onClick && a.onClick(); };
      box.appendChild(b);
    });
    $('#overlay').hidden = false;
    this.keyHandler = (e) => {
      const hit = (opt.actions || []).find(a => a.key && (e.key === a.key || (a.key === 'Enter' && e.key === 'Enter')));
      if (hit) { e.preventDefault(); e.stopPropagation(); this.hide(); hit.onClick && hit.onClick(); }
    };
    window.addEventListener('keydown', this.keyHandler, true);
  },
  hide() {
    $('#overlay').hidden = true;
    $('#ov-actions').innerHTML = '';
    if (this.keyHandler) window.removeEventListener('keydown', this.keyHandler, true);
    this.keyHandler = null;
  },
  get open() { return !$('#overlay').hidden; }
};
function statsHTML(list) {
  return `<div class="ov-stats">${list.map(([v, k]) => `<div class="ov-stat"><b>${v}</b><span>${k}</span></div>`).join('')}</div>`;
}

/* ── 6. GameBase ────────────────────────────────── */
/* 타이머·키·이벤트를 여기서 등록하면 게임을 나갈 때 한꺼번에 정리된다. */
class GameBase {
  constructor() { this._timers = []; this._rafs = []; this._keys = null; this._ls = []; this.paused = false; }
  /** paramSpec → this.p */
  resetParams() { this.p = {}; (this.paramSpec || []).forEach(s => { this.p[s.key] = s.orig; }); }
  after(ms, fn) { const id = setTimeout(() => { this._timers = this._timers.filter(t => t !== id); fn(); }, ms); this._timers.push(id); return id; }
  every(ms, fn) { const id = setInterval(fn, ms); this._timers.push(id); return id; }
  clearTimers() { this._timers.forEach(id => { clearTimeout(id); clearInterval(id); }); this._timers = []; }
  loop(fn) {
    let last = performance.now();
    const step = (t) => {
      const dt = Math.min(0.05, (t - last) / 1000); last = t;
      if (!this.paused) fn(dt, t);
      this._raf = requestAnimationFrame(step);
    };
    this._raf = requestAnimationFrame(step);
  }
  stopLoop() { if (this._raf) cancelAnimationFrame(this._raf); this._raf = null; }
  bindKeys(fn) {
    this.unbindKeys();
    this._keys = (e) => {
      if (Overlay.open || !$('#modal').hidden) return;
      if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
      fn(e);
    };
    window.addEventListener('keydown', this._keys);
  }
  unbindKeys() { if (this._keys) window.removeEventListener('keydown', this._keys); this._keys = null; }
  on(target, type, fn, opt) { target.addEventListener(type, fn, opt); this._ls.push([target, type, fn, opt]); }
  destroy() {
    this.clearTimers(); this.stopLoop(); this.unbindKeys();
    this._ls.forEach(([t, ty, fn, o]) => t.removeEventListener(ty, fn, o)); this._ls = [];
  }
  pause() { this.paused = true; }
  resume() { this.paused = false; }
}

/* ── 7. 화면 전환 ───────────────────────────────── */
const gameClasses = {};     // n → class
let current = null;         // { n, game }

function showView(name) {
  $('#view-home').hidden = name !== 'home';
  $('#view-game').hidden = name !== 'game';
}
function enterGame(n) {
  const G = GAMES[n]; if (!G || !gameClasses[n]) return;
  leaveGame();
  $('#g-num').textContent = pad2(n);
  $('#g-title').textContent = G.title;
  $('#g-who').textContent = `기획 · ${G.who}`;
  $('#btn-latest').href = '../#' + G.id;
  showView('game');
  const game = new gameClasses[n]();
  current = { n, game };
  const stage = $('#stage'); stage.innerHTML = ''; stage.className = 'stage stage-' + G.id;
  game.mount(stage);
  history.replaceState(null, '', '#' + G.id);
}
function leaveGame() {
  if (current) { current.game.destroy(); current = null; }
  Overlay.hide();
  $('#stage').innerHTML = '';
}
function backHome() {
  leaveGame(); showView('home');
  history.replaceState(null, '', location.pathname);
}
function pauseGame() { if (current) current.game.pause(); }
function resumeGame() { if (current) current.game.resume(); }
