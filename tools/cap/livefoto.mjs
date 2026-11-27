import { createRequire } from 'module'; const puppeteer = createRequire('C:/Users/aleja/Documents/BACO-OBRA/package.json')('puppeteer-core');
const [png, url] = process.argv.slice(2);
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', protocolTimeout: 300000, args: ['--use-angle=d3d11', '--ignore-gpu-blocklist'] });
const p = await b.newPage(); await p.setViewport({ width: 1600, height: 900 });
p.on('response', r => { if (r.url().includes('googleapis') && r.status() >= 400) console.log('GOOGLE', r.status(), r.url().slice(0, 90)); });
await p.goto(url, { waitUntil: 'domcontentloaded' }); await p.waitForFunction('window.__k && window.__k.X.B', { timeout: 120000 }).catch(() => console.log('sin motor'));
await new Promise(r => setTimeout(r, 15000));
console.log(await p.evaluate(() => JSON.stringify({ google: !!window.__k.W.google, estado: document.getElementById('foto-estado')?.textContent })));
await p.screenshot({ path: png }); await b.close();
