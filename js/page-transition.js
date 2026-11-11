(() => {
  const REDUCE = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  const DURATION = 280;

  // Cross-document View Transitions (Chromium) — soft /page feel
  try {
    if (!document.querySelector('meta[name="view-transition"]')) {
      const meta = document.createElement("meta");
      meta.name = "view-transition";
      meta.content = "same-origin";
      document.head.appendChild(meta);
    }
  } catch (_) { /* ignore */ }

  document.documentElement.classList.add("js-page-motion");

  function markReady() {
    document.documentElement.classList.add("page-ready");
    document.body.classList.add("page-ready");
  }

  // Enter animation after paint
  requestAnimationFrame(() => {
    requestAnimationFrame(markReady);
  });
  // Never leave a blank page if rAF is delayed/blocked
  window.setTimeout(markReady, 120);

  function isInternal(link) {
    if (!link || link.target === "_blank" || link.hasAttribute("download")) return false;
    if (link.hasAttribute("data-no-transition")) return false;
    const href = link.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return false;
    try {
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin) return false;
      // same page hash only
      if (url.pathname === location.pathname && url.search === location.search) return false;
      return /\.html?$/i.test(url.pathname) || url.pathname.endsWith("/") || url.pathname.includes("Prototype");
    } catch (_) {
      return false;
    }
  }

  function go(url) {
    if (REDUCE) {
      location.href = url;
      return;
    }
    document.documentElement.classList.add("page-leave");
    document.body.classList.add("page-leave");
    window.setTimeout(() => {
      location.href = url;
    }, DURATION);
  }

  document.addEventListener(
    "click",
    (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = e.target.closest?.("a[href]");
      if (!isInternal(link)) return;
      e.preventDefault();
      // close menus if open
      document.getElementById("mainMenu")?.classList.remove("open");
      document.body.classList.remove("nav-drawer-open");
      document.querySelectorAll(".has-mega.is-open").forEach((el) => el.classList.remove("is-open"));
      document.querySelector(".site-header")?.classList.remove("mega-open");
      document.getElementById("menuToggle")?.setAttribute("aria-expanded", "false");
      go(link.href);
    },
    true
  );
})();
