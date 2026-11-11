(function () {
  var REDUCE = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var base = /\/pages\//.test(location.pathname) ? "../" : "";

  if (!document.querySelector('link[data-cs-motion]')) {
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = base + "css/motion.css";
    link.setAttribute("data-cs-motion", "1");
    document.head.appendChild(link);
  }

  if (REDUCE) return;

  var SELECTORS = [
    ".section-head",
    ".page-intro",
    ".page-block",
    ".cta-band .container",
    ".page-copy",
    ".project-layout",
    ".contact-layout",
    ".estimate-layout",
    ".estimate-form-xl",
    ".estimate-panel-xl",
    ".service",
    ".project",
    ".project-card",
    ".related-card",
    ".person",
    ".quote",
    ".quote-card",
    ".job",
    ".faq-item",
    ".legal-copy > h3",
    ".error-main > h1",
    ".error-main > .error-lead",
    ".error-main > .error-actions"
  ];

  var STAGGER = [
    ".services",
    ".projects",
    ".projects-index",
    ".related-grid",
    ".people-grid",
    ".quotes",
    ".quote-grid",
    ".finish-cards",
    ".estimate-trust",
    ".estimate-kpis",
    ".process-steps"
  ];

  function mark(el, attr) {
    if (!el || el.hasAttribute(attr) || el.closest("[data-no-motion]")) return;
    if (el.classList.contains("reveal")) return; // home already has its own reveal
    if (el.classList.contains("hero") || el.classList.contains("frontpage") || el.classList.contains("page-hero")) return;
    if (el.closest(".hero, .frontpage, .page-hero, .site-header")) return;
    el.setAttribute(attr, "");
  }

  SELECTORS.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el) {
      mark(el, "data-reveal");
    });
  });

  STAGGER.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el) {
      if (el.children.length < 2) return;
      if (el.classList.contains("reveal") || el.closest(".reveal")) return;
      mark(el, "data-reveal-stagger");
      el.removeAttribute("data-reveal");
    });
  });

  var targets = document.querySelectorAll("[data-reveal], [data-reveal-stagger], .reveal:not(.visible)");
  if (!targets.length) return;

  function show(el) {
    el.classList.add("is-in");
    if (el.classList.contains("reveal")) el.classList.add("visible");
  }

  if (!("IntersectionObserver" in window)) {
    targets.forEach(show);
    return;
  }

  function bindObserver(root) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          show(entry.target);
          io.unobserve(entry.target);
        });
      },
      { root: root || null, rootMargin: "0px 0px -4% 0px", threshold: 0.05 }
    );
    targets.forEach(function (el) {
      io.observe(el);
    });
    return io;
  }

  function revealInView() {
    targets.forEach(function (el) {
      if (el.classList.contains("is-in") || el.classList.contains("visible")) return;
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.96 && r.bottom > 40) show(el);
    });
  }

  // Wait for custom scrollbar root (#cs-scroll) — otherwise reveals stay opacity:0 forever
  function start(attempt) {
    var root = document.getElementById("cs-scroll") || window.__csScroll || null;
    if (!root && attempt < 40) {
      setTimeout(function () {
        start(attempt + 1);
      }, 50);
      return;
    }
    bindObserver(root);
    revealInView();
    if (root) {
      root.addEventListener("scroll", revealInView, { passive: true });
    }
    window.addEventListener("scroll", revealInView, { passive: true });
    // Safety net: never leave content invisible
    setTimeout(revealInView, 400);
    setTimeout(function () {
      targets.forEach(function (el) {
        if (!el.classList.contains("is-in") && !el.classList.contains("visible")) show(el);
      });
    }, 2500);
  }

  start(0);
})();
