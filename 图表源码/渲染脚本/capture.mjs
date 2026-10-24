import { createRequire } from 'module';
const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
import fs from 'fs';
const [list,out]=process.argv.slice(2);
const items=JSON.parse(fs.readFileSync(list,'utf8'));
const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:1280,height:900},ignoreHTTPSErrors:true,locale:'zh-CN',userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'});
const meta={};
for(const [name,url,needle,src] of items){
  const p=await ctx.newPage();
  try{
    let ok=false;for(let a=0;a<3&&!ok;a++){try{await p.goto(url,{waitUntil:'domcontentloaded',timeout:45000});await p.waitForTimeout(3500);ok=!(await p.content()).includes('upstream request failed');}catch(e){} if(!ok) await p.waitForTimeout(4000);}
    await p.evaluate(()=>{for(const el of document.querySelectorAll('body *')){const cs=getComputedStyle(el);if((cs.position==='fixed'||cs.position==='sticky')&&el.offsetHeight<window.innerHeight*0.9) el.style.display='none';}});
    const box=await p.evaluate((n)=>{
      const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let node;
      while(node=w.nextNode()){const i=node.textContent.indexOf(n); if(i>=0){const r=document.createRange();r.setStart(node,i);r.setEnd(node,Math.min(node.textContent.length,i+n.length+40));
        const el=node.parentElement; el.scrollIntoView({block:'center'}); const rc=r.getBoundingClientRect(); return {x:rc.x,y:rc.y,w:rc.width,h:rc.height};}}
      return null;},needle);
    await p.waitForTimeout(800);
    let bb=box?await p.evaluate((n)=>{const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let node;while(node=w.nextNode()){const i=node.textContent.indexOf(n);if(i>=0){const r=document.createRange();r.setStart(node,i);r.setEnd(node,Math.min(node.textContent.length,i+n.length+40));const rs=[...r.getClientRects()].map(c=>({x:c.x,y:c.y,w:c.width,h:c.height}));return rs;}}return null;},needle):null;
    await p.screenshot({path:`${out}/${name}.png`,timeout:90000,animations:'disabled'});
    meta[name]={url,src,needle,rects:bb,found:!!box};
    console.log(name, box?'found':'NOT FOUND', p.url().slice(0,60));
  }catch(e){console.log(name,'ERR',e.message.slice(0,80)); meta[name]={url,src,needle,error:true};}
  await p.close();
}
fs.writeFileSync(`${out}/meta.json`,JSON.stringify(meta,null,1)); await b.close();
