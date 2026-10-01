/* ═══════════════════════════════════════════════════
   2. 피자 자르기 — 기획 : 키위 맛 우유
   손님이 말한 삼각형으로 둥근 피자를 가위질해 조각을 낸다.
   2차 (디버깅 페이퍼) : 난이도별 시간 · 직각 손님 · 뒤로 갈수록 여러 조각 주문 · 최소 넓이 · 피자 3종 · 나가기
   ═══════════════════════════════════════════════════ */

class GamePizza extends GameBase {
  constructor() {
    super();
    this.paramSpec = [
      { key: 'timeEasy',    label: '제한 시간 — 쉬움',          orig: 120, unit: '초', min: 20, max: 300, src: 'paper', note: '2차 페이퍼 "2분 정도"', v1: 60 },
      { key: 'timeNormal',  label: '제한 시간 — 보통',          orig: 90,  unit: '초', min: 20, max: 300, src: 'paper', note: '2차 페이퍼 "1분 30초"', v1: 60 },
      { key: 'timeHard',    label: '제한 시간 — 어려움',        orig: 60,  unit: '초', min: 20, max: 300, src: 'plan',  note: '기획서 "1분 안에"' },
      { key: 'goal',        label: '이기려면 자를 손님 수',       orig: 10,  unit: '명', min: 1,  max: 40,  src: 'plan',  note: '규칙 "10명 이상"' },
      { key: 'rightFrom',   label: '직각 손님이 오기 시작 (쉬움·보통)', orig: 4, unit: '번째', min: 1, max: 20, src: 'mine', note: '2차 페이퍼 "직각삼각형 피자 손님" · 어려움은 처음부터' },
      { key: 'multiFrom',   label: '여러 조각 주문이 오기 시작',   orig: 7,  unit: '번째', min: 1, max: 20, src: 'mine', note: '2차 페이퍼 "단계가 올라갈수록 어려운 주문" + 선생님 제안 "둔각 하나 예각 두 개"' },
      { key: 'minArea',     label: '조각 최소 넓이',              orig: 5,   unit: '% (피자 넓이)', min: 1, max: 30, src: 'teacher', note: '선생님 제안 "최소 면적은 어느 정도 이상"' },
      { key: 'rightTol',    label: '예각·둔각 주문에서 직각으로 보는 범위', orig: 2, unit: '°', min: 0, max: 10, src: 'mine', note: '' },
      { key: 'rightOk',     label: '직각 주문에서 봐주는 범위 (90° ±)', orig: 5, unit: '°', min: 1, max: 15, src: 'mine', note: '손으로 딱 90°는 어려워서' },
      { key: 'nearPenalty', label: '거의 직각이면 감점',          orig: 20,  unit: '점', min: 0,  max: 50,  src: 'mine', note: '예각·둔각 주문에서 90°와 6° 안쪽' },
      { key: 'outPenalty',  label: '꼭짓점이 피자 밖이면 감점',    orig: 20,  unit: '점', min: 0,  max: 50,  src: 'mine', note: '꼭짓점 하나마다' }
    ];
    this.resetParams();
    this.W = 1000; this.H = 600; this.cx = 500; this.cy = 300; this.R = 252;
    this.LEVELS = [
      { name: '쉬움', time: this.p.timeEasy }, { name: '보통', time: this.p.timeNormal }, { name: '어려움', time: this.p.timeHard }
    ];
    this.level = 1;
  }

