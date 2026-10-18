/*! 회귀 분석 실험실 — © 2026 티쳐무 · 모든 권리 보유
 *  3. 선형 회귀 분석 (p.111) — 짝꿍 활동: 내 직선을 직접 긋고 오차를 따져 본다.
 */
import { h, s, 채우기 } from '../lib/ui.js';
import { 상태, 저장 } from '../lib/store.js';
import { 직선그리기, 손잡이 } from '../lib/plot.js';
import { 최소제곱, 수, 식, 합 } from '../lib/regress.js';
import { 빈칸칸, 고르기, 확인상자, 서술칸 } from '../lib/widgets.js';
import { 표1, 학습지값 } from '../data.js';
import { 내직선, 직선표, 직접계산채점, 계산칸 } from '../grade.js';
import { 카드, 머리, 개념, 표1평면 } from './common.js';

const 수평선 = { a: 0, b: 7 }; // ȳ = 7 — 오차의 합이 0 이 되는 엉터리 직선

export function 그리기() {
  if (!상태.line) 상태.line = { p: { x: 1, y: 9 }, q: { x: 9, y: 9 } };
  const 최소 = 최소제곱(표1.x, 표1.y);
  const 보기 = { 막대: false, 정사각형: false, 수평선: false, 최소그래프: false };

  // ── 그래프 ──
  const 평면 = 표1평면({ 높이: 460 });
  const 오차층 = s('g', {});
  평면.층.아래.appendChild(오차층);
  const 선층 = s('g', {});
  평면.층.선.appendChild(선층);

  const 손 = {};
  const 움직임 = (끝) => (위치, 놓음) => {
    if (위치) { 상태.line[끝] = 위치; 상태.lineMoved = true; 계산표시지우기(); }
    if (놓음) 저장();
    새로();
  };
  손.p = 손잡이(평면, 상태.line.p, 움직임('p'));
  손.q = 손잡이(평면, 상태.line.q, 움직임('q'));
  평면.층.위.append(손.p, 손.q);

  const 식표시 = h('div', { class: 'eq' });
  const 표자리 = h('div', { class: 'table-wrap' });
  const 짝자리 = h('div', {});
  const 비교자리 = h('div', {});
  const 최소자리 = h('div', {});
  const 기록자리 = h('div', { class: 'record' });

  // ── ② 표의 노란 칸 두 개: 학생이 계산기로 직접 계산해 채운다 ──
  const 계산결과 = h('div', { class: 'result' });
  const 계산입력 = {};
  for (const 키 of ['pred', 'sq']) {
    계산입력[키] = h('input', {
      class: 'num calc', inputmode: 'decimal', value: 상태.calc[키] ?? '', placeholder: '계산',
      'aria-label': 키 === 'pred' ? `x = ${계산칸.예측x} 의 예측값` : `x = ${계산칸.제곱x} 의 오차²`,
      oninput: (e) => { 상태.calc[키] = e.target.value; 저장(); 계산표시지우기(); },
    });
  }
  function 계산표시지우기() {
    for (const 입력 of Object.values(계산입력)) 입력.classList.remove('ok', 'bad');
    채우기(계산결과);
  }
  function 계산확인() {
    const r = 직접계산채점(상태);
    if (!r) return;
    계산입력.pred.classList.add(r.pred.맞음 ? 'ok' : 'bad');
    계산입력.sq.classList.add(r.sq.맞음 ? 'ok' : 'bad');
    채우기(계산결과,
      h('div', { class: r.pred.맞음 ? 'good' : 'warn' }, r.pred.맞음 ? '✔ ' : '✘ ', `x = ${계산칸.예측x} 의 예측값: `,
        r.pred.맞음 ? '맞았어요!' : ['내 직선의 식에 x = ', 계산칸.예측x, ' 를 넣어 보세요. (기울기 × ', 계산칸.예측x, ' + 절편)']),
      h('div', { class: r.sq.맞음 ? 'good' : 'warn' }, r.sq.맞음 ? '✔ ' : '✘ ', `x = ${계산칸.제곱x} 의 오차²: `,
        r.sq.맞음 ? '맞았어요!' : `바로 위 칸의 오차(${r.sq.보이는오차})를 제곱해 보세요. 음수도 제곱하면 양수가 돼요.`));
  }

  function 새로() {
    const 선 = 내직선(상태);
    채우기(선층);
    채우기(오차층);
    if (보기.수평선) 선층.appendChild(직선그리기(평면, 수평선, { class: 'line-gray' }));
    // 최소제곱 직선(정답)은 짝꿍 활동 그래프에 그리지 않는다 — ⑤ 의 [그래프로 보기] 에서만 보여 준다.
    if (!선) { 채우기(식표시, '두 손잡이의 x 가 같으면 직선을 만들 수 없어요. 조금 옮겨 주세요.'); return; }
    선층.appendChild(직선그리기(평면, 선, { class: 'line-mine' }));
    const 표 = 직선표(선);

    // 오차 막대와 오차² 정사각형
    표1.x.forEach((x, i) => {
      const y = 표1.y[i], p = 표.예측[i];
      const 위쪽 = y >= p;
      if (보기.정사각형) {
        const 변 = Math.abs(평면.sy(y) - 평면.sy(p));
        오차층.appendChild(s('rect', { x: 평면.sx(x), y: Math.min(평면.sy(y), 평면.sy(p)), width: 변, height: 변, class: 위쪽 ? 'sq plus' : 'sq minus' }));
      }
      if (보기.막대) 오차층.appendChild(s('line', { x1: 평면.sx(x), x2: 평면.sx(x), y1: 평면.sy(y), y2: 평면.sy(p), class: 위쪽 ? 'err plus' : 'err minus' }));
    });

    // 최소 기록 — 아무리 해도 65.9 아래로는 못 내려간다
    if (상태.lineMoved && (상태.best == null || 표.제곱합 < 상태.best)) { 상태.best = 표.제곱합; 저장(); }

    채우기(식표시, h('span', { class: 'mine-dot' }, '●'), ' 내 직선: ', h('b', {}, 식(선, 2)),
      '   오차의 합 ', h('b', {}, 수(표.오차합, 1)), '   오차 제곱합 ', h('b', {}, 수(표.제곱합, 1)));
    채우기(기록자리, 상태.lineMoved
      ? ['🏁 지금까지 내 최고 기록(가장 작은 오차 제곱합): ', h('b', {}, 수(상태.best, 1)),
        상태.lsShown ? `  — 최소제곱 직선은 ${학습지값.최소오차제곱합}. 이보다 작아질 수는 없어요!` : '']
      : '✋ 아직 직선을 움직이지 않았어요. 동그란 손잡이 두 개를 끌어 보세요.');

    // ② 표
    채우기(표자리, h('table', { class: 'grid-table center' },
      h('thead', {}, h('tr', {}, h('th', {}, 'x'), 표1.x.map((x) => h('th', {}, x)), h('th', {}, '합계'))),
      h('tbody', {},
        h('tr', {}, h('th', {}, '실젯값 y'), 표1.y.map((y) => h('td', {}, y)), h('td', {}, '')),
        h('tr', {}, h('th', {}, '내 예측값'), 표.예측.map((v, i) => 표1.x[i] === 계산칸.예측x ? h('td', { class: 'calc-cell' }, 계산입력.pred) : h('td', {}, 수(v, 1))), h('td', {}, '')),
        h('tr', {}, h('th', {}, '오차'), 표.오차.map((v) => h('td', { class: v >= 0 ? 'plus-t' : 'minus-t' }, (v > 0 ? '+' : '') + 수(v, 1))), h('td', { class: 'sum' }, 수(표.오차합, 1))),
        h('tr', {}, h('th', {}, '오차²'), 표.오차제곱.map((v, i) => 표1.x[i] === 계산칸.제곱x ? h('td', { class: 'calc-cell' }, 계산입력.sq) : h('td', {}, 수(v, 1))), h('td', { class: 'sum' }, 수(표.제곱합, 1))))),
    h('p', { class: 'muted small' }, '표의 값은 소수 첫째 자리까지 반올림해 보여 줍니다. 합계는 반올림하기 전 값으로 셈했어요.'));

    // ③ 짝꿍과 비교
    짝비교(표);
    // ④ 비교 기준 실험
    기준비교(표);
    // ⑤ 최소제곱 직선
    최소비교(표);
  }

  // ③ 짝꿍 표 — 짝꿍 값은 직접 받아 적는다
  const 짝입력 = (키) => h('input', {
    class: 'num', inputmode: 'decimal', value: 상태.partner[키], placeholder: '받아 적기',
    oninput: (e) => { 상태.partner[키] = e.target.value; 저장(); 짝판정(); },
  });
  const 짝판정글 = h('div', { class: 'result' });
  const 더나은 = 고르기('better', ['나', '짝꿍'], { 작게: true });
  더나은.addEventListener('pick', () => 짝판정());
  let 지금표 = null;
  function 짝비교(표) {
    지금표 = 표;
    if (짝자리.childElementCount === 0) {
      채우기(짝자리, h('table', { class: 'grid-table center' },
        h('thead', {}, h('tr', {}, h('th', {}, '구분'), h('th', {}, '나'), h('th', {}, '짝꿍'))),
        h('tbody', {},
          h('tr', {}, h('th', {}, '오차의 합'), h('td', { id: 'me-sum' }), h('td', {}, 짝입력('sum'))),
          h('tr', {}, h('th', {}, '오차 제곱합'), h('td', { id: 'me-sse' }), h('td', {}, 짝입력('sse'))),
          h('tr', {}, h('th', {}, '더 잘 맞는 직선 (○)'), h('td', { colspan: 2 }, 더나은)))),
      짝판정글);
    }
    짝자리.querySelector('#me-sum').textContent = 수(표.오차합, 1);
    짝자리.querySelector('#me-sse').textContent = 수(표.제곱합, 1);
    짝판정();
  }
  function 짝판정() {
    const 짝 = Number(String(상태.partner.sse).replace(/[−–]/g, '-'));
    if (!지금표 || 상태.partner.sse === '' || !Number.isFinite(짝)) {
      채우기(짝판정글, h('span', { class: 'muted' }, '짝꿍의 오차 제곱합을 받아 적으면 누구 직선이 더 잘 맞는지 확인해 줄게요.'));
      return;
    }
    const 답 = 지금표.제곱합 <= 짝 ? '나' : '짝꿍';
    if (!상태.pick.better) { 채우기(짝판정글, h('span', { class: 'muted' }, '더 잘 맞는 직선에 ○ 를 골라 보세요.')); return; }
    채우기(짝판정글, 상태.pick.better === 답
      ? h('span', { class: 'good' }, `👍 맞아요. 오차 제곱합이 더 작은 「${답}」의 직선이 더 잘 맞습니다.`)
      : h('span', { class: 'warn' }, `🤔 오차 제곱합을 다시 견주어 보세요. (나 ${수(지금표.제곱합, 1)} · 짝꿍 ${짝})`));
  }

  // ④ 오차의 합 vs 오차 제곱합 — 수평선 y = 7 과 견준다
  const 수평표 = 직선표(수평선);
  function 기준비교(표) {
    채우기(비교자리, h('table', { class: 'grid-table center' },
      h('thead', {}, h('tr', {}, h('th', {}, '직선'), h('th', {}, '오차의 합'), h('th', {}, '오차 제곱합'))),
      h('tbody', {},
        h('tr', {}, h('td', {}, '✏️ 내 직선'), h('td', {}, 수(표.오차합, 1)), h('td', {}, 수(표.제곱합, 1))),
        h('tr', {}, h('td', {}, '➖ y의 평균값(7)인 수평선'), h('td', { class: 'hl' }, 수(수평표.오차합, 1)), h('td', {}, 수(수평표.제곱합, 1))))),
    h('p', { class: 'small' }, 'y의 평균값(7)을 지나는 수평선은 점들의 기울어진 모양을 전혀 따라가지 못하는데도 ',
      h('b', {}, '오차의 합이 0'), ' 이다. ①의 「y의 평균값(7) 표시하기」를 켜고 그래프에서 확인해 보세요.'));
  }

  // ⑤ 최소제곱 직선과 견주기
  function 최소비교(표) {
    if (!상태.lsShown) {
      채우기(최소자리, h('button', {
        type: 'button', class: 'btn primary', disabled: !상태.lineMoved,
        onclick: () => { 상태.lsShown = true; 저장(); 새로(); },
      }, '📈 최소제곱 직선 보기'),
      h('span', { class: 'muted small' }, 상태.lineMoved ? '  내 직선을 다 그었으면 눌러 보세요.' : '  먼저 내 직선을 그어야 열립니다.'));
      return;
    }
    const 짝 = Number(String(상태.partner.sse).replace(/[−–]/g, '-'));
    const 값들 = [
      { 이름: '나', 값: 표.제곱합, 클래스: 'bar-mine' },
      ...(상태.partner.sse !== '' && Number.isFinite(짝) ? [{ 이름: '짝꿍', 값: 짝, 클래스: 'bar-partner' }] : []),
      { 이름: '최소제곱', 값: 학습지값.최소오차제곱합, 클래스: 'bar-ls' },
    ];
    const 최대 = Math.max(...값들.map((v) => v.값), 1);
    let 누가 = '';
    if (값들.length === 3) {
      const 차나 = Math.abs(값들[0].값 - 65.9), 차짝 = Math.abs(값들[1].값 - 65.9);
      누가 = 차나 === 차짝 ? '나와 짝꿍이 똑같이 가까웠어요!' : `${차나 < 차짝 ? '「나」' : '「짝꿍」'}의 직선이 65.9 에 더 가까웠어요.`;
    }
    채우기(최소자리,
      h('div', { class: 'eq ls' }, h('span', { class: 'ls-dot' }, '●'), ' 최소제곱 직선: ', h('b', {}, 식(최소, 3)), '   오차의 합 ', h('b', {}, 수(합(직선표(최소).오차), 1)), '   오차 제곱합 ', h('b', {}, 수(직선표(최소).제곱합, 1))),
      h('div', { class: 'bars' }, 값들.map((v) => h('div', { class: 'bar-row' },
        h('span', { class: 'bar-name' }, v.이름),
        h('span', { class: `bar ${v.클래스}`, style: { width: `${Math.max(2, (v.값 / 최대) * 100)}%` } }),
        h('span', { class: 'bar-val' }, 수(v.값, 1))))),
      h('button', { type: 'button', class: 'btn', onclick: () => { 보기.최소그래프 = !보기.최소그래프; 새로(); } },
        보기.최소그래프 ? '📊 그래프 접기' : '📊 최소제곱 직선을 그래프로 보기'),
      보기.최소그래프 ? 최소그래프(최소) : null,
      누가 ? h('p', { class: 'good' }, '🏆 ', 누가) : h('p', { class: 'muted small' }, '짝꿍의 오차 제곱합을 ③ 에 적으면 누가 더 가까웠는지 알려 줄게요.'),
      h('p', { class: 'small' }, '이제 「0. 문제 상황」의 답(광고비 1,000만 원일 때의 매출액)이 열렸어요.'));
  }

  const 켜기 = (키, 글) => h('label', { class: 'toggle' },
    h('input', { type: 'checkbox', checked: 보기[키], onchange: (e) => { 보기[키] = e.target.checked; 새로(); } }), ' ', 글);

  const 빈칸영역 = 개념(
    h('p', {}, '- ', h('b', {}, '선형 회귀 분석'), ': 변수 사이의 관계를 직선으로 나타내어 데이터를 대표하는 하나의 선을 찾는 방법'),
    h('p', { class: 'formula' }, 'y = ax + b'),
    h('p', {}, '- x: 독립 변수,  y: 종속 변수,  a: 기울기,  b: 절편(상수항)'),
    // 「-」 를 따로 떼어 두 줄과 힌트가 같은 자리에서 시작하게 한다(글꼴이 바뀌어도 줄이 맞는다)
    h('div', { class: 'dash-item' }, h('span', { class: 'dash' }, '-'),
      h('div', {},
        h('p', {}, '독립 변수가 1개이면 ', 빈칸칸('l-simple', 6), ' 선형 회귀,'),
        h('p', {}, '2개 이상이면 ', 빈칸칸('l-multi', 6), ' 선형 회귀'))));

  const 공정영역 = h('div', { class: 'row' }, h('span', {}, '무엇으로 비교해야 공정할까? '),
    고르기('fair', [{ 값: '합', 글: '오차의 합' }, { 값: '제곱합', 글: '오차 제곱합' }]));

  const 화면 = [
    머리('3', '선형 회귀 분석', 'p.111'),
    카드('개념 채우기', 빈칸영역, 확인상자('s3-blanks', 빈칸영역)),
    카드('▣ 어떤 직선이 가장 좋은 직선일까?',
      h('p', {}, '[표1]의 점 9개를 모두 지나는 직선은 없다. 사람마다 눈대중으로 그린 직선도 조금씩 다르다. 그래서 ',
        h('b', {}, '‘가장 좋은 직선’을 고르는 기준'), '이 필요하다.')),
    카드('▣ [짝꿍 활동] ① 누구의 직선이 더 잘 맞을까?',
      h('p', {}, '짝꿍과 상의하지 말고, ', h('b', {}, '동그란 손잡이 두 개를 끌어'), ' 데이터를 가장 잘 대표한다고 생각하는 직선을 그어 보자.'),
      h('div', { class: 'plot-box' }, 평면.svg),
      식표시,
      h('div', { class: 'toggles' }, 켜기('막대', '오차 막대 보기'), 켜기('정사각형', '오차² 정사각형 보기'), 켜기('수평선', 'y의 평균값(7) 표시하기')),
      h('p', { class: 'small' }, h('b', {}, '오차 = 실젯값 − 예측값'), ' (점이 직선보다 위에 있으면 ', h('span', { class: 'plus-t' }, '+ 초록'), ', 아래에 있으면 ', h('span', { class: 'minus-t' }, '− 빨강'), ')'),
      기록자리),
    카드('② 내 직선의 예측값 · 오차 · 오차²',
      h('p', { class: 'muted' }, '직선을 움직이면 표가 바로 바뀝니다.'),
      h('div', { class: 'tip' }, '🧮 ', h('b', {}, '노란 칸 두 개는 계산기로 직접 계산해 채워 보세요.'),
        ` x = ${계산칸.예측x} 의 예측값은 내 직선의 식에 x = ${계산칸.예측x} 를 넣어서, x = ${계산칸.제곱x} 의 오차²는 그 위 칸의 오차를 제곱해서 구합니다. (소수 첫째 자리까지)`),
      표자리,
      h('div', { class: 'checkbar' }, h('button', { type: 'button', class: 'btn primary', onclick: 계산확인 }, '✔ 계산 확인'), 계산결과,
        h('span', { class: 'muted small' }, '직선을 움직이면 답도 달라지니 다시 계산해야 해요.'))),
    카드('③ 짝꿍과 결과를 바꾸어 보고 비교해 보자', 짝자리),
    카드('④ 오차의 합과 오차 제곱합 중 무엇으로 비교해야 공정할까?', 비교자리, 공정영역, 확인상자('s3-fair', 공정영역), 서술칸('fair')),
    h('div', { class: 'banner' }, h('b', {}, '최소제곱법'), ': 오차 제곱의 합이 가장 작아지는 직선을 고르는 방법'),
    카드('⑤ 최소제곱법으로 구한 직선과 견주어 보자',
      h('p', {}, '최소제곱법으로 구한 직선의 오차 제곱합은 약 ', h('b', {}, '65.9'), '이다. 어떤 직선을 그어도 이보다 작아질 수는 없다. 나와 짝꿍 중 누가 이 값에 더 가까웠을까?'),
      최소자리),
  ];
  새로();
  return 화면;
}

