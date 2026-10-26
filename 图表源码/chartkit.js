// Reusable animated chart components. All take (svg, w, h, t, opts).
const C={blue:'#3d8bff',orange:'#ff7a3d',aqua:'#1fc7a0',yellow:'#ffc233',red:'#ff5b5b',violet:'#8f7bff',pink:'#ff7eb6',muted:'#4a5675',t1:'#f3f5fa',t2:'#b9c2d8',t3:'#7d88a6',grid:'#1f2a48',bg:'#0a0f1e'};
function txt(g,x,y,s,o={}){return g.append('text').attr('x',x).attr('y',y).attr('fill',o.fill||C.t1).attr('font-size',o.fs||28).attr('font-weight',o.fw||500).attr('text-anchor',o.anchor||'start').attr('dominant-baseline',o.base||'auto').text(s);}
function defsGrad(svg,id,c1,c2,vertical=true){const d=svg.select('defs').empty()?svg.append('defs'):svg.select('defs');const g=d.append('linearGradient').attr('id',id).attr('x1',0).attr('y1',vertical?1:0).attr('x2',vertical?0:1).attr('y2',0);g.append('stop').attr('offset','0%').attr('stop-color',c1);g.append('stop').attr('offset','100%').attr('stop-color',c2);return `url(#${id})`;}

// Vertical column chart. data:[{k,v,label?,color?,note?}]
function columns(svg,w,h,t,o){
  const m={top:o.top??90,bottom:o.bottom??90,left:o.left??20,right:o.right??20};
  const x=d3.scaleBand().domain(o.data.map(d=>d.k)).range([m.left,w-m.right]).padding(o.pad??.32);
  const y=d3.scaleLinear().domain([0,o.max||d3.max(o.data,d=>d.v)*1.08]).range([h-m.bottom,m.top]);
  const g=svg.append('g');
  g.append('line').attr('x1',m.left).attr('x2',w-m.right).attr('y1',y(0)).attr('y2',y(0)).attr('stroke','#33406a').attr('stroke-width',2);
  o.data.forEach((d,i)=>{
    const p=easeOut(seg(t,i*.6/o.data.length,i*.6/o.data.length+.4));
    const col=d.color||C.blue; const gid='cg'+i+Math.random().toString(36).slice(2,6);
    const fill=defsGrad(svg,gid,col+'88',col);
    const yy=y(d.v*p);
    g.append('rect').attr('x',x(d.k)).attr('y',yy).attr('width',x.bandwidth()).attr('height',Math.max(0,y(0)-yy)).attr('rx',10).attr('fill',fill);
    if(p>0.02) txt(g,x(d.k)+x.bandwidth()/2,yy-18,(d.fmt?d.fmt(d.v*p):fmt(d.v*p,o.dec||0))+(o.unit||''),{anchor:'middle',fs:o.vfs||40,fw:900,fill:d.vcolor||C.t1});
    txt(g,x(d.k)+x.bandwidth()/2,y(0)+(o.kfs||28)+16,d.label||d.k,{anchor:'middle',fs:o.kfs||28,fill:C.t2,fw:500});
    if(d.note) txt(g,x(d.k)+x.bandwidth()/2,y(0)+(o.kfs||28)*2+24,d.note,{anchor:'middle',fs:(o.kfs||28)*.78,fill:C.t3});
  });
  return {x,y,g};
}

