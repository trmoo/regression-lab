/*! 회귀 분석의 핵심개념 탐구 — © 2026 티쳐무 · 모든 권리 보유
 *  💾 저장하기 — 이 HTML 파일(앱) 그대로에 학생 활동만 심어 파일째 저장한다.
 *  데이터과학 수행평가 시험지(offline-exam)와 같은 방식이다.
 *
 *  ⚠ 저장 창(showSaveFilePicker)은 단추를 누른 「바로 그 순간」에만 열 수 있다 — 파일 내용은 창을 연 다음에 만든다.
 *  ⚠ 저장 창에 id 를 주지 않는다 — id 가 있으면 지난번에 고른 폴더가 startIn('desktop') 보다 앞선다.
 *  ⚠ 활동 JSON 의 < 는 < 로 적는다 — 답에 </script> 가 들어 있어도 파일이 끊기지 않게.
 */
import { h, 창, 묻기 } from './ui.js';
import { 상태, 저장, 심은활동, 불러온곳 } from './store.js';

// 앱이 화면을 그리기 전의 이 파일 그대로 — 저장할 때 여기에 활동만 끼워 넣는다.
// (이 모듈은 main.js 보다 먼저 실행되므로 #app 이 아직 비어 있다)
// outerHTML 은 <html> 바깥의 저작권 주석을 빠뜨리므로 문서의 맨 위 마디를 하나씩 옮긴다.
// ⚠ 이전 활동 칸은 정규식이 아니라 DOM 에서 떼어 낸다 — 앱 코드 안에도 'saved-work' 글자가 있어서,
//   정규식으로 지우면 코드 한가운데부터 </script> 까지 통째로 잘려 나간다(실제로 저장 파일이 24KB 로 깨졌다).
function 원본만들기() {
  if (typeof document === 'undefined') return '';
  return [...document.childNodes].map((n) => {
    if (n.nodeType === 10) return '<!doctype html>';
    if (n.nodeType === 8) return `<!--${n.data}-->`;
    if (n === document.documentElement) {
      const 복사 = n.cloneNode(true);
      복사.querySelector('#saved-work')?.remove();
      return 복사.outerHTML;
    }
    return n.outerHTML ?? '';
  }).join('\n');
}
const 원본 = 원본만들기();

export const 저장창있나 = () => typeof window.showSaveFilePicker === 'function';
const 개발서버인가 = () => !!document.querySelector('script[type="module"][src]');

