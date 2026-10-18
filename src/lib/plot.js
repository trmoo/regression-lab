/*! 회귀 분석의 핵심개념 탐구 — © 2026 티쳐무 · 모든 권리 보유
 *  산점도 그리기. 바깥 라이브러리 없이 SVG 로 직접 그린다.
 */
import { s } from './ui.js';

/**
 * 모눈이 있는 좌표 평면을 만든다.
 * 돌려주는 것: { svg, sx, sy, 데이터좌표(event), 층: {모눈, 아래, 선, 점, 위} }
 */
export function 좌표평면({ x0 = 0, x1 = 10, y0 = 0, y1 = 20, 눈금x = 1, 눈금y = 2, 폭 = 560, 높이 = 420, x이름 = '', y이름 = '', 잔모눈 = true } = {}) {
  const 여백 = { 왼: 58, 오: 18, 위: 16, 아래: 54 };
  const W = 폭 - 여백.왼 - 여백.오, H = 높이 - 여백.위 - 여백.아래;
  const sx = (x) => 여백.왼 + ((x - x0) / (x1 - x0)) * W;
  const sy = (y) => 여백.위 + H - ((y - y0) / (y1 - y0)) * H;

  const svg = s('svg', { viewBox: `0 0 ${폭} ${높이}`, class: 'plot', role: 'img' });
  const 층 = {};
  for (const 이름 of ['모눈', '아래', '선', '점', '위']) {
    층[이름] = s('g', { class: `layer-${이름}` });
  }

  // 잔모눈 (학습지처럼 눈금 사이를 한 번 더 나눈다)
  if (잔모눈) {
    for (let x = x0; x <= x1 + 1e-9; x += 눈금x / 2) {
      층.모눈.appendChild(s('line', { x1: sx(x), x2: sx(x), y1: sy(y0), y2: sy(y1), class: 'grid-fine' }));
    }
    for (let y = y0; y <= y1 + 1e-9; y += 눈금y / 2) {
      층.모눈.appendChild(s('line', { x1: sx(x0), x2: sx(x1), y1: sy(y), y2: sy(y), class: 'grid-fine' }));
    }
  }
  for (let x = x0; x <= x1 + 1e-9; x += 눈금x) {
    층.모눈.appendChild(s('line', { x1: sx(x), x2: sx(x), y1: sy(y0), y2: sy(y1), class: 'grid' }));
    층.모눈.appendChild(s('text', { x: sx(x), y: sy(y0) + 20, class: 'tick', 'text-anchor': 'middle' }, 숫자(x)));
  }
  for (let y = y0; y <= y1 + 1e-9; y += 눈금y) {
    층.모눈.appendChild(s('line', { x1: sx(x0), x2: sx(x1), y1: sy(y), y2: sy(y), class: 'grid' }));
    층.모눈.appendChild(s('text', { x: sx(x0) - 8, y: sy(y) + 5, class: 'tick', 'text-anchor': 'end' }, 숫자(y)));
  }
  층.모눈.appendChild(s('line', { x1: sx(x0), x2: sx(x1), y1: sy(Math.max(y0, 0)), y2: sy(Math.max(y0, 0)), class: 'axis' }));
  층.모눈.appendChild(s('line', { x1: sx(x0), x2: sx(x0), y1: sy(y0), y2: sy(y1), class: 'axis' }));
  층.모눈.appendChild(s('text', { x: 여백.왼 + W / 2, y: 높이 - 10, class: 'axis-label', 'text-anchor': 'middle' }, x이름));
  층.모눈.appendChild(s('text', { x: 16, y: 여백.위 + H / 2, class: 'axis-label', 'text-anchor': 'middle', transform: `rotate(-90 16 ${여백.위 + H / 2})` }, y이름));

  // 그림 영역 밖으로 나간 선은 잘라 낸다
  const 자르기id = `clip${Math.random().toString(36).slice(2, 8)}`;
  svg.appendChild(s('defs', {}, s('clipPath', { id: 자르기id }, s('rect', { x: sx(x0), y: sy(y1), width: W, height: H }))));
  층.아래.setAttribute('clip-path', `url(#${자르기id})`);
  층.선.setAttribute('clip-path', `url(#${자르기id})`);

  for (const 이름 of ['모눈', '아래', '선', '점', '위']) svg.appendChild(층[이름]);

  /** 마우스·손가락 위치를 데이터 좌표로 */
  function 데이터좌표(e) {
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const m = svg.getScreenCTM();
    if (!m) return { x: 0, y: 0 };
    const p = pt.matrixTransform(m.inverse());
    return {
      x: x0 + ((p.x - 여백.왼) / W) * (x1 - x0),
      y: y0 + ((여백.위 + H - p.y) / H) * (y1 - y0),
    };
  }

  return { svg, sx, sy, 층, 데이터좌표, 범위: { x0, x1, y0, y1 } };
}

function 숫자(v) {
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}

/** 직선 y = ax + b 를 그림 영역 전체 폭으로 */
export function 직선그리기(평면, 선, 속성 = {}) {
  const { x0, x1 } = 평면.범위;
  return s('line', {
    x1: 평면.sx(x0), y1: 평면.sy(선.a * x0 + 선.b),
    x2: 평면.sx(x1), y2: 평면.sy(선.a * x1 + 선.b),
    ...속성,
  });
}

/** 점 하나 (+ 이름표) */
export function 점그리기(평면, x, y, { 이름표 = null, class: 클래스 = 'dot', r = 7 } = {}) {
  const g = s('g', {});
  g.appendChild(s('circle', { cx: 평면.sx(x), cy: 평면.sy(y), r, class: 클래스 }));
  if (이름표) g.appendChild(s('text', { x: 평면.sx(x) + 9, y: 평면.sy(y) + 18, class: 'dot-label' }, 이름표));
  return g;
}

/**
 * 끌 수 있는 손잡이. 움직일 때마다 갈 곳(x, y) 을 알려 준다.
 * 마우스·터치·펜 모두 pointer 이벤트로 받는다.
 */
export function 손잡이(평면, 위치, 움직임, { class: 클래스 = 'handle' } = {}) {
  const c = s('circle', { cx: 평면.sx(위치.x), cy: 평면.sy(위치.y), r: 13, class: 클래스, tabindex: 0 });
  let 끄는중 = false;
  c.addEventListener('pointerdown', (e) => {
    끄는중 = true;
    e.preventDefault();
    // 손가락이 손잡이 밖으로 빨리 나가도 계속 끌리도록 붙잡는다
    try { c.setPointerCapture(e.pointerId); } catch { /* 붙잡지 못해도 끌기는 된다 */ }
  });
  c.addEventListener('pointermove', (e) => {
    if (!끄는중) return;
    const p = 평면.데이터좌표(e);
    const { x0, x1, y0, y1 } = 평면.범위;
    const x = Math.min(x1, Math.max(x0, p.x)), y = Math.min(y1, Math.max(y0, p.y));
    c.setAttribute('cx', 평면.sx(x)); c.setAttribute('cy', 평면.sy(y));
    움직임({ x, y }, false);
  });
  const 놓기 = () => { if (끄는중) { 끄는중 = false; 움직임(null, true); } };
  c.addEventListener('pointerup', 놓기);
  c.addEventListener('pointercancel', 놓기);
  return c;
}
