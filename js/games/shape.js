/* ═══════════════════════════════════════════════════
   4. 퍼즐을 맞춰라! — 기획 : 안경 ⌐o-o
   문장이 말한 삼각형으로만 모양을 완성한다. 옆의 삼각형을 끌어와 돌려서 칸에 맞춘다.
   ═══════════════════════════════════════════════════ */

class GameShape extends GameBase {
  constructor() {
    super();
    this.paramSpec = [
      { key: 'problems',  label: '문제 수',               orig: 5,  unit: '문제', min: 1, max: 10, src: 'plan', note: '디자인 "남은 문제 5문제"' },
      { key: 'timeLimit', label: '제한시간 (한 문제)',      orig: 30, unit: '초',  min: 5, max: 300, src: 'plan', note: '규칙 "제한시간은 30초" — 한 문제마다로 풀었다' },
      { key: 'decoys',    label: '섞어 놓는 다른 삼각형 수', orig: 3,  unit: '개',  min: 0, max: 8,  src: 'mine', note: '디자인의 삼각형 9개에 맞춤' },
      { key: 'sameDecoy', label: '같은 종류지만 크기가 다른 삼각형', orig: 1, unit: '개', min: 0, max: 4, src: 'mine', note: '' },
      { key: 'step',      label: '한 번에 돌리는 각',       orig: 90, unit: '°',  min: 15, max: 180, src: 'mine', note: '' }
    ];
    this.resetParams();
    this.W = 1200; this.H = 760;
    this.board = { x: 20, y: 20, w: 740, h: 720, cx: 390, cy: 420 };
    this.tray = { x: 790, y: 80, w: 390, h: 660 };
    // 모양 칸 (모양 가운데 기준). 거울에 비친 모양이 필요 없도록 이등변을 주로 쓴다
    this.SHAPES = [
      { cls: 'right', name: '집을', deco: '', tris: [
        [[-1.5, -0.9], [0, -0.9], [0, -2.4]], [[0, -0.9], [1.5, -0.9], [0, -2.4]],
        [[-1, -0.9], [1, -0.9], [-1, 1.1]], [[1, -0.9], [1, 1.1], [-1, 1.1]]] },
      { cls: 'acute', name: '산을', deco: '', tris: [
        [[-3, 1], [-1, 1], [-2, -0.7]], [[-1, 1], [1, 1], [0, -1.9]], [[1, 1], [3, 1], [2, -0.7]]] },
      { cls: 'obtuse', name: '우산을', deco: 'umbrella', tris: [
        [[-3, 0], [-1, 0], [-2, -0.55]], [[-1, 0], [1, 0], [0, -0.55]], [[1, 0], [3, 0], [2, -0.55]]] },
      { cls: 'right', name: '배를', deco: 'boat', tris: [
        [[0.1, -2.4], [0.1, 0], [1.8, 0]], [[-0.1, -1.7], [-0.1, 0], [-1.3, 0]], [[-1.9, 0.25], [1.9, 0.25], [0, 2.15]]] },
      { cls: 'acute', name: '물고기를', deco: 'fish', tris: [
        [[-0.3, 0], [1.5, 0], [0.6, -1.2]], [[-0.3, 0], [1.5, 0], [0.6, 1.2]], [[-0.3, 0], [-1.5, -0.8], [-1.5, 0.8]]] }
    ].map(s => {
      // 모양마다 판에 맞게 키우고(최대 110), 가운데로 옮긴다
      const all = s.tris.flat(), xs = all.map(q => q[0]), ys = all.map(q => q[1]);
      const k = Math.min(470 / (Math.max(...xs) - Math.min(...xs)), 420 / (Math.max(...ys) - Math.min(...ys)), 110);
      const ox = (Math.max(...xs) + Math.min(...xs)) / 2, oy = (Math.max(...ys) + Math.min(...ys)) / 2;
      return Object.assign(s, { k, ox, oy, tris: s.tris.map(t => t.map(([x, y]) => [(x - ox) * k, (y - oy) * k])) });
    });
  }

