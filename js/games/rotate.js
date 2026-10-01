/* ═══════════════════════════════════════════════════
   1. 미션 삼각형 돌리기 — 기획 : 아야어여우유어이
   삼각형 종류를 찾아서, 미션에 적힌 방향·칸 수만큼 돌린다.
   ═══════════════════════════════════════════════════ */

class GameRotate extends GameBase {
  constructor() {
    super();
    this.paramSpec = [
      { key: 'stepDeg',      label: '1칸에 돌아가는 각',        orig: 90, unit: '°',  min: 15, max: 180, src: 'mine', note: '기획서에 없음. 교과서 「돌리기」처럼 90°로 정함' },
      { key: 'easyCount',    label: '쉬움 모드 삼각형 수',       orig: 6,  unit: '개', min: 3,  max: 12,  src: 'draw', note: '디자인 2 그림의 삼각형 6개' },
      { key: 'easyMissions', label: '쉬움 모드 미션 수',         orig: 4,  unit: '개', min: 1,  max: 10,  src: 'mine', note: '기획서에 없음' },
      { key: 'normalCount',  label: '보통 모드 삼각형 수',       orig: 15, unit: '개', min: 6,  max: 30,  src: 'paper', note: '2차 페이퍼 "보통 모드를 새로 만들어 삼각형을 더 적게"', v1: '—' },
      { key: 'normalGoal',   label: '보통 모드 목표 수',         orig: 5,  unit: '개', min: 1,  max: 15,  src: 'mine', note: '' },
      { key: 'hardCount',    label: '어려움 모드 삼각형 수',     orig: 30, unit: '개', min: 9,  max: 40,  src: 'plan', note: '1차의 보통 모드 = 규칙 "30여 개"' },
      { key: 'hardGoal',     label: '어려움 모드 목표 수',       orig: 7,  unit: '개', min: 1,  max: 15,  src: 'draw', note: '디자인 "목표 달성 1/7"' },
      { key: 'maxTurn',      label: '버튼 칸 수',               orig: 5,  unit: '칸', min: 1,  max: 8,   src: 'paper', note: '2차 페이퍼 "오른쪽 5칸·왼쪽 5칸 추가"', v1: 4 },
      { key: 'missLimit',    label: '처음으로 돌아가는 실수 수',  orig: 5,  unit: '번', min: 1,  max: 20,  src: 'paper', note: '기획자 2차 페이퍼 "5번 틀리면 처음으로 초기화"', v1: '없음' },
      { key: 'easyAcuteMax', label: '쉬움: 예각삼각형의 가장 큰 각', orig: 72, unit: '°', min: 61, max: 89, src: 'mine', note: '직각과 헷갈리지 않게' },
      { key: 'easyObtuseMin',label: '쉬움: 둔각의 최소 크기',      orig: 112, unit: '°', min: 91, max: 150, src: 'mine', note: '직각과 헷갈리지 않게' },
      { key: 'normalAcuteMax', label: '보통: 예각삼각형의 가장 큰 각', orig: 76, unit: '°', min: 61, max: 89, src: 'mine', note: '' },
      { key: 'normalObtuseMin',label: '보통: 둔각의 최소 크기',      orig: 104, unit: '°', min: 91, max: 150, src: 'mine', note: '' },
      { key: 'acuteMax',     label: '어려움: 예각삼각형의 가장 큰 각', orig: 80, unit: '°', min: 61, max: 89, src: 'mine', note: '' },
      { key: 'obtuseMin',    label: '어려움: 둔각의 최소 크기',      orig: 100, unit: '°', min: 91, max: 150, src: 'mine', note: '' }
    ];
    this.resetParams();
    this.W = 1300; this.H = 600;
    const P = this.p;
    this.MODES = {
      easy:   { name: '쉬움 모드',   next: 'normal', count: P.easyCount,   cols: 3, numbered: false, k: 0.36, jit: 18, opt: { acuteMax: P.easyAcuteMax, obtuseMin: P.easyObtuseMin } },
      normal: { name: '보통 모드',   next: 'hard',   count: P.normalCount, cols: 5, numbered: true,  k: 0.40, jit: 10, goal: P.normalGoal, opt: { acuteMax: P.normalAcuteMax, obtuseMin: P.normalObtuseMin } },
      hard:   { name: '어려움 모드', next: null,     count: P.hardCount,   cols: 6, numbered: true,  k: 0.46, jit: 6,  goal: P.hardGoal,   opt: { acuteMax: P.acuteMax, obtuseMin: P.obtuseMin } }
    };
  }

