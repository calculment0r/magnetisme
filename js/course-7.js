/* =========================================================
   Schémas du Cours 7 — Câble BNC & impédance
   A vitesse (course lumière vs câble) · B réflexion (terminaison 75/50/ouvert)
   ========================================================= */
(function(){
'use strict';
var MAG=window.MAG; if(!MAG) return;
var Figure=MAG.Figure, COL=MAG.COL, REDUCE=MAG.REDUCE, roundRect=MAG.roundRect;

function pulse(ctx, px, py, col, amp){
  ctx.fillStyle=col; ctx.beginPath();
  for(var i=-13;i<=13;i++){ var g=Math.exp(-(i*i)/34); var yy=py-g*16*amp; if(i===-13)ctx.moveTo(px+i,yy); else ctx.lineTo(px+i,yy); }
  ctx.lineTo(px+13,py); ctx.lineTo(px-13,py); ctx.closePath(); ctx.fill();
}

/* ===== SCHÉMA A — Vitesse : course lumière vs signal dans le câble ===== */
function initSpeed(){
  var cv=document.getElementById('cvSpeed'); if(!cv) return;
  var fig=new Figure(cv, 0.52);
  var state={v:0.5, s:0, last:-1};
  fig.compute=function(){ fig.x0=fig.W*0.13; fig.x1=fig.W*0.88; fig.yL=fig.H*0.34; fig.yC=fig.H*0.70; };
  fig.draw=function(t){
    var ctx=fig.ctx,W=fig.W,H=fig.H, x0=fig.x0, x1=fig.x1, yL=fig.yL, yC=fig.yC;
    ctx.clearRect(0,0,W,H);
    var frac=0.5+state.v*0.45, ratio=1/frac;
    var dt=0; if(state.last>=0&&t>=state.last&&t-state.last<0.2) dt=t-state.last; state.last=t;
    if(!REDUCE) state.s += dt*(0.16+frac*0.4); if(state.s>1) state.s=0;
    var sC=state.s, sL=Math.min(1, sC*ratio);
    // pistes (un seul tube par piste)
    function track(y,label,col){
      ctx.strokeStyle='rgba(13,13,14,.35)'; ctx.lineWidth=4; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(x0,y); ctx.lineTo(x1,y); ctx.stroke();
      ctx.fillStyle=col; ctx.font='600 11px JetBrains Mono, monospace'; ctx.textAlign='left'; ctx.textBaseline='alphabetic';
      ctx.fillText(label, x0, y-13);
    }
    track(yL,'lumière (référence · vitesse c)', COL.ink3);
    pulse(ctx, x0+sL*(x1-x0), yL, 'rgba(13,13,14,.6)', 1);
    track(yC,'signal dans le câble', COL.accent);
    pulse(ctx, x0+sC*(x1-x0), yC, COL.accent, 1);
    // arrivée
    ctx.strokeStyle='rgba(13,13,14,.3)'; ctx.lineWidth=1.5; ctx.setLineDash([4,4]);
    ctx.beginPath(); ctx.moveTo(x1, yL-24); ctx.lineTo(x1, yC+18); ctx.stroke(); ctx.setLineDash([]);
    if(sL>=1 && sC<1){ ctx.fillStyle=COL.ink3; ctx.font='600 10.5px JetBrains Mono, monospace'; ctx.textAlign='right'; ctx.fillText('déjà arrivée', x1-3, yL-26); }
  };
  var sl=document.getElementById('spV'), v=document.getElementById('spVval'), hint=document.getElementById('spHint');
  function refresh(){
    v.textContent='≈ '+Math.round(50+state.v*45)+'% de c';
    hint.textContent='Le signal du câble (orange) arrive toujours après la lumière (gris) : dans un câble, on va plus lentement que c.';
  }
  sl.addEventListener('input',function(){ state.v=parseFloat(sl.value); refresh(); MAG.kick(); });
  refresh(); fig.resize();
}

/* ===== SCHÉMA B — Réflexion / adaptation (terminaison choisie) ===== */
function initCable(){
  var cv=document.getElementById('cvCable'); if(!cv) return;
  var fig=new Figure(cv, 0.52);
  var Zc=75;
  var state={Zt:75, open:false, s:0, dir:1, amp:1, last:-1};
  fig.compute=function(){ fig.x0=fig.W*0.16; fig.x1=fig.W*0.80; fig.cy=fig.H*0.52; };
  function gamma(){ return state.open ? 1 : (state.Zt-Zc)/(state.Zt+Zc); }
  fig.draw=function(t){
    var ctx=fig.ctx,W=fig.W,H=fig.H, x0=fig.x0, x1=fig.x1, cy=fig.cy;
    ctx.clearRect(0,0,W,H);
    // câble (un seul tube)
    ctx.strokeStyle='rgba(13,13,14,.4)'; ctx.lineWidth=5; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(x0,cy); ctx.lineTo(x1,cy); ctx.stroke();
    ctx.fillStyle=COL.ink3; ctx.font='600 11px JetBrains Mono, monospace'; ctx.textAlign='center'; ctx.textBaseline='alphabetic';
    ctx.fillText('câble coaxial · 75 Ω', (x0+x1)/2, cy-24);
    // source
    ctx.fillStyle='rgba(13,13,14,.3)'; roundRect(ctx,x0-18,cy-16,18,32,3); ctx.fill();
    ctx.fillStyle=COL.ink3; ctx.fillText('source 75 Ω', x0-2, cy+30);
    // terminaison
    if(state.open){
      ctx.strokeStyle=COL.ink; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(x1,cy-14); ctx.lineTo(x1,cy+14); ctx.stroke();
      ctx.fillStyle=COL.ink3; ctx.fillText('ouvert ∞', x1+2, cy+30);
    } else {
      ctx.strokeStyle=COL.ink; ctx.lineWidth=2; var zy0=cy-13,zy1=cy+13; ctx.beginPath(); ctx.moveTo(x1,zy0);
      for(var z=0;z<6;z++){ ctx.lineTo(x1+(z%2?8:-8), zy0+(zy1-zy0)*(z+1)/6); } ctx.stroke();
      ctx.fillStyle=COL.ink3; ctx.fillText(state.Zt+' Ω', x1+2, cy+30);
    }
    var g=gamma();
    // impulsion : aller, puis réflexion d'amplitude Γ
    var dt=0; if(state.last>=0&&t>=state.last&&t-state.last<0.2) dt=t-state.last; state.last=t;
    if(!REDUCE) state.s += dt*state.dir*0.5;
    if(state.dir>0 && state.s>=1){
      if(Math.abs(g)<0.02){ state.s=0; state.amp=1; }       // absorbé
      else { state.dir=-1; state.s=1; state.amp=g; }         // réfléchi (signe = inversion)
    }
    if(state.dir<0 && state.s<=0){ state.dir=1; state.s=0; state.amp=1; }
    pulse(ctx, x0+state.s*(x1-x0), cy, state.dir>0?COL.accent:COL.ink, state.amp);
  };
  var b75=document.getElementById('cabT75'), b50=document.getElementById('cabT50'),
      bop=document.getElementById('cabTopen'), hint=document.getElementById('cabHint');
  function setTerm(zt,open){
    state.Zt=zt; state.open=open; state.s=0; state.dir=1; state.amp=1;
    if(b75) b75.classList.toggle('is-active', !open&&zt===75);
    if(b50) b50.classList.toggle('is-active', !open&&zt===50);
    if(bop) bop.classList.toggle('is-active', open);
    var g=gamma(), pct=Math.round(Math.abs(g)*100);
    hint.textContent = Math.abs(g)<0.02
      ? 'Adapté : la terminaison (75 Ω) = l’impédance du câble → tout est absorbé, 0 % de réflexion. Aucun écho.'
      : 'Désadapté : '+pct+' % du signal revient en écho (en sombre). Coefficient Γ = '+g.toFixed(2)+'.';
    fig.draw(0); MAG.kick();
  }
  if(b75) b75.addEventListener('click',function(){ setTerm(75,false); });
  if(b50) b50.addEventListener('click',function(){ setTerm(50,false); });
  if(bop) bop.addEventListener('click',function(){ setTerm(0,true); });
  setTerm(75,false); fig.resize();
}

function boot(){ initSpeed(); initCable(); }
if(document.readyState==='complete') boot();
else window.addEventListener('load', boot);

})();
