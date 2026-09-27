
// ============================================================
// PHYSICS FORENSICS VIRTUAL LAB
// SCRIPT.JS — SIMULATION ENGINE & APPLICATION CONTROLLER
// ============================================================

"use strict";

// ============================================================
// 1. CONFIGURATION
// ============================================================

const CONFIG = {
  canvasWidth: 1100,
  canvasHeight: 500,

  trackTop: 100,
  trackBottom: 430,
  trackY: 350,

  pixelsPerMeter: 75,
  maxObjects: 3,
  maxDynamicObjects: 2,

  timeStep: 1 / 60,
  maxFrameDelta: 0.05,

  defaultMass: 1,
  defaultPosition: 2,
  defaultVelocity: 2,
  defaultRestitution: 1,

  collisionTolerance: 0.5,
  wallPosition: 13.5,

  colors: {
    background: "#071123",
    grid: "rgba(120, 180, 255, 0.10)",
    axis: "rgba(140, 200, 255, 0.30)",
    text: "#dff8ff",
    cyan: "#25d9ff",
    blue: "#527dff",
    green: "#36e6a1",
    yellow: "#ffd166",
    red: "#ff5f7a",
    objectSelection: "#8cecff"
  }
};

const OBJECT_LIBRARY = {
  car: {
    name: "Car",
    image: "assets/mobil.png",
    mass: 1.5,
    width: 1.5,
    height: 1,
    color: "#25d9ff"
  },

  truck: {
    name: "Truck",
    image: "assets/truk.png",
    mass: 5,
    width: 2.2,
    height: 1.3,
    color: "#9b6cff"
  },

  ball: {
    name: "Ball",
    image: "assets/bola.png",
    mass: 0.5,
    width: 0.8,
    height: 0.8,
    color: "#ffd166"
  },

  wall: {
    name: "Wall",
    image: "assets/tembok.png",
    mass: Infinity,
    width: 0.7,
    height: 3,
    color: "#ff5f7a",
    isStatic: true
  }
};

const CHALLENGES = [
  {
    title: "Mass vs Momentum",
    description:
      "Selidiki pengaruh massa terhadap momentum ketika kecepatan tetap.",
    instruction:
      "Gunakan dua objek dengan kecepatan awal yang sama, tetapi massa berbeda.",
    target: "mass"
  },

  {
    title: "Speed Investigation",
    description:
      "Selidiki pengaruh kecepatan terhadap besar momentum benda.",
    instruction:
      "Gunakan massa yang sama dan ubah nilai kecepatan awal.",
    target: "speed"
  },

  {
    title: "Collision Evidence",
    description:
      "Amati perubahan momentum dan energi kinetik ketika dua objek bertumbukan.",
    instruction:
      "Tempatkan dua objek dinamis pada lintasan yang sama dan jalankan simulasi.",
    target: "collision"
  },

  {
    title: "Wall Impact",
    description:
      "Selidiki perubahan momentum ketika objek menumbuk dinding.",
    instruction:
      "Gunakan satu objek dinamis dan satu dinding.",
    target: "wall"
  }
];

// ============================================================
// 2. APPLICATION STATE
// ============================================================

const state = {
  currentScene: 1,
  soundEnabled: true,
  gridVisible: true,
  vectorsVisible: true,

  mode: "guided",
  challengeIndex: 0,

  isRunning: false,
  isPaused: false,
  simulationTime: 0,
  simulationSpeed: 1,

  selectedObjectId: null,
  nextObjectId: 1,

  objects: [],
  trials: [],

  collisionType: "elastic",
  wallCollisionEnabled: true,

  lastFrameTime: 0,
  animationFrameId: null,

  lastCollisionTime: -1,
  lastCollisionMessage: "",

  pendingConfirmation: null,

  audioContext: null
};

// ============================================================
// 3. DOM REFERENCES
// ============================================================

const DOM = {};

function cacheDOM() {
  const ids = [
    "loading-screen",
    "loading-progress",
    "loading-status",
    "app",
    "notification-container",

    "sound-toggle",
    "help-button",

    "progress-fill",
    "start-lab-button",

    "guided-mode-button",
    "free-mode-button",
    "mode-title",
    "mode-description",

    "challenge-title",
    "challenge-description",
    "challenge-counter",
    "challenge-progress-fill",
    "next-challenge-button",

    "grid-toggle",
    "vector-toggle",
    "reset-arena-button",

    "simulation-canvas",
    "arena-coordinate-display",
    "arena-time-display",
    "arena-empty-state",
    "collision-indicator",

    "run-simulation-button",
    "run-button-icon",
    "run-button-text",
    "pause-simulation-button",
    "step-simulation-button",
    "stop-simulation-button",
    "simulation-speed",
    "clear-arena-button",

    "live-total-momentum",
    "live-total-energy",
    "live-system-impulse",
    "live-simulation-time",

    "inspector-empty",
    "object-inspector",
    "inspector-object-image",
    "inspector-object-name",
    "inspector-object-id",
    "object-mass",
    "object-position",
    "object-velocity",
    "object-direction",
    "object-restitution",
    "apply-object-properties",
    "delete-selected-object",

    "collision-type",
    "wall-collision-toggle",

    "selected-object-momentum",
    "selected-object-energy",
    "selected-object-current-velocity",

    "save-trial-button",
    "reset-experiment-button",

    "report-total-trials",
    "report-momentum-before",
    "report-momentum-after",
    "report-momentum-difference",

    "trial-table-body",
    "empty-trials-row",
    "export-csv-button",
    "clear-trials-button",

    "analysis-empty-state",
    "analysis-content",
    "analysis-momentum-status",
    "analysis-difference-value",
    "analysis-collision-status",
    "analysis-energy-change",
    "analysis-conclusion-text",

    "chart-data-selector",
    "report-chart",
    "chart-empty-state",

    "help-modal",
    "confirmation-modal",
    "confirmation-title",
    "confirmation-message",
    "cancel-confirmation-button",
    "confirm-action-button",
    "restart-lab-button"
  ];

  ids.forEach((id) => {
    DOM[id] = document.getElementById(id);
  });

  DOM.sceneElements = [...document.querySelectorAll(".scene")];
  DOM.progressSteps = [...document.querySelectorAll(".progress-step")];
  DOM.nextButtons = [...document.querySelectorAll("[data-next]")];
  DOM.prevButtons = [...document.querySelectorAll("[data-prev]")];
  DOM.toolButtons = [...document.querySelectorAll("[data-tool]")];
  DOM.objectButtons = [...document.querySelectorAll("[data-object-type]")];
  DOM.modeButtons = [...document.querySelectorAll("[data-mode]")];
  DOM.closeModalButtons = [...document.querySelectorAll("[data-close-modal]")];

  DOM.canvasContext = DOM["simulation-canvas"]?.getContext("2d");
  DOM.chartContext = DOM["report-chart"]?.getContext("2d");
}

