/*! 회귀 분석 실험실 — © 2026 티쳐무 · 모든 권리 보유
 *  4. 상관관계 분석
 */
import { h, s, 채우기 } from '../lib/ui.js';
import { 상태, 저장 } from '../lib/store.js';
import { 좌표평면, 점그리기, 직선그리기 } from '../lib/plot.js';
import { 상관계수, 최소제곱, 강도, 수 } from '../lib/regress.js';
import { 빈칸칸, 고르기, 확인상자 } from '../lib/widgets.js';
import { r문제 } from '../data.js';
import { 카드, 머리, 개념 } from './common.js';

// 실험용 점 20개. 흩어짐을 똑같이 재현하려고 정해진 「흔들림」 값을 쓴다.
const 흔들림 = [0.8, -1.3, 0.4, 1.6, -0.6, -1.9, 1.1, 0.2, -0.9, 1.4, -0.3, 0.9, -1.5, 0.6, 1.8, -1.1, 0.1, -0.7, 1.2, -0.2];
const 실험x = 흔들림.map((_, i) => 0.5 + i * 0.47);

export function 실험점(기울기, 흩어짐) {
  return 실험x.map((x, i) => ({ x, y: 5 + 기울기 * (x - 5) + 흔들림[i] * 흩어짐 }));
}

export function 그리기() {
  const 실험 = { 기울기: 상태.pick.slope ?? 0.8, 흩어짐: 상태.pick.spread ?? 1 };
  const 평면 = 좌표평면({ x0: 0, x1: 10, y0: -10, y1: 20, 눈금x: 1, 눈금y: 5, 폭: 520, 높이: 400, x이름: 'x', y이름: 'y', 잔모눈: false });
  const 층 = s('g', {});
  평면.층.점.appendChild(층);
  const 판정 = h('div', { class: 'rbox' });
  const 도전 = h('div', { class: 'challenges' });

  function 새로() {
    const 점들 = 실험점(실험.기울기, 실험.흩어짐);
    const xs = 점들.map((p) => p.x), ys = 점들.map((p) => p.y);
    const r = 상관계수(xs, ys);
    채우기(층);
    if (Math.abs(실험.기울기) > 0.001 || 실험.흩어짐 > 0) 층.appendChild(직선그리기(평면, 최소제곱(xs, ys), { class: 'line-ls thin' }));
    점들.forEach((p) => 층.appendChild(점그리기(평면, p.x, p.y, { r: 6 })));
    const 방향 = r > 0.005 ? '양의 상관관계' : r < -0.005 ? '음의 상관관계' : '상관관계 거의 없음';
    채우기(판정, h('div', { class: 'r-big' }, `r = ${수(r, 2)}`),
      h('div', {}, `방향: ${방향}`), h('div', {}, `강도: ${강도(r)}`),
      강도띠(r));
    // 도전 과제: 기울기와 강도가 서로 다른 것임을 직접 확인
    const 도전1 = Math.abs(실험.기울기) <= 0.3 && Math.abs(r) >= 0.9;
    const 도전2 = Math.abs(실험.기울기) >= 1.2 && Math.abs(r) < 0.7;
    if (도전1 && !상태.pick.ch1) { 상태.pick.ch1 = true; 저장(); }
    if (도전2 && !상태.pick.ch2) { 상태.pick.ch2 = true; 저장(); }
    채우기(도전,
      h('div', { class: `ch${상태.pick.ch1 ? ' done' : ''}` }, 상태.pick.ch1 ? '✅' : '🎯', ' 도전 1: 기울기는 ', h('b', {}, '완만한데(|기울기| ≤ 0.3)'), ' 상관관계는 ', h('b', {}, '강하게(|r| ≥ 0.9)'), ' 만들어 보자.'),
      h('div', { class: `ch${상태.pick.ch2 ? ' done' : ''}` }, 상태.pick.ch2 ? '✅' : '🎯', ' 도전 2: 기울기는 ', h('b', {}, '가파른데(|기울기| ≥ 1.2)'), ' 상관관계는 ', h('b', {}, '강하지 않게(|r| < 0.7)'), ' 만들어 보자.'),
      상태.pick.ch1 && 상태.pick.ch2 ? h('p', { class: 'good' }, '🎉 두 도전을 모두 해냈어요. 상관관계의 강도는 기울기가 아니라 점들이 직선 주위에 얼마나 모여 있는지로 정해진다는 것을 확인했어요!') : null);
  }

  const 미끄럼 = (키, 최소, 최대, 간격, 이름) => {
    const 값표시 = h('b', {}, String(실험[키]));
    return h('label', { class: 'slider' }, h('span', {}, 이름, ' ', 값표시),
      h('input', { type: 'range', min: 최소, max: 최대, step: 간격, value: 실험[키],
        oninput: (e) => { 실험[키] = Number(e.target.value); 값표시.textContent = e.target.value; 상태.pick[키 === '기울기' ? 'slope' : 'spread'] = 실험[키]; 저장(); 새로(); } }));
  };

  const 빈칸영역 = 개념(
    h('p', {}, '- x가 증가할 때 y도 증가하면 ', 빈칸칸('r-pos', 4), ' 상관관계, y가 감소하면 ', 빈칸칸('r-neg', 4), ' 상관관계'),
    h('p', {}, '- 상관관계 계수(피어슨)는 ', 빈칸칸('r-min', 4), '부터 ', 빈칸칸('r-max', 4), ' 사이의 값이며, ± 0.3 미만이면 약한 상관관계이다.'),
    h('p', {}, '- 상관관계 계수의 크기(강도)는 ', h('b', {}, '기울기가 아니라 점들이 직선 주위에 얼마나 모여 있는지'), '로 판단한다.'));

  const 표영역 = h('table', { class: 'grid-table center' },
    h('thead', {}, h('tr', {}, h('th', {}, '상관관계 계수 r'), r문제.map((q) => h('th', {}, 수(q.r, 2))))),
    h('tbody', {},
      h('tr', {}, h('th', {}, '방향'), r문제.map((q) => h('td', {}, 고르기(`${q.id}d`, ['양', '음'], { 작게: true })))),
      h('tr', {}, h('th', {}, '강도'), r문제.map((q) => h('td', {}, 고르기(`${q.id}s`, ['강함', '보통', '약함'], { 작게: true }))))));

  새로();
  return [
    머리('4', '상관관계 분석'),
    카드('개념 채우기', 빈칸영역, 확인상자('s4-blanks', 빈칸영역)),
    카드('🧪 실험실 — 기울기와 강도는 다르다',
      h('p', { class: 'muted' }, '두 미끄럼 막대를 움직여 점들의 모양을 바꾸고, 상관관계 계수 r 이 어떻게 바뀌는지 보자.'),
      h('div', { class: 'two-col' },
        h('div', { class: 'plot-box' }, 평면.svg),
        h('div', {},
          미끄럼('기울기', -1.5, 1.5, 0.1, '기울기'),
          미끄럼('흩어짐', 0, 4, 0.1, '흩어짐'),
          판정, 도전))),
    카드('▣ 상관관계 계수를 보고 방향과 강도를 적어 보자',
      강도띠(),
      표영역,
      확인상자('s4-r', 표영역, { 해설: (id) => id.endsWith('d') ? 'r 의 부호(+/−)가 방향을 알려 줘요.' : '부호를 떼고 크기(|r|)만 보세요.' })),
  ];
}

