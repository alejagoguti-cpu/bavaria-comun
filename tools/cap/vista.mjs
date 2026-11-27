// node tools/cap/vista.mjs <png> <frase> "<js que recibe X,W,B y mueve la cámara>" [espera s]
import { createRequire } from 'module'; const puppeteer = createRequire('C:/Users/aleja/Documents/BACO-OBRA/package.json')('puppeteer-core');
const [png, n, js, esp = '14'] = process.argv.slice(2);
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', protocolTimeout: 600000, args: ['--use-angle=d3d11', '--ignore-gpu-blocklist'] });
const p = await b.newPage(); await p.setViewport({ width: 1600, height: 900 }); const errs = new Set(); p.on('pageerror', e => errs.add(e.message));
await p.goto('http://localhost:8095/index.html?directo', { waitUntil: 'domcontentloaded' }); await p.waitForFunction('window.__k && window.__k.X.B', { timeout: 120000 });
await new Promise(r => setTimeout(r, 4000));
await p.evaluate((n) => window.__k.ir(+n - 1, false), n); await new Promise(r => setTimeout(r, 1500));
await p.evaluate((js) => { const { X, W } = window.__k; const B = X.B; new Function('X', 'W', 'B', js)(X, W, B); }, js);
await new Promise(r => setTimeout(r, +esp * 1000)); await p.screenshot({ path: png });
console.log('errores:', [...errs].join(' | ') || 'ninguno'); await b.close();
