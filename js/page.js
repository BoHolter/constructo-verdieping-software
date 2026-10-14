(() => {
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
    if (contactForm && formStatus) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const name = contactForm.querySelector("#name")?.value.trim();
            const email = contactForm.querySelector("#email")?.value.trim();
            const message = contactForm.querySelector("#message")?.value.trim();

            formStatus.className = "form-status";
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

            formStatus.textContent = "Thanks! Your request has been received. We’ll contact you shortly.";
            formStatus.classList.add("ok");
            contactForm.reset();
        });

        try {
            const type = new URLSearchParams(window.location.search).get("type");
            const select = document.getElementById("projectType");
            if (type && select && [...select.options].some((o) => o.value === type)) {
                select.value = type;
            }
        } catch (_) { /* ignore */ }
    }
})();
