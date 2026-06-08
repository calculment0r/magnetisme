/* =========================================================
   Schémas du Cours 4 — Transformateur & induction
   A transformateur (rapport de spires, formule live) · B anneau sauteur (occlusion)
   ========================================================= */
(function(){
'use strict';
var MAG=window.MAG; if(!MAG) return;
var Figure=MAG.Figure, COL=MAG.COL, REDUCE=MAG.REDUCE, roundRect=MAG.roundRect, vector=MAG.vector;

/* ===== SCHÉMA A — Transformateur ===== */
function initTr(){
  var cv=document.getElementById('cvTr'); if(!cv) return;
  var fig=new Figure(cv, 0.7);
  var Np=4;
  var state={Ns:4, off:0, last:-1};
  fig.compute=function(){
    var W=fig.W,H=fig.H;
    fig.lx=W*0.37; fig.rx=W*0.63;
    fig.ty=H*0.30; fig.by=H*0.82;
    fig.lw=Math.min(W*0.07,24);
  };
  fig.draw=function(t){
    var ctx=fig.ctx,W=fig.W,H=fig.H, lx=fig.lx, rx=fig.rx, ty=fig.ty, by=fig.by, lw=fig.lw;
    ctx.clearRect(0,0,W,H);
    var U2=Math.round(230*state.Ns/Np);
    // formule live (en haut)
    ctx.textAlign='center'; ctx.textBaseline='alphabetic';
    ctx.fillStyle=COL.ink; ctx.font='700 15px JetBrains Mono, monospace';
    ctx.fillText('U₂ / U₁ = N₂ / N₁ = '+state.Ns+' / '+Np, W/2, 22);
    ctx.fillStyle=COL.accent; ctx.font='700 14px JetBrains Mono, monospace';
    ctx.fillText('U₂ = 230 × '+state.Ns+'/'+Np+' = '+U2+' V', W/2, 42);
    // noyau (cadre gris épais)
    ctx.strokeStyle='rgba(13,13,14,.20)'; ctx.lineWidth=lw; ctx.lineJoin='round';
    roundRect(ctx, lx, ty, rx-lx, by-ty, 10); ctx.stroke();
    // flux animé : tirets GRIS qui circulent (Φ)
    var dt=0; if(state.last>=0&&t>=state.last&&t-state.last<0.2) dt=t-state.last; state.last=t;
    if(!REDUCE) state.off += dt*60;
    ctx.save();
    ctx.strokeStyle='rgba(13,13,14,.5)'; ctx.lineWidth=2.2; ctx.setLineDash([4,8]); ctx.lineDashOffset=-state.off;
    roundRect(ctx, lx, ty, rx-lx, by-ty, 10); ctx.stroke();
    ctx.restore();
    ctx.fillStyle=COL.ink3; ctx.font='600 11px JetBrains Mono, monospace';
    ctx.fillText('Φ', (lx+rx)/2, ty-4);
    // bobines
    coil(lx, Np, COL.ink);
    coil(rx, state.Ns, COL.accent);
    // tensions sous les bobines
    ctx.font='700 12px JetBrains Mono, monospace';
    ctx.fillStyle=COL.ink;    ctx.fillText('primaire · U₁ 230 V', lx, by+22);
    ctx.fillStyle=COL.accent; ctx.fillText('secondaire · U₂ '+U2+' V', rx, by+22);
    function coil(cx, n, color){
      var span=(by-ty)*0.76, y0=(ty+by)/2 - span/2;
      var r=Math.max(4, Math.min(span/(n*2.1), 12));
      ctx.strokeStyle=color; ctx.lineWidth=3;
      for(var i=0;i<n;i++){
        var yy=y0 + span*(i+0.5)/n;
        ctx.beginPath(); ctx.ellipse(cx, yy, lw*0.6+7, r, 0, 0, Math.PI*2); ctx.stroke();
      }
    }
  };
  var sl=document.getElementById('trN'), vN=document.getElementById('trNval'), hint=document.getElementById('trHint');
  function refresh(){
    state.Ns=Math.round(1+parseFloat(sl.value)*7);
    vN.textContent=state.Ns;
    var kind = state.Ns>Np?'élévateur (tension plus haute)':state.Ns<Np?'abaisseur (tension plus basse)':'1:1 (tension inchangée)';
    hint.textContent='Bouge le curseur : N₂ change, et le rapport N₂/N₁ fixe U₂. Ici, '+kind+'.';
    fig.draw(0); MAG.kick();
  }
  sl.addEventListener('input',refresh);
  refresh(); fig.resize();
}

/* ===== SCHÉMA B — Anneau sauteur (avec occlusion par la barre) ===== */
function initRing(){
  var cv=document.getElementById('cvRing'); if(!cv) return;
  var fig=new Figure(cv, 0.8);
  var state={I:0.6, on:true};
  fig.compute=function(){ fig.cx=fig.W/2; fig.baseY=fig.H*0.86; fig.coreTop=fig.H*0.22; };
  fig.draw=function(t){
    var ctx=fig.ctx,W=fig.W,H=fig.H, cx=fig.cx, baseY=fig.baseY, coreTop=fig.coreTop;
    ctx.clearRect(0,0,W,H);
    var rodW=16, rx=rodW*0.6+11;
    // socle
    ctx.fillStyle='rgba(13,13,14,.12)'; roundRect(ctx, cx-72, baseY, 144, 12, 4); ctx.fill();
    // position de l'anneau
    var coilY0=baseY-70, coilY1=baseY-14, restY=coilY0-12, ringY;
    if(state.on){
      var lift=(restY-coreTop-12)*0.85*state.I;
      var bob=REDUCE?0:Math.sin(t*7)*3;   // léger tremblement constant (la hauteur, elle, dépend du courant)
      ringY=restY-lift+bob; if(ringY<coreTop+8) ringY=coreTop+8;
    } else ringY=restY;
    var coilN=5;
    function arcBack(y,rxx){ ctx.beginPath(); ctx.ellipse(cx,y,rxx,6,0,Math.PI,Math.PI*2); ctx.stroke(); }
    function arcFront(y,rxx){ ctx.beginPath(); ctx.ellipse(cx,y,rxx,6,0,0,Math.PI); ctx.stroke(); }
    // --- ARRIÈRE (derrière la barre) ---
    ctx.strokeStyle = state.on?COL.ink:'rgba(13,13,14,.4)'; ctx.lineWidth=3;
    for(var i=0;i<coilN;i++){ arcBack(coilY0+(coilY1-coilY0)*i/4, rx); }
    ctx.strokeStyle=COL.accent; ctx.lineWidth=5;
    ctx.beginPath(); ctx.ellipse(cx,ringY, rodW*0.6+19, 8, 0, Math.PI, Math.PI*2); ctx.stroke(); // demi-arrière de l'anneau
    // --- LA BARRE (noyau vertical) passe DEVANT ---
    ctx.fillStyle='rgba(13,13,14,.32)'; roundRect(ctx, cx-rodW/2, coreTop, rodW, baseY-coreTop, 4); ctx.fill();
    // --- AVANT (devant la barre) ---
    ctx.strokeStyle = state.on?COL.ink:'rgba(13,13,14,.4)'; ctx.lineWidth=3;
    for(var j=0;j<coilN;j++){ arcFront(coilY0+(coilY1-coilY0)*j/4, rx); }
    ctx.strokeStyle=COL.accent; ctx.lineWidth=5;
    ctx.beginPath(); ctx.ellipse(cx,ringY, rodW*0.6+19, 8, 0, 0, Math.PI); ctx.stroke(); // demi-avant
    // flèches de répulsion
    if(state.on){
      var fl=12+state.I*16;
      vector(ctx, cx-26, ringY-6, -Math.PI/2, fl, COL.accent, 3);
      vector(ctx, cx+26, ringY-6, -Math.PI/2, fl, COL.accent, 3);
    }
  };
  var sl=document.getElementById('ringI'), vI=document.getElementById('ringIval'),
      bOn=document.getElementById('ringOn'), hint=document.getElementById('ringHint');
  function refresh(){
    vI.textContent = state.I<0.4?'faible':state.I<0.72?'moyen':'fort';
    bOn.textContent = state.on?'Couper le courant':'Mettre le courant';
    hint.textContent = state.on
      ? 'Courant alternatif → courant induit dans l’anneau → il est repoussé et lévite. Plus de courant = plus haut.'
      : 'Sans courant, pas d’induction : l’anneau retombe sur la bobine.';
  }
  sl.addEventListener('input',function(){ state.I=parseFloat(sl.value); refresh(); MAG.kick(); });
  bOn.addEventListener('click',function(){ state.on=!state.on; refresh(); MAG.kick(); });
  refresh(); fig.resize();
}

function boot(){ initTr(); initRing(); }
if(document.readyState==='complete') boot();
else window.addEventListener('load', boot);

})();
