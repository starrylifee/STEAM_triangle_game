/* ═══════════════════════════════════════════════════
   data.js — 게임 정보 · 홈 포스터 그림 · 모둠 · 편지
   학생에게 가는 AI 피드백은 편지 한 통뿐이다.
   편지의 hints 는 정답이 아니라 "이런 부분이 아쉬울 수 있다"는 비계만 준다.
   ═══════════════════════════════════════════════════ */

const GAMES = {
  1: {
    id: 'rotate', title: '미션 삼각형 돌리기', who: '아야어여우유어이', team: 'A',
    line: '번호 붙은 삼각형 30개 중에서 미션 속 삼각형을 찾아 돌린다',
    tags: ['acute', 'right', 'obtuse', 'move'],
    pages: ['g1_page_1.jpg', 'g1_page_2.jpg', 'g1_page_3.jpg', 'g1_page_4.jpg']
  },
  2: {
    id: 'pizza', title: '피자 자르기', who: '키위 맛 우유', team: 'B',
    line: '손님이 말한 삼각형 모양으로 둥근 피자를 가위질한다',
    tags: ['acute', 'obtuse'],
    pages: ['g2_page_1.jpg', 'g2_page_2.jpg', 'g2_page_3.jpg', 'g2_page_4.jpg']
  },
  3: {
    id: 'fish', title: '물고기 잡기!', who: '잼민이 아닌데요?', team: 'B',
    line: '빛나는 지느러미의 각을 보고 말한 물고기만 낚는다',
    tags: ['acute', 'right', 'obtuse'],
    pages: ['g3_page_1.jpg', 'g3_page_2.jpg', 'g3_page_3.jpg', 'g3_page_4.jpg']
  }
};

/* 5모둠 중 제출한 2모둠. 나머지는 빈 자리 */
const TEAMS = [
  { id: 'A', names: ['아야어여우유어이'], games: [1] },
  { id: 'B', names: ['키위 맛 우유', '잼민이 아닌데요?'], games: [2, 3] },
  { id: null }, { id: null }, { id: null }
];