// ============================================================
// 4. UTILITY FUNCTIONS
// ============================================================

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function formatNumber(value, digits = 2) {
  if (!Number.isFinite(value)) return "∞";
  return Number(value).toFixed(digits);
}

function safeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function escapeCSV(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function getObjectById(id) {
  return state.objects.find((object) => object.id === id) || null;
}

function getDynamicObjects() {
  return state.objects.filter((object) => !object.isStatic);
}

function getWallObjects() {
  return state.objects.filter((object) => object.isStatic);
}

function getObjectWidthPixels(object) {
  return object.width * CONFIG.pixelsPerMeter;
}

function metersToPixels(meters) {
  return meters * CONFIG.pixelsPerMeter;
}

function pixelsToMeters(pixels) {
  return pixels / CONFIG.pixelsPerMeter;
}

function getObjectPixelX(object) {
  return metersToPixels(object.x);
}

function getObjectPixelY(object) {
  return CONFIG.trackY - object.height * CONFIG.pixelsPerMeter * 0.5;
}

function getObjectBounds(object) {
  const width = getObjectWidthPixels(object);
  const height = object.height * CONFIG.pixelsPerMeter;

  return {
    left: getObjectPixelX(object) - width / 2,
    right: getObjectPixelX(object) + width / 2,
    top: getObjectPixelY(object) - height / 2,
    bottom: getObjectPixelY(object) + height / 2
  };
}

function showNotification(message, type = "info") {
  if (!DOM["notification-container"]) return;

  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  DOM["notification-container"].appendChild(notification);

  window.setTimeout(() => {
    notification.style.opacity = "0";
    notification.style.transform = "translateX(20px)";

    window.setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function playSound(frequency = 440, duration = 0.08, type = "sine") {
  if (!state.soundEnabled) return;

  try {
    if (!state.audioContext) {
      state.audioContext = new (
        window.AudioContext || window.webkitAudioContext
      )();
    }

    const context = state.audioContext;

    if (context.state === "suspended") {
      context.resume();
    }

    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    gain.gain.setValueAtTime(0.05, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      context.currentTime + duration
    );

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start();
    oscillator.stop(context.currentTime + duration);
  } catch (error) {
    console.warn("Audio tidak tersedia:", error);
  }
}

// ============================================================
// 5. LOADING SYSTEM
// ============================================================

function initializeLoadingScreen() {
  const progress = DOM["loading-progress"];
  const status = DOM["loading-status"];
  const loadingScreen = DOM["loading-screen"];
  const app = DOM.app;

  if (!progress || !status || !loadingScreen || !app) return;

  const loadingSteps = [
    "Loading physics engine...",
    "Preparing experiment objects...",
    "Initializing measurement system...",
    "Preparing laboratory interface...",
    "Laboratory ready."
  ];

  let index = 0;

  const loadingInterval = window.setInterval(() => {
    index += 1;

    progress.style.width = `${Math.min(index * 20, 100)}%`;
    status.textContent = loadingSteps[index - 1] || loadingSteps.at(-1);

    if (index >= loadingSteps.length) {
      window.clearInterval(loadingInterval);

      window.setTimeout(() => {
        loadingScreen.style.opacity = "0";
        loadingScreen.style.visibility = "hidden";
        app.classList.remove("hidden");
        initializeApplication();
      }, 500);
    }
  }, 220);
}

// ============================================================
// 6. SCENE NAVIGATION
// ============================================================

function goToScene(sceneNumber) {
  const targetScene = clamp(Number(sceneNumber), 1, 6);

  state.currentScene = targetScene;

  DOM.sceneElements.forEach((scene) => {
    const sceneId = Number(scene.dataset.scene);
    scene.classList.toggle("active-scene", sceneId === targetScene);
  });

  DOM.progressSteps.forEach((step) => {
    const stepScene = Number(step.dataset.scene);

    step.classList.toggle("active", stepScene === targetScene);
    step.classList.toggle("completed", stepScene < targetScene);
  });

  if (DOM["progress-fill"]) {
    DOM["progress-fill"].style.width = `${(targetScene / 6) * 100}%`;
  }

  if (targetScene === 5) {
    renderArena();
    updateAllUI();
  }

  if (targetScene === 6) {
    renderReport();
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function setupSceneNavigation() {
  DOM.progressSteps.forEach((step) => {
    step.addEventListener("click", () => {
      const target = Number(step.dataset.scene);

      if (target <= state.currentScene + 1) {
        goToScene(target);
      } else {
        showNotification("Selesaikan tahapan sebelumnya terlebih dahulu.");
      }
    });
  });

  DOM.nextButtons.forEach((button) => {
    button.addEventListener("click", () => {
      goToScene(Number(button.dataset.next));
      playSound(660, 0.07);
    });
  });

  DOM.prevButtons.forEach((button) => {
    button.addEventListener("click", () => {
      goToScene(Number(button.dataset.prev));
      playSound(440, 0.07);
    });
  });

  DOM["start-lab-button"]?.addEventListener("click", () => {
    goToScene(2);
    playSound(660, 0.1);
  });

  DOM["restart-lab-button"]?.addEventListener("click", () => {
    resetExperiment();
    goToScene(1);
  });
}

// ============================================================
// 7. MODE SYSTEM
// ============================================================

function setMode(mode) {
  state.mode = mode === "free" ? "free" : "guided";

  DOM.modeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === state.mode);
  });

  if (state.mode === "guided") {
    DOM["mode-title"].textContent = "Guided Investigation";
    DOM["mode-description"].textContent =
      "Ikuti tantangan eksperimen yang tersedia.";
    DOM["challenge-title"].textContent =
      CHALLENGES[state.challengeIndex].title;
    DOM["challenge-description"].textContent =
      CHALLENGES[state.challengeIndex].description;
    DOM["next-challenge-button"].classList.remove("hidden");
  } else {
    DOM["mode-title"].textContent = "Free Sandbox";
    DOM["mode-description"].textContent =
      "Bebas mengatur objek dan melakukan eksperimen sendiri.";
    DOM["challenge-title"].textContent = "Free Investigation";
    DOM["challenge-description"].textContent =
      "Atur objek, massa, kecepatan, dan jenis tumbukan sesuai tujuan eksperimenmu.";
    DOM["next-challenge-button"].classList.add("hidden");
  }

  playSound(550, 0.07);
}

function setupModeSystem() {
  DOM.modeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setMode(button.dataset.mode);
    });
  });

  DOM["next-challenge-button"]?.addEventListener("click", () => {
    state.challengeIndex =
      (state.challengeIndex + 1) % CHALLENGES.length;

    updateChallengeUI();
    showNotification(`Tantangan baru: ${CHALLENGES[state.challengeIndex].title}`);
    playSound(700, 0.1);
  });
}

