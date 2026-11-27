import { createRequire } from 'module'; const puppeteer = createRequire('C:/Users/aleja/Documents/BACO-OBRA/package.json')('puppeteer-core');
const [png, url, esp = '40'] = process.argv.slice(2);
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', protocolTimeout: 300000, args: ['--use-angle=d3d11', '--ignore-gpu-blocklist'] });
const p = await b.newPage(); await p.setViewport({ width: 1600, height: 900 }); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(url, { waitUntil: 'domcontentloaded' }); await new Promise(r => setTimeout(r, +esp * 1000)); await p.screenshot({ path: png });
console.log('errores:', errs.slice(0, 3).join(' | ') || 'ninguno'); await b.close();
