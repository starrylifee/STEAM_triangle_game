/* ═══════════════════════════════════════════════════
   2. 피자 자르기 — 기획 : 키위 맛 우유
   손님이 말한 삼각형(예각·둔각)으로 둥근 피자를 가위질해 한 조각 낸다.
   ═══════════════════════════════════════════════════ */

class GamePizza extends GameBase {
  constructor() {
    super();
    this.paramSpec = [
      { key: 'timeLimit',   label: '제한 시간',               orig: 60,  unit: '초', min: 20, max: 300, src: 'plan', note: '규칙 "1분 안에"' },
      { key: 'goal',        label: '이기려면 자를 손님 수',     orig: 10,  unit: '명', min: 1,  max: 40,  src: 'plan', note: '규칙 "10명 이상"' },
      { key: 'acuteRate',   label: '예각 주문 비율',           orig: 50,  unit: '%',  min: 0,  max: 100, src: 'mine', note: '"예각이나 둔각" — 비율은 없어서 반반' },
      { key: 'rightTol',    label: '직각으로 보는 범위 (90° ±)', orig: 2,   unit: '°',  min: 0,  max: 10,  src: 'mine', note: '손으로 자르면 딱 90°가 안 나와서' },
      { key: 'nearPenalty', label: '거의 직각이면 감점',        orig: 20,  unit: '점', min: 0,  max: 50,  src: 'mine', note: '90°와 6° 안쪽 차이' },
      { key: 'outPenalty',  label: '꼭짓점이 피자 밖이면 감점',  orig: 20,  unit: '점', min: 0,  max: 50,  src: 'mine', note: '꼭짓점 하나마다' },
      { key: 'smallPenalty',label: '너무 작은 조각 감점',        orig: 30,  unit: '점', min: 0,  max: 60,  src: 'mine', note: '가장 긴 변이 피자 지름의 1/4보다 짧을 때' }
    ];
    this.resetParams();
    this.W = 1000; this.H = 600; this.cx = 500; this.cy = 300; this.R = 252;
  }

  mount(stage) {
    stage.innerHTML = `
      <div class="pz">
        <aside class="pz-side">
          <div class="pz-cust" id="pz-cust">
            <svg class="pz-face" id="pz-face" viewBox="0 0 120 120"></svg>
            <div class="pz-bubble" id="pz-bubble">…</div>
          </div>
          <div class="pz-last">
            <em>이번 조각</em>
            <b id="pz-score">—</b>
            <p id="pz-angles">&nbsp;</p>
          </div>
          <div class="pz-log" id="pz-log"></div>
        </aside>
        <div class="pz-field">
          <svg class="pz-svg" viewBox="0 0 ${this.W} ${this.H}" preserveAspectRatio="xMidYMid meet">
            <defs>
              <radialGradient id="pz-board" cx="50%" cy="45%" r="60%">
                <stop offset="0" stop-color="#2A2F3A"/><stop offset="1" stop-color="#1A1E26"/>
              </radialGradient>
              <radialGradient id="pz-cheese" cx="45%" cy="40%" r="70%">
                <stop offset="0" stop-color="#FFD877"/><stop offset=".7" stop-color="#F6BF4E"/><stop offset="1" stop-color="#E7A23A"/>
              </radialGradient>
              <clipPath id="pz-clip"><circle cx="${this.cx}" cy="${this.cy}" r="${this.R}"/></clipPath>
            </defs>
            <circle cx="${this.cx}" cy="${this.cy}" r="${this.R + 26}" fill="url(#pz-board)"/>
            <circle cx="${this.cx}" cy="${this.cy}" r="${this.R + 26}" fill="none" stroke="rgba(242,237,227,.08)" stroke-width="2"/>
            <g id="pz-pizza"></g>
            <g id="pz-holes" clip-path="url(#pz-clip)"></g>
            <g id="pz-cuts"></g>
            <g id="pz-piece"></g>
            <g id="pz-marks"></g>
            <g id="pz-scis" class="pz-scis" style="display:none">
              <g transform="rotate(-90)">
                <circle cx="-26" cy="-9" r="8" fill="none" stroke="#F2EDE3" stroke-width="4"/>
                <circle cx="-26" cy="9" r="8" fill="none" stroke="#F2EDE3" stroke-width="4"/>
                <path d="M-19 -6 L14 4 L16 1 Z M-19 6 L14 -4 L16 -1 Z" fill="#F2EDE3"/>
              </g>
            </g>
          </svg>
          <div class="pz-hud">
            <div class="pz-timer"><em>남은 시간</em><b id="pz-time">1:00</b></div>
            <div class="pz-count"><em>자른 손님</em><b id="pz-served">0</b><span id="pz-goal">/ 10</span></div>
          </div>
          <button class="pz-redo" id="pz-redo" type="button">다시 자르기 <kbd>R</kbd></button>
        </div>
      </div>`;
    this.svg = $('.pz-svg', stage);
    this.drawPizza();
    $('#pz-goal').textContent = `/ ${this.p.goal}`;

    const sv = this.svg;
    this.on(sv, 'pointerdown', (e) => this.down(e));
    this.on(sv, 'pointermove', (e) => this.move(e));
    this.on(window, 'pointerup', (e) => this.up(e));
    this.on(sv, 'pointerleave', () => { $('#pz-scis').style.display = 'none'; });
    $('#pz-redo').onclick = () => this.redo();
    this.bindKeys((e) => { if (e.key === 'r' || e.key === 'R' || e.key === 'ㄱ') { e.preventDefault(); this.redo(); } });

    this.ready();
  }

