(() => {
    if (!document.querySelector(".skip-link")) {
        const skip = document.createElement("a");
        skip.className = "skip-link";
        skip.href = "#main";
        skip.textContent = "Skip to content";
        document.body.prepend(skip);
    }
    const main = document.querySelector("main");
    if (main && !main.id) main.id = "main";

    const menuToggle = document.getElementById("menuToggle");
    const mainMenu = document.getElementById("mainMenu");

    menuToggle?.addEventListener("click", () => {
        const open = mainMenu.classList.toggle("open");
        menuToggle.setAttribute("aria-expanded", String(open));
    });

    mainMenu?.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            mainMenu.classList.remove("open");
            menuToggle?.setAttribute("aria-expanded", "false");
        });
    });

    const year = document.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());

    const contactForm = document.getElementById("contactForm");
    const formStatus = document.getElementById("formStatus");
    const formSuccess = document.getElementById("formSuccess");
    const formWrap = document.getElementById("formWrap");

    if (contactForm && formStatus) {
        try {
            const params = new URLSearchParams(window.location.search);
            const type = params.get("type");
            const role = params.get("role");
            const select = document.getElementById("projectType");
            if (type && select) {
                const match = [...select.options].find(
                    (o) => o.value === type || o.textContent === type
                );
                if (match) select.value = match.value;
                else if (type === "Careers") {
                    const careers = [...select.options].find((o) => /career/i.test(o.value + o.textContent));
                    if (careers) select.value = careers.value;
                }
            }
            const message = document.getElementById("message");
            if (role && message && !message.value) {
                message.value = `Application for: ${role}\n\n`;
            }
        } catch (_) { /* ignore */ }

        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const name = contactForm.querySelector("#name")?.value.trim();
            const email = contactForm.querySelector("#email")?.value.trim();
            const message = contactForm.querySelector("#message")?.value.trim();

            formStatus.className = "form-status";
            formStatus.textContent = "";

            if (!name || !email || !message) {
                formStatus.textContent = "Please complete name, email, and project brief.";
                formStatus.classList.add("err");
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                formStatus.textContent = "Enter a valid email address.";
                formStatus.classList.add("err");
                return;
            }

            // Prototype: no real backend — show success UI only
            if (formSuccess && formWrap) {
                formWrap.hidden = true;
                formSuccess.hidden = false;
                formSuccess.focus?.();
                formSuccess.scrollIntoView({ behavior: "smooth", block: "start" });
            } else {
                formStatus.textContent =
                    "Thanks! This is a demo form — nothing was emailed. We’ll treat it as received.";
                formStatus.classList.add("ok");
                contactForm.reset();
            }
        });
    }

    document.getElementById("sendAnother")?.addEventListener("click", () => {
        if (formWrap && formSuccess) {
            formSuccess.hidden = true;
            formWrap.hidden = false;
            contactForm?.reset();
            formStatus.textContent = "";
            formStatus.className = "form-status";
            const meta = document.getElementById("fileDropMeta");
            const title = document.getElementById("fileDropTitle");
            if (title) title.textContent = "Add site photos";
            if (meta) meta.textContent = "JPG or PNG · optional";
            contactForm?.querySelector("#name")?.focus();
        }
    });

    const pictures = document.getElementById("pictures");
    pictures?.addEventListener("change", () => {
        const title = document.getElementById("fileDropTitle");
        const meta = document.getElementById("fileDropMeta");
        const files = [...(pictures.files || [])];
        if (!files.length) {
            if (title) title.textContent = "Add site photos";
            if (meta) meta.textContent = "JPG or PNG · optional";
            return;
        }
        if (title) title.textContent = files.length === 1 ? files[0].name : `${files.length} files selected`;
        if (meta) meta.textContent = "Click to change";
    });

    const filterBar = document.querySelector(".project-filters");
    if (filterBar) {
        const cards = [...document.querySelectorAll(".project-card")];
        filterBar.addEventListener("click", (e) => {
            const btn = e.target.closest("button[data-filter]");
            if (!btn) return;
            filterBar.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", "false"));
            btn.setAttribute("aria-pressed", "true");
            const filter = btn.getAttribute("data-filter");
            cards.forEach((card) => {
                const show = filter === "all" || card.getAttribute("data-category") === filter;
                card.hidden = !show;
            });
        });
    }
})();
