/* ═══════════════════════════════════════════════════
   4. 퍼즐을 맞춰라! — 기획 : 안경 ⌐o-o
   문장이 말한 삼각형으로만 모양을 완성한다. 옆의 삼각형을 끌어와 돌려서 칸에 맞춘다.
   ═══════════════════════════════════════════════════ */

class GameShape extends GameBase {
  constructor() {
    super();
    this.paramSpec = [
      { key: 'problems',  label: '문제 수',               orig: 5,  unit: '문제', min: 1, max: 10, src: 'plan', note: '디자인 "남은 문제 5문제"' },
      { key: 'timeLimit', label: '제한시간 (한 문제)',      orig: 45, unit: '초',  min: 5, max: 300, src: 'plan', note: '1차 30초 → 2차 페이퍼 35초·50초의 중간 (선생님)' },
      { key: 'decoys',    label: '섞어 놓는 다른 삼각형 수', orig: 4,  unit: '개',  min: 0, max: 8,  src: 'mine', note: '2차 "삼각형을 더 많이" — 쟁반에 9~11개' },
      { key: 'sameDecoy', label: '같은 종류지만 크기가 다른 삼각형', orig: 1, unit: '개', min: 0, max: 4, src: 'mine', note: '' },
      { key: 'step',      label: '한 번에 돌리는 각',       orig: 90, unit: '°',  min: 15, max: 180, src: 'mine', note: '' }
    ];
    this.resetParams();
    this.phone = isPhone();
    if (this.phone) {
      // 폰 가로 : 판을 낮고 넓게, 쟁반은 3줄 — 같은 화면에서 판이 1.5배쯤 커진다
      this.W = 1200; this.H = 500;
      this.board = { x: 12, y: 12, w: 712, h: 476, cx: 368, cy: 290 };
      this.tray = { x: 750, y: 62, w: 436, h: 420 };
      this.fit = [620, 340]; this.trayCols = 3;
    } else {
      this.W = 1200; this.H = 760;
      this.board = { x: 20, y: 20, w: 740, h: 720, cx: 390, cy: 420 };
      this.tray = { x: 790, y: 80, w: 390, h: 660 };
      this.fit = [640, 540]; this.trayCols = 2;
    }
    // 모양 칸 (모양 가운데 기준). 2차 : 5개 → 11개, 모양마다 삼각형 3~6개.
    // 크기가 같은 칸끼리는 90°씩 돌려서 겹치게 만든다 (조각은 뒤집을 수 없으니 거울 모양 금지)
    const wing = (axis, half, len) => [[0, 0], ...[axis - half, axis + half].map(a => [len * Math.cos(a * Math.PI / 180), -len * Math.sin(a * Math.PI / 180)])];
    const hex = Array.from({ length: 6 }, (_, i) => [2 * Math.cos(i * Math.PI / 3), 2 * Math.sin(i * Math.PI / 3)]);
    this.SHAPES = [
      { cls: 'right', name: '집을', deco: '', tris: [
        [[-2, -1], [0, -1], [0, -3]], [[0, -1], [2, -1], [0, -3]],
        [[-2, -1], [2, -1], [0, 1]], [[2, -1], [2, 3], [0, 1]], [[2, 3], [-2, 3], [0, 1]], [[-2, 3], [-2, -1], [0, 1]]] },
      { cls: 'right', name: '물고기를', deco: 'rfish', tris: [
        [[0, 0], [1.6, 0], [0, -1.6]], [[0, 0], [0, -1.6], [-1.6, 0]], [[0, 0], [-1.6, 0], [0, 1.6]], [[0, 0], [0, 1.6], [1.6, 0]],
        [[-1.6, 0], [-2.8, -1.2], [-2.8, 0]], [[-1.6, 0], [-2.8, 1.2], [-2.8, 0]]] },
      { cls: 'right', name: '바람개비를', deco: 'pinwheel', extra: [[0, 3.6]], tris: [
        [[0, 0], [0, -2], [2, -2]], [[0, 0], [2, 0], [2, 2]], [[0, 0], [0, 2], [-2, 2]], [[0, 0], [-2, 0], [-2, -2]]] },
      { cls: 'right', name: '로켓을', deco: '', tris: [
        [[-0.8, -1], [0.8, -1], [0, -1.8]],
        [[-0.8, -1], [0.8, -1], [-0.8, 2]], [[0.8, -1], [0.8, 2], [-0.8, 2]],
        [[-0.8, 1], [-0.8, 2], [-1.8, 2]], [[0.8, 1], [0.8, 2], [1.8, 2]]] },
      { cls: 'acute', name: '산을', deco: '', tris: [
        [[-4, 1], [-2, 1], [-3, -0.8]], [[-2, 1], [0, 1], [-1, -1.8]], [[0, 1], [2, 1], [1, -1.2]], [[2, 1], [4, 1], [3, -0.4]]] },
      { cls: 'acute', name: '벌집을', deco: '', tris: hex.map((q, i) => [[0, 0], q, hex[(i + 1) % 6]]) },
      { cls: 'acute', name: '나비를', deco: 'butterfly', extra: [[0, -2.6]], tris: [
        wing(135, 20, 2.6), wing(45, 20, 2.6), wing(225, 22, 1.8), wing(315, 22, 1.8)] },
      { cls: 'acute', name: '물고기를', deco: 'fish', tris: [
        [[-0.3, 0], [1.5, 0], [0.6, -1.2]], [[-0.3, 0], [1.5, 0], [0.6, 1.2]], [[-0.3, 0], [-1.5, -0.8], [-1.5, 0.8]]] },
      { cls: 'obtuse', name: '우산을', deco: 'umbrella', extra: [[0, 2.7]], tris: [
        [[-3.2, 0], [-1.6, 0], [-2.4, -0.6]], [[-1.6, 0], [0, 0], [-0.8, -0.6]], [[0, 0], [1.6, 0], [0.8, -0.6]], [[1.6, 0], [3.2, 0], [2.4, -0.6]]] },
      { cls: 'obtuse', name: '지붕을', deco: '', tris: [
        [[-3, 0], [-1, 0], [-2, -0.8]], [[-1, 0], [1, 0], [0, -0.8]], [[1, 0], [3, 0], [2, -0.8]],
        [[-2, -0.8], [0, -0.8], [-1, 0]], [[0, -0.8], [2, -0.8], [1, 0]], [[-2, -0.8], [2, -0.8], [0, -1.6]]] },
      { cls: 'obtuse', name: '배를', deco: 'boat', extra: [[0, -2.8]], tris: [
        [[0.1, -2.6], [0.1, -0.2], [0.8, -1]],
        [[-3, 0], [-1, 0], [-2, 0.8]], [[-2, 0.8], [0, 0.8], [-1, 0]], [[-1, 0], [1, 0], [0, 0.8]], [[0, 0.8], [2, 0.8], [1, 0]], [[1, 0], [3, 0], [2, 0.8]]] }
    ].map(s => {
      // 모양마다 판에 맞게 키우고(최대 140, 폰 110), 가운데로 옮긴다. 우산 손잡이·배 돛대도 판 안에 들게
      const all = s.tris.flat().concat(s.extra || []), xs = all.map(q => q[0]), ys = all.map(q => q[1]);
      const k = Math.min(this.fit[0] / (Math.max(...xs) - Math.min(...xs)), this.fit[1] / (Math.max(...ys) - Math.min(...ys)), this.phone ? 110 : 140);
      const ox = (Math.max(...xs) + Math.min(...xs)) / 2, oy = (Math.max(...ys) + Math.min(...ys)) / 2;
      return Object.assign(s, { k, ox, oy, tris: s.tris.map(t => t.map(([x, y]) => [(x - ox) * k, (y - oy) * k])) });
    });
  }

