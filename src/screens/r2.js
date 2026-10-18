/*! 회귀 분석 실험실 — © 2026 티쳐무 · 모든 권리 보유
 *  6. 결정 계수(R²) (p.113)
 *  「평균으로 짐작할 때 틀린 정도가, 직선을 쓰면 얼마나 줄어드는가」 세 걸음으로 푼다.
 *  막대 색은 수업 슬라이드와 같게 — 주황: 전체 변동(SST) · 초록: 설명된 변동(ESS) · 파랑: 설명 못 한 변동(RSS)
 */
import { h, s, 채우기 } from '../lib/ui.js';
import { 직선그리기 } from '../lib/plot.js';
import { 최소제곱, 변동나누기, 상관계수, 수, 식 } from '../lib/regress.js';
import { 빈칸칸, 확인상자 } from '../lib/widgets.js';
import { 표1 } from '../data.js';
import { 카드, 머리, 개념, 표1평면 } from './common.js';

// 처음 고른 점 — 평균에서 5 떨어져 있는데 직선이 4.9 를 맞힌다(가장 깔끔한 예)
const 첫점 = 8;

export function 그리기() {
  const 선 = 최소제곱(표1.x, 표1.y);
  const 변 = 변동나누기(표1.x, 표1.y, 선);
  const r2 = 변.ESS / 변.SST;
  const 상태 = { 걸음: 1, 고른x: 첫점 };

  // ── 그래프 ──
  const 평면 = 표1평면({ 높이: 460, 이름표: false });
  const 막대층 = s('g', {});
  평면.층.아래.appendChild(막대층);
  const 선층 = s('g', {});
  평면.층.선.appendChild(선층);
  const 글층 = s('g', {});
  평면.층.위.appendChild(글층);
  const 칸폭 = 평면.sx(1) - 평면.sx(0);

  // 점을 누르면 그 점을 자세히 본다 — 손가락으로 누르기 쉽게 세로 띠 전체를 누를 자리로
  표1.x.forEach((x) => {
    평면.층.위.appendChild(s('rect', {
      x: 평면.sx(x) - 칸폭 / 2, y: 평면.sy(20), width: 칸폭, height: 평면.sy(0) - 평면.sy(20),
      class: 'col-hit', onclick: () => { 상태.고른x = x; 새로(); },
    }));
  });

  const 단계줄 = h('div', { class: 'steps' });
  const 점설명 = h('div', { class: 'point-detail' });
  const 합설명 = h('div', {});

  function 새로() {
    채우기(막대층); 채우기(선층); 채우기(글층);
    const 두번째 = 상태.걸음 >= 2;
    // 고른 점의 세로 띠
    막대층.appendChild(s('rect', { x: 평면.sx(상태.고른x) - 칸폭 / 2, y: 평면.sy(20), width: 칸폭, height: 평면.sy(0) - 평면.sy(20), class: 'col-pick' }));
    선층.appendChild(직선그리기(평면, { a: 0, b: 변.평균 }, { class: 'line-mean' }));
    글층.appendChild(s('text', { x: 평면.sx(0.15), y: 평면.sy(변.평균) - 8, class: 'mean-label' }, '평균 7'));
    if (두번째) {
      선층.appendChild(직선그리기(평면, 선, { class: 'line-fit' }));
      글층.appendChild(s('text', { x: 평면.sx(0.3), y: 평면.sy(18.6), class: 'fit-label' }, 식(선, 3)));
    }
    const 틈 = 칸폭 * 0.16;
    for (const p of 변.점들) {
      const X = 평면.sx(p.x);
      // 주황: 평균 → 점 (평균으로 짐작했을 때 틀린 만큼)
      막대층.appendChild(s('line', { x1: 두번째 ? X - 틈 : X, x2: 두번째 ? X - 틈 : X, y1: 평면.sy(변.평균), y2: 평면.sy(p.y), class: 'bar-sst' }));
      if (두번째) {
        // 초록: 평균 → 직선 (직선이 맞힌 만큼) · 파랑: 직선 → 점 (그래도 남은 오차)
        막대층.appendChild(s('line', { x1: X + 틈, x2: X + 틈, y1: 평면.sy(변.평균), y2: 평면.sy(p.예측값), class: 'bar-ess grow' }));
        막대층.appendChild(s('line', { x1: X, x2: X, y1: 평면.sy(p.예측값), y2: 평면.sy(p.y), class: 'bar-rss grow' }));
      }
    }

    채우기(단계줄,
      단계단추(1, '① 광고비를 모른다면?', '평균으로 짐작'),
      단계단추(2, '② 광고비를 안다면?', '직선으로 짐작'),
      단계단추(3, '③ 얼마나 줄었나?', '결정 계수'));
    점자세히();
    합보기();
  }

  function 단계단추(n, 제목, 부제) {
    return h('button', { type: 'button', class: `step${상태.걸음 === n ? ' on' : ''}${상태.걸음 > n ? ' done' : ''}`, onclick: () => { 상태.걸음 = n; 새로(); } },
      h('b', {}, 제목), h('span', {}, 부제));
  }

  function 점자세히() {
    const p = 변.점들.find((q) => q.x === 상태.고른x);
    const 부호 = (v) => (v > 0.005 ? '+' : '') + 수(v, 2);
    const 줄 = (클래스, 이름, 값, 풀이) => h('div', { class: `pd-row ${클래스}` }, h('span', { class: 'pd-name' }, 이름), h('b', {}, 부호(값)), h('span', { class: 'pd-why' }, 풀이));
    const 넘침 = 상태.걸음 >= 2 && Math.abs(p.설명) > Math.abs(p.전체) + 0.005;
    const 반대 = 상태.걸음 >= 2 && !넘침 && p.설명 * p.전체 < -0.0001;
    채우기(점설명,
      h('div', { class: 'pd-title' }, `🔎 점 (${p.x}, ${p.y}) 자세히 보기`, h('span', { class: 'muted small' }, ' — 그래프의 다른 점을 눌러 보세요')),
      줄('o', '🟧 평균에서 떨어진 정도', p.전체, `실젯값 ${p.y} − 평균 7`),
      상태.걸음 >= 2 ? [
        줄('g', '🟩 직선이 맞힌 부분', p.설명, `예측값 ${수(p.예측값, 2)} − 평균 7`),
        줄('b', '🟦 그래도 남은 부분(오차)', p.남은, `실젯값 ${p.y} − 예측값 ${수(p.예측값, 2)}`),
        h('div', { class: 'pd-sum' }, `🟧 ${부호(p.전체)} = 🟩 ${부호(p.설명)} + 🟦 ${부호(p.남은)}`),
        넘침 || 반대
          ? h('p', { class: 'small warn' }, '⚠ 이 점은 직선이 평균보다 오히려 반대쪽으로 더 짐작했어요(초록이 주황보다 길거나 방향이 달라요). 그래도 ＋·− 를 생각해 더하면 주황 = 초록 + 파랑 이 맞아요.')
          : h('p', { class: 'small good' }, Math.abs(p.남은) < 0.5 ? '👍 평균으로는 많이 틀렸는데, 직선은 거의 다 맞혔어요!' : '평균만 쓸 때보다 남은 오차(파랑)가 줄었어요.'),
      ] : h('p', { class: 'small' }, '광고비를 모르면 9개월 모두 평균 7 로 짐작할 수밖에 없어요. 주황 막대만큼 틀립니다.'));
  }

  function 합보기() {
    const 비율 = Math.round(r2 * 100);
    if (상태.걸음 === 1) {
      채우기(합설명, h('div', { class: 'sum-box' },
        h('p', {}, '주황 막대 9개를 ', h('b', {}, '제곱해서 모두 더하면'), ' →  ', h('b', { class: 'o-t' }, 수(변.SST, 1))),
        h('p', { class: 'small muted' }, '이것이 매출액이 들쭉날쭉한 정도 전체(전체 변동)예요. 이제 ② 를 눌러 광고비를 써 봅시다.')));
    } else if (상태.걸음 === 2) {
      채우기(합설명, h('div', { class: 'sum-box' },
        h('p', {}, '파랑 막대(오차) 9개를 제곱해서 모두 더하면 → ', h('b', { class: 'b-t' }, 수(변.RSS, 1)),
          h('span', { class: 'small muted' }, '  (3절의 최소 오차 제곱합과 같은 값!)')),
        h('p', {}, '틀린 정도가 ', h('b', { class: 'o-t' }, 수(변.SST, 1)), ' → ', h('b', { class: 'b-t' }, 수(변.RSS, 1)), ' 로 줄었어요. 얼마나 줄었는지는 ③ 에서.')));
    } else {
      채우기(합설명, h('div', { class: 'sum-box' },
        h('div', { class: 'stack' },
          h('div', { class: 'stack-ess', style: { width: `${(변.ESS / 변.SST) * 100}%` } }, `🟩 설명된 ${수(변.ESS, 1)}`),
          h('div', { class: 'stack-rss', style: { width: `${(변.RSS / 변.SST) * 100}%` } }, `🟦 ${수(변.RSS, 1)}`)),
        h('div', { class: 'stack-total' }, `🟧 전체 ${수(변.SST, 1)}`),
        h('p', { class: 'formula' }, `R² = 🟩 ÷ 🟧 = ${수(변.ESS, 1)} ÷ ${수(변.SST, 1)} ≈ ${수(r2, 2)}`),
        h('p', {}, '→ 매출액이 들쭉날쭉한 정도 가운데 ', h('b', {}, `약 ${비율}%`), ' 를 광고비(직선)로 설명했다는 뜻이에요.'),
        h('p', { class: 'small muted' }, '⚠ 점 하나에서는 막대 길이로 주황 = 초록 + 파랑 이 맞지만, 제곱한 값은 9개를 모두 더했을 때만 ',
          `${수(변.SST, 1)} = ${수(변.ESS, 1)} + ${수(변.RSS, 1)}`, ' 이 맞아요(최소제곱 직선이라서 가능해요).')));
    }
  }

  새로();

  const 빈칸영역 = 개념(
    h('p', {}, '- 결정 계수가 ', 빈칸칸('d-one', 3), '에 가까울수록 회귀 분석 모델의 설명력이 높다.'),
    h('p', {}, '- 이 회귀 직선은 매출액 변화의 약 ', 빈칸칸('d-pct', 4), '%를 광고비로 설명한다.'));
  const r = 상관계수(표1.x, 표1.y);

  return [
    머리('6', '결정 계수(R²)', 'p.113'),
    카드('결정 계수란?',
      개념(
        h('p', {}, '- 결정 계수(R²)는 회귀 모델에서 독립 변수가 종속 변수를 얼마나 설명하는지 나타내는 지표로, 0에서 1 사이의 값이다.'),
        h('p', {}, '- 결정 계수(R²)는 종속 변수의 ', h('b', { class: 'o-t' }, '전체 변동'), ' 중에서 회귀 모형(독립 변수)에 의해 ',
          h('b', { class: 'g-t' }, '설명되는 변동'), '의 비율이다.'),
        h('p', { class: 'formula' }, 'R² = 설명되는 변동 ÷ 전체 변동')),
      h('p', { class: 'lead' }, '💭 한 줄로 말하면 — ', h('b', {}, '평균으로만 짐작할 때 틀린 정도가, 직선(회귀모델)을 쓰면 얼마나 줄어드는가'), ' 를 0~1 로 나타낸 값이에요.')),
    카드('🧪 세 걸음으로 이해하기',
      단계줄,
      h('div', { class: 'two-col' },
        h('div', { class: 'plot-box' }, 평면.svg,
          h('div', { class: 'legend center' },
            h('span', { class: 'lg o' }, '━'), ' 평균에서 떨어진 정도  ',
            h('span', { class: 'lg g' }, '━'), ' 직선이 맞힌 부분  ',
            h('span', { class: 'lg b' }, '━'), ' 남은 오차')),
        h('div', {}, 점설명, 합설명))),
    카드('▣ [표1]로 구한 회귀 직선의 결정 계수는 약 0.71이다. 빈칸을 채워 해석해 보자.',
      빈칸영역, 확인상자('s6-blanks', 빈칸영역),
      h('details', { class: 'deeper' }, h('summary', {}, '🔬 더 깊이 — 이름과 다른 계산법'),
        h('p', {}, '🟧 전체 변동 = SST(Total Sum of Squares), 🟩 설명된 변동 = ESS(Explained Sum of Squares), 🟦 설명 못 한 변동 = RSS(Residual Sum of Squares)'),
        h('p', { class: 'formula' }, 'SST = ESS + RSS'),
        h('p', {}, '그래서 R² = ESS ÷ SST 는 ', `1 − RSS ÷ SST = 1 − ${수(변.RSS, 1)} ÷ ${수(변.SST, 0)} ≈ ${수(r2, 2)}`, ' 로도 셀 수 있어요.'),
        h('p', {}, `직선 하나로 설명할 때는 상관관계 계수 r 을 제곱한 값과도 같아요: r = ${수(r, 3)}, r² ≈ ${수(r * r, 2)}`))),
  ];
}
