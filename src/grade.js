/*! 회귀 분석의 핵심개념 탐구 — © 2026 티쳐무 · 모든 권리 보유
 *  채점. 화면과 「내 활동지」가 같은 함수를 쓴다(채점 기준이 한곳에만 있도록).
 *  ⚠ DOM 을 만지지 않는다 — node 로 시험한다.
 */
import { 빈칸, 빈칸묶음, 빈칸맞나, 숫자맞나, 변수짝, 문장, r문제, 표5, 공정답 } from './data.js';
import { 표1 } from './data.js';
import { 두점직선, 합, 제곱합, 최소제곱, MSE } from './lib/regress.js';

// 5절 표의 정답 (회귀 직선 y = x)
export function 표5정답() {
  const 답 = {};
  표5.x.forEach((x, i) => {
    const y = 표5.y[i], p = x, e = y - p;
    답[`p${i}`] = p; 답[`e${i}`] = e; 답[`a${i}`] = Math.abs(e); 답[`s${i}`] = e * e;
  });
  const n = 표5.x.length;
  답.sumA = 표5.x.reduce((t, _, i) => t + 답[`a${i}`], 0);
  답.sumS = 표5.x.reduce((t, _, i) => t + 답[`s${i}`], 0);
  답.avgA = 표5.x.reduce((t, _, i) => t + 답[`a${i}`], 0) / n;
  답.avgS = 표5.x.reduce((t, _, i) => t + 답[`s${i}`], 0) / n;
  답.mae = 답.avgA;
  답.mse = 답.avgS;
  return 답;
}

/** 활동 하나 채점 → { key, 칸:[{id, 맞음, 정답}], 맞음, 전체 } */
export function 활동채점(key, 상태) {
  let 칸 = [];
  if (빈칸묶음[key]) {
    칸 = 빈칸묶음[key].map((id) => ({ id, 종류: 'blank', 정값: 빈칸[id].답[0], 맞음: 빈칸맞나(id, 상태.blank[id]), 정답: 빈칸[id].답[0], 값: 상태.blank[id] ?? '' }));
  } else if (key === 's1-pairs') {
    칸 = 변수짝.map((p) => ({ id: p.id, 종류: 'pick', 정값: p.독립, 맞음: 상태.pick[p.id] === p.독립, 정답: p.독립, 값: 상태.pick[p.id] ?? '' }));
  } else if (key === 's2-sent') {
    칸 = 문장.map((q) => ({ id: q.id, 종류: 'pick', 정값: q.답, 맞음: 상태.pick[q.id] === q.답, 정답: q.답 === '상관' ? '상관관계만 있다' : '인과 관계도 있다', 값: 상태.pick[q.id] ?? '' }));
  } else if (key === 's3-fair') {
    칸 = [{ id: 'fair', 종류: 'pick', 정값: 공정답, 맞음: 상태.pick.fair === 공정답, 정답: '오차 제곱합', 값: 상태.pick.fair ?? '' }];
  } else if (key === 's4-r') {
    for (const q of r문제) {
      칸.push({ id: `${q.id}d`, 종류: 'pick', 정값: q.방향, 맞음: 상태.pick[`${q.id}d`] === q.방향, 정답: q.방향, 값: 상태.pick[`${q.id}d`] ?? '' });
      칸.push({ id: `${q.id}s`, 종류: 'pick', 정값: q.강도, 맞음: 상태.pick[`${q.id}s`] === q.강도, 정답: q.강도, 값: 상태.pick[`${q.id}s`] ?? '' });
    }
  } else if (key === 's5-table') {
    const 답 = 표5정답();
    칸 = Object.keys(답).map((id) => ({ id, 종류: 't5', 정값: String(답[id]), 맞음: 숫자맞나(상태.t5[id], 답[id], 0.01), 정답: String(답[id]), 값: 상태.t5[id] ?? '' }));
  } else {
    throw new Error(`없는 활동: ${key}`);
  }
  return { key, 칸, 맞음: 칸.filter((c) => c.맞음).length, 전체: 칸.length };
}

