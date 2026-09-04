"use strict";

const STORAGE_KEYS = {
  contrast: "englishQuestCR.highContrast",
  progress: "englishQuestCR.progress",
  xp: "englishQuestCR.xp",
  streak: "englishQuestCR.streak",
  badges: "englishQuestCR.badges"
};

const DEFAULT_PROGRESS = {
  completedMissions: [],
  completedLevels: []
};

document.addEventListener("DOMContentLoaded", () => {
  setCurrentYear();
  initializeMenu();
  initializeContrastMode();
  loadDashboard();
  loadLevels();
  displayMotivationalMessage();
});

function setCurrentYear() {
  const yearElement = document.getElementById("current-year");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

function initializeMenu() {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const navigation = document.querySelector("[data-navigation]");

  if (!menuButton || !navigation) {
    return;
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

  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      navigation.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Abrir menú de navegación");
      document.body.classList.remove("menu-open");
    }
  });
}

function initializeContrastMode() {
  const contrastButton = document.querySelector("[data-contrast-toggle]");

  if (!contrastButton) {
    return;
  }

  const highContrastEnabled = readBooleanPreference(STORAGE_KEYS.contrast);
  updateContrastMode(highContrastEnabled, contrastButton);

  contrastButton.addEventListener("click", () => {
    const isEnabled = !document.body.classList.contains("high-contrast");

    updateContrastMode(isEnabled, contrastButton);
    saveToStorage(STORAGE_KEYS.contrast, String(isEnabled));
  });
}

function updateContrastMode(isEnabled, button) {
  document.body.classList.toggle("high-contrast", isEnabled);
  button.setAttribute("aria-pressed", String(isEnabled));
  button.setAttribute(
    "aria-label",
    isEnabled
      ? "Desactivar modo de alto contraste"
      : "Activar modo de alto contraste"
  );
}

function loadDashboard() {
  const progress = getProgressData();
  const xp = getStoredNumber(STORAGE_KEYS.xp);
  const streak = getStoredNumber(STORAGE_KEYS.streak);
  const badges = getStoredArray(STORAGE_KEYS.badges);

  const totalMissions = 25;
  const completedMissions = progress.completedMissions.length;
  const percentage = Math.min(
    100,
    Math.round((completedMissions / totalMissions) * 100)
  );

  updateText("xp-total", xp);
  updateText("streak-total", streak);
  updateText("badges-total", badges.length);
  updateText("progress-percentage", `${percentage}%`);

  updateProgressRing(percentage);
  updateRankBadge(xp, percentage);
}

function updateProgressRing(percentage) {
  const progressRing = document.querySelector("[data-progress-ring]");

  if (!progressRing) {
    return;
  }

  const degrees = percentage * 3.6;

  progressRing.style.background = `
    radial-gradient(closest-side, var(--surface-elevated) 78%, transparent 79% 100%),
    conic-gradient(var(--mint) ${degrees}deg, rgba(255, 255, 255, 0.12) ${degrees}deg)
  `;

  progressRing.setAttribute("aria-valuenow", String(percentage));
}

function updateRankBadge(xp, percentage) {
  const rankBadge = document.getElementById("rank-badge");

  if (!rankBadge) {
    return;
  }

  let rank = "Explorer";

  if (percentage >= 100 || xp >= 1500) {
    rank = "Quest Master";
  } else if (percentage >= 60 || xp >= 800) {
    rank = "Pathfinder";
  } else if (percentage >= 25 || xp >= 300) {
    rank = "Trailblazer";
  }

  rankBadge.textContent = rank;
}

