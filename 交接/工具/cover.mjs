import { createRequire } from 'module';
const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const [out,...ks]=process.argv.slice(2);const b=await chromium.launch();
for(const k of ks){const p=await b.newPage({viewport:{width:1080,height:1920}});await p.goto('http://127.0.0.1:8765/cover.html?k='+encodeURIComponent(k));await p.waitForFunction('window.__ready===true',{timeout:20000});await p.screenshot({path:`${out}/人物_李一男_封面_${k}.png`});await p.close();console.log(k)}
await b.close();
