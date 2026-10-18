/*! 회귀 분석의 핵심개념 탐구 — © 2026 티쳐무 · 모든 권리 보유
 *  1. 독립 변수와 종속 변수
 */
import { h, 채우기 } from '../lib/ui.js';
import { 상태 } from '../lib/store.js';
import { 빈칸칸, 고르기, 확인상자 } from '../lib/widgets.js';
import { 변수짝 } from '../data.js';
import { 카드, 머리, 개념 } from './common.js';

export function 그리기() {
  const 빈칸영역 = 개념(
    h('p', {}, '- 다른 변수에 영향을 주는 변수를 ', 빈칸칸('v-indep'), ', 다른 변수의 영향을 받으며 예측하고자 하는 변수를 ', 빈칸칸('v-dep'), '라고 한다.'),
    h('p', {}, '- [표1]에서 독립 변수는 ', 빈칸칸('v-t1x', 5), ', 종속 변수는 ', 빈칸칸('v-t1y', 5), '이다.'));

  // 고르면 「원인 ➜ 결과」 화살표가 바로 그려진다
  const 줄들 = 변수짝.map((p) => {
    const 화살표 = h('div', { class: 'arrow-row' });
    const 그림 = () => {
      const 독 = 상태.pick[p.id];
      if (!독) { 채우기(화살표, h('span', { class: 'muted' }, '독립 변수를 눌러 고르면 화살표가 그려져요.')); return; }
      const 종 = p.둘.find((v) => v !== 독);
      채우기(화살표, h('span', { class: 'pill indep' }, '독립 ', 독), h('span', { class: 'arr' }, '➜ 영향 ➜'), h('span', { class: 'pill dep' }, '종속 ', 종));
    };
    그림();
    const 줄 = h('tr', {}, h('td', {}, p.둘.join(' · ')), h('td', {}, 고르기(p.id, p.둘)), h('td', {}, 화살표));
    줄.addEventListener('pick', 그림);
    return 줄;
  });
  const 짝표 = h('table', { class: 'grid-table' },
    h('thead', {}, h('tr', {}, h('th', {}, '변수 짝'), h('th', {}, '어느 쪽이 독립 변수일까?'), h('th', {}, '관계'))),
    h('tbody', {}, 줄들));
  const 짝영역 = h('div', {}, 짝표);

  return [
    머리('1', '독립 변수와 종속 변수'),
    카드('개념 채우기', 빈칸영역, 확인상자('s1-blanks', 빈칸영역)),
    카드('▣ 두 변수 중 독립 변수와 종속 변수를 구분해 보자',
      h('p', { class: 'muted' }, '두 변수 가운데 「영향을 주는 쪽」을 누르세요. 나머지는 저절로 종속 변수가 됩니다.'),
      짝영역,
      확인상자('s1-pairs', 짝영역, { 해설: (id) => 변수짝.find((p) => p.id === id)?.해설 })),
  ];
}
