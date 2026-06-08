/* =========================================================
   Schémas du Cours 3 — Moteur, induction, générateur
   A moteur (couple) · B induction (glisser l'aimant) · C générateur (sinus)
   ========================================================= */
(function(){
'use strict';
var MAG=window.MAG; if(!MAG) return;
var Figure=MAG.Figure, COL=MAG.COL, REDUCE=MAG.REDUCE, roundRect=MAG.roundRect, vector=MAG.vector;

/* ===== SCHÉMA A — Moteur (le couple) ===== */
function initMot(){
  var cv=document.getElementById('cvMot'); if(!cv) return;
  var fig=new Figure(cv, 0.8);
  var state={I:0.55, dir:+1, th:0, last:-1};
  fig.compute=function(){ fig.cx=fig.W/2; fig.cy=fig.H/2; fig.R=Math.min(fig.W,fig.H)*0.24; };
  function pole(ctx,x,y,w,h,c,lab){
    ctx.fillStyle=c; roundRect(ctx,x,y,w,h,6); ctx.fill();
    ctx.fillStyle='#fff'; ctx.font='600 '+Math.round(w*0.5)+'px JetBrains Mono, monospace';
    ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(lab,x+w/2,y+h/2);
  }
  fig.draw=function(t){
    var ctx=fig.ctx,W=fig.W,H=fig.H,cx=fig.cx,cy=fig.cy,R=fig.R;
    ctx.clearRect(0,0,W,H);
    var pw=Math.min(W*0.10,42), ph=H*0.52, py=cy-ph/2;
    pole(ctx,W*0.05,py,pw,ph,COL.accent,'N');
    pole(ctx,W*0.95-pw,py,pw,ph,COL.ink,'S');
    ctx.strokeStyle='rgba(13,13,14,.10)'; ctx.lineWidth=1;
    for(var kk=0;kk<5;kk++){ var yy=py+ph*(kk+0.5)/5; ctx.beginPath(); ctx.moveTo(W*0.05+pw,yy); ctx.lineTo(W*0.95-pw,yy); ctx.stroke(); }
    var dt=0; if(state.last>=0&&t>=state.last&&t-state.last<0.2) dt=t-state.last; state.last=t;
    if(!REDUCE) state.th += dt*state.dir*(0.5+state.I*3.4);
    var th=state.th;
    ctx.strokeStyle='rgba(13,13,14,.35)'; ctx.setLineDash([4,4]); ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(cx,cy-R-18); ctx.lineTo(cx,cy+R+18); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle=COL.ink; ctx.lineWidth=5; ctx.lineCap='round';
    ctx.beginPath(); ctx.arc(cx,cy,R,0,7); ctx.stroke();
    ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+Math.cos(th)*R, cy+Math.sin(th)*R); ctx.stroke();
    ctx.fillStyle=COL.ink; ctx.beginPath(); ctx.arc(cx,cy,4,0,7); ctx.fill();
    var flen=20+state.I*26;
    [0,Math.PI].forEach(function(a0){
      var a=th+a0, px=cx+Math.cos(a)*R, py2=cy+Math.sin(a)*R, tang=a + state.dir*Math.PI/2;
      vector(ctx, px, py2, tang, flen, COL.accent, 4);
    });
  };
  var sl=document.getElementById('motI'), v=document.getElementById('motIval'),
      bd=document.getElementById('motDir'), hint=document.getElementById('motHint');
  function refresh(){
    v.textContent=(state.I*10).toFixed(0)+' A';
    hint.textContent='Le courant crée deux forces opposées (un couple) → la bobine tourne vers la '+
      (state.dir>0?'droite':'gauche')+'. Plus de courant = plus vite.';
  }
  sl.addEventListener('input',function(){ state.I=parseFloat(sl.value); refresh(); MAG.kick(); });
  bd.addEventListener('click',function(){ state.dir*=-1; refresh(); MAG.kick(); });
  refresh(); fig.resize();
}

/* ===== SCHÉMA B — Induction (glisser l'aimant) ===== */
function initInd(){
  var cv=document.getElementById('cvInd'); if(!cv) return;
  var fig=new Figure(cv, 0.8);
  var state={mx:0.10, prev:0.10, needle:0, last:-1, dragging:false};
  fig.compute=function(){
    fig.cy=fig.H*0.40;
    fig.x0=fig.W*0.10; fig.x1=fig.W*0.50;
    fig.coilX=fig.W*0.66;
    fig.mw=Math.min(fig.W*0.16,72); fig.mh=Math.min(fig.H*0.20,44);
    fig.gX=fig.W*0.86; fig.gY=fig.H*0.74;
  };
  function magnet(ctx,x,y,w,h){
    ctx.save(); ctx.shadowColor='rgba(13,13,14,.2)'; ctx.shadowBlur=8; ctx.shadowOffsetY=2;
    roundRect(ctx,x-w/2,y-h/2,w,h,5); ctx.fillStyle=COL.card; ctx.fill(); ctx.restore();
    ctx.save(); roundRect(ctx,x-w/2,y-h/2,w,h,5); ctx.clip();
    ctx.fillStyle=COL.ink; ctx.fillRect(x-w/2,y-h/2,w/2,h);
    ctx.fillStyle=COL.accent; ctx.fillRect(x,y-h/2,w/2,h);
    ctx.restore();
    roundRect(ctx,x-w/2,y-h/2,w,h,5); ctx.strokeStyle='rgba(13,13,14,.25)'; ctx.lineWidth=1; ctx.stroke();
    ctx.fillStyle='#fff'; ctx.font='600 '+Math.round(h*0.46)+'px JetBrains Mono, monospace';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('S',x-w*0.25,y); ctx.fillText('N',x+w*0.25,y);
  }
  fig.draw=function(t){
    var ctx=fig.ctx,W=fig.W,H=fig.H, cy=fig.cy;
    ctx.clearRect(0,0,W,H);
    var dt=0; if(state.last>=0&&t>=state.last&&t-state.last<0.2) dt=t-state.last; state.last=t;
    var v=(dt>0 && state.dragging) ? (state.mx-state.prev)/dt : 0;
    state.prev=state.mx;
    var target=Math.max(-1,Math.min(1, v*0.5));
    state.needle += (target-state.needle)*0.25;
    if(Math.abs(state.needle)<0.003) state.needle=0;
    // bobine (solénoïde) à droite
    var cX=fig.coilX, ch=Math.min(H*0.34,120), n=5;
    ctx.strokeStyle=COL.ink; ctx.lineWidth=3;
    for(var i=0;i<n;i++){ var yy=cy-ch/2+ch*i/(n-1); ctx.beginPath(); ctx.ellipse(cX,yy,13,7,0,0,Math.PI*2); ctx.stroke(); }
    // fils vers galvanomètre
    ctx.lineWidth=2;
    ctx.beginPath();
    ctx.moveTo(cX+13,cy-ch/2); ctx.lineTo(fig.gX,cy-ch/2); ctx.lineTo(fig.gX,fig.gY-22);
    ctx.moveTo(cX+13,cy+ch/2); ctx.lineTo(fig.gX,cy+ch/2); ctx.lineTo(fig.gX,fig.gY+22);
    ctx.stroke();
    // galvanomètre
    var gx=fig.gX, gy=fig.gY, r=Math.min(W*0.085,36);
    ctx.fillStyle=COL.card; ctx.strokeStyle=COL.ink; ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(gx,gy,r,Math.PI,0); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle='rgba(13,13,14,.25)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(gx,gy); ctx.lineTo(gx,gy-r*0.92); ctx.stroke();
    ctx.fillStyle=COL.ink3; ctx.font='600 9px JetBrains Mono, monospace'; ctx.textAlign='center'; ctx.textBaseline='alphabetic';
    ctx.fillText('0',gx,gy-r*0.92-3);
    var ang=-Math.PI/2 + state.needle*0.95;
    ctx.strokeStyle=COL.accent; ctx.lineWidth=2.6; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(gx,gy); ctx.lineTo(gx+Math.cos(ang)*r*0.82, gy+Math.sin(ang)*r*0.82); ctx.stroke();
    ctx.fillStyle=COL.ink; ctx.beginPath(); ctx.arc(gx,gy,3,0,7); ctx.fill();
    // aimant
    var mxpx=fig.x0+state.mx*(fig.x1-fig.x0);
    magnet(ctx,mxpx,cy,fig.mw,fig.mh);
    // indice de mouvement
    ctx.fillStyle=COL.ink3; ctx.font='600 11px JetBrains Mono, monospace'; ctx.textAlign='left'; ctx.textBaseline='alphabetic';
    ctx.fillText(Math.abs(state.needle)>0.06 ? 'tension induite !' : 'immobile : aucune tension', 12, H-12);
  };
  function px(e){ var r=cv.getBoundingClientRect(); return ((e.touches?e.touches[0].clientX:e.clientX)-r.left); }
  function setMx(xpx){ var f=(xpx-fig.x0)/(fig.x1-fig.x0); state.mx=Math.max(0,Math.min(1,f)); }
  cv.addEventListener('pointerdown',function(e){ state.dragging=true; state.prev=state.mx; setMx(px(e)); try{cv.setPointerCapture(e.pointerId);}catch(_){ } MAG.kick(); });
  cv.addEventListener('pointermove',function(e){ if(state.dragging){ setMx(px(e)); MAG.kick(); } });
  cv.addEventListener('pointerup',function(){ state.dragging=false; });
  cv.addEventListener('pointercancel',function(){ state.dragging=false; });
  var hint=document.getElementById('indHint');
  if(hint) hint.textContent='Glisse l’aimant vers la bobine ou éloigne-le : l’aiguille dévie. Arrête-toi : plus rien. Seule la variation compte.';
  fig.resize();
}

/* ===== SCHÉMA C — Générateur (sinusoïde) ===== */
function initGen(){
  var cv=document.getElementById('cvGen'); if(!cv) return;
  var fig=new Figure(cv, 0.7);
  var state={spd:0.5, th:0, last:-1};
  fig.compute=function(){
    fig.leftX=fig.W*0.22; fig.cy=fig.H/2; fig.R=Math.min(fig.W*0.12,fig.H*0.28);
    fig.px0=fig.W*0.44; fig.px1=fig.W*0.95;
  };
  fig.draw=function(t){
    var ctx=fig.ctx,W=fig.W,H=fig.H, lx=fig.leftX, cy=fig.cy, R=fig.R;
    ctx.clearRect(0,0,W,H);
    var dt=0; if(state.last>=0&&t>=state.last&&t-state.last<0.2) dt=t-state.last; state.last=t;
    if(!REDUCE) state.th += dt*(0.6+state.spd*5);
    var th=state.th;
    // bobine fixe (deux arcs)
    ctx.strokeStyle='rgba(13,13,14,.32)'; ctx.lineWidth=3;
    ctx.beginPath(); ctx.arc(lx,cy,R*1.5,Math.PI*0.62,Math.PI*1.38); ctx.stroke();
    ctx.beginPath(); ctx.arc(lx,cy,R*1.5,-Math.PI*0.38,Math.PI*0.38); ctx.stroke();
    // aimant tournant
    ctx.save(); ctx.translate(lx,cy); ctx.rotate(th);
    roundRect(ctx,-R,-R*0.34,2*R,R*0.68,R*0.2); ctx.fillStyle=COL.ink; ctx.fill();
    ctx.save(); roundRect(ctx,-R,-R*0.34,2*R,R*0.68,R*0.2); ctx.clip();
    ctx.fillStyle=COL.accent; ctx.fillRect(0,-R*0.34,R,R*0.68); ctx.restore();
    ctx.fillStyle='#fff'; ctx.font='600 '+Math.round(R*0.42)+'px JetBrains Mono, monospace'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('N',R*0.5,0); ctx.fillText('S',-R*0.5,0);
    ctx.restore();
    ctx.fillStyle=COL.ink; ctx.beginPath(); ctx.arc(lx,cy,3,0,7); ctx.fill();
    // plot sinus
    var px0=fig.px0, px1=fig.px1, amp=(H*0.30)*(0.25+0.75*state.spd), k=0.02+state.spd*0.06;
    ctx.strokeStyle='rgba(13,13,14,.2)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(px0,cy); ctx.lineTo(px1,cy); ctx.stroke();
    ctx.strokeStyle=COL.accent; ctx.lineWidth=2.5; ctx.lineCap='round'; ctx.beginPath();
    for(var x=px0;x<=px1;x++){ var y=cy - amp*Math.sin(th - (x-px0)*k); if(x===px0) ctx.moveTo(x,y); else ctx.lineTo(x,y); }
    ctx.stroke();
    var y0=cy - amp*Math.sin(th);
    ctx.fillStyle=COL.accent; ctx.beginPath(); ctx.arc(px0,y0,4,0,7); ctx.fill();
    ctx.fillStyle=COL.ink3; ctx.font='600 11px JetBrains Mono, monospace'; ctx.textAlign='left'; ctx.textBaseline='alphabetic';
    ctx.fillText('tension induite (alternative)', px0, Math.min(H-6, cy+amp+16));
  };
  var sl=document.getElementById('genV'), v=document.getElementById('genVval'), hint=document.getElementById('genHint');
  function refresh(){
    v.textContent = state.spd<0.4?'lente':state.spd<0.72?'moyenne':'rapide';
    hint.textContent='Tourne plus vite → la tension oscille plus vite et plus fort. C’est du courant alternatif.';
  }
  sl.addEventListener('input',function(){ state.spd=parseFloat(sl.value); refresh(); MAG.kick(); });
  refresh(); fig.resize();
}

function boot(){ initMot(); initInd(); initGen(); }
if(document.readyState==='complete') boot();
else window.addEventListener('load', boot);

})();
