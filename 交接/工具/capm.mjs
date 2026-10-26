// 手机宽度截原文：capm.mjs <list.json> <outdir>；list: [[name,url,[needle...],src,zoom,mobile]]
import { createRequire } from 'module';
const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
import fs from 'fs';
const [list,out]=process.argv.slice(2);const items=JSON.parse(fs.readFileSync(list,'utf8'));fs.mkdirSync(out,{recursive:true});
const b=await chromium.launch();const meta={};
for(const [name,url,needles,src,zoom,mobile] of items){
 const ctx=await b.newContext({viewport:{width:+(process.env.VW||720),height:+(process.env.VH||1280)},deviceScaleFactor:1,isMobile:!!mobile,locale:'zh-CN',ignoreHTTPSErrors:true,
  userAgent:mobile?'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1':undefined});
 const p=await ctx.newPage();
 try{await p.goto(url,{waitUntil:'domcontentloaded',timeout:45000});await p.waitForTimeout(3500);
  if(zoom) await p.addStyleTag({content:`body{zoom:${zoom}}`});
  await p.evaluate(()=>{for(const el of document.querySelectorAll('body *')){const cs=getComputedStyle(el);if((cs.position==='fixed'||cs.position==='sticky')&&el.offsetHeight<window.innerHeight*0.9) el.style.display='none';}});
  const find=(n,scroll)=>p.evaluate(([n,scroll])=>{const re=new RegExp(n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/ /g,'\\s+'));const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let node;while(node=w.nextNode()){const mm=re.exec(node.textContent);if(mm){if(scroll)node.parentElement.scrollIntoView({block:'center'});const r=document.createRange();r.setStart(node,mm.index);r.setEnd(node,mm.index+mm[0].length);return [...r.getClientRects()].map(c=>({x:c.x,y:c.y,w:c.width,h:c.height}))}}return null},[n,scroll]);
  await find(needles[0],true);await p.waitForTimeout(800);
  const rects=[];for(const n of needles){const r=await find(n,false);if(r)rects.push(...r);else console.log(name,'missing',n)}
  await p.screenshot({path:`${out}/${name}.png`});meta[name]={url,src,rects,W:+(process.env.VW||720),H:+(process.env.VH||1280)};console.log(name,rects.length);
 }catch(e){console.log(name,'ERR',e.message.slice(0,80))}
 await ctx.close();}
fs.writeFileSync(`${out}/meta.json`,JSON.stringify(meta,null,1));await b.close();
