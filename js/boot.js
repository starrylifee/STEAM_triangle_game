/* ═══════════════════════════════════════════════════
   boot.js — 홈 그리기 · 버튼 · 모달 · 키보드
   ═══════════════════════════════════════════════════ */

const TAG_NAME = { acute: '예각', right: '직각', obtuse: '둔각', move: '돌리기' };

function renderHome() {
  $('#posters').innerHTML = Object.entries(GAMES).map(([n, g]) => `
    <button class="poster" type="button" data-n="${n}">
      <span class="poster-num">${pad2(n)}</span>
      <span class="poster-key"><kbd>${n}</kbd></span>
      <span class="poster-art">${POSTER_ART[n]}</span>
      <span class="poster-info">
        <h2>${g.title}</h2>
        <p class="poster-line">${g.line}</p>
        <span class="poster-meta">
          <span class="poster-who">기획 <b>${g.who}</b></span>
          <span class="tri-tags">${g.tags.map(t => `<span class="tri-tag ${t}"><i></i>${TAG_NAME[t]}</span>`).join('')}</span>
        </span>
      </span>
    </button>`).join('');
  $$('.poster').forEach(p => p.onclick = () => { SFX.select(); enterGame(Number(p.dataset.n)); });

  const sent = TEAMS.filter(t => t.id).length;
  $('#teams').innerHTML = `<span class="teams-label">모둠 <b>${sent}/${TEAMS.length}</b></span>` + TEAMS.map((t, i) => t.id
    ? `<span class="team"><b>${t.id}</b><span>${t.names.join(' · ')}</span></span>`
    : `<span class="team wait"><b>${String.fromCharCode(65 + i)}</b><span>기획서 기다리는 중</span></span>`).join('');
}

/* ── 소리 버튼 ───────────────────────────────── */
const ICON_SOUND = '<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19 6a8.5 8.5 0 0 1 0 12"/></svg>';
const ICON_MUTE = '<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9l5 6M22 9l-5 6"/></svg>';
function syncSound() {
  ['#btn-sound', '#btn-sound2'].forEach(s => {
    $(s).innerHTML = SFX.on ? ICON_SOUND : ICON_MUTE;
    $(s).setAttribute('aria-pressed', String(SFX.on));
  });
}
['#btn-sound', '#btn-sound2'].forEach(s => $(s).onclick = () => { SFX.on = !SFX.on; syncSound(); SFX.select(); });

/* ── 모달 ────────────────────────────────────── */
const Modal = {
  open(title, tabs, render, actions = '') {
    pauseGame();
    $('#modal-title').textContent = title;
    $('#modal-actions').innerHTML = actions;
    const tb = $('#modal-tabs'); tb.innerHTML = '';
    const show = (i) => {
      $$('.modal-tab', tb).forEach((b, k) => b.classList.toggle('on', k === i));
      $('#modal-body').innerHTML = render(i);
      $('#modal-body').scrollTop = 0;
    };
    if (tabs && tabs.length > 1) tabs.forEach((t, i) => {
      const b = el('button', 'modal-tab', t); b.type = 'button'; b.onclick = () => show(i); tb.appendChild(b);
    });
    show(0);
    $('#modal').hidden = false;
  },
  close() { $('#modal').hidden = true; resumeGame(); },
  get open_() { return !$('#modal').hidden; }
};
$('#modal-x').onclick = () => Modal.close();
$('#modal').onclick = (e) => { if (e.target.id === 'modal') Modal.close(); };

function openPlan() {
  const n = current.n, g = GAMES[n];
  const cap = ['1. 규칙 설명', '2. 배운 내용', '3. 디자인', '4. 디자인 2'];
  Modal.open(`기획안 · ${g.title}`, null, () => `
    <div class="plan-pages">${g.pages.map((p, i) => `
      <figure><img src="source_images/${p}" alt="${g.title} 기획서 ${i + 1}쪽" loading="lazy"><figcaption>${cap[i]}</figcaption></figure>`).join('')}
    </div>`);
}
function openReview() {
  const n = current.n;
  Modal.open(`AI 평가 · ${GAMES[n].title}`, null, () => reviewHTML(n),
    `<a class="tbtn" href="review.html#g${n}" target="_blank" rel="noopener">인쇄본</a>`);
}
function openLetter() {
  const n = current.n, list = LETTERS[n] || [];
  Modal.open('편지', list.map(l => l.v), (i) => {
    const l = list[i];
    return `<article class="letter">
      <p class="to">${l.to}</p>
      ${l.body.map(p => `<p>${p}</p>`).join('')}
      <div class="mine"><p><b>기획서에 없어서 내가 정한 것</b></p><ul>${l.mine.map(x => `<li>${x}</li>`).join('')}</ul></div>
      <p>${l.ask}</p>
      <p>${l.next}</p>
      <p class="from">${l.from}</p>
    </article>`;
  });
}
$('#btn-plan').onclick = openPlan;
$('#btn-review').onclick = openReview;
$('#btn-letter').onclick = openLetter;
$('#btn-back').onclick = () => { SFX.select(); backHome(); };

/* ── 키보드 ──────────────────────────────────── */
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (!$('#modal').hidden) { Modal.close(); return; }
    if (Overlay.open) return;
    if (!$('#view-game').hidden) backHome();
    return;
  }
  if (!$('#view-home').hidden && $('#modal').hidden) {
    const n = Number(e.key);
    if (GAMES[n]) { e.preventDefault(); SFX.select(); enterGame(n); }
  }
});
window.addEventListener('pointerdown', function once() { SFX._ac(); window.removeEventListener('pointerdown', once); });

/* ── 시작 ────────────────────────────────────── */
renderHome();
syncSound();
const fromHash = Object.entries(GAMES).find(([, g]) => '#' + g.id === location.hash);
if (fromHash) enterGame(Number(fromHash[0])); else showView('home');