/* ── 홈 포스터 그림 ─────────────────────────────── */
const POSTER_ART = {
  1: `<svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice">
    <rect width="400" height="260" fill="#14171D"/>
    <g stroke="rgba(242,237,227,.05)">${Array.from({ length: 16 }, (_, i) => `<line x1="${i * 26}" y1="0" x2="${i * 26}" y2="260"/>`).join('')}${Array.from({ length: 11 }, (_, i) => `<line x1="0" y1="${i * 26}" x2="400" y2="${i * 26}"/>`).join('')}</g>
    <path d="M196 206 L196 70 L306 206 Z" fill="none" stroke="rgba(242,237,227,.35)" stroke-width="2.5" stroke-dasharray="8 7"/>
    <g class="spin"><path d="M196 206 L196 70 L306 206 Z" fill="#3D7CFF"/></g>
    <path d="M52 200 L102 96 L150 200 Z" fill="#FF5A36"/>
    <path d="M232 64 L372 96 L262 124 Z" fill="#FFB81C"/>
    <path d="M330 150 a44 44 0 1 1 -20 60" fill="none" stroke="#F2EDE3" stroke-width="3" stroke-linecap="round"/>
    <path d="M300 204 l10 8 l2 -13" fill="none" stroke="#F2EDE3" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="120" y="176" font-family="JetBrains Mono, monospace" font-weight="800" font-size="22" fill="#14171D" text-anchor="middle">2</text>
    <text x="226" y="178" font-family="JetBrains Mono, monospace" font-weight="800" font-size="22" fill="#F2EDE3" text-anchor="middle">1</text>
  </svg>`,
  2: `<svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice">
    <rect width="400" height="260" fill="#1A1714"/>
    <circle cx="250" cy="150" r="150" fill="#241F1A"/>
    <circle cx="250" cy="150" r="128" fill="#D9934A"/>
    <circle cx="250" cy="150" r="112" fill="#C8432A"/>
    <circle cx="250" cy="150" r="106" fill="#F6BF4E"/>
    <circle cx="214" cy="112" r="15" fill="#2B2A2E"/><circle cx="214" cy="112" r="6" fill="#F6BF4E"/>
    <circle cx="288" cy="112" r="15" fill="#2B2A2E"/><circle cx="288" cy="112" r="6" fill="#F6BF4E"/>
    ${[-54, -30, -6, 18, 42].map((x, i) => `<circle cx="${254 + x}" cy="${178 + Math.sin(i / 4 * Math.PI) * 14}" r="12" fill="#B8331F"/>`).join('')}
    <path d="M150 180 L110 118 L196 136 Z" fill="#14100D"/>
    <g class="float">
      <clipPath id="pc"><path d="M150 180 L110 118 L196 136 Z"/></clipPath>
      <g transform="translate(-58 -22)">
        <g clip-path="url(#pc)"><circle cx="250" cy="150" r="128" fill="#D9934A"/><circle cx="250" cy="150" r="112" fill="#C8432A"/><circle cx="250" cy="150" r="106" fill="#F6BF4E"/><circle cx="160" cy="150" r="12" fill="#B8331F"/></g>
        <path d="M150 180 L110 118 L196 136 Z" fill="none" stroke="#FFF6E6" stroke-width="2.5" stroke-linejoin="round"/>
      </g>
    </g>
    <path d="M196 136 L360 60" stroke="#FFF6E6" stroke-width="2.5" stroke-dasharray="8 7" stroke-linecap="round"/>
    <g transform="translate(360 60) rotate(-24)"><circle cx="16" cy="-8" r="8" fill="none" stroke="#FFF6E6" stroke-width="3.5"/><circle cx="16" cy="8" r="8" fill="none" stroke="#FFF6E6" stroke-width="3.5"/><path d="M9 -6 L-24 4 L-26 1Z M9 6 L-24 -4 L-26 -1Z" fill="#FFF6E6"/></g>
  </svg>`,
  3: `<svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice">
    <defs><linearGradient id="pw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#138EA3"/><stop offset=".6" stop-color="#0A4A66"/><stop offset="1" stop-color="#051E33"/></linearGradient>
    <filter id="pg" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    <rect width="400" height="260" fill="url(#pw)"/>
    <path d="M0 34 ${Array.from({ length: 11 }, (_, i) => `Q${i * 40 + 20} 26 ${i * 40 + 40} 34`).join(' ')} V0 H0Z" fill="#7FCAD6"/>
    <line x1="232" y1="0" x2="232" y2="120" stroke="#F2EDE3" stroke-width="2"/>
    <path d="M232 112 V132 a9 9 0 0 1 -18 0" fill="none" stroke="#F2EDE3" stroke-width="3.5" stroke-linecap="round"/>
    <g class="float">
      <path d="M110 170 L62 140 L70 170 L62 200Z" fill="#0B3A52"/>
      <ellipse cx="170" cy="170" rx="72" ry="50" fill="#FF8A5B"/>
      <circle cx="210" cy="160" r="8" fill="#fff"/><circle cx="212" cy="160" r="4.5" fill="#1D1F24"/>
      <path d="M140 124 L200 124 L166 88 Z" fill="rgba(98,240,211,.25)" stroke="#62F0D3" stroke-width="3" stroke-linejoin="round" filter="url(#pg)"/>
    </g>
    <g opacity=".75"><ellipse cx="330" cy="210" rx="30" ry="18" fill="#FFB347"/><path d="M305 210 L286 198 L286 222Z" fill="#FFB347"/><path d="M318 194 L346 194 L328 176Z" fill="none" stroke="#62F0D3" stroke-width="2.5"/></g>
    <g opacity=".6"><ellipse cx="330" cy="92" rx="22" ry="13" fill="#8FD3C1"/><path d="M312 92 L298 83 L298 101Z" fill="#8FD3C1"/></g>
  </svg>`
};

/* ── 편지 : 게임을 옮긴 AI가 기획 학생에게 ─────────
   mine  : 기획서에 없어서 AI가 정한 것 (결정권은 학생)
   hints : 조금 아쉬울 수 있는 곳 — 어디를 보면 될지와 질문만. 숫자·정답은 주지 않는다
   판마다 한 통씩 쌓인다. 최종판 때 편지를 배열에 더한다. */
