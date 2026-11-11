(function () {
  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  function enhancePair(pair) {
    var items = pair.querySelectorAll(".gallery-item");
    if (items.length < 2) return;

    var beforeImg = items[0].querySelector("img");
    var afterImg = items[1].querySelector("img");
    if (!beforeImg || !afterImg) return;

    var beforeSrc = beforeImg.getAttribute("src");
    var afterSrc = afterImg.getAttribute("src");
    var beforeAlt = beforeImg.getAttribute("alt") || "Before";
    var afterAlt = afterImg.getAttribute("alt") || "After";

    var root = document.createElement("div");
    root.className = "ba-slider";
    root.setAttribute("role", "group");
    root.setAttribute("aria-label", "Before and after comparison. Drag the handle to reveal.");

    root.innerHTML =
      '<div class="ba-slider-frame">' +
      '<img class="ba-slider-after" src="' + afterSrc + '" alt="' + afterAlt.replace(/"/g, "&quot;") + '" draggable="false" />' +
      '<div class="ba-slider-before-wrap">' +
      '<img class="ba-slider-before" src="' + beforeSrc + '" alt="' + beforeAlt.replace(/"/g, "&quot;") + '" draggable="false" />' +
      "</div>" +
      '<span class="ba-slider-label ba-slider-label-before">Before</span>' +
      '<span class="ba-slider-label ba-slider-label-after">After</span>' +
      '<div class="ba-slider-handle" tabindex="0" role="slider" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50" aria-label="' + (window.ConstructoI18n ? window.ConstructoI18n.t("Reveal after photo") : "Reveal after photo") + '">' +
      '<span class="ba-slider-knob" aria-hidden="true"></span>' +
      "</div>" +
      "</div>" +
      '<p class="ba-slider-hint"></p>';

    pair.replaceWith(root);

    var frame = root.querySelector(".ba-slider-frame");
    var beforeWrap = root.querySelector(".ba-slider-before-wrap");
    var beforeEl = root.querySelector(".ba-slider-before");
    var handle = root.querySelector(".ba-slider-handle");
    var pos = 50;
    var dragging = false;

    function syncFrameWidth() {
      var w = frame.clientWidth;
      if (w) beforeEl.style.width = w + "px";
    }

    function setPos(pct) {
      pos = clamp(pct, 0, 100);
      beforeWrap.style.width = pos + "%";
      handle.style.left = pos + "%";
      handle.setAttribute("aria-valuenow", String(Math.round(pos)));
    }

    function fromClientX(clientX) {
      var rect = frame.getBoundingClientRect();
      if (!rect.width) return pos;
      return ((clientX - rect.left) / rect.width) * 100;
    }

    function onPointerDown(e) {
      dragging = true;
      root.classList.add("is-dragging");
      if (e.pointerId != null && handle.setPointerCapture) {
        try { handle.setPointerCapture(e.pointerId); } catch (err) {}
      }
      setPos(fromClientX(e.clientX));
      e.preventDefault();
    }

    function onPointerMove(e) {
      if (!dragging) return;
      setPos(fromClientX(e.clientX));
    }

    function onPointerUp() {
      dragging = false;
      root.classList.remove("is-dragging");
    }

    handle.addEventListener("pointerdown", onPointerDown);
    handle.addEventListener("pointermove", onPointerMove);
    handle.addEventListener("pointerup", onPointerUp);
    handle.addEventListener("pointercancel", onPointerUp);
    frame.addEventListener("pointerdown", function (e) {
      if (e.target === handle || handle.contains(e.target)) return;
      setPos(fromClientX(e.clientX));
    });

    handle.addEventListener("keydown", function (e) {
      var step = e.shiftKey ? 10 : 4;
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
        setPos(pos - step);
        e.preventDefault();
      } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
        setPos(pos + step);
        e.preventDefault();
      } else if (e.key === "Home") {
        setPos(0);
        e.preventDefault();
      } else if (e.key === "End") {
        setPos(100);
        e.preventDefault();
      }
    });

    // Keep lightbox: click left half opens before, right half opens after
    frame.addEventListener("click", function (e) {
      if (dragging || root.classList.contains("is-dragging")) return;
      if (e.target === handle || handle.contains(e.target)) return;
      var pct = fromClientX(e.clientX);
      var target = pct < pos ? items[0] : items[1];
      if (target && typeof target.click === "function") {
        // Re-attach hidden anchors for lightbox.js to find
      }
    });

    // Hidden anchors so lightbox still works from labels
    var ghost = document.createElement("div");
    ghost.className = "ba-slider-ghost-links";
    ghost.hidden = true;
    ghost.appendChild(items[0]);
    ghost.appendChild(items[1]);
    root.appendChild(ghost);

    root.querySelector(".ba-slider-label-before").addEventListener("click", function () {
      items[0].click();
    });
    root.querySelector(".ba-slider-label-after").addEventListener("click", function () {
      items[1].click();
    });

    var hint = root.querySelector(".ba-slider-hint");
    function syncHint() {
      var en = "Drag to compare · click either side for lightbox";
      hint.textContent = window.ConstructoI18n ? window.ConstructoI18n.t(en) : en;
    }
    var beforeLabel = root.querySelector(".ba-slider-label-before");
    var afterLabel = root.querySelector(".ba-slider-label-after");
    function syncLabels() {
      beforeLabel.textContent = window.ConstructoI18n ? window.ConstructoI18n.t("Before") : "Before";
      afterLabel.textContent = window.ConstructoI18n ? window.ConstructoI18n.t("After") : "After";
      var reveal = window.ConstructoI18n ? window.ConstructoI18n.t("Reveal after photo") : "Reveal after photo";
      handle.setAttribute("aria-label", reveal);
    }
    syncHint();
    syncLabels();
    document.addEventListener("constructo:lang", function () {
      syncHint();
      syncLabels();
    });

    setPos(50);
    syncFrameWidth();
    window.addEventListener("resize", syncFrameWidth);
    if (window.ResizeObserver) {
      new ResizeObserver(syncFrameWidth).observe(frame);
    }
  }

  function init() {
    document.querySelectorAll(".ba-pair").forEach(enhancePair);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
