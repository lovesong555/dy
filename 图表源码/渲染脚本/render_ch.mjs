import { createRequire } from 'module';
const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
import fs from 'fs'; import path from 'path';
const out=process.argv[2]; fs.mkdirSync(out,{recursive:true});
const C=JSON.parse(fs.readFileSync('src/chapters.json','utf8'));
const b=await chromium.launch();
for(const ep of Object.keys(C)) for(let i=1;i<=C[ep].length;i++) for(const [o,w,dir] of [['v',1080,'竖版'],['h',1920,'横版']]){
  const p=await b.newPage({viewport:{width:w,height:110}});
  await p.goto(`http://127.0.0.1:8765/chapterbar.html?ep=${ep}&i=${i}&o=${o}`); await p.waitForFunction('window.__ready===true');
  await p.screenshot({path:path.join(out,`${String(ep).padStart(2,'0')}_章节条_${i}_${dir}.png`),omitBackground:true}); await p.close();}
await b.close(); console.log('ok');