  ready() {
    this.running = false;
    this.served = 0; this.pieces = []; this.verts = []; this.busy = false;
    $('#pz-served').textContent = '0'; $('#pz-log').innerHTML = '';
    $('#pz-time').textContent = mmss(this.p.timeLimit);
    $('#pz-score').textContent = '—'; $('#pz-angles').innerHTML = '&nbsp;';
    this.newCustomer();
    Overlay.show({
      kicker: 'Pizza', title: '피자 자르기',
      body: `<p class="ov-note">${mmss(this.p.timeLimit)} · 손님 ${this.p.goal}명</p>`,
      actions: [{ label: '시작', key: 'Enter', primary: true, onClick: () => this.go() }]
    });
  }
  go() {
    this.running = true; this.left = this.p.timeLimit;
    this.every(100, () => {
      if (this.paused || !this.running) return;
      this.left -= 0.1;
      if (this.left <= 10.05 && Math.abs(this.left - Math.round(this.left)) < 0.05 && this.left > 0.5) SFX.tick();
      $('#pz-time').textContent = mmss(Math.ceil(this.left));
      $('.pz-timer').classList.toggle('hot', this.left <= 10);
      if (this.left <= 0) this.finish();
    });
  }

  /* ── 피자 그리기 (디자인 2 : 올리브 눈 두 개 · 페퍼로니 웃는 입) ── */
  drawPizza() {
    const g = $('#pz-pizza'); const { cx, cy, R } = this;
    g.innerHTML = `
      <circle cx="${cx}" cy="${cy}" r="${R}" fill="#D9934A"/>
      <circle cx="${cx}" cy="${cy}" r="${R - 4}" fill="#E6A85C"/>
      <circle cx="${cx}" cy="${cy}" r="${R - 24}" fill="#C8432A"/>
      <circle cx="${cx}" cy="${cy}" r="${R - 30}" fill="url(#pz-cheese)"/>
      ${[[-60, -80], [70, -76]].map(([x, y]) => `
        <circle cx="${cx + x}" cy="${cy + y}" r="30" fill="#2B2A2E"/><circle cx="${cx + x}" cy="${cy + y}" r="13" fill="#F6BF4E"/>`).join('')}
      <ellipse cx="${cx + 4}" cy="${cy - 14}" rx="16" ry="13" fill="#B8331F"/>
      ${[-110, -66, -22, 22, 66, 108].map((x, i) => {
        const y = cy + 62 + Math.sin((i / 5) * Math.PI) * 30;
        return `<circle cx="${cx + x}" cy="${y}" r="27" fill="#B8331F"/><circle cx="${cx + x - 7}" cy="${y - 6}" r="4" fill="#8E2414"/><circle cx="${cx + x + 8}" cy="${y + 5}" r="3" fill="#8E2414"/>`;
      }).join('')}
      ${[[-170, -10, 20], [160, -30, -30], [-120, 140, 50], [130, 150, -10], [-10, -170, 70], [180, 70, 10]].map(([x, y, r]) =>
        `<path d="M0 -10 C9 -4 9 4 0 10 C-9 4 -9 -4 0 -10Z" fill="#4E8A3E" transform="translate(${cx + x} ${cy + y}) rotate(${r})"/>`).join('')}`;
  }