function updateChallengeUI() {
  const challenge = CHALLENGES[state.challengeIndex];

  if (state.mode !== "guided") return;

  DOM["challenge-title"].textContent = challenge.title;
  DOM["challenge-description"].textContent = challenge.description;
  DOM["challenge-counter"].textContent =
    `CHALLENGE ${state.challengeIndex + 1} / ${CHALLENGES.length}`;
  DOM["challenge-progress-fill"].style.width =
    `${((state.challengeIndex + 1) / CHALLENGES.length) * 100}%`;
}

// ============================================================
// 8. OBJECT SYSTEM
// ============================================================

function createObject(type, options = {}) {
  const template = OBJECT_LIBRARY[type];

  if (!template) return null;

  const dynamicCount = getDynamicObjects().length;

  if (!template.isStatic && dynamicCount >= CONFIG.maxDynamicObjects) {
    showNotification("Maksimal dua objek dinamis dapat digunakan.");
    return null;
  }

  if (state.objects.length >= CONFIG.maxObjects) {
    showNotification("Kapasitas arena sudah penuh.");
    return null;
  }

  const id = `OBJECT-${String(state.nextObjectId).padStart(2, "0")}`;
  state.nextObjectId += 1;

  const object = {
    id,
    type,
    name: template.name,
    image: template.image,
    color: template.color,

    mass: template.mass,
    width: template.width,
    height: template.height,

    x: safeNumber(options.x, 2 + state.objects.length * 3),
    v: template.isStatic ? 0 : safeNumber(options.v, CONFIG.defaultVelocity),
    direction: options.direction === -1 ? -1 : 1,

    restitution: clamp(
      safeNumber(options.restitution, CONFIG.defaultRestitution),
      0,
      1
    ),

    isStatic: Boolean(template.isStatic),

    imageElement: null,
    selected: false,
    initialState: null
  };

  object.initialState = {
    x: object.x,
    v: object.v,
    direction: object.direction
  };

  state.objects.push(object);
  state.selectedObjectId = object.id;

  loadObjectImage(object);
  updateAllUI();
  renderArena();

  playSound(600, 0.07);

  return object;
}

function loadObjectImage(object) {
  const image = new Image();

  image.onload = () => {
    object.imageElement = image;
    renderArena();
  };

  image.onerror = () => {
    console.warn(`Gagal memuat aset: ${object.image}`);
  };

  image.src = object.image;
}

function removeObject(objectId) {
  const index = state.objects.findIndex((object) => object.id === objectId);

  if (index === -1) return;

  state.objects.splice(index, 1);

  if (state.selectedObjectId === objectId) {
    state.selectedObjectId = state.objects[0]?.id || null;
  }

  updateAllUI();
  renderArena();
}

function clearArena() {
  stopSimulation();
  state.objects = [];
  state.selectedObjectId = null;
  state.simulationTime = 0;
  updateAllUI();
  renderArena();
  showNotification("Arena telah dikosongkan.");
}

function resetArena() {
  stopSimulation();

  state.objects.forEach((object) => {
    object.x = object.initialState.x;
    object.v = object.initialState.v;
    object.direction = object.initialState.direction;
  });

  state.simulationTime = 0;
  state.lastCollisionTime = -1;

  updateAllUI();
  renderArena();
  showNotification("Posisi dan kecepatan objek telah direset.");
}

function resetExperiment() {
  stopSimulation();

  state.objects = [];
  state.selectedObjectId = null;
  state.nextObjectId = 1;
  state.simulationTime = 0;
  state.challengeIndex = 0;

  updateChallengeUI();
  updateAllUI();
  renderArena();
}

// ============================================================
// 9. OBJECT TOOLBOX EVENTS
// ============================================================

function setupObjectToolbox() {
  DOM.objectButtons.forEach((button) => {
    button.addEventListener("click", () => {
      createObject(button.dataset.objectType);
    });
  });

  DOM.toolButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const type = button.dataset.tool;

      goToScene(5);

      window.setTimeout(() => {
        createObject(type);
      }, 250);
    });
  });
}

// ============================================================
// 10. PHYSICS CALCULATIONS
// ============================================================

function calculateMomentum(object) {
  return object.isStatic ? 0 : object.mass * object.v * object.direction;
}

function calculateKineticEnergy(object) {
  if (object.isStatic) return 0;

  return 0.5 * object.mass * Math.pow(object.v, 2);
}

function calculateTotalMomentum(objects = getDynamicObjects()) {
  return objects.reduce(
    (total, object) => total + calculateMomentum(object),
    0
  );
}

function calculateTotalEnergy(objects = getDynamicObjects()) {
  return objects.reduce(
    (total, object) => total + calculateKineticEnergy(object),
    0
  );
}

function getSignedVelocity(object) {
  return object.v * object.direction;
}

function setSignedVelocity(object, signedVelocity) {
  object.direction = signedVelocity < 0 ? -1 : 1;
  object.v = Math.abs(signedVelocity);
}

function calculateImpulse(momentumBefore, momentumAfter) {
  return momentumAfter - momentumBefore;
}

function calculateElasticCollision(objectA, objectB) {
  const m1 = objectA.mass;
  const m2 = objectB.mass;
  const u1 = getSignedVelocity(objectA);
  const u2 = getSignedVelocity(objectB);
  const e = clamp(objectA.restitution, 0, 1);

  const v1 =
    ((m1 - e * m2) * u1 + (1 + e) * m2 * u2) / (m1 + m2);

  const v2 =
    ((m2 - e * m1) * u2 + (1 + e) * m1 * u1) / (m1 + m2);

  setSignedVelocity(objectA, v1);
  setSignedVelocity(objectB, v2);
}

function calculatePerfectlyInelasticCollision(objectA, objectB) {
  const totalMass = objectA.mass + objectB.mass;

  const combinedVelocity =
    (objectA.mass * getSignedVelocity(objectA) +
      objectB.mass * getSignedVelocity(objectB)) /
    totalMass;

  setSignedVelocity(objectA, combinedVelocity);
  setSignedVelocity(objectB, combinedVelocity);
}

function calculateInelasticCollision(objectA, objectB) {
  const e = clamp(objectA.restitution, 0, 1);

  if (e === 0) {
    calculatePerfectlyInelasticCollision(objectA, objectB);
    return;
  }

  calculateElasticCollision(objectA, objectB);
}

