/* =========================================================
   Moteur partagé des schémas interactifs — Magnétisme pour l'image
   Canvas haute densité, boucle d'animation à la demande, auto-réparante.
   Exposé via window.MAG pour être réutilisé par chaque cours.
   ========================================================= */
(function(){
'use strict';

/* ---------- Palette (lue depuis le CSS) ---------- */
var CSS = getComputedStyle(document.documentElement);
function tok(n, fb){ var v = CSS.getPropertyValue(n).trim(); return v || fb; }
var COL = {
  ink:   tok('--ink','#0d0d0e'),
  ink3:  tok('--ink-3','#5a5a5c'),
  accent:tok('--accent','#ff4f1a'),
  flow:  tok('--flow','#ff6b1a'),
  lime:  tok('--accent-2','#c9ff3c'),
  card:  tok('--bg-card','#ffffff')
};
var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Boucle d'animation globale (à la demande) ---------- */
var figures = [];
var rafId = 0;
function frame(ts){
  rafId = 0;
  var alive = false;
  for(var i=0;i<figures.length;i++){
    var f = figures[i];
    if(!f.ready){
      // filet de sécurité : retente le dimensionnement tant que la mise en page n'existe pas
      if(f.canvas.parentNode && f.canvas.parentNode.clientWidth){ f.resize(); }
      if(!f.ready) alive = true;
      continue;
    }
    if(f.visible){
      try{ f.draw(ts/1000); }catch(e){ /* une figure ne doit pas tuer les autres */ }
      if(!REDUCE) alive = true;   // on n'anime que les figures visibles
    }
  }
  if(alive) rafId = requestAnimationFrame(frame);  // s'arrête seule quand rien n'anime
}
function kick(){ if(!rafId){ rafId = requestAnimationFrame(frame); } }

/* ---------- Base figure (canvas haute densité) ---------- */
function Figure(canvas, aspect){
  this.canvas = canvas;
  this.ctx = canvas.getContext('2d');
  this.aspect = aspect;           // hauteur = largeur * aspect
  this.W = 0; this.H = 0; this.dpr = 1;
  this.visible = true;
  this.ready = false;
  var self = this;
  this._ro = new ResizeObserver(function(){ self.resize(); });
  this._ro.observe(canvas.parentNode);
  this.resize();
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(es){
      self.visible = es[0].isIntersecting;
      if(self.visible) kick();
    }, {rootMargin:'80px'}).observe(canvas);
  }
  figures.push(this);
  kick();
}
Figure.prototype.resize = function(){
  var cssW = this.canvas.parentNode.clientWidth;
  if(!cssW) return;
  var cssH = Math.round(cssW * this.aspect);
  this.dpr = Math.min(window.devicePixelRatio||1, 2.5);
  this.canvas.width = Math.round(cssW * this.dpr);
  this.canvas.height = Math.round(cssH * this.dpr);
  this.canvas.style.height = cssH + 'px';
  this.ctx.setTransform(this.dpr,0,0,this.dpr,0,0);
  this.W = cssW; this.H = cssH;
  if(this.compute){ this.compute(); this.ready = true; this.draw(0); }
};

/* ---------- Maths : champ de pôles (aimants) ---------- */
// poles: [{x,y,q}]  champ = Σ q*(d)/r^3
function poleField(poles, x, y){
  var fx=0, fy=0;
  for(var i=0;i<poles.length;i++){
    var p=poles[i];
    var dx=x-p.x, dy=y-p.y;
    var r2=dx*dx+dy*dy;
    var r=Math.sqrt(r2)+1e-3;
    var inv=p.q/(r2*r+1e-3);
    fx+=dx*inv; fy+=dy*inv;
  }
  return {x:fx, y:fy};
}
// courants rectilignes (vue en coupe) : [{x,y,s}] s=+1 sortant (CCW), -1 entrant (CW)
function wireField(wires, x, y){
  var fx=0, fy=0;
  for(var i=0;i<wires.length;i++){
    var w=wires[i];
    var dx=x-w.x, dy=y-w.y;
    var r2=dx*dx+dy*dy+9;          // +9 : noyau du fil
    var inv=w.s/r2;
    fx+= -dy*inv; fy+= dx*inv;     // sortant => CCW
  }
  return {x:fx, y:fy};
}