// Horizontal bars. data:[{k,v,color?,tag?}]
function hbars(svg,w,h,t,o){
  const lw=o.labelW??200, vw=o.valueW??170;
  const n=o.data.length; const rowH=(h)/n; const bh=Math.min(o.barH||46,rowH*.5);
  const x=d3.scaleLinear().domain([0,o.max||d3.max(o.data,d=>d.v)]).range([0,w-lw-vw]);
  const g=svg.append('g');
  o.data.forEach((d,i)=>{
    const p=easeOut(seg(t,i*.5/n,i*.5/n+.5));
    const cy=rowH*i+rowH/2;
    txt(g,lw-20,cy,d.k,{anchor:'end',base:'middle',fs:o.kfs||30,fw:d.hl?900:500,fill:d.hl?C.t1:C.t2});
    g.append('rect').attr('x',lw).attr('y',cy-bh/2).attr('width',w-lw-vw).attr('height',bh).attr('rx',bh/2).attr('fill','#16203d');
    g.append('rect').attr('x',lw).attr('y',cy-bh/2).attr('width',Math.max(bh,x(d.v)*p)).attr('height',bh).attr('rx',bh/2).attr('fill',d.color||C.blue).attr('opacity',p>0?1:0);
    txt(g,lw+x(d.v)*p+18,cy,(d.fmt?d.fmt(d.v*p):fmt(d.v*p,o.dec||0))+(o.unit||''),{base:'middle',fs:o.vfs||34,fw:900});
    if(d.tag) txt(g,lw+4,cy+bh/2+26,d.tag,{base:'middle',fs:o.tfs||22,fill:C.t3});
  });
}

// Line / area chart. series:[{name,color,pts:[[x,y],...]}]
function lines(svg,w,h,t,o){
  const m={top:o.top??60,bottom:o.bottom??70,left:o.left??80,right:o.right??140};
  const allx=o.series.flatMap(s=>s.pts.map(p=>p[0])); const ally=o.series.flatMap(s=>s.pts.map(p=>p[1]));
  const x=d3.scaleLinear().domain(o.xdom||d3.extent(allx)).range([m.left,w-m.right]);
  const y=d3.scaleLinear().domain(o.ydom||[0,d3.max(ally)*1.12]).nice().range([h-m.bottom,m.top]);
  const g=svg.append('g');
  y.ticks(o.yticks||5).forEach(v=>{g.append('line').attr('x1',m.left).attr('x2',w-m.right).attr('y1',y(v)).attr('y2',y(v)).attr('stroke',C.grid).attr('stroke-width',1.5);
    txt(g,m.left-14,y(v),o.yfmt?o.yfmt(v):fmt(v),{anchor:'end',base:'middle',fs:22,fill:C.t3});});
  (o.xticks||x.ticks(6)).forEach(v=>txt(g,x(v),h-m.bottom+40,o.xfmt?o.xfmt(v):String(v),{anchor:'middle',fs:24,fill:C.t2}));
  const clipId='cl'+Math.random().toString(36).slice(2,7);
  svg.append('defs').append('clipPath').attr('id',clipId).append('rect').attr('x',0).attr('y',0).attr('height',h).attr('width',m.left+(w-m.left-m.right)*ease(t)+4);
  o.series.forEach((s,si)=>{
    const line=d3.line().x(p=>x(p[0])).y(p=>y(p[1])).curve(d3.curveMonotoneX);
    if(s.area){const ar=d3.area().x(p=>x(p[0])).y0(y(0)).y1(p=>y(p[1])).curve(d3.curveMonotoneX);
      g.append('path').attr('d',ar(s.pts)).attr('fill',defsGrad(svg,'ag'+si+clipId,s.color+'00',s.color+'55')).attr('clip-path',`url(#${clipId})`);}
    g.append('path').attr('d',line(s.pts)).attr('fill','none').attr('stroke',s.color).attr('stroke-width',s.w||6).attr('stroke-dasharray',s.dash||null).attr('clip-path',`url(#${clipId})`).attr('stroke-linejoin','round');
    const xmax=x.invert(m.left+(w-m.left-m.right)*ease(t));
    s.pts.forEach((p,pi)=>{ if(p[0]<=xmax+1e-9 && (s.dots!==false)){
      g.append('circle').attr('cx',x(p[0])).attr('cy',y(p[1])).attr('r',s.r||9).attr('fill',C.bg).attr('stroke',s.color).attr('stroke-width',4);
      if(s.labels&&s.labels[pi]) txt(g,x(p[0]),y(p[1])-24,s.labels[pi],{anchor:'middle',fs:s.lfs||28,fw:900,fill:s.lcolor||C.t1});}});
    const last=s.pts.filter(p=>p[0]<=xmax+1e-9).pop();
    if(last&&s.name&&t>.95) txt(g,x(last[0])+18,y(last[1]),s.name,{base:'middle',fs:26,fw:700,fill:s.color});
  });
  return {x,y,g};
}

