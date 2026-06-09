/* =========================================================
   Schémas du Cours 2 — Force de Laplace
   A force sur un fil (vue de côté, F = B·I·L) · B rail · C deux fils
   ========================================================= */
(function(){
'use strict';
var MAG=window.MAG; if(!MAG) return;
var Figure=MAG.Figure, COL=MAG.COL, REDUCE=MAG.REDUCE,
    wireField=MAG.wireField, flowDots=MAG.flowDots, roundRect=MAG.roundRect, vector=MAG.vector;

/* Grille de champ ⊗ (perpendiculaire à l'écran) — pour le rail */
function fieldGrid(ctx, W, H, into, alpha){
  var gap=Math.max(38, W/7.5), r=5;
  var c='rgba(13,13,14,'+(alpha||0.18)+')';
  ctx.strokeStyle=c; ctx.fillStyle=c; ctx.lineWidth=1.2;
  for(var gx=gap*0.6; gx<W; gx+=gap)
    for(var gy=gap*0.6; gy<H; gy+=gap){
      ctx.beginPath(); ctx.arc(gx,gy,r,0,7); ctx.stroke();
      if(into){ var d=r*0.6; ctx.beginPath();
        ctx.moveTo(gx-d,gy-d); ctx.lineTo(gx+d,gy+d);
        ctx.moveTo(gx+d,gy-d); ctx.lineTo(gx-d,gy+d); ctx.stroke(); }
      else{ ctx.beginPath(); ctx.arc(gx,gy,r*0.42,0,7); ctx.fill(); }
    }
}
function caption(ctx, txt, x, y){
  ctx.fillStyle=COL.ink3; ctx.textAlign='left'; ctx.textBaseline='alphabetic';
  ctx.font='600 12px JetBrains Mono, monospace'; ctx.fillText(txt, x, y);
}

/* ===== SCHÉMA A — Force sur un fil (vue de côté) =====
   F = B·I·L : 3 curseurs (champ B, courant I, longueur L) font grandir F.
   Le champ B est perpendiculaire à l'écran (⊗ / ⊙). */
function initL(){
  var cv=document.getElementById('cvL'); if(!cv) return;
  var fig=new Figure(cv, 0.74);
  var state={B:0.6, I:0.55, L:0.6, cur:+1, field:+1};
  fig.compute=function(){ fig.cx=fig.W/2; fig.cy=fig.H/2; };
  function up(){ return state.cur*state.field>0; }
  fig.draw=function(t){
    var ctx=fig.ctx, W=fig.W, H=fig.H, cx=fig.cx, cy=fig.cy;
    ctx.clearRect(0,0,W,H);
    // --- champ B : grille ⊗/⊙ dont densité & opacité suivent le curseur B ---
    var into=state.field>0;
    var al=0.10+0.34*state.B, rr=4+state.B*2.4;
    var gap=Math.max(30, W/(7+state.B*5));
    ctx.strokeStyle='rgba(13,13,14,'+al+')'; ctx.fillStyle='rgba(13,13,14,'+al+')'; ctx.lineWidth=1.2;
    for(var gx=gap*0.6; gx<W; gx+=gap)
      for(var gy=gap*0.6; gy<H; gy+=gap){
        ctx.beginPath(); ctx.arc(gx,gy,rr,0,7); ctx.stroke();
        if(into){ var d=rr*0.6; ctx.beginPath();
          ctx.moveTo(gx-d,gy-d); ctx.lineTo(gx+d,gy+d);
          ctx.moveTo(gx+d,gy-d); ctx.lineTo(gx-d,gy+d); ctx.stroke(); }
        else { ctx.beginPath(); ctx.arc(gx,gy,rr*0.42,0,7); ctx.fill(); }
      }
    caption(ctx, 'B = champ ('+(into?'⊗ vers le fond':'⊙ vers toi')+')', 12, 18);
    // --- le fil vu de côté : longueur = L ---
    var half=W*0.11 + state.L*W*0.33, x0=cx-half, x1=cx+half, bh=11;
    ctx.save();
    ctx.shadowColor='rgba(13,13,14,.15)'; ctx.shadowBlur=6; ctx.shadowOffsetY=2;
    roundRect(ctx, x0, cy-bh/2, x1-x0, bh, bh/2); ctx.fillStyle='rgba(13,13,14,.06)'; ctx.fill();
    ctx.restore();
    roundRect(ctx, x0, cy-bh/2, x1-x0, bh, bh/2); ctx.strokeStyle=COL.ink; ctx.lineWidth=1.6; ctx.stroke();
    // courant : points sombres qui défilent dans le fil (vitesse ∝ I)
    var pts = state.cur>0 ? [{x:x0+6,y:cy},{x:x1-6,y:cy}] : [{x:x1-6,y:cy},{x:x0+6,y:cy}];
    var phase = REDUCE?0:(t*(30+state.I*130));
    flowDots(ctx, pts, phase, 22, 2.6, COL.ink);
    ctx.fillStyle=COL.ink; ctx.font='700 13px JetBrains Mono, monospace'; ctx.textAlign='center'; ctx.textBaseline='alphabetic';
    ctx.fillText('I', cx, cy-bh/2-8);
    // cote de longueur L
    var ly=cy+22;
    ctx.strokeStyle='rgba(13,13,14,.38)'; ctx.lineWidth=1;
    ctx.beginPath();
    ctx.moveTo(x0,ly); ctx.lineTo(x1,ly);
    ctx.moveTo(x0,ly-4); ctx.lineTo(x0,ly+4); ctx.moveTo(x1,ly-4); ctx.lineTo(x1,ly+4); ctx.stroke();
    ctx.fillStyle=COL.ink3; ctx.font='600 12px JetBrains Mono, monospace';
    ctx.fillText('L', cx, ly+15);
    // --- force F = B·I·L ---
    var Fn=state.B*state.I*state.L;
    var flen=Math.min(16 + Fn*(H*0.42), cy-26, H-cy-26);
    var fy0=cy + (up()? -bh/2-2 : bh/2+2);
    vector(ctx, cx, fy0, up()?-Math.PI/2:Math.PI/2, flen, COL.accent, 6);
    var tipY=fy0 + (up()? -flen : flen);
    ctx.fillStyle=COL.accent; ctx.font='700 16px JetBrains Mono, monospace'; ctx.textAlign='center';
    ctx.fillText('F', cx+16, up()? tipY+13 : tipY+5);
    // rappel
    ctx.fillStyle=COL.ink3; ctx.font='500 10.5px JetBrains Mono, monospace'; ctx.textAlign='left';
    ctx.fillText('F = B · I · L — la force grandit avec chacun', 12, H-12);
  };
  var sB=document.getElementById('lB'), vB=document.getElementById('lBval'),
      sI=document.getElementById('lI'), vI=document.getElementById('lIval'),
      sL=document.getElementById('lL'), vL=document.getElementById('lLval'),
      bc=document.getElementById('lCur'), bf=document.getElementById('lField'),
      hint=document.getElementById('lHint');
  function qual(v){ return v<0.4?'faible':v<0.72?'moyen':'fort'; }
  function qualL(v){ return v<0.45?'court':v<0.75?'moyen':'long'; }
  function refresh(){
    if(vB) vB.textContent=qual(state.B);
    if(vI) vI.textContent=(state.I*10).toFixed(0)+' A';
    if(vL) vL.textContent=qualL(state.L);
    hint.textContent='Force vers le '+(up()?'haut':'bas')+
      '. Monte B, I ou L → la flèche F grandit. (Le diamètre du fil, lui, ne change rien.)';
  }
  if(sB) sB.addEventListener('input', function(){ state.B=parseFloat(sB.value); refresh(); MAG.kick(); });
  sI.addEventListener('input', function(){ state.I=parseFloat(sI.value); refresh(); MAG.kick(); });
  if(sL) sL.addEventListener('input', function(){ state.L=parseFloat(sL.value); refresh(); MAG.kick(); });
  bc.addEventListener('click', function(){ state.cur*=-1; refresh(); MAG.kick(); });
  bf.addEventListener('click', function(){ state.field*=-1; refresh(); MAG.kick(); });
  refresh(); fig.resize();
}

/* ===== SCHÉMA B — Rail de Laplace (vue de dessus) =====
   Courant dessiné comme un circuit fermé : haut, bas et les DEUX verticaux
   (connecteur gauche + barre). Vitesse identique partout, ancrée au cadre fixe. */
function initR(){
  var cv=document.getElementById('cvR'); if(!cv) return;
  var fig=new Figure(cv, 0.62);
  var state={I:0.5, dir:+1, field:+1, x:0.30, last:-1};
  fig.compute=function(){
    fig.topY=fig.H*0.30; fig.botY=fig.H*0.80;
    fig.x0=fig.W*0.18; fig.x1=fig.W*0.90;
  };
  fig.draw=function(t){
    var ctx=fig.ctx, W=fig.W, H=fig.H;
    var x0=fig.x0, x1=fig.x1, topY=fig.topY, botY=fig.botY, my=(topY+botY)/2;
    ctx.clearRect(0,0,W,H);
    var eff=state.dir*state.field;   // sens de la force = sens du courant × sens du champ
    fieldGrid(ctx, W, H, state.field>0, 0.14);
    caption(ctx, 'B : champ '+(state.field>0?'⊗ (entre dans l’écran)':'⊙ (sort de l’écran)'), 12, 18);
    // avance de la barre (vitesse ∝ ampérage ; sens = courant × champ)
    var dt=0; if(state.last>=0 && t>=state.last && t-state.last<0.2) dt=t-state.last; state.last=t;
    if(!REDUCE) state.x += dt*state.I*eff*0.42;
    if(state.x>0.90) state.x=0.06; if(state.x<0.06) state.x=0.90;
    var bx=x0 + (x1-x0)*state.x;
    // rails + connecteur gauche (gris, pour que les billes de courant ressortent)
    ctx.strokeStyle='rgba(13,13,14,.5)'; ctx.lineWidth=2.5; ctx.lineCap='round';
    ctx.beginPath();
    ctx.moveTo(x0,topY); ctx.lineTo(x1,topY);
    ctx.moveTo(x0,botY); ctx.lineTo(x1,botY);
    ctx.moveTo(x0,topY); ctx.lineTo(x0,botY);
    ctx.stroke();
    // pile
    ctx.strokeStyle=COL.ink; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(x0-9,my-13); ctx.lineTo(x0+9,my-13);
    ctx.moveTo(x0-4,my-6); ctx.lineTo(x0+4,my-6); ctx.stroke();
    // barre mobile (orange) — dessinée avant les billes
    ctx.save(); ctx.shadowColor='rgba(13,13,14,.2)'; ctx.shadowBlur=10; ctx.shadowOffsetY=2;
    roundRect(ctx, bx-7, topY-7, 14, (botY-topY)+14, 5); ctx.fillStyle=COL.accent; ctx.fill(); ctx.restore();
    // COURANT : billes sombres, MÊME vitesse sur les 4 côtés (phase commune, ancrée au cadre fixe)
    var spacing=24, rr=3.1, d=state.dir;
    var phase=REDUCE?0:(t*(22+state.I*120));
    var off=((phase%spacing)+spacing)%spacing;
    ctx.fillStyle=COL.ink;
    var i;
    for(i=x0+(d>0?off:(spacing-off)); i<=bx+0.5; i+=spacing) dotR(i,topY);     // haut → droite
    for(i=x0+(d>0?(spacing-off):off); i<=bx+0.5; i+=spacing) dotR(i,botY);     // bas → gauche
    for(i=topY+(d>0?off:(spacing-off)); i<=botY+0.5; i+=spacing) dotR(bx,i);   // barre (vertical droit)
    for(i=topY+(d>0?(spacing-off):off); i<=botY+0.5; i+=spacing) dotR(x0,i);   // connecteur gauche (vertical)
    function dotR(x,y){ ctx.beginPath(); ctx.arc(x,y,rr,0,7); ctx.fill(); }
    // label I + force F
    ctx.fillStyle=COL.ink; ctx.textAlign='center'; ctx.font='700 13px JetBrains Mono, monospace';
    ctx.fillText('I', (x0+bx)/2, topY-9);
    vector(ctx, bx + eff*12, my, eff>0?0:Math.PI, 40, COL.accent, 5);
    ctx.fillStyle=COL.accent; ctx.textAlign='center'; ctx.font='700 14px JetBrains Mono, monospace';
    ctx.fillText('F', bx + eff*40, my-12);
  };
  var sl=document.getElementById('rI'), v=document.getElementById('rIval'),
      bd=document.getElementById('rDir'), bf=document.getElementById('rField'), hint=document.getElementById('rHint');
  function refresh(){
    v.textContent=(state.I*10).toFixed(0)+' A';
    var eff=state.dir*state.field;
    hint.textContent='Le courant traverse la barre dans le champ → la force F la pousse vers la '+
      (eff>0?'droite':'gauche')+'. Inverse le courant OU le champ : la force s’inverse.';
  }
  sl.addEventListener('input', function(){ state.I=parseFloat(sl.value); refresh(); MAG.kick(); });
  bd.addEventListener('click', function(){ state.dir*=-1; refresh(); MAG.kick(); });
  if(bf) bf.addEventListener('click', function(){ state.field*=-1; refresh(); MAG.kick(); });
  refresh(); fig.resize();
}

/* ===== SCHÉMA C — Deux fils (loi d'Ampère) ===== */
function initW(){
  var cv=document.getElementById('cvW'); if(!cv) return;
  var fig=new Figure(cv, 0.82);
  var state={same:true};
  fig.compute=function(){
    fig.cy=fig.H/2;
    fig.gap=Math.min(fig.W*0.2, 92);
    fig.baseA=fig.W/2 - fig.gap; fig.baseB=fig.W/2 + fig.gap;
    fig.r=Math.max(12, fig.W*0.032);
  };
  fig.draw=function(t){
    var ctx=fig.ctx, W=fig.W, H=fig.H;
    ctx.clearRect(0,0,W,H);
    var amp=Math.min(20, fig.gap*0.4);
    var disp=REDUCE ? amp*0.6 : amp*(0.5+0.5*Math.sin(t*1.7));
    var ax = fig.baseA + (state.same? +disp : -disp);
    var bx = fig.baseB + (state.same? -disp : +disp);
    var ws=[{x:ax,y:fig.cy,s:+1},{x:bx,y:fig.cy,s:state.same?+1:-1}];
    var field=function(x,y){ return wireField(ws,x,y); };
    var g=Math.max(20,W/22), len=Math.max(6,W/54), mm=0, grid=[];
    for(var gx=g*0.5; gx<W; gx+=g)
      for(var gy=g*0.5; gy<H; gy+=g){
        var f=field(gx,gy); var m=Math.hypot(f.x,f.y); if(m<1e-7) continue;
        grid.push({x:gx,y:gy,a:Math.atan2(f.y,f.x),m:m}); if(m>mm) mm=m;
      }
    ctx.strokeStyle=COL.ink; ctx.lineCap='round'; ctx.lineWidth=1.2;
    grid.forEach(function(q){
      ctx.globalAlpha=Math.min(.34, 0.04+0.5*Math.pow(q.m/mm,0.3));
      ctx.beginPath();
      ctx.moveTo(q.x-Math.cos(q.a)*len, q.y-Math.sin(q.a)*len);
      ctx.lineTo(q.x+Math.cos(q.a)*len, q.y+Math.sin(q.a)*len); ctx.stroke();
    });
    ctx.globalAlpha=1;
    var flen=Math.min(40, (bx-ax)/2 - fig.r - 8);
    if(state.same){
      vector(ctx, ax+fig.r+3, fig.cy, 0,       flen, COL.accent, 4);
      vector(ctx, bx-fig.r-3, fig.cy, Math.PI, flen, COL.accent, 4);
    }else{
      vector(ctx, ax-fig.r-3, fig.cy, Math.PI, flen, COL.accent, 4);
      vector(ctx, bx+fig.r+3, fig.cy, 0,       flen, COL.accent, 4);
    }
    cond(ax, ws[0].s); cond(bx, ws[1].s);
    ctx.fillStyle=COL.accent; ctx.textAlign='center'; ctx.font='700 13px JetBrains Mono, monospace';
    ctx.fillText('F', (ax+bx)/2, fig.cy - fig.r - 12);
    function cond(x, s){
      var r=fig.r;
      ctx.fillStyle=COL.card; ctx.strokeStyle=COL.ink; ctx.lineWidth=2;
      ctx.beginPath(); ctx.arc(x,fig.cy,r,0,7); ctx.fill(); ctx.stroke();
      ctx.strokeStyle=COL.accent; ctx.fillStyle=COL.accent; ctx.lineWidth=2.6; ctx.lineCap='round';
      if(s>0){ ctx.beginPath(); ctx.arc(x,fig.cy,r*0.34,0,7); ctx.fill(); }
      else{ var d=r*0.5; ctx.beginPath();
        ctx.moveTo(x-d,fig.cy-d); ctx.lineTo(x+d,fig.cy+d);
        ctx.moveTo(x+d,fig.cy-d); ctx.lineTo(x-d,fig.cy+d); ctx.stroke(); }
    }
  };
  var bd=document.getElementById('wDir'), hint=document.getElementById('wHint');
  function refresh(){
    hint.textContent = state.same
      ? 'Courants de même sens (⊙ ⊙) → les fils s’attirent.'
      : 'Courants de sens opposés (⊙ ⊗) → les fils se repoussent.';
  }
  bd.addEventListener('click', function(){ state.same=!state.same; fig.compute(); refresh(); MAG.kick(); });
  refresh(); fig.resize();
}

function boot(){ initL(); initR(); initW(); }
if(document.readyState==='complete') boot();
else window.addEventListener('load', boot);

})();
