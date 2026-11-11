(() => {
    const KEY = "constructoCookies";
    try {
        if (localStorage.getItem(KEY)) return;
    } catch (_) {
        return;
    }

    function t(en) {
        return window.ConstructoI18n ? window.ConstructoI18n.t(en) : en;
    }

    const bar = document.createElement("div");
    bar.className = "cookie-bar";
    bar.setAttribute("role", "dialog");
    bar.setAttribute("aria-label", t("Cookie notice"));
    bar.innerHTML = `
        <div class="cookie-bar-inner">
            <p><span data-cookie-copy>We store theme preference and your cookie choice locally. No ad trackers on this prototype.</span> <a data-cookie-link href="${document.body.dataset.cookiePath || "pages/cookies.html"}">Cookie policy</a></p>
            <div class="cookie-actions">
                <button type="button" class="cookie-decline" data-choice="declined">Decline</button>
                <button type="button" class="cta cookie-accept" data-choice="accepted">Accept</button>
            </div>
        </div>
    `;

    const inPages = /\/pages\//.test(location.pathname) || location.pathname.endsWith("\\pages\\") || /pages[/\\][^/\\]+$/.test(location.pathname);
    const link = bar.querySelector("a");
    if (link) {
        link.setAttribute("href", inPages ? "cookies.html" : "pages/cookies.html");
        link.textContent = t("Cookie policy");
    }

    const copy = bar.querySelector("[data-cookie-copy]");
    if (copy) copy.textContent = t("We store theme preference and your cookie choice locally. No ad trackers on this prototype.");
    const decline = bar.querySelector(".cookie-decline");
    const accept = bar.querySelector(".cookie-accept");
    if (decline) decline.textContent = t("Decline");
    if (accept) accept.textContent = t("Accept");

    document.body.appendChild(bar);

    document.addEventListener("constructo:lang", () => {
        if (!document.body.contains(bar)) return;
        bar.setAttribute("aria-label", t("Cookie notice"));
        if (copy) copy.textContent = t("We store theme preference and your cookie choice locally. No ad trackers on this prototype.");
        if (link) link.textContent = t("Cookie policy");
        if (decline) decline.textContent = t("Decline");
        if (accept) accept.textContent = t("Accept");
    });

    bar.querySelectorAll("[data-choice]").forEach((btn) => {
        btn.addEventListener("click", () => {
            try {
                localStorage.setItem(KEY, btn.getAttribute("data-choice"));
            } catch (_) { /* ignore */ }
            bar.remove();
        });
    });
})();
