/* ═══════════════════════════════════════════════════
   3. 물고기 잡기! — 기획 : 잼민이 아닌데요?
   빛나는 지느러미가 예각·직각·둔각 중 무엇인지 보고, 말한 물고기만 낚는다.
   ═══════════════════════════════════════════════════ */

class GameFish extends GameBase {
  constructor() {
    super();
    this.paramSpec = [
      { key: 'casts',      label: '잡을 수 있는 횟수',          orig: 5,  unit: '번',  min: 1, max: 20, src: 'plan', note: '규칙 "총 5번 잡을 수 있으며"' },
      { key: 'seaMin',     label: '바다 물고기 수 (최소)',       orig: 10, unit: '마리', min: 3, max: 30, src: 'plan', note: '규칙 "10~15마리"' },
      { key: 'seaMax',     label: '바다 물고기 수 (최대)',       orig: 15, unit: '마리', min: 3, max: 30, src: 'plan', note: '' },
      { key: 'riverMin',   label: '강 물고기 수 (최소)',         orig: 10, unit: '마리', min: 3, max: 30, src: 'mine', note: '바다와 같게' },
      { key: 'riverMax',   label: '강 물고기 수 (최대)',         orig: 15, unit: '마리', min: 3, max: 30, src: 'mine', note: '' },
      { key: 'deepMin',    label: '심해 물고기 수 (최소)',       orig: 8,  unit: '마리', min: 3, max: 30, src: 'mine', note: '어두워서 조금 적게' },
      { key: 'deepMax',    label: '심해 물고기 수 (최대)',       orig: 12, unit: '마리', min: 3, max: 30, src: 'mine', note: '' },
      { key: 'seaGap',     label: '바다: 직각과 떨어진 정도',    orig: 22, unit: '°',  min: 1, max: 40, src: 'mine', note: '예각은 68° 이하, 둔각은 112° 이상' },
      { key: 'riverGap',   label: '강: 직각과 떨어진 정도',      orig: 12, unit: '°',  min: 1, max: 40, src: 'mine', note: '예각은 78° 이하, 둔각은 102° 이상' },
      { key: 'deepGap',    label: '심해: 직각과 떨어진 정도',    orig: 6,  unit: '°',  min: 1, max: 40, src: 'mine', note: '예각은 84° 이하, 둔각은 96° 이상' },
      { key: 'seaSpeed',   label: '바다 헤엄 속도',             orig: 55, unit: '',   min: 0, max: 300, src: 'mine', note: '1초에 움직이는 거리' },
      { key: 'riverSpeed', label: '강 헤엄 속도',               orig: 90, unit: '',   min: 0, max: 300, src: 'mine', note: '' },
      { key: 'deepSpeed',  label: '심해 헤엄 속도',             orig: 120, unit: '',  min: 0, max: 300, src: 'mine', note: '' }
    ];
    this.resetParams();
    this.W = 1600; this.H = 900; this.FS = 0.74;   // FS : 물고기 몸 크기
    this.MAPS = {
      sea:   { name: '바다',    lv: '쉬움',   surface: 250, kinds: ['round', 'long', 'box', 'round'] },
      deep:  { name: '심해 속', lv: '어려움', surface: 70,  kinds: ['angler', 'moon', 'squid', 'jelly'] },
      river: { name: '강',      lv: '보통',   surface: 270, kinds: ['eel', 'octo', 'small', 'tri'] }
    };
  }

