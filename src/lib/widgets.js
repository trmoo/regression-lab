/*! 회귀 분석의 핵심개념 탐구 — © 2026 티쳐무 · 모든 권리 보유
 *  학습 활동 부품: 빈칸 · 고르기 · 숫자 칸 · 서술 칸 · [확인] 상자.
 *  모든 부품은 store.js 의 상태에 바로 묶여 있어 고치는 즉시 저장된다.
 */
import { h, 채우기 } from './ui.js';
import { 상태, 저장 } from './store.js';
import { 빈칸 } from '../data.js';
import { 활동채점 } from '../grade.js';
import { 서술 } from '../data.js';

// 칸을 고치면 그 칸의 ○/× 표시를 지운다(다시 [확인] 을 눌러야 채점된다).
function 표시지우기(요소) {
  요소.classList.remove('ok', 'bad');
  const id = 요소.dataset.id;
  if (id) document.querySelectorAll(`.hint[data-hint-for="${id}"]`).forEach((e) => e.remove());
}

/**
 * 힌트를 붙일 자리. 빈칸 힌트를 문장 한가운데 끼우면 문장이 끊기므로
 * 그 빈칸이 든 줄(p·td·li)의 맨 끝, 문장 아래에 모아 붙인다.
 * 한 줄에 빈칸이 여럿이면 「첫째 빈칸」처럼 어느 칸인지 밝힌다.
 */
function 힌트달기(요소, 글) {
  const 힌트 = h('span', { class: 'hint', 'data-hint-for': 요소.dataset.id }, '💡 ');
  if (요소.dataset.kind !== 'blank') {
    힌트.append(글);
    요소.closest('.mark-wrap')?.appendChild(힌트);
    return;
  }
  const 줄 = 요소.closest('p, td, li') || 요소.parentElement;
  const 칸들 = [...줄.querySelectorAll('.blank')];
  if (칸들.length > 1) 힌트.append(h('b', {}, `${['첫째', '둘째', '셋째', '넷째'][칸들.indexOf(요소)] ?? ''} 빈칸: `));
  힌트.append(글);
  let 모음 = 줄.querySelector(':scope > .hint-list');
  if (!모음) { 모음 = h('span', { class: 'hint-list' }); 줄.appendChild(모음); }
  // 빈칸 차례대로 늘어서게 한다
  const 앞 = [...모음.children].find((e) => 칸들.findIndex((k) => k.dataset.id === e.dataset.hintFor) > 칸들.indexOf(요소));
  모음.insertBefore(힌트, 앞 ?? null);
}

/** 괄호 빈칸 ( ____ ) */
export function 빈칸칸(id, 너비 = 7) {
  const 입력 = h('input', {
    class: 'blank', 'data-id': id, 'data-kind': 'blank', value: 상태.blank[id] ?? '',
    style: { width: `${너비}em` }, 'aria-label': '빈칸', autocomplete: 'off', spellcheck: 'false',
    oninput: (e) => { 상태.blank[id] = e.target.value; 저장(); 표시지우기(입력); },
  });
  return h('span', { class: 'mark-wrap' }, '( ', 입력, ' )');
}

/** 여러 가지 가운데 하나 고르기 */
export function 고르기(id, 선택지, { 작게 = false } = {}) {
  const 묶음 = h('span', { class: `choice${작게 ? ' small' : ''} mark-wrap`, 'data-id': id, 'data-kind': 'pick', role: 'radiogroup' });
  const 그리기 = () => {
    채우기(묶음, 선택지.map((c) => {
      const 값 = typeof c === 'string' ? c : c.값;
      const 글 = typeof c === 'string' ? c : c.글;
      return h('button', {
        type: 'button', class: `opt${상태.pick[id] === 값 ? ' on' : ''}`, role: 'radio', 'aria-checked': String(상태.pick[id] === 값),
        onclick: () => { 상태.pick[id] = 값; 저장(); 표시지우기(묶음); 그리기(); 묶음.dispatchEvent(new CustomEvent('pick', { bubbles: true })); },
      }, 글);
    }));
  };
  그리기();
  묶음.다시그리기 = 그리기;
  return 묶음;
}