// Waterfall. steps:[{k,v,color,total?}] ; total bars drawn from 0
function waterfall(svg,w,h,t,o){
  const m={top:o.top??80,bottom:o.bottom??110,left:o.left??20,right:o.right??20};
  let acc=0; const bars=o.steps.map(s=>{ if(s.total){const b={...s,y0:0,y1:s.v};acc=s.v;return b;} const b={...s,y0:acc,y1:acc+s.v};acc+=s.v;return b;});
  const x=d3.scaleBand().domain(bars.map(b=>b.k)).range([m.left,w-m.right]).padding(.22);
  const y=d3.scaleLinear().domain([0,o.max||d3.max(bars,b=>Math.max(b.y0,b.y1))*1.1]).range([h-m.bottom,m.top]);
  const g=svg.append('g'); const n=bars.length;
  g.append('line').attr('x1',m.left).attr('x2',w-m.right).attr('y1',y(0)).attr('y2',y(0)).attr('stroke','#33406a').attr('stroke-width',2);
  bars.forEach((b,i)=>{
    const p=easeOut(seg(t,i/n*.85,i/n*.85+.25));
    const top=y(b.y0+(b.y1-b.y0)*p), bot=y(b.y0);
    if(i>0&&p>0){const prev=bars[i-1];g.append('line').attr('x1',x(prev.k)+x.bandwidth()).attr('x2',x(b.k)).attr('y1',y(prev.y1)).attr('y2',y(prev.y1)).attr('stroke','#5a6790').attr('stroke-dasharray','6 6').attr('stroke-width',2);}
    g.append('rect').attr('x',x(b.k)).attr('y',Math.min(top,bot)).attr('width',x.bandwidth()).attr('height',Math.abs(bot-top)).attr('rx',8).attr('fill',b.color||C.blue).attr('opacity',p>0?1:0);
    if(p>.6) txt(g,x(b.k)+x.bandwidth()/2,Math.min(top,bot)-14,b.label||((b.total?'':'+')+fmt(b.v,o.dec||0)),{anchor:'middle',fs:o.vfs||30,fw:900,fill:b.total?C.t1:C.t1});
    const lines=(b.k).split('|');
    lines.forEach((L,li)=>txt(g,x(b.k)+x.bandwidth()/2,y(0)+34+li*(o.kfs||24)*1.2,L,{anchor:'middle',fs:o.kfs||24,fill:C.t2}));
  });
}

// Donut / share. parts:[{k,v,color}]
function donut(svg,w,h,t,o){
  const r=Math.min(w,h)/2*(o.scale||.82); const cx=o.cx??w/2, cy=o.cy??h/2;
  const g=svg.append('g').attr('transform',`translate(${cx},${cy})`);
  const pie=d3.pie().sort(null).value(d=>d.v)(o.parts);
  const arc=d3.arc().innerRadius(r*.62).outerRadius(r).padAngle(.012).cornerRadius(6);
  const tot=ease(t)*Math.PI*2;
  pie.forEach((p,i)=>{const a0=p.startAngle,a1=Math.min(p.endAngle,tot); if(a1>a0) g.append('path').attr('d',arc({...p,startAngle:a0,endAngle:a1})).attr('fill',o.parts[i].color);});
  if(o.center){txt(g,0,-6,o.center[0],{anchor:'middle',fs:o.cfs||84,fw:900,fill:o.ccolor||C.t1});txt(g,0,o.cfs?o.cfs*.6:54,o.center[1],{anchor:'middle',fs:28,fill:C.t2});}
  return {g,r,pie,arc};
}

// helper to set up svg on .stage
function S(){const {w,h}=stageBox();const svg=d3.select('#s').attr('width',w).attr('height',h);svg.selectAll('*').remove();svg.append('defs');return {svg,w,h};}
