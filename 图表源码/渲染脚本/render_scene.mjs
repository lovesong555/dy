// node render_scene.mjs <ep> <outdir> [h|v|hv] [i...]  每个镜头导出：静帧PNG、首尾帧、MP4；再拼一条整期预览
import { createRequire } from 'module';
const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
import fs from 'fs'; import os from 'os'; import path from 'path'; import { execFileSync } from 'child_process';
const [ep,out,ori='hv',...only]=process.argv.slice(2);
const spec=JSON.parse(fs.readFileSync(`src/scenes/${ep}.json`,'utf8'));
const b=await chromium.launch();
for(const [o,w,h,dir] of [['h',1920,1080,'横版'],['v',1080,1920,'竖版']]){ if(!ori.includes(o)) continue;
 const od=path.join(out,dir); for(const d of ['镜头MP4','首尾帧','静帧']) fs.mkdirSync(path.join(od,d),{recursive:true});
 const list=[];
 for(let i=1;i<=spec.scenes.length;i++){ const sc=spec.scenes[i-1]; const name=`${ep}_${String(i).padStart(2,'0')}_${sc.type}`;
  if(only.length&&!only.includes(String(i))){list.push(name);continue}
  const p=await b.newPage({viewport:{width:w,height:h}}); p.on('pageerror',e=>console.log(name,o,'ERR',e.message));
  await p.goto(`http://127.0.0.1:8765/scene.html?o=${o}&ep=${ep}&i=${i}`); await p.waitForFunction('window.__ready===true',{timeout:30000});
  await p.screenshot({path:path.join(od,'静帧',`${name}.png`)});
  const sec=await p.evaluate(()=>window.__animSec); const N=Math.round(sec*30);
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'sf-'));
  for(let k=0;k<N;k++){await p.evaluate(t=>window.setProgress(t),k/(N-1)); await p.screenshot({path:`${tmp}/f${String(k).padStart(4,'0')}.jpg`,type:'jpeg',quality:92});}
  fs.copyFileSync(`${tmp}/f0000.jpg`,path.join(od,'首尾帧',`${name}_首帧.jpg`)); fs.copyFileSync(`${tmp}/f${String(N-1).padStart(4,'0')}.jpg`,path.join(od,'首尾帧',`${name}_尾帧.jpg`));
  execFileSync('ffmpeg',['-y','-loglevel','error','-framerate','30','-i',`${tmp}/f%04d.jpg`,'-c:v','libx264','-pix_fmt','yuv420p','-crf','18','-r','30',path.join(od,'镜头MP4',`${name}.mp4`)]);
  fs.rmSync(tmp,{recursive:true}); await p.close(); list.push(name); console.log('done',o,name,sec+'s');
 }
 fs.writeFileSync(path.join(od,'concat.txt'),list.map(n=>`file '镜头MP4/${n}.mp4'`).join('\n'));
 execFileSync('ffmpeg',['-y','-loglevel','error','-f','concat','-safe','0','-i',path.join(od,'concat.txt'),'-c','copy',path.join(od,`${ep}_整期预览_${dir}.mp4`)]);
}
await b.close();
