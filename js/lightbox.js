(() => {
    const items = [...document.querySelectorAll("[data-lightbox]")];
    if (!items.length) return;

    const t = (en) => (window.ConstructoI18n ? window.ConstructoI18n.t(en) : en);

    const root = document.createElement("div");
    root.className = "lightbox";
    root.hidden = true;
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-label", t("Image gallery"));
    root.innerHTML = `
        <button type="button" class="lightbox-close" aria-label="${t("Close gallery")}">✕</button>
        <button type="button" class="lightbox-prev" aria-label="${t("Previous image")}">‹</button>
        <figure class="lightbox-figure">
            <img alt="" />
            <figcaption></figcaption>
        </figure>
        <button type="button" class="lightbox-next" aria-label="${t("Next image")}">›</button>
    `;
    document.body.appendChild(root);

    const img = root.querySelector("img");
    const cap = root.querySelector("figcaption");
    let index = 0;
    let lastFocus = null;

    function syncAria() {
        root.setAttribute("aria-label", t("Image gallery"));
        root.querySelector(".lightbox-close").setAttribute("aria-label", t("Close gallery"));
        root.querySelector(".lightbox-prev").setAttribute("aria-label", t("Previous image"));
        root.querySelector(".lightbox-next").setAttribute("aria-label", t("Next image"));
    }

    function open(i) {
        index = i;
        lastFocus = document.activeElement;
        render();
        root.hidden = false;
        document.body.classList.add("lightbox-open");
        root.querySelector(".lightbox-close").focus();
    }

    function close() {
        root.hidden = true;
        document.body.classList.remove("lightbox-open");
        lastFocus?.focus?.();
    }

    function render() {
        const el = items[index];
        const src = el.getAttribute("data-full") || el.getAttribute("href") || el.querySelector("img")?.src;
        const label = el.getAttribute("data-caption") || el.querySelector("img")?.alt || "";
        img.src = src;
        img.alt = label;
        cap.textContent = `${label} (${index + 1}/${items.length})`;
    }

    function next(delta) {
        index = (index + delta + items.length) % items.length;
        render();
    }

    items.forEach((el, i) => {
        el.addEventListener("click", (e) => {
            e.preventDefault();
            open(i);
        });
        el.setAttribute("role", "button");
        if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "0");
        el.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                open(i);
            }
        });
    });

    root.querySelector(".lightbox-close").addEventListener("click", close);
    root.querySelector(".lightbox-prev").addEventListener("click", () => next(-1));
    root.querySelector(".lightbox-next").addEventListener("click", () => next(1));
    root.addEventListener("click", (e) => {
        if (e.target === root) close();
    });
    window.addEventListener("keydown", (e) => {
        if (root.hidden) return;
        if (e.key === "Escape") close();
        if (e.key === "ArrowRight") next(1);
        if (e.key === "ArrowLeft") next(-1);
    });

    document.addEventListener("constructo:lang", syncAria);
})();
