import { createRequire } from 'module'; const puppeteer = createRequire('C:/Users/aleja/Documents/BACO-OBRA/package.json')('puppeteer-core');
const [dir, url] = process.argv.slice(2);
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11', '--ignore-gpu-blocklist'] });
const p = await b.newPage(); await p.setViewport({ width: 1600, height: 900 });
p.on('console', m => console.log('c:', m.type(), m.text().slice(0, 250))); p.on('pageerror', e => console.log('ERR', e.message.slice(0, 300)));
p.on('response', r => { if (r.status() >= 400) console.log(r.status(), r.url().slice(0, 150)); });
await p.goto(url, { waitUntil: 'domcontentloaded' }); await new Promise(r => setTimeout(r, 40000));
await p.screenshot({ path: dir + '/live0.png' }); console.log('k?', await p.evaluate(() => !!window.__k));
await b.close();