/* ---------- Tracé de ligne de champ (intégration RK2) ---------- */
function streamline(field, sx, sy, dir, step, maxSteps, bounds, stopNear){
  var pts=[{x:sx,y:sy}];
  var x=sx, y=sy;
  for(var i=0;i<maxSteps;i++){
    var f=field(x,y);
    var m=Math.hypot(f.x,f.y);
    if(m<1e-7) break;
    var ux=dir*f.x/m, uy=dir*f.y/m;
    var mx=x+ux*step*0.5, my=y+uy*step*0.5;
    var f2=field(mx,my); var m2=Math.hypot(f2.x,f2.y)||1;
    x+= dir*f2.x/m2*step; y+= dir*f2.y/m2*step;
    pts.push({x:x,y:y});
    if(x<bounds.x0||x>bounds.x1||y<bounds.y0||y>bounds.y1) break;
    if(stopNear){
      for(var k=0;k<stopNear.length;k++){
        if(Math.hypot(x-stopNear[k].x, y-stopNear[k].y) < step*1.2) return pts;
      }
    }
  }
  return pts;
}

/* ---------- Helpers de dessin ---------- */
function smoothPath(ctx, pts){
  if(pts.length<2) return;
  ctx.moveTo(pts[0].x, pts[0].y);
  for(var i=1;i<pts.length-1;i++){
    var xc=(pts[i].x+pts[i+1].x)/2, yc=(pts[i].y+pts[i+1].y)/2;
    ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
  }
  ctx.lineTo(pts[pts.length-1].x, pts[pts.length-1].y);
}
function arrowAt(ctx, pts, frac, size, color){
  if(pts.length<2) return;
  var idx=Math.max(1,Math.min(pts.length-1, Math.floor(pts.length*frac)));
  var a=pts[idx-1], b=pts[idx];
  var ang=Math.atan2(b.y-a.y, b.x-a.x);
  ctx.save();
  ctx.translate(b.x,b.y); ctx.rotate(ang);
  ctx.fillStyle=color;
  ctx.beginPath();
  ctx.moveTo(0,0); ctx.lineTo(-size, size*0.55); ctx.lineTo(-size, -size*0.55);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}
// point qui circule le long d'une polyligne (longueur cumulée)
function flowDots(ctx, pts, phase, spacing, r, color){
  if(pts.length<2) return;
  var acc=0, target=phase%spacing;
  ctx.fillStyle=color;
  for(var i=1;i<pts.length;i++){
    var dx=pts[i].x-pts[i-1].x, dy=pts[i].y-pts[i-1].y;
    var seg=Math.hypot(dx,dy);
    while(target < acc+seg){
      var t=(target-acc)/seg;
      var px=pts[i-1].x+dx*t, py=pts[i-1].y+dy*t;
      ctx.beginPath(); ctx.arc(px,py,r,0,7); ctx.fill();
      target+=spacing;
    }
    acc+=seg;
  }
}
// rectangle arrondi (compat)
function roundRect(ctx,x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);
  ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
}
// petite flèche orientée (pour vecteurs : force, etc.)
function vector(ctx, x, y, ang, len, color, width){
  ctx.save();
  ctx.translate(x,y); ctx.rotate(ang);
  ctx.strokeStyle=color; ctx.fillStyle=color;
  ctx.lineWidth=width||3; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(len-7,0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(len,0); ctx.lineTo(len-11,6); ctx.lineTo(len-11,-6);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

/* ---------- Export ---------- */
window.MAG = {
  COL: COL, REDUCE: REDUCE,
  Figure: Figure, kick: kick,
  poleField: poleField, wireField: wireField, streamline: streamline,
  smoothPath: smoothPath, arrowAt: arrowAt, flowDots: flowDots,
  roundRect: roundRect, vector: vector
};
// relances de sécurité globales
window.addEventListener('load', kick);
window.addEventListener('resize', kick);
window.addEventListener('scroll', kick, {passive:true});

})();
