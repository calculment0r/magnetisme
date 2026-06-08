/* =========================================================
   Schémas du Cours 5 — AC→DC, micro dynamique, hystérésis
   A redressement/lissage · B micro dynamique · C boucle d'hystérésis
   ========================================================= */
(function(){
'use strict';
var MAG=window.MAG; if(!MAG) return;
var Figure=MAG.Figure, COL=MAG.COL, REDUCE=MAG.REDUCE, roundRect=MAG.roundRect, vector=MAG.vector;

/* ===== SCHÉMA A — Redressement puis lissage ===== */
function initRect(){
  var cv=document.getElementById('cvRect'); if(!cv) return;
  var fig=new Figure(cv, 0.6);
  var state={stage:0};
  fig.compute=function(){ fig.px0=fig.W*0.08; fig.px1=fig.W*0.94; fig.cy=fig.H/2; fig.amp=fig.H*0.30; };
  fig.draw=function(t){
    var ctx=fig.ctx,W=fig.W,H=fig.H, px0=fig.px0, px1=fig.px1, cy=fig.cy, amp=fig.amp;
    ctx.clearRect(0,0,W,H);
    var ph=REDUCE?0:(t*1.6), k=0.045;
    // axe zéro
    ctx.strokeStyle='rgba(13,13,14,.18)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(px0,cy); ctx.lineTo(px1,cy); ctx.stroke();
    function sig(x){ return Math.sin((x-px0)*k - ph); }
    // entrée (référence, sombre clair)
    ctx.strokeStyle='rgba(13,13,14,.28)'; ctx.lineWidth=1.5; ctx.beginPath();
    for(var x=px0;x<=px1;x++){ var y=cy-sig(x)*amp; if(x===px0)ctx.moveTo(x,y); else ctx.lineTo(x,y); }
    ctx.stroke();
    // sortie (accent) selon l'étape
    ctx.strokeStyle=COL.accent; ctx.lineWidth=2.8; ctx.lineCap='round'; ctx.beginPath();
    for(var x2=px0;x2<=px1;x2++){
      var s=sig(x2), out;
      if(state.stage===0) out=s;
      else if(state.stage===1) out=Math.abs(s);
      else out=0.86 + 0.05*Math.abs(Math.sin((x2-px0)*k*2 - ph)); // lissé : presque plat, léger ondulé
      var y=cy-out*amp; if(x2===px0)ctx.moveTo(x2,y); else ctx.lineTo(x2,y);
    }
    ctx.stroke();
  };
  var bAC=document.getElementById('rectAC'), bRed=document.getElementById('rectRed'),
      bFilt=document.getElementById('rectFilt'), hint=document.getElementById('rectHint');
  function setStage(n){
    state.stage=n;
    [bAC,bRed,bFilt].forEach(function(b,i){ if(b) b.classList.toggle('is-active', i===n); });
    hint.textContent = n===0 ? 'Tension alternative : elle monte et descend, et passe par le négatif.'
      : n===1 ? 'Redressée : les alternances négatives sont retournées vers le haut — toujours positive, mais bosselée.'
      : 'Lissée par le filtre (condensateur) : un continu presque plat, utilisable par l’appareil.';
    fig.draw(0); MAG.kick();
  }
  if(bAC) bAC.addEventListener('click',function(){ setStage(0); });
  if(bRed) bRed.addEventListener('click',function(){ setStage(1); });
  if(bFilt) bFilt.addEventListener('click',function(){ setStage(2); });
  setStage(0); fig.resize();
}

/* ===== SCHÉMA B — Micro dynamique ===== */
function initMic(){
  var cv=document.getElementById('cvMic'); if(!cv) return;
  var fig=new Figure(cv, 0.62);
  var state={V:0.55};
  fig.compute=function(){ fig.cy=fig.H/2; fig.memX=fig.W*0.34; fig.px0=fig.W*0.52; fig.px1=fig.W*0.94; };
  fig.draw=function(t){
    var ctx=fig.ctx,W=fig.W,H=fig.H, cy=fig.cy, memX=fig.memX;
    ctx.clearRect(0,0,W,H);
    var w=REDUCE?0:Math.sin(t*5);
    var ampM=(W*0.035)*(0.25+0.75*state.V);
    var mx=memX + w*ampM;
    // ondes sonores (arcs à gauche)
    ctx.strokeStyle='rgba(13,13,14,.3)'; ctx.lineWidth=2;
    for(var a=0;a<3;a++){ var rr=(W*0.05)*(a+1)+ (REDUCE?0:(t*30)%(W*0.05)); ctx.beginPath(); ctx.arc(memX-W*0.20, cy, rr, -0.7, 0.7); ctx.stroke(); }
    // aimant (bloc en U simplifié) autour de la membrane
    ctx.fillStyle='rgba(13,13,14,.14)';
    roundRect(ctx, memX-8, cy-H*0.26, 60, 18, 4); ctx.fill();
    roundRect(ctx, memX-8, cy+H*0.26-18, 60, 18, 4); ctx.fill();
    // membrane + bobine (oscille horizontalement)
    ctx.strokeStyle=COL.ink; ctx.lineWidth=4; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(mx, cy-H*0.20); ctx.lineTo(mx, cy+H*0.20); ctx.stroke();
    ctx.strokeStyle=COL.ink; ctx.lineWidth=2.5;
    for(var c=0;c<3;c++){ ctx.beginPath(); ctx.ellipse(mx+10, cy-14+c*14, 9, 6, 0,0,Math.PI*2); ctx.stroke(); }
    // tige
    ctx.beginPath(); ctx.moveTo(mx, cy); ctx.lineTo(mx+10, cy); ctx.stroke();
    // sortie : tension induite (sinus) à droite, amplitude ∝ V
    var px0=fig.px0, px1=fig.px1, amp=(H*0.26)*(0.18+0.82*state.V), k=0.05, ph=REDUCE?0:(t*5);
    ctx.strokeStyle='rgba(13,13,14,.18)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(px0,cy); ctx.lineTo(px1,cy); ctx.stroke();
    ctx.strokeStyle=COL.accent; ctx.lineWidth=2.6; ctx.lineCap='round'; ctx.beginPath();
    for(var x=px0;x<=px1;x++){ var y=cy-amp*Math.sin((x-px0)*k - ph); if(x===px0)ctx.moveTo(x,y); else ctx.lineTo(x,y); }
    ctx.stroke();
    ctx.fillStyle=COL.ink3; ctx.font='600 11px JetBrains Mono, monospace'; ctx.textAlign='left'; ctx.textBaseline='alphabetic';
    ctx.fillText('tension induite', px0, Math.min(H-6, cy+amp+16));
  };
  var sl=document.getElementById('micV'), v=document.getElementById('micVval'), hint=document.getElementById('micHint');
  function refresh(){
    v.textContent = state.V<0.4?'faible':state.V<0.72?'moyen':'fort';
    hint.textContent='Le son fait vibrer la membrane et la bobine dans l’aimant → une tension est induite. Plus le son est fort, plus le signal est grand.';
  }
  sl.addEventListener('input',function(){ state.V=parseFloat(sl.value); refresh(); MAG.kick(); });
  refresh(); fig.resize();
}

/* ===== SCHÉMA C — Boucle d'hystérésis ===== */
function initHyst(){
  var cv=document.getElementById('cvHyst'); if(!cv) return;
  var fig=new Figure(cv, 0.78);
  var state={H:0.5, prev:0.5, dir:1};
  fig.compute=function(){ fig.cx=fig.W/2; fig.cy=fig.H/2; fig.sx=Math.min(fig.W*0.36,180); fig.sy=Math.min(fig.H*0.36,150); };
  function Bup(h){ return Math.tanh(3*(h-0.35)); }   // champ croissant
  function Bdn(h){ return Math.tanh(3*(h+0.35)); }   // champ décroissant
  fig.draw=function(){
    var ctx=fig.ctx,W=fig.W,H=fig.H, cx=fig.cx, cy=fig.cy, sx=fig.sx, sy=fig.sy;
    ctx.clearRect(0,0,W,H);
    // axes
    ctx.strokeStyle='rgba(13,13,14,.22)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(cx-sx,cy); ctx.lineTo(cx+sx,cy); ctx.moveTo(cx,cy-sy); ctx.lineTo(cx,cy+sy); ctx.stroke();
    ctx.fillStyle=COL.ink3; ctx.font='600 11px JetBrains Mono, monospace';
    ctx.textAlign='right'; ctx.textBaseline='alphabetic'; ctx.fillText('B', cx-6, cy-sy+12);
    ctx.textAlign='left'; ctx.fillText('H', cx+sx-12, cy+16);
    // boucle (deux branches) faible
    ctx.strokeStyle='rgba(13,13,14,.35)'; ctx.lineWidth=1.6; ctx.lineCap='round';
    ctx.beginPath(); var h,first=true;
    for(h=-1;h<=1.0001;h+=0.02){ var x=cx+h*sx, y=cy-Bup(h)*sy; if(first){ctx.moveTo(x,y);first=false;} else ctx.lineTo(x,y); }
    ctx.stroke();
    ctx.beginPath(); first=true;
    for(h=1;h>=-1.0001;h-=0.02){ var x2=cx+h*sx, y2=cy-Bdn(h)*sy; if(first){ctx.moveTo(x2,y2);first=false;} else ctx.lineTo(x2,y2); }
    ctx.stroke();
    // point courant
    var Hc=state.H*2-1;
    var B=(state.dir>=0?Bup(Hc):Bdn(Hc));
    var ptx=cx+Hc*sx, pty=cy-B*sy;
    ctx.fillStyle=COL.accent; ctx.beginPath(); ctx.arc(ptx,pty,6,0,7); ctx.fill();
    ctx.strokeStyle=COL.card; ctx.lineWidth=2; ctx.stroke();
  };
  var sl=document.getElementById('hystH'), v=document.getElementById('hystVal'), hint=document.getElementById('hystHint');
  function refresh(){
    var nv=parseFloat(sl.value);
    state.dir = nv>=state.prev ? 1 : -1; state.prev=nv; state.H=nv;
    v.textContent = state.dir>=0?'→ croissant':'← décroissant';
    hint.textContent='Va-et-vient sur le champ : l’aimantation ne repasse pas par le même chemin (montée vs descente). C’est la mémoire du fer.';
    fig.draw(); MAG.kick();
  }
  sl.addEventListener('input',refresh);
  refresh(); fig.resize();
}

function boot(){ initRect(); initMic(); initHyst(); }
if(document.readyState==='complete') boot();
else window.addEventListener('load', boot);

})();
