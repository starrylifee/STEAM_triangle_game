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
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  p.on('pageerror', e => errs.push('PAGE ' + e.message));
  p.on('requestfailed', r => errs.push('REQ ' + r.url()));
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
    for (const id of ['plan', 'review', 'letter']) {
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
    check(last && last.kind === order && last.score > 0, `마우스 가위질 → ${last && last.kind} ${last && last.score}점`);
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
  }

  // 인쇄 쪽수
  const fs = require('fs');
  for (const [page, want] of [['worksheet.html', 4], ['review.html', 6]]) {
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