function resolveObjectCollision(objectA, objectB) {
  if (objectA.isStatic || objectB.isStatic) return;

  const beforeMomentum = calculateTotalMomentum();

  if (state.collisionType === "elastic") {
    calculateElasticCollision(objectA, objectB);
  } else if (state.collisionType === "inelastic") {
    calculateInelasticCollision(objectA, objectB);
  } else {
    calculatePerfectlyInelasticCollision(objectA, objectB);
  }

  const afterMomentum = calculateTotalMomentum();

  state.lastCollisionTime = state.simulationTime;
  state.lastCollisionMessage =
    `Tumbukan ${objectA.name} dan ${objectB.name}`;

  showCollisionIndicator();
  playSound(180, 0.15, "triangle");

  return {
    beforeMomentum,
    afterMomentum,
    impulse: afterMomentum - beforeMomentum
  };
}

function resolveWallCollision(object, wall) {
  if (object.isStatic || !state.wallCollisionEnabled) return;

  const wallBounds = getObjectBounds(wall);
  const objectBounds = getObjectBounds(object);

  const wallCenterMeters = pixelsToMeters(
    (wallBounds.left + wallBounds.right) / 2
  );

  const objectHalfWidthMeters = object.width / 2;

  const wallIsRightOfObject = wallCenterMeters > object.x;

  if (wallIsRightOfObject && objectBounds.right >= wallBounds.left) {
    object.x = wallCenterMeters - objectHalfWidthMeters;
    object.v *= object.restitution;
    object.direction *= -1;
    showCollisionIndicator();
    playSound(200, 0.12, "triangle");
  }

  if (!wallIsRightOfObject && objectBounds.left <= wallBounds.right) {
    object.x = wallCenterMeters + objectHalfWidthMeters;
    object.v *= object.restitution;
    object.direction *= -1;
    showCollisionIndicator();
    playSound(200, 0.12, "triangle");
  }
}

function checkObjectCollisions() {
  const dynamicObjects = getDynamicObjects();

  for (let i = 0; i < dynamicObjects.length; i += 1) {
    for (let j = i + 1; j < dynamicObjects.length; j += 1) {
      const objectA = dynamicObjects[i];
      const objectB = dynamicObjects[j];

      const distance = Math.abs(objectA.x - objectB.x);
      const minimumDistance = (objectA.width + objectB.width) / 2;

      const approaching =
        getSignedVelocity(objectA) > getSignedVelocity(objectB);

      if (distance <= minimumDistance && approaching) {
        const midpoint = (objectA.x + objectB.x) / 2;

        objectA.x = midpoint - objectA.width / 2;
        objectB.x = midpoint + objectB.width / 2;

        resolveObjectCollision(objectA, objectB);
      }
    }
  }
}

function checkWallCollisions() {
  if (!state.wallCollisionEnabled) return;

  const walls = getWallObjects();
  const dynamicObjects = getDynamicObjects();

  walls.forEach((wall) => {
    dynamicObjects.forEach((object) => {
      const objectBounds = getObjectBounds(object);
      const wallBounds = getObjectBounds(wall);

      const overlaps =
        objectBounds.right >= wallBounds.left &&
        objectBounds.left <= wallBounds.right;

      if (overlaps) {
        resolveWallCollision(object, wall);
      }
    });
  });
}

function enforceTrackBoundaries(object) {
  const halfWidth = object.width / 2;
  const minX = 0.5 + halfWidth;
  const maxX = 14 - halfWidth;

  if (object.x < minX) {
    object.x = minX;
    object.direction = 1;
  }

  if (object.x > maxX) {
    object.x = maxX;
    object.direction = -1;
  }
}

// ============================================================
// 11. SIMULATION ENGINE
// ============================================================

function updatePhysics(deltaTime) {
  const dt = clamp(deltaTime, 0, CONFIG.maxFrameDelta) * state.simulationSpeed;

  state.simulationTime += dt;

  getDynamicObjects().forEach((object) => {
    object.x += getSignedVelocity(object) * dt;
    enforceTrackBoundaries(object);
  });

  checkObjectCollisions();
  checkWallCollisions();

  updateLiveMeasurements();
  renderArena();
}

function simulationLoop(timestamp) {
  if (!state.isRunning || state.isPaused) return;

  if (!state.lastFrameTime) {
    state.lastFrameTime = timestamp;
  }

  const deltaTime = (timestamp - state.lastFrameTime) / 1000;
  state.lastFrameTime = timestamp;

  updatePhysics(deltaTime);

  state.animationFrameId = requestAnimationFrame(simulationLoop);
}

function runSimulation() {
  if (getDynamicObjects().length === 0) {
    showNotification("Tambahkan minimal satu objek dinamis terlebih dahulu.");
    return;
  }

  state.isRunning = true;
  state.isPaused = false;
  state.lastFrameTime = 0;

  updateSimulationButtons();
  updateSimulationStatus("RUNNING");

  state.animationFrameId = requestAnimationFrame(simulationLoop);
  playSound(700, 0.08);
}

function pauseSimulation() {
  if (!state.isRunning) return;

  state.isPaused = !state.isPaused;

  if (state.isPaused) {
    updateSimulationStatus("PAUSED");
    updateSimulationButtons();
  } else {
    state.lastFrameTime = 0;
    updateSimulationStatus("RUNNING");
    updateSimulationButtons();
    state.animationFrameId = requestAnimationFrame(simulationLoop);
  }
}

function stopSimulation() {
  state.isRunning = false;
  state.isPaused = false;
  state.lastFrameTime = 0;

  if (state.animationFrameId !== null) {
    cancelAnimationFrame(state.animationFrameId);
    state.animationFrameId = null;
  }

  updateSimulationStatus("READY");
  updateSimulationButtons();
}

function stepSimulation() {
  if (state.isRunning && !state.isPaused) {
    pauseSimulation();
  }

  updatePhysics(CONFIG.timeStep);
  updateSimulationStatus("STEP");
}

function updateSimulationButtons() {
  if (DOM["pause-simulation-button"]) {
    DOM["pause-simulation-button"].disabled = !state.isRunning;
    DOM["pause-simulation-button"].textContent =
      state.isPaused ? "▶ RESUME" : "❚❚ PAUSE";
  }

  if (DOM["run-button-text"]) {
    DOM["run-button-text"].textContent =
      state.isRunning && !state.isPaused
        ? "RUNNING..."
        : "RUN EXPERIMENT";
  }

  if (DOM["run-button-icon"]) {
    DOM["run-button-icon"].textContent =
      state.isRunning && !state.isPaused ? "◉" : "▶";
  }
}

function updateSimulationStatus(status) {
  const statusText = document.getElementById("simulation-status-text");

  if (statusText) {
    statusText.textContent = status;
  }
}

// ============================================================
// 12. CANVAS RENDERING
// ============================================================

function clearCanvas(context, canvas) {
  context.clearRect(0, 0, canvas.width, canvas.height);
}

