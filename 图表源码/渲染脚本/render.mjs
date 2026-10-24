// usage: node render.mjs <srcdir> <outdir> [--anim] [names...]
import { createRequire } from 'module';
const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
import fs from 'fs'; import path from 'path'; import { execFileSync } from 'child_process';
const [src,out,...rest]=process.argv.slice(2);
const anim=rest.includes('--anim'); const GS=rest.includes('--gs'); const only=rest.filter(x=>!x.startsWith('--'));
const files=fs.readdirSync(src).filter(f=>/^\d\d_.*\.html$/.test(f)&&(!only.length||only.some(o=>f.startsWith(o))));
fs.mkdirSync(path.join(out,'竖版'),{recursive:true});fs.mkdirSync(path.join(out,'首尾帧'),{recursive:true});fs.mkdirSync(path.join(out,'横版'),{recursive:true});fs.mkdirSync(path.join(out,'动画_竖版'),{recursive:true});
const browser=await chromium.launch({args:['--allow-file-access-from-files']});
for(const f of files){
  const base=f.replace('.html','');
  const modes=GS?[['v',1080,1920,'绿幕_竖版'],['h',1920,1080,'绿幕_横版']]:[['v',1080,1920,'竖版'],['h',1920,1080,'横版']];
  for(const [o,w,h,dir] of modes){ fs.mkdirSync(path.join(out,dir),{recursive:true});
    const page=await browser.newPage({viewport:{width:w,height:h},deviceScaleFactor:1});
    page.on('console',m=>{if(m.type()==='error')console.log(f,o,m.text())});
    page.on('pageerror',e=>console.log(f,o,'PAGEERR',e.message));
    await page.goto('http://127.0.0.1:8765/'+encodeURIComponent(f)+'?o='+o+(GS?'&gs=1':''));
    await page.waitForFunction('window.__ready===true',{timeout:20000});
    await page.screenshot({path:path.join(out,dir,`${base}_${dir}.png`)});
    if(anim&&(o==='v'||GS)){
      const tmp=fs.mkdtempSync('/tmp/fr-');
      const sec=await page.evaluate(()=>window.__animSec||2.5); const N=Math.round(sec*30), HOLD=45; let k=0;
      for(let i=0;i<=N;i++){await page.evaluate(t=>window.setProgress(t),i/N);await page.screenshot({path:`${tmp}/f${String(k++).padStart(4,'0')}.png`});}
      for(let i=0;i<HOLD;i++){fs.copyFileSync(`${tmp}/f${String(N).padStart(4,'0')}.png`,`${tmp}/f${String(k++).padStart(4,'0')}.png`);}
      if(!GS) fs.copyFileSync(`${tmp}/f0000.png`,path.join(out,'首尾帧',`${base}_首帧.png`));if(!GS) fs.copyFileSync(`${tmp}/f${String(N).padStart(4,'0')}.png`,path.join(out,'首尾帧',`${base}_尾帧.png`));
      execFileSync('ffmpeg',['-y','-loglevel','error','-framerate','30','-i',`${tmp}/f%04d.png`,'-c:v','libx264','-pix_fmt','yuv420p','-crf','18',GS?path.join(out,dir,`${base}_绿幕动画.mp4`):path.join(out,'动画_竖版',`${base}_动画.mp4`)]);
      fs.rmSync(tmp,{recursive:true});
    }
    await page.close();
  }
  console.log('done',f);
}
await browser.close();
