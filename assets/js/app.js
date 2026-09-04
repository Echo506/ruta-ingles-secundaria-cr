"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "englishQuestCRProgress";
  const CONTRAST_KEY = "englishQuestCRHighContrast";

  const levels = [
    {
      id: "seventh",
      year: "Séptimo año",
      level: "Pre-A1 a A1",
      title: "Foundations",
      icon: "🌱",
      description:
        "Construí bases para presentarte, hablar de tu familia y comunicarte en situaciones cotidianas.",
      topics: ["Saludos", "Información personal", "Familia", "Rutinas"],
      mission: "seventh-mission-1",
      status: "Disponible"
    },
    {
      id: "eighth",
      year: "Octavo año",
      level: "A1",
      title: "Everyday English",
      icon: "🧭",
      description:
        "Practicá inglés para hablar de comida, ropa, lugares, clima y actividades de todos los días.",
      topics: ["Comida", "Clima", "Ropa", "Direcciones"],
      mission: "eighth-mission-1",
      status: "Próximamente"
    },
    {
      id: "ninth",
      year: "Noveno año",
      level: "A1 a A2",
      title: "Real-Life Communication",
      icon: "💬",
      description:
        "Usá el inglés para viajes, salud, tecnología y planes personales.",
      topics: ["Viajes", "Salud", "Tecnología", "Planes"],
      mission: "ninth-mission-1",
      status: "Próximamente"
    },
    {
      id: "tenth",
      year: "Décimo año",
      level: "A2",
      title: "Academic Growth",
      icon: "📘",
      description:
        "Comprendé textos funcionales, expresá opiniones y desarrollá pensamiento crítico.",
      topics: ["Ambiente", "Educación", "Opiniones", "Sociedad"],
      mission: "tenth-mission-1",
      status: "Próximamente"
    },
    {
      id: "eleventh",
      year: "Undécimo año",
      level: "A2 a B1",
      title: "Exam Challenge",
      icon: "🏁",
      description:
        "Fortalecé estrategias de Reading y Listening con retos de comprensión más avanzados.",
      topics: ["Idea principal", "Detalles", "Inferencias", "Listening"],
      mission: "eleventh-mission-1",
      status: "Próximamente"
    }
  ];

  function isInsidePagesFolder() {
    return window.location.pathname.includes("/pages/");
  }

  function getPagePrefix() {
    return isInsidePagesFolder() ? "" : "pages/";
  }

  function getMissionUrl(missionId) {
    return `${getPagePrefix()}mission.html?mission=${encodeURIComponent(missionId)}`;
  }

  function getProgressUrl() {
    return `${getPagePrefix()}progress.html`;
  }

  function getDefaultProgress() {
    return {
      xp: 0,
      streak: 0,
      badges: [],
      completedMissions: [],
      lastStudyDate: null
    };
  }

  function getProgress() {
    try {
      const savedProgress = localStorage.getItem(STORAGE_KEY);

      if (!savedProgress) {
        return getDefaultProgress();
      }

      const parsedProgress = JSON.parse(savedProgress);

      return {
        ...getDefaultProgress(),
        ...parsedProgress,
        badges: Array.isArray(parsedProgress.badges) ? parsedProgress.badges : [],
        completedMissions: Array.isArray(parsedProgress.completedMissions)
          ? parsedProgress.completedMissions
          : []
      };
    } catch (error) {
      return getDefaultProgress();
    }
  }

  function saveProgress(progress) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }

  function escapeHTML(value) {
    const element = document.createElement("div");
    element.textContent = String(value);
    return element.innerHTML;
  }

  function calculateProgressPercentage(progress) {
    const totalMissions = 25;

    if (!progress.completedMissions.length) {
      return 0;
    }

    return Math.min(
      100,
      Math.round((progress.completedMissions.length / totalMissions) * 100)
    );
  }

  function getRank(progress) {
    if (progress.xp >= 1000) {
      return "Master";
    }

    if (progress.xp >= 500) {
      return "Pathfinder";
    }

    if (progress.xp >= 150) {
      return "Adventurer";
    }

    return "Explorer";
  }

  function updateProgressInterface() {
    const progress = getProgress();
    const percentage = calculateProgressPercentage(progress);

    const xpTotal = document.querySelector("#xp-total");
    const streakTotal = document.querySelector("#streak-total");
    const badgesTotal = document.querySelector("#badges-total");
    const progressPercentage = document.querySelector("#progress-percentage");
    const rankBadge = document.querySelector("#rank-badge");
    const progressRing = document.querySelector("[data-progress-ring]");

    if (xpTotal) {
      xpTotal.textContent = progress.xp;
    }

    if (streakTotal) {
      streakTotal.textContent = progress.streak;
    }

    if (badgesTotal) {
      badgesTotal.textContent = progress.badges.length;
    }

    if (progressPercentage) {
      progressPercentage.textContent = `${percentage}%`;
    }

    if (rankBadge) {
      rankBadge.textContent = getRank(progress);
    }

    if (progressRing) {
      progressRing.style.background = `
        radial-gradient(closest-side, var(--surface-elevated) 78%, transparent 79% 100%),
        conic-gradient(var(--mint) ${percentage * 3.6}deg, rgba(255, 255, 255, 0.12) 0deg)
      `;

      progressRing.setAttribute("aria-valuenow", String(percentage));
    }
  }

  function renderLevels() {
    const levelsContainer = document.querySelector("#levels-container");
    const levelsError = document.querySelector("#levels-error");

    if (!levelsContainer) {
      return;
    }

    try {
      const progress = getProgress();

      levelsContainer.innerHTML = levels
        .map((level, index) => {
          const isFirstLevel = index === 0;
          const isCompleted = progress.completedMissions.includes(level.mission);
          const cardStatus = isFirstLevel
            ? isCompleted
              ? "Completada"
              : "Disponible"
            : "Próximamente";

          const actionMarkup = isFirstLevel
            ? `
              <a class="text-link" href="${getMissionUrl(level.mission)}">
                ${isCompleted ? "Repetir misión" : "Explorar ruta"}
                <span aria-hidden="true">→</span>
              </a>
            `
            : `
              <span class="text-link" aria-label="Ruta disponible próximamente">
                Próximamente
                <span aria-hidden="true">🔒</span>
              </span>
            `;

          return `
            <article class="level-card reveal-card">
              <div class="level-card-top">
                <span class="level-icon" aria-hidden="true">${level.icon}</span>
                <span class="level-tag">${escapeHTML(cardStatus)}</span>
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

              ${actionMarkup}
            </article>
          `;
        })
        .join("");

      if (levelsError) {
        levelsError.hidden = true;
      }
    } catch (error) {
      levelsContainer.innerHTML = "";

      if (levelsError) {
        levelsError.hidden = false;
      }
    }
  }

  function setupNavigation() {
    const menuButton = document.querySelector("[data-menu-toggle]");
    const navigation = document.querySelector("[data-navigation]");

    if (!menuButton || !navigation) {
      return;
    }

    function closeNavigation() {
      navigation.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Abrir menú de navegación");
      document.body.classList.remove("menu-open");
    }

    menuButton.addEventListener("click", () => {
      const isOpen = navigation.classList.toggle("is-open");

      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.setAttribute(
        "aria-label",
        isOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"
      );

      document.body.classList.toggle("menu-open", isOpen);
    });

    navigation.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeNavigation);
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth >= 920) {
        closeNavigation();
      }
    });
  }

  function setupContrastToggle() {
    const contrastButton = document.querySelector("[data-contrast-toggle]");

    if (!contrastButton) {
      return;
    }

    function setContrastMode(isEnabled) {
      document.body.classList.toggle("high-contrast", isEnabled);
      contrastButton.setAttribute("aria-pressed", String(isEnabled));
      contrastButton.setAttribute(
        "aria-label",
        isEnabled
          ? "Desactivar modo de alto contraste"
          : "Activar modo de alto contraste"
      );
    }

    const savedContrastMode = localStorage.getItem(CONTRAST_KEY) === "true";
    setContrastMode(savedContrastMode);

    contrastButton.addEventListener("click", () => {
      const nextMode = !document.body.classList.contains("high-contrast");

      setContrastMode(nextMode);
      localStorage.setItem(CONTRAST_KEY, String(nextMode));
    });
  }

  function setupCurrentYear() {
    const yearElements = document.querySelectorAll("#current-year");

    yearElements.forEach((element) => {
      element.textContent = new Date().getFullYear();
    });
  }

  function setupMotivationalMessage() {
    const messageElement = document.querySelector("#motivational-message");

    if (!messageElement) {
      return;
    }

    const messages = [
      "El inglés se aprende paso a paso. Hoy podés dar uno.",
      "Una práctica breve hoy puede abrir una conversación mañana.",
      "Cada respuesta te acerca a comunicarte con más confianza.",
      "Tu ritmo es válido: seguí avanzando, misión por misión."
    ];

    const dayIndex = new Date().getDate() % messages.length;
    messageElement.textContent = messages[dayIndex];
  }

  setupNavigation();
  setupContrastToggle();
  setupCurrentYear();
  setupMotivationalMessage();
  renderLevels();
  updateProgressInterface();

  window.EnglishQuestCR = {
    getProgress,
    saveProgress,
    updateProgressInterface,
    getMissionUrl,
    getProgressUrl
  };
});