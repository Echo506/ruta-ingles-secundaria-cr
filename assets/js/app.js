document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const navigation = document.querySelector("[data-navigation]");
  const contrastToggle = document.querySelector("[data-contrast-toggle]");
  const yearElement = document.getElementById("current-year");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  if (menuToggle && navigation) {
    menuToggle.addEventListener("click", () => {
      const isOpen = navigation.classList.toggle("is-open");

      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"
      );

      document.body.classList.toggle("menu-open", isOpen);
    });

    navigation.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navigation.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Abrir menú de navegación");
        document.body.classList.remove("menu-open");
      });
    });
  }

  const storedContrast = localStorage.getItem("englishQuestHighContrast");

  if (storedContrast === "true") {
    document.body.classList.add("high-contrast");

    if (contrastToggle) {
      contrastToggle.setAttribute("aria-pressed", "true");
    }
  }

  if (contrastToggle) {
    contrastToggle.addEventListener("click", () => {
      const enabled = document.body.classList.toggle("high-contrast");

      contrastToggle.setAttribute("aria-pressed", String(enabled));
      localStorage.setItem("englishQuestHighContrast", String(enabled));
    });
  }

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const revealCards = document.querySelectorAll(".reveal-card");

  if (!reduceMotion && "IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15
      }
    );

    revealCards.forEach((card, index) => {
      card.style.transitionDelay = `${Math.min(index * 75, 300)}ms`;
      revealObserver.observe(card);
    });
  } else {
    revealCards.forEach((card) => card.classList.add("is-visible"));
  }

  const levelContainer = document.getElementById("levels-container");
  const levelsError = document.getElementById("levels-error");

  const levels = [
    {
      icon: "🌱",
      level: "PRE-A1 - A1",
      title: "Foundations",
      year: "Séptimo año",
      description: "Construí bases sólidas para presentarte y comunicarte en situaciones cotidianas.",
      topics: ["Saludos", "Familia", "Información personal"]
    },
    {
      icon: "🧭",
      level: "A1",
      title: "Everyday English",
      year: "Octavo año",
      description: "Usá inglés para hablar de lugares, comida, clima, ropa y actividades diarias.",
      topics: ["Comida", "Clima", "Direcciones"]
    },
    {
      icon: "💬",
      level: "A1 - A2",
      title: "Real-Life Communication",
      year: "Noveno año",
      description: "Practicá inglés aplicado a viajes, tecnología, salud y planes personales.",
      topics: ["Viajes", "Salud", "Tecnología"]
    },
    {
      icon: "📘",
      level: "A2",
      title: "Academic Growth",
      year: "Décimo año",
      description: "Comprendé textos funcionales, expresá opiniones y desarrollá pensamiento crítico.",
      topics: ["Ambiente", "Educación", "Opiniones"]
    },
    {
      icon: "🏁",
      level: "A2 - B1",
      title: "Exam Challenge",
      year: "Undécimo año",
      description: "Fortalecé estrategias de Reading y Listening con ejercicios tipo examen.",
      topics: ["Idea principal", "Detalles", "Inferencias"]
    }
  ];

  if (levelContainer) {
    try {
      levelContainer.innerHTML = levels
        .map(
          (level) => `
            <article class="level-card">
              <div class="level-card-top">
                <span class="level-icon" aria-hidden="true">${level.icon}</span>
                <span class="level-tag">${level.level}</span>
              </div>

              <h3>${level.title}</h3>
              <p class="level-year">${level.year}</p>
              <p>${level.description}</p>

              <ul class="topic-list" aria-label="Temas de ${level.title}">
                ${level.topics.map((topic) => `<li>${topic}</li>`).join("")}
              </ul>

              <a class="text-link" href="pages/levels.html">
                Explorar ruta
                <span aria-hidden="true">→</span>
              </a>
            </article>
          `
        )
        .join("");
    } catch (error) {
      levelContainer.innerHTML = "";

      if (levelsError) {
        levelsError.hidden = false;
      }
    }
  }

  const progressRing = document.querySelector("[data-progress-ring]");
  const percentageElement = document.getElementById("progress-percentage");
  const xpElement = document.getElementById("xp-total");
  const streakElement = document.getElementById("streak-total");
  const badgesElement = document.getElementById("badges-total");
  const rankBadge = document.getElementById("rank-badge");

  const progress = {
    percent: Number(localStorage.getItem("eqProgressPercent") || 0),
    xp: Number(localStorage.getItem("eqXpTotal") || 0),
    streak: Number(localStorage.getItem("eqStreakTotal") || 0),
    badges: Number(localStorage.getItem("eqBadgesTotal") || 0)
  };

  if (progressRing) {
    const safePercent = Math.max(0, Math.min(100, progress.percent));
    const degrees = safePercent * 3.6;

    progressRing.style.background = `
      radial-gradient(closest-side, var(--surface-elevated) 78%, transparent 79% 100%),
      conic-gradient(var(--mint) ${degrees}deg, rgba(255, 255, 255, 0.12) 0deg)
    `;

    progressRing.setAttribute("aria-valuenow", String(safePercent));
  }

  if (percentageElement) {
    percentageElement.textContent = `${progress.percent}%`;
  }

  if (xpElement) {
    xpElement.textContent = progress.xp;
  }

  if (streakElement) {
    streakElement.textContent = progress.streak;
  }

  if (badgesElement) {
    badgesElement.textContent = progress.badges;
  }

  if (rankBadge) {
    if (progress.xp >= 1000) {
      rankBadge.textContent = "Master";
    } else if (progress.xp >= 500) {
      rankBadge.textContent = "Navigator";
    } else if (progress.xp >= 150) {
      rankBadge.textContent = "Adventurer";
    } else {
      rankBadge.textContent = "Explorer";
    }
  }
});