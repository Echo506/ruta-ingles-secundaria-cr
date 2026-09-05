"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "englishQuestCRProgress";
  const CONTRAST_KEY = "englishQuestCRHighContrast";

  const SEVENTH_MISSIONS = Array.isArray(window.seventhMissions)
    ? window.seventhMissions
    : [];

  const EIGHTH_MISSIONS = Array.isArray(window.eighthMissions)
    ? window.eighthMissions
    : [];

  const MISSIONS = [...SEVENTH_MISSIONS, ...EIGHTH_MISSIONS];
  const TOTAL_MISSIONS = MISSIONS.length || 48;

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

  function getMissionById(missionId) {
    return MISSIONS.find((mission) => mission.id === missionId);
  }

  function getNextMission(missionId) {
    const currentIndex = MISSIONS.findIndex(
      (mission) => mission.id === missionId
    );

    return currentIndex >= 0 ? MISSIONS[currentIndex + 1] || null : null;
  }

  function isMissionLocked(missionId, completedMissions) {
    const missionIndex = MISSIONS.findIndex(
      (mission) => mission.id === missionId
    );

    if (missionIndex <= 0) {
      return false;
    }

    return !completedMissions.includes(MISSIONS[missionIndex - 1].id);
  }

  function calculateProgress(progress) {
    return Math.min(
      100,
      Math.round(
        (progress.completedMissions.length / TOTAL_MISSIONS) * 100
      )
    );
  }

  function getRank(progress) {
    if (progress.xp >= 3500) return "Master";
    if (progress.xp >= 1800) return "Pathfinder";
    if (progress.xp >= 600) return "Adventurer";
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

  function normalizeQuestion(question) {
    const [questionText, answers, correctIndex] = question;

    return {
      question: questionText,
      answers: answers.map((answer, index) => [
        String.fromCharCode(97 + index),
        answer
      ]),
      correct: String.fromCharCode(97 + correctIndex),
      correctMessage: "¡Correcto! Muy bien.",
      incorrectMessage: `La respuesta correcta es: ${answers[correctIndex]}.`
    };
  }

  function setupMissionPage() {
    const form = document.querySelector("#mission-quiz");

    if (!form) return;

    const result = document.querySelector("#quiz-result");

    if (!MISSIONS.length) {
      if (result) {
        result.textContent =
          "No se cargaron las misiones. Revisá los archivos en data/.";
        result.className = "quiz-result is-warning";
      }
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const requestedMissionId =
      params.get("mission") || "seventh-mission-1";

    const mission = getMissionById(requestedMissionId) || MISSIONS[0];
    const progress = getProgress();

    if (isMissionLocked(mission.id, progress.completedMissions)) {
      window.location.href = "progress.html";
      return;
    }

    const elements = {
      title: document.querySelector("#mission-title"),
      description: document.querySelector("#mission-description"),
      vocabularyTitle: document.querySelector("#vocabulary-title"),
      vocabularyIntro: document.querySelector("#vocabulary-intro"),
      vocabularyGrid: document.querySelector("#vocabulary-grid"),
      tipText: document.querySelector("#tip-text"),
      languageTitle: document.querySelector("#language-title"),
      languageIntro: document.querySelector("#language-intro"),
      exampleBox: document.querySelector("#example-box"),
      languageExtra: document.querySelector("#language-extra"),
      speakingTip: document.querySelector("#speaking-tip"),
      dialogue: document.querySelector("#dialogue"),
      readingNote: document.querySelector("#reading-note"),
      questions: document.querySelector("#mission-questions"),
      result
    };

    if (Object.values(elements).some((element) => !element)) return;

    document.title = `${mission.title} | English Quest CR`;

    elements.title.textContent = mission.title;
    elements.description.textContent = mission.description;
    elements.vocabularyTitle.textContent = mission.vocabularyTitle;
    elements.vocabularyIntro.textContent = mission.vocabularyIntro;
    elements.tipText.textContent = mission.tip;
    elements.languageTitle.textContent = mission.languageTitle;
    elements.languageIntro.textContent = mission.languageIntro;
    elements.languageExtra.textContent = mission.languageExtra;
    elements.speakingTip.textContent = mission.speakingTip;
    elements.readingNote.textContent = mission.readingNote;

    elements.vocabularyGrid.innerHTML = mission.vocabulary
      .map(
        ([word, meaning]) => `
          <div class="word-card">
            <strong>${escapeHtml(word)}</strong>
            <span>${escapeHtml(meaning)}</span>
          </div>
        `
      )
      .join("");

    elements.exampleBox.innerHTML = mission.examples
      .map((example) => `<p><strong>${escapeHtml(example)}</strong></p>`)
      .join("");

    elements.dialogue.innerHTML = mission.dialogue
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

    elements.questions.innerHTML = questions
      .map(
        (question, index) => `
          <fieldset>
            <legend>${index + 1}. ${escapeHtml(question.question)}</legend>
            ${question.answers
              .map(
                ([value, answer]) => `
                  <label class="answer-option">
                    <input
                      type="radio"
                      name="question-${index}"
                      value="${value}"
                    >
                    <span>${escapeHtml(answer)}</span>
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
        const input = form.querySelector(
          `input[name="question-${index}"]:checked`
        );

        const feedback = form.querySelector(
          `[data-feedback="question-${index}"]`
        );

        if (!input) {
          missing += 1;
          feedback.textContent = "Elegí una respuesta antes de revisar.";
          feedback.classList.add("is-missing");
          return;
        }

        if (input.value === question.correct) {
          score += 1;
          feedback.textContent = question.correctMessage;
          feedback.classList.add("is-correct");
        } else {
          feedback.textContent = question.incorrectMessage;
          feedback.classList.add("is-incorrect");
        }
      });

      elements.result.className = "quiz-result";

      if (missing > 0) {
        elements.result.textContent =
          "Respondé todas las preguntas antes de revisar.";
        elements.result.classList.add("is-warning");
        elements.result.focus();
        return;
      }

      if (score < 3) {
        elements.result.innerHTML = `
          <strong>Vas por buen camino.</strong>
          Obtuviste ${score} de ${questions.length} respuestas correctas.
          Necesitás al menos 3 para completar la misión.
        `;
        elements.result.classList.add("is-warning");
        elements.result.focus();
        return;
      }

      const updatedProgress = getProgress();
      const alreadyCompleted =
        updatedProgress.completedMissions.includes(mission.id);

      updateStreak(updatedProgress);

      if (!alreadyCompleted) {
        updatedProgress.xp += 100;
        updatedProgress.completedMissions.push(mission.id);

        if (!updatedProgress.badges.includes("first-step")) {
          updatedProgress.badges.push("first-step");
        }

        const seventhComplete = SEVENTH_MISSIONS.every((item) =>
          updatedProgress.completedMissions.includes(item.id)
        );

        if (
          seventhComplete &&
          !updatedProgress.badges.includes("seventh-complete")
        ) {
          updatedProgress.badges.push("seventh-complete");
        }

        const eighthComplete = EIGHTH_MISSIONS.length > 0 &&
          EIGHTH_MISSIONS.every((item) =>
            updatedProgress.completedMissions.includes(item.id)
          );

        if (
          eighthComplete &&
          !updatedProgress.badges.includes("eighth-complete")
        ) {
          updatedProgress.badges.push("eighth-complete");
        }

        saveProgress(updatedProgress);
      }

      const nextMission = getNextMission(mission.id);
      const nextUrl = nextMission
        ? getMissionUrl(nextMission.id)
        : getProgressUrl();

      const nextLabel = nextMission
        ? "Ir a la siguiente misión →"
        : "Ver mi progreso →";

      elements.result.innerHTML = alreadyCompleted
        ? `
          <strong>¡Misión revisada!</strong>
          Obtuviste ${score} de ${questions.length} respuestas correctas.
          Ya habías recibido los XP de esta misión.
          <br><br>
          <a href="${nextUrl}">${nextLabel}</a>
        `
        : `
          <strong>¡Misión completada!</strong>
          Obtuviste ${score} de ${questions.length} respuestas correctas y ganaste
          <strong>100 XP</strong>.
          <br><br>
          <a href="${nextUrl}">${nextLabel}</a>
        `;

      elements.result.classList.add("is-success");
      updateProgressInterface();
      elements.result.focus();
    });
  }

  function setupDailyChallenge() {
    const form = document.querySelector("#daily-challenge-form");
    const result = document.querySelector("#challenge-result");

    if (!form || !result) return;

    const answers = {
      "daily-question-1": "a",
      "daily-question-2": "b",
      "daily-question-3": "b"
    };

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const score = Object.entries(answers).reduce(
        (total, [name, correct]) => {
          const selected = form.querySelector(
            `input[name="${name}"]:checked`
          );

          return total + Number(selected && selected.value === correct);
        },
        0
      );

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

  function renderMissionGroup(missions, grade, completed) {
    return missions
      .map((mission, index) => {
        const missionCompleted = completed.includes(mission.id);
        const previousMission =
          index > 0
            ? missions[index - 1]
            : grade === "Octavo"
              ? SEVENTH_MISSIONS[SEVENTH_MISSIONS.length - 1]
              : null;

        const canStartEighth =
  grade !== "Octavo año" ||
  completed.includes(
    SEVENTH_MISSIONS[SEVENTH_MISSIONS.length - 1].id
  );

const available =
  canStartEighth &&
  (
    !previousMission ||
    completed.includes(previousMission.id)
  );
          !previousMission ||
          completed.includes(previousMission.id);

        const locked = !missionCompleted && !available;
        const status = missionCompleted
          ? "Completada"
          : locked
            ? "Bloqueada"
            : "Disponible";

        const icon = missionCompleted
          ? "✅"
          : locked
            ? "🔒"
            : "🧭";

        const classes = [
          "mission-progress-item",
          missionCompleted ? "is-completed" : "",
          locked ? "is-locked" : "",
          available && !missionCompleted ? "is-available" : ""
        ]
          .filter(Boolean)
          .join(" ");

        return `
          <article
            class="${classes}"
            ${locked ? "" : `data-mission-url="${getMissionUrl(mission.id)}"`}
            tabindex="${locked ? "-1" : "0"}"
            aria-label="${escapeHtml(mission.title)}: ${status}"
          >
            <span class="mission-progress-icon" aria-hidden="true">
              ${icon}
            </span>
            <div class="mission-progress-copy">
              <p class="mission-progress-label">
                ${grade} · ${escapeHtml(mission.unit)}
              </p>
              <h3>${escapeHtml(mission.title)}</h3>
              <p>${escapeHtml(mission.description)}</p>
            </div>
            <span class="mission-status ${
              missionCompleted ? "is-completed" : ""
            }">
              ${status}
            </span>
          </article>
        `;
      })
      .join("");
  }

  function setupProgressPage() {
    const xp = document.querySelector("#progress-xp");

    if (!xp) return;

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
      missionList.innerHTML = `
        ${renderMissionGroup(SEVENTH_MISSIONS, "Séptimo año", completed)}
        ${renderMissionGroup(EIGHTH_MISSIONS, "Octavo año", completed)}
      `;

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
      if (state) state.textContent = "Obtenida";
    }

    const streakBadge = document.querySelector("#badge-active-streak");

    if (progress.badges.includes("active-streak") && streakBadge) {
      streakBadge.classList.add("is-earned");
      const state = streakBadge.querySelector(".badge-state");
      if (state) state.textContent = "Obtenida";
    }
  }

  function setupNavigation() {
    const button = document.querySelector("[data-menu-toggle]");
    const navigation = document.querySelector("[data-navigation]");

    if (!button || !navigation) return;

    button.addEventListener("click", () => {
      const isOpen = navigation.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(isOpen));
      document.body.classList.toggle("menu-open", isOpen);
    });
  }

  function setupContrastToggle() {
    const button = document.querySelector("[data-contrast-toggle]");

    if (!button) return;

    const savedMode = localStorage.getItem(CONTRAST_KEY) === "true";

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