  /* ── 손님 ─────────────────────────────────── */
  newCustomer() {
    this.order = Math.random() * 100 < this.p.acuteRate ? 'acute' : 'obtuse';
    const hues = ['#E9C7A5', '#C99A74', '#8E6245', '#F0D3B8', '#B58563'];
    const hair = ['#2B2A2E', '#5A3B24', '#1F2530', '#7A4A2A'];
    const skin = pick(hues), h = pick(hair), style = rndInt(0, 2);
    $('#pz-face').innerHTML = `
      <circle cx="60" cy="64" r="40" fill="${skin}"/>
      ${style === 0 ? `<path d="M20 60 C20 26 100 26 100 60 C90 44 30 44 20 60Z" fill="${h}"/>`
        : style === 1 ? `<path d="M18 66 C14 22 106 22 102 66 L96 58 C80 38 40 38 24 58Z" fill="${h}"/>`
        : `<path d="M22 56 C26 26 94 26 98 56 C84 50 72 40 60 40 C48 40 36 50 22 56Z" fill="${h}"/><circle cx="60" cy="24" r="10" fill="${h}"/>`}
      <circle cx="46" cy="68" r="4" fill="#1D1F24"/><circle cx="74" cy="68" r="4" fill="#1D1F24"/>
      <path d="M48 84 Q60 92 72 84" stroke="#1D1F24" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
    const b = $('#pz-bubble');
    b.innerHTML = `<b class="${this.order}">${TRI[this.order].name}</b> 피자 한 조각이요`;
    $('#pz-cust').classList.remove('in'); void $('#pz-cust').offsetWidth; $('#pz-cust').classList.add('in');
  }

  /* ── 가위질 ────────────────────────────────── */
  toSvg(e) {
    const pt = this.svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(this.svg.getScreenCTM().inverse());
    return [p.x, p.y];
  }
  down(e) {
    if (!this.running || this.busy || this.paused) return;
    e.preventDefault();
    const p = this.toSvg(e);
    this.dragging = true;
    if (this.verts.length === 0) { this.verts.push(p); SFX.tick(); this.drawCuts(p); }
  }
  move(e) {
    const p = this.toSvg(e);
    const sc = $('#pz-scis');
    sc.style.display = this.running && !this.busy ? '' : 'none';
    const last = this.verts[this.verts.length - 1];
    const ang = last ? Math.atan2(p[1] - last[1], p[0] - last[0]) * 180 / Math.PI : -30;
    sc.setAttribute('transform', `translate(${p[0]} ${p[1]}) rotate(${ang + 90})`);
    if (this.verts.length && !this.busy) this.drawCuts(p);
  }
  up(e) {
    if (!this.dragging) return;
    this.dragging = false;
    if (!this.running || this.busy) return;
    const p = this.toSvg(e);
    this.addVertex(p);
  }
  /** 꼭짓점 하나 추가 (테스트에서도 직접 부름) */
  addVertex(p) {
    const last = this.verts[this.verts.length - 1];
    if (!last) { this.verts.push(p); return; }
    if (Math.hypot(p[0] - last[0], p[1] - last[1]) < 14) return;
    this.verts.push(p); SFX.snip();
    this.drawCuts(null);
    if (this.verts.length === 3) this.cut();
  }
  drawCuts(hover) {
    const g = $('#pz-cuts'); g.innerHTML = '';
    const v = this.verts;
    for (let i = 1; i < v.length; i++) svgEl('line', { x1: v[i - 1][0], y1: v[i - 1][1], x2: v[i][0], y2: v[i][1], class: 'pz-cutline' }, g);
    if (hover && v.length && v.length < 3) {
      svgEl('line', { x1: v[v.length - 1][0], y1: v[v.length - 1][1], x2: hover[0], y2: hover[1], class: 'pz-guide' }, g);
      if (v.length === 2) svgEl('line', { x1: hover[0], y1: hover[1], x2: v[0][0], y2: v[0][1], class: 'pz-guide faint' }, g);
    }
    v.forEach(p => svgEl('circle', { cx: p[0], cy: p[1], r: 7, class: 'pz-vert' }, g));
  }
  redo() {
    if (this.busy) return;
    this.verts = []; $('#pz-cuts').innerHTML = ''; SFX.tick();
  }

  /** 점수 계산 — 테스트에서도 쓴다 */
  judge(pts) {
    const ang = anglesOf(pts), mx = Math.max(...ang);
    const kind = classify(ang, this.p.rightTol);
    const out = { ang, kind, score: 0, why: [] };
    if (kind !== this.order) { out.why.push(kind === 'right' ? '직각삼각형' : TRI[kind].full); return out; }
    let s = 100;
    const outside = pts.filter(p => Math.hypot(p[0] - this.cx, p[1] - this.cy) > this.R).length;
    if (outside) { s -= this.p.outPenalty * outside; out.why.push(`피자 밖 ${outside}곳`); }
    const longest = Math.max(...pts.map((p, i) => Math.hypot(p[0] - pts[(i + 1) % 3][0], p[1] - pts[(i + 1) % 3][1])));
    if (longest < this.R * 2 / 4) { s -= this.p.smallPenalty; out.why.push('너무 작아'); }
    if (Math.abs(mx - 90) < 6) { s -= this.p.nearPenalty; out.why.push('거의 직각'); }
    out.score = Math.max(10, s);
    return out;
  }

  cut() {
    this.busy = true;
    const pts = this.verts.slice();
    const r = this.judge(pts);
    // 구멍 + 떨어져 나가는 조각
    svgEl('polygon', { points: ptsAttr(pts), class: 'pz-hole' }, $('#pz-holes'));
    const piece = $('#pz-piece'); piece.innerHTML = '';
    const clipId = 'pzc' + Date.now();
    const cp = svgEl('clipPath', { id: clipId }, piece);
    svgEl('polygon', { points: ptsAttr(pts) }, cp);
    const inner = svgEl('g', { 'clip-path': `url(#${clipId})` }, piece);
    inner.innerHTML = $('#pz-pizza').innerHTML;
    svgEl('polygon', { points: ptsAttr(pts), class: 'pz-piece-edge' }, piece);
    piece.classList.remove('fly'); piece.style.transform = '';
    $('#pz-cuts').innerHTML = '';

    // 각 표시
    const marks = $('#pz-marks'); marks.innerHTML = '';
    const gx = (pts[0][0] + pts[1][0] + pts[2][0]) / 3, gy = (pts[0][1] + pts[1][1] + pts[2][1]) / 3;
    pts.forEach((p, i) => {
      const dx = gx - p[0], dy = gy - p[1], d = Math.hypot(dx, dy) || 1;
      const t = svgEl('text', { x: p[0] + dx / d * 40, y: p[1] + dy / d * 40 + 8, class: 'pz-deg' }, marks);
      t.textContent = Math.round(r.ang[i]) + '°';
    });

    const ok = r.score > 0;
    $('#pz-score').textContent = r.score;
    $('#pz-score').className = ok ? (r.score === 100 ? 'perfect' : '') : 'zero';
    $('#pz-angles').innerHTML = `<span class="k ${r.kind}">${r.kind === 'right' ? '직각삼각형' : TRI[r.kind].full}</span>${r.why.length && ok ? ' · ' + r.why.join(', ') : ''}`;
    const pop = svgEl('text', { x: gx, y: gy - 60, class: 'pz-pop' + (ok ? '' : ' zero') }, marks);
    pop.textContent = r.score;
    if (ok) { SFX.good(); this.served++; $('#pz-served').textContent = this.served; }
    else { SFX.bad(); Toast.show(`${TRI[this.order].name} 아님`, 'bad'); }
    this.pieces.push({ order: this.order, kind: r.kind, score: r.score, ang: r.ang.map(Math.round) });
    this.addLog(pts, r, ok);

    this.after(900, () => {
      piece.style.transform = `translate(${-gx + 40}px, ${-gy + 120}px) scale(.35)`;
      piece.classList.add('fly');
    });
    this.after(1500, () => {
      piece.innerHTML = ''; piece.classList.remove('fly'); piece.style.transform = '';
      marks.innerHTML = ''; $('#pz-holes').innerHTML = '';
      this.verts = []; this.busy = false;
      if (this.running) this.newCustomer();
    });
  }
  addLog(pts, r, ok) {
    const log = $('#pz-log');
    const k = 26 / Math.max(...pts.map(p => Math.hypot(p[0] - pts[0][0], p[1] - pts[0][1])), 1);
    const gx = (pts[0][0] + pts[1][0] + pts[2][0]) / 3, gy = (pts[0][1] + pts[1][1] + pts[2][1]) / 3;
    const mini = pts.map(p => [(p[0] - gx) * k, (p[1] - gy) * k]);
    const item = el('div', 'pz-li' + (ok ? '' : ' no'), `
      <svg viewBox="-20 -20 40 40"><polygon points="${ptsAttr(mini)}" class="${r.kind}"/></svg>
      <b>${r.score}</b>`);
    log.prepend(item);
    while (log.children.length > 12) log.lastChild.remove();
  }

  finish() {
    if (!this.running) return;
    this.running = false; this.clearTimers();
    const n = this.served, win = n >= this.p.goal;
    const good = this.pieces.filter(x => x.score > 0);
    const avg = good.length ? Math.round(good.reduce((s, x) => s + x.score, 0) / good.length) : 0;
    this.lastResult = { served: n, tried: this.pieces.length, avg, win };
    win ? SFX.win() : SFX.lose();
    Overlay.show({
      kicker: win ? 'You win' : 'Time up', title: win ? '이겼다!' : '종료',
      body: statsHTML([[`${n}명`, '자른 손님'], [this.pieces.length - n, '틀린 조각'], [avg || '—', '평균 점수']]),
      actions: [{ label: '다시', key: 'Enter', primary: true, onClick: () => { this.clearTimers(); this.ready(); } }]
    });
  }
  destroy() { this.running = false; super.destroy(); }
}
gameClasses[2] = GamePizza;
