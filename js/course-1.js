/* =========================================================
   Schémas du Cours 1 — Le champ magnétique
   A aimants · B entrefer · C courant · D bobine
   ========================================================= */
(function(){
'use strict';
var MAG=window.MAG; if(!MAG) return;
var Figure=MAG.Figure, COL=MAG.COL, REDUCE=MAG.REDUCE,
    poleField=MAG.poleField, wireField=MAG.wireField, streamline=MAG.streamline,
    smoothPath=MAG.smoothPath, arrowAt=MAG.arrowAt, flowDots=MAG.flowDots, roundRect=MAG.roundRect;

/* ===== SCHÉMA A — Lignes de champ d'un aimant ===== */
function initA(){
  var cv=document.getElementById('cvA'); if(!cv) return;
  var fig=new Figure(cv, 0.92);
  var state={two:false, flipped:false, drag:0};
  function geom(){
    var W=fig.W, H=fig.H;
    fig.cx=W/2; fig.cy=H/2;
    fig.bw=Math.min(W*0.30, 150);
    fig.bh=Math.min(H*0.16, 46);
    fig.q=fig.bw*fig.bw*0.42;
  }
  function magnetPoles(cx, flip){
    var off=fig.bw*0.42;
    var nx=cx-off, sx=cx+off;
    if(flip){ var t=nx; nx=sx; sx=t; }
    return [{x:nx,y:fig.cy,q:fig.q,pole:'N'},{x:sx,y:fig.cy,q:-fig.q,pole:'S'}];
  }
  fig.compute=function(){
    geom();
    var W=fig.W,H=fig.H;
    var poles;
    if(state.two){
      var sep=fig.bw*1.9 + state.drag;
      poles=magnetPoles(fig.cx-sep/2,false).concat(magnetPoles(fig.cx+sep/2,state.flipped));
      fig.mags=[{cx:fig.cx-sep/2,flip:false},{cx:fig.cx+sep/2,flip:state.flipped}];
    }else{
      poles=magnetPoles(fig.cx,false);
      fig.mags=[{cx:fig.cx,flip:false}];
    }
    fig.poles=poles;
    fig.field=function(x,y){ return poleField(poles,x,y); };
    var bounds={x0:-40,y0:-40,x1:W+40,y1:H+40};
    var sinks=poles.filter(function(p){return p.q<0;});
    var lines=[]; var seeds=12;
    poles.forEach(function(p){
      if(p.q<=0) return;
      for(var i=0;i<seeds;i++){
        var a=(i/seeds)*Math.PI*2 + 0.26;
        var r=fig.bh*0.62;
        var sx=p.x+Math.cos(a)*r, sy=p.y+Math.sin(a)*r;
        lines.push(streamline(fig.field, sx,sy, +1, 5, 420, bounds, sinks));
      }
    });
    fig.lines=lines;
    var grid=[]; var gap=Math.max(20, W/22);
    for(var gx=gap*0.5; gx<W; gx+=gap){
      for(var gy=gap*0.5; gy<H; gy+=gap){
        var f=fig.field(gx,gy); var m=Math.hypot(f.x,f.y);
        if(m<1e-6) continue;
        grid.push({x:gx,y:gy, a:Math.atan2(f.y,f.x),m:m});
      }
    }
    var mm=0; grid.forEach(function(g){ if(g.m>mm)mm=g.m; });
    grid.forEach(function(g){ g.al=Math.min(.4, 0.06+0.5*Math.pow(g.m/mm,0.32)); });
    fig.grid=grid;
  };
  function drawMagnet(ctx, cx, flip){
    var x=cx-fig.bw/2, y=fig.cy-fig.bh/2, w=fig.bw, h=fig.bh, r=6;
    var leftN = !flip;
    ctx.save();
    ctx.shadowColor='rgba(13,13,14,.18)'; ctx.shadowBlur=12; ctx.shadowOffsetY=3;
    roundRect(ctx,x,y,w,h,r); ctx.fillStyle=COL.card; ctx.fill();
    ctx.shadowColor='transparent';
    ctx.save(); roundRect(ctx,x,y,w,h,r); ctx.clip();
    ctx.fillStyle = leftN?COL.accent:COL.ink; ctx.fillRect(x,y,w/2,h);
    ctx.fillStyle = leftN?COL.ink:COL.accent; ctx.fillRect(x+w/2,y,w/2,h);
    ctx.restore();
    roundRect(ctx,x,y,w,h,r); ctx.lineWidth=1; ctx.strokeStyle='rgba(13,13,14,.25)'; ctx.stroke();
    ctx.fillStyle='#fff'; ctx.font='600 '+Math.round(h*0.5)+'px JetBrains Mono, monospace';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(leftN?'N':'S', x+w*0.25, fig.cy+1);
    ctx.fillText(leftN?'S':'N', x+w*0.75, fig.cy+1);
    ctx.restore();
  }
  fig.draw=function(t){
    var ctx=fig.ctx, W=fig.W, H=fig.H;
    ctx.clearRect(0,0,W,H);
    ctx.strokeStyle=COL.ink; ctx.lineCap='round'; ctx.lineWidth=1.4;
    var len=Math.max(7, W/46);
    fig.grid.forEach(function(g){
      ctx.globalAlpha=g.al;
      ctx.beginPath();
      ctx.moveTo(g.x-Math.cos(g.a)*len, g.y-Math.sin(g.a)*len);
      ctx.lineTo(g.x+Math.cos(g.a)*len, g.y+Math.sin(g.a)*len);
      ctx.stroke();
    });
    ctx.globalAlpha=1;
    ctx.strokeStyle='rgba(13,13,14,.5)'; ctx.lineWidth=1.6;
    fig.lines.forEach(function(pts){ ctx.beginPath(); smoothPath(ctx,pts); ctx.stroke(); });
    var phase=REDUCE?0:(t*26);
    fig.lines.forEach(function(pts){
      flowDots(ctx, pts, phase, 46, 2.1, COL.accent);
      arrowAt(ctx, pts, 0.5, 5.5, 'rgba(13,13,14,.55)');
    });
    fig.mags.forEach(function(m){ drawMagnet(ctx, m.cx, m.flip); });
    // repère d'interactivité : le 2ᵉ aimant se glisse au doigt
    if(state.two && state.drag===0){
      var m2=fig.mags[fig.mags.length-1];
      ctx.fillStyle=COL.accent; ctx.font='600 12px JetBrains Mono, monospace';
      ctx.textAlign='center'; ctx.textBaseline='alphabetic';
      ctx.fillText('↔ glisse-moi', m2.cx, fig.cy - fig.bh/2 - 12);
    }
  };
  var dragging=false, startX=0, startDrag=0;
  function px(e){ var r=cv.getBoundingClientRect(); return (e.touches?e.touches[0].clientX:e.clientX)-r.left; }
  cv.addEventListener('pointerdown', function(e){
    if(!state.two) return;
    dragging=true; cv.style.cursor='grabbing'; startX=px(e); startDrag=state.drag; cv.setPointerCapture(e.pointerId);
  });
  cv.addEventListener('pointermove', function(e){
    if(!dragging) return;
    var d=px(e)-startX;
    state.drag=Math.max(-fig.bw*0.9, Math.min(fig.bw*2.4, startDrag+d));
    fig.compute(); fig.draw(0);
  });
  cv.addEventListener('pointerup', function(){ dragging=false; cv.style.cursor=state.two?'grab':'default'; });
  cv.addEventListener('pointercancel', function(){ dragging=false; cv.style.cursor=state.two?'grab':'default'; });
  var bToggle=document.getElementById('aToggle');
  var bFlip=document.getElementById('aFlip');
  var hint=document.getElementById('aHint');
  function refreshUI(){
    cv.style.cursor = state.two ? 'grab' : 'default';
    bToggle.textContent = state.two ? '◖ 1 aimant' : '◗ 2 aimants';
    bFlip.style.display = state.two ? '' : 'none';
    if(state.two){
      bFlip.textContent = 'Retourner le 2ᵉ aimant ⇄';
      hint.textContent = state.flipped
        ? 'RÉPULSION — deux pôles identiques se font face (S et S), les lignes se repoussent. Glisse le 2ᵉ aimant.'
        : 'ATTRACTION — un Nord et un Sud se font face, les lignes se rejoignent. Glisse le 2ᵉ aimant.';
    }else{
      hint.textContent = 'Un seul aimant : les lignes sortent du Nord, entrent au Sud.';
    }
  }
  bToggle.addEventListener('click', function(){
    state.two=!state.two; if(state.two){ state.drag=0; state.flipped=false; }
    fig.compute(); fig.draw(0); refreshUI();
  });
  bFlip.addEventListener('click', function(){
    state.flipped=!state.flipped; fig.compute(); fig.draw(0); refreshUI();
  });
  refreshUI();
  fig.resize();
}

/* ===== SCHÉMA B — L'entrefer (aimant en U) ===== */
function initB(){
  var cv=document.getElementById('cvB'); if(!cv) return;
  var fig=new Figure(cv, 0.82);
  fig.compute=function(){
    var W=fig.W, H=fig.H;
    var gap=Math.min(W*0.30, 130);
    var faceY0=H*0.30, faceY1=H*0.74;
    var cx=W/2;
    fig.gx0=cx-gap/2; fig.gx1=cx+gap/2; fig.fy0=faceY0; fig.fy1=faceY1;
    var poles=[]; var n=7; var q=gap*gap*0.05;
    for(var i=0;i<n;i++){
      var ty=faceY0+(faceY1-faceY0)*(i/(n-1));
      poles.push({x:fig.gx0, y:ty, q:+q});
      poles.push({x:fig.gx1, y:ty, q:-q});
    }
    fig.poles=poles;
    fig.field=function(x,y){ return poleField(poles,x,y); };
    var bounds={x0:-30,y0:-30,x1:W+30,y1:H+30};
    var sinks=poles.filter(function(p){return p.q<0;});
    var lines=[]; var m=9;
    for(var j=0;j<m;j++){
      var sy=faceY0+ (faceY1-faceY0)*(j/(m-1));
      lines.push(streamline(fig.field, fig.gx0+3, sy, +1, 4, 260, bounds, sinks));
    }
    [-1,1].forEach(function(s){
      for(var k=0;k<2;k++){
        var sy=(k===0?faceY0:faceY1);
        lines.push(streamline(fig.field, fig.gx0+3, sy, +1, 4, 300, bounds, sinks));
      }
    });
    fig.lines=lines;
  };
  fig.draw=function(t){
    var ctx=fig.ctx, W=fig.W, H=fig.H;
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle='rgba(201,255,60,.16)';
    ctx.fillRect(fig.gx0, fig.fy0, fig.gx1-fig.gx0, fig.fy1-fig.fy0);
    ctx.strokeStyle='rgba(13,13,14,.5)'; ctx.lineWidth=1.7; ctx.lineCap='round';
    fig.lines.forEach(function(pts){ ctx.beginPath(); smoothPath(ctx,pts); ctx.stroke(); });
    var phase=REDUCE?0:(t*28);
    fig.lines.forEach(function(pts){
      flowDots(ctx, pts, phase, 40, 2.1, COL.accent);
      arrowAt(ctx, pts, 0.5, 5.5, 'rgba(13,13,14,.55)');
    });
    var armW=Math.min(W*0.13,52);
    (function drawU(){
      var x0=fig.gx0, x1=fig.gx1, y0=fig.fy0, y1=fig.fy1;
      ctx.save();
      ctx.shadowColor='rgba(13,13,14,.18)'; ctx.shadowBlur=12; ctx.shadowOffsetY=3;
      bar(x0-armW, y0, armW, y1-y0, COL.accent, 'N');
      bar(x1, y0, armW, y1-y0, COL.ink, 'S');
      ctx.shadowColor='transparent';
      ctx.fillStyle=COL.ink;
      roundRect(ctx, x0-armW, y1, (x1+armW)-(x0-armW), armW*0.7, 6); ctx.fill();
      ctx.fillStyle=COL.accent; ctx.fillRect(x0-armW, y1, ((x0+x1)/2)-(x0-armW), armW*0.7);
      ctx.restore();
      function bar(bx,by,bw,bh,c,lab){
        roundRect(ctx,bx,by,bw,bh,6); ctx.fillStyle=c; ctx.fill();
        ctx.fillStyle='#fff'; ctx.font='600 '+Math.round(armW*0.42)+'px JetBrains Mono, monospace';
        ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText(lab, bx+bw/2, by+bh*0.18);
      }
    })();
  };
  fig.resize();
}

/* ===== SCHÉMA C — Champ d'un courant (vue en coupe) ===== */
function initC(){
  var cv=document.getElementById('cvC'); if(!cv) return;
  var fig=new Figure(cv, 0.86);
  var state={I:0.55, out:true};
  fig.compute=function(){
    var W=fig.W,H=fig.H;
    fig.cx=W/2; fig.cy=H/2;
    fig.maxR=Math.min(W,H)*0.42;
  };
  fig.draw=function(t){
    var ctx=fig.ctx, W=fig.W, H=fig.H, cx=fig.cx, cy=fig.cy;
    ctx.clearRect(0,0,W,H);
    var s = state.out?+1:-1;                 // +1 = courant vers toi (⊙)
    var nRings=Math.round(2+state.I*4);      // plus d'intensité = plus d'anneaux (champ plus fort)
    for(var i=1;i<=nRings;i++){
      var r=fig.maxR*(i/(nRings+0.3));       // rayons FIXES : les anneaux ne bougent pas
      var alpha=0.14+0.45*state.I;
      ctx.strokeStyle=COL.ink; ctx.globalAlpha=alpha; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.arc(cx,cy,r,0,7); ctx.stroke();
      // flèches tangentielles : elles donnent le SENS du champ (qui s'inverse avec le courant)
      ctx.globalAlpha=Math.min(1,alpha+0.3);
      for(var k=0;k<3;k++){
        var ang=(k/3)*Math.PI*2 + i*0.3;     // positions fixes (léger décalage par anneau)
        var ax=cx+Math.cos(ang)*r, ay=cy+Math.sin(ang)*r;
        var tang=ang - s*Math.PI/2;          // sens horaire / anti-horaire selon le courant
        ctx.save(); ctx.translate(ax,ay); ctx.rotate(tang);
        ctx.fillStyle=COL.accent;
        var sz=6+state.I*4;
        ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-sz,sz*0.6); ctx.lineTo(-sz,-sz*0.6);
        ctx.closePath(); ctx.fill(); ctx.restore();
      }
    }
    ctx.globalAlpha=1;
    var wr=Math.max(13, fig.maxR*0.13);
    ctx.fillStyle=COL.card; ctx.strokeStyle=COL.ink; ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(cx,cy,wr,0,7); ctx.fill(); ctx.stroke();
    ctx.strokeStyle=COL.accent; ctx.lineWidth=2.4; ctx.lineCap='round';
    if(state.out){
      ctx.fillStyle=COL.accent; ctx.beginPath(); ctx.arc(cx,cy,wr*0.34,0,7); ctx.fill();
    }else{
      var d=wr*0.5;
      ctx.beginPath(); ctx.moveTo(cx-d,cy-d); ctx.lineTo(cx+d,cy+d);
      ctx.moveTo(cx+d,cy-d); ctx.lineTo(cx-d,cy+d); ctx.stroke();
    }
  };
  var sl=document.getElementById('cI');
  var bDir=document.getElementById('cDir');
  var vI=document.getElementById('cIval');
  var hint=document.getElementById('cHint');
  function refresh(){
    vI.textContent=(state.I*10).toFixed(0)+' A';
    bDir.textContent = state.out ? 'Le courant sort de l’écran ⊙' : 'Le courant entre dans l’écran ⊗';
    hint.textContent = state.out
      ? 'Courant vers toi : les lignes s’enroulent dans le sens anti-horaire (main droite, pouce vers toi).'
      : 'Courant qui s’enfonce : les lignes s’enroulent dans le sens horaire.';
  }
  sl.addEventListener('input', function(){ state.I=parseFloat(sl.value); fig.draw(0); refresh(); });
  bDir.addEventListener('click', function(){ state.out=!state.out; fig.draw(0); refresh(); });
  refresh();
  fig.resize();
}

/* ===== SCHÉMA D — Du fil à la bobine ===== */
function initD(){
  var cv=document.getElementById('cvD'); if(!cv) return;
  var fig=new Figure(cv, 0.82);
  var state={coil:0};
  fig.compute=function(){
    var W=fig.W,H=fig.H;
    fig.cx=W/2; fig.cy=H/2;
    var turns=Math.round(1+state.coil*5);
    var spread=Math.min(W*0.62, 320) * (0.42+0.58*(1-state.coil*0.35));
    var sepTop=Math.min(H*0.16,52)*(0.5+0.5*state.coil);
    var topY=fig.cy-sepTop, botY=fig.cy+sepTop;
    var wires=[];
    fig.turns=[];
    for(var i=0;i<turns;i++){
      var fx = turns===1 ? fig.cx : fig.cx - spread/2 + spread*(i/(turns-1));
      wires.push({x:fx, y:topY, s:-1});
      wires.push({x:fx, y:botY, s:+1});
      fig.turns.push({x:fx, topY:topY, botY:botY});
    }
    fig.wires=wires;
    fig.field=function(x,y){ return wireField(wires,x,y); };
    var bounds={x0:-30,y0:-30,x1:W+30,y1:H+30};
    var lines=[];
    var L=fig.turns[0].x, R=fig.turns[turns-1].x;
    var count=8;
    for(var j=0;j<count;j++){
      var yy=topY + (botY-topY)*(j+0.5)/count;
      lines.push(streamline(fig.field, (L+R)/2, yy, +1, 4, 360, bounds, null));
      lines.push(streamline(fig.field, (L+R)/2, yy, -1, 4, 360, bounds, null));
    }
    fig.lines=lines;
    var fInt=fig.field((L+R)/2, fig.cy);
    fig.poleRightIsN = fInt.x>0;
  };
  fig.draw=function(t){
    var ctx=fig.ctx, W=fig.W, H=fig.H;
    ctx.clearRect(0,0,W,H);
    ctx.strokeStyle='rgba(13,13,14,.42)'; ctx.lineWidth=1.5; ctx.lineCap='round';
    fig.lines.forEach(function(pts){ ctx.beginPath(); smoothPath(ctx,pts); ctx.stroke(); });
    var phase=REDUCE?0:(t*26);
    fig.lines.forEach(function(pts){ flowDots(ctx,pts,phase,44,1.9,COL.accent); });
    fig.turns.forEach(function(tn){
      cond(ctx, tn.x, tn.topY, false);
      cond(ctx, tn.x, tn.botY, true);
    });
    if(fig.turns.length>=2){
      var L=fig.turns[0].x, R=fig.turns[fig.turns.length-1].x;
      var rN=fig.poleRightIsN;
      label(ctx, (rN?R: L)+ (rN? 26: -26), fig.cy, 'N', COL.accent);
      label(ctx, (rN?L: R)+ (rN? -26: 26), fig.cy, 'S', COL.ink);
    }
    function cond(ctx,x,y,out){
      var r=Math.max(8, W*0.018);
      ctx.fillStyle=COL.card; ctx.strokeStyle=COL.ink; ctx.lineWidth=1.6;
      ctx.beginPath(); ctx.arc(x,y,r,0,7); ctx.fill(); ctx.stroke();
      ctx.strokeStyle=COL.accent; ctx.fillStyle=COL.accent; ctx.lineWidth=1.8; ctx.lineCap='round';
      if(out){ ctx.beginPath(); ctx.arc(x,y,r*0.32,0,7); ctx.fill(); }
      else{ var d=r*0.45; ctx.beginPath(); ctx.moveTo(x-d,y-d); ctx.lineTo(x+d,y+d); ctx.moveTo(x+d,y-d); ctx.lineTo(x-d,y+d); ctx.stroke(); }
    }
    function label(ctx,x,y,txt,c){
      ctx.fillStyle=c; ctx.font='600 20px JetBrains Mono, monospace';
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(txt,x,y);
    }
  };
  var sl=document.getElementById('dCoil');
  var hint=document.getElementById('dHint');
  function refresh(){
    var n=Math.round(1+state.coil*5);
    hint.textContent = n<=1
      ? '1 spire : un seul anneau (en coupe : 1 point en haut, 1 en bas). Ajoute des spires → les pôles apparaissent.'
      : state.coil<0.6
        ? n+' spires : les champs s’additionnent ; un Nord et un Sud apparaissent aux extrémités.'
        : 'Bobine serrée = électroaimant : champ uniforme à l’intérieur, pôles N/S aux bouts.';
  }
  sl.addEventListener('input', function(){ state.coil=parseFloat(sl.value); fig.compute(); fig.draw(0); refresh(); });
  refresh();
  fig.resize();
}

function boot(){ initA(); initB(); initC(); initD(); }
if(document.readyState==='complete') boot();
else window.addEventListener('load', boot);

})();