  mount(stage) {
    this.stage = stage;
    stage.innerHTML = `
      <div class="rt">
        <div class="rt-field">
          <svg class="rt-svg" viewBox="0 0 ${this.W} ${this.H}" preserveAspectRatio="xMidYMid meet">
            <defs>
              <pattern id="rt-grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M50 0 H0 V50" fill="none" stroke="rgba(242,237,227,.045)" stroke-width="1"/>
              </pattern>
            </defs>
            <rect width="${this.W}" height="${this.H}" fill="url(#rt-grid)"/>
            <g class="rt-tris"></g>
            <g class="rt-labels"></g>
          </svg>
          <div class="rt-plaque" id="rt-plaque">보통 모드</div>
          <div class="rt-hud">
            <span class="rt-chip"><em>시간</em><b id="rt-time">0:00</b></span>
            <span class="rt-chip"><em>실수</em><b id="rt-miss">0</b><em>/ ${this.p.missLimit}</em></span>
          </div>
          <div class="rt-modes" id="rt-modes">
            <button type="button" data-mode="easy">쉬움</button>
            <button type="button" data-mode="normal">보통</button>
            <button type="button" data-mode="hard">어려움</button>
          </div>
        </div>
        <aside class="rt-mission">
          <h3 class="rt-mh">미션</h3>
          <div id="rt-mlist"></div>
        </aside>
        <div class="rt-dock">
          <div class="rt-goal">
            <div class="rt-goal-top"><em>목표 달성</em><b id="rt-goalnum">0/7</b></div>
            <svg class="rt-target" id="rt-target" viewBox="-80 -80 160 160"></svg>
          </div>
          <div class="rt-pad" id="rt-pad"></div>
        </div>
      </div>`;
    this.svg = $('.rt-svg', stage);
    this.gTris = $('.rt-tris', stage);
    this.gLabels = $('.rt-labels', stage);

    // 버튼 8개 : 오른쪽 1~4칸 / 왼쪽 1~4칸 (디자인 3쪽)
    const pad = $('#rt-pad', stage);
    ['right', 'left'].forEach(dir => {
      const row = el('div', 'rt-row');
      for (let n = 1; n <= this.p.maxTurn; n++) {
        const b = el('button', 'rt-btn ' + dir, `
          <svg viewBox="0 0 24 24" aria-hidden="true">${dir === 'right'
            ? '<path d="M5 13a7 7 0 1 0 2.2-6.3"/><path d="M5 3v4.5h4.5"/>'
            : '<path d="M19 13a7 7 0 1 1-2.2-6.3"/><path d="M19 3v4.5h-4.5"/>'}</svg>
          <span>${dir === 'right' ? '오른쪽' : '왼쪽'}으로 <b>${n}칸</b></span>
          ${n === 1 ? `<kbd>${dir === 'right' ? '→' : '←'}</kbd>` : ''}`);
        b.type = 'button';
        b.onclick = () => this.turn(dir === 'right' ? n : -n);
        row.appendChild(b);
      }
      pad.appendChild(row);
    });
    $$('#rt-modes button', stage).forEach(b => b.onclick = () => { SFX.select(); this.start(b.dataset.mode); });

    this.bindKeys((e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); this.turn(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); this.turn(-1); }
    });
    this.every(250, () => this.tickTime());
    this.start('easy');
  }

  /* ── 판 만들기 ─────────────────────────────── */
  start(mode) {
    this.mode = mode; const M = this.M = this.MODES[mode];
    this.tris = []; this.selected = null; this.miss = 0; this.done = 0;
    this.t0 = performance.now(); this.pausedAt = 0; this.pausedTotal = 0; this.over = false;
    this.gTris.innerHTML = ''; this.gLabels.innerHTML = '';
    $('#rt-plaque').textContent = M.name;
    $$('#rt-modes button').forEach(b => b.classList.toggle('on', b.dataset.mode === mode));

    const count = M.count, opt = M.opt;
    // 종류를 고르게 섞는다
    const kinds = shuffle(Array.from({ length: count }, (_, i) => TRI_KEYS[i % 3]));
    const cols = M.cols, rows = Math.ceil(count / cols);
    const top = 64, bottom = 8;   // 위쪽은 모드 팻말·상태 칩 자리
    const cw = this.W / cols, ch = (this.H - top - bottom) / rows;
    const S = Math.min(cw, ch) * M.k;   // 무게중심~꼭짓점 최대 거리
    const cells = shuffle(Array.from({ length: cols * rows }, (_, i) => i)).slice(0, count);
    const numbering = { acute: 0, right: 0, obtuse: 0 };

    kinds.forEach((cls, i) => {
      const t = makeTriangle(cls, 60, opt);
      // 크기 맞추기 : 가장 먼 꼭짓점까지 S
      const far = Math.max(...t.pts.map(p => Math.hypot(p[0], p[1])));
      t.pts = t.pts.map(p => [p[0] * S / far, p[1] * S / far]);
      const cell = cells[i], cx = (cell % cols + 0.5) * cw, cy = top + (Math.floor(cell / cols) + 0.5) * ch;
      const jit = M.jit;
      const tri = {
        id: i, cls, pts: t.pts, angles: t.angles,
        x: cx + rnd(-jit, jit), y: cy + rnd(-jit, jit),
        base: rndInt(0, 23) * 15, net: 0, locked: false, num: 0
      };
      this.tris.push(tri);
    });
    // 번호 : 종류마다 1부터 (배치는 무작위)
    shuffle(this.tris).forEach(t => { t.num = ++numbering[t.cls]; });
    this.tris.forEach(t => this.drawTri(t));

    this.missions = M.numbered ? this.makeNormalMissions() : this.makeEasyMissions();
    this.mi = 0;
    this.renderMissions();
    this.renderGoal();
    $('#rt-miss').textContent = '0';
  }

  makeEasyMissions() {
    const n = this.p.easyMissions;
    const per = { acute: 0, right: 0, obtuse: 0 };
    this.tris.forEach(t => per[t.cls]++);
    const pool = [];
    TRI_KEYS.forEach(k => { for (let i = 0; i < per[k]; i++) pool.push(k); });
    return shuffle(pool).slice(0, n).map(cls => ({ cls, num: null, dir: pick([1, -1]), n: rndInt(1, 3), done: false }));
  }
  makeNormalMissions() {
    const pool = shuffle(this.tris.slice()).slice(0, this.M.goal);
    const list = pool.map(t => ({ cls: t.cls, num: t.num, dir: pick([1, -1]), n: rndInt(1, this.p.maxTurn), done: false }));
    // 미션 판은 종류별로 묶고 번호순 (디자인 3쪽)
    const order = { right: 0, acute: 1, obtuse: 2 };
    return list.sort((a, b) => order[a.cls] - order[b.cls] || a.num - b.num);
  }

  drawTri(t) {
    const g = svgEl('g', { class: 'rt-tri', 'data-id': t.id }, this.gTris);
    svgEl('polygon', { points: ptsAttr(t.pts) }, g);
    t.g = g; this.place(t, true);
    g.addEventListener('pointerdown', (e) => { e.preventDefault(); this.select(t); });
    if (this.M.numbered) {
      const lab = svgEl('text', { x: t.x, y: t.y + 9, class: 'rt-num' }, this.gLabels);
      lab.textContent = t.num; t.lab = lab;
    }
  }
  place(t, instant) {
    const deg = t.base + t.net * this.p.stepDeg;
    if (instant) t.g.style.transition = 'none';
    t.g.style.transform = `translate(${t.x}px, ${t.y}px) rotate(${deg}deg)`;
    if (instant) { void t.g.getBoundingClientRect(); t.g.style.transition = ''; }
  }

  /* ── 조작 ──────────────────────────────────── */
  pendingFor(t) {
    if (t.locked) return null;
    if (!this.M.numbered) {
      const m = this.missions[this.mi];
      return m && !m.done && m.cls === t.cls ? m : null;
    }
    return this.missions.find(m => !m.done && m.cls === t.cls && m.num === t.num) || null;
  }
  select(t) {
    if (this.over || this.paused) return;
    if (t.locked) { SFX.tick(); return; }
    if (!this.pendingFor(t)) {
      this.miss++; $('#rt-miss').textContent = this.miss;
      SFX.bad(); Toast.show('틀렸습니다', 'bad');
      if (this.miss >= this.p.missLimit) this.reset();
      t.g.classList.remove('shake'); void t.g.getBoundingClientRect(); t.g.classList.add('shake');
      return;
    }
    SFX.select();
    if (this.selected) this.selected.g.classList.remove('sel');
    this.selected = t; t.g.classList.add('sel');
    this.gTris.appendChild(t.g);   // 맨 위로
    this.renderGoal();
  }
  turn(k) {
    if (this.over || this.paused) return;
    const t = this.selected;
    if (!t) { Toast.show('삼각형부터'); SFX.tick(); return; }
    t.net += k; this.place(t);
    SFX.turn();
    const m = this.pendingFor(t);
    if (m && t.net === m.dir * m.n) {
      m.done = true; t.locked = true; this.done++;
      t.g.classList.remove('sel'); t.g.classList.add('done', t.cls);
      this.selected = null;
      this.after(260, () => { SFX.good(); Toast.show('맞았어!', 'good'); });
      if (!this.M.numbered) this.mi++;
      this.renderMissions(); this.renderGoal();
      if (this.missions.every(x => x.done)) this.after(900, () => this.finish());
    } else {
      this.renderGoal();
    }
  }

  /* ── 화면 갱신 ─────────────────────────────── */
  dirText(m) { return `${m.dir > 0 ? '오른쪽' : '왼쪽'}으로 ${m.n}번`; }
  renderMissions() {
    const box = $('#rt-mlist');
    if (!this.M.numbered) {
      const m = this.missions[this.mi] || this.missions[this.missions.length - 1];
      box.innerHTML = `
        <div class="rt-easy">
          <p class="rt-kind">${TRI[m.cls].full}</p>
          <p class="rt-order">${this.dirText(m)}<br>돌리기!</p>
          <div class="rt-steps">${this.missions.map((x, i) => `<i class="${x.done ? 'on' : i === this.mi ? 'now' : ''}"></i>`).join('')}</div>
        </div>`;
      return;
    }
    const groups = {};
    this.missions.forEach(m => (groups[m.cls] = groups[m.cls] || []).push(m));
    box.innerHTML = Object.keys(groups).map(cls => `
      <div class="rt-group">
        <p class="rt-gname">${TRI[cls].full}</p>
        ${groups[cls].map(m => `<p class="rt-item ${m.done ? 'done' : ''}"><b>${m.num}번</b>${this.dirText(m)}</p>`).join('')}
      </div>`).join('') + '<p class="rt-foot">돌리기</p>';
  }
  renderGoal() {
    const total = this.missions.length;
    $('#rt-goalnum').textContent = `${this.done}/${total}`;
    const svg = $('#rt-target'); svg.innerHTML = '';
    const t = this.selected;
    if (!t) {
      svgEl('text', { x: 0, y: 8, class: 'rt-tgt-empty' }, svg).textContent = '?';
      return;
    }
    const m = this.pendingFor(t);
    const k = 64 / Math.max(...t.pts.map(p => Math.hypot(p[0], p[1])));
    const scaled = t.pts.map(p => [p[0] * k, p[1] * k]);
    const goal = svgEl('polygon', { points: ptsAttr(rotPts(scaled, t.base + m.dir * m.n * this.p.stepDeg)), class: 'rt-tgt-goal' }, svg);
    svgEl('polygon', { points: ptsAttr(rotPts(scaled, t.base + t.net * this.p.stepDeg)), class: 'rt-tgt-now' }, svg);
    goal.parentNode.appendChild(goal);
  }
  tickTime() {
    if (this.over || this.paused) return;
    $('#rt-time').textContent = mmss(this.elapsed());
  }
  elapsed() { return (performance.now() - this.t0 - this.pausedTotal) / 1000; }
  pause() { if (!this.paused) { this.paused = true; this.pausedAt = performance.now(); } }
  resume() { if (this.paused) { this.paused = false; this.pausedTotal += performance.now() - this.pausedAt; } }

  finish() {
    this.over = true;
    const sec = this.elapsed(), M = this.M;
    this.lastResult = { mode: this.mode, sec, miss: this.miss };
    SFX.win();
    if (M.next) {
      const N = this.MODES[M.next];
      Overlay.show({
        kicker: 'Mode clear', title: `${M.name} 클리어`,
        body: statsHTML([[mmss(sec), '걸린 시간'], [this.miss, '실수']]),
        actions: [{ label: N.name, key: 'Enter', primary: true, onClick: () => this.start(M.next) }]
      });
    } else {
      Overlay.show({
        kicker: 'Mission clear', title: '클리어!',
        body: statsHTML([[`${this.done}/${this.missions.length}`, '목표 달성'], [mmss(sec), '걸린 시간'], [this.miss, '실수']]),
        actions: [
          { label: '다시', key: 'Enter', primary: true, onClick: () => this.start(this.mode) },
          { label: '쉬움 모드', onClick: () => this.start('easy') }
        ]
      });
    }
  }
  /** 실수가 missLimit 번이 되면 그 모드를 처음부터 (기획자 2차 페이퍼) */
  reset() {
    this.over = true; SFX.lose();
    this.lastResult = { mode: this.mode, reset: true, miss: this.miss };
    this.after(500, () => Overlay.show({
      kicker: 'Reset', title: '틀려서 처음으로 초기화됩니다',
      body: `<p class="ov-note">${this.miss}번 틀렸어요.</p>`,
      actions: [{ label: '처음부터', key: 'Enter', primary: true, onClick: () => this.start(this.mode) }]
    }));
  }
}
gameClasses[1] = GameRotate;
