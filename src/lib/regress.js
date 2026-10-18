/*! 회귀 분석의 핵심개념 탐구 — © 2026 티쳐무 · 모든 권리 보유
 *  회귀 분석에 쓰는 계산을 한곳에 모았다. DOM 을 만지지 않으므로 node 로 시험한다.
 */

/** 평균 */
export function 평균(값들) {
  return 값들.reduce((a, b) => a + b, 0) / 값들.length;
}

/**
 * 최소제곱법 — 오차 제곱의 합이 가장 작아지는 직선 y = ax + b 를 구한다.
 * 기울기 a = Σ(x-x̄)(y-ȳ) / Σ(x-x̄)²,  절편 b = ȳ - a·x̄
 */
export function 최소제곱(xs, ys) {
  const mx = 평균(xs), my = 평균(ys);
  let sxy = 0, sxx = 0;
  for (let i = 0; i < xs.length; i++) {
    sxy += (xs[i] - mx) * (ys[i] - my);
    sxx += (xs[i] - mx) ** 2;
  }
  const a = sxy / sxx;
  return { a, b: my - a * mx };
}

/** 직선 {a, b} 로 x 의 예측값을 낸다. */
export const 예측 = (선, x) => 선.a * x + 선.b;

/** 오차 = 실젯값 − 예측값 (점이 직선보다 위면 +, 아래면 −) */
export function 오차들(xs, ys, 선) {
  return xs.map((x, i) => ys[i] - 예측(선, x));
}

export const 합 = (값들) => 값들.reduce((a, b) => a + b, 0);
export const 제곱합 = (값들) => 값들.reduce((a, b) => a + b * b, 0);

/** 평균절대오차(MAE) = (|오차₁| + … + |오차ₙ|) / n */
export const MAE = (오차) => 오차.reduce((a, e) => a + Math.abs(e), 0) / 오차.length;

/** 평균제곱오차(MSE) = (오차₁² + … + 오차ₙ²) / n */
export const MSE = (오차) => 제곱합(오차) / 오차.length;

/** 피어슨 상관관계 계수 r (−1 ~ 1) */
export function 상관계수(xs, ys) {
  const mx = 평균(xs), my = 평균(ys);
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < xs.length; i++) {
    sxy += (xs[i] - mx) * (ys[i] - my);
    sxx += (xs[i] - mx) ** 2;
    syy += (ys[i] - my) ** 2;
  }
  if (sxx === 0 || syy === 0) return 0;
  return sxy / Math.sqrt(sxx * syy);
}

/**
 * 결정 계수 R² = 1 − (직선과의 오차 제곱합) / (평균과의 차이 제곱합)
 * 최소제곱 직선에서는 0~1 사이 값이 된다.
 */
export function 결정계수(xs, ys, 선) {
  const my = 평균(ys);
  const 전체 = 제곱합(ys.map((y) => y - my));
  const 남은 = 제곱합(오차들(xs, ys, 선));
  return 1 - 남은 / 전체;
}

/** |r| 로 강도를 가른다 (학습지 기준: 0.7 이상 강함, 0.3 이상 보통, 그 아래 약함) */
export function 강도(r) {
  const k = Math.abs(r);
  if (k >= 0.7) return '강함';
  if (k >= 0.3) return '보통';
  return '약함';
}

/** 두 점을 지나는 직선 */
export function 두점직선(p, q) {
  if (Math.abs(q.x - p.x) < 1e-9) return null;
  const a = (q.y - p.y) / (q.x - p.x);
  return { a, b: p.y - a * p.x };
}

/** 소수 자리 반올림 (표에 적는 값) */
export const 반올림 = (v, 자리 = 1) => {
  const k = 10 ** 자리;
  return Math.round((v + Number.EPSILON) * k) / k;
};

/** 화면에 보이는 숫자 — 빼기표는 진짜 빼기 기호(−)로 */
export function 수(v, 자리 = 1) {
  const r = 반올림(v, 자리);
  const 글 = (Object.is(r, -0) ? 0 : r).toFixed(자리);
  return 글.replace('-', '−');
}

/** 직선을 식으로 — y = 1.633x − 1.167 */
export function 식(선, 자리 = 3) {
  const a = 수(선.a, 자리);
  const b = 반올림(선.b, 자리);
  if (b === 0) return `y = ${a}x`;
  return `y = ${a}x ${b < 0 ? '−' : '+'} ${Math.abs(b).toFixed(자리)}`;
}

/**
 * 변동 나누기 — 점마다 「평균에서 떨어진 정도」를 두 조각으로 가른다.
 *   전체(주황) = 실젯값 − 평균         … 평균으로만 짐작했을 때 틀린 만큼
 *   설명(초록) = 예측값 − 평균         … 직선(광고비) 덕분에 맞힌 만큼
 *   남은(파랑) = 실젯값 − 예측값(오차) … 직선으로도 못 맞힌 만큼
 * 점 하나에서는 길이로 「전체 = 설명 + 남은」이 늘 맞는다.
 * 제곱해서 모두 더한 값은 최소제곱 직선일 때만 「SST = ESS + RSS」가 맞는다.
 */
export function 변동나누기(xs, ys, 선) {
  const m = 평균(ys);
  const 점들 = xs.map((x, i) => {
    const 예측값 = 선.a * x + 선.b;
    return { x, y: ys[i], 예측값, 전체: ys[i] - m, 설명: 예측값 - m, 남은: ys[i] - 예측값 };
  });
  return {
    평균: m,
    점들,
    SST: 제곱합(점들.map((p) => p.전체)),
    ESS: 제곱합(점들.map((p) => p.설명)),
    RSS: 제곱합(점들.map((p) => p.남은)),
  };
}