/** 숫자 칸 (5절 표) */
export function 숫자칸(id) {
  const 입력 = h('input', {
    class: 'num', 'data-id': id, 'data-kind': 't5', value: 상태.t5[id] ?? '', inputmode: 'decimal', autocomplete: 'off', 'aria-label': '숫자',
    oninput: (e) => { 상태.t5[id] = e.target.value; 저장(); 표시지우기(입력); },
  });
  return h('span', { class: 'mark-wrap' }, 입력);
}

/** 서술 칸. 다 쓰면 예시 답을 열어 비교할 수 있다. */
export function 서술칸(key) {
  const 물음 = 서술[key];
  const 예시 = h('div', { class: 'example', hidden: true }, h('b', {}, '💬 예시 답 '), 물음.예시,
    h('div', { class: 'muted small' }, '정답이 하나가 아닙니다. 내 답과 견주어 빠진 생각이 있는지만 살펴보세요.'));
  const 단추 = h('button', {
    type: 'button', class: 'btn small',
    onclick: () => {
      if ((상태.text[key] || '').trim().length < 5) {
        안내.textContent = '먼저 내 생각을 한 문장 이상 써 보세요. 그다음에 예시 답을 열 수 있어요.';
        return;
      }
      예시.hidden = !예시.hidden;
      단추.textContent = 예시.hidden ? '💬 예시 답 보기' : '예시 답 접기';
    },
  }, '💬 예시 답 보기');
  const 안내 = h('span', { class: 'muted small' });
  return h('div', { class: 'writing' },
    h('div', { class: 'q' }, '▣ ', 물음.묻는말),
    h('textarea', {
      rows: 3, placeholder: '여기에 내 생각을 적어 보세요.', 'data-text': key,
      oninput: (e) => { 상태.text[key] = e.target.value; 저장(); 안내.textContent = ''; },
    }, 상태.text[key] ?? ''),
    h('div', { class: 'row' }, 단추, 안내),
    예시);
}

/**
 * [확인] 상자. 정답은 보여 주지 않는다 — 영역 안에서 data-id 가 붙은 칸을 찾아 ○/× 를 표시한다.
 * 해설이 있으면 틀린 칸 옆에 힌트를 띄운다.
 */
export function 확인상자(key, 영역, { 해설 = null } = {}) {
  const 결과 = h('div', { class: 'result', 'aria-live': 'polite' });

  function 표시() {
    const r = 활동채점(key, 상태);
    for (const 칸 of r.칸) {
      const 요소 = 영역.querySelector(`[data-id="${칸.id}"]`);
      if (!요소) continue;
      표시지우기(요소);
      요소.classList.add(칸.맞음 ? 'ok' : 'bad');
      if (!칸.맞음) {
        const 힌트글 = 칸.종류 === 'blank' ? 빈칸[칸.id]?.힌트 : 해설?.(칸.id);
        if (힌트글) 힌트달기(요소, 힌트글);
      }
    }
    const 다 = r.맞음 === r.전체;
    채우기(결과, h('span', { class: 다 ? 'good' : 'warn' },
      다 ? `🎉 ${r.전체}개 모두 맞았어요!` : `${r.전체}개 가운데 ${r.맞음}개 맞았어요. 빨간 칸의 💡 힌트를 보고 고쳐 보세요.`));
  }

  function 확인() {
    상태.checked[key] = true; 저장();
    표시();
  }

  const 상자 = h('div', { class: 'checkbar' },
    h('button', { type: 'button', class: 'btn primary', onclick: 확인 }, '✔ 확인'), 결과);
  // 이미 확인했던 활동은 화면을 다시 열어도 표시가 남아 있게
  if (상태.checked[key]) queueMicrotask(표시);
  return 상자;
}
