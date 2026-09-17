// 섹션과 타일이 화면에 들어올 때 한 번만 페이드 업. 모션 줄이기 설정이면 아무것도 하지 않는다.
(function () {
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var targets = document.querySelectorAll(
    '.hero > *, .project-hero > *, .project-hero-media, .trio-item, .stat-row, .section-heading, .project-card, .home-row, .edu, .detail-section > h2, .detail-points, .detail-block, .evidence-image, .video, .xp, .rs, .sw, .pub-group, .project-entry, .arc'
  );
  if (!targets.length) return;
  document.documentElement.classList.add('js-reveal');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  targets.forEach(function (el, i) {
    el.setAttribute('data-reveal', '');
    // 첫 화면 안의 요소는 바로 보이게 해 깜빡임을 막는다
    var r = el.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.9) {
      el.style.transitionDelay = Math.min(i, 5) * 60 + 'ms';
      requestAnimationFrame(function () { el.classList.add('is-in'); });
    } else {
      io.observe(el);
    }
  });
})();

// 하단 "이어지는 흐름": 주소의 ?flow= 값에 맞는 갈래만 보여 준다
(function () {
  var blocks = document.querySelectorAll('.flow-nav-block');
  if (blocks.length < 2) return;
  var want = new URLSearchParams(location.search).get('flow');
  if (!want) return;
  var hit = document.querySelector('.flow-nav-block[data-flow="' + want.replace(/[^a-z0-9-]/gi, '') + '"]');
  if (!hit) return;
  blocks.forEach(function (b) { b.hidden = b !== hit; });
})();
