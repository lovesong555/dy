// node render_ev.mjs <outdir>   (reads src/evidence/meta.json)
import { createRequire } from 'module';
const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
import fs from 'fs'; import os from 'os'; import path from 'path'; import { execFileSync } from 'child_process';
const out=process.argv[2]; const only=process.argv.slice(3);
const meta=JSON.parse(fs.readFileSync('src/evidence/meta.json','utf8'));
const names=Object.keys(meta).filter(n=>!meta[n].error&&meta[n].found&&(!only.length||only.some(o=>n.startsWith(o))));
for(const d of ['竖版','横版','动画_竖版','动画_横版']) fs.mkdirSync(path.join(out,d),{recursive:true});
const b=await chromium.launch();
for(const n of names){
  for(const [o,w,h,dir] of [['v',1080,1920,'竖版'],['h',1920,1080,'横版']]){
    const p=await b.newPage({viewport:{width:w,height:h}});
    p.on('pageerror',e=>console.log(n,o,'PAGEERR',e.message));
    await p.goto('http://127.0.0.1:8765/evidence.html?o='+o+'&n='+encodeURIComponent(n));
    await p.waitForFunction('window.__ready===true',{timeout:20000});
    await p.screenshot({path:path.join(out,dir,`${n}_${dir}.png`)});
    const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'ev-')); const N=105,HOLD=45; let k=0;
    for(let i=0;i<=N;i++){await p.evaluate(t=>window.setProgress(t),i/N);await p.screenshot({path:`${tmp}/f${String(k++).padStart(4,'0')}.png`});}
    for(let i=0;i<HOLD;i++) fs.copyFileSync(`${tmp}/f${String(N).padStart(4,'0')}.png`,`${tmp}/f${String(k++).padStart(4,'0')}.png`);
    execFileSync('ffmpeg',['-y','-loglevel','error','-framerate','30','-i',`${tmp}/f%04d.png`,'-c:v','libx264','-pix_fmt','yuv420p','-crf','20',path.join(out,'动画_'+dir,`${n}_动画.mp4`)]);
    fs.rmSync(tmp,{recursive:true}); await p.close();
  }
  console.log('done',n);
}
await b.close();