  mount(stage) {
    this.stage = stage;
    // 무대 비율에 맞춰 바다 높이를 정한다 (위아래가 잘리지 않게)
    const w = stage.clientWidth, h = stage.clientHeight;
    this.H = w && h ? clamp(Math.round(this.W * h / w), 600, 1000) : 900;
    stage.innerHTML = `
      <div class="fs">
        <svg class="fs-svg" viewBox="0 0 ${this.W} ${this.H}" preserveAspectRatio="xMidYMid slice">
          <defs>
            <filter id="fs-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <linearGradient id="fs-sky-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7FCAD6"/><stop offset="1" stop-color="#D6EFEA"/></linearGradient>
            <linearGradient id="fs-water-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1B9DB0"/><stop offset=".55" stop-color="#0E6A86"/><stop offset="1" stop-color="#073A55"/></linearGradient>
            <linearGradient id="fs-sky-river" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B9D3C0"/><stop offset="1" stop-color="#E6EEDD"/></linearGradient>
            <linearGradient id="fs-water-river" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4E9A92"/><stop offset=".6" stop-color="#2C6A68"/><stop offset="1" stop-color="#173F42"/></linearGradient>
            <linearGradient id="fs-water-deep" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0E2440"/><stop offset=".5" stop-color="#07142A"/><stop offset="1" stop-color="#020611"/></linearGradient>
            <linearGradient id="fs-ray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9CC8FF" stop-opacity=".16"/><stop offset="1" stop-color="#9CC8FF" stop-opacity="0"/></linearGradient>
          </defs>
          <g id="fs-scene"></g>
          <g id="fs-fish"></g>
          <g id="fs-line">
            <line id="fs-string" x1="800" y1="0" x2="800" y2="200" stroke="#F2EDE3" stroke-width="2.5" stroke-opacity=".8"/>
            <g id="fs-hook" transform="translate(800 200)">
              <path d="M0 -14 V10 a10 10 0 0 1 -20 0" fill="none" stroke="#F2EDE3" stroke-width="4" stroke-linecap="round"/>
              <circle cx="0" cy="-14" r="5" fill="#FF5A36"/>
            </g>
          </g>
          <g id="fs-fx"></g>
        </svg>
        <div class="fs-hud" id="fs-hud" hidden>
          <div class="fs-target" id="fs-target"></div>
          <div class="fs-right">
            <span class="fs-map" id="fs-map"></span>
            <div class="fs-casts" id="fs-casts"></div>
          </div>
        </div>
        <div class="fs-home" id="fs-home">
          <h3>맵 선택</h3>
          <div class="fs-maps" id="fs-maps"></div>
        </div>
      </div>`;
    this.svg = $('.fs-svg', stage);
    this.gFish = $('#fs-fish', stage);

    const maps = $('#fs-maps', stage);
    Object.entries(this.MAPS).forEach(([id, m], i) => {
      const b = el('button', 'fs-mapbtn ' + id, `
        <span class="fs-mapart">${this.thumb(id)}</span>
        <span class="fs-mapinfo"><kbd>${i + 1}</kbd><b>${m.name}</b><em>${m.lv}</em></span>`);
      b.type = 'button';
      b.onclick = () => { SFX.select(); this.start(id); };
      maps.appendChild(b);
    });

    this.on(this.svg, 'pointermove', (e) => this.aim(e));
    this.bindKeys((e) => {
      if (!$('#fs-home').hidden) {
        const id = Object.keys(this.MAPS)[Number(e.key) - 1];
        if (id) { e.preventDefault(); SFX.select(); this.start(id); }
      }
    });
    this.drawScene('sea');
    this.loop((dt) => this.step(dt));
  }

