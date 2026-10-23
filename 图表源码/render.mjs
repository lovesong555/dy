// usage: node render.mjs <srcdir> <outdir> [--anim] [names...]
import { createRequire } from 'module';
const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
import fs from 'fs'; import os from 'os'; import path from 'path'; import { execFileSync } from 'child_process';
const [src,out,...rest]=process.argv.slice(2);
const anim=rest.includes('--anim'); const only=rest.filter(x=>!x.startsWith('--'));
const files=fs.readdirSync(src).filter(f=>/^\d\d_.*\.html$/.test(f)&&(!only.length||only.some(o=>f.startsWith(o))));
fs.mkdirSync(path.join(out,'竖版'),{recursive:true});fs.mkdirSync(path.join(out,'横版'),{recursive:true});fs.mkdirSync(path.join(out,'动画_竖版'),{recursive:true});
const browser=await chromium.launch({args:['--allow-file-access-from-files']});
for(const f of files){
  const base=f.replace('.html','');
  for(const [o,w,h,dir] of [['v',1080,1920,'竖版'],['h',1920,1080,'横版']]){
    const page=await browser.newPage({viewport:{width:w,height:h},deviceScaleFactor:1});
    page.on('console',m=>{if(m.type()==='error')console.log(f,o,m.text())});
    page.on('pageerror',e=>console.log(f,o,'PAGEERR',e.message));
    await page.goto('http://127.0.0.1:8765/'+encodeURIComponent(f)+'?o='+o);
    await page.waitForFunction('window.__ready===true',{timeout:20000});
    await page.screenshot({path:path.join(out,dir,`${base}_${dir}.png`)});
    if(anim&&o==='v'){
      const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'fr-'));
      const N=75, HOLD=45; let k=0;
      for(let i=0;i<=N;i++){await page.evaluate(t=>window.setProgress(t),i/N);await page.screenshot({path:`${tmp}/f${String(k++).padStart(4,'0')}.png`});}
      for(let i=0;i<HOLD;i++){fs.copyFileSync(`${tmp}/f${String(N).padStart(4,'0')}.png`,`${tmp}/f${String(k++).padStart(4,'0')}.png`);}
      execFileSync('ffmpeg',['-y','-loglevel','error','-framerate','30','-i',`${tmp}/f%04d.png`,'-c:v','libx264','-pix_fmt','yuv420p','-crf','18',path.join(out,'动画_竖版',`${base}_动画.mp4`)]);
      fs.rmSync(tmp,{recursive:true});
    }
    await page.close();
  }
  console.log('done',f);
}
await browser.close();
