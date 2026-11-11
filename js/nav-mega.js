(() => {
  const menu = document.getElementById("mainMenu");
  if (!menu || menu.dataset.mega === "1") return;

  const inPages =
    /\/pages\//.test(location.pathname) ||
    /pages[/\\][^/\\]+$/.test(location.pathname);
  const p = inPages ? "" : "pages/";
  const home = inPages
    ? "../index.html"
    : "index.html";
  const file = (location.pathname.split("/").pop() || "").toLowerCase();

  function link(href, label, desc) {
    const current =
      file && href.toLowerCase().endsWith(file)
        ? ' aria-current="page"'
        : "";
    const d = desc
      ? `<span class="mega-desc">${desc}</span>`
      : "";
    return `<a class="mega-link" href="${href}"${current}><span class="mega-link-label">${label}</span>${d}</a>`;
  }

  menu.dataset.mega = "1";
  menu.classList.add("nav-mega");
  menu.innerHTML = `
    <li class="has-mega">
      <button type="button" class="mega-trigger" aria-expanded="false" aria-controls="megaPanelWork" data-mega="work">
        Work <span class="mega-chevron" aria-hidden="true"></span>
      </button>
      <div class="mega-panel" id="megaPanelWork">
        <div class="mega-panel-inner">
        <div class="mega-grid">
          <div class="mega-col">
            <p class="mega-heading">Build</p>
            ${link(p + "services.html", "Services", "Contracting, renovations, management")}
            ${link(p + "process.html", "Process", "Intake to handover")}
            ${link(p + "projects.html", "Projects", "All case studies")}
            ${link(p + "estimate.html", "Estimate", "Breakdown calculator")}
          </div>
          <div class="mega-col">
            <p class="mega-heading">Selected projects</p>
            ${link(p + "family-home.html", "Family Home")}
            ${link(p + "canal-townhouse.html", "Canal Townhouse")}
            ${link(p + "warehouse-loft.html", "Warehouse Loft")}
            ${link(p + "projects.html", "View all projects →")}
          </div>
          <div class="mega-col mega-col-accent">
            <p class="mega-heading">Start</p>
            <p class="mega-blurb">Tell us about your build — fixed price where possible.</p>
            <a class="cta mega-cta" href="${p}contact.html">Request a quote →</a>
          </div>
        </div>
        </div>
      </div>
    </li>
    <li class="has-mega">
      <button type="button" class="mega-trigger" aria-expanded="false" aria-controls="megaPanelStudio" data-mega="studio">
        Studio <span class="mega-chevron" aria-hidden="true"></span>
      </button>
      <div class="mega-panel" id="megaPanelStudio">
        <div class="mega-panel-inner">
        <div class="mega-grid mega-grid-3">
          <div class="mega-col">
            <p class="mega-heading">Company</p>
            ${link(home, "Home", "Constructo overview")}
            ${link(p + "about.html", "About", "Who we are")}
            ${link(p + "team.html", "Team", "The crew")}
            ${link(p + "careers.html", "Careers", "Open roles")}
          </div>
          <div class="mega-col">
            <p class="mega-heading">Social proof</p>
            ${link(p + "testimonials.html", "Reviews", "What clients say")}
            ${link(p + "process.html", "How we work", "Our method")}
          </div>
          <div class="mega-col mega-col-accent">
            <p class="mega-heading">People</p>
            <p class="mega-blurb">Site managers, trades leads, and design partners on every job.</p>
            <a class="cta mega-cta" href="${p}team.html">Meet the team →</a>
          </div>
        </div>
        </div>
      </div>
    </li>
    <li class="has-mega">
      <button type="button" class="mega-trigger" aria-expanded="false" aria-controls="megaPanelExplore" data-mega="explore">
        Explore <span class="mega-chevron" aria-hidden="true"></span>
      </button>
      <div class="mega-panel" id="megaPanelExplore">
        <div class="mega-panel-inner">
        <div class="mega-grid mega-grid-3">
          <div class="mega-col">
            <p class="mega-heading">Tools</p>
            ${link(p + "style-quiz.html", "Quiz", "Find your build style")}
            ${link(p + "estimate.html", "Estimate", "Rough figure with lines")}
            ${link(p + "faq.html", "FAQ", "Permits, price, timelines")}
            ${link(p + "contact.html", "Contact", "Get in touch")}
          </div>
          <div class="mega-col">
            <p class="mega-heading">Legal</p>
            ${link(p + "privacy.html", "Privacy")}
            ${link(p + "cookies.html", "Cookies")}
            ${link(p + "terms.html", "Terms")}
          </div>
          <div class="mega-col mega-col-accent">
            <p class="mega-heading">Try it</p>
            <p class="mega-blurb">Four quick picks — match your renovation vibe to a project.</p>
            <a class="cta mega-cta" href="${p}style-quiz.html">Take the quiz →</a>
          </div>
        </div>
        </div>
      </div>
    </li>
    <li><a href="${p}contact.html" class="cta">Contact</a></li>
    <li class="nav-tools">
      <button id="themeToggle" class="theme-toggle" aria-label="Toggle color mode" type="button">☀</button>
    </li>
  `;

  const header = document.querySelector(".site-header");
  const triggers = [...menu.querySelectorAll(".mega-trigger")];

  function closeAll(except) {
    triggers.forEach((btn) => {
      if (except && btn === except) return;
      btn.setAttribute("aria-expanded", "false");
      btn.parentElement?.classList.remove("is-open");
    });
    const anyOpen = triggers.some((btn) => btn.getAttribute("aria-expanded") === "true");
    if (!anyOpen) header?.classList.remove("mega-open");
  }

  function openPanel(btn) {
    if (!btn) return;
    if (btn.getAttribute("aria-expanded") === "true") {
      header?.classList.add("mega-open");
      return;
    }
    closeAll();
    btn.setAttribute("aria-expanded", "true");
    // next frame so CSS can fade from closed state
    requestAnimationFrame(() => {
      btn.parentElement?.classList.add("is-open");
      header?.classList.add("mega-open");
    });
  }

  triggers.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (btn.getAttribute("aria-expanded") === "true") closeAll();
      else openPanel(btn);
    });
  });

  // Desktop: open on hover. One shared timer — switching Work→Studio
  // must not let the previous tab's leave-timer close the new panel.
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    let closeTimer;
    menu.querySelectorAll(".has-mega").forEach((item) => {
      item.addEventListener("mouseenter", () => {
        clearTimeout(closeTimer);
        const btn = item.querySelector(".mega-trigger");
        if (btn) openPanel(btn);
      });
    });
    menu.addEventListener("mouseenter", () => clearTimeout(closeTimer));
    menu.addEventListener("mouseleave", () => {
      closeTimer = setTimeout(() => closeAll(), 200);
    });
  }

  document.addEventListener("click", (e) => {
    if (!header?.contains(e.target) && !menu.contains(e.target)) closeAll();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAll();
  });

  menu.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      closeAll();
      menu.classList.remove("open");
      document.getElementById("menuToggle")?.setAttribute("aria-expanded", "false");
    });
  });

  // Re-apply i18n after rebuild (if already booted)
  if (window.ConstructoI18n?.apply && window.ConstructoI18n.getLang) {
    window.ConstructoI18n.apply(window.ConstructoI18n.getLang());
  }
})();
