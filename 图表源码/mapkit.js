// shared map helpers
async function loadWorld(res='50m'){const w=await (await fetch(`countries-${res}.json`)).json();return topojson.feature(w,w.objects.countries).features;}
function drawRoute(g,proj,pts,t,opt){ // pts [[lon,lat],...], t in 0..1
  const line=d3.line().curve(d3.curveCatmullRom.alpha(.6));
  const d=line(pts.map(p=>proj(p))); const w=opt.w||8;
  const glow=g.append('path').attr('d',d).attr('fill','none').attr('stroke',opt.color).attr('stroke-opacity',.22).attr('stroke-width',w*3).attr('stroke-linecap','round');
  const path=g.append('path').attr('d',d).attr('fill','none').attr('stroke',opt.color).attr('stroke-width',w).attr('stroke-linecap','round');
  const L=path.node().getTotalLength();
  glow.attr('stroke-dasharray',`${L*t} ${L+1}`);
  if(opt.dash){
    const id='m'+Math.random().toString(36).slice(2);
    const m=g.append('mask').attr('id',id).attr('maskUnits','userSpaceOnUse');
    m.append('path').attr('d',d).attr('fill','none').attr('stroke','#fff').attr('stroke-width',w*4).attr('stroke-dasharray',`${L*t} ${L+1}`);
    path.attr('stroke-dasharray',opt.dash).attr('mask',`url(#${id})`);
  } else path.attr('stroke-dasharray',`${L*t} ${L+1}`);
  if(t>0&&t<1){const pt=path.node().getPointAtLength(L*t);g.append('circle').attr('cx',pt.x).attr('cy',pt.y).attr('r',w*1.4).attr('fill','#fff').attr('stroke',opt.color).attr('stroke-width',4);}
  return path;
}
function cityDot(g,xy,label,opt={}){
  const [x,y]=xy; const c=opt.color||'#fff';
  g.append('circle').attr('cx',x).attr('cy',y).attr('r',opt.r||22).attr('fill',c).attr('opacity',.18);
  g.append('circle').attr('cx',x).attr('cy',y).attr('r',(opt.r||22)*.42).attr('fill',c).attr('stroke','#0a0f1e').attr('stroke-width',3);
  if(label){const tx=g.append('text').attr('x',x+(opt.dx||0)).attr('y',y+(opt.dy||-30)).attr('text-anchor',opt.anchor||'middle').attr('fill','#f3f5fa').attr('font-size',opt.fs||30).attr('font-weight',700).attr('paint-order','stroke').attr('stroke','#0a0f1e').attr('stroke-width',8).text(label);
    if(opt.sub) g.append('text').attr('x',x+(opt.dx||0)).attr('y',y+(opt.dy||-30)+(opt.fs||30)*1.1).attr('text-anchor',opt.anchor||'middle').attr('fill','#b9c2d8').attr('font-size',(opt.fs||30)*.72).attr('font-weight',500).attr('paint-order','stroke').attr('stroke','#0a0f1e').attr('stroke-width',8).text(opt.sub);}
}
function baseMap(svg,features,proj,hl={}){
  const path=d3.geoPath(proj);
  const g=svg.append('g');
  g.selectAll('path').data(features).join('path').attr('d',path)
   .attr('fill',d=>hl[d.properties.name]||'#18223f').attr('stroke','#2b375a').attr('stroke-width',1.2);
  return g;
}
