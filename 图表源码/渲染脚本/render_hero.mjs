import { createRequire } from 'module';
const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
import fs from 'fs'; import os from 'os'; import path from 'path'; import { execFileSync } from 'child_process';
const out=process.argv[2]; const ids=process.argv.slice(3);
for(const d of ['竖版','横版','动画_竖版','动画_横版','首尾帧']) fs.mkdirSync(path.join(out,d),{recursive:true});
const b=await chromium.launch();
for(const id of ids){ const name={'01':'韩国二手车单价','02':'挖掘机两地价','03':'韩资与蓬莱','04':'一公斤奶','05':'39.6亿','06':'交付周期','07':'李一男与小牛'}[id.slice(0,2)];
 const base=`${id.slice(0,2)}_H0_主视觉_${name}`;
 for(const [o,w,h,dir] of [['v',1080,1920,'竖版'],['h',1920,1080,'横版']]){
  const p=await b.newPage({viewport:{width:w,height:h}}); p.on('pageerror',e=>console.log(id,'ERR',e.message));
  await p.goto(`http://127.0.0.1:8765/hero.html?o=${o}&id=${id}`); await p.waitForFunction('window.__ready===true',{timeout:20000});
  await p.screenshot({path:path.join(out,dir,`${base}_${dir}.png`)});
  const sec=await p.evaluate(()=>window.__animSec); const N=Math.round(sec*30),HOLD=45; const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'hr-')); let k=0;
  for(let i=0;i<=N;i++){await p.evaluate(t=>window.setProgress(t),i/N);await p.screenshot({path:`${tmp}/f${String(k++).padStart(4,'0')}.png`});}
  for(let i=0;i<HOLD;i++) fs.copyFileSync(`${tmp}/f${String(N).padStart(4,'0')}.png`,`${tmp}/f${String(k++).padStart(4,'0')}.png`);
  fs.copyFileSync(`${tmp}/f0000.png`,path.join(out,'首尾帧',`${base}_${dir}_首帧.png`)); fs.copyFileSync(`${tmp}/f${String(N).padStart(4,'0')}.png`,path.join(out,'首尾帧',`${base}_${dir}_尾帧.png`));
  execFileSync('ffmpeg',['-y','-loglevel','error','-framerate','30','-i',`${tmp}/f%04d.png`,'-c:v','libx264','-pix_fmt','yuv420p','-crf','18',path.join(out,'动画_'+dir,`${base}_动画.mp4`)]);
  fs.rmSync(tmp,{recursive:true}); await p.close(); }
 console.log('done',id);}
await b.close();
