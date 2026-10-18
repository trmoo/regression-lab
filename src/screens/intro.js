/*! 회귀 분석 실험실 — © 2026 티쳐무 · 모든 권리 보유
 *  0. 문제 상황 — 광고비가 1,000만 원이면 매출액은?
 */
import { h } from '../lib/ui.js';
import { 상태, 저장, 불러온곳 } from '../lib/store.js';
import { 최소제곱, 수 } from '../lib/regress.js';
import { 표1, 화면목록 } from '../data.js';
import { 내직선 } from '../grade.js';
import { 카드, 표1표, 표1평면, 머리 } from './common.js';

export function 그리기(이동) {
  const 평면 = 표1평면();
  // x = 10 자리에 물음표
  const 물음 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  물음.setAttribute('x', 평면.sx(10) - 6); 물음.setAttribute('y', 평면.sy(10)); 물음.setAttribute('class', 'big-q');
  물음.setAttribute('text-anchor', 'end');
  물음.textContent = '?';
  평면.층.위.appendChild(물음);

  // 학번·이름 — 저장 파일 이름과 활동지 머리에 들어간다(이 PC 에는 남지 않는다)
  const 정보칸 = (키, 글, 예) => h('label', { class: 'id-field' }, 글,
    h('input', { class: 'id-input', value: 상태.student[키], placeholder: 예, autocomplete: 'off',
      oninput: (e) => { 상태.student[키] = e.target.value.trim(); 저장(); } }));

  return [
    머리('0', '문제 상황', 'p.110~113'),
    // 원래 앱으로 열었다면 — 지난 시간에 저장한 파일이 있을 수 있다(여기서 새로 하고 같은 이름으로 저장하면 그 파일을 덮어쓴다)
    불러온곳 === 'file' ? null : h('div', { class: 'card banner' },
      '📂 ', h('b', {}, '지난 시간에 이어서 하는 중이라면'), ' 이 화면이 아니라 ',
      h('b', {}, '바탕 화면에 저장해 둔 「회귀분석_학번_이름.html」 파일'), '을 여세요. 처음이라면 그대로 시작하면 됩니다.'),
    카드('✍️ 먼저 학번과 이름을 적어 주세요',
      h('div', { class: 'id-row' }, 정보칸('id', '학번 ', '예: 10612'), 정보칸('name', '이름 ', '예: 홍길동')),
      h('p', { class: 'muted small' }, '틈틈이 위쪽의 ', h('b', {}, '[💾 저장하기]'), ' 를 누르세요. 지금까지 한 활동이 이 앱 파일째 ',
        h('b', {}, '바탕 화면'), '에 저장되고, 다음 시간에 그 파일을 열면 이어서 할 수 있어요. ',
        '학번·이름은 그 파일에만 들어가고 이 PC 에는 남지 않아요.')),
    카드(null,
      h('p', { class: 'lead' }, '어느 회사가 광고비를 많이 쓸수록 매출액이 늘어나는지 알아보려고 ',
        h('b', {}, '9개월 동안'), '의 광고비와 매출액을 기록했다. 이 자료로 광고비와 매출액의 관계를 나타내는 ',
        h('b', {}, '직선'), '을 찾고, ', h('b', { class: 'hl' }, '광고비가 1,000만 원일 때의 매출액'), '을 예측해 보자.'),
      표1표(),
      h('div', { class: 'two-col' },
        h('div', {}, 평면.svg),
        h('div', {},
          h('div', { class: 'tip' }, '💡 단위에 주의! 광고비의 단위는 「백만 원」이므로 ',
            h('b', {}, '1,000만 원 = 10 (백만 원)'), ' 이다. 그래서 x = 10 일 때의 y 를 구하면 된다.'),
          h('div', { class: 'guess' },
            h('label', { for: 'guess' }, '🤔 공부하기 전에 눈대중으로 먼저 예측해 보자. x = 10 이면 y 는?'),
            h('div', { class: 'row' },
              h('input', { id: 'guess', class: 'num wide', inputmode: 'decimal', value: 상태.guess, placeholder: '예: 15',
                oninput: (e) => { 상태.guess = e.target.value; 저장(); } }),
              h('span', {}, '(천만 원)'))),
          정답상자()))),
    카드('오늘 배울 것',
      h('ol', { class: 'map' }, 화면목록.slice(1, 8).map((m) =>
        h('li', {}, h('a', { href: `#${m.id}`, onclick: (e) => { e.preventDefault(); 이동(m.id); } }, `${m.번호}. ${m.이름}`)))),
      h('p', { class: 'muted' }, '활동을 마치면 「📄 내 활동지」에서 내가 한 활동을 HTML 파일로 내려받을 수 있습니다.')),
  ];
}

/** 최소제곱 직선을 본 뒤에야 열리는 답 */
export function 정답상자() {
  if (!상태.lsShown) {
    return h('div', { class: 'locked' }, '🔒 답은 「3. 선형 회귀」에서 최소제곱 직선을 구하면 열립니다.');
  }
  const 선 = 최소제곱(표1.x, 표1.y);
  const y10 = 선.a * 10 + 선.b;
  const 내 = 내직선(상태);
  const 억 = Math.floor(y10 / 10), 천만 = y10 - 억 * 10;
  return h('div', { class: 'answer-box' },
    h('div', {}, '📈 최소제곱 직선  y = 1.633x − 1.167 로 예측하면'),
    h('div', { class: 'big' }, `x = 10 → y ≈ ${수(y10, 1)} (천만 원)`),
    h('div', { class: 'muted' }, `= 약 ${억}억 ${수(천만 * 1000, 0)}만 원`),
    내 ? h('div', {}, `✏️ 내가 그은 직선으로는 ${수(내.a * 10 + 내.b, 1)} (천만 원)`) : null,
    상태.guess ? h('div', {}, `🤔 처음 눈대중: ${상태.guess} (천만 원)`) : null);
}
