/* ═══════════════════════════════════════════════════
   5. 칠각 게임 — 기획 : 사람들
   네모 틀을 미션이 말한 삼각형으로만 채운다. 칠교처럼 끌어다 놓고, 얼마나 채웠는지 %로 본다.
   ═══════════════════════════════════════════════════ */

class GameTangram extends GameBase {
  constructor() {
    super();
    this.paramSpec = [
      { key: 'lives',      label: '목숨',                       orig: 3,   unit: '개', min: 1, max: 9,   src: 'plan', note: '하트 세 개' },
      { key: 'timeEarly',  label: '제한시간 1~4라운드',          orig: 90,  unit: '초', min: 10, max: 300, src: 'plan', note: '1분 30초' },
      { key: 'timeLate',   label: '제한시간 5~10라운드',         orig: 60,  unit: '초', min: 10, max: 300, src: 'plan', note: '1분' },
      { key: 'rounds',     label: '라운드 수',                   orig: 10,  unit: '라운드', min: 1, max: 30, src: 'plan', note: '1~10라운드가 끝' },
      { key: 'passPoint',  label: '통과하면 받는 포인트',         orig: 2,   unit: 'P', min: 0, max: 50,  src: 'plan', note: '"퍼즐을 맞추면 2포인트"' },
      { key: 'wrongPoint', label: '잘못된 삼각형 벌점',           orig: 10,  unit: 'P', min: 0, max: 50,  src: 'plan', note: '' },
      { key: 'winPoint',   label: '이기는 포인트',               orig: 50,  unit: 'P', min: 1, max: 200, src: 'plan', note: '' },
      { key: 'losePoint',  label: '지는 포인트',                 orig: -15, unit: 'P', min: -100, max: 0, src: 'plan', note: '' },
      { key: 'passRight',  label: '통과 기준 — 직각 미션',        orig: 60,  unit: '%', min: 1, max: 100, src: 'plan', note: '' },
      { key: 'passObtuse', label: '통과 기준 — 둔각 미션',        orig: 50,  unit: '%', min: 1, max: 100, src: 'plan', note: '' },
      { key: 'passAcute',  label: '통과 기준 — 예각 미션',        orig: 70,  unit: '%', min: 1, max: 100, src: 'plan', note: '' },
      { key: 'shopTime',   label: '상점: 15초 늘리기',            orig: 8,   unit: 'P', min: 0, max: 50,  src: 'plan', note: '' },
      { key: 'shopSkip',   label: '상점: 라운드 건너뛰기',         orig: 10,  unit: 'P', min: 0, max: 50,  src: 'plan', note: '' },
      { key: 'shopHint',   label: '상점: 삼각형 1개 힌트',         orig: 5,   unit: 'P', min: 0, max: 50,  src: 'plan', note: '' },
      { key: 'decoyEasy',  label: '섞인 다른 삼각형 (쉬움·보통·어려움)', orig: [2, 4, 6], unit: '개', src: 'mine', note: '난이도 차이가 적혀 있지 않아서' }
    ];
    this.resetParams();
    this.W = 1000; this.H = 760;
    this.F = { x: 230, y: 34, w: 540, h: 360 };            // 네모 틀 (3:2)
    this.tray = { x: 20, y: 440, w: 960, h: 300 };
    this.level = 0;                                          // 0 쉬움 · 1 보통 · 2 어려움
    this.SAMPLE = 6;                                         // 채운 % 를 잴 때 점 간격
  }

