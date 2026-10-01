/* ═══════════════════════════════════════════════════
   mobile.js — 세로로 든 휴대폰에서 게임 화면이면 멈추고, 가로로 돌리면 이어서 한다
   (안내 화면은 css/mobile.css 의 .rotate-hint)
   ═══════════════════════════════════════════════════ */
(function () {
  const portrait = matchMedia('(max-width: 760px) and (orientation: portrait)');
  let held = false;
  function sync() {
    const inGame = current && !$('#view-game').hidden;
    if (portrait.matches && inGame) {
      if (!current.game.paused) pauseGame();
      held = true;
    } else if (held) {
      held = false;
      if ($('#modal').hidden && current) resumeGame();
    }
  }
  portrait.addEventListener('change', sync);
  window.addEventListener('hashchange', () => setTimeout(sync, 0));
  setInterval(sync, 400);   // 게임에 들어가고 나갈 때, 편지 창을 닫았을 때
})();