function drawArenaBackground(context) {
  const canvas = DOM["simulation-canvas"];

  context.fillStyle = CONFIG.colors.background;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const gradient = context.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    20,
    canvas.width / 2,
    canvas.height / 2,
    canvas.width * 0.7
  );

  gradient.addColorStop(0, "rgba(37, 217, 255, 0.08)");
  gradient.addColorStop(1, "rgba(7, 17, 35, 0)");

  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
}

function drawGrid(context) {
  if (!state.gridVisible) return;

  const canvas = DOM["simulation-canvas"];

  context.strokeStyle = CONFIG.colors.grid;
  context.lineWidth = 1;

  for (let x = 0; x <= canvas.width; x += CONFIG.pixelsPerMeter) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, canvas.height);
    context.stroke();
  }

  for (let y = 0; y <= canvas.height; y += CONFIG.pixelsPerMeter) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(canvas.width, y);
    context.stroke();
  }
}

function drawTrack(context) {
  const canvas = DOM["simulation-canvas"];
  const trackY = CONFIG.trackY;

  context.strokeStyle = CONFIG.colors.axis;
  context.lineWidth = 2;

  context.beginPath();
  context.moveTo(25, trackY + 55);
  context.lineTo(canvas.width - 25, trackY + 55);
  context.stroke();

  context.strokeStyle = "rgba(37, 217, 255, 0.45)";
  context.lineWidth = 3;

  context.beginPath();
  context.moveTo(25, trackY + 50);
  context.lineTo(canvas.width - 25, trackY + 50);
  context.stroke();

  context.fillStyle = CONFIG.colors.text;
  context.font = "12px Inter, sans-serif";

  for (let meter = 0; meter <= 14; meter += 1) {
    const x = metersToPixels(meter);

    context.strokeStyle = "rgba(140, 200, 255, 0.25)";
    context.lineWidth = 1;

    context.beginPath();
    context.moveTo(x, trackY + 45);
    context.lineTo(x, trackY + 62);
    context.stroke();

    context.fillText(`${meter} m`, x - 8, trackY + 82);
  }
}

function drawObject(context, object) {
  const bounds = getObjectBounds(object);
  const centerX = getObjectPixelX(object);
  const centerY = getObjectPixelY(object);

  const width = bounds.right - bounds.left;
  const height = bounds.bottom - bounds.top;

  if (object.imageElement && object.imageElement.complete) {
    context.save();

    if (object.direction === -1 && !object.isStatic) {
      context.translate(centerX, centerY);
      context.scale(-1, 1);
      context.drawImage(
        object.imageElement,
        -width / 2,
        -height / 2,
        width,
        height
      );
    } else {
      context.drawImage(
        object.imageElement,
        bounds.left,
        bounds.top,
        width,
        height
      );
    }

    context.restore();
  } else {
    context.fillStyle = object.color;
    context.fillRect(bounds.left, bounds.top, width, height);
  }

  if (object.selected) {
    context.save();
    context.strokeStyle = CONFIG.colors.objectSelection;
    context.lineWidth = 3;
    context.setLineDash([8, 5]);
    context.strokeRect(
      bounds.left - 8,
      bounds.top - 8,
      width + 16,
      height + 16
    );
    context.restore();
  }

  context.fillStyle = CONFIG.colors.text;
  context.font = "bold 12px Inter, sans-serif";
  context.textAlign = "center";
  context.fillText(object.id, centerX, bounds.top - 15);

  if (state.vectorsVisible && !object.isStatic) {
    drawVelocityVector(context, object);
  }

  context.textAlign = "left";
}

function drawVelocityVector(context, object) {
  const centerX = getObjectPixelX(object);
  const centerY = getObjectPixelY(object);

  const vectorLength = clamp(object.v * 13, 15, 130);
  const direction = object.direction;

  const endX = centerX + vectorLength * direction;

  context.save();

  context.strokeStyle = CONFIG.colors.cyan;
  context.fillStyle = CONFIG.colors.cyan;
  context.lineWidth = 3;

  context.beginPath();
  context.moveTo(centerX, centerY - 65);
  context.lineTo(endX, centerY - 65);
  context.stroke();

  context.beginPath();
  context.moveTo(endX, centerY - 65);
  context.lineTo(endX - direction * 10, centerY - 72);
  context.lineTo(endX - direction * 10, centerY - 58);
  context.closePath();
  context.fill();

  context.font = "11px Inter, sans-serif";
  context.fillText(
    `v = ${formatNumber(getSignedVelocity(object))} m/s`,
    Math.min(centerX, endX),
    centerY - 80
  );

  context.restore();
}

function drawWall(context, object) {
  const bounds = getObjectBounds(object);

  if (object.imageElement && object.imageElement.complete) {
    context.drawImage(
      object.imageElement,
      bounds.left,
      bounds.top,
      bounds.right - bounds.left,
      bounds.bottom - bounds.top
    );
  } else {
    context.fillStyle = object.color;
    context.fillRect(
      bounds.left,
      bounds.top,
      bounds.right - bounds.left,
      bounds.bottom - bounds.top
    );
  }

  context.fillStyle = CONFIG.colors.text;
  context.font = "bold 12px Inter, sans-serif";
  context.textAlign = "center";
  context.fillText(object.id, getObjectPixelX(object), bounds.top - 15);
  context.textAlign = "left";
}

function renderArena() {
  const canvas = DOM["simulation-canvas"];
  const context = DOM.canvasContext;

  if (!canvas || !context) return;

  clearCanvas(context, canvas);
  drawArenaBackground(context);
  drawGrid(context);
  drawTrack(context);

  state.objects.forEach((object) => {
    if (object.isStatic) {
      drawWall(context, object);
    } else {
      drawObject(context, object);
    }
  });

  updateArenaOverlay();
  updateEmptyArenaState();
}

function updateArenaOverlay() {
  const selected = getObjectById(state.selectedObjectId);

  if (DOM["arena-coordinate-display"]) {
    DOM["arena-coordinate-display"].textContent = selected
      ? `X: ${formatNumber(selected.x)} m`
      : "X: 0.00 m";
  }

  if (DOM["arena-time-display"]) {
    DOM["arena-time-display"].textContent =
      `TIME: ${formatNumber(state.simulationTime)} s`;
  }
}

function updateEmptyArenaState() {
  if (!DOM["arena-empty-state"]) return;

  DOM["arena-empty-state"].classList.toggle(
    "hidden",
    state.objects.length > 0
  );
}

function showCollisionIndicator() {
  const indicator = DOM["collision-indicator"];

  if (!indicator) return;

  indicator.classList.remove("hidden");

  window.setTimeout(() => {
    indicator.classList.add("hidden");
  }, 800);
}

// ============================================================
// 13. CANVAS DRAG & SELECTION
// ============================================================

