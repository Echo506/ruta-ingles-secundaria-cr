"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "englishQuestCRProgress";
  const CONTRAST_KEY = "englishQuestCRHighContrast";
  const TOTAL_MISSIONS = 25;

  const levels = [
    {
      year: "Séptimo año",
      level: "Pre-A1 a A1",
      title: "Foundations",
      icon: "🌱",
      description:
        "Construí bases para presentarte, hablar de tu familia y comunicarte en situaciones cotidianas.",
      topics: ["Saludos", "Información personal", "Familia", "Rutinas"],
      mission: "seventh-mission-1"
    },
    {
      year: "Octavo año",
      level: "A1",
      title: "Everyday English",
      icon: "🧭",
      description:
        "Practicá inglés para hablar de comida, ropa, lugares, clima y actividades de todos los días.",
      topics: ["Comida", "Clima", "Ropa", "Direcciones"],
      mission: "eighth-mission-1"
    },
    {
      year: "Noveno año",
      level: "A1 a A2",
      title: "Real-Life Communication",
      icon: "💬",
      description:
        "Usá el inglés para viajes, salud, tecnología y planes personales.",
      topics: ["Viajes", "Salud", "Tecnología", "Planes"],
      mission: "ninth-mission-1"
    },
    {
      year: "Décimo año",
      level: "A2",
      title: "Academic Growth",
      icon: "📘",
      description:
        "Comprendé textos funcionales, expresá opiniones y desarrollá pensamiento crítico.",
      topics: ["Ambiente", "Educación", "Opiniones", "Sociedad"],
      mission: "tenth-mission-1"
    },
    {
      year: "Undécimo año",
      level: "A2 a B1",
      title: "Exam Challenge",
      icon: "🏁",
      description:
        "Fortalecé estrategias de Reading y Listening con retos de comprensión más avanzados.",
      topics: ["Idea principal", "Detalles", "Inferencias", "Listening"],
      mission: "eleventh-mission-1"
    }
  ];

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

      if (!saved) {
        return getDefaultProgress();
      }

      const parsed = JSON.parse(saved);

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

  function getPagePrefix() {
    return window.location.pathname.includes("/pages/") ? "" : "pages/";
  }

  function getMissionUrl(missionId) {
    return `${getPagePrefix()}mission.html?mission=${encodeURIComponent(missionId)}`;
  }

  function getProgressUrl() {
    return `${getPagePrefix()}progress.html`;
  }

  function escapeHTML(value) {
    const element = document.createElement("div");
    element.textContent = String(value);
    return element.innerHTML;
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

    if (progress.lastStudyDate === yesterday.toISOString().slice(0, 10)) {
      progress.streak += 1;
    } else {
      progress.streak = 1;
    }

    progress.lastStudyDate = today;
  }

  function calculateProgress(progress) {
    return Math.min(
      100,
      Math.round((progress.completedMissions.length / TOTAL_MISSIONS) * 100)
    );
  }

  function getRank(progress) {
    if (progress.xp >= 1000) return "Master";
    if (progress.xp >= 500) return "Pathfinder";
    if (progress.xp >= 150) return "Adventurer";
    return "Explorer";
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
        radial-gradient(closest-side, var(--surface-elevated) 78%, transparent 79% 100%),
        conic-gradient(var(--mint) ${percentage * 3.6}deg, rgba(255, 255, 255, 0.12) 0deg)
      `;
      ring.setAttribute("aria-valuenow", String(percentage));
    }
  }

  function renderLevels() {
    const container = document.querySelector("#levels-container");
    const errorMessage = document.querySelector("#levels-error");

    if (!container) {
      return;
    }

    try {
      const progress = getProgress();

      container.innerHTML = levels
        .map((level, index) => {
          const available = index === 0;
          const completed = progress.completedMissions.includes(level.mission);

          const status = available
            ? completed
              ? "Completada"
              : "Disponible"
            : "Próximamente";

          const action = available
            ? `
              <a class="text-link" href="${getMissionUrl(level.mission)}">
                ${completed ? "Repetir misión" : "Explorar ruta"}
                <span aria-hidden="true">→</span>
              </a>
            `
            : `
              <span class="text-link">
                Próximamente
                <span aria-hidden="true">🔒</span>
              </span>
            `;

          return `
            <article class="level-card reveal-card">
              <div class="level-card-top">
                <span class="level-icon" aria-hidden="true">${level.icon}</span>
                <span class="level-tag">${escapeHTML(status)}</span>
              </div>

              <h3>${escapeHTML(level.title)}</h3>

              <p class="level-year">
                ${escapeHTML(level.year)} · ${escapeHTML(level.level)}
              </p>

              <p>${escapeHTML(level.description)}</p>

              <ul class="topic-list" aria-label="Temas de ${escapeHTML(level.year)}">
                ${level.topics
                  .map((topic) => `<li>${escapeHTML(topic)}</li>`)
                  .join("")}
              </ul>

              ${action}
            </article>
          `;
        })
        .join("");

      if (errorMessage) {
        errorMessage.hidden = true;
      }
    } catch (error) {
      container.innerHTML = "";

      if (errorMessage) {
        errorMessage.hidden = false;
      }
    }
  }

  function clearQuestionFeedback(form) {
    form.querySelectorAll(".question-feedback").forEach((feedback) => {
      feedback.textContent = "";
      feedback.classList.remove("is-correct", "is-incorrect", "is-missing");
    });
  }

  function showFeedback(form, questionName, text, type) {
    const feedback = form.querySelector(
      `[data-feedback="${questionName}"]`
    );

    if (!feedback) {
      return;
    }

    feedback.textContent = text;
    feedback.classList.remove("is-correct", "is-incorrect", "is-missing");
    feedback.classList.add(type);
  }

  function setupMissionQuiz() {
    const form = document.querySelector("#mission-quiz");
    const result = document.querySelector("#quiz-result");

    if (!form || !result) {
      return;
    }

    const correctAnswers = {
      "question-1": "b",
      "question-2": "a",
      "question-3": "a",
      "question-4": "b"
    };

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      clearQuestionFeedback(form);

      let score = 0;
      let missing = 0;

      Object.entries(correctAnswers).forEach(([questionName, correctAnswer]) => {
        const selected = form.querySelector(
          `input[name="${questionName}"]:checked`
        );

        if (!selected) {
          missing += 1;
          showFeedback(
            form,
            questionName,
            "Elegí una respuesta antes de revisar.",
            "is-missing"
          );
          return;
        }

        if (selected.value === correctAnswer) {
          score += 1;
          showFeedback(form, questionName, "¡Correcto!", "is-correct");
        } else {
          showFeedback(form, questionName, "Revisá la lección e intentá de nuevo.", "is-incorrect");
        }
      });

      result.classList.remove("is-success", "is-warning");

      if (missing > 0) {
        result.textContent = "Respondé todas las preguntas antes de revisar.";
        result.classList.add("is-warning");
        result.focus();
        return;
      }

      if (score >= 3) {
        const progress = getProgress();
        const missionId = "seventh-mission-1";
        const alreadyCompleted = progress.completedMissions.includes(missionId);

        updateStreak(progress);

        if (!alreadyCompleted) {
          progress.xp += 100;
          progress.completedMissions.push(missionId);

          if (!progress.badges.includes("first-step")) {
            progress.badges.push("first-step");
          }

          saveProgress(progress);
        }

        result.innerHTML = alreadyCompleted
          ? `<strong>¡Misión revisada!</strong> Obtuviste ${score} de 4 respuestas correctas. Ya habías recibido los XP de esta misión. <br><br><a href="${getProgressUrl()}">Ver mi progreso →</a>`
          : `<strong>¡Misión completada!</strong> Obtuviste ${score} de 4 respuestas correctas. Ganaste <strong>100 XP</strong> y desbloqueaste la insignia <strong>Primer paso</strong>. <br><br><a href="${getProgressUrl()}">Ver mi progreso →</a>`;

        result.classList.add("is-success");
        updateProgressInterface();
        renderLevels();
      } else {
        result.innerHTML = `<strong>Vas por buen camino.</strong> Obtuviste ${score} de 4 respuestas correctas. Necesitás al menos 3 para completar la misión.`;
        result.classList.add("is-warning");
      }

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

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      clearQuestionFeedback(form);

      let score = 0;
      let missing = 0;

      Object.entries(correctAnswers).forEach(([questionName, correctAnswer]) => {
        const selected = form.querySelector(
          `input[name="${questionName}"]:checked`
        );

        if (!selected) {
          missing += 1;
          showFeedback(
            form,
            questionName,
            "Elegí una respuesta antes de revisar.",
            "is-missing"
          );
          return;
        }

        if (selected.value === correctAnswer) {
          score += 1;
          showFeedback(form, questionName, "¡Correcto!", "is-correct");
        } else {
          showFeedback(form, questionName, "Incorrecto. Revisá e intentá de nuevo.", "is-incorrect");
        }
      });

      result.classList.remove("is-success", "is-warning");

      if (missing > 0) {
        result.textContent = "Respondé las tres preguntas antes de revisar el reto.";
        result.classList.add("is-warning");
        result.focus();
        return;
      }

      if (score >= 2) {
        const progress = getProgress();
        const today = getToday();
        const alreadyCompletedToday = progress.lastChallengeDate === today;

        updateStreak(progress);

        if (!alreadyCompletedToday) {
          progress.xp += 30;
          progress.lastChallengeDate = today;
          saveProgress(progress);
        }

        result.innerHTML = alreadyCompletedToday
          ? `<strong>¡Reto revisado!</strong> Obtuviste ${score} de 3 respuestas correctas. Ya recibiste los XP de este reto hoy.`
          : `<strong>¡Reto completado!</strong> Obtuviste ${score} de 3 respuestas correctas y ganaste <strong>30 XP</strong>. <br><br><a href="${getProgressUrl()}">Ver mi progreso →</a>`;

        result.classList.add("is-success");
        updateProgressInterface();
      } else {
        result.innerHTML = `<strong>Seguí intentando.</strong> Obtuviste ${score} de 3 respuestas correctas. Necesitás al menos 2 para completar el reto.`;
        result.classList.add("is-warning");
      }

      result.focus();
    });
  }

  function setupNavigation() {
    const menuButton = document.querySelector("[data-menu-toggle]");
    const navigation = document.querySelector("[data-navigation]");

    if (!menuButton || !navigation) {
      return;
    }

    function closeMenu() {
      navigation.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Abrir menú de navegación");
      document.body.classList.remove("menu-open");
    }

    menuButton.addEventListener("click", () => {
      const menuIsOpen = navigation.classList.toggle("is-open");

      menuButton.setAttribute("aria-expanded", String(menuIsOpen));
      menuButton.setAttribute(
        "aria-label",
        menuIsOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"
      );

      document.body.classList.toggle("menu-open", menuIsOpen);
    });

    navigation.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth >= 920) {
        closeMenu();
      }
    });
  }

  function setupContrastToggle() {
    const button = document.querySelector("[data-contrast-toggle]");

    if (!button) {
      return;
    }

    function setContrast(enabled) {
      document.body.classList.toggle("high-contrast", enabled);
      button.setAttribute("aria-pressed", String(enabled));
      button.setAttribute(
        "aria-label",
        enabled
          ? "Desactivar modo de alto contraste"
          : "Activar modo de alto contraste"
      );
    }

    const savedContrast = localStorage.getItem(CONTRAST_KEY) === "true";
    setContrast(savedContrast);

    button.addEventListener("click", () => {
      const enabled = !document.body.classList.contains("high-contrast");
      setContrast(enabled);
      localStorage.setItem(CONTRAST_KEY, String(enabled));
    });
  }

  function setupCurrentYear() {
    document.querySelectorAll("#current-year").forEach((element) => {
      element.textContent = new Date().getFullYear();
    });
  }

  function setupMotivationalMessage() {
    const element = document.querySelector("#motivational-message");

    if (!element) {
      return;
    }

    const messages = [
      "El inglés se aprende paso a paso. Hoy podés dar uno.",
      "Una práctica breve hoy puede abrir una conversación mañana.",
      "Cada respuesta te acerca a comunicarte con más confianza.",
      "Tu ritmo es válido: seguí avanzando, misión por misión."
    ];

    element.textContent = messages[new Date().getDate() % messages.length];
  }

  setupNavigation();
  setupContrastToggle();
  setupCurrentYear();
  setupMotivationalMessage();
  renderLevels();
  updateProgressInterface();
  setupMissionQuiz();
  setupDailyChallenge();
});