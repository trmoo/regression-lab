/*! 회귀 분석 실험실 — © 2026 티쳐무 · 모든 권리 보유
 *  7. 두 가지 회귀 분석 — 통계적 회귀 vs 기계학습 기반 회귀
 */
import { h, s, 채우기 } from '../lib/ui.js';
import { 상태, 저장 } from '../lib/store.js';
import { 직선그리기, 점그리기 } from '../lib/plot.js';
import { 최소제곱, 결정계수, 수, 식 } from '../lib/regress.js';
import { 빈칸칸, 확인상자, 서술칸 } from '../lib/widgets.js';
import { 표1, 평가데이터x } from '../data.js';
import { 카드, 머리, 표1평면 } from './common.js';
import { 나눠평가 } from '../grade.js';
import { 정답상자 } from './intro.js';

export function 그리기() {
  // 왼쪽: 통계적 회귀 — 가진 데이터를 모두 쓴다
  const 전체선 = 최소제곱(표1.x, 표1.y);
  const 왼 = 표1평면({ 이름표: false, 폭: 460, 높이: 380 });
  왼.층.선.appendChild(직선그리기(왼, 전체선, { class: 'line-ls' }));
  왼.층.위.appendChild(s('text', { x: 왼.sx(0.4), y: 왼.sy(18.4), class: 'r2-label' }, `R² = ${수(결정계수(표1.x, 표1.y, 전체선), 2)}`));

  // 오른쪽: 기계학습 — 점을 눌러 학습/평가를 나눈다
  const 오른 = 표1평면({ 이름표: false, 폭: 460, 높이: 380 });
  오른.층.점.replaceChildren();
  const 그림층 = s('g', {});
  오른.층.점.appendChild(그림층);
  const 결과 = h('div', {});

  function 새로() {
    채우기(오른.층.선); 채우기(오른.층.아래); 채우기(그림층);
    const r = 나눠평가(상태.split);
    if (r) {
      오른.층.선.appendChild(직선그리기(오른, r.선, { class: 'line-ls' }));
      r.평가.forEach((p) => 오른.층.아래.appendChild(s('line', { x1: 오른.sx(p.x), x2: 오른.sx(p.x), y1: 오른.sy(p.y), y2: 오른.sy(r.선.a * p.x + r.선.b), class: 'err test' })));
    }
    표1.x.forEach((x, i) => {
      const 평가 = 상태.split.includes(x);
      const g = 점그리기(오른, x, 표1.y[i], { class: 평가 ? 'dot test' : 'dot train', r: 9 });
      g.classList.add('clickable');
      g.addEventListener('click', () => {
        상태.split = 평가 ? 상태.split.filter((v) => v !== x) : [...상태.split, x].sort((a, b) => a - b);
        저장(); 새로();
      });
      그림층.appendChild(g);
    });
    const 같음 = 상태.split.join() === 평가데이터x.join();
    채우기(결과,
      r ? [h('div', { class: 'mse-big' }, `평가 MSE = ${수(r.mse, 2)}`),
        h('div', { class: 'small' }, `학습 데이터 ${r.학습.length}개로 만든 직선: ${식(r.선, 3)}`),
        h('div', { class: 'small' }, `평가 데이터 ${r.평가.length}개(x = ${r.평가.map((p) => p.x).join(', ')})로 성능을 확인했어요.`)]
        : h('div', { class: 'warn' }, '학습 데이터는 2개 이상, 평가 데이터는 1개 이상 있어야 해요.'),
      같음 ? h('p', { class: 'muted small' }, '지금은 학습지 그림과 똑같이 나눈 상태예요.')
        : h('p', { class: 'small' }, '나누는 방법을 바꾸니 평가 MSE 도 달라졌어요. 어떤 데이터로 평가하느냐에 따라 성적이 달라진다는 뜻이에요. ',
          h('button', { type: 'button', class: 'btn small', onclick: () => { 상태.split = [...평가데이터x]; 저장(); 새로(); } }, '학습지처럼 되돌리기')));
  }
  새로();

  const 표영역 = h('table', { class: 'grid-table' },
    h('thead', {}, h('tr', {}, h('th', {}, '구분'), h('th', {}, '통계적 회귀 분석'), h('th', {}, '기계학습 기반 회귀 분석'))),
    h('tbody', {},
      h('tr', {}, h('th', {}, '목표'), h('td', {}, '변수 사이의 관계를 ', 빈칸칸('t-goal1', 5)), h('td', {}, '새 데이터의 값을 잘 ', 빈칸칸('t-goal2', 5))),
      h('tr', {}, h('th', {}, '데이터 사용'), h('td', {}, '가진 데이터를 ', 빈칸칸('t-use1', 4), ' 사용'),
        h('td', {}, 빈칸칸('t-use2', 4), ' 데이터로 모델을 만들고 ', 빈칸칸('t-use3', 4), ' 데이터로 성능 확인')),
      h('tr', {}, h('th', {}, '대표 평가 지표'), h('td', {}, 빈칸칸('t-met1', 7)), h('td', {}, 빈칸칸('t-met2', 7)))));

  return [
    머리('7', '두 가지 회귀 분석'),
    카드('통계적 회귀 vs 기계학습 기반 회귀',
      h('div', { class: 'two-col' },
        h('div', {}, h('h3', {}, '통계적 회귀 분석'), h('div', { class: 'plot-box' }, 왼.svg),
          h('p', { class: 'small' }, '점 9개를 모두 써서 직선을 구하고, 그 직선이 데이터를 얼마나 설명하는지(R²) 본다.')),
        h('div', {}, h('h3', {}, '기계학습 기반 회귀 분석'), h('div', { class: 'plot-box' }, 오른.svg),
          h('p', { class: 'legend' }, h('span', { class: 'dot-train' }, '●'), ' 학습 데이터  ', h('span', { class: 'dot-test' }, '○'), ' 평가 데이터  — ', h('b', {}, '점을 눌러 바꿔 보세요')),
          결과))),
    카드('▣ 표를 채워 보자', 표영역, 확인상자('s7-table', 표영역)),
    카드('▣ [심화]', 서술칸('split')),
    카드('🎯 처음 문제로 돌아가서 — 광고비가 1,000만 원이면?', 정답상자()),
  ];
}