const dragState = {
  active: false,
  objectId: null,
  offsetX: 0
};

function getCanvasCoordinates(event) {
  const canvas = DOM["simulation-canvas"];
  const rect = canvas.getBoundingClientRect();

  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY
  };
}

function findObjectAtPosition(pixelX, pixelY) {
  for (let i = state.objects.length - 1; i >= 0; i -= 1) {
    const object = state.objects[i];
    const bounds = getObjectBounds(object);

    if (
      pixelX >= bounds.left &&
      pixelX <= bounds.right &&
      pixelY >= bounds.top &&
      pixelY <= bounds.bottom
    ) {
      return object;
    }
  }

  return null;
}

function selectObject(objectId) {
  state.selectedObjectId = objectId;

  state.objects.forEach((object) => {
    object.selected = object.id === objectId;
  });

  updateInspector();
  updateSelectedObjectData();
  renderArena();
}

function setupCanvasInteraction() {
  const canvas = DOM["simulation-canvas"];

  if (!canvas) return;

  canvas.addEventListener("pointerdown", (event) => {
    const coordinates = getCanvasCoordinates(event);
    const object = findObjectAtPosition(coordinates.x, coordinates.y);

    if (!object) {
      selectObject(null);
      return;
    }

    selectObject(object.id);

    if (object.isStatic || state.isRunning) return;

    dragState.active = true;
    dragState.objectId = object.id;
    dragState.offsetX = object.x - pixelsToMeters(coordinates.x);

    canvas.setPointerCapture(event.pointerId);
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!dragState.active) return;

    const object = getObjectById(dragState.objectId);
    if (!object) return;

    const coordinates = getCanvasCoordinates(event);

    object.x = pixelsToMeters(coordinates.x) + dragState.offsetX;
    object.x = clamp(object.x, 0.5, 14);

    updateInspector();
    updateSelectedObjectData();
    renderArena();
  });

  const stopDragging = (event) => {
    if (!dragState.active) return;

    dragState.active = false;
    dragState.objectId = null;

    try {
      canvas.releasePointerCapture(event.pointerId);
    } catch (error) {
      // Pointer capture mungkin sudah dilepas browser.
    }
  };

  canvas.addEventListener("pointerup", stopDragging);
  canvas.addEventListener("pointercancel", stopDragging);
  canvas.addEventListener("pointerleave", (event) => {
    if (event.buttons === 0) stopDragging(event);
  });
}

// ============================================================
// 14. INSPECTOR SYSTEM
// ============================================================

function updateInspector() {
  const object = getObjectById(state.selectedObjectId);

  if (!object) {
    DOM["inspector-empty"]?.classList.remove("hidden");
    DOM["object-inspector"]?.classList.add("hidden");
    return;
  }

  DOM["inspector-empty"]?.classList.add("hidden");
  DOM["object-inspector"]?.classList.remove("hidden");

  DOM["inspector-object-image"].src = object.image;
  DOM["inspector-object-image"].alt = object.name;
  DOM["inspector-object-name"].textContent = object.name;
  DOM["inspector-object-id"].textContent = object.id;

  DOM["object-mass"].value = object.mass;
  DOM["object-mass"].disabled = object.isStatic;

  DOM["object-position"].value = formatNumber(object.x);
  DOM["object-velocity"].value = formatNumber(object.v);
  DOM["object-direction"].value = String(object.direction);
  DOM["object-restitution"].value = object.restitution;
  DOM["object-restitution"].disabled = object.isStatic;
}

function applyObjectProperties() {
  const object = getObjectById(state.selectedObjectId);

  if (!object) {
    showNotification("Pilih objek terlebih dahulu.");
    return;
  }

  if (!object.isStatic) {
    object.mass = clamp(
      safeNumber(DOM["object-mass"].value, object.mass),
      0.01,
      1000
    );

    object.v = clamp(
      Math.abs(safeNumber(DOM["object-velocity"].value, object.v)),
      0,
      100
    );

    object.direction =
      Number(DOM["object-direction"].value) === -1 ? -1 : 1;

    object.restitution = clamp(
      safeNumber(
        DOM["object-restitution"].value,
        object.restitution
      ),
      0,
      1
    );
  }

  object.x = clamp(
    safeNumber(DOM["object-position"].value, object.x),
    0.5,
    14
  );

  object.initialState = {
    x: object.x,
    v: object.v,
    direction: object.direction
  };

  updateAllUI();
  renderArena();
  showNotification("Parameter objek berhasil diterapkan.", "success");
  playSound(800, 0.08);
}

function deleteSelectedObject() {
  const object = getObjectById(state.selectedObjectId);

  if (!object) {
    showNotification("Tidak ada objek yang dipilih.");
    return;
  }

  removeObject(object.id);
  showNotification(`${object.name} telah dihapus.`);
}

function setupInspector() {
  DOM["apply-object-properties"]?.addEventListener(
    "click",
    applyObjectProperties
  );

  DOM["delete-selected-object"]?.addEventListener(
    "click",
    deleteSelectedObject
  );

  [
    "object-mass",
    "object-position",
    "object-velocity",
    "object-direction",
    "object-restitution"
  ].forEach((id) => {
    DOM[id]?.addEventListener("change", () => {
      if (!state.selectedObjectId) return;
    });
  });
}

// ============================================================
// 15. SIMULATION CONTROLS
// ============================================================

function setupSimulationControls() {
  DOM["run-simulation-button"]?.addEventListener("click", runSimulation);
  DOM["pause-simulation-button"]?.addEventListener("click", pauseSimulation);
  DOM["step-simulation-button"]?.addEventListener("click", stepSimulation);
  DOM["stop-simulation-button"]?.addEventListener("click", stopSimulation);

  DOM["reset-arena-button"]?.addEventListener("click", resetArena);
  DOM["clear-arena-button"]?.addEventListener("click", clearArena);

  DOM["grid-toggle"]?.addEventListener("click", () => {
    state.gridVisible = !state.gridVisible;
    renderArena();
  });

  DOM["vector-toggle"]?.addEventListener("click", () => {
    state.vectorsVisible = !state.vectorsVisible;
    renderArena();
  });

  DOM["simulation-speed"]?.addEventListener("change", (event) => {
    state.simulationSpeed = clamp(
      safeNumber(event.target.value, 1),
      0.1,
      10
    );
  });

  DOM["collision-type"]?.addEventListener("change", (event) => {
    state.collisionType = event.target.value;
  });

  DOM["wall-collision-toggle"]?.addEventListener("change", (event) => {
    state.wallCollisionEnabled = event.target.checked;
  });
}

// ============================================================
// 16. LIVE DATA SYSTEM
// ============================================================