  /* ── 맵 ───────────────────────────────────── */
  thumb(id) {
    const c = { sea: ['#7FCAD6', '#1B9DB0', '#0B4F6C'], deep: ['#0E2440', '#07142A', '#020611'], river: ['#B9D3C0', '#4E9A92', '#173F42'] }[id];
    return `<svg viewBox="0 0 160 90" preserveAspectRatio="none">
      <rect width="160" height="90" fill="${c[0]}"/>
      <rect y="${id === 'deep' ? 0 : 34}" width="160" height="90" fill="${c[1]}"/>
      <rect y="62" width="160" height="30" fill="${c[2]}" opacity=".7"/>
      <path d="M58 56 L76 46 L76 66 Z" fill="none" stroke="#62F0D3" stroke-width="2"/>
      <ellipse cx="92" cy="56" rx="18" ry="11" fill="${id === 'deep' ? '#1A2C48' : '#FFB08A'}"/>
    </svg>`;
  }
  drawScene(id) {
    const g = $('#fs-scene'); const W = this.W, H = this.H;
    const s = this.MAPS[id].surface;
    if (id === 'sea') {
      g.innerHTML = `
        <rect width="${W}" height="${s}" fill="url(#fs-sky-sea)"/>
        <circle cx="1320" cy="110" r="56" fill="#FFE08A"/>
        <path d="M0 ${s} C80 ${s - 70} 260 ${s - 80} 380 ${s}Z" fill="#E9CC8B"/>
        <path d="M120 ${s - 50} C130 ${s - 120} 150 ${s - 170} 170 ${s - 200}" stroke="#6B4A2E" stroke-width="10" fill="none" stroke-linecap="round"/>
        ${[[-60, -10], [-20, -40], [30, -30], [70, 5], [-5, 20]].map(([a, b]) => `<path d="M170 ${s - 200} q${a / 2} ${b / 2 - 20} ${a} ${b + 10}" stroke="#2F7D4E" stroke-width="16" fill="none" stroke-linecap="round"/>`).join('')}
        <rect y="${s}" width="${W}" height="${H - s}" fill="url(#fs-water-sea)"/>
        <path d="M0 ${s} ${Array.from({ length: 21 }, (_, i) => `Q${i * 80 + 40} ${s - 14} ${i * 80 + 80} ${s}`).join(' ')} V${s + 30} H0Z" fill="#2DB3C4"/>
        <path d="M0 ${H - 40} C300 ${H - 90} 600 ${H - 20} 900 ${H - 60} S1400 ${H - 30} 1600 ${H - 70} V${H} H0Z" fill="#E1C487" opacity=".55"/>`;
    } else if (id === 'river') {
      g.innerHTML = `
        <rect width="${W}" height="${s}" fill="url(#fs-sky-river)"/>
        <path d="M0 ${s - 40} C300 ${s - 120} 600 ${s - 70} 900 ${s - 110} S1400 ${s - 60} 1600 ${s - 100} V${s} H0Z" fill="#7FA774"/>
        <path d="M0 ${s - 10} C400 ${s - 50} 900 ${s - 20} 1600 ${s - 40} V${s} H0Z" fill="#5E8C5A"/>
        <g transform="translate(1180 ${s - 118})">
          <rect x="0" y="40" width="120" height="78" fill="#EDE3D0"/>
          <path d="M-12 44 L60 -6 L132 44Z" fill="#B5553C"/>
          <rect x="48" y="74" width="26" height="44" fill="#6B4A2E"/>
          <rect x="14" y="58" width="22" height="20" fill="#7CA3B8"/>
        </g>
        <rect y="${s}" width="${W}" height="${H - s}" fill="url(#fs-water-river)"/>
        <g class="fs-flow" stroke="#BFE2D9" stroke-opacity=".35" stroke-width="4" stroke-linecap="round">
          ${Array.from({ length: 14 }, () => { const x = rnd(0, W), y = rnd(s + 40, H - 40), l = rnd(60, 160); return `<line x1="${x}" y1="${y}" x2="${x + l}" y2="${y}"/>`; }).join('')}
        </g>
        <path d="M0 ${H - 30} C400 ${H - 70} 800 ${H - 20} 1600 ${H - 50} V${H} H0Z" fill="#2A4A3A" opacity=".8"/>`;
    } else {
      g.innerHTML = `
        <rect width="${W}" height="${H}" fill="url(#fs-water-deep)"/>
        ${[200, 520, 980, 1340].map((x, i) => `<path d="M${x} 0 L${x + 120} 0 L${x + 320 - i * 30} ${H} L${x + 140} ${H}Z" fill="url(#fs-ray)"/>`).join('')}
        <g transform="translate(980 ${H - 160}) rotate(-12)" opacity=".9">
          <path d="M0 60 L60 0 L520 0 L560 60 L520 120 L40 120Z" fill="#0F1E33"/>
          <rect x="170" y="-70" width="60" height="72" fill="#0F1E33"/>
          <rect x="290" y="-90" width="60" height="92" fill="#0F1E33"/>
          ${Array.from({ length: 8 }, (_, i) => `<circle cx="${110 + i * 50}" cy="50" r="9" fill="#1A2E4A"/>`).join('')}
        </g>
        <g fill="#C9DCFF" opacity=".25">
          ${Array.from({ length: 60 }, () => `<circle cx="${rnd(0, W).toFixed(0)}" cy="${rnd(0, H).toFixed(0)}" r="${rnd(1, 3).toFixed(1)}"/>`).join('')}
        </g>`;
    }
  }

