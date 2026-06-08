/* =========================================================
   Navigation partagée — menu + registre des cours
   Injecté sur toutes les pages (hub + cours).
   ========================================================= */
(function(){
'use strict';

var COURSES=[
 {key:'cours-1', n:'01', href:'cours-1.html', title:'Le champ magnétique',                level:'vert',   ready:true},
 {key:'cours-2', n:'02', href:'cours-2.html', title:'Force de Laplace',                    level:'vert',   ready:true},
 {key:'cours-3', n:'03', href:'cours-3.html', title:'Moteur, Lenz-Faraday, générateur',   level:'vert',   ready:true},
 {key:'cours-4', n:'04', href:'cours-4.html', title:'Transformateur & induction',         level:'orange', ready:true},
 {key:'cours-5', n:'05', href:'cours-5.html', title:'AC-DC, micro, hystérésis',           level:'orange', ready:true},
 {key:'cours-6', n:'06', href:'cours-6.html', title:'Déphasage, onde, polarisation',      level:'orange', ready:true},
 {key:'cours-7', n:'07', href:'cours-7.html', title:'Câble BNC, impédance',               level:'orange', ready:true}
];
window.MAG_COURSES = COURSES;

function build(){
  var current = document.body.getAttribute('data-page') || '';
  var bar = document.querySelector('.topbar__in');

  var btn=document.createElement('button');
  btn.className='menu-btn'; btn.type='button';
  btn.setAttribute('aria-label','Ouvrir le menu'); btn.setAttribute('aria-expanded','false');
  btn.innerHTML='<span></span><span></span><span></span>';
  if(bar) bar.appendChild(btn);

  function row(c){
    var inner='<span class="menu__n">'+c.n+'</span>'+
      '<span class="menu__t">'+c.title+'</span>'+
      '<span class="menu__lvl menu__lvl--'+c.level+'" title="niveau"></span>'+
      (c.ready ? (c.key===current?'<span class="menu__tag menu__tag--here">ici</span>':'')
               : '<span class="menu__tag">à venir</span>');
    if(!c.ready) return '<span class="menu__row is-soon">'+inner+'</span>';
    return '<a class="menu__row'+(c.key===current?' is-current':'')+'" href="'+c.href+'">'+inner+'</a>';
  }

  var ov=document.createElement('div');
  ov.className='menu'; ov.hidden=true;
  ov.innerHTML=
    '<div class="menu__backdrop"></div>'+
    '<nav class="menu__panel" aria-label="Sommaire des cours">'+
      '<div class="menu__head">'+
        '<span class="menu__brand">Magnétisme <b>pour l\'image</b></span>'+
        '<button class="menu__close" type="button" aria-label="Fermer">×</button>'+
      '</div>'+
      '<a class="menu__home'+(current==='hub'?' is-current':'')+'" href="index.html">Accueil — vue d\'ensemble</a>'+
      '<div class="menu__list">'+COURSES.map(row).join('')+'</div>'+
      '<div class="menu__foot">IAD · Option Image · 7 cours</div>'+
    '</nav>';
  document.body.appendChild(ov);

  var panel=ov.querySelector('.menu__panel');
  function open(){
    ov.hidden=false; document.body.style.overflow='hidden';
    btn.setAttribute('aria-expanded','true');
    requestAnimationFrame(function(){ ov.classList.add('is-open'); });
  }
  function close(){
    ov.classList.remove('is-open'); btn.setAttribute('aria-expanded','false');
    document.body.style.overflow='';
    var done=function(){ ov.hidden=true; panel.removeEventListener('transitionend',done); };
    panel.addEventListener('transitionend',done);
  }
  btn.addEventListener('click',open);
  ov.querySelector('.menu__close').addEventListener('click',close);
  ov.querySelector('.menu__backdrop').addEventListener('click',close);
  document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&!ov.hidden) close(); });
}

if(document.readyState!=='loading') build();
else document.addEventListener('DOMContentLoaded', build);
})();
