/* ══════════════════════════════════════════════
   TEAM IRSHAD — SHARED SCRIPTS
   ══════════════════════════════════════════════ */
(function(){
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── SCROLL REVEAL ── */
  if(!reducedMotion){
    var els = document.querySelectorAll('.reveal');
    var obs = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){e.target.classList.add('is-visible');obs.unobserve(e.target);}
      });
    },{threshold:0.12});
    els.forEach(function(el){obs.observe(el);});
  }else{
    document.querySelectorAll('.reveal').forEach(function(el){el.classList.add('is-visible');});
  }

  /* ── COUNTER ANIMATION ── */
  if(!reducedMotion){
    var counters = document.querySelectorAll('[data-count]');
    var counterObs = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){
          var el = e.target;
          var target = parseInt(el.getAttribute('data-count'),10);
          var duration = 1200;
          var start = performance.now();
          function tick(now){
            var elapsed = now - start;
            var progress = Math.min(elapsed / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(eased * target);
            if(progress < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
          counterObs.unobserve(el);
        }
      });
    },{threshold:0.5});
    counters.forEach(function(c){counterObs.observe(c);});
  }else{
    document.querySelectorAll('[data-count]').forEach(function(el){
      el.textContent = el.getAttribute('data-count');
    });
  }

  /* ── MOBILE MENU ── */
  var toggle = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');
  var overlay = document.querySelector('.mobile-overlay');

  if(toggle && mobileNav && overlay){
    toggle.addEventListener('click',function(){
      var isOpen = mobileNav.classList.contains('open');
      if(isOpen){
        mobileNav.classList.remove('open');
        overlay.classList.remove('open');
        toggle.classList.remove('open');
        document.body.style.overflow='';
      }else{
        mobileNav.classList.add('open');
        overlay.classList.add('open');
        toggle.classList.add('open');
        document.body.style.overflow='hidden';
      }
    });
    overlay.addEventListener('click',function(){
      mobileNav.classList.remove('open');
      overlay.classList.remove('open');
      toggle.classList.remove('open');
      document.body.style.overflow='';
    });
    mobileNav.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click',function(){
        mobileNav.classList.remove('open');
        overlay.classList.remove('open');
        toggle.classList.remove('open');
        document.body.style.overflow='';
      });
    });
  }

  /* ── SUBURB FILTER (results page) ── */
  var filterBtns = document.querySelectorAll('.filter-btn');
  var filterCards = document.querySelectorAll('[data-suburb]');
  if(filterBtns.length && filterCards.length){
    filterBtns.forEach(function(btn){
      btn.addEventListener('click',function(){
        filterBtns.forEach(function(b){b.classList.remove('active');});
        btn.classList.add('active');
        var val = btn.getAttribute('data-filter');
        filterCards.forEach(function(card){
          if(val==='all' || card.getAttribute('data-suburb')===val){
            card.style.display='';
          }else{
            card.style.display='none';
          }
        });
      });
    });
  }

  /* ── CONTACT FORM (AJAX submit via Formspree) ── */
  var appraisalForm = document.getElementById('appraisal-form');
  if(appraisalForm){
    appraisalForm.addEventListener('submit', function(e){
      e.preventDefault();
      var btn = appraisalForm.querySelector('button[type="submit"]');
      var origText = btn.textContent;
      btn.textContent = 'Sending\u2026';
      btn.disabled = true;

      var data = new FormData(appraisalForm);

      fetch(appraisalForm.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      })
      .then(function(r){ return r.json(); })
      .then(function(res){
        if(res.ok || res.success){
          appraisalForm.innerHTML = '<div style="text-align:center;padding:48px 20px;"><div style="font-size:48px;margin-bottom:16px;">\u2713</div><h3 style="font-size:20px;font-weight:700;margin-bottom:8px;">Enquiry sent</h3><p style="color:var(--slate);">Thanks! We\'ll be in touch shortly.</p></div>';
        }else{
          alert('Something went wrong. Please try again.');
          btn.textContent = origText;
          btn.disabled = false;
        }
      })
      .catch(function(){
        alert('Network error. Please try again.');
        btn.textContent = origText;
        btn.disabled = false;
      });
    });
  }

  /* ── CARD IMAGE CAROUSELS ── */
  document.querySelectorAll('[data-carousel]').forEach(function(carousel){
    var track = carousel.querySelector('.carousel-track');
    var slides = track.querySelectorAll('img');
    var dots = carousel.querySelectorAll('.dot');
    var prev = carousel.querySelector('.carousel-prev');
    var next = carousel.querySelector('.carousel-next');
    var idx = 0;

    function go(i){
      idx = (i + slides.length) % slides.length;
      track.style.transform = 'translateX(-' + (idx * 100) + '%)';
      dots.forEach(function(d,di){ d.classList.toggle('active', di === idx); });
    }

    /* Autoplay when data-autoplay="ms" is set (e.g. featured project carousel) */
    var autoplay = parseInt(carousel.getAttribute('data-autoplay') || '0', 10);
    var timer = null;
    function play(){ if (autoplay > 0 && !timer) timer = setInterval(function(){ go(idx + 1); }, autoplay); }
    function stop(){ if (timer) { clearInterval(timer); timer = null; } }
    function restart(){ stop(); play(); }

    if (prev && next) { // ponytail: single-image carousels render no arrows
    prev.addEventListener('click', function(e){ e.stopPropagation(); go(idx - 1); restart(); });
    next.addEventListener('click', function(e){ e.stopPropagation(); go(idx + 1); restart(); });
    }
    dots.forEach(function(d,di){ d.addEventListener('click', function(e){ e.stopPropagation(); go(di); restart(); }); });
    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', play);
    play();

    /* Touch/swipe support */
    var startX = 0;
    carousel.addEventListener('touchstart', function(e){ startX = e.touches[0].clientX; }, {passive:true});
    carousel.addEventListener('touchend', function(e){
      var diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 30) go(idx + (diff > 0 ? 1 : -1));
    }, {passive:true});
  });

  /* ── VIDEO MODAL ── */
  function extractVideoId(url) {
    if (!url) return null;
    var m = url.match(/(?:v=|youtu\.be\/|embed\/|\/v\/)([a-zA-Z0-9_-]{11})/);
    return m ? m[1] : null;
  }
  document.querySelectorAll('.vid-thumb[data-video]').forEach(function(thumb) {
    thumb.style.cursor = 'pointer';
    thumb.addEventListener('click', function() {
      var vid = extractVideoId(thumb.getAttribute('data-video'));
      if (!vid) return;
      var overlay = document.createElement('div');
      overlay.className = 'video-modal-overlay';
      overlay.innerHTML = '<div class="video-modal"><button class="video-modal-close" aria-label="Close">&times;</button><div class="video-modal-frame"><iframe src="https://www.youtube.com/embed/' + vid + '?autoplay=1&rel=0" frameborder="0" allow="autoplay; encrypted-media" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div></div>';
      document.body.appendChild(overlay);
      document.body.style.overflow = 'hidden';
      function closeModal() { overlay.remove(); document.body.style.overflow = ''; document.removeEventListener('keydown', onKey); }
      function onKey(e) { if (e.key === 'Escape') closeModal(); }
      document.addEventListener('keydown', onKey);
      overlay.addEventListener('click', function(e) {
        if (e.target === overlay || e.target.classList.contains('video-modal-close') || e.target.classList.contains('video-modal')) {
          closeModal();
        }
      });
    });
  });
})();