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

  const NINTH_MISSIONS = Array.isArray(window.ninthMissions)
    ? window.ninthMissions
    : [];

  const TENTH_MISSIONS = Array.isArray(window.tenthMissions)
    ? window.tenthMissions
    : [];

  const ELEVENTH_MISSIONS = Array.isArray(window.eleventhMissions)
    ? window.eleventhMissions
    : [];

  const MISSION_GROUPS = [
    {
      key: "seventh",
      grade: "Séptimo año",
      yearLabel: "Séptimo",
      missions: SEVENTH_MISSIONS,
      icon: "🌱",
      description:
        "Construí bases sólidas con saludos, rutinas, lugares, compras y comunicación cotidiana.",
      topics: ["Saludos", "Rutinas", "Naturaleza"]
    },
    {
      key: "eighth",
      grade: "Octavo año",
      yearLabel: "Octavo",
      missions: EIGHTH_MISSIONS,
      icon: "🚀",
      description:
        "Fortalecé estructuras frecuentes para hablar de experiencias, gustos y situaciones de la vida diaria.",
      topics: ["Experiencias", "Preferencias", "Reading"]
    },
    {
      key: "ninth",
      grade: "Noveno año",
      yearLabel: "Noveno",
      missions: NINTH_MISSIONS,
      icon: "🧠",
      description:
        "Desarrollá comprensión, argumentación simple y uso más preciso del inglés en distintos contextos.",
      topics: ["Opiniones", "Comprensión", "Contexto"]
    },
    {
      key: "tenth",
      grade: "Décimo año",
      yearLabel: "Décimo",
      missions: TENTH_MISSIONS,
      icon: "🎯",
      description:
        "Practicá comunicación académica y funcional con retos más completos de lectura y análisis.",
      topics: ["Análisis", "Mensajes", "Estrategias"]
    },
    {
      key: "eleventh",
      grade: "Undécimo año",
      yearLabel: "Undécimo",
      missions: ELEVENTH_MISSIONS,
      icon: "🏆",
      description:
        "Consolidá lectura crítica, argumentación y preparación final para comunicarte con confianza.",
      topics: ["Argumentación", "Lectura crítica", "Preparación final"]
    }
  ].filter((group) => group.missions.length > 0);

  const MISSIONS = MISSION_GROUPS.flatMap((group) => group.missions);

  function getDefaultProgress() {
    return {
      xp: 0,
      streak: 0,
      badges: [],
      completedMissions: [],
      completedChallenges: [],
      readingScores: [],
      listeningScores: [],
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
          : [],
        completedChallenges: Array.isArray(parsed.completedChallenges)
          ? parsed.completedChallenges
          : [],
        readingScores: Array.isArray(parsed.readingScores)
          ? parsed.readingScores
          : [],
        listeningScores: Array.isArray(parsed.listeningScores)
          ? parsed.listeningScores
          : []
      };
    } catch {
      return getDefaultProgress();
    }
  }

  function normalizeProgress(progress) {
    const safeProgress = progress ?? {};

    return {
      ...getDefaultProgress(),
      ...safeProgress,
      badges: Array.isArray(safeProgress.badges) ? safeProgress.badges : [],
      completedMissions: Array.isArray(safeProgress.completedMissions)
        ? safeProgress.completedMissions
        : [],
      completedChallenges: Array.isArray(safeProgress.completedChallenges)
        ? safeProgress.completedChallenges
        : [],
      readingScores: Array.isArray(safeProgress.readingScores)
        ? safeProgress.readingScores
        : [],
      listeningScores: Array.isArray(safeProgress.listeningScores)
        ? safeProgress.listeningScores
        : []
    };
  }

  function saveProgress(progress) {
    const normalized = normalizeProgress(progress);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  }

  async function syncProgressToSupabase(progress) {
    const supabaseClient = window.supabaseClient;
    const normalized = normalizeProgress(progress);

    if (!supabaseClient) {
      console.warn(
        "Supabase no está configurado. El progreso se guardó solamente en este navegador."
      );
      return;
    }

    const {
      data: { user },
      error: userError
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      console.warn(
        "No hay una sesión autenticada. El progreso se guardó localmente.",
        userError
      );
      return;
    }

    const payload = {
      user_id: user.id,
      email: user.email ?? "",
      display_name:
        user.user_metadata?.full_name ??
        user.user_metadata?.name ??
        user.user_metadata?.display_name ??
        "",
      completed_levels: normalized.completedMissions,
      completed_challenges: normalized.completedChallenges,
      reading_scores: normalized.readingScores,
      listening_scores: normalized.listeningScores,
      xp: Number(normalized.xp) || 0,
      streak: Number(normalized.streak) || 0,
      badges: normalized.badges,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabaseClient
      .from("student_progress")
      .upsert(payload, { onConflict: "user_id" });

    if (error) {
      console.error("Error al sincronizar con Supabase:", error);
      return;
    }

    console.log("Progreso guardado en Supabase.");
  }

  function escapeHtml(value) {
    const element = document.createElement("div");
    element.textContent = String(value);
    return element.innerHTML;
  }

  function getToday() {
    return new Date().toISOString().slice(0, 10);
  }

  function getProgressUrl() {
    return "progress.html";
  }

  function getMissionUrl(missionId) {
    return `mission.html?mission=${encodeURIComponent(missionId)}`;
  }

  function getMissionById(missionId) {
    return MISSIONS.find((mission) => mission.id === missionId) || null;
  }

  function getNextMission(missionId) {
    const index = MISSIONS.findIndex((mission) => mission.id === missionId);
    return index >= 0 ? MISSIONS[index + 1] || null : null;
  }

  function isMissionLocked(missionId, completedMissions) {
    const index = MISSIONS.findIndex((mission) => mission.id === missionId);

    if (index <= 0) {
      return false;
    }

    return !completedMissions.includes(MISSIONS[index - 1].id);
  }

  function calculateProgress(progress) {
    if (!MISSIONS.length) {
      return 0;
    }

    const validCompleted = progress.completedMissions.filter((id) =>
      MISSIONS.some((mission) => mission.id === id)
    );

    return Math.round((validCompleted.length / MISSIONS.length) * 100);
  }

  function updateStreak(progress) {
    const today = getToday();

    if (progress.lastStudyDate === today) {
      return false;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const yesterdayText = yesterday.toISOString().slice(0, 10);

    progress.streak =
      progress.lastStudyDate === yesterdayText
        ? progress.streak + 1
        : 1;

    progress.lastStudyDate = today;

    if (
      progress.streak >= 3 &&
      !progress.badges.includes("active-streak")
    ) {
      progress.badges.push("active-streak");
    }

    return true;
  }

  function updateBasicProgressWidgets() {
    const progress = getProgress();
    const percentage = calculateProgress(progress);

    const xpTotal = document.querySelector("#xp-total");
    const streakTotal = document.querySelector("#streak-total");
    const badgesTotal = document.querySelector("#badges-total");
    const progressPercentage = document.querySelector("#progress-percentage");
    const rankBadge = document.querySelector("#rank-badge");

    if (xpTotal) xpTotal.textContent = progress.xp;
    if (streakTotal) streakTotal.textContent = progress.streak;
    if (badgesTotal) badgesTotal.textContent = progress.badges.length;
    if (progressPercentage) progressPercentage.textContent = `${percentage}%`;

    if (rankBadge) {
      let rank = "Explorer";

      if (progress.xp >= 10000) rank = "Master";
      else if (progress.xp >= 5000) rank = "Pathfinder";
      else if (progress.xp >= 1800) rank = "Adventurer";

      rankBadge.textContent = rank;
    }
  }

  function setupHomeLevels() {
    const levelsContainer = document.querySelector("#levels-container");
    const levelsError = document.querySelector("#levels-error");

    if (!levelsContainer) {
      return;
    }

    if (!MISSION_GROUPS.length) {
      levelsContainer.innerHTML = "";

      if (levelsError) {
        levelsError.hidden = false;
      }

      return;
    }

    if (levelsError) {
      levelsError.hidden = true;
    }

    levelsContainer.innerHTML = MISSION_GROUPS.map((group) => {
      const firstMission = group.missions[0];
      const topics = Array.isArray(group.topics) ? group.topics : [];
      const missionCount = group.missions.length;

      return `
        <article class="level-card reveal-card">
          <div class="level-card-top">
            <span class="level-icon" aria-hidden="true">${group.icon}</span>
            <span class="level-tag">${missionCount} misiones</span>
          </div>

          <p class="level-year">${escapeHtml(group.grade)}</p>
          <h3>${escapeHtml(group.yearLabel)}</h3>
          <p>${escapeHtml(group.description)}</p>

          <ul class="topic-list" aria-label="Temas principales de ${escapeHtml(group.grade)}">
            ${topics
              .map((topic) => `<li>${escapeHtml(topic)}</li>`)
              .join("")}
          </ul>

          <a class="text-link" href="pages/${getMissionUrl(firstMission.id)}">
            Empezar ruta
            <span aria-hidden="true">→</span>
          </a>
        </article>
      `;
    }).join("");
  }

  function setupProgressPage() {
    const xpElement = document.querySelector("#progress-xp");

    if (!xpElement) {
      return;
    }

    const progress = getProgress();
    const completed = progress.completedMissions;
    const percentage = calculateProgress(progress);

    xpElement.textContent = progress.xp;

    const streakElement = document.querySelector("#progress-streak");
    const badgesElement = document.querySelector("#progress-badges");
    const percentageElement = document.querySelector(
      "#progress-percentage-page"
    );

    if (streakElement) streakElement.textContent = progress.streak;
    if (badgesElement) badgesElement.textContent = progress.badges.length;

    if (percentageElement) {
      percentageElement.textContent = `${percentage}%`;
    }

    const missionList = document.querySelector(".mission-progress-list");

    if (missionList) {
      if (!MISSIONS.length) {
        missionList.innerHTML = `
          <p class="loading-message">
            No se pudieron cargar tus misiones.
          </p>
        `;
      } else {
        missionList.innerHTML = MISSION_GROUPS.map((group) => {
          return group.missions
            .map((mission) => {
              const missionCompleted = completed.includes(mission.id);

              const missionIndex = MISSIONS.findIndex(
                (item) => item.id === mission.id
              );

              const previousMission =
                missionIndex > 0 ? MISSIONS[missionIndex - 1] : null;

              const available =
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

              const urlAttribute = locked
                ? ""
                : `data-mission-url="${getMissionUrl(mission.id)}"`;

              const tabIndex = locked ? "-1" : "0";

              return `
                <article
                  class="${classes}"
                  ${urlAttribute}
                  tabindex="${tabIndex}"
                  aria-label="${escapeHtml(mission.title)}: ${status}"
                >
                  <span class="mission-progress-icon" aria-hidden="true">
                    ${icon}
                  </span>

                  <div class="mission-progress-copy">
                    <p class="mission-progress-label">
                      ${group.grade} · ${escapeHtml(mission.unit)}
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
        }).join("");

        missionList
          .querySelectorAll("[data-mission-url]")
          .forEach((card) => {
            function openMission() {
              window.location.href = card.dataset.missionUrl;
            }

            card.addEventListener("click", openMission);

            card.addEventListener("keydown", (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openMission();
              }
            });
          });
      }
    }

    const continueLink = document.querySelector(
      "#continue-learning-link"
    );

    if (continueLink && MISSIONS.length > 0) {
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

    if (firstStepBadge && progress.badges.includes("first-step")) {
      firstStepBadge.classList.add("is-earned");

      const state = firstStepBadge.querySelector(".badge-state");

      if (state) {
        state.textContent = "Obtenida";
      }
    }

    const streakBadge = document.querySelector("#badge-active-streak");

    if (streakBadge && progress.badges.includes("active-streak")) {
      streakBadge.classList.add("is-earned");

      const state = streakBadge.querySelector(".badge-state");

      if (state) {
        state.textContent = "Obtenida";
      }
    }
  }

  function setupMissionPage() {
    const form = document.querySelector("#mission-quiz");

    if (!form) {
      return;
    }

    const result = document.querySelector("#quiz-result");

    if (!MISSIONS.length) {
      if (result) {
        result.textContent =
          "No se cargaron las misiones. Revisá los archivos dentro de data/.";
        result.className = "quiz-result is-warning";
      }

      return;
    }

    const parameters = new URLSearchParams(window.location.search);
    const missionId = parameters.get("mission") || MISSIONS[0].id;
    const mission = getMissionById(missionId) || MISSIONS[0];
    const progress = getProgress();

    if (isMissionLocked(mission.id, progress.completedMissions)) {
      window.location.href = getProgressUrl();
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

    const requiredElements = [
      title,
      description,
      vocabularyTitle,
      vocabularyIntro,
      vocabularyGrid,
      tipText,
      languageTitle,
      languageIntro,
      exampleBox,
      languageExtra,
      speakingTip,
      dialogue,
      readingNote,
      questionsContainer,
      result
    ];

    if (requiredElements.some((element) => !element)) {
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
      .map(
        (example) => `
          <p><strong>${escapeHtml(example)}</strong></p>
        `
      )
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

    const questions = mission.questions.map(
      ([question, answers, correctIndex]) => ({
        question,
        answers,
        correctIndex
      })
    );

    questionsContainer.innerHTML = questions
      .map(
        (question, questionIndex) => `
          <fieldset>
            <legend>
              ${questionIndex + 1}. ${escapeHtml(question.question)}
            </legend>

            ${question.answers
              .map(
                (answer, answerIndex) => `
                  <label class="answer-option">
                    <input
                      type="radio"
                      name="question-${questionIndex}"
                      value="${answerIndex}"
                    >
                    <span>${escapeHtml(answer)}</span>
                  </label>
                `
              )
              .join("")}

            <p
              class="question-feedback"
              data-feedback="question-${questionIndex}"
            ></p>
          </fieldset>
        `
      )
      .join("");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      let score = 0;
      let missingAnswers = 0;

      form.querySelectorAll(".question-feedback").forEach((feedback) => {
        feedback.textContent = "";
        feedback.className = "question-feedback";
      });

      questions.forEach((question, questionIndex) => {
        const selected = form.querySelector(
          `input[name="question-${questionIndex}"]:checked`
        );

        const feedback = form.querySelector(
          `[data-feedback="question-${questionIndex}"]`
        );

        if (!selected) {
          missingAnswers += 1;
          feedback.textContent = "Elegí una respuesta antes de revisar.";
          feedback.classList.add("is-missing");
          return;
        }

        if (Number(selected.value) === question.correctIndex) {
          score += 1;
          feedback.textContent = "¡Correcto! Muy bien.";
          feedback.classList.add("is-correct");
        } else {
          feedback.textContent =
            `La respuesta correcta es: ${
              question.answers[question.correctIndex]
            }.`;
          feedback.classList.add("is-incorrect");
        }
      });

      result.className = "quiz-result";

      if (missingAnswers > 0) {
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
          Necesitás las 3 respuestas correctas para completar la misión.
        `;
        result.classList.add("is-warning");
        result.focus();
        return;
      }

      const updatedProgress = normalizeProgress(getProgress());
      const alreadyCompleted =
        updatedProgress.completedMissions.includes(mission.id);

      const streakChanged = updateStreak(updatedProgress);

      if (!alreadyCompleted) {
        updatedProgress.xp += 100;
        updatedProgress.completedMissions.push(mission.id);

        if (!updatedProgress.badges.includes("first-step")) {
          updatedProgress.badges.push("first-step");
        }
      }

      if (!alreadyCompleted || streakChanged) {
        saveProgress(updatedProgress);
        await syncProgressToSupabase(updatedProgress);
      }

      const nextMission = getNextMission(mission.id);

      const nextUrl = nextMission
        ? getMissionUrl(nextMission.id)
        : getProgressUrl();

      const nextLabel = nextMission
        ? "Ir a la siguiente misión →"
        : "Ver mi progreso →";

      result.innerHTML = alreadyCompleted
        ? `
          <strong>¡Misión revisada!</strong>
          Obtuviste ${score} de ${questions.length} respuestas correctas.
          Ya habías recibido los XP de esta misión.
          <br><br>
          <a href="${nextUrl}">${nextLabel}</a>
        `
        : `
          <strong>¡Misión completada!</strong>
          Obtuviste ${score} de ${questions.length} respuestas correctas y
          ganaste <strong>100 XP</strong>.
          <br><br>
          <a href="${nextUrl}">${nextLabel}</a>
        `;

      result.classList.add("is-success");
      result.focus();
    });
  }

  function setupDailyChallenge() {
    const form = document.querySelector("#daily-challenge-form");
    const result = document.querySelector("#challenge-result");

    if (!form || !result) {
      return;
    }

    const correctAnswers = {
      "daily-question-1": "a",
      "daily-question-2": "b",
      "daily-question-3": "b"
    };

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      let score = 0;

      Object.entries(correctAnswers).forEach(([name, answer]) => {
        const selected = form.querySelector(
          `input[name="${name}"]:checked`
        );

        if (selected && selected.value === answer) {
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

      const progress = normalizeProgress(getProgress());
      const alreadyCompletedToday =
        progress.lastChallengeDate === getToday();

      const streakChanged = updateStreak(progress);

      if (!alreadyCompletedToday) {
        progress.xp += 30;
        progress.lastChallengeDate = getToday();

        if (!progress.completedChallenges.includes(getToday())) {
          progress.completedChallenges.push(getToday());
        }
      }

      if (!alreadyCompletedToday || streakChanged) {
        saveProgress(progress);
        await syncProgressToSupabase(progress);
      }

      result.innerHTML = alreadyCompletedToday
        ? `
          <strong>¡Reto revisado!</strong>
          Ya recibiste los XP de este reto hoy.
        `
        : `
          <strong>¡Reto completado!</strong>
          Ganaste <strong>30 XP</strong>.
          <br><br>
          <a href="${getProgressUrl()}">Ver mi progreso →</a>
        `;

      result.classList.add("is-success");
      result.focus();
    });
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
  updateBasicProgressWidgets();
  setupHomeLevels();
  setupProgressPage();
  setupMissionPage();
  setupDailyChallenge();
});