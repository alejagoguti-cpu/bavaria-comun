// node tools/cap/pres.mjs <dir> "1:0.9,3:0.9" [url]: abre la presentación, Comenzar, salta a cada frase y captura
import { createRequire } from 'module'; const puppeteer = createRequire('C:/Users/aleja/Documents/BACO-OBRA/package.json')('puppeteer-core');
const [dir, lista, url = 'http://localhost:8095/index.html'] = process.argv.slice(2);
const T = [1.49, 9.6, 31.6, 46.05, 64.2, 74.9, 88.9, 109.4, 120.3, 129.45, 147.75, 157.3, 169.35, 183.5, 198.7, 210.7];
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', protocolTimeout: 600000, args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage(); await p.setViewport({ width: 1600, height: 900 }); const errs = new Set();
p.on('pageerror', e => errs.add(e.message)); p.on('response', r => { if (r.status() >= 400) errs.add(r.status() + ' ' + r.url()); }); p.on('console', m => { if (m.type() === 'error') errs.add(m.text().slice(0, 200)); });
await p.goto(url, { waitUntil: 'domcontentloaded' }); await new Promise(r => setTimeout(r, 20000));
if (!(await p.evaluate(() => !!window.__k))) { console.log('SIN __k:', [...errs].join(' || ')); process.exit(1); }
await p.click('#empezar'); await new Promise(r => setTimeout(r, 3000));
for (const it of lista.split(',')) {
  const [n, f] = it.split(':').map(Number);
  await p.evaluate((n) => window.__k.ir(n - 1, true), n);
  await new Promise(r => setTimeout(r, ((T[n] - T[n - 1]) * f) * 1000 + 1500));
  await p.screenshot({ path: `${dir}/p${String(n).padStart(2, '0')}.png` }); console.log('frase', n);
}
console.log('errores:', [...errs].slice(0, 6).join('\n') || 'ninguno'); await b.close();
