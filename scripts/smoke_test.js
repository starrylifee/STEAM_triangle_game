/* jsdom 자동 플레이 — 세 게임을 클리어·실패까지 돌리고 평가서용 수치를 뽑는다.
   실행 : NODE_PATH=<jsdom 설치 폴더>/node_modules node scripts/smoke_test.js */
const fs = require('fs'), path = require('path');
const { JSDOM } = require('jsdom');
const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').replace(/<script[\s\S]*?<\/script>/g, '');
const files = ['core', 'data', 'games/rotate', 'games/pizza', 'games/fish', 'pieces', 'games/shape', 'games/tangram', 'boot'];
const code = files.map(f => fs.readFileSync(path.join(ROOT, 'js', f + '.js'), 'utf8')).join('\n;\n')
  + '\nwindow.__api = { enterGame, backHome, cur: () => current, Overlay, GAMES, TRI_KEYS, makeTriangle, anglesOf, classify, areaOf, sameSpot, sameShape, centroid, rotPts };';

const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'http://localhost/' });
const w = dom.window;
w.eval(code);
const A = w.__api;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
let fails = 0;
const check = (ok, msg) => { console.log((ok ? '  ok  ' : '  FAIL ') + msg); if (!ok) fails++; };
const ovTitle = () => w.document.querySelector('#overlay').hidden ? null : w.document.querySelector('#ov-title').textContent;
const clickOv = (i = 0) => { const b = w.document.querySelectorAll('#ov-actions button')[i]; if (b) b.click(); else { console.log('  FAIL 결과창 버튼 없음'); fails++; } };