  mount(stage) {
    this.stage = stage;
    const B = this.board, T = this.tray;
    stage.innerHTML = `
      <div class="sh">
        <div class="sh-field">
          <svg class="sh-svg" viewBox="0 0 ${this.W} ${this.H}" preserveAspectRatio="xMidYMid meet">
            <rect class="sh-board" x="${B.x}" y="${B.y}" width="${B.w}" height="${B.h}" rx="18"/>
            <text class="sh-order" id="sh-order" x="${B.cx}" y="${B.y + 58}"></text>
            <g id="sh-deco"></g>
            <g id="sh-slots"></g>
            <rect class="sh-tray" x="${T.x - 10}" y="${T.y - 60}" width="${T.w + 20}" height="${T.h + 70}" rx="18"/>
            <text class="sh-traylabel" x="${T.x + T.w / 2}" y="${T.y - 22}">삼각형들</text>
            <g id="sh-pieces"></g>
          </svg>
        </div>
        <aside class="sh-side">
          <div class="sh-stat"><em>남은 문제</em><b id="sh-left">5</b><span>문제</span></div>
          <div class="sh-stat"><em>제한시간</em><b>${this.p.timeLimit}</b><span>초</span></div>
          <div class="sh-stat big" id="sh-timebox"><em>남은 시간</em><b id="sh-time">30</b><span>초</span></div>
          <div class="sh-dots" id="sh-dots"></div>
          <p class="sh-help"><kbd>R</kbd> 돌리기</p>
        </aside>
      </div>`;
    this.svg = $('.sh-svg', stage);
    this.kit = new PieceKit(this, {
      svg: this.svg, layer: $('#sh-pieces', stage), trayScale: 0.56, step: this.p.step,
      onDrop: (p) => this.drop(p), onRotate: (p) => { if (p.state === 'board') this.tryFit(p, true); }
    });
    this.bindKeys((e) => {
      if (e.key === 'r' || e.key === 'R' || e.key === 'ㄱ' || e.key === ' ') { e.preventDefault(); this.kit.rotateSel(); }
    });
    this.every(100, () => this.tick());
    this.newGame();
  }

  newGame() {
    this.over = false; this.idx = -1; this.results = [];
    this.order = shuffle(this.SHAPES).slice(0, this.p.problems);
    this.next();
  }
  next() {
    this.idx++;
    if (this.idx >= this.order.length) return this.finish();
    this.busy = false;
    const S = this.cur = this.order[this.idx], B = this.board;
    this.left = this.p.timeLimit;
    $('#sh-left').textContent = this.order.length - this.idx;
    $('#sh-order').innerHTML = `<tspan class="${S.cls}">${TRI[S.cls].full}</tspan>을 사용해서 ${S.name} 만들어 보세요.`;
    this.renderDots();
    // 칸
    const gs = $('#sh-slots'); gs.innerHTML = '';
    this.slots = S.tris.map((t, i) => {
      const pts = t.map(([x, y]) => [x + B.cx, y + B.cy]);
      const g = svgEl('g', { class: 'sh-slot' }, gs);
      svgEl('polygon', { points: ptsAttr(pts) }, g);
      const c = centroid(pts), ang = anglesOf(pts);
      pts.forEach((q, k) => {
        const dx = c[0] - q[0], dy = c[1] - q[1], d = Math.hypot(dx, dy) || 1;
        const kind = ang[k] > 90.5 ? '둔각' : ang[k] > 89.5 ? '직각' : '예각';
        const tx = svgEl('text', { x: q[0] + dx / d * 30, y: q[1] + dy / d * 30 + 5, class: 'sh-vlabel' }, g);
        tx.textContent = kind;
      });
      return { i, pts, g, filled: false };
    });
    this.drawDeco(S);
    // 조각 : 칸마다 하나 + 다른 종류 + 같은 종류 다른 크기
    this.kit.clear();
    const specs = this.slots.map(s => ({ pts: center(s.pts), cls: S.cls, rot: pick([90, 180, 270]) }));
    const others = TRI_KEYS.filter(k => k !== S.cls);
    for (let i = 0; i < this.p.decoys; i++) {
      const t = triBySides(pick(others), rnd(110, 190), { acuteMax: 76, obtuseMin: 108 });
      specs.push({ pts: t.pts, cls: t.cls, rot: rndInt(0, 3) * 90 });
    }
    for (let i = 0; i < this.p.sameDecoy; i++) {
      const src = pick(this.slots), k = pick([0.7, 1.3]);
      specs.push({ pts: center(src.pts).map(([x, y]) => [x * k, y * k]), cls: S.cls, rot: rndInt(0, 3) * 90, odd: true });
    }
    const list = shuffle(specs).map(sp => this.kit.add(Object.assign(sp, { home: { x: 0, y: 0 } })));
    this.kit.layoutTray(list, this.tray, 2);
    list.forEach(p => this.kit.home(p));
  }