function updateLiveMeasurements() {
  const dynamicObjects = getDynamicObjects();

  const totalMomentum = calculateTotalMomentum(dynamicObjects);
  const totalEnergy = calculateTotalEnergy(dynamicObjects);

  if (DOM["live-total-momentum"]) {
    DOM["live-total-momentum"].textContent = formatNumber(totalMomentum);
  }

  if (DOM["live-total-energy"]) {
    DOM["live-total-energy"].textContent = formatNumber(totalEnergy);
  }

  if (DOM["live-system-impulse"]) {
    DOM["live-system-impulse"].textContent =
      formatNumber(totalMomentum);
  }

  if (DOM["live-simulation-time"]) {
    DOM["live-simulation-time"].textContent =
      formatNumber(state.simulationTime);
  }

  updateSelectedObjectData();
}

function updateSelectedObjectData() {
  const object = getObjectById(state.selectedObjectId);

  if (!object) {
    if (DOM["selected-object-momentum"]) {
      DOM["selected-object-momentum"].textContent = "0.00 kg·m/s";
    }

    if (DOM["selected-object-energy"]) {
      DOM["selected-object-energy"].textContent = "0.00 J";
    }

    if (DOM["selected-object-current-velocity"]) {
      DOM["selected-object-current-velocity"].textContent = "0.00 m/s";
    }

    return;
  }

  DOM["selected-object-momentum"].textContent =
    `${formatNumber(calculateMomentum(object))} kg·m/s`;

  DOM["selected-object-energy"].textContent =
    `${formatNumber(calculateKineticEnergy(object))} J`;

  DOM["selected-object-current-velocity"].textContent =
    `${formatNumber(getSignedVelocity(object))} m/s`;
}

// ============================================================
// 17. TRIAL RECORD SYSTEM
// ============================================================

function createTrialSnapshot() {
  const objects = state.objects.map((object) => ({
    id: object.id,
    name: object.name,
    type: object.type,
    mass: object.mass,
    position: object.x,
    velocity: getSignedVelocity(object),
    restitution: object.restitution,
    isStatic: object.isStatic
  }));

  const momentumAfter = calculateTotalMomentum();
  const energyAfter = calculateTotalEnergy();

  return {
    id: `TRIAL-${String(state.trials.length + 1).padStart(3, "0")}`,
    timestamp: new Date().toLocaleString("id-ID"),
    mode: state.mode,
    challenge:
      state.mode === "guided"
        ? CHALLENGES[state.challengeIndex].title
        : "Free Investigation",

    collisionType: state.collisionType,
    simulationTime: state.simulationTime,

    momentumBefore: momentumAfter,
    momentumAfter,
    momentumDifference: 0,

    energyBefore: energyAfter,
    energyAfter,
    energyChange: 0,

    impulse: 0,
    objects
  };
}

function saveTrial() {
  if (state.objects.length === 0) {
    showNotification("Tambahkan objek sebelum menyimpan eksperimen.");
    return;
  }

  const trial = createTrialSnapshot();

  state.trials.push(trial);

  renderReport();
  showNotification(`${trial.id} berhasil disimpan.`, "success");
  playSound(900, 0.12);
}

function deleteTrial(trialId) {
  state.trials = state.trials.filter((trial) => trial.id !== trialId);
  renderReport();
}

function clearTrials() {
  state.trials = [];
  renderReport();
  showNotification("Seluruh data eksperimen telah dihapus.");
}

function setupTrialSystem() {
  DOM["save-trial-button"]?.addEventListener("click", saveTrial);

  DOM["reset-experiment-button"]?.addEventListener("click", resetExperiment);

  DOM["clear-trials-button"]?.addEventListener("click", () => {
    openConfirmation(
      "Hapus seluruh data?",
      "Semua catatan eksperimen akan dihapus.",
      clearTrials
    );
  });

  DOM["export-csv-button"]?.addEventListener("click", exportTrialsToCSV);
}

// ============================================================
// 18. REPORT SYSTEM
// ============================================================

function renderReport() {
  const trials = state.trials;

  DOM["report-total-trials"].textContent = trials.length;

  if (trials.length === 0) {
    DOM["report-momentum-before"].textContent = "0.00";
    DOM["report-momentum-after"].textContent = "0.00";
    DOM["report-momentum-difference"].textContent = "0.00";

    DOM["analysis-empty-state"]?.classList.remove("hidden");
    DOM["analysis-content"]?.classList.add("hidden");
    DOM["chart-empty-state"]?.classList.remove("hidden");

    renderTrialTable();
    drawReportChart();

    return;
  }

  const latest = trials.at(-1);

  DOM["report-momentum-before"].textContent =
    formatNumber(latest.momentumBefore);

  DOM["report-momentum-after"].textContent =
    formatNumber(latest.momentumAfter);

  DOM["report-momentum-difference"].textContent =
    formatNumber(latest.momentumDifference);

  DOM["analysis-empty-state"]?.classList.add("hidden");
  DOM["analysis-content"]?.classList.remove("hidden");
  DOM["chart-empty-state"]?.classList.add("hidden");

  updateAnalysis(latest);
  renderTrialTable();
  drawReportChart();
}

function renderTrialTable() {
  const tbody = DOM["trial-table-body"];

  if (!tbody) return;

  tbody.innerHTML = "";

  if (state.trials.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td colspan="7">Belum ada data eksperimen.</td>
    `;
    tbody.appendChild(row);
    return;
  }

  state.trials.forEach((trial) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${trial.id}</td>
      <td>${trial.mode}</td>
      <td>${trial.collisionType}</td>
      <td>${formatNumber(trial.momentumBefore)}</td>
      <td>${formatNumber(trial.momentumAfter)}</td>
      <td>${formatNumber(trial.momentumDifference)}</td>
      <td>
        <button
          class="small-button danger delete-trial-button"
          data-trial-id="${trial.id}"
          type="button">
          DELETE
        </button>
      </td>
    `;

    tbody.appendChild(row);
  });

  tbody.querySelectorAll(".delete-trial-button").forEach((button) => {
    button.addEventListener("click", () => {
      deleteTrial(button.dataset.trialId);
    });
  });
}

function updateAnalysis(trial) {
  const difference = Math.abs(trial.momentumDifference);

  DOM["analysis-momentum-status"].textContent =
    difference < 0.01 ? "Approximately conserved" : "Changed";

  DOM["analysis-difference-value"].textContent =
    `${formatNumber(trial.momentumDifference)} kg·m/s`;

  DOM["analysis-collision-status"].textContent =
    trial.collisionType;

  DOM["analysis-energy-change"].textContent =
    `${formatNumber(trial.energyChange)} J`;

  DOM["analysis-conclusion-text"].textContent =
    "Analisis awal menunjukkan perbandingan momentum sebelum dan sesudah eksperimen. Gunakan data hasil percobaan untuk menyusun kesimpulan ilmiah.";
}

