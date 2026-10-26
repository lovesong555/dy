import { createRequire } from 'module';
const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const [id,o,t,out]=process.argv.slice(2);const b=await chromium.launch();const p=await b.newPage({viewport:o==='v'?{width:1080,height:1920}:{width:1920,height:1080}});
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto(`http://127.0.0.1:8765/hero.html?o=${o}&id=${id}`);await p.waitForFunction('window.__ready===true');await p.evaluate(x=>window.setProgress(+x),t);await p.screenshot({path:out});await b.close();