const LETTERS = {
  1: [{
    v: '1차', to: '아야어여우유어이에게',
    body: [
      '「미션 삼각형 돌리기」를 화면으로 옮겼어요. 미션 판을 직각·예각·둔각으로 나눠 그려 둔 덕분에 오른쪽 화면을 그대로 만들 수 있었어요.',
      '종류마다 1번, 2번, 3번 번호를 따로 붙인 규칙이 특히 좋았어요. 「예각삼각형 1번」을 찾으려면 먼저 어느 것이 예각삼각형인지 알아야 하니까요.'
    ],
    mine: [
      '1칸을 돌리면 90°가 돌아가요.',
      '쉬움 모드 미션은 4개예요.',
      '미션에 없는 삼각형을 누르면 흔들리고 실수가 1 올라가요.',
      '미션에 적힌 방향과 칸 수만큼 돌리면 맞은 거예요.'
    ],
    hints: [
      '틀린 삼각형을 눌러도 큰일이 일어나지 않아요. 삼각형을 잘 몰라도 이것저것 눌러 보다가 이길 수 있을지 몰라요. 틀렸을 때 무슨 일이 생기면 좋을까요?',
      '「왼쪽으로 4칸」 미션을 해 보세요. 다 돌린 모양이 어딘가 이상하게 느껴질 수 있어요. 왜 그런지 생각해 보세요.'
    ],
    ask: '내가 정한 것도, 아쉬운 곳도 모두 직접 바꿀 수 있어요. 게임을 해 보고 활동지에 적어 주세요.',
    next: '적어 준 대로 고쳐서 최종판을 만들게요.',
    from: '게임을 옮긴 AI'
  }],
  2: [{
    v: '1차', to: '키위 맛 우유에게',
    body: [
      '「피자 자르기」를 화면으로 옮겼어요. 세 게임 중에서 삼각형을 고르지 않고 직접 만드는 게임은 이것 하나예요. 자른 조각의 세 각이 숫자로 나와서 왜 예각인지 바로 볼 수 있어요.',
      '웃는 얼굴 피자, 가위가 지나가는 점선, 잘하면 뜨는 100, 「1분 안에 10명」은 기획서 그대로예요.'
    ],
    mine: [
      '꼭짓점 세 곳을 찍거나 끌어서 잘라요. 마지막 변은 저절로 닫혀요.',
      '주문과 다른 삼각형이면 0점이고, 피자 밖으로 나가거나 너무 작거나 거의 직각이면 점수를 깎아요.',
      '예각 손님과 둔각 손님은 반반 와요.',
      '주문대로 자른 손님만 「자른 손님」으로 세요.'
    ],
    hints: [
      '예각 손님과 둔각 손님 중 한쪽이 유난히 쉬울 수 있어요. 피자에 아무 데나 세 번 찍어 보면서 어떤 조각이 자주 나오는지 살펴보세요.',
      '첫 손님과 열 번째 손님이 똑같아서 뒤로 갈수록 심심할 수 있어요. 무엇이 달라지면 좋을까요?'
    ],
    ask: '내가 정한 것도, 아쉬운 곳도 모두 직접 바꿀 수 있어요. 게임을 해 보고 활동지에 적어 주세요.',
    next: '적어 준 대로 고쳐서 최종판을 만들게요.',
    from: '게임을 옮긴 AI'
  }],
  3: [{
    v: '1차', to: '잼민이 아닌데요?에게',
    body: [
      '「물고기 잡기!」를 화면으로 옮겼어요. 판단할 곳이 다른 색으로 빛난다는 규칙이 가장 좋았어요. 지느러미 삼각형만 보면 되니까 무엇을 봐야 할지 헷갈리지 않아요.',
      '바다·심해 속·강 세 맵, 5번 잡기, 틀린 물고기를 잡으면 실패는 기획서 그대로예요. 야자수 섬, 가라앉은 배, 강가의 집, 아귀와 오징어와 해파리도 옮겼어요.'
    ],
    mine: [
      '강은 10~15마리, 심해 속은 8~12마리예요.',
      '어려운 맵일수록 지느러미가 직각과 비슷해지고 물고기가 빨라져요.',
      '한 마리를 잡으면 새 물고기가 한 마리 들어와요.'
    ],
    hints: [
      '심해 속에서는 지느러미가 직각과 아주 비슷해서 헷갈릴 수 있어요. 그런데 한 번만 틀려도 끝나요. 이 두 가지가 함께 있으면 어떨지 생각해 보세요.',
      '다섯 번째 물고기도 첫 번째와 똑같아요. 잡을수록 무엇이 바뀌면 좋을까요?'
    ],
    ask: '내가 정한 것도, 아쉬운 곳도 모두 직접 바꿀 수 있어요. 세 맵을 다 해 보고 활동지에 적어 주세요.',
    next: '적어 준 대로 고쳐서 최종판을 만들게요.',
    from: '게임을 옮긴 AI'
  }]
};