  drawDeco(S) {
    const kind = S.deco, u = S.k, B = this.board, g = $('#sh-deco'), x = B.cx - S.ox * u, y = B.cy - S.oy * u;
    g.innerHTML = kind === 'umbrella'
      ? `<path d="M${x} ${y} V${y + 2.3 * u} a${0.35 * u} ${0.35 * u} 0 0 1 ${-0.7 * u} 0" class="sh-decoline"/>`
      : kind === 'boat' ? `<path d="M${x} ${y - 2.6 * u} V${y + 0.25 * u}" class="sh-decoline"/>`
      : kind === 'fish' ? `<circle cx="${x + 0.9 * u}" cy="${y - 0.25 * u}" r="5" class="sh-decodot"/>` : '';
  }

  /* ── 놓기 ───────────────────────────────── */
  inBoard(x, y) { const B = this.board; return x > B.x && x < B.x + B.w && y > B.y && y < B.y + B.h; }
  drop(p) {
    if (this.busy) return false;
    if (!this.inBoard(p.x, p.y)) return false;
    p.state = 'board';
    return this.tryFit(p, false) !== 'out';
  }
  /** 칸에 맞는지 본다. 'lock' | 'stay' | 'out' */
  tryFit(p, afterRotate) {
    const near = this.slots.filter(s => !s.filled)
      .map(s => ({ s, d: Math.hypot(centroid(s.pts)[0] - p.x, centroid(s.pts)[1] - p.y) }))
      .sort((a, b) => a.d - b.d)[0];
    if (!near || near.d > 80) { if (!afterRotate) { Toast.show('칸 위에 놓아'); } return afterRotate ? 'stay' : 'out'; }
    const s = near.s;
    if (p.cls !== this.cur.cls) { SFX.bad(); Toast.show(`${TRI[this.cur.cls].name}삼각형이 아니야`, 'bad'); this.kit.home(p); return 'out'; }
    const c = centroid(s.pts);
    const w = this.kit.world(p, c[0], c[1]);
    if (!sameShape(w, s.pts)) { SFX.bad(); Toast.show('크기가 달라', 'bad'); this.kit.home(p); return 'out'; }
    if (sameSpot(w, s.pts)) {
      p.x = c[0]; p.y = c[1]; p.locked = true; p.state = 'locked'; s.filled = true;
      p.g.classList.add('locked', p.cls); this.kit.draw(p); this.kit.select(null);
      s.g.classList.add('filled'); SFX.good();
      if (this.slots.every(x => x.filled)) this.solved();
      return 'lock';
    }
    // 같은 모양이지만 방향이 다름 → 칸 위에 두고 돌리게 한다
    p.x = c[0]; p.y = c[1]; this.kit.draw(p);
    if (!afterRotate) { SFX.select(); Toast.show('돌려 봐'); }
    return 'stay';
  }

  /* ── 진행 ───────────────────────────────── */
  tick() {
    if (this.over || this.paused || this.busy) return;
    this.left -= 0.1;
    const t = Math.max(0, Math.ceil(this.left));
    $('#sh-time').textContent = t;
    $('#sh-timebox').classList.toggle('hot', this.left <= 10);
    if (this.left <= 0) this.timeUp();
  }
  solved() {
    this.busy = true;
    this.results.push({ shape: this.cur.name, cls: this.cur.cls, ok: true, used: +(this.p.timeLimit - this.left).toFixed(1) });
    this.renderDots(); SFX.win(); Toast.show('완성!', 'good');
    this.after(1100, () => this.next());
  }
  timeUp() {
    this.busy = true;
    this.results.push({ shape: this.cur.name, cls: this.cur.cls, ok: false, used: this.p.timeLimit });
    this.renderDots(); SFX.lose(); Toast.show('시간 끝', 'bad');
    this.slots.forEach(s => s.g.classList.add('miss'));
    this.after(1400, () => this.next());
  }
  renderDots() {
    $('#sh-dots').innerHTML = Array.from({ length: this.p.problems }, (_, i) => {
      const r = this.results[i];
      return `<i class="${r ? (r.ok ? 'ok' : 'no') : i === this.idx ? 'now' : ''}"></i>`;
    }).join('');
  }
  finish() {
    this.over = true; this.kit.clear();
    const ok = this.results.filter(r => r.ok).length;
    this.lastResult = { ok, total: this.results.length, results: this.results };
    ok === this.results.length ? SFX.win() : SFX.lose();
    Overlay.show({
      kicker: 'Puzzle', title: ok === this.results.length ? '모두 완성!' : '끝',
      body: statsHTML([[`${ok}/${this.results.length}`, '완성한 퍼즐'],
        [ok ? (this.results.filter(r => r.ok).reduce((a, r) => a + r.used, 0) / ok).toFixed(1) + '초' : '—', '한 문제 평균']]),
      actions: [{ label: '다시', key: 'Enter', primary: true, onClick: () => this.newGame() }]
    });
  }
}
gameClasses[4] = GameShape;
