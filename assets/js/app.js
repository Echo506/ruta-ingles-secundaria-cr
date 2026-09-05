"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "englishQuestCRProgress";
  const CONTRAST_KEY = "englishQuestCRHighContrast";
  const MISSIONS = Array.isArray(window.seventhMissions)
    ? window.seventhMissions
    : [];
  const TOTAL_MISSIONS = MISSIONS.length || 24;

  function getDefaultProgress() {
    return {
      xp: 0,
      streak: 0,
      badges: [],
      completedMissions: [],
      lastStudyDate: null,
      lastChallengeDate: null
    };
  }

  function getProgress() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : {};

      return {
        ...getDefaultProgress(),
        ...parsed,
        badges: Array.isArray(parsed.badges) ? parsed.badges : [],
        completedMissions: Array.isArray(parsed.completedMissions)
          ? parsed.completedMissions
          : []
      };
    } catch (error) {
      return getDefaultProgress();
    }
  }

  function saveProgress(progress) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }

  function getToday() {
    return new Date().toISOString().slice(0, 10);
  }

  function updateStreak(progress) {
    const today = getToday();

    if (progress.lastStudyDate === today) {
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const yesterdayText = yesterday.toISOString().slice(0, 10);

    progress.streak =
      progress.lastStudyDate === yesterdayText ? progress.streak + 1 : 1;

    progress.lastStudyDate = today;

    if (
      progress.streak >= 3 &&
      !progress.badges.includes("active-streak")
    ) {
      progress.badges.push("active-streak");
    }
  }

  function getPagePrefix() {
    return window.location.pathname.includes("/pages/") ? "" : "pages/";
  }

  function getProgressUrl() {
    return `${getPagePrefix()}progress.html`;
  }

  function getMissionUrl(missionId) {
    return `mission.html?mission=${encodeURIComponent(missionId)}`;
  }

  function getMissionNumber(missionId) {
    const match = missionId.match(/(\d+)$/);
    return match ? Number(match[1]) : 0;
  }

  function getMissionById(missionId) {
    return MISSIONS.find((mission) => mission.id === missionId);
  }

  function getNextMission(missionId) {
    const currentIndex = MISSIONS.findIndex(
      (mission) => mission.id === missionId
    );

    if (currentIndex === -1) {
      return null;
    }

    return MISSIONS[currentIndex + 1] || null;
  }

  function isMissionLocked(missionId, completedMissions) {
    const missionIndex = MISSIONS.findIndex(
      (mission) => mission.id === missionId
    );

    if (missionIndex <= 0) {
      return false;
    }

    const previousMission = MISSIONS[missionIndex - 1];

    return !completedMissions.includes(previousMission.id);
  }

  function calculateProgress(progress) {
    return Math.min(
      100,
      Math.round((progress.completedMissions.length / TOTAL_MISSIONS) * 100)
    );
  }

  function getRank(progress) {
    if (progress.xp >= 1500) return "Master";
    if (progress.xp >= 800) return "Pathfinder";
    if (progress.xp >= 300) return "Adventurer";
    return "Explorer";
  }

  function escapeHtml(value) {
    const element = document.createElement("div");
    element.textContent = String(value);
    return element.innerHTML;
  }

  function updateProgressInterface() {
    const progress = getProgress();
    const percentage = calculateProgress(progress);

    const xp = document.querySelector("#xp-total");
    const streak = document.querySelector("#streak-total");
    const badges = document.querySelector("#badges-total");
    const percentageText = document.querySelector("#progress-percentage");
    const rank = document.querySelector("#rank-badge");
    const ring = document.querySelector("[data-progress-ring]");

    if (xp) xp.textContent = progress.xp;
    if (streak) streak.textContent = progress.streak;
    if (badges) badges.textContent = progress.badges.length;
    if (percentageText) percentageText.textContent = `${percentage}%`;
    if (rank) rank.textContent = getRank(progress);

    if (ring) {
      ring.style.background = `
        radial-gradient(
          closest-side,
          var(--surface-elevated) 78%,
          transparent 79% 100%
        ),
        conic-gradient(
          var(--mint) ${percentage * 3.6}deg,
          rgba(255, 255, 255, 0.12) 0deg
        )
      `;
      ring.setAttribute("aria-valuenow", String(percentage));
    }
  }

  function normalizeQuestion(question, index) {
    const [questionText, answers, correctIndex] = question;

    return {
      question: questionText,
      answers: answers.map((answer, answerIndex) => [
        String.fromCharCode(97 + answerIndex),
        answer
      ]),
      correct: String.fromCharCode(97 + correctIndex),
      correctMessage: "¡Correcto! Muy bien.",
      incorrectMessage: `La respuesta correcta es: ${answers[correctIndex]}.`,
      index
    };
  }

  function setupMissionPage() {
    const form = document.querySelector("#mission-quiz");

    if (!form) {
      return;
    }

    if (!MISSIONS.length) {
      const result = document.querySelector("#quiz-result");

      if (result) {
        result.textContent =
          "No se pudieron cargar las misiones. Verificá data/seventh-missions.js.";
        result.classList.add("is-warning");
      }

      return;
    }

    const params = new URLSearchParams(window.location.search);
    const requestedMissionId =
      params.get("mission") || "seventh-mission-1";

    const mission =
      getMissionById(requestedMissionId) || MISSIONS[0];

    const missionId = mission.id;
    const progress = getProgress();

    if (isMissionLocked(missionId, progress.completedMissions)) {
      window.location.href = "progress.html";
      return;
    }

    const title = document.querySelector("#mission-title");
    const description = document.querySelector("#mission-description");
    const vocabularyTitle = document.querySelector("#vocabulary-title");
    const vocabularyIntro = document.querySelector("#vocabulary-intro");
    const vocabularyGrid = document.querySelector("#vocabulary-grid");
    const tipText = document.querySelector("#tip-text");
    const languageTitle = document.querySelector("#language-title");
    const languageIntro = document.querySelector("#language-intro");
    const exampleBox = document.querySelector("#example-box");
    const languageExtra = document.querySelector("#language-extra");
    const speakingTip = document.querySelector("#speaking-tip");
    const dialogue = document.querySelector("#dialogue");
    const readingNote = document.querySelector("#reading-note");
    const questionsContainer = document.querySelector("#mission-questions");
    const result = document.querySelector("#quiz-result");

    if (
      !title ||
      !description ||
      !vocabularyTitle ||
      !vocabularyIntro ||
      !vocabularyGrid ||
      !tipText ||
      !languageTitle ||
      !languageIntro ||
      !exampleBox ||
      !languageExtra ||
      !speakingTip ||
      !dialogue ||
      !readingNote ||
      !questionsContainer ||
      !result
    ) {
      return;
    }

    document.title = `${mission.title} | English Quest CR`;

    title.textContent = mission.title;
    description.textContent = mission.description;
    vocabularyTitle.textContent = mission.vocabularyTitle;
    vocabularyIntro.textContent = mission.vocabularyIntro;
    tipText.textContent = mission.tip;
    languageTitle.textContent = mission.languageTitle;
    languageIntro.textContent = mission.languageIntro;
    languageExtra.textContent = mission.languageExtra;
    speakingTip.textContent = mission.speakingTip;
    readingNote.textContent = mission.readingNote;

    vocabularyGrid.innerHTML = mission.vocabulary
      .map(
        ([word, meaning]) => `
          <div class="word-card">
            <strong>${escapeHtml(word)}</strong>
            <span>${escapeHtml(meaning)}</span>
          </div>
        `
      )
      .join("");

    exampleBox.innerHTML = mission.examples
      .map((example) => `<p><strong>${escapeHtml(example)}</strong></p>`)
      .join("");

    dialogue.innerHTML = mission.dialogue
      .map(
        ([speaker, line]) => `
          <p>
            <strong>${escapeHtml(speaker)}:</strong>
            ${escapeHtml(line)}
          </p>
        `
      )
      .join("");

    const questions = mission.questions.map(normalizeQuestion);

    questionsContainer.innerHTML = questions
      .map(
        (question, index) => `
          <fieldset>
            <legend>${index + 1}. ${escapeHtml(question.question)}</legend>
            ${question.answers
              .map(
                ([value, answerText]) => `
                  <label class="answer-option">
                    <input
                      type="radio"
                      name="question-${index}"
                      value="${value}"
                    >
                    <span>${escapeHtml(answerText)}</span>
                  </label>
                `
              )
              .join("")}
            <p
              class="question-feedback"
              data-feedback="question-${index}"
            ></p>
          </fieldset>
        `
      )
      .join("");

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      let score = 0;
      let missing = 0;

      form.querySelectorAll(".question-feedback").forEach((feedback) => {
        feedback.textContent = "";
        feedback.className = "question-feedback";
      });

      questions.forEach((question, index) => {
        const questionName = `question-${index}`;

        const selected = form.querySelector(
          `input[name="${questionName}"]:checked`
        );

        const feedback = form.querySelector(
          `[data-feedback="${questionName}"]`
        );

        if (!selected) {
          missing += 1;
          feedback.textContent =
            "Elegí una respuesta antes de revisar.";
          feedback.classList.add("is-missing");
          return;
        }

        if (selected.value === question.correct) {
          score += 1;
          feedback.textContent = question.correctMessage;
          feedback.classList.add("is-correct");
        } else {
          feedback.textContent = question.incorrectMessage;
          feedback.classList.add("is-incorrect");
        }
      });

      result.className = "quiz-result";

      if (missing > 0) {
        result.textContent =
          "Respondé todas las preguntas antes de revisar.";
        result.classList.add("is-warning");
        result.focus();
        return;
      }

      if (score < 3) {
        result.innerHTML = `
          <strong>Vas por buen camino.</strong>
          Obtuviste ${score} de ${questions.length} respuestas correctas.
          Necesitás al menos 3 para completar la misión.
        `;
        result.classList.add("is-warning");
        result.focus();
        return;
      }

      const updatedProgress = getProgress();
      const alreadyCompleted =
        updatedProgress.completedMissions.includes(missionId);

      updateStreak(updatedProgress);

      if (!alreadyCompleted) {
        updatedProgress.xp += 100;
        updatedProgress.completedMissions.push(missionId);

        if (!updatedProgress.badges.includes("first-step")) {
          updatedProgress.badges.push("first-step");
        }

        if (
          updatedProgress.completedMissions.length === TOTAL_MISSIONS &&
          !updatedProgress.badges.includes("seventh-complete")
        ) {
          updatedProgress.badges.push("seventh-complete");
        }

        saveProgress(updatedProgress);
      }

      const nextMission = getNextMission(missionId);
      const nextMissionUrl = nextMission
        ? getMissionUrl(nextMission.id)
        : getProgressUrl();

      const nextMissionLabel = nextMission
        ? "Ir a la siguiente misión →"
        : "Ver mi progreso →";

      result.innerHTML = alreadyCompleted
        ? `
          <strong>¡Misión revisada!</strong>
          Obtuviste ${score} de ${questions.length} respuestas correctas.
          Ya habías recibido los XP de esta misión.
          <br><br>
          <a href="${nextMissionUrl}">${nextMissionLabel}</a>
        `
        : `
          <strong>¡Misión completada!</strong>
          Obtuviste ${score} de ${questions.length} respuestas correctas y ganaste
          <strong>100 XP</strong>.
          <br><br>
          <a href="${nextMissionUrl}">${nextMissionLabel}</a>
        `;

      result.classList.add("is-success");
      updateProgressInterface();
      result.focus();
    });
  }

  function setupDailyChallenge() {
    const form = document.querySelector("#daily-challenge-form");
    const result = document.querySelector("#challenge-result");

    if (!form || !result) {
      return;
    }

    const answers = {
      "daily-question-1": "a",
      "daily-question-2": "b",
      "daily-question-3": "b"
    };

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      let score = 0;

      Object.entries(answers).forEach(([name, correct]) => {
        const selected = form.querySelector(
          `input[name="${name}"]:checked`
        );

        if (selected && selected.value === correct) {
          score += 1;
        }
      });

      result.className = "quiz-result";

      if (score < 2) {
        result.innerHTML = `
          <strong>Seguí intentando.</strong>
          Obtuviste ${score} de 3 respuestas correctas.
          Necesitás al menos 2 para completar el reto.
        `;
        result.classList.add("is-warning");
        result.focus();
        return;
      }

      const progress = getProgress();
      const alreadyCompletedToday =
        progress.lastChallengeDate === getToday();

      updateStreak(progress);

      if (!alreadyCompletedToday) {
        progress.xp += 30;
        progress.lastChallengeDate = getToday();
        saveProgress(progress);
      }

      result.innerHTML = alreadyCompletedToday
        ? `
          <strong>¡Reto revisado!</strong>
          Obtuviste ${score} de 3 respuestas correctas.
          Ya recibiste los XP de este reto hoy.
        `
        : `
          <strong>¡Reto completado!</strong>
          Obtuviste ${score} de 3 respuestas correctas y ganaste
          <strong>30 XP</strong>.
          <br><br>
          <a href="${getProgressUrl()}">Ver mi progreso →</a>
        `;

      result.classList.add("is-success");
      updateProgressInterface();
      result.focus();
    });
  }

  function setupProgressPage() {
    const xp = document.querySelector("#progress-xp");

    if (!xp) {
      return;
    }

    const progress = getProgress();
    const completed = progress.completedMissions;
    const percentage = calculateProgress(progress);

    xp.textContent = progress.xp;

    const streak = document.querySelector("#progress-streak");
    const badges = document.querySelector("#progress-badges");
    const percentagePage = document.querySelector(
      "#progress-percentage-page"
    );

    if (streak) streak.textContent = progress.streak;
    if (badges) badges.textContent = progress.badges.length;
    if (percentagePage) percentagePage.textContent = `${percentage}%`;

    const missionList = document.querySelector(".mission-progress-list");

    if (missionList && MISSIONS.length) {
      missionList.innerHTML = MISSIONS.map((mission, index) => {
        const completedMission = completed.includes(mission.id);
        const available =
          index === 0 || completed.includes(MISSIONS[index - 1].id);
        const locked = !completedMission && !available;

        const icon = completedMission
          ? "✅"
          : locked
            ? "🔒"
            : "🧭";

        const status = completedMission
          ? "Completada"
          : locked
            ? "Bloqueada"
            : "Disponible";

        const classes = [
          "mission-progress-item",
          completedMission ? "is-completed" : "",
          locked ? "is-locked" : "",
          available && !completedMission ? "is-available" : ""
        ]
          .filter(Boolean)
          .join(" ");

        const url = getMissionUrl(mission.id);

        return `
          <article
            class="${classes}"
            ${locked ? "" : `data-mission-url="${url}"`}
            tabindex="${locked ? "-1" : "0"}"
            aria-label="${escapeHtml(mission.title)}: ${status}"
          >
            <span class="mission-progress-icon" aria-hidden="true">
              ${icon}
            </span>

            <div class="mission-progress-copy">
              <p class="mission-progress-label">
                Séptimo · ${escapeHtml(mission.unit)}
              </p>
              <h3>${escapeHtml(mission.title)}</h3>
              <p>${escapeHtml(mission.description)}</p>
            </div>

            <span class="mission-status ${
              completedMission ? "is-completed" : ""
            }">
              ${status}
            </span>
          </article>
        `;
      }).join("");

      missionList
        .querySelectorAll("[data-mission-url]")
        .forEach((card) => {
          const openMission = () => {
            window.location.href = card.dataset.missionUrl;
          };

          card.addEventListener("click", openMission);

          card.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              openMission();
            }
          });
        });
    }

    const continueLink = document.querySelector(
      "#continue-learning-link"
    );

    if (continueLink && MISSIONS.length) {
      const nextMission = MISSIONS.find(
        (mission) => !completed.includes(mission.id)
      );

      if (nextMission) {
        continueLink.href = getMissionUrl(nextMission.id);
        continueLink.innerHTML =
          'Continuar aprendiendo <span aria-hidden="true">→</span>';
      } else {
        continueLink.href = "challenge.html";
        continueLink.innerHTML =
          'Hacer reto diario <span aria-hidden="true">→</span>';
      }
    }

    const firstStepBadge = document.querySelector("#badge-first-step");

    if (progress.badges.includes("first-step") && firstStepBadge) {
      firstStepBadge.classList.add("is-earned");

      const state = firstStepBadge.querySelector(".badge-state");

      if (state) {
        state.textContent = "Obtenida";
      }
    }

    const streakBadge = document.querySelector("#badge-active-streak");

    if (progress.badges.includes("active-streak") && streakBadge) {
      streakBadge.classList.add("is-earned");

      const state = streakBadge.querySelector(".badge-state");

      if (state) {
        state.textContent = "Obtenida";
      }
    }
  }

  function setupNavigation() {
    const button = document.querySelector("[data-menu-toggle]");
    const navigation = document.querySelector("[data-navigation]");

    if (!button || !navigation) {
      return;
    }

    button.addEventListener("click", () => {
      const isOpen = navigation.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(isOpen));
      document.body.classList.toggle("menu-open", isOpen);
    });
  }

  function setupContrastToggle() {
    const button = document.querySelector("[data-contrast-toggle]");

    if (!button) {
      return;
    }

    const savedMode =
      localStorage.getItem(CONTRAST_KEY) === "true";

    document.body.classList.toggle("high-contrast", savedMode);
    button.setAttribute("aria-pressed", String(savedMode));

    button.addEventListener("click", () => {
      const enabled =
        !document.body.classList.contains("high-contrast");

      document.body.classList.toggle("high-contrast", enabled);
      button.setAttribute("aria-pressed", String(enabled));
      localStorage.setItem(CONTRAST_KEY, String(enabled));
    });
  }

  function setupCurrentYear() {
    document.querySelectorAll("#current-year").forEach((element) => {
      element.textContent = new Date().getFullYear();
    });
  }

  setupNavigation();
  setupContrastToggle();
  setupCurrentYear();
  updateProgressInterface();
  setupMissionPage();
  setupDailyChallenge();
  setupProgressPage();
});