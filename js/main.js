/* Portfolio Daouda Boye : scripts */
/* Bouton retour en haut */
(function(){
  var b = document.getElementById('to-top');
  if (!b) return;
  var foot = document.querySelector('footer');
  function upd(){
    var y = window.pageYOffset || document.documentElement.scrollTop;
    // Masqué quand le pied de page est visible : il a déjà son lien « Haut de page »
    var nearFoot = foot && foot.getBoundingClientRect().top < window.innerHeight - 8;
    b.classList.toggle('show', y > 600 && !nearFoot);
  }
  window.addEventListener('scroll', upd, {passive:true});
  window.addEventListener('resize', upd);
  upd();
})();

/* Thème, animations et interactions */
(function(){
  var root = document.documentElement;
  root.classList.add('js');

  var btn = document.getElementById('theme');
  function current(){
    var t = root.getAttribute('data-theme');
    if (t) return t;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function label(){
    var dark = current() === 'dark';
    var txt = dark ? 'Thème clair' : 'Thème sombre';
    var act = dark ? 'Passer au thème clair' : 'Passer au thème sombre';
    btn.setAttribute('data-mode', dark ? 'dark' : 'light');
    btn.setAttribute('aria-label', act);
    btn.setAttribute('title', act);
    btn.querySelector('.theme-txt').textContent = txt;
  }
  try { var saved = localStorage.getItem('db-theme'); if (saved === 'dark' || saved === 'light') root.setAttribute('data-theme', saved); } catch(e){}
  label();
  btn.addEventListener('click', function(){
    var next = current() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('db-theme', next); } catch(e){}
    label();
  });

  var chain = document.getElementById('chain');
  var out = document.getElementById('readout');
  var items = chain.querySelectorAll('li');
  function select(li){
    items.forEach(function(x){ x.classList.remove('on'); x.querySelector('button').setAttribute('aria-pressed','false'); });
    li.classList.add('on');
    var b = li.querySelector('button');
    b.setAttribute('aria-pressed','true');
    out.innerHTML = '<b>' + b.querySelector('.w').textContent + '</b>' + b.getAttribute('data-t');
  }
  items.forEach(function(li){
    var b = li.querySelector('button');
    b.addEventListener('click', function(){ select(li); });
    b.addEventListener('mouseenter', function(){ select(li); });
    b.addEventListener('focus', function(){ select(li); });
  });
  select(items[0]);
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce) chain.classList.add('anim');

  // Ouvrir l'étude de cas quand on arrive par une ancre de projet
  function openFromHash(){
    var el = location.hash && document.querySelector(location.hash);
    if (el && el.classList.contains('case')){ var d = el.querySelector('details'); if (d) d.open = true; }
  }
  window.addEventListener('hashchange', openFromHash); openFromHash();

  // Lien court ?projet=solvabilite : fonctionne même si une redirection supprime l'ancre (#)
  (function(){
    var m = /[?&]projet=([a-z-]+)/.exec(location.search);
    if (!m || location.hash) return;
    var el = document.getElementById('projet-' + m[1]);
    if (!el || !el.classList.contains('case')) return;
    history.replaceState(null, '', location.pathname + location.search + '#' + el.id);
    openFromHash();
    el.scrollIntoView();
    window.addEventListener('load', function(){ el.scrollIntoView(); });
  })();



  // Déroulement des études de cas
  document.querySelectorAll('.case details').forEach(function(d){
    var sum = d.querySelector('summary'), body = d.querySelector('.study'), busy = false;
    sum.addEventListener('click', function(e){
      if (reduce || !body.animate) return;
      e.preventDefault();
      if (busy) return; busy = true;
      if (!d.open){
        d.open = true;
        var h = body.scrollHeight;
        body.animate([{height:'0px',opacity:0},{height:h+'px',opacity:1}],{duration:220,easing:'cubic-bezier(.2,.7,.2,1)'}).onfinish = function(){ busy = false; };
      } else {
        var h2 = body.scrollHeight;
        var a = body.animate([{height:h2+'px',opacity:1},{height:'0px',opacity:0}],{duration:180,easing:'ease-in'});
        a.onfinish = function(){ d.open = false; busy = false; };
      }
    });
  });


  // Rail : projet actif pendant le défilement
  var railLinks = document.querySelectorAll('.case-rail a[data-target]');
  if (railLinks.length && 'IntersectionObserver' in window){
    var setActive = function(id){ railLinks.forEach(function(l){ if (l.getAttribute('data-target') === id) l.setAttribute('aria-current','true'); else l.removeAttribute('aria-current'); }); };
    var railObs = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if (en.isIntersecting) setActive(en.target.id); });
    }, { rootMargin: '-35% 0px -60% 0px' });
    railLinks.forEach(function(l){ var t = document.getElementById(l.getAttribute('data-target')); if (t) railObs.observe(t); });
    setActive(railLinks[0].getAttribute('data-target'));
  }

  // Agrandissement des captures
  var lb = document.getElementById('lb'), lbImg = document.getElementById('lb-img'), lbCap = document.getElementById('lb-cap');
  document.querySelectorAll('.zoom').forEach(function(z){
    z.addEventListener('click', function(){
      lbImg.src = z.getAttribute('data-full'); lbImg.alt = z.getAttribute('data-alt');
      lbCap.textContent = z.getAttribute('aria-label').replace('Agrandir la capture : ','');
      if (lb.showModal) lb.showModal(); else window.open(z.getAttribute('data-full'));
    });
  });
  document.getElementById('lb-close').addEventListener('click', function(){ lb.close(); });
  lb.addEventListener('click', function(e){ if (e.target === lb) lb.close(); });

  // Copier l'adresse email
  var cbtn = document.getElementById('copy-mail'), cst = document.getElementById('copy-status');
  if (cbtn){
    cbtn.addEventListener('click', function(){
      var mail = cbtn.getAttribute('data-mail');
      function done(ok){ cst.textContent = ok ? 'Adresse copiée.' : 'Copie impossible : sélectionnez l\'adresse ci-contre.'; setTimeout(function(){ cst.textContent=''; }, 4000); }
      function fallback(){
        try { var t=document.createElement('textarea'); t.value=mail; t.setAttribute('readonly',''); t.style.position='absolute'; t.style.left='-9999px'; document.body.appendChild(t); t.select(); var ok=document.execCommand('copy'); document.body.removeChild(t); done(ok); } catch(e){ done(false); }
      }
      if (navigator.clipboard && window.isSecureContext){ navigator.clipboard.writeText(mail).then(function(){ done(true); }, fallback); } else { fallback(); }
    });
  }
})();