  mount(stage) {
    this.stage = stage;
    const F = this.F, T = this.tray;
    stage.innerHTML = `
      <div class="tg">
        <aside class="tg-left">
          <div class="tg-lives"><div id="tg-hearts"></div><em>목숨</em></div>
          <div class="tg-level"><em>난이도</em><div id="tg-faces"></div></div>
          <div class="tg-round"><em>라운드</em><b id="tg-round">1</b><span>/ ${this.p.rounds}</span></div>
        </aside>
        <div class="tg-field">
          <svg class="tg-svg" viewBox="0 0 ${this.W} ${this.H}" preserveAspectRatio="xMidYMid meet">
            <defs><pattern id="tg-grid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30 0H0V30" fill="none" stroke="rgba(242,237,227,.06)"/></pattern></defs>
            <rect class="tg-frame-bg" x="${F.x}" y="${F.y}" width="${F.w}" height="${F.h}"/>
            <rect x="${F.x}" y="${F.y}" width="${F.w}" height="${F.h}" fill="url(#tg-grid)"/>
            <rect class="tg-frame" x="${F.x - 6}" y="${F.y - 6}" width="${F.w + 12}" height="${F.h + 12}" rx="6"/>
            <rect class="tg-traybg" x="${T.x - 10}" y="${T.y - 16}" width="${T.w + 20}" height="${T.h + 26}" rx="18"/>
            <g id="tg-pieces"></g>
          </svg>
          <div class="tg-beep" id="tg-beep" hidden>삐빅, 잘못된 삼각형입니다</div>
        </div>
        <aside class="tg-right">
          <div class="tg-top">
            <div class="tg-timer" id="tg-timerbox"><b id="tg-time">1:30</b><em>남은 시간</em></div>
            <button class="tg-shopbtn" id="tg-shopbtn" type="button">
              <svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>힌트 <kbd>H</kbd>
            </button>
            <div class="tg-points"><b id="tg-points">0</b><em>포인트</em></div>
          </div>
          <div class="tg-shop" id="tg-shop" hidden>
            <button type="button" data-buy="time">15초 시간 늘리기 <b>${this.p.shopTime}P</b></button>
            <button type="button" data-buy="skip">라운드 건너뛰기 <b>${this.p.shopSkip}P</b></button>
            <button type="button" data-buy="hint">삼각형 1개 힌트 <b>${this.p.shopHint}P</b></button>
          </div>
          <div class="tg-mission" id="tg-mission"></div>
          <div class="tg-fill">
            <div class="tg-fillbar"><i id="tg-fillbar"></i><s id="tg-fillgoal"></s></div>
            <p><b id="tg-fillpct">0%</b><span id="tg-fillneed"></span></p>
          </div>
          <button class="btn primary tg-done" id="tg-done" type="button">다 채웠어요 <kbd>Enter</kbd></button>
          <p class="tg-help"><kbd>R</kbd> 돌리기</p>
        </aside>
      </div>`;
    this.svg = $('.tg-svg', stage);
    this.kit = new PieceKit(this, {
      svg: this.svg, layer: $('#tg-pieces', stage), trayScale: 0.42, step: 90,
      onDrop: (p) => this.drop(p),
      onPick: (p) => { if (p.state === 'placed') { p.state = 'tray'; this.updateFill(); } },
      onRotate: (p) => { if (p.state === 'placed') { const ok = this.validPlace(p); if (!ok) { this.kit.home(p); } this.updateFill(); } }
    });
    $('#tg-faces').innerHTML = ['쉬움', '보통', '어려움'].map((n, i) => `
      <button type="button" class="tg-face" data-lv="${i}" title="${n}">${this.faceSVG(i)}<span>${n}</span></button>`).join('');
    $$('.tg-face', stage).forEach(b => b.onclick = () => { SFX.select(); this.level = +b.dataset.lv; this.newGame(); });
    $('#tg-shopbtn').onclick = () => { $('#tg-shop').hidden = !$('#tg-shop').hidden; SFX.select(); };
    $$('#tg-shop button', stage).forEach(b => b.onclick = () => this.buy(b.dataset.buy));
    $('#tg-done').onclick = () => this.endRound(false);
    this.bindKeys((e) => {
      if (e.key === 'r' || e.key === 'R' || e.key === 'ㄱ' || e.key === ' ') { e.preventDefault(); this.kit.rotateSel(); }
      else if (e.key === 'Enter') { e.preventDefault(); this.endRound(false); }
      else if (e.key === 'h' || e.key === 'H' || e.key === 'ㅗ') { $('#tg-shop').hidden = !$('#tg-shop').hidden; }
    });
    this.every(100, () => this.tick());
    this.newGame();
  }
  faceSVG(i) {
    const mouth = ['M8 14 q4 4 8 0', 'M8 15 h8', 'M8 16 q4 -4 8 0'][i];
    return `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="9" cy="10" r="1.2" class="f"/><circle cx="15" cy="10" r="1.2" class="f"/><path d="${mouth}"/></svg>`;
  }

