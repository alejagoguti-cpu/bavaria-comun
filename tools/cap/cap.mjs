// Captura de verificación: node tools/cap/cap.mjs <salida.png> [query] [espera_s] [js]
import { createRequire } from 'module'; const puppeteer = createRequire('C:/Users/aleja/Documents/BACO-OBRA/package.json')('puppeteer-core');
const [out, q = '', s = '25', js = ''] = process.argv.slice(2);
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', protocolTimeout: 170000, args: ['--use-angle=d3d11', '--ignore-gpu-blocklist'] });
const p = await b.newPage(); await p.setViewport({ width: 1600, height: 900 }); const errs = [];
p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' || m.type() === 'warn') errs.push(m.text()); });
p.on('requestfailed', r => errs.push('FALLA ' + r.url()));
p.on('response', r => { if (r.status() >= 400) errs.push(r.status() + ' ' + r.url()); });
await p.goto('http://localhost:8093/index.html' + q, { waitUntil: 'domcontentloaded', timeout: 60000 });
await new Promise(r => setTimeout(r, +s * 1000));
if (js) { console.log(await p.evaluate(js)); await new Promise(r => setTimeout(r, 6000)); }
await p.screenshot({ path: out }); console.log('errores:', [...new Set(errs)].slice(0, 8).join('\n') || 'ninguno'); await b.close();
