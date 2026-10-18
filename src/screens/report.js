/*! 회귀 분석 실험실 — © 2026 티쳐무 · 모든 권리 보유
 *  📄 내 활동지 — 지금까지 한 활동을 활동지 한 장으로 모아 보여 준다(보기 전용).
 *  저장은 위쪽 띠의 [💾 저장하기] 가 맡는다(savefile.js) — 이 앱 파일째 저장하고 다음 시간에 이어서 한다.
 *  선생님은 제출받은 파일을 열어 이 화면에서 그 학생의 활동을 본다.
 */
import { h, 묻기, 창 } from '../lib/ui.js';
import { 상태, 모두지우기 } from '../lib/store.js';
import { 저장하기 } from '../lib/savefile.js';
import { 직선그리기 } from '../lib/plot.js';
import { 최소제곱, 수, 식 } from '../lib/regress.js';
import { 표1, 빈칸, 변수짝, 문장, r문제, 서술, 표5 } from '../data.js';
import { 전체채점, 활동채점, 진행률, 내직선, 직선표, 나눠평가, 직접계산채점, 계산칸 } from '../grade.js';
import { 표1평면 } from './common.js';

export function 그리기(이동) {
  const 진행 = 진행률(상태);

  async function 처음부터() {
    const 예 = await 묻기('처음부터 다시 하기', '이 화면의 활동을 모두 비우고 처음부터 합니다. 이미 바탕 화면에 저장한 파일은 그대로 남아요. 비울까요?', '모두 비우기', '그만두기');
    if (!예) return;
    모두지우기();
    await 창('비웠어요', '처음 화면으로 갑니다.');
    이동('intro');
  }

  return [
    h('div', { class: 'no-print report-tools' },
      h('h1', {}, '📄 내 활동지'),
      h('div', { class: 'progress-line' }, `활동 ${진행.전체}개 가운데 ${진행.끝낸}개를 마쳤어요.`,
        h('span', { class: 'pbar' }, h('span', { style: { width: `${Math.round(진행.비율 * 100)}%` } }))),
      h('div', { class: 'tip' }, '아래는 지금까지 한 활동을 모아 본 것이에요. 저장은 ', h('b', {}, '위쪽의 [💾 저장하기]'),
        ' 로 합니다 — 활동이 담긴 이 앱이 바탕 화면에 ', h('b', {}, '회귀분석_학번_이름.html'), ' 로 저장되고, 다음 시간에 그 파일을 열면 이어서 할 수 있어요.'),
      h('div', { class: 'row' },
        h('button', { type: 'button', class: 'btn primary', onclick: () => 저장하기(() => 이동('report')) }, '💾 저장하기'),
        h('button', { type: 'button', class: 'btn danger', onclick: 처음부터 }, '🗑️ 처음부터 다시 하기'))),
    종이(),
  ];

  // ── 활동지 종이 ──────────────────────────────────────────────────
  function 종이() {
    const 채점 = 전체채점(상태);
    const 총맞음 = 채점.reduce((t, a) => t + a.맞음, 0), 총전체 = 채점.reduce((t, a) => t + a.전체, 0);
    const 오늘 = new Date();
    const 날짜 = `${오늘.getFullYear()}. ${오늘.getMonth() + 1}. ${오늘.getDate()}.`;
    return h('article', { class: 'paper' },
      h('div', { class: 'paper-head' },
        h('div', { class: 'ph-title' }, '데이터 과학 학습지'),
        h('div', { class: 'ph-info' },
          h('div', {}, `와우고등학교  학번: ${상태.student.id || '        '}   성명: ${상태.student.name || ''}`),
          h('div', {}, '• 회귀 분석 모델 — 회귀 분석 실험실 활동 기록')),
        h('div', { class: 'ph-date' }, 날짜)),

      h('h3', {}, '활동 요약'),
      h('table', { class: 'p-table' },
        h('thead', {}, h('tr', {}, h('th', {}, '활동'), h('th', {}, '맞은 칸'), h('th', {}, '비고'))),
        h('tbody', {}, 채점.map((a) => h('tr', {},
          h('td', {}, a.이름),
          h('td', { class: 'c' }, a.확인함 || a.맞음 ? `${a.맞음} / ${a.전체}` : '미완료'),
          h('td', { class: 'c' }, a.맞음 === a.전체 ? '✔' : ''))),
        h('tr', { class: 'total' }, h('td', {}, '합계'), h('td', { class: 'c' }, `${총맞음} / ${총전체}`), h('td', {}, '')))),

      절('1. 독립 변수와 종속 변수',
        빈칸줄('s1-blanks', ['영향을 주는 변수', '영향을 받는 변수', '[표1]의 독립 변수', '[표1]의 종속 변수']),
        h('table', { class: 'p-table' },
          h('thead', {}, h('tr', {}, h('th', {}, '변수 짝'), h('th', {}, '독립 변수'), h('th', {}, '종속 변수'), h('th', {}, ''))),
          h('tbody', {}, 변수짝.map((p) => {
            const 독 = 상태.pick[p.id];
            return h('tr', {}, h('td', {}, p.둘.join(' · ')), h('td', { class: 'c' }, 독 || '—'),
              h('td', { class: 'c' }, 독 ? p.둘.find((v) => v !== 독) : '—'), h('td', { class: 'c' }, 표(독, 독 === p.독립)));
          })))),

      절('2. 상관관계와 인과관계',
        빈칸줄('s2-blanks', ['함께 변하는 관계', '원인이 되는 관계']),
        h('table', { class: 'p-table' },
          h('thead', {}, h('tr', {}, h('th', {}, '문장'), h('th', {}, '내 답'), h('th', {}, ''))),
          h('tbody', {}, 문장.map((q, i) => h('tr', {}, h('td', {}, `${'①②③④⑤'[i]} ${q.글}`),
            h('td', { class: 'c' }, 상태.pick[q.id] === '상관' ? '상관관계만' : 상태.pick[q.id] === '인과' ? '인과 관계도' : '—'),
            h('td', { class: 'c' }, 표(상태.pick[q.id], 상태.pick[q.id] === q.답)))))),
        서술상자('hidden')),

      절('3. 선형 회귀 분석', ...삼절()),

      절('4. 상관관계 분석',
        빈칸줄('s4-blanks', ['x↑ y↑', 'x↑ y↓', 'r 의 최솟값', 'r 의 최댓값']),
        h('table', { class: 'p-table' },
          h('thead', {}, h('tr', {}, h('th', {}, 'r'), r문제.map((q) => h('th', {}, 수(q.r, 2))))),
          h('tbody', {},
            h('tr', {}, h('th', {}, '방향'), r문제.map((q) => h('td', { class: 'c' }, 상태.pick[`${q.id}d`] || '—', ' ', 표(상태.pick[`${q.id}d`], 상태.pick[`${q.id}d`] === q.방향)))),
            h('tr', {}, h('th', {}, '강도'), r문제.map((q) => h('td', { class: 'c' }, 상태.pick[`${q.id}s`] || '—', ' ', 표(상태.pick[`${q.id}s`], 상태.pick[`${q.id}s`] === q.강도)))))),
        h('p', {}, '실험실 도전: ', 상태.pick.ch1 ? '도전 1 성공 ✔' : '도전 1 —', ' · ', 상태.pick.ch2 ? '도전 2 성공 ✔' : '도전 2 —')),

      절('5. 오차와 평가 지표', ...오절()),

      절('6. 결정 계수(R²)',
        빈칸줄('s6-blanks', ['설명력이 높으려면 R² 가 ○ 에 가까움', '매출액 변화의 약 ○ %'])),

      절('7. 두 가지 회귀 분석', ...칠절()),

      h('p', { class: 'paper-foot' }, '© 2026 티쳐무 · 회귀 분석 실험실 — 이 활동지는 학생이 브라우저에서 한 활동을 자동으로 모은 것입니다. ○ 맞음 · × 틀림 · — 하지 않음'));
  }

  function 절(제목, ...내용) {
    return h('section', { class: 'p-sec' }, h('h3', {}, 제목), ...내용);
  }
  function 표(값, 맞음) {
    if (값 == null || 값 === '') return null; // 하지 않은 칸은 값 자리에 이미 「—」 가 있다
    return h('span', { class: `mk ${맞음 ? 'o' : 'x'}` }, 맞음 ? '○' : '×');
  }
  function 빈칸줄(key, 이름들) {
    const r = 활동채점(key, 상태);
    return h('div', { class: 'p-blanks' }, r.칸.map((c, i) => h('span', { class: 'p-blank' },
      h('span', { class: 'muted' }, `${이름들[i] ?? 빈칸[c.id]?.힌트 ?? ''}: `), h('b', {}, c.값 || '—'), ' ', 표(c.값, c.맞음))));
  }
  function 서술상자(키) {
    const 글 = (상태.text[키] || '').trim();
    return h('div', { class: 'p-write' }, h('div', { class: 'q' }, '▣ ', 서술[키].묻는말),
      h('div', { class: 'a' }, 글 || h('span', { class: 'muted' }, '(쓰지 않음)')));
  }

  function 삼절() {
    const 선 = 내직선(상태);
    const 최소 = 최소제곱(표1.x, 표1.y);
    const 평면 = 표1평면({ 폭: 480, 높이: 340, 이름표: false });
    if (상태.lsShown) 평면.층.선.appendChild(직선그리기(평면, 최소, { class: 'line-ls' }));
    if (선 && 상태.lineMoved) 평면.층.선.appendChild(직선그리기(평면, 선, { class: 'line-mine' }));
    const 표값 = 선 && 상태.lineMoved ? 직선표(선) : null;
    const 짝 = 상태.partner;
    return [
      빈칸줄('s3-blanks', ['독립 변수 1개', '독립 변수 2개 이상']),
      h('div', { class: 'p-two' },
        h('div', { class: 'p-plot' }, 평면.svg,
          h('div', { class: 'small' }, h('span', { class: 'mine-dot' }, '━'), ' 내 직선  ', 상태.lsShown ? [h('span', { class: 'ls-dot' }, '━'), ' 최소제곱 직선'] : '')),
        h('div', {},
          표값 ? h('p', {}, '내 직선: ', h('b', {}, 식(선, 2))) : h('p', { class: 'muted' }, '(직선을 긋지 않음)'),
          표값 ? h('p', {}, `오차의 합 ${수(표값.오차합, 1)} · 오차 제곱합 ${수(표값.제곱합, 1)}`) : null,
          상태.best != null ? h('p', {}, `가장 작았던 오차 제곱합: ${수(상태.best, 1)}`) : null,
          계산줄(),
          h('p', {}, `짝꿍: 오차의 합 ${짝.sum || '—'} · 오차 제곱합 ${짝.sse || '—'}`),
          h('p', {}, `더 잘 맞는 직선(○): ${상태.pick.better || '—'}`),
          상태.lsShown ? h('p', {}, `최소제곱 직선: ${식(최소, 3)} (오차 제곱합 65.9)`) : h('p', { class: 'muted' }, '(최소제곱 직선을 보지 않음)'))),
      표값 ? h('table', { class: 'p-table small' },
        h('tbody', {},
          h('tr', {}, h('th', {}, 'x'), 표1.x.map((x) => h('td', { class: 'c' }, x)), h('th', {}, '합계')),
          h('tr', {}, h('th', {}, '실젯값 y'), 표1.y.map((y) => h('td', { class: 'c' }, y)), h('td', {}, '')),
          h('tr', {}, h('th', {}, '내 예측값'), 표값.예측.map((v) => h('td', { class: 'c' }, 수(v, 1))), h('td', {}, '')),
          h('tr', {}, h('th', {}, '오차'), 표값.오차.map((v) => h('td', { class: 'c' }, 수(v, 1))), h('td', { class: 'c' }, 수(표값.오차합, 1))),
          h('tr', {}, h('th', {}, '오차²'), 표값.오차제곱.map((v) => h('td', { class: 'c' }, 수(v, 1))), h('td', { class: 'c' }, 수(표값.제곱합, 1))))) : null,
      h('p', {}, '④ 공정한 비교 기준: ', h('b', {}, 상태.pick.fair === '합' ? '오차의 합' : 상태.pick.fair === '제곱합' ? '오차 제곱합' : '—'), ' ',
        표(상태.pick.fair, 상태.pick.fair === '제곱합')),
      서술상자('fair'),
    ];
  }

  function 계산줄() {
    const r = 직접계산채점(상태);
    if (!r || !상태.lineMoved) return null;
    return h('p', {}, '🧮 직접 계산 — ',
      `x = ${계산칸.예측x} 예측값 `, h('b', {}, r.pred.값 || '—'), ' ', 표(r.pred.값, r.pred.맞음),
      `  ·  x = ${계산칸.제곱x} 오차² `, h('b', {}, r.sq.값 || '—'), ' ', 표(r.sq.값, r.sq.맞음));
  }

  function 오절() {
    const r = 활동채점('s5-table', 상태);
    const 칸 = Object.fromEntries(r.칸.map((c) => [c.id, c]));
    const 셀 = (id) => h('td', { class: 'c' }, 칸[id].값 || '—', ' ', 표(칸[id].값, 칸[id].맞음));
    return [
      h('table', { class: 'p-table' },
        h('thead', {}, h('tr', {}, ['x', '실젯값', '예측값', '오차', '|오차|', '오차²'].map((t) => h('th', {}, t)))),
        h('tbody', {},
          표5.x.map((x, i) => h('tr', {}, h('td', { class: 'c' }, x), h('td', { class: 'c' }, 표5.y[i]), 셀(`p${i}`), 셀(`e${i}`), 셀(`a${i}`), 셀(`s${i}`))),
          h('tr', {}, h('th', {}, '평균'), h('td', {}, '-'), h('td', {}, '-'), h('td', {}, '-'), 셀('avgA'), 셀('avgS')))),
      h('p', {}, 'MAE = ', h('b', {}, 칸.mae.값 || '—'), ' ', 표(칸.mae.값, 칸.mae.맞음), '    MSE = ', h('b', {}, 칸.mse.값 || '—'), ' ', 표(칸.mse.값, 칸.mse.맞음)),
      서술상자('mse'),
    ];
  }

  function 칠절() {
    const r = 활동채점('s7-table', 상태);
    const 칸 = Object.fromEntries(r.칸.map((c) => [c.id, c]));
    const 빈 = (id) => [h('b', {}, 칸[id].값 || '—'), ' ', 표(칸[id].값, 칸[id].맞음)];
    const 나눔 = 나눠평가(상태.split);
    return [
      h('table', { class: 'p-table' },
        h('thead', {}, h('tr', {}, h('th', {}, '구분'), h('th', {}, '통계적 회귀 분석'), h('th', {}, '기계학습 기반 회귀 분석'))),
        h('tbody', {},
          h('tr', {}, h('th', {}, '목표'), h('td', {}, '변수 사이의 관계를 (', 빈('t-goal1'), ')'), h('td', {}, '새 데이터의 값을 잘 (', 빈('t-goal2'), ')')),
          h('tr', {}, h('th', {}, '데이터 사용'), h('td', {}, '가진 데이터를 (', 빈('t-use1'), ') 사용'),
            h('td', {}, '(', 빈('t-use2'), ') 데이터로 모델을 만들고 (', 빈('t-use3'), ') 데이터로 성능 확인')),
          h('tr', {}, h('th', {}, '대표 평가 지표'), h('td', {}, 빈('t-met1')), h('td', {}, 빈('t-met2'))))),
      나눔 ? h('p', {}, `내가 나눈 평가 데이터: x = ${나눔.평가.map((p) => p.x).join(', ')} → 평가 MSE ${수(나눔.mse, 2)}`) : null,
      서술상자('split'),
      h('p', {}, '🎯 광고비 1,000만 원(x = 10)일 때의 매출액 — ',
        `처음 눈대중 ${상태.guess || '—'}`,
        내직선(상태) && 상태.lineMoved ? ` · 내 직선 ${수(내직선(상태).a * 10 + 내직선(상태).b, 1)}` : '',
        상태.lsShown ? ' · 최소제곱 직선 15.2 (천만 원)' : ''),
    ];
  }
}