  /* ── 게임 · 라운드 ───────────────────────── */
  newGame() {
    this.over = false; this.points = 0; this.lives = this.p.lives; this.round = 0; this.log = [];
    $$('.tg-face').forEach(b => b.classList.toggle('on', +b.dataset.lv === this.level));
    this.renderTop();
    this.nextRound();
  }
  nextRound() {
    this.round++;
    if (this.round > this.p.rounds) return this.finish('end');
    this.busy = false;
    this.mission = pick(TRI_KEYS);
    this.left = this.round <= 4 ? this.p.timeEarly : this.p.timeLate;
    $('#tg-round').textContent = this.round;
    $('#tg-mission').innerHTML = `<b class="${this.mission}">${TRI[this.mission].full}</b>으로만<br>채우세요.`;
    $('#tg-shop').hidden = true;
    this.buildPieces();
    this.updateFill();
    this.renderTop();
  }
  passNeed() { return { right: this.p.passRight, obtuse: this.p.passObtuse, acute: this.p.passAcute }[this.mission]; }

  /** 미션 조각 : 틀을 채울 수 있는 크기로. 다른 종류 조각은 난이도만큼 섞는다 */
  missionPieces(cls) {
    const F = this.F, out = [];
    if (cls === 'right') {
      // 3×2 정사각형(180) — 큰 직사각형 2개(360×180)와 정사각형 2개를 대각선으로 자른 8조각
      const a = F.h / 2;
      for (let i = 0; i < 2; i++) out.push([[0, 0], [2 * a, 0], [0, a]], [[2 * a, 0], [2 * a, a], [0, a]]);
      for (let i = 0; i < 2; i++) out.push([[0, 0], [a, 0], [0, a]], [[a, 0], [a, a], [0, a]]);
    } else if (cls === 'obtuse') {
      // 밑변 270·높이 90 — 꼭지각 113°
      const b = F.w / 2, h = F.h / 4;
      for (let i = 0; i < 10; i++) out.push([[0, h], [b, h], [b / 2, 0]]);
    } else {
      // 밑변 180·높이 180 — 꼭지각 53°, 밑각 63°. 띠 두 줄로 놓으면 83%까지 찬다
      const b = F.w / 3, h = F.h / 2;
      for (let i = 0; i < 11; i++) out.push([[0, h], [b, h], [b / 2, 0]]);
    }
    return out.map(center);
  }
  buildPieces() {
    this.kit.clear();
    const specs = this.missionPieces(this.mission).map(pts => ({ pts, cls: this.mission, rot: rndInt(0, 3) * 90 }));
    const nDecoy = this.p.decoyEasy[this.level];
    const gap = [24, 14, 6][this.level];
    const others = TRI_KEYS.filter(k => k !== this.mission);
    for (let i = 0; i < nDecoy; i++) {
      const t = triBySides(others[i % 2], rnd(170, 300), { acuteMax: 90 - gap, obtuseMin: 90 + gap, obtuseMax: Math.max(90 + gap + 6, 130) });
      specs.push({ pts: t.pts, cls: t.cls, rot: rndInt(0, 3) * 90 });
    }
    // 쟁반 칸에 들어가게 조각 크기를 줄여 보여 준다 (끌어 올리면 실제 크기)
    const cols = Math.ceil(specs.length / 2), cw = this.tray.w / cols, ch = this.tray.h / 2;
    const big = Math.max(...specs.map(sp => 2 * Math.max(...sp.pts.map(q => Math.hypot(q[0], q[1])))));
    this.kit.o.trayScale = Math.min(0.42, (Math.min(cw, ch) - 12) / big);
    const list = shuffle(specs).map(sp => this.kit.add(Object.assign(sp, { home: { x: 0, y: 0 } })));
    this.kit.layoutTray(list, this.tray, cols);
    list.forEach(p => this.kit.home(p));
  }

