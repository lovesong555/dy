import { createRequire } from 'module';
const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const [out,b,t]=process.argv.slice(2);const br=await chromium.launch();const p=await br.newPage({viewport:{width:1080,height:1920}});
await p.goto(`http://127.0.0.1:8765/vframe.html?b=${encodeURIComponent(b)}&t=${encodeURIComponent(t)}`);await p.waitForFunction('window.__ready===true');
await p.evaluate(()=>{document.querySelector('.hole').style.background='transparent'});await p.screenshot({path:out,omitBackground:true});await br.close();
