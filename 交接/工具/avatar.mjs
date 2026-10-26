import { createRequire } from 'module';
const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const b=await chromium.launch();
for(const [k,w,h,n] of [['a1',1080,1080,'头像_A_黑底'],['a2',1080,1080,'头像_B_米白底'],['a3',1080,1080,'头像_C_印章'],['banner',1125,633,'主页头图']]){
 const p=await b.newPage({viewport:{width:w,height:h}});await p.goto('http://127.0.0.1:8765/avatar.html?k='+k);await p.waitForFunction('window.__ready===true');
 await p.screenshot({path:`样片/账号/宋玉_${n}.png`});await p.close()}
await b.close();
