/*! 회귀 분석 실험실 — © 2026 티쳐무 · 모든 권리 보유
 *  화면 부품: 요소 만들기 h(), 대화상자, 화면 수명 관리.
 */

/**
 * 요소 만들기. h('div', {class:'x', onclick: f}, '글', 자식요소, [자식들])
 * 자식 문자열은 글자 그대로 들어간다. HTML 을 넣으려면 {html: '...'} 를 쓴다.
 */
export function h(태그, 속성 = {}, ...자식) {
  const 요소 = document.createElement(태그);
  for (const [k, v] of Object.entries(속성 || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith('on') && typeof v === 'function') 요소.addEventListener(k.slice(2), v);
    else if (k === 'class') 요소.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(요소.style, v);
    else if (k === 'value') 요소.value = v;
    else if (k === 'checked') 요소.checked = !!v;
    else 요소.setAttribute(k, v === true ? '' : v);
  }
  넣기(요소, 자식);
  return 요소;
}

function 넣기(요소, 자식) {
  for (const c of 자식.flat(Infinity)) {
    if (c == null || c === false) continue;
    if (c instanceof Node) 요소.appendChild(c);
    else if (typeof c === 'object' && 'html' in c) 요소.insertAdjacentHTML('beforeend', c.html);
    else 요소.appendChild(document.createTextNode(String(c)));
  }
}

/** SVG 요소 만들기 */
export function s(태그, 속성 = {}, ...자식) {
  const 요소 = document.createElementNS('http://www.w3.org/2000/svg', 태그);
  for (const [k, v] of Object.entries(속성 || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith('on') && typeof v === 'function') 요소.addEventListener(k.slice(2), v);
    else 요소.setAttribute(k, v);
  }
  for (const c of 자식.flat(Infinity)) {
    if (c == null || c === false) continue;
    요소.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return 요소;
}

/** 자식을 모두 지우고 새로 채운다 */
export function 채우기(요소, ...자식) {
  요소.replaceChildren();
  넣기(요소, 자식);
  return 요소;
}

// ── 대화상자 ─────────────────────────────────────────────────────
// 브라우저 기본 alert/confirm 은 주소가 함께 떠서 교실 화면에 어울리지 않는다.
export function 창(제목, 내용, 단추들 = [{ 글: '닫기', 값: true, 주: true }]) {
  return new Promise((풀기) => {
    const 닫기 = (값) => { 바탕.remove(); 풀기(값); };
    const 바탕 = h('div', { class: 'modal-back', onclick: (e) => { if (e.target === 바탕) 닫기(false); } },
      h('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true' },
        h('h3', {}, 제목),
        h('div', { class: 'modal-body' }, 내용),
        h('div', { class: 'modal-btns' },
          단추들.map((d) => h('button', { class: d.주 ? 'btn primary' : 'btn', onclick: () => 닫기(d.값) }, d.글))),
      ));
    document.body.appendChild(바탕);
    바탕.querySelector('.modal-btns .btn')?.focus();
  });
}

export const 묻기 = (제목, 내용, 예 = '예', 아니오 = '아니요') =>
  창(제목, 내용, [{ 글: 아니오, 값: false }, { 글: 예, 값: true, 주: true }]);

// ── 화면 수명 ────────────────────────────────────────────────────
// 화면을 바꿀 때 그 화면이 걸어 둔 창 이벤트를 걷어 낸다.
let 정리할것 = [];
export function 화면시작() {
  for (const f of 정리할것) f();
  정리할것 = [];
}
export function 창이벤트(이름, f) {
  window.addEventListener(이름, f);
  정리할것.push(() => window.removeEventListener(이름, f));
}

/** 화면 아래 저작권 푸터 */
export function 푸터() {
  return h('footer', { class: 'footer' },
    '© 2026 티쳐무 · 모든 권리 보유 · 학교 수업 목적으로만 이용해 주세요. ',
    h('span', { class: 'muted' }, '학습지 「데이터 과학 — 회귀 분석 모델(p.110~113)」을 바탕으로 만들었습니다. 이 앱은 아무것도 서버로 보내지 않습니다.'));
}