  /* ── 놓기 ───────────────────────────────── */
  inFrame(x, y, pad = 24) { const F = this.F; return x > F.x - pad && x < F.x + F.w + pad && y > F.y - pad && y < F.y + F.h + pad; }
  drop(p) {
    if (this.busy || this.over) return false;
    if (!this.inFrame(p.x, p.y)) return false;
    if (p.cls !== this.mission) { this.wrong(); return false; }
    this.snap(p);
    if (!this.validPlace(p)) return false;
    p.state = 'placed'; p.g.classList.add('placed', p.cls); this.kit.draw(p);
    SFX.select(); this.updateFill();
    return true;
  }
  /** 가까운 틀 모서리·다른 조각 꼭짓점에 붙인다 */
  snap(p) {
    const F = this.F, w = this.kit.world(p);
    const xs = [F.x, F.x + F.w], ys = [F.y, F.y + F.h];
    this.kit.list.filter(q => q !== p && q.state === 'placed').forEach(q => this.kit.world(q).forEach(([x, y]) => { xs.push(x); ys.push(y); }));
    let dx = 0, dy = 0, bx = 18, by = 18;
    w.forEach(([x, y]) => {
      xs.forEach(t => { if (Math.abs(t - x) < bx) { bx = Math.abs(t - x); dx = t - x; } });
      ys.forEach(t => { if (Math.abs(t - y) < by) { by = Math.abs(t - y); dy = t - y; } });
    });
    p.x += dx; p.y += dy;
    // 틀을 조금 넘었으면 안으로 밀어 넣는다 (조각이 틀보다 작을 때만)
    const v = this.kit.world(p), vx = v.map(q => q[0]), vy = v.map(q => q[1]);
    const minX = Math.min(...vx), maxX = Math.max(...vx), minY = Math.min(...vy), maxY = Math.max(...vy);
    if (maxX - minX <= F.w) { if (minX < F.x) p.x += F.x - minX; else if (maxX > F.x + F.w) p.x -= maxX - (F.x + F.w); }
    if (maxY - minY <= F.h) { if (minY < F.y) p.y += F.y - minY; else if (maxY > F.y + F.h) p.y -= maxY - (F.y + F.h); }
    this.kit.draw(p);
  }
  validPlace(p) {
    const F = this.F, w = this.kit.world(p);
    if (!w.every(([x, y]) => x >= F.x - 3 && x <= F.x + F.w + 3 && y >= F.y - 3 && y <= F.y + F.h + 3)) { Toast.show('틀 안에'); return false; }
    const others = this.kit.list.filter(q => q !== p && q.state === 'placed').map(q => this.kit.world(q));
    // 겹침 : 조각 안쪽 점이 다른 조각 안에 얼마나 들어가는지
    let inside = 0, hit = 0;
    const xs = w.map(q => q[0]), ys = w.map(q => q[1]);
    for (let x = Math.min(...xs); x <= Math.max(...xs); x += 5) for (let y = Math.min(...ys); y <= Math.max(...ys); y += 5) {
      if (!inTriStrict(x, y, w)) continue;
      inside++;
      if (others.some(t => inTriStrict(x, y, t))) hit++;
    }
    if (inside && hit / inside > 0.04) { Toast.show('겹쳐요'); return false; }
    return true;
  }
  coverage() {
    const F = this.F, tris = this.kit.list.filter(q => q.state === 'placed').map(q => this.kit.world(q));
    let n = 0, c = 0;
    for (let x = F.x + this.SAMPLE / 2; x < F.x + F.w; x += this.SAMPLE) for (let y = F.y + this.SAMPLE / 2; y < F.y + F.h; y += this.SAMPLE) {
      n++; if (tris.some(t => inTri(x, y, t))) c++;
    }
    return Math.round(c / n * 100);
  }
  updateFill() {
    const pct = this.coverage(), need = this.passNeed();
    $('#tg-fillpct').textContent = pct + '%';
    $('#tg-fillneed').textContent = ` / 통과 ${need}%`;
    $('#tg-fillbar').style.width = pct + '%';
    $('#tg-fillgoal').style.left = need + '%';
    $('.tg-fill').classList.toggle('pass', pct >= need);
    return pct;
  }
  wrong() {
    this.points -= this.p.wrongPoint; this.renderTop();
    SFX.bad();
    const b = $('#tg-beep'); b.hidden = true; void b.offsetWidth; b.hidden = false;
    this.after(1300, () => { b.hidden = true; });
    if (this.points <= this.p.losePoint) this.after(700, () => this.finish('lose'));
  }

