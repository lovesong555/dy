import { createRequire } from 'module';
const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const [ep,o,...ids]=process.argv.slice(2);const b=await chromium.launch();
for(const i of ids){const [w,h]=o==='h'?[1920,1080]:[1080,1920];const p=await b.newPage({viewport:{width:w,height:h}});p.on('pageerror',e=>console.log(i,'ERR',e.message));
 await p.goto(`http://127.0.0.1:8765/scene.html?o=${o}&ep=${ep}&i=${i}`);await p.waitForFunction('window.__ready===true',{timeout:30000});
 await p.screenshot({path:`/tmp/claude-0/-home-user-dy/12422577-561d-516a-aacf-b65a94764a7f/scratchpad/charts/sc/${ep}_${o}_${i}.png`});await p.close();}
await b.close();
