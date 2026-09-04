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

const MISSION_ANSWERS = {
  "seventh-mission-1": {
    "question-1": "b",
    "question-2": "a",
    "question-3": "a",
    "question-4": "b"
  }
};

const QUESTION_FEEDBACK = {
  "question-1": {
    correct: "¡Correcto! “Good morning” se usa antes del mediodía.",
    incorrect: "Todavía no. Antes del mediodía se usa “Good morning”."
  },
  "question-2": {
    correct: "¡Muy bien! La frase correcta es “My name is Daniela.”",
    incorrect: "Revisá la estructura: “My name is Daniela.”"
  },
  "question-3": {
    correct: "¡Correcto! “Nice to meet you” se usa al conocer a alguien.",
    incorrect: "La expresión adecuada al conocer a alguien es “Nice to meet you”."
  },
  "question-4": {
    correct: "¡Excelente! La compañera nueva de Lucas se llama Emma.",
    incorrect: "Leé el diálogo otra vez: Emma se presenta después de Lucas."
  }
};

document.addEventListener("DOMContentLoaded", () => {
  setCurrentYear();
  initializeMenu();
  initializeContrastMode();
  loadDashboard();
  loadLevels();
  displayMotivationalMessage();
  initializeMissionQuiz();
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
    const response = await fetch("../data/levels.json");

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

    <a class="text-link" href="mission.html?mission=seventh-mission-1">
      Explorar ruta
      <span aria-hidden="true">→</span>
      <span class="sr-only">: ${escapeHTML(level.title)}</span>
    </a>
  `;

  return card;
}

function initializeMissionQuiz() {
  const quizForm = document.getElementById("mission-quiz");

  if (!quizForm) {
    return;
  }

  const missionId = getMissionIdFromURL();
  const answers = MISSION_ANSWERS[missionId];

  if (!answers) {
    return;
  }

  quizForm.addEventListener("submit", (event) => {
    event.preventDefault();
    evaluateMissionQuiz(quizForm, missionId, answers);
  });
}

function getMissionIdFromURL() {
  const parameters = new URLSearchParams(window.location.search);
  return parameters.get("mission") || "seventh-mission-1";
}

function evaluateMissionQuiz(form, missionId, answers) {
  const resultElement = document.getElementById("quiz-result");
  const questionNames = Object.keys(answers);

  clearQuestionFeedback(form);

  let correctAnswers = 0;
  let unansweredQuestions = 0;

  questionNames.forEach((questionName) => {
    const selectedOption = form.querySelector(
      `input[name="${questionName}"]:checked`
    );

    const feedbackElement = form.querySelector(
      `[data-feedback="${questionName}"]`
    );

    if (!selectedOption) {
      unansweredQuestions += 1;

      if (feedbackElement) {
        feedbackElement.textContent = "Elegí una respuesta para continuar.";
        feedbackElement.className = "question-feedback is-missing";
      }

      return;
    }

    const isCorrect = selectedOption.value === answers[questionName];

    if (isCorrect) {
      correctAnswers += 1;
    }

    if (feedbackElement) {
      feedbackElement.textContent = isCorrect
        ? QUESTION_FEEDBACK[questionName].correct
        : QUESTION_FEEDBACK[questionName].incorrect;

      feedbackElement.className = isCorrect
        ? "question-feedback is-correct"
        : "question-feedback is-incorrect";
    }
  });

  if (!resultElement) {
    return;
  }

  if (unansweredQuestions > 0) {
    resultElement.textContent =
      "Todavía faltan respuestas. Completá todas las preguntas y volvé a intentarlo.";
    resultElement.className = "quiz-result is-warning";
    resultElement.focus();
    return;
  }

  const passedMission = correctAnswers >= 3;
  const earnedXP = correctAnswers * 25;

  if (passedMission) {
    const wasAlreadyCompleted = isMissionCompleted(missionId);

    if (!wasAlreadyCompleted) {
      completeMission(missionId, earnedXP);
    }

    resultElement.innerHTML = `
      <strong>¡Misión completada! 🎉</strong>
      Obtuviste ${earnedXP} XP con ${correctAnswers} de ${questionNames.length} respuestas correctas.
      ${wasAlreadyCompleted ? "Esta misión ya estaba registrada en tu progreso." : "Tu progreso fue guardado en este navegador."}
    `;

    resultElement.className = "quiz-result is-success";
  } else {
    resultElement.innerHTML = `
      <strong>Vas avanzando. 💪</strong>
      Obtuviste ${correctAnswers} de ${questionNames.length} respuestas correctas.
      Necesitás al menos 3 respuestas correctas para completar la misión.
      Revisá las explicaciones e intentá otra vez.
    `;

    resultElement.className = "quiz-result is-warning";
  }

  resultElement.focus();
}

function clearQuestionFeedback(form) {
  form.querySelectorAll(".question-feedback").forEach((feedback) => {
    feedback.textContent = "";
    feedback.className = "question-feedback";
  });
}

function isMissionCompleted(missionId) {
  const progress = getProgressData();
  return progress.completedMissions.includes(missionId);
}

function completeMission(missionId, earnedXP) {
  const progress = getProgressData();

  if (!progress.completedMissions.includes(missionId)) {
    progress.completedMissions.push(missionId);
  }

  if (!progress.completedLevels.includes("seventh-foundations")) {
    progress.completedLevels.push("seventh-foundations");
  }

  saveToStorage(STORAGE_KEYS.progress, JSON.stringify(progress));

  const currentXP = getStoredNumber(STORAGE_KEYS.xp);
  saveToStorage(STORAGE_KEYS.xp, String(currentXP + earnedXP));

  updateStreak();
  addFirstMissionBadge();
}

function updateStreak() {
  const streakDataKey = "englishQuestCR.lastStudyDate";
  const today = new Date().toISOString().slice(0, 10);
  const lastStudyDate = readFromStorage(streakDataKey);
  const currentStreak = getStoredNumber(STORAGE_KEYS.streak);

  if (lastStudyDate === today) {
    return;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = yesterday.toISOString().slice(0, 10);

  const updatedStreak = lastStudyDate === yesterdayString
    ? currentStreak + 1
    : 1;

  saveToStorage(STORAGE_KEYS.streak, String(updatedStreak));
  saveToStorage(streakDataKey, today);
}

function addFirstMissionBadge() {
  const badges = getStoredArray(STORAGE_KEYS.badges);
  const badgeId = "first-mission";

  if (!badges.includes(badgeId)) {
    badges.push(badgeId);
    saveToStorage(STORAGE_KEYS.badges, JSON.stringify(badges));
  }
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
      : [],
    completedLevels: Array.isArray(savedProgress.completedLevels)
      ? savedProgress.completedLevels
      : []
  };
}

function getStoredNumber(key) {
  const value = Number(readFromStorage(key));
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function getStoredArray(key) {
  try {
    const value = JSON.parse(readFromStorage(key));
    return Array.isArray(value) ? value : [];
  } catch (error) {
    return [];
  }
}

function getStoredObject(key) {
  try {
    const value = JSON.parse(readFromStorage(key));
    return value && typeof value === "object" ? value : DEFAULT_PROGRESS;
  } catch (error) {
    return DEFAULT_PROGRESS;
  }
}

function readBooleanPreference(key) {
  return readFromStorage(key) === "true";
}

function readFromStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.warn("No se pudo guardar información local:", error);
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