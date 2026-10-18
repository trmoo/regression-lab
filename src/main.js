/*! 회귀 분석 실험실 — © 2026 티쳐무 · 모든 권리 보유
 *  학교 수업 목적으로만 이용해 주세요. 자세한 내용은 LICENSE 파일을 보세요.
 *  앱의 뼈대: 머리띠 · 화면 차례 · 주소 해시(#line) · 이전/다음 단추.
 */
import './style.css';
import { h, 채우기, 화면시작, 푸터 } from './lib/ui.js';
import { 상태, 저장, 저장안됨, 모두지우기 } from './lib/store.js';
import { 저장하기, 본인확인, 가린이름 } from './lib/savefile.js';
import { 화면목록 } from './data.js';
import { 진행률 } from './grade.js';
import * as intro from './screens/intro.js';
import * as vars from './screens/var.js';
import * as cause from './screens/cause.js';
import * as line from './screens/line.js';
import * as corr from './screens/corr.js';
import * as error from './screens/error.js';
import * as r2 from './screens/r2.js';
import * as two from './screens/two.js';
import * as report from './screens/report.js';

const 화면들 = { intro, var: vars, cause, line, corr, error, r2, two, report };

const 앱 = document.getElementById('app');
const 탭줄 = h('nav', { class: 'tabs no-print', 'aria-label': '화면 차례' });
const 진행막대 = h('span', { class: 'pbar' }, h('span', {}));
const 본문 = h('main', { class: 'content' });
const 아래줄 = h('div', { class: 'screen-nav no-print' });

// 위쪽 띠 — 어느 화면에서든 [💾 저장하기] 를 바로 누를 수 있다
const 학생표시 = h('span', { class: 'who' });
const 저장표시 = h('span', { class: 'save-state' });
앱.append(
  h('header', { class: 'app-header no-print' },
    h('div', { class: 'brand' }, '📈 회귀 분석 실험실', h('span', { class: 'sub' }, '데이터 과학 · 회귀 분석 모델 (p.110~113)')),
    h('div', { class: 'head-right' }, 진행막대, 학생표시, 저장표시,
      h('button', { type: 'button', class: 'btn head-save', title: '지금까지 한 활동을 이 앱 파일째 바탕 화면에 저장합니다', onclick: () => 저장하기(머리갱신) }, '💾 저장하기'))),
  탭줄, 본문, 아래줄, 푸터());

/** 위쪽 띠의 학번·이름과 저장 상태 */
function 머리갱신() {
  const 학생 = 상태.student;
  학생표시.textContent = 학생.id || 학생.name ? `${학생.id} ${가린이름(학생.name)}` : '';
  const 때 = (ms) => { const d = new Date(ms); return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`; };
  if (!상태.savedAt) { 저장표시.textContent = '아직 저장 안 함'; 저장표시.className = 'save-state warn'; }
  else if (저장안됨()) { 저장표시.textContent = `저장 뒤 바뀜 (${때(상태.savedAt)} 저장)`; 저장표시.className = 'save-state warn'; }
  else { 저장표시.textContent = `✔ ${때(상태.savedAt)} 저장함`; 저장표시.className = 'save-state'; }
}

function 지금화면() {
  const id = location.hash.replace('#', '');
  return 화면들[id] ? id : 'intro';
}

export function 이동(id) {
  if (location.hash !== `#${id}`) location.hash = id;
  else 그리기();
}

function 그리기() {
  화면시작();
  const id = 지금화면();
  if (!상태.visited[id]) { 상태.visited[id] = true; 저장({ 조용히: true }); }
  채우기(탭줄, 화면목록.map((m) => h('a', {
    href: `#${m.id}`, class: `tab${m.id === id ? ' on' : ''}${상태.visited[m.id] ? ' seen' : ''}${m.id === 'report' ? ' report' : ''}`,
  }, h('span', { class: 'tn' }, m.번호), ' ', m.이름)));
  채우기(본문, 화면들[id].그리기(이동));
  const 순 = 화면목록.findIndex((m) => m.id === id);
  const 앞 = 화면목록[순 - 1], 뒤 = 화면목록[순 + 1];
  채우기(아래줄,
    앞 ? h('button', { type: 'button', class: 'btn', onclick: () => 이동(앞.id) }, `◀ ${앞.번호}. ${앞.이름}`) : h('span'),
    뒤 ? h('button', { type: 'button', class: 'btn primary', onclick: () => 이동(뒤.id) }, `${뒤.번호 === '📄' ? '' : `${뒤.번호}. `}${뒤.이름} ▶`) : h('span'));
  진행갱신();
  window.scrollTo(0, 0);
}

function 진행갱신() {
  머리갱신();
  const p = 진행률(상태);
  진행막대.firstChild.style.width = `${Math.round(p.비율 * 100)}%`;
  진행막대.title = `활동 ${p.전체}개 중 ${p.끝낸}개 완료`;
}
// 무엇이든 고치면 진행 막대를 다시 잰다
document.addEventListener('input', 진행갱신);
document.addEventListener('click', () => setTimeout(진행갱신, 0));

window.addEventListener('hashchange', 그리기);
// 저장하지 않은 것이 있으면 창을 닫기 전에 브라우저가 한 번 묻게 한다
window.addEventListener('beforeunload', (e) => { if (저장안됨()) { e.preventDefault(); e.returnValue = ''; } });
그리기();

// 저장 파일을 열었으면 본인 것인지 먼저 묻는다 — 아니라면 처음부터
본인확인(() => { 모두지우기(); 이동('intro'); 그리기(); });
