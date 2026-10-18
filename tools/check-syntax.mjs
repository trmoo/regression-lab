/*! 회귀 분석 실험실 — © 2026 티쳐무 · 모든 권리 보유
 *  소스 전수 검사. `npm test` 는 화면 파일(DOM)을 다 부르지 않으므로
 *  괄호 하나 빠진 것이 빌드에서야 터지지 않게 여기서 파일마다 본다.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, relative } from 'node:path';

const 뿌리 = process.cwd();
const 잘못 = [];
function 모으기(폴더, 모음 = []) {
  for (const 이름 of readdirSync(폴더)) {
    const 길 = join(폴더, 이름);
    if (statSync(길).isDirectory()) 모으기(길, 모음);
    else if (/\.(m?js|css)$/.test(이름)) 모음.push(길);
  }
  return 모음;
}
const 소스들 = [...모으기(join(뿌리, 'src')), ...모으기(join(뿌리, 'test')), ...모으기(join(뿌리, 'tools')), join(뿌리, 'vite.config.js')];

for (const 길 of 소스들) {
  const 이름 = relative(뿌리, 길).replace(/\\/g, '/');
  const 글 = readFileSync(길, 'utf-8');
  // ① 문법
  if (!이름.endsWith('.css')) {
    try { execFileSync(process.execPath, ['--check', 길], { stdio: 'pipe' }); }
    catch (e) { 잘못.push(`${이름} — 문법 오류\n      ${String(e.stderr || e).split('\n').slice(0, 4).join('\n      ')}`); continue; }
  }
  // ② 저작권 머리 주석
  if (!글.startsWith('/*!') || !글.slice(0, 300).includes('티쳐무')) 잘못.push(`${이름} — 머리에 /*! … 티쳐무 저작권 주석이 없다`);
  // ③ 원문자를 이름(식별자)에 쓰면 빌드가 깨진다
  const 원문자 = 글.match(/(?:function|const|let|var)\s+[^\s(=]*[①-⓿][^\s(=]*/);
  if (원문자) 잘못.push(`${이름} — 이름에 원문자를 썼다: ${원문자[0]}`);
  // ④ 브라우저 기본 대화상자 금지 (교실 화면에 주소가 함께 뜬다)
  const 기본창 = 글.match(/(?<![.\w])(alert|confirm|prompt)\s*\(/);
  if (기본창 && 이름.startsWith('src/')) 잘못.push(`${이름} — ${기본창[1]}() 대신 ui.js 의 창()·묻기() 를 쓸 것`);
  // ⑤ 화면 파일은 창 이벤트를 직접 걸지 않는다 (화면을 오갈 때마다 쌓인다)
  if (이름.startsWith('src/screens/') && /window\.addEventListener|setInterval\(/.test(글)) 잘못.push(`${이름} — window 이벤트·setInterval 을 직접 썼다. ui.js 의 창이벤트() 를 쓸 것`);
  // ⑥ localStorage 금지 — 학번·이름이 PC 에 남지 않게 한다(탭이 닫히면 지워지는 sessionStorage 와 저장 파일만 쓴다)
  if (이름.startsWith('src/') && /localStorage/.test(글.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, ''))) 잘못.push(`${이름} — localStorage 를 쓰면 안 된다(store.js 의 sessionStorage 를 쓸 것)`);
  if (이름.startsWith('src/') && /sessionStorage/.test(글) && 이름 !== 'src/lib/store.js') 잘못.push(`${이름} — sessionStorage 는 store.js 에서만 쓴다`);
  // ⑦ 바깥 주소로 무엇을 보내지 않는다
  if (이름.startsWith('src/') && /\bfetch\(|XMLHttpRequest|sendBeacon|WebSocket/.test(글)) 잘못.push(`${이름} — 통신 코드를 쓰면 안 된다`);
}
const 뼈대 = readFileSync(join(뿌리, 'src/main.js'), 'utf-8');
if (!뼈대.includes('푸터()')) 잘못.push('src/main.js — 화면에 푸터() 가 없다');

console.log(`\n  소스 ${소스들.length}개를 검사했습니다.`);
if (잘못.length) { for (const m of 잘못) console.log('  ✗', m); process.exit(1); }
console.log('  모두 통과\n');
