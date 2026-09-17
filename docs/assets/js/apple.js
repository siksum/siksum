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

// 연구 갈래 탭: 누른 갈래의 내용만 보여 준다.
document.querySelectorAll('.tracks').forEach(function (box) {
  var tabs = Array.prototype.slice.call(box.querySelectorAll('.track-tab'));
  function show(i) {
    tabs.forEach(function (t, j) {
      var on = i === j;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !on;
    });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { show(i); });
    t.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      var n = (i + d + tabs.length) % tabs.length;
      show(n);
      tabs[n].focus();
    });
  });
});

// 이어지는 흐름: 한 연구가 여러 갈래에 있으면 갈래를 골라 이전, 다음을 본다.
(function () {
  var picks = document.querySelectorAll('.flow-pick');
  if (!picks.length) return;
  function show(id) {
    document.querySelectorAll('.flow-nav-block').forEach(function (b) {
      b.hidden = b.getAttribute('data-flow') !== id;
    });
    picks.forEach(function (p) {
      p.setAttribute('aria-pressed', p.getAttribute('data-flow') === id ? 'true' : 'false');
    });
  }
  picks.forEach(function (p) {
    p.addEventListener('click', function () { show(p.getAttribute('data-flow')); });
  });
  var want = new URLSearchParams(location.search).get('flow');
  if (want && document.querySelector('.flow-nav-block[data-flow="' + want.replace(/[^a-z0-9-]/gi, '') + '"]')) show(want);
})();

// 목록에서 들어왔을 때만 "목록에서 이어지는" 칸을 보여 준다.
// 목록에서 들어오면 연구 흐름 대신 목록 순서만 보여 준다.
(function () {
  var box = document.querySelector('.paper-nav[data-list]');
  if (!box) return;
  var ref = "";
  try {
    var u = new URL(document.referrer);
    if (u.origin === location.origin) ref = (u.pathname.split('/').pop() || 'index').replace(/\.html$/, '');
  } catch (e) { ref = ""; }
  if (ref !== box.getAttribute('data-list')) return;
  box.hidden = false;
  var flow = document.querySelector('.flow-nav');
  if (!flow) return;
  flow.querySelectorAll('.flow-picks, .flow-nav-block, #flow-nav-title, .is-other-track').forEach(function (el) { el.remove(); });
})();