function drawReportChart() {
  const canvas = DOM["report-chart"];
  const context = DOM.chartContext;

  if (!canvas || !context) return;

  context.clearRect(0, 0, canvas.width, canvas.height);

  if (state.trials.length === 0) return;

  const selector = DOM["chart-data-selector"]?.value || "momentum";

  const chartData = state.trials.map((trial, index) => {
    let before = trial.momentumBefore;
    let after = trial.momentumAfter;

    if (selector === "energy") {
      before = trial.energyBefore;
      after = trial.energyAfter;
    }

    if (selector === "impulse") {
      before = 0;
      after = trial.impulse;
    }

    return {
      index: index + 1,
      before,
      after
    };
  });

  const padding = 65;
  const chartWidth = canvas.width - padding * 2;
  const chartHeight = canvas.height - padding * 2;

  const values = chartData.flatMap((item) => [item.before, item.after]);
  const maximum = Math.max(...values, 1);
  const minimum = Math.min(...values, 0);
  const range = maximum - minimum || 1;

  context.strokeStyle = "rgba(140, 200, 255, 0.3)";
  context.lineWidth = 1;

  context.beginPath();
  context.moveTo(padding, padding);
  context.lineTo(padding, canvas.height - padding);
  context.lineTo(canvas.width - padding, canvas.height - padding);
  context.stroke();

  context.font = "13px Inter, sans-serif";
  context.fillStyle = CONFIG.colors.text;

  chartData.forEach((item, index) => {
    const x =
      padding +
      (index + 0.5) * (chartWidth / chartData.length);

    const barWidth = Math.min(
      35,
      chartWidth / chartData.length / 3
    );

    const beforeHeight =
      ((item.before - minimum) / range) * chartHeight;

    const afterHeight =
      ((item.after - minimum) / range) * chartHeight;

    const baseY = canvas.height - padding;

    context.fillStyle = CONFIG.colors.blue;
    context.fillRect(
      x - barWidth - 3,
      baseY - beforeHeight,
      barWidth,
      beforeHeight
    );

    context.fillStyle = CONFIG.colors.cyan;
    context.fillRect(
      x + 3,
      baseY - afterHeight,
      barWidth,
      afterHeight
    );

    context.fillStyle = CONFIG.colors.text;
    context.textAlign = "center";
    context.fillText(`T${item.index}`, x, canvas.height - 25);
  });

  context.textAlign = "left";

  context.fillStyle = CONFIG.colors.blue;
  context.fillRect(canvas.width - 220, 25, 15, 15);
  context.fillStyle = CONFIG.colors.text;
  context.fillText("Before", canvas.width - 198, 38);

  context.fillStyle = CONFIG.colors.cyan;
  context.fillRect(canvas.width - 110, 25, 15, 15);
  context.fillStyle = CONFIG.colors.text;
  context.fillText("After", canvas.width - 88, 38);
}

function setupReportSystem() {
  DOM["chart-data-selector"]?.addEventListener("change", drawReportChart);
}

// ============================================================
// 19. CSV EXPORT
// ============================================================

function exportTrialsToCSV() {
  if (state.trials.length === 0) {
    showNotification("Belum ada data untuk diekspor.");
    return;
  }

  const header = [
    "Trial",
    "Tanggal",
    "Mode",
    "Challenge",
    "Jenis Tumbukan",
    "Waktu Simulasi",
    "Momentum Sebelum",
    "Momentum Sesudah",
    "Perubahan Momentum",
    "Energi Sebelum",
    "Energi Sesudah",
    "Perubahan Energi"
  ];

  const rows = state.trials.map((trial) => [
    trial.id,
    trial.timestamp,
    trial.mode,
    trial.challenge,
    trial.collisionType,
    trial.simulationTime,
    trial.momentumBefore,
    trial.momentumAfter,
    trial.momentumDifference,
    trial.energyBefore,
    trial.energyAfter,
    trial.energyChange
  ]);

  const csv = [
    header,
    ...rows
  ]
    .map((row) => row.map(escapeCSV).join(","))
    .join("\n");

  const blob = new Blob(["\ufeff" + csv], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "physics-forensics-trials.csv";
  link.click();

  URL.revokeObjectURL(url);

  showNotification("Data berhasil diekspor ke CSV.", "success");
}

// ============================================================
// 20. MODAL SYSTEM
// ============================================================

function openModal(modalId) {
  document.getElementById(modalId)?.classList.remove("hidden");
}

function closeModal(modalId) {
  document.getElementById(modalId)?.classList.add("hidden");
}

function openConfirmation(title, message, callback) {
  state.pendingConfirmation = callback;

  DOM["confirmation-title"].textContent = title;
  DOM["confirmation-message"].textContent = message;

  openModal("confirmation-modal");
}

function setupModalSystem() {
  DOM.closeModalButtons.forEach((button) => {
    button.addEventListener("click", () => {
      closeModal(button.dataset.closeModal);
    });
  });

  DOM["cancel-confirmation-button"]?.addEventListener("click", () => {
    state.pendingConfirmation = null;
    closeModal("confirmation-modal");
  });

  DOM["confirm-action-button"]?.addEventListener("click", () => {
    if (typeof state.pendingConfirmation === "function") {
      state.pendingConfirmation();
    }

    state.pendingConfirmation = null;
    closeModal("confirmation-modal");
  });

  DOM["help-button"]?.addEventListener("click", () => {
    openModal("help-modal");
  });

  DOM["sound-toggle"]?.addEventListener("click", () => {
    state.soundEnabled = !state.soundEnabled;

    DOM["sound-toggle"].textContent = state.soundEnabled
      ? "🔊"
      : "🔇";

    if (state.soundEnabled) playSound(700, 0.08);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal("help-modal");
      closeModal("confirmation-modal");
    }
  });
}

// ============================================================
// 21. GLOBAL UI UPDATE
// ============================================================

function updateAllUI() {
  updateInspector();
  updateSelectedObjectData();
  updateLiveMeasurements();
  updateSimulationButtons();
  updateArenaOverlay();
  updateEmptyArenaState();
}

// ============================================================
// 22. INITIALIZATION
// ============================================================

function initializeApplication() {
  setupSceneNavigation();
  setupModeSystem();
  setupObjectToolbox();
  setupCanvasInteraction();
  setupInspector();
  setupSimulationControls();
  setupTrialSystem();
  setupReportSystem();
  setupModalSystem();

  updateChallengeUI();
  setMode("guided");
  updateAllUI();
  renderArena();
  renderReport();

  console.log("Physics Forensics Virtual Lab berhasil diinisialisasi.");
}

function startApplication() {
  cacheDOM();
  initializeLoadingScreen();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startApplication);
} else {
  startApplication();
}