  mount(stage) {
    stage.innerHTML = `
      <div class="pz">
        <aside class="pz-side">
          <div class="pz-cust" id="pz-cust">
            <svg class="pz-face" id="pz-face" viewBox="0 0 120 120"></svg>
            <div class="pz-bubble" id="pz-bubble">…</div>
            <div class="pz-need" id="pz-need"></div>
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
            <div class="pz-level" id="pz-level">보통</div>
            <div class="pz-timer"><em>남은 시간</em><b id="pz-time">1:30</b></div>
            <div class="pz-count"><em>자른 손님</em><b id="pz-served">0</b><span id="pz-goal">/ 10</span></div>
          </div>
          <button class="pz-redo" id="pz-redo" type="button">다시 자르기 <kbd>R</kbd></button>
        </div>
      </div>`;
    this.svg = $('.pz-svg', stage);
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

  /** 시작 화면 : 난이도 고르기 */
  ready() {
    this.running = false; this.clearTimers();
    this.served = 0; this.custN = 0; this.pieces = []; this.verts = []; this.busy = false; this.log = [];
    $('#pz-served').textContent = '0'; $('#pz-log').innerHTML = '';
    $('#pz-score').textContent = '—'; $('#pz-angles').innerHTML = '&nbsp;';
    this.newCustomer();
    Overlay.show({
      kicker: 'Pizza', title: '피자 자르기',
      body: `<p class="ov-note">손님 ${this.p.goal}명 · 쉬움 ${mmss(this.p.timeEasy)} · 보통 ${mmss(this.p.timeNormal)} · 어려움 ${mmss(this.p.timeHard)}</p>`,
      actions: this.LEVELS.map((L, i) => ({ label: L.name, key: String(i + 1), primary: i === 1, onClick: () => this.go(i) }))
    });
  }
  go(level = this.level) {
    this.level = level;
    const L = this.LEVELS[level];
    $('#pz-level').textContent = L.name;
    this.served = 0; this.custN = 0; this.pieces = []; this.log = [];
    $('#pz-served').textContent = '0'; $('#pz-log').innerHTML = '';
    this.newCustomer();
    this.running = true; this.left = L.time;
    $('#pz-time').textContent = mmss(this.left);
    this.every(100, () => {
      if (this.paused || !this.running) return;
      this.left -= 0.1;
      if (this.left <= 10.05 && Math.abs(this.left - Math.round(this.left)) < 0.05 && this.left > 0.5) SFX.tick();
      $('#pz-time').textContent = mmss(Math.ceil(this.left));
      $('.pz-timer').classList.toggle('hot', this.left <= 10);
      if (this.left <= 0) this.finish();
    });
  }

  /* ── 피자 3종 (2차 페이퍼 "피자 종류 여러 개", "더 화려하게") ── */
  drawPizza(kind = 'face') {
    const g = $('#pz-pizza'); const { cx, cy, R } = this;
    const base = `
      <circle cx="${cx}" cy="${cy}" r="${R}" fill="#D9934A"/>
      <circle cx="${cx}" cy="${cy}" r="${R - 4}" fill="#E6A85C"/>
      ${Array.from({ length: 28 }, (_, i) => { const a = i / 28 * 6.283; return `<circle cx="${(cx + Math.cos(a) * (R - 12)).toFixed(1)}" cy="${(cy + Math.sin(a) * (R - 12)).toFixed(1)}" r="2.2" fill="#C47A36"/>`; }).join('')}
      <circle cx="${cx}" cy="${cy}" r="${R - 24}" fill="#C8432A"/>
      <circle cx="${cx}" cy="${cy}" r="${R - 30}" fill="url(#pz-cheese)"/>`;
    const leaf = (x, y, r, c = '#4E8A3E') => `<path d="M0 -10 C9 -4 9 4 0 10 C-9 4 -9 -4 0 -10Z" fill="${c}" transform="translate(${cx + x} ${cy + y}) rotate(${r})"/>`;
    let top = '';
    if (kind === 'face') {
      // 디자인 2 : 올리브 눈 두 개 · 페퍼로니 웃는 입
      top = `${[[-60, -80], [70, -76]].map(([x, y]) => `<circle cx="${cx + x}" cy="${cy + y}" r="30" fill="#2B2A2E"/><circle cx="${cx + x}" cy="${cy + y}" r="13" fill="#F6BF4E"/>`).join('')}
        <ellipse cx="${cx + 4}" cy="${cy - 14}" rx="16" ry="13" fill="#B8331F"/>
        ${[-110, -66, -22, 22, 66, 108].map((x, i) => { const y = cy + 62 + Math.sin((i / 5) * Math.PI) * 30;
          return `<circle cx="${cx + x}" cy="${y}" r="27" fill="#B8331F"/><circle cx="${cx + x - 7}" cy="${y - 6}" r="4" fill="#8E2414"/><circle cx="${cx + x + 8}" cy="${y + 5}" r="3" fill="#8E2414"/>`; }).join('')}
        ${[[-170, -10, 20], [160, -30, -30], [-120, 140, 50], [130, 150, -10], [-10, -170, 70], [180, 70, 10]].map(([x, y, r]) => leaf(x, y, r)).join('')}`;
    } else if (kind === 'veggie') {
      // 피망 · 양파 · 버섯 · 올리브 · 토마토
      const spots = [[-140, -60], [-60, -150], [40, -120], [130, -70], [170, 40], [90, 120], [-20, 160], [-130, 110], [-170, 20], [0, -10], [-70, 40], [70, 20], [20, 80], [-40, -80]];
      top = spots.map(([x, y], i) => {
        const k = i % 5;
        if (k === 0) return `<path d="M${cx + x - 16} ${cy + y} a16 14 0 1 1 32 0" fill="none" stroke="#3E8E3A" stroke-width="7" stroke-linecap="round"/>`;
        if (k === 1) return `<circle cx="${cx + x}" cy="${cy + y}" r="17" fill="none" stroke="#B06BC8" stroke-width="4"/>`;
        if (k === 2) return `<g transform="translate(${cx + x} ${cy + y})"><path d="M-14 0 a14 12 0 0 1 28 0Z" fill="#D8C7A8"/><rect x="-5" y="0" width="10" height="12" rx="3" fill="#C7B08A"/></g>`;
        if (k === 3) return `<circle cx="${cx + x}" cy="${cy + y}" r="12" fill="#2B2A2E"/><circle cx="${cx + x}" cy="${cy + y}" r="5" fill="#F6BF4E"/>`;
        return `<circle cx="${cx + x}" cy="${cy + y}" r="19" fill="#E2483A"/><circle cx="${cx + x}" cy="${cy + y}" r="11" fill="#F27A5E"/>`;
      }).join('') + [[-100, -120, 30], [150, 100, -20], [-150, 60, 70]].map(([x, y, r]) => leaf(x, y, r)).join('');
    } else {
      // 하와이안 : 파인애플 · 햄 · 바질
      const spots = [[-150, -40], [-90, -130], [10, -160], [110, -110], [160, -10], [120, 100], [20, 150], [-90, 130], [-160, 60], [-20, -50], [60, 10], [-50, 50], [10, 80], [80, -40]];
      top = spots.map(([x, y], i) => i % 2
        ? `<path d="M0 -15 L14 10 L-14 10Z" fill="#FFD447" stroke="#E9B52A" stroke-width="2" transform="translate(${cx + x} ${cy + y}) rotate(${i * 37})"/>`
        : `<rect x="-14" y="-14" width="28" height="28" rx="5" fill="#E58A8A" stroke="#C96464" stroke-width="2" transform="translate(${cx + x} ${cy + y}) rotate(${i * 23})"/>`).join('')
        + [[-60, -90, 10], [100, 40, -40], [-120, -10, 60], [40, 120, 20]].map(([x, y, r]) => leaf(x, y, r)).join('');
    }
    g.innerHTML = base + top;
  }

  /* ── 손님 · 주문 ─────────────────────────── */
  makeOrder() {
    const n = this.custN, hard = this.level === 2;
    const kinds = ['acute', 'obtuse'];
    if (hard || n >= this.p.rightFrom) kinds.push('right');
    if (n >= this.p.multiFrom) {
      // 여러 조각 : 2~3조각, 셋이면 "둔각 하나, 예각 두 개" 같은 모양
      const cnt = n >= this.p.multiFrom + 2 ? 3 : 2;
      const need = Array.from({ length: cnt }, () => pick(kinds));
      return need.sort();
    }
    return [pick(kinds)];
  }
  orderText(need) {
    if (need.length === 1) return `<b class="${need[0]}">${TRI[need[0]].name}</b> 피자 한 조각이요`;
    const cnt = {}; need.forEach(k => cnt[k] = (cnt[k] || 0) + 1);
    const word = ['', '하나', '두 개', '세 개'];
    return Object.entries(cnt).map(([k, c]) => `<b class="${k}">${TRI[k].name}</b> ${word[c]}`).join(', ') + ' 주세요';
  }
  newCustomer() {
    this.need = this.makeOrder(); this.got = []; this.partScores = [];
    this.order = this.need[0];
    $('#pz-holes').innerHTML = '';
    this.drawPizza(pick(['face', 'veggie', 'hawaiian']));
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
    $('#pz-bubble').innerHTML = this.orderText(this.need);
    this.renderNeed();
    $('#pz-cust').classList.remove('in'); void $('#pz-cust').offsetWidth; $('#pz-cust').classList.add('in');
  }
  renderNeed() {
    const box = $('#pz-need');
    if (this.need.length + this.got.length <= 1) { box.innerHTML = ''; return; }
    box.innerHTML = this.got.map(k => `<span class="done ${k}">${TRI[k].name}</span>`).join('') + this.need.map(k => `<span class="${k}">${TRI[k].name}</span>`).join('');
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
    this.addVertex(this.toSvg(e));
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

  /** 한 조각 판정 — 테스트에서도 쓴다. { ang, kind, score, why, retry } */
  judge(pts) {
    const ang = anglesOf(pts), mx = Math.max(...ang);
    const pizzaArea = Math.PI * this.R * this.R;
    const out = { ang, kind: null, score: 0, why: [], retry: null };
    if (areaOf(pts) < pizzaArea * this.p.minArea / 100) { out.retry = '더 크게'; return out; }
    const holes = this.got.length ? this.holes || [] : [];
    const c = centroid(pts);
    if (holes.some(h => inTriStrict(c[0], c[1], h) || pts.some(q => inTriStrict(q[0], q[1], h, 4)) || h.some(q => inTriStrict(q[0], q[1], pts, 4)))) { out.retry = '겹쳐요'; return out; }
    out.kind = this.need.includes('right') && Math.abs(mx - 90) <= this.p.rightOk ? 'right' : classify(ang, this.p.rightTol);
    if (!this.need.includes(out.kind)) { out.why.push(TRI[out.kind].full); return out; }
    let s = 100;
    const outside = pts.filter(q => Math.hypot(q[0] - this.cx, q[1] - this.cy) > this.R).length;
    if (outside) { s -= this.p.outPenalty * outside; out.why.push(`피자 밖 ${outside}곳`); }
    if (out.kind === 'right') { const d = Math.abs(mx - 90); s -= Math.round(d * 8); if (d >= 1) out.why.push(`${Math.round(mx)}°`); }
    else if (Math.abs(mx - 90) < 6) { s -= this.p.nearPenalty; out.why.push('거의 직각'); }
    out.score = Math.max(10, s);
    return out;
  }

  cut() {
    const pts = this.verts.slice();
    const r = this.judge(pts);
    if (r.retry) {
      SFX.bad(); Toast.show(r.retry, 'bad');
      this.verts = []; $('#pz-cuts').innerHTML = '';
      return;
    }
    this.busy = true;
    // 구멍 + 떨어져 나가는 조각
    svgEl('polygon', { points: ptsAttr(pts), class: 'pz-hole' }, $('#pz-holes'));
    this.holes = (this.got.length ? this.holes : []).concat([pts]);
    const piece = $('#pz-piece'); piece.innerHTML = '';
    const clipId = 'pzc' + Date.now();
    const cp = svgEl('clipPath', { id: clipId }, piece);
    svgEl('polygon', { points: ptsAttr(pts) }, cp);
    const inner = svgEl('g', { 'clip-path': `url(#${clipId})` }, piece);
    inner.innerHTML = $('#pz-pizza').innerHTML;
    svgEl('polygon', { points: ptsAttr(pts), class: 'pz-piece-edge' }, piece);
    piece.classList.remove('fly'); piece.style.transform = '';
    $('#pz-cuts').innerHTML = '';

    const marks = $('#pz-marks'); marks.innerHTML = '';
    const [gx, gy] = centroid(pts);
    pts.forEach((p, i) => {
      const dx = gx - p[0], dy = gy - p[1], d = Math.hypot(dx, dy) || 1;
      const t = svgEl('text', { x: p[0] + dx / d * 40, y: p[1] + dy / d * 40 + 8, class: 'pz-deg' }, marks);
      t.textContent = Math.round(r.ang[i]) + '°';
    });

    const ok = r.score > 0;
    $('#pz-score').textContent = r.score;
    $('#pz-score').className = ok ? (r.score === 100 ? 'perfect' : '') : 'zero';
    $('#pz-angles').innerHTML = `<span class="k ${r.kind}">${TRI[r.kind].full}</span>${r.why.length && ok ? ' · ' + r.why.join(', ') : ''}`;
    const pop = svgEl('text', { x: gx, y: gy - 60, class: 'pz-pop' + (ok ? '' : ' zero') }, marks);
    pop.textContent = r.score;
    this.addLog(pts, r, ok);
    this.after(900, () => { piece.style.transform = `translate(${-gx + 40}px, ${-gy + 120}px) scale(.35)`; piece.classList.add('fly'); });

    let done = false;
    if (ok) {
      this.need.splice(this.need.indexOf(r.kind), 1); this.got.push(r.kind); this.partScores.push(r.score);
      this.renderNeed();
      if (this.need.length) { SFX.good(); Toast.show(`${this.need.length}조각 더`, 'good'); }
      else { done = true; this.served++; $('#pz-served').textContent = this.served; SFX.good(); }
    } else {
      done = true; SFX.bad(); Toast.show(`${r.kind ? TRI[r.kind].name : ''} 아님`, 'bad');
    }
    if (done) {
      const avg = ok ? Math.round(this.partScores.reduce((a, b) => a + b, 0) / this.partScores.length) : 0;
      this.pieces.push({ need: this.got.concat(this.need), ok, score: avg, n: this.got.length + (ok ? 0 : 1) });
      this.log.push({ cust: this.custN + 1, ok, score: avg });
    }
    this.after(1500, () => {
      piece.innerHTML = ''; piece.classList.remove('fly'); piece.style.transform = '';
      marks.innerHTML = ''; this.verts = []; this.busy = false;
      if (done && this.running) { this.custN++; this.newCustomer(); }
    });
  }
  addLog(pts, r, ok) {
    const log = $('#pz-log');
    const [gx, gy] = centroid(pts);
    const k = 26 / Math.max(...pts.map(p => Math.hypot(p[0] - gx, p[1] - gy)), 1);
    const mini = pts.map(p => [(p[0] - gx) * k, (p[1] - gy) * k]);
    const item = el('div', 'pz-li' + (ok ? '' : ' no'), `
      <svg viewBox="-28 -28 56 56"><polygon points="${ptsAttr(mini)}" class="${r.kind}"/></svg>
      <b>${r.score}</b>`);
    log.prepend(item);
    while (log.children.length > 12) log.lastChild.remove();
  }

  finish() {
    if (!this.running) return;
    this.running = false; this.clearTimers();
    const n = this.served, win = n >= this.p.goal;
    const good = this.pieces.filter(x => x.ok);
    const avg = good.length ? Math.round(good.reduce((s, x) => s + x.score, 0) / good.length) : 0;
    this.lastResult = { served: n, tried: this.pieces.length, avg, win, level: this.level };
    win ? SFX.win() : SFX.lose();
    Overlay.show({
      kicker: win ? 'You win' : 'Time up', title: win ? '이겼다!' : '종료',
      body: statsHTML([[`${n}명`, '자른 손님'], [this.pieces.length - n, '틀린 손님'], [avg || '—', '평균 점수']]),
      actions: [
        { label: '다시', key: 'Enter', primary: true, onClick: () => this.ready() },
        { label: '나가기', key: 'Escape', onClick: () => backHome() }
      ]
    });
  }
  destroy() { this.running = false; super.destroy(); }
}
gameClasses[2] = GamePizza;
