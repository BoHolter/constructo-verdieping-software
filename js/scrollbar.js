(() => {
    if (document.getElementById("cs-scroll")) return;

    const scrollRoot = document.createElement("div");
    scrollRoot.id = "cs-scroll";

    const keep = [];
    while (document.body.firstChild) {
        const node = document.body.firstChild;
        if (node.nodeName === "SCRIPT") {
            keep.push(node);
            document.body.removeChild(node);
        } else {
            scrollRoot.appendChild(node);
        }
    }
    document.body.appendChild(scrollRoot);
    keep.forEach((s) => document.body.appendChild(s));

    const rail = document.createElement("div");
    rail.id = "cs-scrollbar";
    rail.setAttribute("aria-hidden", "true");

    const thumb = document.createElement("div");
    thumb.id = "cs-scrollbar-thumb";
    rail.appendChild(thumb);
    document.body.appendChild(rail);

    let hideTimer = 0;
    let dragging = false;
    let dragStartY = 0;
    let dragStartTop = 0;

    function metrics() {
        const viewH = scrollRoot.clientHeight;
        const scrollH = scrollRoot.scrollHeight;
        const scrollTop = scrollRoot.scrollTop;
        const railH = rail.clientHeight;
        const thumbH = Math.max(40, (viewH / Math.max(1, scrollH)) * railH);
        const maxTop = Math.max(0, railH - thumbH);
        const maxScroll = Math.max(1, scrollH - viewH);
        const top = (scrollTop / maxScroll) * maxTop;
        return { viewH, scrollH, scrollTop, railH, thumbH, maxTop, maxScroll, top };
    }

    function update() {
        const locked = document.body.classList.contains("intro-open");
        const m = metrics();
        const needsScroll = !locked && m.scrollH > m.viewH + 2;
        rail.style.display = needsScroll ? "block" : "none";
        if (!needsScroll) return;

        thumb.style.height = `${m.thumbH}px`;
        if (!dragging) thumb.style.top = `${m.top}px`;
    }

    function flash() {
        rail.classList.add("is-visible");
        window.clearTimeout(hideTimer);
        hideTimer = window.setTimeout(() => {
            if (!dragging) rail.classList.remove("is-visible");
        }, 900);
    }

    function onScroll() {
        update();
        flash();
        window.dispatchEvent(new Event("scroll"));
    }

    try {
        Object.defineProperty(window, "scrollY", {
            configurable: true,
            get: () => scrollRoot.scrollTop
        });
        Object.defineProperty(window, "pageYOffset", {
            configurable: true,
            get: () => scrollRoot.scrollTop
        });
    } catch (_) { /* ignore */ }

    const scrollToNative = window.scrollTo.bind(window);
    window.scrollTo = function scrollToPatched(a, b) {
        if (typeof a === "number") {
            scrollRoot.scrollTo(a, b || 0);
            return;
        }
        if (a && typeof a === "object") {
            scrollRoot.scrollTo(a);
            return;
        }
        scrollToNative(a, b);
    };

    thumb.addEventListener("pointerdown", (e) => {
        dragging = true;
        thumb.classList.add("is-dragging");
        rail.classList.add("is-active");
        dragStartY = e.clientY;
        dragStartTop = parseFloat(thumb.style.top) || 0;
        thumb.setPointerCapture(e.pointerId);
        e.preventDefault();
    });

    thumb.addEventListener("pointermove", (e) => {
        if (!dragging) return;
        const m = metrics();
        const nextTop = Math.min(m.maxTop, Math.max(0, dragStartTop + (e.clientY - dragStartY)));
        thumb.style.top = `${nextTop}px`;
        scrollRoot.scrollTop = (nextTop / Math.max(1, m.maxTop)) * m.maxScroll;
    });

    function endDrag(e) {
        if (!dragging) return;
        dragging = false;
        thumb.classList.remove("is-dragging");
        rail.classList.remove("is-active");
        try { thumb.releasePointerCapture(e.pointerId); } catch (_) { /* ignore */ }
        flash();
    }

    thumb.addEventListener("pointerup", endDrag);
    thumb.addEventListener("pointercancel", endDrag);

    rail.addEventListener("pointerdown", (e) => {
        if (e.target === thumb) return;
        const m = metrics();
        const rect = rail.getBoundingClientRect();
        const y = e.clientY - rect.top - m.thumbH / 2;
        const nextTop = Math.min(m.maxTop, Math.max(0, y));
        scrollRoot.scrollTop = (nextTop / Math.max(1, m.maxTop)) * m.maxScroll;
        update();
        flash();
    });

    scrollRoot.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", () => { update(); flash(); });
    window.addEventListener("load", () => { update(); flash(); });

    const ro = new ResizeObserver(() => update());
    ro.observe(scrollRoot);

    new MutationObserver(() => update()).observe(document.body, {
        attributes: true,
        attributeFilter: ["class", "style"]
    });

    window.__csScroll = scrollRoot;
    update();
    flash();
})();
