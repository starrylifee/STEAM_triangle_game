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
    pages: ['g1_page_1.jpg', 'g1_page_2.jpg', 'g1_page_3.jpg', 'g1_page_4.jpg'],
    v1: true,
    papers: ['g1_paper_1.jpg', 'g1_paper_2.jpg', 'g1_paper_3.jpg', 'g1_paper_4.jpg']
  },
  2: {
    id: 'pizza', title: '피자 자르기', who: '키위 맛 우유', team: 'B',
    line: '손님이 말한 삼각형 모양으로 둥근 피자를 가위질한다',
    tags: ['acute', 'obtuse'],
    pages: ['g2_page_1.jpg', 'g2_page_2.jpg', 'g2_page_3.jpg', 'g2_page_4.jpg'],
    v1: true,
    papers: ['g2_paper_1.jpg', 'g2_paper_2.jpg', 'g2_paper_3.jpg', 'g2_paper_4.jpg']
  },
  3: {
    id: 'fish', title: '물고기 잡기!', who: '잼민이 아닌데요?', team: 'C',
    line: '빛나는 지느러미의 각을 보고 말한 물고기만 낚는다',
    tags: ['acute', 'right', 'obtuse'],
    pages: ['g3_page_1.jpg', 'g3_page_2.jpg', 'g3_page_3.jpg', 'g3_page_4.jpg'],
    v1: true,
    papers: ['g3_paper_1.jpg', 'g3_paper_2.jpg', 'g3_paper_3.jpg', 'g3_paper_4.jpg']
  },
  4: {
    id: 'shape', title: '퍼즐을 맞춰라!', who: '안경 ⌐o-o', team: 'D',
    line: '문장이 말한 삼각형으로만 집·나비·지붕 같은 모양을 완성한다',
    tags: ['acute', 'right', 'obtuse', 'move'],
    pages: ['g4_page_1.jpg', 'g4_page_2.jpg', 'g4_page_3.jpg', 'g4_page_4.jpg'],
    papers: ['g4_paper_1.jpg', 'g4_paper_2.jpg', 'g4_paper_3.jpg']
  },
  5: {
    id: 'chilgak', title: '칠각 게임', who: '사람들', team: 'E',
    line: '네모 틀을 한 가지 삼각형으로만 칠교처럼 채운다',
    tags: ['acute', 'right', 'obtuse'],
    pages: ['g5_page_1.jpg', 'g5_page_2.jpg', 'g5_page_3.jpg', 'g5_page_4.jpg', 'g5_page_5.jpg'],
    caps: ['1. 규칙 설명', '1. 규칙 설명 (뒷장)', '2. 배운 내용', '3. 디자인', '4. 디자인 2'],
    papers: ['g5_paper_1.jpg', 'g5_paper_2.jpg', 'g5_paper_3.jpg', 'g5_paper_4.jpg']
  }
};

