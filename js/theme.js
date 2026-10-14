(() => {
    const STORAGE_KEY = "theme";

    function preferredTheme() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored === "light" || stored === "dark") return stored;
        } catch (_) { /* ignore */ }
        return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }

    function applyTheme(theme, { animate = false } = {}) {
        const root = document.documentElement;
        const isDark = theme === "dark";
        root.classList.toggle("dark", isDark);
        root.dataset.theme = theme;
        document.body?.classList.toggle("dark", isDark);

        if (animate) {
            root.classList.add("theme-animate");
            window.clearTimeout(applyTheme._timer);
            applyTheme._timer = window.setTimeout(() => {
                root.classList.remove("theme-animate");
            }, 450);
        }

        document.querySelectorAll("#themeToggle, [data-theme-toggle]").forEach((btn) => {
            btn.textContent = isDark ? "☾" : "☀";
            btn.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
            btn.setAttribute("aria-pressed", String(isDark));
            btn.title = isDark ? "Light mode" : "Dark mode";
        });
    }

    function setTheme(theme, { persist = true, animate = true } = {}) {
        applyTheme(theme, { animate });
        if (persist) {
            try { localStorage.setItem(STORAGE_KEY, theme); } catch (_) { /* ignore */ }
        }
    }

    // Sync in case head script did not run
    applyTheme(preferredTheme(), { animate: false });

    document.querySelectorAll("#themeToggle, [data-theme-toggle]").forEach((btn) => {
        btn.addEventListener("click", () => {
            const next = document.documentElement.classList.contains("dark") ? "light" : "dark";
            setTheme(next, { animate: true });
        });
    });

    window.matchMedia?.("(prefers-color-scheme: dark)")?.addEventListener?.("change", (e) => {
        try {
            if (localStorage.getItem(STORAGE_KEY)) return;
        } catch (_) { return; }
        setTheme(e.matches ? "dark" : "light", { persist: false, animate: true });
    });

    window.ConstructoTheme = { setTheme, preferredTheme, applyTheme };
})();