/* Menu mobile */
(function(){
  var top = document.querySelector('.top');
  var btn = document.getElementById('menu');
  if (!top || !btn) return;
  function set(open){
    top.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.textContent = open ? 'Fermer' : 'Menu';
  }
  btn.addEventListener('click', function(){ set(!top.classList.contains('open')); });
  document.getElementById('nav-links').addEventListener('click', function(e){ if (e.target.tagName === 'A') set(false); });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') set(false); });
  window.addEventListener('resize', function(){ if (window.innerWidth > 860) set(false); });
})();

/* Section active dans la navigation */
(function(){
  var pairs = [];
  document.querySelectorAll('#nav-links a[href^="#"]').forEach(function(a){
    var s = document.querySelector(a.getAttribute('href'));
    if (!s) return;
    var h = document.getElementById(s.getAttribute('aria-labelledby') || '') || s;
    pairs.push({ a: a, h: h });
  });
  if (!pairs.length) return;
  var pending = false;
  function update(){
    pending = false;
    // Ligne de lecture : sous l'en-tête collant, vers le tiers haut de l'écran
    var line = 60 + window.innerHeight * 0.3;
    var current = null;
    pairs.forEach(function(p){ if (p.h.getBoundingClientRect().top <= line) current = p; });
    // En bas de page, la dernière section (Contact) est active même si elle est courte
    if (window.innerHeight + (window.pageYOffset || document.documentElement.scrollTop) >= document.documentElement.scrollHeight - 4) current = pairs[pairs.length - 1];
    pairs.forEach(function(p){
      if (p === current) p.a.setAttribute('aria-current', 'location');
      else p.a.removeAttribute('aria-current');
    });
  }
  function queue(){ if (!pending){ pending = true; window.requestAnimationFrame(update); } }
  window.addEventListener('scroll', queue, {passive:true});
  window.addEventListener('resize', queue);
  window.addEventListener('load', queue);
  // Les images chargées en différé peuvent décaler la page sans défilement : on recalcule alors aussi
  if (window.ResizeObserver) new ResizeObserver(queue).observe(document.body);
  update();
})();

/* Ombre de l'en-tête dès qu'on a défilé */
(function(){
  var top = document.querySelector('.top');
  if (!top) return;
  function upd(){ top.classList.toggle('scrolled', (window.pageYOffset || document.documentElement.scrollTop) > 8); }
  window.addEventListener('scroll', upd, {passive:true});
  upd();
})();
