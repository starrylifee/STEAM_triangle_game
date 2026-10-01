/* 실제 Chrome 헤드리스 점검 — 클릭·레이아웃·콘솔 오류·인쇄 쪽수
   실행 : python -m http.server 8765 를 띄운 뒤
          NODE_PATH=<puppeteer-core 설치 폴더>/node_modules node scripts/browser_check.js <스크린샷 폴더> */
const puppeteer = require('puppeteer-core');
const OUT = process.argv[2] || '.';
const BASE = process.env.BASE || 'http://localhost:8765/';
const wait = (ms) => new Promise(r => setTimeout(r, ms));
let fails = 0;
const check = (ok, msg) => { console.log((ok ? '  ok  ' : '  FAIL ') + msg); if (!ok) fails++; };

(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
  const p = await b.newPage();
  const errs = [];
  p.on('console', m => { if (m.type() === 'error' && !/ERR_CONNECTION_REFUSED|fonts\./.test(m.text())) errs.push(m.text()); });
  p.on('pageerror', e => errs.push('PAGE ' + e.message));
  // 구글 글꼴은 네트워크에 따라 막힐 수 있다 (없어도 기본 글꼴로 뜬다) → 오류로 세지 않는다
  p.on('requestfailed', r => { if (!/fonts\.(googleapis|gstatic)/.test(r.url())) errs.push('REQ ' + r.url()); });
  p.on('response', r => { if (r.status() >= 400) errs.push(r.status() + ' ' + r.url()); });

  for (const [W, H] of [[1366, 657], [1920, 1080]]) {
    await p.setViewport({ width: W, height: H });
    await p.goto(BASE, { waitUntil: 'networkidle0' });
    await wait(300);
    const s = await p.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    check(s <= 0, `${W}x${H} 홈 세로 스크롤 ${s}`);
    if (W === 1366) await p.screenshot({ path: `${OUT}/c_home.png` });

    // 키보드 1 → 게임 1
    await p.keyboard.press('1'); await wait(500);
    check(await p.evaluate(() => current && current.n === 1), '키 1 → 게임 1');
    // 실제 클릭 : 미션 삼각형 → 버튼
    const ok1 = await p.evaluate(() => {
      const g = current.game, t = g.tris.find(x => g.pendingFor(x));
      const r = t.g.getBoundingClientRect();
      const el = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
      return { x: r.x + r.width / 2, y: r.y + r.height / 2, hit: !!el.closest('.rt-tri') };
    });
    check(ok1.hit, '삼각형이 가려지지 않음');
    await p.mouse.click(ok1.x, ok1.y); await wait(150);
    check(await p.evaluate(() => !!current.game.selected), '삼각형 클릭 → 선택');
    const dirOk = await p.evaluate(() => { const g = current.game, m = g.pendingFor(g.selected); return m.dir > 0 ? 'right' : 'left'; });
    const n = await p.evaluate(() => { const g = current.game; return g.pendingFor(g.selected).n; });
    await p.click(`.rt-btn.${dirOk}:nth-child(${n})`); await wait(700);
    check(await p.evaluate(() => current.game.done === 1), '버튼 클릭 → 목표 1');
    const s1 = await p.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    check(s1 <= 0, `${W}x${H} 게임1 스크롤 ${s1}`);
    if (W === 1366) await p.screenshot({ path: `${OUT}/c_g1_easy.png` });

    // 모달 3종
    for (const id of ['plan', 'letter']) {
      await p.click('#btn-' + id); await wait(400);
      check(await p.evaluate(() => !document.querySelector('#modal').hidden), `모달 ${id} 열림`);
      if (W === 1366) await p.screenshot({ path: `${OUT}/c_modal_${id}.png` });
      await p.keyboard.press('Escape'); await wait(200);
    }
    check(await p.evaluate(() => current && current.n === 1), 'Esc는 모달만 닫음');

    // 게임 2 : 실제 마우스로 세 점 찍기
    await p.keyboard.press('Escape'); await wait(200);
    await p.keyboard.press('2'); await wait(500);
    await p.keyboard.press('Enter'); await wait(300);
    const box = await p.evaluate(() => { const r = document.querySelector('.pz-svg').getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
    const toPx = (vx, vy) => {   // viewBox 1000x600, meet
      const k = Math.min(box.w / 1000, box.h / 600), ox = box.x + (box.w - 1000 * k) / 2, oy = box.y + (box.h - 600 * k) / 2;
      return [ox + vx * k, oy + vy * k];
    };
    const order = await p.evaluate(() => current.game.order);
    const pts = order === 'acute' ? [[500, 130], [380, 400], [630, 390]] : [[330, 300], [670, 300], [520, 230]];
    const [a0, a1] = toPx(...pts[0]);
    await p.mouse.move(a0, a1); await p.mouse.down(); await p.mouse.move(...toPx(...pts[1]), { steps: 6 }); await p.mouse.up();
    await p.mouse.click(...toPx(...pts[2]));
    await wait(400);
    const last = await p.evaluate(() => current.game.pieces.at(-1));
    check(last && last.ok && last.score > 0, `마우스 가위질 (${order}) → ${last && last.score}점`);
    if (W === 1366) await p.screenshot({ path: `${OUT}/c_g2_cut.png` });
    await wait(1400);

    // 게임 3 : 맵 세 개 화면
    await p.keyboard.press('Escape'); await wait(200);
    await p.keyboard.press('3'); await wait(500);
    if (W === 1366) await p.screenshot({ path: `${OUT}/c_g3_home.png` });
    for (const [k, map] of [['2', 'deep'], ['3', 'river']]) {
      await p.evaluate(() => { if (current.game.map) current.game.toHome(); });
      await p.keyboard.press(k); await wait(700);
      if (W === 1366) await p.screenshot({ path: `${OUT}/c_g3_${map}.png` });
    }
    // 실제 클릭으로 물고기 잡기
    const fishPt = await p.evaluate(() => {
      const g = current.game, f = g.fish.find(x => x.cls === g.target && x.x > 200 && x.x < 1400);
      if (!f) return null;
      f.v = 0;   // 클릭 좌표를 잴 동안 세워 둔다
      const r = f.tg.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 };   // 빛나는 지느러미를 누른다
    });
    if (fishPt) {
      await p.mouse.click(fishPt.x, fishPt.y);
      await wait(700);
      check(await p.evaluate(() => current.game.log.length === 1), '물고기 클릭 → 낚시');
    }
    await p.keyboard.press('Escape'); await wait(300);
    check(await p.evaluate(() => !current && !document.querySelector('#view-home').hidden), 'Esc → 홈, 게임 정리');

    // 게임 4 : 실제 마우스로 조각을 칸까지 끌어 놓기
    await p.keyboard.press('4'); await wait(600);
    const d4 = await p.evaluate(() => {
      const g = current.game, s = g.slots[0];
      const q = g.kit.list.find(x => x.cls === g.cur.cls && !x.odd && sameShape(g.kit.world(x, 0, 0, 0), s.pts));
      const a = q.g.getBoundingClientRect();
      const m = g.svg.getScreenCTM(), c = centroid(s.pts);
      return { fx: a.x + a.width / 2, fy: a.y + a.height / 2, tx: m.a * c[0] + m.e, ty: m.d * c[1] + m.f, id: q.id };
    });
    await p.mouse.move(d4.fx, d4.fy); await p.mouse.down(); await p.mouse.move(d4.tx, d4.ty, { steps: 8 }); await p.mouse.up();
    await wait(300);
    const st4 = await p.evaluate((id) => current.game.kit.list[id].state, d4.id);
    check(st4 === 'board' || st4 === 'locked', `게임4 마우스로 끌어 놓기 → ${st4}`);
    const s4 = await p.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    check(s4 <= 0, `${W}x${H} 게임4 스크롤 ${s4}`);
    if (W === 1366) await p.screenshot({ path: `${OUT}/c_g4.png` });

    // 게임 5 : 미션 조각을 틀 가운데로
    await p.keyboard.press('Escape'); await wait(200);
    await p.keyboard.press('5'); await wait(600);
    const d5 = await p.evaluate(() => {
      const g = current.game, q = g.kit.list.find(x => x.cls === g.mission);
      const a = q.g.getBoundingClientRect(), m = g.svg.getScreenCTM(), F = g.F;
      return { fx: a.x + a.width / 2, fy: a.y + a.height / 2, tx: m.a * (F.x + F.w / 2) + m.e, ty: m.d * (F.y + F.h / 2) + m.f, id: q.id };
    });
    await p.mouse.move(d5.fx, d5.fy); await p.mouse.down(); await p.mouse.move(d5.tx, d5.ty, { steps: 8 }); await p.mouse.up();
    await wait(300);
    const r5 = await p.evaluate((id) => ({ st: current.game.kit.list[id].state, pct: current.game.coverage() }), d5.id);
    check(r5.st === 'placed' && r5.pct > 0, `게임5 마우스로 틀에 놓기 → ${r5.st} ${r5.pct}%`);
    const s5 = await p.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    check(s5 <= 0, `${W}x${H} 게임5 스크롤 ${s5}`);
    if (W === 1366) await p.screenshot({ path: `${OUT}/c_g5.png` });
    await p.keyboard.press('Escape'); await wait(300);
  }

  // 최신 ↔ 최초 버전 오가기
  {
    const q = await b.newPage(); await q.setViewport({ width: 1366, height: 657 });
    const e2 = []; q.on('pageerror', e => e2.push(e.message)); q.on('response', r => { if (r.status() >= 400) e2.push(r.status() + ' ' + r.url()); });
    for (const [n, id, has] of [[1, 'rotate', true], [2, 'pizza', true], [3, 'fish', true], [4, 'shape', false], [5, 'chilgak', false]]) {
      await q.goto(BASE + '#' + id, { waitUntil: 'networkidle0' }); await wait(300);
      const vis = await q.evaluate(() => !document.querySelector('#btn-v1').hidden);
      check(vis === has, `게임${n} 최초 버전 버튼 ${vis ? '보임' : '숨김'}`);
      if (!has) continue;
      await Promise.all([q.waitForNavigation({ waitUntil: 'networkidle0' }), q.click('#btn-v1')]);
      await wait(400);
      const r = await q.evaluate(() => ({ url: location.pathname + location.hash, n: current && current.n, tag: !!document.querySelector('.gtitle .v-tag') }));
      check(r.url.includes('/v1/') && r.n === n && r.tag, `게임${n} → 최초 버전 열림 (${r.url})`);
      await q.click('#btn-plan'); await wait(500);
      const img = await q.evaluate(() => { const i = document.querySelector('.plan-pages img'); return i && i.complete && i.naturalWidth > 0; });
      check(img, `게임${n} 최초 버전 기획안 그림`);
      await q.keyboard.press('Escape'); await wait(200);
      if (n === 1) await q.screenshot({ path: `${OUT}/c_v1_g1.png` });
      await Promise.all([q.waitForNavigation({ waitUntil: 'networkidle0' }), q.click('#btn-latest')]);
      const back = await q.evaluate(() => ({ url: location.pathname + location.hash, n: current && current.n }));
      check(!back.url.includes('/v1/') && back.n === n, `게임${n} → 최신 버전으로 돌아옴`);
    }
    check(e2.length === 0, '버전 오가기 오류 ' + e2.length + '건 ' + e2.slice(0, 3).join(' | '));
    await q.close();
  }

  // 인쇄 쪽수
  const fs = require('fs');
  for (const [page, want] of [['worksheet.html', 6]]) {
    const q = await b.newPage();
    await q.goto(BASE + page, { waitUntil: 'networkidle0' });
    const pdf = await q.pdf({ format: 'A4', preferCSSPageSize: true, printBackground: true });
    fs.writeFileSync(`${OUT}/${page}.pdf`, pdf);
    const cnt = Number(require('child_process').execSync(`python -c "import fitz;print(fitz.open(r'${OUT}/${page}.pdf').page_count)"`).toString().trim());
    check(cnt === want, `${page} 인쇄 ${cnt}쪽 (기대 ${want})`);
    await q.screenshot({ path: `${OUT}/c_${page}.png`, fullPage: false });
    await q.close();
  }

  check(errs.length === 0, '콘솔·요청 오류 ' + errs.length + '건 ' + errs.slice(0, 5).join(' | '));
  await b.close();
  console.log(fails ? `\n${fails}개 실패` : '\n모두 통과');
  process.exit(fails ? 1 : 0);
})();