/** 파일 이름에 쓸 수 없는 글자를 걷어 낸다 (윈도우: \ / : * ? " < > |) */
export const 안전이름 = (s) => String(s).replace(/[\\/:*?"<>|\u0000-\u001f]/g, '').trim();
export const 저장파일이름 = (학생) => 안전이름(`회귀분석_${학생.id}_${학생.name}.html`);

/**
 * 원본 앱에 활동 JSON 을 심는다 — <meta charset> 바로 뒤에.
 * ⚠ <head> 바로 뒤(meta charset 앞)에 넣으면 안 된다 — 더블클릭(file://)으로 열 때 브라우저는
 *   문서 앞 1024바이트 안에서만 charset 을 찾는다. 답이 길면 그 줄이 밀려나 한글이 깨지고 앱이 멈출 수 있다.
 */
export function 활동심기(원본글, 활동) {
  const BS = String.fromCharCode(92);
  const json = JSON.stringify(활동).split('<').join(`${BS}u003c`)
    .split(String.fromCharCode(0x2028)).join(`${BS}u2028`).split(String.fromCharCode(0x2029)).join(`${BS}u2029`);
  const 칸 = `<script id="saved-work" type="application/json">${json}</script>\n`;
  let 자리 = 원본글.search(/<meta charset[^>]*>/i);
  if (자리 < 0) 자리 = 원본글.search(/<head[^>]*>/i);
  if (자리 < 0) return 칸 + 원본글;
  const 끝 = 원본글.indexOf('>', 자리) + 1;
  return `${원본글.slice(0, 끝)}\n${칸}${원본글.slice(끝)}`;
}

let 파일손잡이 = null;   // 처음 저장할 때 고른 파일 — 그다음부터는 창 없이 바로 덮어쓴다
let 손잡이이름 = null;   // 그 파일을 고를 때의 이름 — 학번·이름을 고치면 다시 묻는다
let 저장창막힘 = false;  // 저장 창이 있는데 열리지 않았다 — 그다음부터는 내려받기로
const 가린이름 = (n) => (n.length <= 1 ? n : n.length === 2 ? `${n[0]}*` : `${n[0]}${'*'.repeat(n.length - 2)}${n.at(-1)}`);
export { 가린이름 };

/** 학번·이름 받기 — 비어 있으면 저장 전에 묻는다 */
async function 학생정보받기() {
  const 학번칸 = h('input', { class: 'id-input', value: 상태.student.id, inputmode: 'numeric', placeholder: '예: 10612', autocomplete: 'off' });
  const 이름칸 = h('input', { class: 'id-input', value: 상태.student.name, placeholder: '예: 홍길동', autocomplete: 'off' });
  const 예 = await 창('✍️ 학번과 이름을 적어 주세요', h('div', {},
    h('p', {}, '저장 파일 이름과 활동지에 들어갑니다. ', h('span', { class: 'muted small' }, '(이 PC 에는 남지 않아요)')),
    h('div', { class: 'id-row' }, h('label', {}, '학번 ', 학번칸), h('label', {}, '이름 ', 이름칸))),
  [{ 글: '취소', 값: false }, { 글: '확인', 값: true, 주: true }]);
  if (!예) return false;
  상태.student.id = 학번칸.value.trim();
  상태.student.name = 이름칸.value.trim();
  저장();
  return !!(상태.student.id && 상태.student.name);
}

/** 💾 저장하기 */
export async function 저장하기(다시그리기 = () => {}) {
  if (개발서버인가()) {
    await 창('여기서는 저장할 수 없어요', '개발 서버 화면입니다. npm run build 로 만든 dist/index.html 을 열어 저장해 주세요.');
    return;
  }
  if (!상태.student.id || !상태.student.name) {
    if (!(await 학생정보받기())) { await 창('저장하지 않았어요', '학번과 이름을 모두 적어야 저장할 수 있어요.'); return; }
    다시그리기();
  }
  const 이름 = 저장파일이름(상태.student);
  if (손잡이이름 && 손잡이이름 !== 이름) 파일손잡이 = null; // 학번·이름을 고쳤으면 새 파일로

  let 대상 = 파일손잡이;
  if (!대상 && 저장창있나() && !저장창막힘) {
    // 「이미 있습니다. 바꾸시겠습니까?」 가 뜰 때 [예]/[아니요] 를 미리 알려 준다
    //  · 저장 파일에서 이어 쓰는 중이거나, 이 탭에서 이미 저장했다면 — 같은 활동의 옛 판이니 덮어써도 된다
    //  · 처음 저장할 때의 「[아니요] 를 누르세요」 경고는 사용자 지시(2026-10-18)로 뺐다 — 처음 화면의 「이어서라면 바탕 화면 파일을 여세요」 띠가 대신한다
    const 같은활동 = 불러온곳 === 'file' || !!상태.savedAt;
    const 열기 = await 묻기('💾 바탕 화면에 저장하기', h('div', {},
      h('p', {}, '저장 창이 ', h('b', {}, '바탕 화면'), '으로 열립니다. 이름(', h('b', {}, 이름), ')을 바꾸지 말고 ', h('b', {}, '[저장]'), ' 을 누르세요.'),
      같은활동
        ? h('p', {}, '「이미 있습니다. 바꾸시겠습니까?」 가 나오면 ', h('b', {}, '[예]'), ' 를 누르세요 — 앞서 저장한 내 파일에 덮어씁니다.')
        : null,
      h('p', { class: 'muted small' }, '그다음부터는 [💾 저장하기] 를 누를 때마다 창 없이 이 파일에 바로 저장됩니다.')),
    '저장 창 열기', '취소');
    if (!열기) return;
    try {
      대상 = await window.showSaveFilePicker({
        suggestedName: 이름, startIn: 'desktop',
        types: [{ description: '회귀 분석의 핵심개념 탐구 (HTML)', accept: { 'text/html': ['.html', '.htm'] } }],
      });
    } catch (e) {
      if (e?.name === 'AbortError') return; // 학생이 저장 창을 닫음
      저장창막힘 = true; 대상 = null;       // 보안 설정으로 막힘 — 내려받기로
    }
  }

  상태.savedAt = Math.max(Date.now(), 상태.updatedAt || 0);
  const 글 = 활동심기(원본, { ...상태, 저장시각: new Date().toISOString() });
  const 덩이 = new Blob([글], { type: 'text/html;charset=utf-8' });
  try {
    if (대상) {
      const 쓰개 = await 대상.createWritable();
      await 쓰개.write(덩이);
      await 쓰개.close();
      파일손잡이 = 대상; 손잡이이름 = 이름;
      저장({ 조용히: true });
      다시그리기();
      알림(`💾 저장했어요 — ${대상.name}`);
      return;
    }
    const 주소 = URL.createObjectURL(덩이);
    const 고리 = h('a', { href: 주소, download: 이름 });
    document.body.appendChild(고리); 고리.click(); 고리.remove();
    setTimeout(() => URL.revokeObjectURL(주소), 5000);
    저장({ 조용히: true });
    다시그리기();
    await 창('💾 저장했어요', h('div', {},
      h('p', {}, h('b', {}, 이름), ' 파일을 「다운로드」 폴더에 저장했어요.'),
      h('p', {}, '👉 ', h('b', {}, '이 파일을 바탕 화면으로 옮겨 두세요.'), ' 다음 시간에 그 파일을 더블클릭하면 이어서 할 수 있어요.')));
  } catch (e) {
    상태.savedAt = 0;
    파일손잡이 = null;
    await 창('저장하지 못했어요', `파일을 쓰지 못했어요 (${e?.message ?? e}). 다시 [💾 저장하기] 를 눌러 다른 곳을 골라 보세요.`);
  }
}

/** 잠깐 떴다 사라지는 알림 */
export function 알림(글, 시간 = 3000) {
  const 띠 = h('div', { class: 'toast', role: 'status' }, 글);
  document.body.appendChild(띠);
  setTimeout(() => 띠.remove(), 시간);
}

/** 저장 파일을 열었을 때 — 남의 파일을 열었을 수 있으니 먼저 묻는다 */
export async function 본인확인(새로시작) {
  if (불러온곳 !== 'file' || !심은활동) return;
  const 학생 = 심은활동.student || {};
  const 때 = 심은활동.저장시각 ? new Date(심은활동.저장시각).toLocaleString('ko-KR') : '';
  const 맞다 = await 묻기('📂 저장한 활동을 불러왔어요', h('div', {},
    h('p', { class: 'big-id' }, `${학생.id || '학번 없음'} · ${가린이름(학생.name || '이름 없음')}`),
    때 ? h('p', { class: 'muted small' }, `마지막 저장: ${때}`) : null,
    h('p', {}, '본인의 활동이 맞나요?')),
  '네, 이어서 할게요', '아니요, 처음부터');
  if (!맞다) 새로시작();
}
