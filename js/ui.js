/* =========================================================
   Interface — hero, quiz, glossaire, progression
   ========================================================= */
(function(){
'use strict';

/* ---------- Anneaux concentriques animés (hero) ---------- */
function ringMotif(){
  var host=document.getElementById('heroRings'); if(!host) return;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ns='http://www.w3.org/2000/svg';
  var svg=document.createElementNS(ns,'svg');
  svg.setAttribute('viewBox','0 0 400 400');
  svg.setAttribute('width','100%'); svg.setAttribute('height','100%');
  var g=document.createElementNS(ns,'g');
  g.setAttribute('transform','translate(200 200)');
  svg.appendChild(g);
  var N=9;
  for(var i=0;i<N;i++){
    var c=document.createElementNS(ns,'circle');
    var r=18+i*20;
    c.setAttribute('r',r); c.setAttribute('cx',0); c.setAttribute('cy',0);
    c.setAttribute('fill','none');
    c.setAttribute('stroke', i%4===0 ? 'rgba(255,79,26,.5)' : 'rgba(13,13,14,.12)');
    c.setAttribute('stroke-width', i%4===0 ? 1.4 : 1);
    if(!reduce){
      var dur=(5.5+i*0.55).toFixed(2);
      c.style.transformBox='fill-box';
      c.style.transformOrigin='center';
      c.style.animation='ringPulse '+dur+'s ease-in-out infinite';
      c.style.animationDelay=(-i*0.4)+'s';
    }
    g.appendChild(c);
  }
  // pôles : 2 petits points au centre (le dipôle)
  [[-7,0,'rgba(255,79,26,.95)'],[7,0,'rgba(13,13,14,.55)']].forEach(function(p){
    var d=document.createElementNS(ns,'circle');
    d.setAttribute('cx',p[0]); d.setAttribute('cy',p[1]); d.setAttribute('r',5);
    d.setAttribute('fill',p[2]);
    g.appendChild(d);
  });
  host.appendChild(svg);
}

/* ---------- Petit logo anneau (topbar) ---------- */
function brandMark(){
  var host=document.querySelector('.ring-mark'); if(!host) return;
  host.innerHTML='<svg width="18" height="18" viewBox="0 0 18 18">'+
    '<circle cx="9" cy="9" r="7.5" fill="none" stroke="rgba(13,13,14,.25)" stroke-width="1"/>'+
    '<circle cx="9" cy="9" r="4.4" fill="none" stroke="#ff4f1a" stroke-width="1.3"/>'+
    '<circle cx="9" cy="9" r="1.5" fill="#ff4f1a"/></svg>';
}

/* ---------- Barre de progression ---------- */
function progress(){
  var bar=document.getElementById('progress'); if(!bar) return;
  function upd(){
    var h=document.documentElement.scrollHeight-window.innerHeight;
    var p=h>0 ? (window.scrollY/h) : 0;
    bar.style.width=(p*100).toFixed(1)+'%';
  }
  window.addEventListener('scroll', upd, {passive:true});
  window.addEventListener('resize', upd); upd();
}

/* ---------- Quiz ---------- */
function quiz(){
  var qs=document.querySelectorAll('.q'); if(!qs.length) return;
  var scoreEl=document.getElementById('quizScore');
  var total=qs.length, answered=0, correct=0;
  qs.forEach(function(q){
    var ci=parseInt(q.getAttribute('data-correct'),10);
    var opts=q.querySelectorAll('.opt');
    var fb=q.querySelector('.q__feedback');
    var done=false;
    opts.forEach(function(opt, idx){
      opt.addEventListener('click', function(){
        if(done) return; done=true; answered++;
        var good = idx===ci;
        if(good) correct++;
        opts.forEach(function(o,j){
          o.disabled=true;
          if(j===ci) o.classList.add('is-correct');
          else if(j===idx) o.classList.add('is-wrong');
          else o.classList.add('is-dim');
        });
        if(fb) fb.classList.add('show');
        updScore();
      });
    });
  });
  function updScore(){
    if(!scoreEl) return;
    if(answered<total) scoreEl.innerHTML='Réponses : <b>'+answered+'</b> / '+total;
    else scoreEl.innerHTML='Score : <b>'+correct+' / '+total+'</b> — '+verdict();
    function verdict(){
      var p=correct/total;
      if(p===1) return 'sans faute.';
      if(p>=0.8) return 'tr\u00e8s bon.';
      if(p>=0.6) return 'correct \u2014 quelques points \u00e0 revoir.';
      if(p>=0.4) return '\u00e0 consolider, relis les cours.';
      return 'reprends les cours tranquillement.';
    }
  }
}

/* ---------- Glossaire (accordéon, hauteur animée) ---------- */
function glossary(){
  var terms=document.querySelectorAll('.gterm'); if(!terms.length) return;
  terms.forEach(function(t){
    var btn=t.querySelector('.gterm__btn');
    var panel=t.querySelector('.gterm__panel');
    btn.addEventListener('click', function(){
      var open=t.hasAttribute('open');
      if(open){ panel.style.maxHeight='0px'; t.removeAttribute('open'); }
      else{
        t.setAttribute('open','');
        panel.style.maxHeight=panel.scrollHeight+'px';
      }
    });
  });
  window.addEventListener('resize', function(){
    terms.forEach(function(t){
      if(t.hasAttribute('open')){
        var p=t.querySelector('.gterm__panel'); p.style.maxHeight=p.scrollHeight+'px';
      }
    });
  });
}

function boot(){ ringMotif(); brandMark(); progress(); quiz(); glossary(); }
if(document.readyState!=='loading') boot();
else document.addEventListener('DOMContentLoaded', boot);
})();