async function loadLevels() {
  const container = document.getElementById("levels-container");
  const errorMessage = document.getElementById("levels-error");

  if (!container) {
    return;
  }

  try {
    const response = await fetch("data/levels.json");

    if (!response.ok) {
      throw new Error(`No se pudo cargar levels.json: ${response.status}`);
    }

    const levels = await response.json();

    if (!Array.isArray(levels) || levels.length === 0) {
      throw new Error("El archivo de niveles no contiene datos válidos.");
    }

    container.innerHTML = "";

    levels.forEach((level) => {
      if (isValidLevel(level)) {
        container.appendChild(createLevelCard(level));
      }
    });

    if (!container.children.length) {
      throw new Error("No hay niveles disponibles para mostrar.");
    }
  } catch (error) {
    console.error("Error al cargar niveles:", error);

    container.innerHTML = "";

    if (errorMessage) {
      errorMessage.hidden = false;
    }
  }
}

function isValidLevel(level) {
  return Boolean(
    level &&
      level.id &&
      level.year &&
      level.title &&
      level.cefr &&
      level.description &&
      Array.isArray(level.topics)
  );
}

function createLevelCard(level) {
  const card = document.createElement("article");
  card.className = "level-card";

  const visibleTopics = level.topics.slice(0, 3);
  const topicsMarkup = visibleTopics
    .map((topic) => `<li>${escapeHTML(topic)}</li>`)
    .join("");

  card.innerHTML = `
    <div class="level-card-top">
      <span class="level-icon" aria-hidden="true">${escapeHTML(level.icon || "📘")}</span>
      <span class="level-tag">${escapeHTML(level.cefr)}</span>
    </div>

    <h3>${escapeHTML(level.title)}</h3>
    <p class="level-year">${escapeHTML(level.year)}</p>
    <p>${escapeHTML(level.description)}</p>

    <ul class="topic-list" aria-label="Temas principales">
      ${topicsMarkup}
    </ul>

    <a class="text-link" href="pages/levels.html#${encodeURIComponent(level.id)}">
      Explorar ruta
      <span aria-hidden="true">→</span>
      <span class="sr-only">: ${escapeHTML(level.title)}</span>
    </a>
  `;

  return card;
}

function displayMotivationalMessage() {
  const messageElement = document.getElementById("motivational-message");

  if (!messageElement) {
    return;
  }

  const messages = [
    "Cada reto completado te acerca a tu meta.",
    "Pequeños avances diarios construyen grandes habilidades.",
    "Practicá con calma: cada intento también enseña.",
    "Tu progreso empieza con una misión.",
    "El inglés se aprende paso a paso. Hoy podés dar uno."
  ];

  const messageIndex = new Date().getDate() % messages.length;
  messageElement.textContent = messages[messageIndex];
}

function getProgressData() {
  const savedProgress = getStoredObject(STORAGE_KEYS.progress);

  return {
    completedMissions: Array.isArray(savedProgress.completedMissions)
      ? savedProgress.completedMissions
      : DEFAULT_PROGRESS.completedMissions,
    completedLevels: Array.isArray(savedProgress.completedLevels)
      ? savedProgress.completedLevels
      : DEFAULT_PROGRESS.completedLevels
  };
}

function getStoredNumber(key) {
  try {
    const value = Number(localStorage.getItem(key));
    return Number.isFinite(value) && value >= 0 ? value : 0;
  } catch (error) {
    console.warn("No se pudo acceder a localStorage:", error);
    return 0;
  }
}

function getStoredArray(key) {
  try {
    const parsedValue = JSON.parse(localStorage.getItem(key));
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch (error) {
    return [];
  }
}

function getStoredObject(key) {
  try {
    const parsedValue = JSON.parse(localStorage.getItem(key));
    return parsedValue && typeof parsedValue === "object"
      ? parsedValue
      : DEFAULT_PROGRESS;
  } catch (error) {
    return DEFAULT_PROGRESS;
  }
}

function readBooleanPreference(key) {
  try {
    return localStorage.getItem(key) === "true";
  } catch (error) {
    return false;
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.warn("No se pudo guardar la preferencia local:", error);
  }
}

function updateText(elementId, value) {
  const element = document.getElementById(elementId);

  if (element) {
    element.textContent = String(value);
  }
}

function escapeHTML(value) {
  const element = document.createElement("div");
  element.textContent = String(value);
  return element.innerHTML;
}