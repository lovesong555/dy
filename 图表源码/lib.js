const Q=new URLSearchParams(location.search);
const O=Q.get('o')||'v';
document.documentElement.classList.add(O);
const ANIM=Q.get('anim')==='1';
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
window.setProgress=t=>{__drawFn&&__drawFn(clamp(t));};
window.addEventListener('load',async()=>{await document.fonts.ready;
  // load fonts explicitly
  await Promise.all([400,500,700,900].map(w=>document.fonts.load(`${w} 20px NS`)));
  if(window.__init) await window.__init();
  window.setProgress(ANIM?0:1); window.__ready=true;});