  mount(stage) {
    this.stage = stage;
    const B = this.board, T = this.tray;
    stage.innerHTML = `
      <div class="sh${this.phone ? ' phone' : ''}">
        <div class="sh-field">
          <svg class="sh-svg" viewBox="0 0 ${this.W} ${this.H}" preserveAspectRatio="xMidYMid meet">
            <rect class="sh-board" x="${B.x}" y="${B.y}" width="${B.w}" height="${B.h}" rx="18"/>
            <text class="sh-order" id="sh-order" x="${B.cx}" y="${B.y + (this.phone ? 44 : 58)}"></text>
            <g id="sh-deco"></g>
            <g id="sh-slots"></g>
            <rect class="sh-tray" x="${T.x - 10}" y="${T.y - (this.phone ? 50 : 60)}" width="${T.w + 20}" height="${T.h + (this.phone ? 56 : 70)}" rx="18"/>
            <text class="sh-traylabel" x="${T.x + T.w / 2}" y="${T.y - (this.phone ? 16 : 22)}">삼각형들</text>
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
    // 세 종류가 한 번씩은 나오게 고른 뒤 섞는다
    const pool = shuffle(this.SHAPES), first = TRI_KEYS.map(k => pool.find(s => s.cls === k));
    this.order = shuffle(first.concat(pool.filter(s => !first.includes(s))).slice(0, this.p.problems));
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
        const off = Math.max(this.phone ? 30 : 26, Math.min(0.34 * d, 40));   // 여러 칸이 한 점에 모이면 글씨를 조금 더 안쪽으로
        const tx = svgEl('text', { x: q[0] + dx / d * off, y: q[1] + dy / d * off + 6, class: 'sh-vlabel' }, g);
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
    // 쟁반 칸에 맞춰 조각을 줄여 보여 준다 (끌어 올리면 실제 크기). 칸이 가장 커지는 열 수를 고른다
    const big = Math.max(...specs.map(sp => 2 * Math.max(...sp.pts.map(q => Math.hypot(q[0], q[1])))));
    const cell = (c) => Math.min(this.tray.w / c, this.tray.h / Math.ceil(specs.length / c));
    const cols = [this.trayCols, this.trayCols + 1].reduce((a, c) => cell(c) > cell(a) ? c : a);
    this.kit.o.trayScale = Math.min(this.phone ? 0.62 : 0.56, (cell(cols) - 10) / big);
    const list = shuffle(specs).map(sp => this.kit.add(Object.assign(sp, { home: { x: 0, y: 0 } })));
    this.kit.layoutTray(list, this.tray, cols);
    list.forEach(p => this.kit.home(p));
  }

  drawDeco(S) {
    const kind = S.deco, u = S.k, B = this.board, g = $('#sh-deco'), x = B.cx - S.ox * u, y = B.cy - S.oy * u;
    const L = (d) => `<path d="${d}" class="sh-decoline"/>`, P = (a, b) => `${x + a * u} ${y + b * u}`;
    g.innerHTML = kind === 'umbrella'
      ? `<path d="M${x} ${y} V${y + 2.3 * u} a${0.35 * u} ${0.35 * u} 0 0 1 ${-0.7 * u} 0" class="sh-decoline"/>`
      : kind === 'boat' ? L(`M${P(0, -2.8)} L${P(0, 0)}`)
      : kind === 'pinwheel' ? L(`M${P(0, 0)} L${P(0, 3.6)}`)
      : kind === 'butterfly' ? L(`M${P(0, -0.9)} L${P(0, 1.3)}`) + L(`M${P(-0.08, -0.9)} L${P(-0.5, -2.6)}`) + L(`M${P(0.08, -0.9)} L${P(0.5, -2.6)}`)
      : kind === 'fish' ? `<circle cx="${x + 0.9 * u}" cy="${y - 0.25 * u}" r="5" class="sh-decodot"/>`
      : kind === 'rfish' ? `<circle cx="${x + 0.6 * u}" cy="${y - 0.35 * u}" r="6" class="sh-decodot"/>` : '';
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
    p.x = c[0]; p.y = c[1]; p.g.classList.add('near', p.cls); this.kit.draw(p);
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
