// Captura cada beat del relato a una fracción de su duración: node tools/cap/beats.mjs <carpeta> "2:0.9,5:0.9" [url]
import { createRequire } from 'module'; const puppeteer = createRequire('C:/Users/aleja/Documents/BACO-OBRA/package.json')('puppeteer-core');
const [dir, lista, url = 'http://localhost:8093/index.html'] = process.argv.slice(2);
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', protocolTimeout: 600000, args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage(); await p.setViewport({ width: 1600, height: 900 }); const errs = new Set();
p.on('pageerror', e => errs.add(e.message)); p.on('console', m => { if (m.type() === 'error') errs.add(m.text()); });
await p.goto(url, { waitUntil: 'domcontentloaded' }); await new Promise(r => setTimeout(r, 22000));
for (const it of lista.split(',')) {
  const [n, f] = it.split(':').map(Number);
  const d = await p.evaluate((n) => { const R = BAV.relato; R.empezar(n - 1); const a = document.querySelector('audio'); return 0; }, n);
  const espera = await p.evaluate((n, f) => { const T = [1.49, 9.6, 31.6, 46.05, 64.2, 74.9, 88.9, 109.4, 120.3, 129.45, 147.75, 157.3, 169.35, 183.5, 198.7, 210.7]; return (T[n] - T[n - 1]) * f; }, n, f);
  await new Promise(r => setTimeout(r, espera * 1000 + 1500));
  await p.screenshot({ path: `${dir}/beat${String(n).padStart(2, '0')}.png` }); console.log('beat', n, 'ok', espera.toFixed(1) + 's');
}
console.log('errores:', [...errs].slice(0, 6).join('\n') || 'ninguno'); await b.close();