  /* ── 판 시작 ───────────────────────────────── */
  start(id) {
    this.map = id; this.caught = 0; this.over = false; this.busy = false; this.log = [];
    this.stage.querySelector('.fs').className = 'fs map-' + id;
    $('#fs-home').hidden = true; $('#fs-hud').hidden = false;
    $('#fs-map').textContent = `${this.MAPS[id].name} · ${this.MAPS[id].lv}`;
    this.drawScene(id);
    this.gFish.innerHTML = ''; this.fish = [];
    const n = rndInt(this.p[id + 'Min'], this.p[id + 'Max']);
    const kinds = shuffle(Array.from({ length: n }, (_, i) => TRI_KEYS[i % 3]));
    // 물고기끼리 겹치지 않게 헤엄치는 줄을 나눈다. 같은 줄은 방향·속도가 같아서 서로 따라잡지 않는다
    const top = this.MAPS[id].surface + (id === 'deep' ? 110 : 70), bottom = this.H - (id === 'deep' ? 110 : 50);
    const L = Math.max(3, Math.min(n, Math.floor((bottom - top) / 74)));
    this.lanes = Array.from({ length: L }, (_, i) => ({
      y: top + (bottom - top) * (i + 0.5) / L, dir: i % 2 ? 1 : -1, v: this.speed() * rnd(0.75, 1.25)
    }));
    const P = this.W + 280;
    kinds.forEach((cls, i) => {
      const lane = this.lanes[i % L], k = Math.ceil((n - (i % L)) / L), j = Math.floor(i / L);
      this.spawn(cls, { lane, x: -140 + (j + rnd(0.2, 0.8)) * P / k });
    });
    this.renderCasts();
    this.newTarget();
  }
  gap() { return this.p[this.map + 'Gap']; }
  speed() { return this.p[this.map + 'Speed']; }

