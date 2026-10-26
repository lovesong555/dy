// animate .node and .arrow elements in DOM order by progress t
function treeAnim(t){const els=[...document.querySelectorAll('.node,.arrow,.reveal')];const n=els.length;
  els.forEach((e,i)=>{const p=easeOut(seg(t,i/n*.8,i/n*.8+.25));e.style.opacity=p;e.style.transform=`translateY(${(1-p)*30}px)`;});}
