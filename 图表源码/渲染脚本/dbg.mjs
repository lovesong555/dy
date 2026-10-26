import { createRequire } from 'module';
const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const b=await chromium.launch();const p=await b.newPage();
p.on('console',m=>console.log('C',m.type(),m.text()));p.on('pageerror',e=>console.log('E',e.message));
p.on('requestfailed',r=>console.log('RF',r.url(),r.failure()?.errorText));
await p.goto('http://127.0.0.1:8765/'+encodeURIComponent('01_A_过境路线地图.html')+'?o=v');
await p.waitForTimeout(4000);console.log(await p.evaluate(()=>[window.__ready,document.fonts.status]));await b.close();
