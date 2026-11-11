(function () {
  function t(en) {
    return window.ConstructoI18n ? window.ConstructoI18n.t(en) : en;
  }

  var questions = [
    {
      title: "What’s the first thing you want to fix?",
      choices: [
        { label: "Light and open rooms", scores: { loft: 2, family: 1, canal: 1 } },
        { label: "Character on the street façade", scores: { canal: 2, courtyard: 1 } },
        { label: "Kitchen + garden as one space", scores: { family: 2, courtyard: 1, lake: 1 } },
        { label: "A calm place by the water", scores: { lake: 2, family: 1 } }
      ]
    },
    {
      title: "Which material feels most like you?",
      choices: [
        { label: "Brick and steel", scores: { loft: 2, canal: 1 } },
        { label: "Warm timber and soft plaster", scores: { family: 2, lake: 1 } },
        { label: "Restored classic details", scores: { canal: 2, courtyard: 1 } },
        { label: "Stone, planting, outdoor rooms", scores: { courtyard: 2, lake: 1 } }
      ]
    },
    {
      title: "How should the finished home feel?",
      choices: [
        { label: "Industrial but comfortable", scores: { loft: 2 } },
        { label: "Busy family, zero chaos", scores: { family: 2, courtyard: 1 } },
        { label: "Quiet heritage charm", scores: { canal: 2 } },
        { label: "Weekend escape every day", scores: { lake: 2, courtyard: 1 } }
      ]
    },
    {
      title: "Budget mindset for this project?",
      choices: [
        { label: "Invest where you see it every day", scores: { canal: 1, family: 1, loft: 1 } },
        { label: "Fixed price, no surprise extras", scores: { family: 2, canal: 1 } },
        { label: "Phase it — outdoor first", scores: { courtyard: 2, lake: 1 } },
        { label: "One bold conversion", scores: { loft: 2, lake: 1 } }
      ]
    }
  ];

  var results = {
    loft: {
      name: "Industrial loft",
      blurb: "You lean toward open volumes, steel, brick, and a live-work edge — warehouse character without the draft.",
      project: "Warehouse Loft",
      href: "warehouse-loft.html",
      img: "../img/Warehouse-Loft.jpg",
      type: "Renovation"
    },
    family: {
      name: "Family extension",
      blurb: "You want the kitchen, garden, and bedrooms to finally work as one — practical, bright, and built to last.",
      project: "Family Home",
      href: "family-home.html",
      img: "../img/Home-Extension.jpg",
      type: "New%20Build"
    },
    canal: {
      name: "Canal classic",
      blurb: "You care about façade honesty and interiors that feel restored, not replaced — fixed price, no silent extras.",
      project: "Canal Townhouse",
      href: "canal-townhouse.html",
      img: "../img/Canal-Townhouse.jpg",
      type: "Renovation"
    },
    courtyard: {
      name: "Courtyard living",
      blurb: "Outdoor rooms matter as much as indoors — brick, planting, and Dutch-weather seating that still feels like home.",
      project: "Brick Courtyard",
      href: "brick-courtyard.html",
      img: "../img/Brick-Courtyard.jpg",
      type: "Renovation"
    },
    lake: {
      name: "Waterside calm",
      blurb: "You want light, horizon, and a plan that respects moisture and structure — a build that feels like a reset.",
      project: "Lake House",
      href: "lake-house.html",
      img: "../img/Lake-House.jpg",
      type: "New%20Build"
    }
  };

  var step = 0;
  var scores = { loft: 0, family: 0, canal: 0, courtyard: 0, lake: 0 };
  var showingResult = false;

  var qEl = document.getElementById("quizQuestion");
  var cEl = document.getElementById("quizChoices");
  var rEl = document.getElementById("quizResult");
  var bar = document.getElementById("quizBar");
  var stepLabel = document.getElementById("quizStepLabel");

  if (!qEl || !cEl || !rEl) return;

  function winner() {
    var best = "family";
    var max = -1;
    Object.keys(scores).forEach(function (k) {
      if (scores[k] > max) {
        max = scores[k];
        best = k;
      }
    });
    return best;
  }

  function renderQuestion() {
    showingResult = false;
    var q = questions[step];
    stepLabel.textContent = t("Question " + (step + 1) + " of 4");
    bar.style.width = ((step / questions.length) * 100) + "%";
    rEl.hidden = true;
    cEl.hidden = false;
    qEl.hidden = false;
    stepLabel.hidden = false;

    qEl.innerHTML = '<h3 id="quizQTitle">' + t(q.title) + "</h3>";
    cEl.innerHTML = "";
    q.choices.forEach(function (choice, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "quiz-choice";
      btn.textContent = t(choice.label);
      btn.addEventListener("click", function () {
        Object.keys(choice.scores).forEach(function (k) {
          scores[k] += choice.scores[k];
        });
        step += 1;
        if (step >= questions.length) {
          showResult();
        } else {
          renderQuestion();
        }
      });
      cEl.appendChild(btn);
      btn.style.animationDelay = i * 40 + "ms";
    });
  }

  function showResult() {
    showingResult = true;
    var key = winner();
    var res = results[key];
    bar.style.width = "100%";
    stepLabel.textContent = t("Your match");
    qEl.hidden = true;
    cEl.hidden = true;
    rEl.hidden = false;
    rEl.innerHTML =
      '<div class="quiz-result-card">' +
      '<img src="' + res.img + '" alt="' + t(res.project) + '" />' +
      "<div>" +
      '<p class="quiz-result-eyebrow">' + t("Your style") + "</p>" +
      "<h3>" + t(res.name) + "</h3>" +
      "<p>" + t(res.blurb) + "</p>" +
      '<p class="quiz-result-match">' + t("Closest project:") + " <strong>" + t(res.project) + "</strong></p>" +
      '<div class="quiz-result-actions">' +
      '<a class="cta" href="' + res.href + '">' + t("View project →") + "</a>" +
      '<a class="cta cta-secondary" href="contact.html?type=' + res.type + '">' + t("Talk to us") + "</a>" +
      '<button type="button" class="quiz-again" id="quizAgain">' + t("Try again") + "</button>" +
      "</div></div></div>";

    document.getElementById("quizAgain").addEventListener("click", function () {
      step = 0;
      scores = { loft: 0, family: 0, canal: 0, courtyard: 0, lake: 0 };
      renderQuestion();
    });
  }

  document.addEventListener("constructo:lang", function () {
    if (showingResult) showResult();
    else renderQuestion();
  });

  renderQuestion();
})();