/** ⑤ 최소제곱 직선 그래프 (학습지의 그림처럼 점 + 빨간 직선 + 식) */
function 최소그래프(최소) {
  const 평면 = 표1평면({ 높이: 420 });
  평면.층.선.appendChild(직선그리기(평면, 최소, { class: 'line-ls' }));
  // 식은 점이 없는 왼쪽 위 빈자리에 둔다(점·이름표와 겹치지 않게)
  평면.층.위.appendChild(s('text', { x: 평면.sx(0.3), y: 평면.sy(18.6), class: 'line-label' }, 식(최소, 3)));
  // 점마다 직선까지의 오차 막대도 함께
  표1.x.forEach((x, i) => {
    const p = 최소.a * x + 최소.b;
    평면.층.아래.appendChild(s('line', { x1: 평면.sx(x), x2: 평면.sx(x), y1: 평면.sy(표1.y[i]), y2: 평면.sy(p), class: 표1.y[i] >= p ? 'err plus' : 'err minus' }));
  });
  return h('div', { class: 'plot-box ls-plot' }, 평면.svg,
    h('p', { class: 'small center' }, '빨간 직선이 오차 제곱합(65.9)을 가장 작게 만드는 직선이에요. 초록·빨강 막대가 각 점의 오차입니다.'));
}
