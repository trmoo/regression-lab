/*! 회귀 분석 실험실 — © 2026 티쳐무 · 모든 권리 보유
 *  학생 활동의 기억 — 데이터과학 수행평가 시험지(offline-exam)와 같은 방식이다.
 *
 *  활동은 두 곳에 남는다
 *   ① 이 탭의 sessionStorage — 새로 고쳐도 남는다. 탭을 닫으면 지워진다(다음 시간 같은 PC 학생이 못 보게).
 *   ② [💾 저장하기] — 이 HTML 파일 안의 <script id="saved-work"> 에 활동을 심어 파일째 저장한다(savefile.js).
 *      다음 시간에 그 파일을 열면 여기서 심은 활동을 읽어 이어서 쓴다.
 *  학번·이름은 이 둘 말고는 어디에도 남기지 않는다(localStorage 를 쓰지 않는다).
 */

const 열쇠이름 = 'regression-lab';

export function 빈상태() {
  return {
    v: 1,
    student: { id: '', name: '' }, // 학번 · 이름 — 저장 파일 이름과 활동지 머리에 쓴다
    blank: {},   // 빈칸 글
    pick: {},    // 고르기 (독립 변수, 상관/인과, 방향/강도 …)
    t5: {},      // 5절 표의 숫자
    text: {},    // 서술 답
    checked: {}, // [확인] 을 누른 활동
    line: null,  // 내가 그은 직선의 두 손잡이 {p:{x,y}, q:{x,y}}
    lineMoved: false,
    best: null,   // 지금까지 가장 작았던 오차 제곱합
    lsShown: false, // 최소제곱 직선을 보았는가
    partner: { sum: '', sse: '' },
    calc: { pred: '', sq: '' }, // 3절 표에서 직접 계산한 두 칸
    guess: '',   // 처음 눈대중 예측
    split: [2, 5, 8], // 7절 평가 데이터 x
    visited: {},
    updatedAt: 0, // 마지막으로 고친 때(밀리초)
    savedAt: 0,   // 마지막으로 파일에 저장한 때
  };
}

/** 파일에 심어 둔 활동 — 원래 앱(빈 파일)이면 null */
function 심은활동읽기() {
  try {
    if (typeof document === 'undefined') return null;
    const 칸 = document.getElementById('saved-work');
    const 글 = 칸?.textContent?.trim();
    return 글 ? JSON.parse(글) : null;
  } catch {
    return null;
  }
}
export const 심은활동 = 심은활동읽기();

// 열린 파일마다 따로 — 한 탭에서 다른 학생 파일을 열어도 섞이지 않게
const 파일이름 = typeof location === 'undefined' ? '' : decodeURIComponent(location.pathname.split('/').pop() || '');
const 열쇠 = `${열쇠이름}:${파일이름}`;

/**
 * 탭의 임시 기억과 파일에 심은 활동 가운데 더 최근 것을 고른다.
 * 파일을 열어 더 쓰다가 저장하지 않고 새로 고쳤다면 탭 쪽이 더 최근이다.
 */
export function 최근것고르기(탭, 파일) {
  if (!파일) return 탭;
  if (!탭) return 파일;
  return (탭.updatedAt || 0) > (파일.updatedAt || 0) ? 탭 : 파일;
}

function 다듬기(고른) {
  const 읽은 = { ...빈상태(), ...(고른 || {}) };
  읽은.calc = { pred: '', sq: '', ...(읽은.calc || {}) };
  읽은.student = { id: String(읽은.student?.id ?? ''), name: String(읽은.student?.name ?? '') };
  return 읽은;
}

function 읽기() {
  let 탭 = null;
  try { 탭 = JSON.parse(sessionStorage.getItem(열쇠) || 'null'); } catch { /* 막혀 있어도 활동은 된다 */ }
  const 고른 = 최근것고르기(탭, 심은활동);
  return { 상태: 다듬기(고른), 어디서: !고른 ? null : 고른 === 심은활동 ? 'file' : 'session' };
}

const 처음 = 읽기();
export const 상태 = 처음.상태;
/** 'file' — 저장 파일에서 불러옴 · 'session' — 이 탭에서 하던 것 · null — 새로 시작 */
export const 불러온곳 = 처음.어디서;

let 예약 = null;
/** 고친 것을 이 탭에 남긴다. 화면을 옮겨 다닌 것 같은 사소한 변화는 { 조용히: true } — 「저장 안 함」 으로 치지 않는다 */
export function 저장({ 조용히 = false } = {}) {
  if (!조용히) 상태.updatedAt = Date.now();
  clearTimeout(예약);
  예약 = setTimeout(() => {
    try { sessionStorage.setItem(열쇠, JSON.stringify(상태)); } catch { /* 가득 차도 파일 저장은 된다 */ }
  }, 200);
}

/** 파일에 저장한 뒤 바뀐 것이 있나 */
export const 저장안됨 = () => (상태.updatedAt || 0) > (상태.savedAt || 0);

/** 처음부터 다시 — 이 탭의 기억을 비운다(이미 저장한 파일은 그대로) */
export function 모두지우기() {
  try { sessionStorage.removeItem(열쇠); } catch { /* 무시 */ }
  const 새 = 빈상태();
  for (const k of Object.keys(상태)) delete 상태[k];
  Object.assign(상태, 새);
}
