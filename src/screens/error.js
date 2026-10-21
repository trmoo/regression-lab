/*! 회귀 분석의 핵심개념 탐구 — © 2026 티쳐무 · 모든 권리 보유
 *  5. 오차와 평가 지표 — MAE 와 MSE
 */
import { h, s, 채우기 } from '../lib/ui.js';
import { 좌표평면, 점그리기, 직선그리기 } from '../lib/plot.js';
import { MAE, MSE, 수 } from '../lib/regress.js';
import { 숫자칸, 확인상자, 서술칸 } from '../lib/widgets.js';
import { 표5 } from '../data.js';
import { 카드, 머리, 개념 } from './common.js';

export function 그리기() {
  // ── 표 (학습지 그대로) ──
  const 표영역 = h('div', {},
    h('table', { class: 'grid-table center' },
      h('thead', {}, h('tr', {}, ['x', '실젯값', '예측값', '오차', '|오차|', '오차²'].map((t) => h('th', {}, t)))),
      h('tbody', {},
        표5.x.map((x, i) => h('tr', { class: 표5.y[i] - x === -3 ? 'focus-row' : '' },
          h('td', {}, x), h('td', {}, 표5.y[i]),
          h('td', {}, 숫자칸(`p${i}`)), h('td', {}, 숫자칸(`e${i}`)), h('td', {}, 숫자칸(`a${i}`)), h('td', {}, 숫자칸(`s${i}`)))),
        h('tr', { class: 'sum-row' }, h('th', {}, '합계'), h('td', {}, '-'), h('td', {}, '-'), h('td', {}, '-'), h('td', {}, 숫자칸('sumA')), h('td', {}, 숫자칸('sumS'))),
        h('tr', { class: 'avg-row' }, h('th', {}, '평균'), h('td', {}, '-'), h('td', {}, '-'), h('td', {}, '-'), h('td', {}, 숫자칸('avgA')), h('td', {}, 숫자칸('avgS'))))),
    h('div', { class: 'mae-mse' },
      h('div', {}, '→ 평균절대오차(MAE) = ', 숫자칸('mae')),
      h('div', {}, '   평균제곱오차(MSE) = ', 숫자칸('mse'))));

  // ── 그래프: 직선 y = x 와 네 점 ──
  const 평면 = 좌표평면({ x0: 0, x1: 10, y0: 0, y1: 10, 눈금x: 1, 눈금y: 1, 폭: 460, 높이: 400, x이름: 'x', y이름: 'y' });
  평면.층.선.appendChild(직선그리기(평면, { a: 1, b: 0 }, { class: 'line-ls' }));
  평면.층.위.appendChild(s('text', { x: 평면.sx(8.6), y: 평면.sy(9.4), class: 'line-label' }, 'y = x'));
  표5.x.forEach((x, i) => {
    const y = 표5.y[i];
    평면.층.아래.appendChild(s('line', { x1: 평면.sx(x), x2: 평면.sx(x), y1: 평면.sy(y), y2: 평면.sy(x), class: y >= x ? 'err plus' : 'err minus' }));
    평면.층.점.appendChild(점그리기(평면, x, y, { 이름표: `(${x}, ${y})` }));
  });

  // ── 실험: x = 6 인 점의 실젯값을 바꿔 보기 ──
  const 실험 = { y6: 3 };
  const 막대자리 = h('div', {});
  function 새로() {
    const ys = 표5.y.map((y, i) => (표5.x[i] === 6 ? 실험.y6 : y));
    const 오차 = ys.map((y, i) => y - 표5.x[i]);
    const 큰값 = Math.max(9, ...오차.map((e) => e * e));
    채우기(막대자리,
      h('table', { class: 'grid-table center compact' },
        h('thead', {}, h('tr', {}, h('th', {}, 'x'), h('th', {}, '오차'), h('th', {}, '|오차|'), h('th', {}, '오차²'))),
        h('tbody', {}, 오차.map((e, i) => h('tr', { class: 표5.x[i] === 6 ? 'focus-row' : '' },
          h('td', {}, 표5.x[i]), h('td', {}, 수(e, 1)),
          h('td', {}, h('span', { class: 'mini-bar abs', style: { width: `${(Math.abs(e) / 큰값) * 160}px` } }), ' ', 수(Math.abs(e), 1)),
          h('td', {}, h('span', { class: 'mini-bar sq', style: { width: `${((e * e) / 큰값) * 160}px` } }), ' ', 수(e * e, 1)))))),
      h('div', { class: 'compare-big' },
        h('div', {}, 'MAE = ', h('b', {}, 수(MAE(오차), 2))),
        h('div', {}, 'MSE = ', h('b', {}, 수(MSE(오차), 2)))));
  }
  const 값표시 = h('b', {}, '3');
  const 미끄럼 = h('label', { class: 'slider' }, h('span', {}, 'x = 6 인 점의 실젯값: ', 값표시),
    h('input', { type: 'range', min: 0, max: 10, step: 0.5, value: 3,
      oninput: (e) => { 실험.y6 = Number(e.target.value); 값표시.textContent = e.target.value; 새로(); } }));
  새로();

  return [
    머리('5', '오차와 평가 지표'),
    카드('개념',
      개념(
        h('p', {}, '- ', h('b', {}, '오차 = 실젯값 − 예측값')),
        h('p', {}, '- 오차가 작을수록 좋은 회귀 분석 모델이다.')),
      h('div', { class: 'formula-box' },
        h('div', {}, '평균절대오차(MAE) = ', h('span', { class: 'frac' }, h('span', {}, '|오차₁| + |오차₂| + ⋯ + |오차ₙ|'), h('span', {}, 'n'))),
        h('div', {}, '평균제곱오차(MSE) = ', h('span', { class: 'frac' }, h('span', {}, '오차₁² + 오차₂² + ⋯ + 오차ₙ²'), h('span', {}, 'n'))))),
    카드('▣ 회귀 직선 y = x 로 예측했을 때 표를 완성하고 MAE 와 MSE 를 구해 보자',
      h('div', { class: 'two-col' },
        h('div', { class: 'plot-box' }, 평면.svg),
        h('div', {}, 표영역, 확인상자('s5-table', 표영역, { 해설: (id) => 칸힌트(id) })))),
    카드('▣ 평균제곱오차가 평균절대오차보다 큰 까닭은? (오차가 −3 인 점에 주목)',
      h('div', { class: 'two-col' },
        h('div', {}, h('p', { class: 'muted' }, '노랗게 칠한 x = 6 점의 실젯값을 움직여 보세요. 오차가 커질 때 |오차| 막대와 오차² 막대가 각각 얼마나 커지나요?'), 미끄럼, 막대자리),
        h('div', {}, 서술칸('mse')))),
  ];
}

function 칸힌트(id) {
  if (id.startsWith('p')) return '직선이 y = x 이므로 예측값은 x 와 같아요.';
  if (id.startsWith('e')) return '오차 = 실젯값 − 예측값 (음수가 나올 수도 있어요)';
  if (id.startsWith('a')) return '오차의 부호를 떼어 내세요.';
  if (id.startsWith('s')) return '오차를 제곱하세요. (−3)² = 9';
  if (id === 'sumA') return '|오차| 네 개를 모두 더하세요.';
  if (id === 'sumS') return '오차² 네 개를 모두 더하세요.';
  if (id === 'avgA' || id === 'mae') return '|오차| 의 합계를 4 로 나눠요.';
  return '오차² 의 합계를 4 로 나눠요.';
}
