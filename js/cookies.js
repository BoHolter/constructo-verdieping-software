(() => {
    const KEY = "constructoCookies";
    try {
        if (localStorage.getItem(KEY)) return;
    } catch (_) {
        return;
    }

    const bar = document.createElement("div");
    bar.className = "cookie-bar";
    bar.setAttribute("role", "dialog");
    bar.setAttribute("aria-label", "Cookie notice");
    bar.innerHTML = `
        <div class="cookie-bar-inner">
            <p>We store theme preference and your cookie choice locally. No ad trackers on this prototype. <a href="${document.body.dataset.cookiePath || "pages/cookies.html"}">Cookie policy</a></p>
            <div class="cookie-actions">
                <button type="button" class="cookie-decline" data-choice="declined">Decline</button>
                <button type="button" class="cta cookie-accept" data-choice="accepted">Accept</button>
            </div>
        </div>
    `;

    // Fix relative cookie policy link from /pages/*
    const inPages = /\/pages\//.test(location.pathname) || location.pathname.endsWith("\\pages\\") || /pages[/\\][^/\\]+$/.test(location.pathname);
    const link = bar.querySelector("a");
    if (link) link.setAttribute("href", inPages ? "cookies.html" : "pages/cookies.html");

    document.body.appendChild(bar);

    bar.querySelectorAll("[data-choice]").forEach((btn) => {
        btn.addEventListener("click", () => {
            try {
                localStorage.setItem(KEY, btn.getAttribute("data-choice"));
            } catch (_) { /* ignore */ }
            bar.remove();
        });
    });
})();
