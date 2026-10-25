import { createRequire } from 'module';
const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const [ep,n,out]=process.argv.slice(2);const b=await chromium.launch();
for(const [o,w,h] of [['h',1920,1080],['v',1080,1920]].filter(x=>(process.env.ORI||'hv').includes(x[0]))) for(let i=1;i<=+n;i++){const p=await b.newPage({viewport:{width:w,height:h}});p.on('pageerror',e=>console.log(i,o,'ERR',e.message));
 await p.goto(`http://127.0.0.1:8765/scene.html?o=${o}&ep=${ep}&i=${i}`);await p.waitForFunction('window.__ready===true',{timeout:30000});
 await p.screenshot({path:`${out}/${o}${String(i).padStart(2,'0')}.jpg`,type:'jpeg',quality:70});await p.close();}
await b.close();
