/* ═══════════════════════════════════════════════════
   pieces.js — 삼각형 조각 끌기·돌리기 (게임 4·5 공용)
   조각 좌표는 무게중심 기준. 화면 위치는 translate(x,y) rotate(rot) scale(s).
   ═══════════════════════════════════════════════════ */

class PieceKit {
  /**
   * opt.svg, opt.layer(조각을 그릴 g), opt.trayScale, opt.step(돌리는 각),
   * opt.onDrop(p) — 놓았을 때. true 를 돌려주면 처리 끝, 아니면 제자리로.
   * opt.onRotate(p) — 돌린 뒤
   */
  constructor(game, opt) {
    this.game = game; this.o = Object.assign({ trayScale: 0.5, step: 90 }, opt);
    this.svg = opt.svg; this.layer = opt.layer;
    this.list = []; this.sel = null; this.drag = null;
    this.handle = svgEl('g', { class: 'pk-handle' });
    this.handle.innerHTML = `<circle r="22"/><path d="M-8 -9 a11 11 0 1 1 -3 13" /><path d="M-13 -14 l5 6 l-7 2" />`;
    this.handle.style.display = 'none';
    this.handle.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); this.rotateSel(); });
    game.on(this.svg, 'pointermove', (e) => this.move(e));
    game.on(window, 'pointerup', (e) => this.up(e));
    game.on(this.svg, 'wheel', (e) => { if (this.sel && !this.sel.locked) { e.preventDefault(); this.rotateSel(); } }, { passive: false });
  }
  clear() { this.list.forEach(p => p.g.remove()); this.list = []; this.sel = null; this.drag = null; this.handle.style.display = 'none'; }

  /** spec : { pts, cls, rot, home:{x,y}, data } */
  add(spec) {
    const p = Object.assign({ id: this.list.length, rot: 0, locked: false, state: 'tray' }, spec);
    p.x = p.home.x; p.y = p.home.y; p.s = this.o.trayScale;
    p.R = Math.max(...p.pts.map(q => Math.hypot(q[0], q[1])));
    p.g = svgEl('g', { class: 'pk ' + (p.extraClass || '') }, this.layer);
    p.poly = svgEl('polygon', { points: ptsAttr(p.pts) }, p.g);
    p.g.addEventListener('pointerdown', (e) => this.down(e, p));
    this.list.push(p); this.draw(p);
    return p;
  }
  draw(p, fly) {
    p.g.classList.toggle('fly', !!fly);
    p.g.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.rot}deg) scale(${p.s})`;
    if (p === this.sel) this.placeHandle();
  }
  /** 실제 크기(scale 1)로 (x,y)·rot 에 놓였을 때의 꼭짓점 */
  world(p, x = p.x, y = p.y, rot = p.rot) {
    return rotPts(p.pts, rot).map(([a, b]) => [a + x, b + y]);
  }
  home(p) {
    p.state = 'tray'; p.x = p.home.x; p.y = p.home.y; p.s = this.o.trayScale;
    p.g.classList.remove('placed', 'acute', 'right', 'obtuse');
    this.draw(p, true);
  }
  select(p) {
    if (this.sel) this.sel.g.classList.remove('sel');
    this.sel = p;
    if (p) { p.g.classList.add('sel'); this.layer.appendChild(p.g); }
    this.placeHandle();
  }
  placeHandle() {
    const p = this.sel;
    if (!p || p.locked || p.state === 'drag') { this.handle.style.display = 'none'; return; }
    const r = p.R * p.s;
    this.handle.style.display = '';
    this.handle.setAttribute('transform', `translate(${p.x + r * 0.8 + 14} ${p.y - r * 0.8 - 14})`);
    this.layer.appendChild(this.handle);
  }
  rotate(p, step = this.o.step) {
    if (!p || p.locked) return;
    p.rot = (p.rot + step) % 360;
    SFX.turn(); this.draw(p);
    if (this.o.onRotate) this.o.onRotate(p);
  }
  rotateSel() { this.rotate(this.sel); }

  toSvg(e) {
    const pt = this.svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const q = pt.matrixTransform(this.svg.getScreenCTM().inverse());
    return [q.x, q.y];
  }
  down(e, p) {
    if (p.locked || this.game.paused || this.game.over) return;
    e.preventDefault(); e.stopPropagation();
    const [x, y] = this.toSvg(e);
    this.select(p);
    this.drag = { p, dx: p.state === 'tray' ? 0 : p.x - x, dy: p.state === 'tray' ? 0 : p.y - y, from: p.state, moved: false, sx: x, sy: y };
    if (this.o.onPick) this.o.onPick(p);
    p.state = 'drag'; p.s = 1;
    p.g.classList.add('dragging');
    this.handle.style.display = 'none';
    p.x = x + this.drag.dx; p.y = y + this.drag.dy; this.draw(p);
  }
  move(e) {
    if (!this.drag) return;
    const [x, y] = this.toSvg(e), d = this.drag;
    if (Math.hypot(x - d.sx, y - d.sy) > 6) d.moved = true;
    d.p.x = x + d.dx; d.p.y = y + d.dy; this.draw(d.p);
  }
  up() {
    if (!this.drag) return;
    const { p, from, moved } = this.drag;
    this.drag = null;
    p.g.classList.remove('dragging');
    // 움직이지 않고 톡 누르기만 했으면 그 자리에서 돌린다
    if (!moved) {
      p.state = from;
      if (from === 'tray') { p.s = this.o.trayScale; p.x = p.home.x; p.y = p.home.y; this.draw(p); this.rotate(p); }
      else this.rotate(p);
      this.placeHandle(); return;
    }
    p.state = 'free';
    const ok = this.o.onDrop ? this.o.onDrop(p, from) : false;
    if (!ok) this.home(p);
    this.placeHandle();
  }
  /** 테스트용 : 조각을 (x,y)에 놓는다 */
  dropAt(p, x, y, rot = p.rot) {
    this.select(p);
    const from = p.state;
    p.state = 'free'; p.s = 1; p.x = x; p.y = y; p.rot = rot; this.draw(p);
    const ok = this.o.onDrop ? this.o.onDrop(p, from) : false;
    if (!ok) this.home(p);
    return ok;
  }
  /** 쟁반(트레이)에 줄 맞춰 배치 */
  layoutTray(list, rect, cols) {
    const rows = Math.ceil(list.length / cols);
    const cw = rect.w / cols, ch = rect.h / Math.max(rows, 1);
    list.forEach((p, i) => {
      p.home = { x: rect.x + (i % cols + 0.5) * cw, y: rect.y + (Math.floor(i / cols) + 0.5) * ch };
      if (p.state === 'tray') { p.x = p.home.x; p.y = p.home.y; this.draw(p); }
    });
  }
}

/* ── 모양 비교 ───────────────────────────────────── */
/** 두 삼각형이 꼭짓점끼리 tol 안에 겹치는가 (순서 무관) */
function sameSpot(a, b, tol = 14) {
  return a.every(p => b.some(q => Math.hypot(p[0] - q[0], p[1] - q[1]) < tol));
}
/** 세 변 길이가 같은가 (돌리면 겹치는 모양) */
function sameShape(a, b, tol = 4) {
  const sides = (t) => [0, 1, 2].map(i => Math.hypot(t[i][0] - t[(i + 1) % 3][0], t[i][1] - t[(i + 1) % 3][1])).sort((x, y) => x - y);
  const s1 = sides(a), s2 = sides(b);
  return s1.every((v, i) => Math.abs(v - s2[i]) < tol);
}
function centroid(t) { return [(t[0][0] + t[1][0] + t[2][0]) / 3, (t[0][1] + t[1][1] + t[2][1]) / 3]; }
function center(t) { const c = centroid(t); return t.map(([x, y]) => [x - c[0], y - c[1]]); }
/** 점이 삼각형 안에 있는가 */
function inTri(px, py, t) {
  const s = (a, b, c) => (a[0] - c[0]) * (b[1] - c[1]) - (b[0] - c[0]) * (a[1] - c[1]);
  const P = [px, py], d1 = s(P, t[0], t[1]), d2 = s(P, t[1], t[2]), d3 = s(P, t[2], t[0]);
  const neg = d1 < 0 || d2 < 0 || d3 < 0, pos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(neg && pos);
}
/** 각 셋으로 삼각형을 만들어 정해진 크기(가장 긴 변 = len)로 */
function triBySides(cls, len, opt) {
  const t = makeTriangle(cls, 60, opt);
  const L = Math.max(...[0, 1, 2].map(i => Math.hypot(t.pts[i][0] - t.pts[(i + 1) % 3][0], t.pts[i][1] - t.pts[(i + 1) % 3][1])));
  return { cls, pts: t.pts.map(([x, y]) => [x * len / L, y * len / L]), angles: t.angles };
}
/** 변에서 margin 이상 안쪽에 있을 때만 참 (맞닿은 변은 겹침으로 치지 않기 위해) */
function inTriStrict(px, py, t, margin = 2) {
  let sign = 0;
  for (let i = 0; i < 3; i++) {
    const a = t[i], b = t[(i + 1) % 3];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const d = ((b[0] - a[0]) * (py - a[1]) - (b[1] - a[1]) * (px - a[0])) / len;
    if (Math.abs(d) < margin) return false;
    const s = Math.sign(d);
    if (sign && s !== sign) return false;
    sign = s;
  }
  return true;
}