(async () => {
  /* ── 1. 미션 삼각형 돌리기 ───────────────────── */
  console.log('\n[1] 미션 삼각형 돌리기');
  A.enterGame(1);
  let g = A.cur().game;
  check(g.mode === 'easy' && g.tris.length === 6, `쉬움 모드 삼각형 ${g.tris.length}개`);
  // 틀린 삼각형 한 번
  const wrong = g.tris.find(t => !g.pendingFor(t));
  if (wrong) { g.select(wrong); check(g.miss === 1, '틀린 삼각형 → 실수 1'); }
  let presses = 0;
  while (!g.missions.every(m => m.done)) {
    const t = g.tris.find(x => g.pendingFor(x));
    g.select(t); const m = g.pendingFor(t);
    g.turn(m.dir * m.n - t.net); presses++;
  }
  await sleep(1000);
  check(ovTitle() === '쉬움 모드 클리어', `쉬움 클리어 (${g.missions.length}미션, 버튼 ${presses}번)`);
  clickOv(0);
  check(g.mode === 'normal' && g.tris.length === 15, `보통 모드로 넘어감, 삼각형 ${g.tris.length}개`);
  while (!g.missions.every(m => m.done)) { const t = g.tris.find(x => g.pendingFor(x)); g.select(t); const m = g.pendingFor(t); g.turn(m.dir * m.n - t.net); }
  await sleep(1000);
  check(ovTitle() === '보통 모드 클리어', `보통 클리어 → ${ovTitle()}`);
  clickOv(0);
  check(g.mode === 'hard' && g.tris.length === 30, `어려움 모드로 넘어감, 삼각형 ${g.tris.length}개`);
  const nums = {}; g.tris.forEach(t => { nums[t.cls] = (nums[t.cls] || 0) + 1; });
  console.log('     종류별 수', JSON.stringify(nums));
  // 되돌려 맞추기 : 오른쪽 3칸 넘친 뒤 왼쪽으로 고치기
  const t0 = g.tris.find(x => g.pendingFor(x)); g.select(t0);
  const m0 = g.pendingFor(t0); g.turn(m0.dir * m0.n + 1); check(!m0.done, '한 칸 넘치면 아직 미완료'); g.turn(-1); check(m0.done, '되돌리면 완료');
  while (!g.missions.every(m => m.done)) {
    const t = g.tris.find(x => g.pendingFor(x)); g.select(t); const m = g.pendingFor(t); g.turn(m.dir * m.n - t.net);
  }
  await sleep(1000);
  check(ovTitle() === '클리어!', `어려움 클리어 — 목표 ${g.done}/${g.missions.length}`);
  clickOv(0);
  // 5번 틀리면 처음으로
  for (let i = 0; i < g.p.missLimit; i++) { const w = g.tris.find(t => !g.pendingFor(t) && !t.locked); g.select(w); }
  await sleep(700);
  check(ovTitle() === '틀려서 처음으로 초기화됩니다', `실수 ${g.p.missLimit}번 → ${ovTitle()}`);
  clickOv(0);
  check(g.miss === 0 && !g.over, '처음부터 다시 시작');

  // 수치 : 아무거나 누르는 전략 (종류를 모르고 번호만 맞춰 찍기 / 완전 무작위)
  let missRand = 0, missNum = 0, fourCnt = 0, total = 0; const RUNS = 300;
  for (let r = 0; r < RUNS; r++) {
    g.start('hard');
    g.missions.forEach(m => { total++; if (m.n === 4) fourCnt++; });
    // 완전 무작위
    const left = g.missions.map(m => m);
    for (const m of left) {
      const pool = g.tris.slice().sort(() => Math.random() - .5);
      for (const t of pool) { if (t.cls === m.cls && t.num === m.num) break; missRand++; }
      // 번호만 보고 찍기 (같은 번호 삼각형 중 무작위)
      const same = g.tris.filter(t => t.num === m.num).sort(() => Math.random() - .5);
      for (const t of same) { if (t.cls === m.cls) break; missNum++; }
    }
  }
  const R1 = {
    randMissPerTarget: +(missRand / total).toFixed(1),
    numMissPerTarget: +(missNum / total).toFixed(2),
    fourRate: Math.round(fourCnt / total * 100)
  };
  console.log('     목표 하나 찾는 데 완전 무작위 실수', R1.randMissPerTarget, '/ 번호만 보고 찍기 실수', R1.numMissPerTarget, '/ 4칸 미션 비율', R1.fourRate + '%');
  g.clearTimers(); Overlay_hide();

  /* ── 2. 피자 자르기 ─────────────────────────── */
  console.log('\n[2] 피자 자르기');
  A.enterGame(2);
  g = A.cur().game;
  check(ovTitle() === '피자 자르기', '시작 화면 (난이도 고르기)');
  clickOv(1);
  check(g.running && g.left === 90, `보통 → ${g.left}초`);
  const cutAs = (cls, R = 150) => {
    // 최소 넓이(피자의 5%)를 넘는 조각이 나올 때까지 다시 만든다 (R 이 작으면 일부러 작은 조각)
    let t;
    for (let k = 0; k < 200; k++) { t = A.makeTriangle(cls, R, { acuteMax: 75, obtuseMin: 110, obtuseMax: 125 }); if (R < 60 || A.areaOf(t.pts) > Math.PI * g.R * g.R * 0.06) break; }
    t.pts.forEach(p => g.addVertex([g.cx + p[0], g.cy + p[1]]));
  };
  for (let i = 0; i < 4; i++) {
    const before = g.served;
    cutAs(g.order);
    check(g.served === before + 1 && g.pieces.at(-1).score === 100, `주문(${g.order}) 대로 → ${g.pieces.at(-1).score}점`);
    await sleep(1600);
  }
  const ord = g.order; cutAs(ord === 'acute' ? 'obtuse' : 'acute');
  check(g.pieces.at(-1).score === 0, '다른 종류 → 0점'); await sleep(1600);
  { const before = g.pieces.length; cutAs(g.order, 40); check(g.pieces.length === before && g.verts.length === 0 && !g.busy, '최소 넓이보다 작은 조각 → 다시 자르기'); }
  // 피자 밖 꼭짓점
  const t2 = A.makeTriangle(g.order, 300, { acuteMax: 75, obtuseMin: 110 });
  t2.pts.forEach(p => g.addVertex([g.cx + p[0], g.cy + p[1]]));
  console.log('     큰 조각(피자 밖으로 나감) →', g.pieces.at(-1).score, '점');
  await sleep(1600);
  // 여러 조각 주문 : 한 피자에서 겹치지 않게 차례로 자른다
  g.custN = g.p.multiFrom + 2; g.newCustomer();
  check(g.need.length === 3, `여러 조각 주문 : ${g.need.join(', ')}`);
  {
    // 피자 안 가로 세 줄(위·가운데·아래)에 한 조각씩. 모양은 직접 정한다 (모두 최소 넓이 이상)
    const SH = { acute: [[-80, 69], [80, 69], [0, -69]], obtuse: [[-130, 40], [130, 40], [0, -40]], right: [[-90, 60], [90, 60], [-90, -60]] };
    const rows = [-140, 0, 140];
    for (let k = 0; k < 3 && g.need.length; k++) {
      SH[g.need[0]].forEach(([x, y]) => g.addVertex([g.cx + x, g.cy + rows[k] + y]));
      await sleep(1600);
    }
    check(g.pieces.at(-1).ok && g.pieces.at(-1).n === 3, `세 조각 모두 맞게 → 손님 1명 (점수 ${g.pieces.at(-1).score}, ${JSON.stringify(g.pieces.at(-1))})`);
  }
  // 시간 끝
  g.left = 0.05; await sleep(300);
  check(/이겼다|종료/.test(ovTitle() || ''), `시간 끝 → ${ovTitle()} (자른 손님 ${g.served})`);
  clickOv(0);

  // 수치 : 피자 안에 아무렇게나 세 점 찍으면?
  let ac = 0, ob = 0, nr = 0; const N = 20000;
  for (let i = 0; i < N; i++) {
    const pts = [0, 1, 2].map(() => { const r = g.R * Math.sqrt(Math.random()), a = Math.random() * 6.283; return [r * Math.cos(a), r * Math.sin(a)]; });
    const k = A.classify(A.anglesOf(pts), 2);
    if (k === 'acute') ac++; else if (k === 'obtuse') ob++; else nr++;
  }
  const R2 = { randAcute: Math.round(ac / N * 100), randObtuse: Math.round(ob / N * 100), randRight: Math.round(nr / N * 100) };
  console.log('     아무렇게나 세 점 → 예각', R2.randAcute + '%, 둔각', R2.randObtuse + '%, 직각', R2.randRight + '%');
  g.clearTimers(); g.running = false; Overlay_hide();

  /* ── 3. 물고기 잡기 ─────────────────────────── */
  console.log('\n[3] 물고기 잡기');
  A.enterGame(3);
  g = A.cur().game;
  check(!w.document.querySelector('#fs-home').hidden, '맵 선택 화면');
  const R3 = {};
  for (const map of ['sea', 'deep', 'river']) {
    g.start(map);
    const n = g.fish.length;
    check(n >= g.p[map + 'Min'] && n <= g.p[map + 'Max'] + 1, `${map} 물고기 ${n}마리`);
    for (let i = 0; i < g.p.casts; i++) {
      const f = g.fish.find(x => !x.caught && x.cls === g.target);
      g.catchFish(f); await sleep(2000);
    }
    check(ovTitle() === '다 잡았다!', `${map} 5마리 → ${ovTitle()}`);
    clickOv(0);
    // 틀린 물고기
    const lives = g.p[map + 'Lives'];
    for (let i = 0; i < lives; i++) { const f = g.fish.find(x => !x.caught && x.cls !== g.target); g.catchFish(f); await sleep(2400); }
    check(ovTitle() === '게임 실패', `${map} 목숨 ${lives}개 다 쓰면 → ${ovTitle()}`);
    clickOv(1);
    // 각 범위
    let acMax = 0, obMin = 180;
    for (let i = 0; i < 400; i++) {
      g.map = map;
      const a = A.makeTriangle('acute', 30, { acuteMax: 90 - g.gap(), obtuseMin: 90 + g.gap() }).angles;
      const o = A.makeTriangle('obtuse', 30, { acuteMax: 90 - g.gap(), obtuseMin: 90 + g.gap(), obtuseMax: Math.max(90 + g.gap() + 8, 140) }).angles;
      acMax = Math.max(acMax, ...a); obMin = Math.min(obMin, Math.max(...o));
    }
    R3[map] = { acMax, obMin };
  }
  // 아무거나 잡으면 5번 연속 성공할 확률 (종류가 셋이면 1/3씩)
  let win = 0; const T = 20000;
  for (let i = 0; i < T; i++) { let ok = true; for (let k = 0; k < 5; k++) if (Math.random() >= 1 / 3) { ok = false; break; } if (ok) win++; }
  R3.randWin = +(win / T * 100).toFixed(1);
  console.log('     각 범위', JSON.stringify(R3));

  /* ── 4. 퍼즐을 맞춰라! ─────────────────────── */
  console.log('\n[4] 퍼즐을 맞춰라!');
  A.enterGame(4);
  g = A.cur().game;
  const R4 = { turnsPerProblem: [], piecesPerProblem: [] };
  // 모양 검사 : 칸이 모두 그 종류이고, 크기가 같은 칸끼리는 90°씩 돌려서 겹친다 (뒤집기 없음)
  for (const S of g.SHAPES) {
    const bad = S.tris.filter(t => A.classify(A.anglesOf(t)) !== S.cls).length;
    let mirror = 0;
    S.tris.forEach(a => S.tris.forEach(b => {
      if (a === b || !A.sameShape(a, b)) return;
      const ca = A.centroid(a), cb = A.centroid(b), ra = a.map(([x, y]) => [x - ca[0], y - ca[1]]);
      const ok = [0, 90, 180, 270].some(r => A.sameSpot(A.rotPts(ra, r).map(([x, y]) => [x + cb[0], y + cb[1]]), b));
      if (!ok) mirror++;
    }));
    check(!bad && !mirror, `${S.cls} ${S.name} 칸 ${S.tris.length}개 — 종류 어긋남 ${bad}, 돌려도 안 맞는 짝 ${mirror}`);
  }
  // 다른 종류 조각 → 튕김, 벌점 없음
  {
    const s = g.slots[0], c = A.centroid(s.pts);
    const d = g.kit.list.find(q => q.cls !== g.cur.cls);
    const ok = g.kit.dropAt(d, c[0], c[1]);
    check(!ok && d.state === 'tray', '다른 종류 삼각형 → 쟁반으로 돌아감 (벌점 없음)');
  }
  for (let k = 0; k < g.p.problems; k++) {
    let turns = 0;
    for (const s of g.slots) {
      const c = A.centroid(s.pts);
      const q = g.kit.list.find(p => p.state === 'tray' && p.cls === g.cur.cls && !p.odd && A.sameShape(g.kit.world(p, 0, 0, 0), s.pts));
      let r = q.rot, n = 0;
      while (!A.sameSpot(g.kit.world(q, c[0], c[1], r), s.pts) && n < 4) { r = (r + 90) % 360; n++; }
      turns += n;
      g.kit.dropAt(q, c[0], c[1], r);
    }
    R4.turnsPerProblem.push(turns); R4.piecesPerProblem.push(g.slots.length);
    check(g.slots.every(s => s.filled), `${g.cur.name.replace(/[을를]$/, '')} 완성 (조각 ${g.slots.length}개, 돌리기 ${turns}번)`);
    await sleep(1300);
  }
  check(ovTitle() === '모두 완성!', `5문제 → ${ovTitle()}`);
  clickOv(0);
  g.left = 0.05; await sleep(300);
  check(g.results.length === 1 && !g.results[0].ok, '시간 끝 → 그 문제 실패, 다음 문제');
  await sleep(1500);
  g.clearTimers(); Overlay_hide();

  /* ── 5. 칠각 게임 ─────────────────────────── */
  console.log('\n[5] 칠각 게임');
  A.enterGame(5);
  g = A.cur().game;
  const fillIdeal = (cls) => {
    // 미리 자른 자리마다 맞는 조각을 돌려서 놓는다
    g.mission = cls; g.buildPieces();
    let placed = 0;
    g.spots.forEach((sp, i) => {
      const q = g.kit.list.find(p => p.state === 'tray' && p.cls === cls && p.spot === i), c = A.centroid(sp);
      for (let r = 0; r < 4; r++) if (A.sameSpot(g.kit.world(q, c[0], c[1], r * 90), sp, 3)) { if (g.kit.dropAt(q, c[0], c[1], r * 90)) placed++; break; }
    });
    return { placed, pct: g.coverage(), pieces: g.spots.length };
  };
  const R5 = {};
  for (const cls of ['right', 'obtuse', 'acute']) {
    R5[cls] = fillIdeal(cls);
    const need = g.passNeed();
    check(R5[cls].pct >= g.FULL && R5[cls].placed === R5[cls].pieces, `${cls} 자른 대로 놓으면 ${R5[cls].pct}% (조각 ${R5[cls].placed}/${R5[cls].pieces}, 통과 ${need}%)`);
  }
  // 조각이 계속 나온다 : 꺼낸 자리에 새 조각, 틀 밖에 버리면 사라짐
  {
    g.mission = 'right'; g.buildPieces();
    const n0 = g.kit.list.length, q = g.kit.list.find(p => p.cls === 'right'), F = g.F;
    g.kit.dropAt(q, F.x + 120, F.y + 120);
    const n1 = g.kit.list.length;
    g.kit.dropAt(q, F.x - 300, F.y + F.h + 200);
    check(n1 === n0 + 1 && g.kit.list.length === n0 && g.kit.list.some(p => p.spot === q.spot && p.state === 'tray'), `꺼내 놓으면 쟁반에 같은 조각이 또 (${n0}→${n1}), 틀 밖에 버리면 사라짐 (${g.kit.list.length})`);
  }
  // 통과 → +2P
  g.newGame(); g.mission = 'right'; fillIdeal('right');
  const before = g.points; g.endRound(false);
  check(g.points === before + g.p.passPoint + g.p.fullBonus, `틀을 다 채워 통과 → +${g.p.passPoint}P +${g.p.fullBonus}P (${g.points}P)`);
  await sleep(1500);
  check(g.round === 2, '다음 라운드로');
  // 실패 → 목숨 -1
  g.endRound(false); check(g.lives === 2, '0%로 끝내면 목숨 -1');
  await sleep(1500);
  // 잘못된 삼각형을 여러 번 골라도 포인트가 줄지 않고 게임이 이어진다
  {
    const F = g.F, p0 = g.points;
    for (let i = 0; i < 5; i++) {
      const w = g.kit.list.find(q => q.cls !== g.mission && q.state === 'tray');
      if (w) g.kit.dropAt(w, F.x + F.w / 2, F.y + F.h / 2);
    }
    await sleep(1000);
    check(g.points === p0 && !g.over, `잘못된 삼각형 5번 → ${g.points}P, 게임 계속`);
  }
  // 목숨이 다 떨어지면 Lose
  g.endRound(false); await sleep(1400); g.endRound(false); await sleep(1000);
  check(ovTitle() === 'Lose...', `목숨 0 → ${ovTitle()}`);
  clickOv(0);
  // 10라운드를 다 통과하면?
  g.newGame();
  for (let r = 0; r < g.p.rounds; r++) { g.busy = false; g.mission = 'right'; fillIdeal('right'); g.endRound(false); await sleep(1350); }
  R5.allPassPoints = g.lastResult ? g.lastResult.points : g.points;
  check(ovTitle() === 'Win!', `라운드마다 꽉 채워 통과 → ${R5.allPassPoints}P, ${ovTitle()} (${g.lastResult.round}라운드, 이기려면 ${g.p.winPoint}P)`);
  clickOv(0);
  // 상점
  g.points = 20; g.renderTop(); const lt = g.left; g.buy('time');
  check(g.points === 12 && Math.abs(g.left - lt - 15) < 0.5, '상점 15초 늘리기 → -8P');
  g.clearTimers(); Overlay_hide();

  A.backHome();
  check(!A.cur(), '홈으로 돌아가면 게임 정리됨');
  fs.writeFileSync(path.join(__dirname, 'measure.json'), JSON.stringify({ R1, R2, R3, R4, R5 }, null, 2));
  console.log(fails ? `\n${fails}개 실패` : '\n모두 통과');
  process.exit(fails ? 1 : 0);
})();
function Overlay_hide() { w.document.querySelector('#overlay').hidden = true; A.Overlay.hide(); }