/* 5모둠 — 모둠마다 게임 하나. 안 낸 모둠이 있으면 { id: null } 로 빈 자리 */
const TEAMS = [
  { id: 'A', names: ['아야어여우유어이'], games: [1] },
  { id: 'B', names: ['키위 맛 우유'], games: [2] },
  { id: 'C', names: ['잼민이 아닌데요?'], games: [3] },
  { id: 'D', names: ['안경 ⌐o-o'], games: [4] },
  { id: 'E', names: ['사람들'], games: [5] }
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
  </svg>`,
  4: `<svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice">
    <rect width="400" height="260" fill="#10131A"/>
    <g fill="none" stroke="rgba(242,237,227,.5)" stroke-width="2.5" stroke-dasharray="8 6" stroke-linejoin="round">
      <path d="M70 110 L130 110 L130 50 Z"/><path d="M110 110 L170 110 L170 210 Z"/><path d="M70 110 L70 210 L170 210 Z"/>
    </g>
    <path d="M130 110 L190 110 L130 50 Z" fill="#3D7CFF"/>
    <path d="M70 110 L110 110 L70 160 Z" fill="none"/>
    <g class="spin"><path d="M262 92 L338 92 L262 168 Z" fill="#3D7CFF" stroke="#62F0D3" stroke-width="3" stroke-linejoin="round"/></g>
    <path d="M350 70 a26 26 0 1 1 -14 -20" fill="none" stroke="#62F0D3" stroke-width="3" stroke-linecap="round"/>
    <path d="M333 40 l4 11 l-12 2" fill="none" stroke="#62F0D3" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M230 200 L270 200 L250 166 Z" fill="#FF5A36" opacity=".9"/><path d="M300 222 L370 222 L335 204 Z" fill="#FFB81C" opacity=".9"/>
    <text x="96" y="104" font-size="11" font-weight="700" fill="rgba(242,237,227,.7)" text-anchor="middle" font-family="Pretendard Variable, sans-serif">직각</text>
  </svg>`,
  5: `<svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice">
    <rect width="400" height="260" fill="#12151B"/>
    <rect x="96" y="40" width="210" height="140" fill="#0E1117" stroke="#E9DCC2" stroke-width="6"/>
    <g stroke="#0C0E12" stroke-width="2" stroke-linejoin="round">
      <path d="M96 40 L236 40 L96 110 Z" fill="#FFB81C"/><path d="M236 40 L236 110 L96 110 Z" fill="#FFB81C" opacity=".85"/>
      <path d="M236 40 L306 40 L236 110 Z" fill="#FFB81C" opacity=".7"/><path d="M96 110 L166 110 L96 180 Z" fill="#FFB81C" opacity=".8"/>
    </g>
    <g fill="#FF5A36"><path d="M26 28 c-6-6-14 0-8 7 l8 8 l8-8 c6-7-2-13-8-7z"/><path d="M50 28 c-6-6-14 0-8 7 l8 8 l8-8 c6-7-2-13-8-7z"/><path d="M74 28 c-6-6-14 0-8 7 l8 8 l8-8 c6-7-2-13-8-7z" opacity=".25"/></g>
    <text x="354" y="70" font-size="34" font-weight="800" fill="#62F0D3" text-anchor="middle" font-family="JetBrains Mono, monospace">60%</text>
    <path d="M60 222 L120 222 L90 196 Z" fill="none" stroke="rgba(242,237,227,.7)" stroke-width="2.5"/>
    <path d="M150 230 L230 230 L150 196 Z" fill="none" stroke="rgba(242,237,227,.7)" stroke-width="2.5"/>
    <path d="M260 226 L360 226 L310 204 Z" fill="none" stroke="rgba(242,237,227,.7)" stroke-width="2.5"/>
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
  }, {
    v: '2차', to: '아야어여우유어이에게',
    body: ['친구들이 디버깅 페이퍼를 네 장 써 줬어요. 네가 적은 「5번 틀리면 처음으로 초기화」는 그대로 넣었어요.'],
    changes: [
      '틀리면 「틀렸습니다」가 뜨고, 5번 틀리면 「틀려서 처음으로 초기화됩니다」가 떠요. (네 페이퍼)',
      '쉬움은 그대로 두고 삼각형 15개짜리 보통 모드를 새로 만들었어요. 1차의 30개짜리는 어려움 모드가 됐어요. (친구 페이퍼)',
      '오른쪽·왼쪽 5칸 버튼을 더했어요. (친구 페이퍼)'
    ],
    mine: [
      '새 보통 모드의 삼각형 15개, 목표 5개는 내가 정했어요.',
      '「목숨 5개, 틀리면 2개씩 깎기」를 적은 친구도 있었는데, 기획한 네 의견을 따랐어요.'
    ],
    hints: ['5칸을 돌린 모양과 1칸을 돌린 모양을 나란히 놓고 비교해 보세요. 5칸 버튼이 꼭 필요한지 생각해 볼 만해요.'],
    ask: '해 보고 더 고칠 곳이 있으면 활동지에 적어 주세요.',
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
  }, {
    v: '2차', to: '키위 맛 우유에게',
    body: ['친구들이 디버깅 페이퍼를 네 장 써 줬어요. 시간이 모자라다는 말이 가장 많았어요.'],
    changes: [
      '시작할 때 쉬움 2분 · 보통 1분 30초 · 어려움 1분 중에서 고를 수 있어요. (친구 페이퍼 두 장)',
      '4번째 손님부터 직각 피자 손님이 와요. 어려움은 처음부터 와요. (친구 페이퍼)',
      '7번째 손님부터 「둔각 하나, 예각 두 개 주세요」처럼 한 피자에서 여러 조각을 잘라 달라는 주문이 와요. 조각이 너무 작거나 앞 조각과 겹치면 다시 잘라야 해요. (친구 페이퍼 · 선생님 제안)',
      '피자가 웃는 얼굴 · 야채 · 하와이안 세 가지로 바뀌어요. (친구 페이퍼)',
      '끝나면 「다시」 옆에 「나가기」가 있어요. (친구 페이퍼)'
    ],
    mine: [
      '조각은 피자 넓이의 5%보다 커야 하고, 직각 주문은 85°~95°까지 맞은 것으로 쳐요.',
      '각도기를 달자는 의견은 넣지 않았어요. 각도를 재 주면 눈으로 예각·둔각을 가려 볼 기회가 없어지기 때문이에요.'
    ],
    hints: ['여러 조각 주문에서 첫 조각을 너무 크게 자르면 나머지 조각 자리가 모자랄 수 있어요. 어디부터 자르면 좋을지 생각해 보세요.'],
    ask: '해 보고 더 고칠 곳이 있으면 활동지에 적어 주세요.',
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
  }, {
    v: '2차', to: '잼민이 아닌데요?에게',
    body: ['친구들이 디버깅 페이퍼를 네 장 써 줬어요. 심해가 느리다는 말과 목숨이 하나라 어렵다는 말이 많았어요.'],
    changes: [
      '목숨이 생겼어요. 바다 4개, 강 3개, 심해 2개예요. 틀리면 하트가 하나 줄고 게임은 계속돼요. (친구 페이퍼)',
      '심해 물고기가 더 빨라졌어요. (친구 페이퍼 세 장)'
    ],
    mine: [
      '심해 속도는 1차의 1.5배로 정했어요.',
      '잡을수록 코인을 모아 낚싯대를 업그레이드하자는 의견은 이번에 넣지 않았어요. 게임을 하나 더 만드는 만큼 큰 일이라, 원하면 다음 기획서에 따로 그려 주세요.'
    ],
    hints: ['목숨이 늘어서 바다는 많이 쉬워졌을 수 있어요. 바다와 심해를 둘 다 해 보고 어려움 차이가 알맞은지 살펴보세요.'],
    ask: '해 보고 더 고칠 곳이 있으면 활동지에 적어 주세요.',
    next: '적어 준 대로 고쳐서 최종판을 만들게요.',
    from: '게임을 옮긴 AI'
  }],
  4: [{
    v: '1차', to: '안경 ⌐o-o에게',
    body: [
      '「퍼즐을 맞춰라!」를 화면으로 옮겼어요. 디자인 2에 모양 칸의 꼭짓점마다 「직각·예각·예각」을 적어 둔 덕분에 칸이 어떤 삼각형 자리인지 바로 그릴 수 있었어요.',
      '「직각삼각형을 사용해서 집을 만들어 보세요.」 문장, 오른쪽 「삼각형들」 칸, 남은 문제·제한시간·남은 시간, 삼각형을 돌리는 화살표는 기획서 그대로예요.'
    ],
    mine: [
      '문제 5개의 모양은 집·배(직각), 산·물고기(예각), 우산(둔각)으로 정했어요.',
      '제한시간 30초는 한 문제마다로 했어요. 시간이 다 되면 그 문제는 실패하고 다음 문제로 넘어가요.',
      '다른 종류 삼각형을 칸에 넣으면 쟁반으로 돌아가요. 벌점은 없어요.',
      '삼각형은 한 번에 90°씩 돌아가요. 톡 누르거나 R 키, 초록 화살표로 돌려요.'
    ],
    hints: [
      '칸 꼭짓점에 예각·직각이 적혀 있어서, 쟁반의 삼각형을 직접 살펴보지 않아도 무엇을 골라야 할지 알 수 있어요. 삼각형을 구별하는 연습이 줄어들 수 있어요. 글씨를 그대로 둘까요?',
      '30초 안에 삼각형 서너 개를 끌어오고 여러 번 돌려야 해요. 해 보면서 시간이 넉넉한지 빠듯한지 느껴 보세요.'
    ],
    ask: '내가 정한 것도, 아쉬운 곳도 모두 직접 바꿀 수 있어요. 게임을 해 보고 활동지에 적어 주세요.',
    next: '적어 준 대로 고쳐서 최종판을 만들게요.',
    from: '게임을 옮긴 AI'
  }, {
    v: '2차', to: '안경 ⌐o-o에게',
    body: ['마지막 페이퍼 세 장에 모두 시간이 모자라다고 적혀 있었어요. 문제가 쉽다는 말, 모양이 더 다양했으면 좋겠다는 말도 있었어요.'],
    changes: [
      '제한시간이 30초에서 45초로 늘었어요. 35초와 50초 사이에서 선생님과 정했어요.',
      '모양이 11개가 됐어요. 한 판에 다섯 개가 나오고, 직각·예각·둔각이 한 번씩은 꼭 나와요.',
      '직각삼각형으로 만드는 물고기를 넣었어요. (페이퍼 그림)',
      '모양 하나에 삼각형이 3~6개 들어가고, 쟁반에는 9~11개가 놓여요.',
      '맞는 종류를 칸에 올리면 돌리기 전에도 연하게 색이 들어가요.'
    ],
    mine: [
      '새 모양과 모양 안의 삼각형 배치는 내가 정했어요. 조각은 뒤집을 수 없어서, 돌리기만 해도 맞는 모양으로 골랐어요.',
      '섞어 놓는 다른 삼각형은 3개에서 4개로 늘렸어요.'
    ],
    hints: ['칸 꼭짓점의 「예각·직각」 글씨는 그대로 있어요. 글씨를 손으로 가리고 해 보면 얼마나 어려워지는지 비교해 보세요.'],
    ask: '이번이 최종판이에요. 친구들과 해 보고 어땠는지 이야기해 주세요.',
    next: '',
    from: '게임을 옮긴 AI'
  }],
  5: [{
    v: '1차', to: '사람들에게',
    body: [
      '「칠각 게임」을 화면으로 옮겼어요. 규칙을 뒷장까지 꼼꼼히 써 준 덕분에 포인트, 상점 값, 라운드 시간을 숫자 그대로 넣을 수 있었어요. 미션마다 통과 기준(직각 60%, 둔각 50%, 예각 70%)을 다르게 정한 것이 특히 좋았어요.',
      '하트 세 개 목숨, 얼굴 세 개 난이도, 자물쇠 힌트 상점, 「○○삼각형으로만 채우세요.」 상자, 「삐빅, 잘못된 삼각형입니다」, Win!과 Lose...는 기획서 그대로예요.'
    ],
    mine: [
      '2포인트는 한 라운드를 통과할 때 받아요.',
      '라운드를 통과하지 못하면 목숨이 하나 줄어요.',
      '난이도는 섞여 있는 다른 삼각형 수로 나눴어요. 쉬움 2개, 보통 4개, 어려움 6개예요.',
      '라운드마다 미션(직각·둔각·예각)은 무작위로 나와요.',
      '삼각형 1개 힌트는 맞는 삼각형 하나를 3초 동안 빛나게 해 줘요.',
      '10라운드가 끝날 때까지 50포인트를 못 모으면 「종료」가 떠요.'
    ],
    hints: [
      '10라운드를 모두 통과하면 포인트가 몇 점이 될지 계산해 보세요. 이기려면 50포인트가 필요해요.',
      '잘못된 삼각형을 몇 번 고르면 게임이 끝나는지 세어 보세요. 생각보다 빨리 끝날 수 있어요.'
    ],
    ask: '내가 정한 것도, 아쉬운 곳도 모두 직접 바꿀 수 있어요. 게임을 해 보고 활동지에 적어 주세요.',
    next: '적어 준 대로 고쳐서 최종판을 만들게요.',
    from: '게임을 옮긴 AI'
  }, {
    v: '2차', to: '사람들에게',
    body: ['마지막 페이퍼를 네 장 받았어요. 마이너스를 없애 달라는 말이 세 장에 있었고, 네모 틀을 꽉 채우고 싶다는 말이 있었어요. 칠교처럼 채우는 게임에 더 가까워지도록 고쳤어요.'],
    changes: [
      '라운드마다 네모 틀을 미션 삼각형으로 빈틈없이 잘라 두었어요. 조각을 다 맞추면 틀이 100% 차요. 한 판 안의 조각 크기는 모두 달라요.',
      '쟁반에서 조각을 꺼내면 그 자리에 같은 조각이 또 생겨요. 틀 밖에 놓으면 사라져요.',
      '잘못된 삼각형을 골라도 포인트가 줄지 않고 「삐빅」 소리만 나요. 지는 건 목숨이 다 떨어질 때뿐이에요.',
      '시간은 모든 라운드 2분이에요.',
      '틀 안쪽은 하얗고, 삼각형은 여러 색이에요. 색은 종류와 상관없이 칠해서 색으로 종류를 알 수는 없어요.'
    ],
    mine: [
      '틀을 꽉 채우면 2포인트에 5포인트를 더 받아요. 1차 판에서는 10라운드를 다 통과해도 20포인트라 50포인트에 닿을 수 없었어요.',
      '힌트를 사면 맞는 삼각형과 함께 빈 자리 하나가 점선으로 3초 동안 보여요.'
    ],
    hints: ['50포인트를 모으려면 10라운드 중 몇 라운드를 꽉 채워야 하는지 계산해 보세요. 힌트를 사면 그 수가 어떻게 달라질까요?'],
    ask: '이번이 최종판이에요. 친구들과 해 보고 어땠는지 이야기해 주세요.',
    next: '',
    from: '게임을 옮긴 AI'
  }]
};