/**
 * |r| 해석 기준을 수직선 위 띠로 보여 준다.
 * −1 … −0.7 … −0.3 … 0 … 0.3 … 0.7 … 1 — 가운데로 갈수록 약하다.
 * r 을 주면 그 자리에 바늘을 꽂는다(실험실용).
 */
export function 강도띠(r = null) {
  const 칸 = [
    ['강함', 0.3, 's'], ['보통', 0.4, 'm'], ['약함', 0.6, 'w'], ['보통', 0.4, 'm'], ['강함', 0.3, 's'],
  ];
  const 눈금 = [-1, -0.7, -0.3, 0, 0.3, 0.7, 1];
  return h('div', { class: 'rscale' },
    r == null ? h('div', { class: 'rscale-title' }, '📏 상관관계 계수의 강도는 ', h('b', {}, '부호를 뗀 크기 |r|'), ' 로 판단해요') : null,
    h('div', { class: 'rscale-bar' },
      칸.map(([이름, 폭, 종류]) => h('span', { class: `rs ${종류}`, style: { flex: String(폭) } }, 이름)),
      r == null ? null : h('span', { class: 'rs-needle', style: { left: `${((r + 1) / 2) * 100}%` } })),
    h('div', { class: 'rscale-ticks' }, 눈금.map((v) => h('span', { style: { left: `${((v + 1) / 2) * 100}%` } }, v < 0 ? `−${Math.abs(v)}` : String(v)))),
    r == null ? h('div', { class: 'rscale-legend' },
      h('span', { class: 'chip s' }, '|r| ≥ 0.7  강함'),
      h('span', { class: 'chip m' }, '0.3 ≤ |r| < 0.7  보통'),
      h('span', { class: 'chip w' }, '|r| < 0.3  약함')) : null,
    r == null ? h('div', { class: 'rscale-side' }, h('span', {}, '◀ 음의 상관관계 (r < 0)'), h('span', {}, '양의 상관관계 (r > 0) ▶')) : null);
}