  /* ── 상점 ───────────────────────────────── */
  buy(kind) {
    if (this.busy || this.over) return;
    const cost = { time: this.p.shopTime, skip: this.p.shopSkip, hint: this.p.shopHint }[kind];
    if (this.points < cost) { SFX.bad(); Toast.show('포인트가 모자라', 'bad'); return; }
    this.points -= cost; this.renderTop(); SFX.good();
    $('#tg-shop').hidden = true;
    this.log.push({ round: this.round, buy: kind });
    if (kind === 'time') { this.left += 15; Toast.show('+15초', 'good'); }
    else if (kind === 'skip') { Toast.show('건너뛰기'); this.busy = true; this.after(500, () => this.nextRound()); }
    else {
      const p = this.kit.list.find(q => q.state === 'tray' && q.cls === this.mission);
      if (p) { p.g.classList.add('hint'); this.after(3000, () => p.g.classList.remove('hint')); }
    }
  }

  /* ── 진행 ───────────────────────────────── */
  tick() {
    if (this.over || this.paused || this.busy) return;
    this.left -= 0.1;
    $('#tg-time').textContent = mmss(Math.max(0, Math.ceil(this.left)));
    $('#tg-timerbox').classList.toggle('hot', this.left <= 10);
    if (this.left <= 0) this.endRound(true);
  }
  endRound(timeout) {
    if (this.busy || this.over) return;
    this.busy = true;
    const pct = this.coverage(), need = this.passNeed(), pass = pct >= need;
    this.log.push({ round: this.round, mission: this.mission, pct, pass, timeout });
    if (pass) { this.points += this.p.passPoint; SFX.win(); Toast.show(`통과 ${pct}%`, 'good'); }
    else { this.lives--; SFX.lose(); Toast.show(`${timeout ? '시간 끝 ' : ''}${pct}%`, 'bad'); }
    this.renderTop();
    if (this.points >= this.p.winPoint) return this.after(900, () => this.finish('win'));
    if (this.lives <= 0 || this.points <= this.p.losePoint) return this.after(900, () => this.finish('lose'));
    this.after(1300, () => this.nextRound());
  }
  renderTop() {
    $('#tg-hearts').innerHTML = Array.from({ length: this.p.lives }, (_, i) =>
      `<svg viewBox="0 0 24 24" class="${i < this.lives ? 'on' : ''}"><path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z"/></svg>`).join('');
    $('#tg-points').textContent = this.points;
    $('#tg-points').classList.toggle('neg', this.points < 0);
    $$('#tg-shop button').forEach(b => {
      const cost = { time: this.p.shopTime, skip: this.p.shopSkip, hint: this.p.shopHint }[b.dataset.buy];
      b.disabled = this.points < cost;
    });
  }
  finish(kind) {
    if (this.over) return;
    this.over = true; this.busy = true;
    this.lastResult = { kind, points: this.points, round: Math.min(this.round, this.p.rounds), lives: this.lives, log: this.log };
    kind === 'win' ? SFX.win() : SFX.lose();
    const passed = this.log.filter(l => l.pass).length;
    Overlay.show({
      kicker: 'Chilgak', title: kind === 'win' ? 'Win!' : kind === 'lose' ? 'Lose...' : '종료',
      body: statsHTML([[`${this.points}P`, '포인트'], [passed, '통과한 라운드'], [this.lives, '남은 목숨']]),
      actions: [{ label: '새 게임', key: 'Enter', primary: true, onClick: () => this.newGame() }]
    });
  }
}
gameClasses[5] = GameTangram;