// 채점하는 활동 전체 — 「내 활동지」의 점수판 차례
export const 채점활동 = [
  { key: 's1-blanks', 화면: 'var', 이름: '1. 빈칸 채우기' },
  { key: 's1-pairs', 화면: 'var', 이름: '1. 독립·종속 구분' },
  { key: 's2-blanks', 화면: 'cause', 이름: '2. 빈칸 채우기' },
  { key: 's2-sent', 화면: 'cause', 이름: '2. 상관만 / 인과도' },
  { key: 's3-blanks', 화면: 'line', 이름: '3. 빈칸 채우기' },
  { key: 's3-fair', 화면: 'line', 이름: '3. 공정한 비교 기준' },
  { key: 's4-blanks', 화면: 'corr', 이름: '4. 빈칸 채우기' },
  { key: 's4-r', 화면: 'corr', 이름: '4. r 의 방향과 강도' },
  { key: 's5-table', 화면: 'error', 이름: '5. MAE·MSE 표' },
  { key: 's6-blanks', 화면: 'r2', 이름: '6. 결정 계수 해석' },
  { key: 's7-table', 화면: 'two', 이름: '7. 두 가지 회귀 표' },
];

export function 전체채점(상태) {
  return 채점활동.map((a) => ({ ...a, ...활동채점(a.key, 상태), 확인함: !!상태.checked[a.key] }));
}

// ── 3절: 내가 그은 직선의 표 ────────────────────────────────────────
// 표에는 소수 첫째 자리까지 반올림해 보여 주지만, 합계는 반올림 전 값으로 셈한다.
// (반올림한 값으로 셈하면 최소제곱 직선보다 제곱합이 작아 보이는 일이 생긴다)
export function 내직선(상태) {
  if (!상태.line) return null;
  return 두점직선(상태.line.p, 상태.line.q);
}

export function 직선표(선, xs = 표1.x, ys = 표1.y) {
  if (!선) return null;
  const 예측 = xs.map((x) => 선.a * x + 선.b);
  const 오차 = 예측.map((p, i) => ys[i] - p);
  const 오차제곱 = 오차.map((e) => e * e);
  return { 예측, 오차, 오차제곱, 오차합: 합(오차), 제곱합: 제곱합(오차) };
}

/** 진행률 — 채점 활동은 다 맞힌 것, 서술은 채운 것, 직선은 그은 것을 센다 */
export function 진행률(상태) {
  const 채점 = 전체채점(상태);
  const 서술키 = ['hidden', 'fair', 'mse', 'split'];
  const 끝낸 = 채점.filter((a) => a.맞음 === a.전체).length
    + 서술키.filter((k) => (상태.text[k] || '').trim().length >= 5).length
    + (상태.lineMoved ? 1 : 0);
  const 전체 = 채점.length + 서술키.length + 1;
  return { 끝낸, 전체, 비율: 끝낸 / 전체 };
}

// ── 7절: 학습 데이터 / 평가 데이터 나누기 ─────────────────────────────
/** 평가 데이터 x 목록으로 학습·평가를 나눠 평가 MSE 를 셈한다 */
export function 나눠평가(평가x) {
  const 학습 = 표1.x.map((x, i) => ({ x, y: 표1.y[i] })).filter((p) => !평가x.includes(p.x));
  const 평가 = 표1.x.map((x, i) => ({ x, y: 표1.y[i] })).filter((p) => 평가x.includes(p.x));
  if (학습.length < 2 || 평가.length < 1) return null;
  const 선 = 최소제곱(학습.map((p) => p.x), 학습.map((p) => p.y));
  const 오차 = 평가.map((p) => p.y - (선.a * p.x + 선.b));
  return { 선, 학습, 평가, mse: MSE(오차) };
}


// ── 3절 ② 표에서 학생이 계산기로 직접 채우는 두 칸 ─────────────────────
export const 계산칸 = { 예측x: 5, 제곱x: 9 };

/**
 * 내가 그은 직선 기준으로 채점한다.
 * 예측값: 화면의 식(소수 둘째 자리)으로 셈해도 맞도록 ±0.1 까지 받는다.
 * 오차²: 화면에 보이는 오차(소수 첫째 자리)를 제곱한 값과 진짜 값 어느 쪽이든 ±0.06 이면 맞음.
 */
export function 직접계산채점(상태) {
  const 선 = 내직선(상태);
  if (!선) return null;
  const 예측정답 = 선.a * 계산칸.예측x + 선.b;
  const i = 표1.x.indexOf(계산칸.제곱x);
  const 오차 = 표1.y[i] - (선.a * 계산칸.제곱x + 선.b);
  const 보이는오차 = Math.round(오차 * 10) / 10;
  const 예값 = 상태.calc?.pred ?? '', 제값 = 상태.calc?.sq ?? '';
  return {
    pred: { 값: 예값, 정답: 예측정답, 맞음: 숫자맞나(예값, 예측정답, 0.1) },
    sq: { 값: 제값, 정답: 오차 * 오차, 보이는오차, 맞음: 숫자맞나(제값, 오차 * 오차, 0.06) || 숫자맞나(제값, 보이는오차 ** 2, 0.06) },
  };
}
