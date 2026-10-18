/*! 회귀 분석의 핵심개념 탐구 — © 2026 티쳐무 · 모든 권리 보유
 *  여러 화면이 함께 쓰는 조각: 카드, [표1] 산점도.
 */
import { h } from '../lib/ui.js';
import { 좌표평면, 점그리기 } from '../lib/plot.js';
import { 표1 } from '../data.js';

/** 학습지 한 꼭지 = 카드 하나 */
export function 카드(제목, ...내용) {
  return h('section', { class: 'card' }, 제목 ? h('h2', {}, 제목) : null, ...내용);
}

/** 학습지의 개념 상자(회색 띠) */
export function 개념(...내용) {
  return h('div', { class: 'concept' }, ...내용);
}

/** 화면 머리 — 「3 선형 회귀 분석」 */
export function 머리(번호, 제목) {
  return h('header', { class: 'screen-head' },
    h('span', { class: 'num' }, 번호), h('h1', {}, 제목));
}

/** [표1] 산점도. 점마다 (x, y) 이름표를 단다. */
export function 표1평면(옵션 = {}) {
  const 평면 = 좌표평면({ x0: 0, x1: 10, y0: 0, y1: 20, 눈금x: 1, 눈금y: 2, x이름: 표1.x이름, y이름: 표1.y이름, ...옵션 });
  표1.x.forEach((x, i) => 평면.층.점.appendChild(점그리기(평면, x, 표1.y[i], { 이름표: 옵션.이름표 === false ? null : `(${x}, ${표1.y[i]})` })));
  return 평면;
}

/** [표1] 표 (x = 10 칸은 ?) */
export function 표1표(물음표 = '?') {
  return h('table', { class: 'data-table' },
    h('tbody', {},
      h('tr', {}, h('th', {}, '광고비 x (백만원)'), 표1.x.map((x) => h('td', {}, x)), h('td', { class: 'q-cell' }, '10')),
      h('tr', {}, h('th', {}, '매출액 y (천만원)'), 표1.y.map((y) => h('td', {}, y)), h('td', { class: 'q-cell' }, 물음표))),
    h('caption', {}, '[표1] 광고비(단위: 백만원)와 매출액(단위: 천만원)'));
}
