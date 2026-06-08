/* =========================================================
   Schémas du Cours 6 — Déphasage, onde EM, polarisation
   A déphasage U/I (cos φ) · B onde E/B · C filtre polarisant
   ========================================================= */
(function(){
'use strict';
var MAG=window.MAG; if(!MAG) return;
var Figure=MAG.Figure, COL=MAG.COL, REDUCE=MAG.REDUCE, roundRect=MAG.roundRect, vector=MAG.vector;

/* ===== SCHÉMA A — Déphasage tension / courant ===== */
function initPhase(){
  var cv=document.getElementById('cvPhase'); if(!cv) return;
  var fig=new Figure(cv, 0.6);
  var state={phi:0};
  fig.compute=function(){ fig.px0=fig.W*0.08; fig.px1=fig.W*0.94; fig.cy=fig.H/2; fig.amp=fig.H*0.32; };
  fig.draw=function(t){
    var ctx=fig.ctx,W=fig.W,H=fig.H, px0=fig.px0, px1=fig.px1, cy=fig.cy, amp=fig.amp;
    ctx.clearRect(0,0,W,H);
    var ph=REDUCE?0:(t*1.6), k=0.045;
    ctx.strokeStyle='rgba(13,13,14,.18)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(px0,cy); ctx.lineTo(px1,cy); ctx.stroke();
    ctx.strokeStyle=COL.ink; ctx.lineWidth=2.4; ctx.lineCap='round'; ctx.beginPath();
    for(var x=px0;x<=px1;x++){ var y=cy-Math.sin((x-px0)*k-ph)*amp; if(x===px0)ctx.moveTo(x,y); else ctx.lineTo(x,y); }
    ctx.stroke();
    ctx.strokeStyle=COL.accent; ctx.lineWidth=2.6; ctx.beginPath();
    for(var x2=px0;x2<=px1;x2++){ var y2=cy-Math.sin((x2-px0)*k-ph-state.phi)*amp*0.9; if(x2===px0)ctx.moveTo(x2,y2); else ctx.lineTo(x2,y2); }
    ctx.stroke();
  };
  var sl=document.getElementById('phPhi'), v=document.getElementById('phVal'), hint=document.getElementById('phHint');
  function refresh(){
    state.phi=parseFloat(sl.value)*Math.PI/2;
    var deg=Math.round(state.phi*180/Math.PI), c=Math.cos(state.phi);
    v.textContent=deg+'°';
    hint.textContent='cos φ = '+c.toFixed(2)+' → '+Math.round(c*100)+'% de la puissance est utile'+(deg===0?' (tout est utile).':(deg>=88?' (presque rien !).':'.'));
    fig.draw(0); MAG.kick();
  }
  sl.addEventListener('input',refresh);
  refresh(); fig.resize();
}

/* ===== SCHÉMA B — Onde électromagnétique ===== */
function initWave(){
  var cv=document.getElementById('cvWave'); if(!cv) return;
  var fig=new Figure(cv, 0.62);
  fig.compute=function(){ fig.px0=fig.W*0.08; fig.px1=fig.W*0.94; fig.cy=fig.H*0.52; fig.amp=Math.min(fig.H*0.26,90); };
  fig.draw=function(t){
    var ctx=fig.ctx,W=fig.W,H=fig.H, px0=fig.px0, px1=fig.px1, cy=fig.cy, amp=fig.amp;
    ctx.clearRect(0,0,W,H);
    var ph=REDUCE?0:(t*2), k=0.05, persp={x:0.55,y:0.34};
    ctx.strokeStyle='rgba(13,13,14,.2)'; ctx.lineWidth=1; ctx.setLineDash([4,5]);
    ctx.beginPath(); ctx.moveTo(px0,cy); ctx.lineTo(px1,cy); ctx.stroke(); ctx.setLineDash([]);
    function val(x){ return Math.sin((x-px0)*k-ph); }
    ctx.strokeStyle='rgba(13,13,14,.5)'; ctx.lineWidth=2; ctx.beginPath();
    for(var x=px0;x<=px1;x+=2){ var b=val(x)*amp; var bx=x+b*persp.x, by=cy+b*persp.y; if(x===px0)ctx.moveTo(bx,by); else ctx.lineTo(bx,by); }
    ctx.stroke();
    ctx.strokeStyle='rgba(13,13,14,.22)'; ctx.lineWidth=1;
    for(var xb=px0;xb<=px1;xb+=22){ var b2=val(xb)*amp; ctx.beginPath(); ctx.moveTo(xb,cy); ctx.lineTo(xb+b2*persp.x, cy+b2*persp.y); ctx.stroke(); }
    ctx.strokeStyle=COL.accent; ctx.lineWidth=2.6; ctx.beginPath();
    for(var x2=px0;x2<=px1;x2+=2){ var e=val(x2)*amp; if(x2===px0)ctx.moveTo(x2,cy-e); else ctx.lineTo(x2,cy-e); }
    ctx.stroke();
    ctx.strokeStyle='rgba(255,79,26,.35)'; ctx.lineWidth=1;
    for(var xe=px0;xe<=px1;xe+=22){ var e2=val(xe)*amp; ctx.beginPath(); ctx.moveTo(xe,cy); ctx.lineTo(xe,cy-e2); ctx.stroke(); }
    ctx.font='700 13px JetBrains Mono, monospace'; ctx.textBaseline='alphabetic';
    ctx.fillStyle=COL.accent; ctx.textAlign='left'; ctx.fillText('E', px0+4, cy-amp-4);
    ctx.fillStyle=COL.ink3; ctx.fillText('B', px0+4, cy+amp*persp.y+18);
    ctx.fillStyle=COL.ink3; ctx.font='600 11px JetBrains Mono, monospace'; ctx.textAlign='right';
    ctx.fillText('→ propagation (vitesse c)', px1, cy-6);
  };
  var hint=document.getElementById('waveHint');
  if(hint) hint.textContent='E (vertical) et B (perpendiculaire) oscillent ensemble et avancent à la vitesse de la lumière.';
  fig.resize();
}

/* ===== SCHÉMA C — Filtre polarisant (projection + ce que tu vois) ===== */
function initPol(){
  var cv=document.getElementById('cvPol'); if(!cv) return;
  var fig=new Figure(cv, 0.62);
  var state={a:0};
  fig.compute=function(){
    fig.cy=fig.H/2; fig.gx=fig.W*0.30; fig.R=Math.min(fig.W*0.17,fig.H*0.32);
    fig.dx=fig.W*0.74; fig.dr=Math.min(fig.W*0.13,fig.H*0.30);
  };
  fig.draw=function(){
    var ctx=fig.ctx,W=fig.W,H=fig.H, gx=fig.gx, cy=fig.cy, R=fig.R;
    ctx.clearRect(0,0,W,H);
    var th=state.a*Math.PI/2, c=Math.cos(th), I=c*c;
    var axdx=Math.sin(th), axdy=-Math.cos(th);
    function dbl(x,y,ang,len,col,wd){ vector(ctx,x,y,ang,len,col,wd); vector(ctx,x,y,ang+Math.PI,len,col,wd); }
    // lumière entrante (verticale, encre)
    dbl(gx,cy,-Math.PI/2,R,'rgba(13,13,14,.55)',3);
    ctx.fillStyle=COL.ink3; ctx.font='600 11px JetBrains Mono, monospace'; ctx.textAlign='center'; ctx.textBaseline='alphabetic';
    ctx.fillText('lumière', gx, cy-R-9);
    // axe du filtre + lames
    ctx.strokeStyle=COL.ink; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(gx-axdx*R*1.15, cy-axdy*R*1.15); ctx.lineTo(gx+axdx*R*1.15, cy+axdy*R*1.15); ctx.stroke();
    ctx.strokeStyle='rgba(13,13,14,.32)'; ctx.lineWidth=1;
    for(var s=-R;s<=R;s+=9){ var ox=gx+axdx*s, oy=cy+axdy*s; ctx.beginPath(); ctx.moveTo(ox+axdy*6, oy-axdx*6); ctx.lineTo(ox-axdy*6, oy+axdx*6); ctx.stroke(); }
    ctx.fillStyle=COL.ink3; ctx.fillText('axe du filtre', gx, cy+R+16);
    // projection (pointillés) du bout de la lumière sur l'axe
    var ppx=gx+axdx*c*R, ppy=cy+axdy*c*R;
    ctx.strokeStyle='rgba(13,13,14,.4)'; ctx.lineWidth=1; ctx.setLineDash([3,4]);
    ctx.beginPath(); ctx.moveTo(gx, cy-R); ctx.lineTo(ppx,ppy); ctx.stroke(); ctx.setLineDash([]);
    // composante transmise (accent) le long de l'axe
    dbl(gx,cy, Math.atan2(axdy,axdx), R*Math.max(0.04,c), COL.accent, 4);
    // résultat : pastille de luminosité (ce qu'on voit)
    var dx=fig.dx, dr=fig.dr;
    ctx.fillStyle=COL.card; ctx.beginPath(); ctx.arc(dx,cy,dr,0,7); ctx.fill();
    ctx.fillStyle='rgba(13,13,14,'+(1-I).toFixed(3)+')'; ctx.beginPath(); ctx.arc(dx,cy,dr,0,7); ctx.fill();
    ctx.strokeStyle=COL.ink; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(dx,cy,dr,0,7); ctx.stroke();
    ctx.fillStyle=COL.ink3; ctx.font='600 11px JetBrains Mono, monospace'; ctx.textAlign='center';
    ctx.fillText('ce que tu vois', dx, cy-dr-10);
    ctx.fillStyle=COL.ink; ctx.font='700 14px JetBrains Mono, monospace';
    ctx.fillText('passe '+Math.round(I*100)+'%', dx, cy+dr+22);
  };
  var sl=document.getElementById('polA'), v=document.getElementById('polVal'), hint=document.getElementById('polHint');
  function refresh(){
    state.a=parseFloat(sl.value); var deg=Math.round(state.a*90);
    v.textContent=deg+'°';
    var c=Math.cos(deg*Math.PI/180);
    hint.textContent = deg<=2 ? 'Filtre aligné sur la lumière : tout passe (100%).'
      : deg>=88 ? 'Filtre croisé (90°) : plus rien ne passe. C’est ainsi qu’on supprime un reflet.'
      : 'La part transmise = cos²(angle), soit '+Math.round(c*c*100)+'% ici.';
    fig.draw(); MAG.kick();
  }
  sl.addEventListener('input',refresh);
  refresh(); fig.resize();
}

function boot(){ initPhase(); initWave(); initPol(); }
if(document.readyState==='complete') boot();
else window.addEventListener('load', boot);

})();