  /** opt : { lane, x } */
  spawn(cls, opt = {}) {
    const m = this.MAPS[this.map];
    const kind = pick(m.kinds);
    const gap = this.gap();
    const tri = makeTriangle(cls, 30, { acuteMax: 90 - gap, obtuseMin: 90 + gap, obtuseMax: Math.max(90 + gap + 8, 140) });
    const far = Math.max(...tri.pts.map(p => Math.hypot(p[0], p[1])));
    const size = (kind === 'small' ? 32 : 38) / this.FS;   // 몸은 줄여도 판단할 삼각형은 크게
    tri.pts = rotPts(tri.pts.map(p => [p[0] * size / far, p[1] * size / far]), rnd(0, 360));
    const lane = opt.lane || pick(this.lanes);
    const f = {
      cls, kind, tri, lane, dir: lane.dir, v: lane.v,
      x: opt.x ?? (lane.dir > 0 ? -140 : this.W + 140),
      y: lane.y, baseY: lane.y,
      ph: rnd(0, 6.28), caught: false
    };
    f.baseY = f.y;
    const g = svgEl('g', { class: 'fs-fish k-' + kind }, this.gFish);
    const body = svgEl('g', { class: 'fs-body' }, g);
    // 누르기 쉽게 몸 둘레를 넉넉히 덮는 투명 영역 (길쭉한 물고기도 잘 잡히게)
    const [ax0, ay0] = this.anchor(kind);
    svgEl('ellipse', { cx: ax0 / 2, cy: ay0 / 2, rx: 100 + Math.abs(ax0) / 2, ry: 64 + Math.abs(ay0) / 2, fill: 'transparent', class: 'fs-hit' }, body);
    body.insertAdjacentHTML('beforeend', this.bodySVG(kind));
    const [ax, ay] = this.anchor(kind);
    const tg = svgEl('g', { class: 'fs-tri', transform: `translate(${ax} ${ay})` }, body);
    svgEl('polygon', { points: ptsAttr(tri.pts), class: 'fs-fin' }, tg);
    f.g = g; f.body = body; f.tg = tg;
    g.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); this.catchFish(f); });
    this.fish.push(f);
    this.place(f);
    return f;
  }

  /** 종류별 몸통 (오른쪽을 본다). 디자인 2쪽의 물고기들 */
  bodySVG(kind) {
    const deep = this.map === 'deep';
    const c = deep ? pick(['#16294A', '#1B3257', '#132441']) : pick(['#FF8A5B', '#FFB347', '#F46B6B', '#8FD3C1', '#F7D06A', '#B9A3F0']);
    const d = deep ? '#0B1830' : 'rgba(0,0,0,.22)';
    const eye = deep ? '#9FB6DA' : '#1D1F24';
    switch (kind) {
      case 'round': return `<path d="M-50 0 L-92 -30 L-84 0 L-92 30Z" fill="${d}"/><ellipse rx="62" ry="44" fill="${c}"/><circle cx="34" cy="-10" r="7" fill="#fff"/><circle cx="36" cy="-10" r="4" fill="${eye}"/><path d="M8 -30 q10 30 0 60" stroke="${d}" stroke-width="4" fill="none"/>`;
      case 'long':  return `<path d="M-80 0 L-118 -24 L-108 0 L-118 24Z" fill="${d}"/><ellipse rx="92" ry="22" fill="${c}"/><circle cx="66" cy="-5" r="5" fill="#fff"/><circle cx="67" cy="-5" r="3" fill="${eye}"/>`;
      case 'box':   return `<path d="M-50 0 L-86 -26 L-86 26Z" fill="${d}"/><rect x="-54" y="-38" width="108" height="76" rx="12" fill="${c}"/><rect x="26" y="-18" width="12" height="12" rx="2" fill="${eye}"/>`;
      case 'small': return `<path d="M-30 0 L-54 -18 L-54 18Z" fill="${d}"/><ellipse rx="38" ry="24" fill="${c}"/><circle cx="20" cy="-6" r="4" fill="${eye}"/>`;
      case 'tri':   return `<path d="M-40 0 L-80 -30 L-80 30Z" fill="${d}"/><path d="M-46 -36 L58 0 L-46 36Z" fill="${c}"/><circle cx="10" cy="-4" r="5" fill="${eye}"/>`;
      case 'eel':   return `<path d="M-120 6 C-80 -24 -40 26 0 0 S70 -18 96 -2 C104 4 100 14 90 14 C60 12 30 30 0 22 S-80 34 -120 6Z" fill="${c}"/><circle cx="80" cy="3" r="4" fill="${eye}"/>`;
      case 'octo':  return `${[-36, -18, 0, 18, 36].map((x, i) => `<path d="M${x} 20 q${i % 2 ? 14 : -14} 40 ${x / 3} 76" stroke="${c}" stroke-width="12" fill="none" stroke-linecap="round"/>`).join('')}<ellipse cx="0" cy="-12" rx="48" ry="44" fill="${c}"/><circle cx="-16" cy="-4" r="8" fill="#fff"/><circle cx="16" cy="-4" r="8" fill="#fff"/><circle cx="-14" cy="-4" r="4" fill="${eye}"/><circle cx="18" cy="-4" r="4" fill="${eye}"/>`;
      case 'angler':return `<path d="M-46 0 L-84 -28 L-84 28Z" fill="${d}"/><circle r="52" fill="${c}"/><path d="M22 10 Q48 20 52 6 L30 2Z" fill="#050A14"/><path d="M26 6 l4 8 l4 -8 l4 8 l4 -8" stroke="#DDE6F5" stroke-width="2" fill="none"/><circle cx="16" cy="-18" r="5" fill="${eye}"/><path d="M4 -50 C20 -110 80 -110 86 -74" stroke="#2C4670" stroke-width="4" fill="none"/>`;
      case 'moon':  return `<path d="M-40 -50 C-60 -30 -60 30 -40 50 L-60 50 C-80 20 -80 -20 -60 -50Z" fill="${d}"/><ellipse rx="58" ry="52" fill="${c}"/><circle cx="30" cy="-8" r="6" fill="${eye}"/>`;
      case 'squid': return `${[-10, -4, 2, 8, 14].map(y => `<path d="M-50 ${y} C-90 ${y + 10} -110 ${y - 10} -140 ${y + 6}" stroke="${c}" stroke-width="7" fill="none" stroke-linecap="round"/>`).join('')}<ellipse cx="10" cy="0" rx="62" ry="24" fill="${c}"/><circle cx="-30" cy="-6" r="5" fill="${eye}"/>`;
      case 'jelly': return `${[-30, -12, 8, 26].map((x, i) => `<path d="M${x} 10 C${x - 10} 50 ${x + 12} 80 ${x + (i % 2 ? 6 : -6)} 120" stroke="#3A5A8C" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/>`).join('')}<path d="M-50 12 C-50 -50 50 -50 50 12 Q25 4 0 12 Q-25 4 -50 12Z" fill="#23406E" opacity=".9"/>`;
    }
    return '';
  }
  /** 판단할 삼각형(빛나는 곳)의 자리 */
  anchor(kind) {
    return ({
      round: [0, -58], long: [6, -36], box: [0, -54], small: [0, -36], tri: [-4, 56],
      eel: [10, -26], octo: [40, 104], angler: [90, -70], moon: [-6, -66], squid: [84, 0], jelly: [30, 140]
    })[kind] || [0, -50];
  }

  place(f) {
    const flip = f.dir < 0 ? -1 : 1;
    f.g.setAttribute('transform', `translate(${f.x.toFixed(1)} ${f.y.toFixed(1)}) scale(${flip * this.FS} ${this.FS})`);
  }
  step(dt) {
    if (!this.fish || !this.map || this.over) return;
    const m = this.MAPS[this.map];
    this.fish.forEach(f => {
      if (f.caught) return;
      f.ph += dt * 2;
      f.x += f.dir * f.v * dt;
      f.y = f.baseY + Math.sin(f.ph) * (f.kind === 'jelly' ? 26 : 10);
      if (f.dir > 0 && f.x > this.W + 140) f.x = -140;
      if (f.dir < 0 && f.x < -140) f.x = this.W + 140;
      this.place(f);
    });
  }

  /* ── 낚시 ─────────────────────────────────── */
  toSvg(e) {
    const pt = this.svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(this.svg.getScreenCTM().inverse());
    return [p.x, p.y];
  }
  aim(e) {
    if (this.busy || !this.map) return;
    const [x] = this.toSvg(e);
    this.setLine(x, this.MAPS[this.map].surface + 40);
  }
  setLine(x, y) {
    $('#fs-string').setAttribute('x1', x); $('#fs-string').setAttribute('x2', x);
    $('#fs-string').setAttribute('y2', y - 14);
    $('#fs-hook').setAttribute('transform', `translate(${x} ${y})`);
  }
  newTarget() {
    this.target = pick(TRI_KEYS);
    // 그 종류가 하나도 없으면 한 마리 들여보낸다
    if (!this.fish.some(f => !f.caught && f.cls === this.target)) this.spawn(this.target);
    $('#fs-target').innerHTML = `<b class="${this.target}">${TRI[this.target].name}</b><span>물고기를 잡아라</span>`;
    const t = $('#fs-target'); t.classList.remove('in'); void t.offsetWidth; t.classList.add('in');
  }
  renderCasts() {
    $('#fs-casts').innerHTML = Array.from({ length: this.p.casts }, (_, i) => `<i class="${i < this.caught ? 'on' : ''}"></i>`).join('')
      + `<b>${this.caught}/${this.p.casts}</b>`;
  }

  catchFish(f) {
    if (this.busy || this.over || this.paused || f.caught || !this.map) return;
    this.busy = true; f.caught = true; f.x0 = f.x;
    SFX.splash();
    this.setLine(f.x, f.y);
    this.after(350, () => {
      SFX.reel();
      const ok = f.cls === this.target;
      f.g.classList.add('hooked', f.cls);
      this.showAngles(f);
      this.log.push({ target: this.target, got: f.cls, angles: f.tri.angles.slice(), ok });
      if (ok) {
        this.caught++; this.renderCasts();
        SFX.good(); Toast.show(`${TRI[f.cls].name} 맞아!`, 'good');
        this.after(800, () => {
          f.g.style.transition = 'transform .6s cubic-bezier(.5,0,.8,.4), opacity .6s';
          f.y = -120; this.place(f); f.g.style.opacity = '0';
          this.setLine(f.x, this.MAPS[this.map].surface + 40);
        });
        this.after(1500, () => {
          f.g.remove(); this.fish = this.fish.filter(x => x !== f);
          $('#fs-fx').innerHTML = '';
          if (this.caught >= this.p.casts) return this.finish(true, f);
          // 한 마리 잡으면 한 마리 들어온다 (수를 유지)
          this.spawn(pick(TRI_KEYS), { lane: f.lane, x: f.x0 - f.dir * (this.W + 280) });
          this.busy = false; this.newTarget();
        });
      } else {
        SFX.bad();
        this.after(1300, () => this.finish(false, f));
      }
    });
  }
  showAngles(f) {
    const fx = $('#fs-fx'); fx.innerHTML = '';
    const [ax, ay] = this.anchor(f.kind);
    const flip = f.dir < 0 ? -1 : 1;
    const cx = f.x + ax * flip * this.FS, cy = f.y + ay * this.FS;
    const box = svgEl('g', { class: 'fs-angbox', transform: `translate(${cx.toFixed(0)} ${(cy - 70).toFixed(0)})` }, fx);
    svgEl('rect', { x: -120, y: -30, width: 240, height: 52, rx: 26 }, box);
    const t = svgEl('text', { x: 0, y: 5 }, box);
    t.textContent = `${TRI[f.cls].name} · ${f.tri.angles.map(a => a + '°').join(' ')}`;
  }

  finish(win, f) {
    this.over = true;
    this.lastResult = { map: this.map, caught: this.caught, win, log: this.log };
    const replay = { label: '다시', key: 'Enter', primary: true, onClick: () => this.start(this.map) };
    const home = { label: '맵 선택', onClick: () => this.toHome() };
    if (win) {
      SFX.win();
      Overlay.show({ kicker: this.MAPS[this.map].name + ' clear', title: '다 잡았다!',
        body: statsHTML([[`${this.caught}/${this.p.casts}`, '잡은 물고기'], [this.MAPS[this.map].lv, '난이도']]),
        actions: [replay, home] });
    } else {
      SFX.lose();
      Overlay.show({ kicker: 'Game over', title: '게임 실패',
        body: `<p class="ov-note"><b>${TRI[this.target].name}</b> 물고기를 잡아야 했는데 <b>${TRI[f.cls].name}</b> 물고기였어.<br>지느러미 각 : ${f.tri.angles.map(a => a + '°').join(', ')}</p>`
          + statsHTML([[`${this.caught}/${this.p.casts}`, '잡은 물고기']]),
        actions: [replay, home] });
    }
  }
  toHome() {
    this.map = null; this.over = false; this.busy = false;
    this.gFish.innerHTML = ''; this.fish = []; $('#fs-fx').innerHTML = '';
    $('#fs-home').hidden = false; $('#fs-hud').hidden = true;
    this.stage.querySelector('.fs').className = 'fs';
    this.drawScene('sea');
  }
}
gameClasses[3] = GameFish;
