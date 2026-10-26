const Q=new URLSearchParams(location.search);
const O=Q.get('o')||'v';
document.documentElement.classList.add(O);
if(Q.get('gs')==='1') document.documentElement.classList.add('gs');
const ANIM=Q.get('anim')==='1';
const GLASS=Q.get('theme')!=='dark';
if(GLASS) document.write('<link rel="stylesheet" href="glass.css">');
function glassify(){
  if(!GLASS) return;
  const fr=document.querySelector('.frame'); if(!fr) return;
  const au=document.createElement('div'); au.className='aurora'; au.innerHTML='<i></i><i></i><i></i><i></i>'; document.body.prepend(au);
  const h1=fr.querySelector(':scope>h1'), sub=fr.querySelector(':scope>.sub');
  if(h1){const g=document.createElement('div'); g.className='ghead'; h1.before(g); g.append(h1); if(sub) g.append(sub);
    // 气泡：标题面板周围 5 个，大小不一
    const r=g.getBoundingClientRect(); const fx=fr.getBoundingClientRect();
    const B=[[.96,-.22,.07],[-.02,.92,.03]];
    B.forEach(([x,y,s])=>{const d=document.createElement('div');d.className='bub';const z=s*Math.max(innerWidth,innerHeight);
      d.style.width=d.style.height=z+'px';d.style.left=(r.left-fx.left+x*r.width-z/2)+'px';d.style.top=(r.top-fx.top+y*r.height-z/2)+'px';fr.prepend(d);});
    // 标题面板里再放 3 个小气泡，压在文字后面
    [[.975,.82,.035],[.93,.96,.016]].forEach(([x,y,s])=>{const d=document.createElement('div');d.className='bub';const z=s*Math.max(innerWidth,innerHeight);
      d.style.width=d.style.height=z+'px';d.style.left=(x*r.width-z/2)+'px';d.style.top=(y*r.height-z/2)+'px';g.prepend(d);});}
  const st=fr.querySelector('.stage');
  if(st){ if(st.querySelector('.basemap')||document.querySelector('.basemap')) document.body.classList.add('has-map');
    const sg=document.createElement('div'); sg.className='stage-glass'; st.prepend(sg);}
}
const V=O==='v';
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const easeOut=t=>1-Math.pow(1-t,3);
// stagger: progress of item i of n within global t, each item takes `span` fraction
const seg=(t,a,b)=>clamp((t-a)/(b-a));
const fmt=(x,d=0)=>x.toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});
function stageBox(){const s=document.querySelector('.stage');const r=s.getBoundingClientRect();return {el:s,w:r.width,h:r.height};}
let __drawFn=null;
function chart(fn){__drawFn=fn;}
window.setProgress=t=>{__drawFn&&__drawFn(clamp(t));GLASS&&polish();};
// 毛玻璃版配色：数据色换成 dataviz skill 校验过的深色色板（亮度带、色盲区分、对比度全部通过）
// 学虎嗅的配色纪律：一张图只有“主色蓝 + 一个暖色强调 + 中性灰”，绿/紫/粉/红全部收掉
const REMAP={'#3d8bff':'#3987e5','#ff7a3d':'#d95926','#1fc7a0':'#5d6779','#ffc233':'#c98500','#8f7bff':'#3987e5','#ff5b5b':'#d95926','#ff7eb6':'#3987e5','#3d6bd6':'#3a6fc4','#7fb2ff':'#8db4ea','#7fa8ff':'#8db4ea','#5fe0c0':'#7d8699','#c7a8ff':'#8db4ea','#0a0f1e':'rgba(12,15,22,.55)','#22305a':'rgba(255,255,255,.07)','#1d2744':'rgba(255,255,255,.07)','#26314f':'rgba(255,255,255,.10)','#2b375a':'rgba(255,255,255,.08)','#1f2a48':'rgba(255,255,255,.08)','#33406a':'rgba(255,255,255,.18)'};
const TXT={'#ffc233':'#f0c46a','#3d8bff':'#8db4ea','#ff7a3d':'#ee9a72','#1fc7a0':'#b4bccb','#ff5b5b':'#ee9a72','#8f7bff':'#8db4ea','#ffd97a':'#f0c46a','#ffd36b':'#f0c46a'};
function polish(){
  document.querySelectorAll('.stage svg *').forEach(el=>{
    const tag=el.tagName.toLowerCase();
    for(const a of ['fill','stroke','stop-color']){const v=(el.getAttribute(a)||'').toLowerCase(); if(!v||v[0]!=='#') continue;
      const base=v.slice(0,7), al=v.length===9?v.slice(7):'';
      const m=(tag==='text'||tag==='tspan')&&a==='fill'?(TXT[base]||REMAP[base]):REMAP[base];
      if(m) el.setAttribute(a,al&&m[0]==='#'?m+al:m);}
    if(tag==='rect'&&!el.closest('.basemap')){const w=+el.getAttribute('width'),h=+el.getAttribute('height'),f=el.getAttribute('fill')||'';
      if(w>6&&h>6&&f&&f!=='none'&&!f.startsWith('rgba(')){el.classList.add('glass-mark'); if(!el.getAttribute('rx')) el.setAttribute('rx',Math.min(6,w/2,h/2));
        if(!el.getAttribute('stroke')){el.setAttribute('stroke','rgba(255,255,255,.22)');el.setAttribute('stroke-width','1');}}}
    if((tag==='path'||tag==='line'||tag==='polyline')&&+(el.getAttribute('stroke-width')||0)>=3&&!el.closest('.basemap')) el.classList.add('glass-mark');
    if(tag==='circle'&&+(el.getAttribute('r')||0)>=6&&!el.closest('.basemap')) el.classList.add('glass-mark');
  });
}
window.addEventListener('load',async()=>{await document.fonts.ready;
  // load fonts explicitly
  await Promise.all([400,500,700,900].map(w=>document.fonts.load(`${w} 20px NS`)));
  glassify();
  if(window.__init) await window.__init();
  if(document.querySelector('.basemap')) document.body.classList.add('has-map');
  window.setProgress(ANIM?0:1); window.__ready=true;});
