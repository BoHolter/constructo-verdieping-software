(function () {
  var form = document.getElementById("fullEstimate");
  if (!form) return;

  var t = function (en) {
    return window.ConstructoI18n ? window.ConstructoI18n.t(en) : en;
  };

  var rates = {
    Renovation: 900,
    "New Build": 1500,
    "Commercial Fit-out": 1250,
    "Project Management": 250
  };

  var finishMult = {
    standard: 1,
    premium: 1.18,
    heritage: 1.32
  };

  var finishLabel = {
    standard: "1.00×",
    premium: "1.18×",
    heritage: "1.32×"
  };

  var emptyEl = document.getElementById("estimateEmpty");
  var emptyCopy = emptyEl ? emptyEl.querySelector(".estimate-empty-copy") : null;
  var breakdownEl = document.getElementById("estimateBreakdown");
  var linesEl = document.getElementById("estLines");
  var barsEl = document.getElementById("estBars");
  var totalEl = document.getElementById("estTotal");
  var perM2El = document.getElementById("estPerM2");
  var budgetNote = document.getElementById("estBudgetNote");
  var contactLink = document.getElementById("estContactLink");
  var finishSelect = document.getElementById("estFinish");
  var dateEl = document.getElementById("estDate");
  var refEl = document.getElementById("estRef");
  var kpiRate = document.getElementById("kpiRate");
  var kpiSize = document.getElementById("kpiSize");
  var kpiFinish = document.getElementById("kpiFinish");
  var kpiRef = document.getElementById("kpiRef");

  function money(n) {
    return "€" + Math.round(n).toLocaleString("nl-NL");
  }

  function syncFinishFromRadios() {
    var checked = form.querySelector('input[name="estFinishRadio"]:checked');
    if (checked && finishSelect) finishSelect.value = checked.value;
  }

  function ensureRef() {
    var key = "constructoEstRef";
    var ref = null;
    try { ref = sessionStorage.getItem(key); } catch (_) {}
    if (!ref) {
      ref = "CS-" + String(Date.now()).slice(-6);
      try { sessionStorage.setItem(key, ref); } catch (_) {}
    }
    if (refEl) refEl.textContent = ref;
    if (kpiRef) kpiRef.textContent = ref;
    return ref;
  }

  function setDate() {
    if (!dateEl) return;
    var d = new Date();
    dateEl.textContent = d.toLocaleDateString(document.documentElement.lang === "nl" ? "nl-NL" : "en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }

  function calc() {
    syncFinishFromRadios();
    var type = document.getElementById("estType").value;
    var size = Number(document.getElementById("estSize").value) || 0;
    var finish = (finishSelect && finishSelect.value) || "standard";
    var showVat = document.getElementById("estVat").checked;
    var budgetRaw = (document.getElementById("estBudget").value || "").replace(/[^\d]/g, "");
    var budget = Number(budgetRaw) || 0;

    var baseRate = rates[type] || 1000;
    if (kpiRate) kpiRate.textContent = money(baseRate) + "/m²";
    if (kpiSize) kpiSize.textContent = size >= 10 ? size + " m²" : "—";
    if (kpiFinish) kpiFinish.textContent = finishLabel[finish] || "—";

    if (size < 10) {
      emptyEl.hidden = false;
      if (emptyCopy) {
        emptyCopy.textContent = t("Enter a size of at least 10 m² to see a breakdown.");
      }
      breakdownEl.hidden = true;
      return;
    }

    var mult = finishMult[finish] || 1;
    var works = baseRate * size * mult;
    var contingency = works * 0.08;
    var coordination = works * 0.06;
    var subtotal = works + contingency + coordination;
    var vat = showVat ? subtotal * 0.21 : 0;
    var total = subtotal + vat;

    var lines = [
      { label: t("Works (labour & materials)"), amount: works, tone: "works" },
      { label: t("Contingency (8%)"), amount: contingency, tone: "risk" },
      { label: t("Coordination (6%)"), amount: coordination, tone: "coord" }
    ];
    if (showVat) lines.push({ label: t("Indicative BTW (21%)"), amount: vat, tone: "vat" });

    var max = Math.max.apply(null, lines.map(function (l) { return l.amount; })) || 1;

    linesEl.innerHTML = lines
      .map(function (line) {
        var pct = Math.round((line.amount / total) * 100);
        return (
          '<li class="estimate-line">' +
          '<div class="estimate-line-top"><span>' + line.label + '</span><strong>' + money(line.amount) + "</strong></div>" +
          '<div class="estimate-line-bar" aria-hidden="true"><span class="tone-' + line.tone + '" style="width:' +
          Math.max(6, (line.amount / max) * 100) +
          '%"></span></div>' +
          '<div class="estimate-line-pct">' + pct + "%</div>" +
          "</li>"
        );
      })
      .join("");

    if (barsEl) {
      barsEl.innerHTML = "";
    }

    totalEl.textContent = money(total);
    if (perM2El) {
      perM2El.textContent = money(total / size) + " / m² · " + t(type) + " · " + size + " m²";
    }
    emptyEl.hidden = true;
    breakdownEl.hidden = false;

    if (budget > 0) {
      budgetNote.hidden = false;
      var diff = budget - total;
      if (diff >= 0) {
        budgetNote.textContent =
          t("Within your target by about") + " " + money(diff) + ".";
        budgetNote.classList.remove("is-over");
      } else {
        budgetNote.textContent =
          t("About") + " " + money(Math.abs(diff)) + " " + t("above your target — we can phase scope.");
        budgetNote.classList.add("is-over");
      }
    } else {
      budgetNote.hidden = true;
    }

    contactLink.href =
      "contact.html?type=" +
      encodeURIComponent(type) +
      "&size=" +
      encodeURIComponent(String(size));
  }

  form.querySelectorAll('input[name="estFinishRadio"]').forEach(function (radio) {
    radio.addEventListener("change", function () {
      syncFinishFromRadios();
      calc();
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    calc();
  });

  ["estType", "estSize", "estFinish", "estBudget", "estVat"].forEach(function (id) {
    var el = document.getElementById(id);
    el?.addEventListener("change", calc);
    el?.addEventListener("input", function () {
      if (id === "estSize" || id === "estBudget") calc();
    });
  });

  document.addEventListener("constructo:lang", function () {
    setDate();
    calc();
  });

  ensureRef();
  setDate();

  try {
    var params = new URLSearchParams(location.search);
    var type = params.get("type");
    var size = params.get("size");
    if (type) {
      var sel = document.getElementById("estType");
      if ([...sel.options].some(function (o) { return o.value === type; })) sel.value = type;
    }
    if (size) document.getElementById("estSize").value = size;
  } catch (_) { /* ignore */ }

  calc();
})();
