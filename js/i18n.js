(() => {
  const STORAGE_KEY = "constructoLang";
  const ATTRS = ["placeholder", "aria-label", "aria-placeholder", "title", "alt"];

  function dict() {
    return (window.CONSTRUCTO_I18N && window.CONSTRUCTO_I18N.nl) || {};
  }

  function preferredLang() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "nl" || stored === "en") return stored;
    } catch (_) { /* ignore */ }
    const nav = (navigator.language || "").toLowerCase();
    return nav.startsWith("nl") ? "nl" : "en";
  }

  function normalizeKey(s) {
    return String(s || "")
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function translateValue(en, lang) {
    if (lang !== "nl") return en;
    const map = dict();
    const key = normalizeKey(en);
    if (Object.prototype.hasOwnProperty.call(map, key)) return map[key];
    if (Object.prototype.hasOwnProperty.call(map, en)) return map[en];
    return en;
  }

  function ensureOriginalText(node) {
    if (node._csI18nOrig == null) node._csI18nOrig = node.nodeValue;
    return node._csI18nOrig;
  }

  function ensureOriginalAttr(el, attr) {
    const storeKey = "_csI18nAttr_" + attr;
    if (el[storeKey] == null) el[storeKey] = el.getAttribute(attr);
    return el[storeKey];
  }

  function shouldSkipTextNode(node) {
    const parent = node.parentElement;
    if (!parent) return true;
    const tag = parent.tagName;
    if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT" || tag === "CODE" || tag === "PRE") return true;
    if (parent.closest("[data-i18n-ignore], .lang-toggle, #langToggle")) return true;
    if (parent.id === "year") return true;
    return false;
  }

  function applyTextNodes(lang) {
    const root = document.body;
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      if (shouldSkipTextNode(node)) return;
      const original = ensureOriginalText(node);
      if (!normalizeKey(original)) return;
      // Preserve leading/trailing whitespace around the translated core
      const lead = (original.match(/^\s*/) || [""])[0];
      const trail = (original.match(/\s*$/) || [""])[0];
      const core = original.slice(lead.length, original.length - trail.length);
      if (!core) return;
      const translated = translateValue(core, lang);
      if (translated !== core || lang === "en") {
        node.nodeValue = lead + (lang === "en" ? core : translated) + trail;
      }
    });
  }

  function applyAttributes(lang) {
    ATTRS.forEach((attr) => {
      document.querySelectorAll("[" + attr + "]").forEach((el) => {
        if (el.closest("[data-i18n-ignore], .lang-toggle, #langToggle")) return;
        const original = ensureOriginalAttr(el, attr);
        if (original == null || original === "") return;
        el.setAttribute(attr, translateValue(original, lang));
      });
    });

    // <title>
    const titleEl = document.querySelector("title");
    if (titleEl) {
      if (titleEl._csI18nOrig == null) titleEl._csI18nOrig = titleEl.textContent;
      titleEl.textContent = translateValue(titleEl._csI18nOrig, lang);
    }

    // meta description
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      const original = ensureOriginalAttr(meta, "content");
      if (original) meta.setAttribute("content", translateValue(original, lang));
    }

    // <option> labels — keep value stable in English for forms/estimate
    document.querySelectorAll("option").forEach((opt) => {
      if (opt._csI18nOrig == null) {
        opt._csI18nOrig = opt.textContent;
        if (!opt.hasAttribute("value")) opt.setAttribute("value", opt.textContent.trim());
      }
      opt.textContent = translateValue(opt._csI18nOrig, lang);
    });
  }

  function updateToggle(lang) {
    document.querySelectorAll("#langToggle, [data-lang-toggle]").forEach((btn) => {
      btn.textContent = lang === "nl" ? "EN" : "NL";
      btn.setAttribute("aria-label", lang === "nl" ? "Switch to English" : "Schakel naar Nederlands");
      btn.title = lang === "nl" ? "English" : "Nederlands";
      btn.setAttribute("aria-pressed", String(lang === "nl"));
      btn.dataset.lang = lang;
    });
  }

  function injectToggle() {
    if (document.getElementById("langToggle")) return;
    const theme = document.getElementById("themeToggle");
    const menu = document.getElementById("mainMenu");
    const btn = document.createElement("button");
    btn.id = "langToggle";
    btn.className = "lang-toggle";
    btn.type = "button";
    btn.setAttribute("data-lang-toggle", "1");

    if (theme && theme.parentElement) {
      theme.parentElement.insertBefore(btn, theme);
    } else if (menu) {
      const li = document.createElement("li");
      li.appendChild(btn);
      menu.appendChild(li);
    } else {
      return;
    }

    btn.addEventListener("click", () => {
      const next = getLang() === "nl" ? "en" : "nl";
      setLang(next);
    });
  }

  function apply(lang) {
    document.documentElement.lang = lang === "nl" ? "nl" : "en";
    document.documentElement.dataset.lang = lang;
    applyTextNodes(lang);
    applyAttributes(lang);
    updateToggle(lang);
    try {
      document.dispatchEvent(new CustomEvent("constructo:lang", { detail: { lang } }));
    } catch (_) { /* ignore */ }
  }

  function getLang() {
    return document.documentElement.dataset.lang === "nl" ? "nl" : "en";
  }

  function setLang(lang, { persist = true } = {}) {
    const next = lang === "nl" ? "nl" : "en";
    if (persist) {
      try { localStorage.setItem(STORAGE_KEY, next); } catch (_) { /* ignore */ }
    }
    apply(next);
  }

  function t(en) {
    return translateValue(en, getLang());
  }

  function boot() {
    injectToggle();
    apply(preferredLang());

    // Re-apply when late UI is injected (cookie bar)
    const obs = new MutationObserver((mutations) => {
      let relevant = false;
      mutations.forEach((m) => {
        m.addedNodes.forEach((n) => {
          if (n.nodeType === 1 && (n.classList?.contains("cookie-bar") || n.querySelector?.(".cookie-bar"))) {
            relevant = true;
          }
        });
      });
      if (relevant) apply(getLang());
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  window.ConstructoI18n = { t, setLang, getLang, apply, preferredLang, translateValue };
})();
