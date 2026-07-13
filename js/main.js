/* =========================================================
   main.js
   Velocity Runner: Rise of Bharat

   Integrated stable version:
   - Fixes black game screen
   - Uses standard Three.js rendering
   - Correct camera and renderer setup
   - Keeps canvas behind the game interface
   - Supports pause without hiding the scene
   - Handles startup, restart and home navigation
   - Supports keyboard and mobile controls
   - Integrates player, enemies, combat and power-ups
========================================================= */


/* =========================================================
   MAIN LOCAL STATE
========================================================= */

var isGameStarting = false;

var touchStartX = 0;
var touchStartY = 0;
var touchStartTime = 0;
var lastTapTime = 0;

/*
 * Old neon decoration is temporarily disabled.
 * It will be replaced with a cleaner realistic city.
 */

var ENABLE_LEGACY_NEON_DECOR =
  false;

/*
 * Keep weather disabled while establishing
 * the bright stylized-realistic environment.
 */

var ENABLE_RAIN_EFFECT =
  false;


/* =========================================================
   SAFE CONFIGURATION HELPERS
========================================================= */

function getConfiguredStartSpeed() {
  if (
    typeof START_SPEED === "number" &&
    Number.isFinite(START_SPEED)
  ) {
    return START_SPEED;
  }

  return 0.34;
}


function getConfiguredGravity() {
  if (
    typeof GRAVITY === "number" &&
    Number.isFinite(GRAVITY)
  ) {
    return GRAVITY;
  }

  return -0.035;
}


function getBossDistanceGap() {
  if (
    typeof BOSS_DISTANCE_GAP === "number" &&
    Number.isFinite(BOSS_DISTANCE_GAP)
  ) {
    return BOSS_DISTANCE_GAP;
  }

  return 1000;
}


/* =========================================================
   DIFFICULTY LABEL
========================================================= */

function getMainDifficultyLabel(level) {
  if (
    typeof getDifficultyLabel ===
    "function"
  ) {
    return getDifficultyLabel(level);
  }

  if (level === "easy") {
    return "Easy Runner";
  }

  if (level === "hard") {
    return "Hard Legend";
  }

  return "Normal Warrior";
}


/* =========================================================
   APPLY DIFFICULTY
========================================================= */

function applyDifficultySettings() {
  var baseSpeed =
    getConfiguredStartSpeed();

  if (selectedDifficulty === "easy") {
    difficultySettings = {
      startSpeed: baseSpeed * 0.88,
      maximumSpeed: baseSpeed * 2.15,
      obstacleMultiplier: 0.78,
      droneAttackMultiplier: 0.75,
      bossAttackMultiplier: 0.8
    };
  } else if (
    selectedDifficulty === "hard"
  ) {
    difficultySettings = {
      startSpeed: baseSpeed * 1.12,
      maximumSpeed: baseSpeed * 2.8,
      obstacleMultiplier: 1.28,
      droneAttackMultiplier: 1.35,
      bossAttackMultiplier: 1.3
    };
  } else {
    difficultySettings = {
      startSpeed: baseSpeed,
      maximumSpeed: baseSpeed * 2.45,
      obstacleMultiplier: 1,
      droneAttackMultiplier: 1,
      bossAttackMultiplier: 1
    };
  }

  speed =
    difficultySettings.startSpeed;

  gravity =
    getConfiguredGravity();
}


/* =========================================================
   START BUTTON VALIDATION
========================================================= */

function updateStartButtonState() {
  if (
    !startBtn ||
    !runnerNameInput ||
    !difficultySelect
  ) {
    return;
  }

  var hasRunnerName =
    runnerNameInput.value
      .trim()
      .length > 0;

  var hasDifficulty =
    difficultySelect.value !== "";

  startBtn.disabled =
    !(
      hasRunnerName &&
      hasDifficulty
    );
}


/* =========================================================
   RESET GAME STATE
========================================================= */

function resetGameState() {
  gameRunning = false;
  gamePaused = false;
  gameOver = false;

  currentLane = 1;

  playerY = 1;
  velocityY = 0;

  gravity =
    getConfiguredGravity();

  isJumping = false;
  isSliding = false;
  slideTimer = 0;

  distance = 0;
  shards = 0;

  coreHealth = 100;
  shieldActive = false;
  invincibleTimer = 0;

  speed =
    difficultySettings.startSpeed;

  shootCooldown = 0;
  messageTimer = 0;

  spawnTimer = 65;
  shardTimer = 30;
  powerUpTimer = 360;

  droneAlive = true;
  droneRespawnTimer = 0;
  droneShootTimer = 130;
  dronesDestroyed = 0;

  bossActive = false;
  bossHealth = bossMaxHealth;
  bossAttackTimer = 90;

  nextBossDistance =
    getBossDistanceGap();

  obstacles = [];
  shardItems = [];
  powerUps = [];

  bullets = [];
  explosions = [];
  empShots = [];
  bossLasers = [];

  roadTiles = [];
  buildings = [];
  rainDrops = [];

  player = null;
  suryaCore = null;
  drone = null;
  boss = null;

  roadGroup = null;
  obstacleGroup = null;
  shardGroup = null;
  cityGroup = null;
  rainGroup = null;
  bulletGroup = null;
  empGroup = null;

  if (pauseBtn) {
    pauseBtn.textContent = "Pause";
  }

  if (abilityText) {
    abilityText.textContent =
      "Surya Dash Ready";
  }

  if (missionText) {
    missionText.textContent =
      "Protect the Surya Core";
  }

  if (gameLeaderboardCard) {
    gameLeaderboardCard.classList.add(
      "leaderboard-hidden"
    );
  }
   if (
  typeof resetBalanceState ===
  "function"
) {
  resetBalanceState();
}
   if (
  typeof resetMissionSystem ===
  "function"
) {
  resetMissionSystem();
}

  updateCoreHealth();
  updateShieldStatus();
  updateShootButton();
  updateBossUI();
  updateHUD();
}


/* =========================================================
   DISPOSE PREVIOUS THREE.JS SCENE
========================================================= */

function disposeCurrentScene() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }

  if (scene) {
    scene.traverse(function (object) {
      if (object.geometry) {
        object.geometry.dispose();
      }

      if (object.material) {
        if (
          Array.isArray(
            object.material
          )
        ) {
          object.material.forEach(
            function (material) {
              disposeMainMaterial(
                material
              );
            }
          );
        } else {
          disposeMainMaterial(
            object.material
          );
        }
      }
    });

    while (
      scene.children.length > 0
    ) {
      scene.remove(
        scene.children[0]
      );
    }
  }

  if (renderer) {
    renderer.dispose();
  }

  scene = null;
  camera = null;
  renderer = null;

  if (
    typeof composer !== "undefined"
  ) {
    composer = null;
  }

  if (
    typeof bloomPass !== "undefined"
  ) {
    bloomPass = null;
  }
}


function disposeMainMaterial(material) {
  if (!material) {
    return;
  }

  if (material.map) {
    material.map.dispose();
  }

  if (material.alphaMap) {
    material.alphaMap.dispose();
  }

  if (material.normalMap) {
    material.normalMap.dispose();
  }

  if (material.emissiveMap) {
    material.emissiveMap.dispose();
  }

  material.dispose();
}


/* =========================================================
   FORCE CORRECT GAME LAYERING
========================================================= */

function ensureGameScreenLayering() {
  if (!gameScreen) {
    return;
  }

  gameScreen.style.position =
    "relative";

  gameScreen.style.overflow =
    "hidden";

  var canvas =
    document.getElementById(
      "gameCanvas"
    );

  if (canvas) {
    canvas.style.position =
      "absolute";

    canvas.style.inset = "0";

    canvas.style.width = "100%";
    canvas.style.height = "100%";

    canvas.style.display = "block";

    canvas.style.zIndex = "0";

    canvas.style.pointerEvents =
      "auto";
  }

  var interfaceElements =
    gameScreen.querySelectorAll(
      [
        ".hud",
        ".ability",
        ".mission",
        ".boss-ui",
        ".mission-panel",
        ".mission-toast",
        ".leaderboard-card",
        "button"
      ].join(", ")
    );

  interfaceElements.forEach(
    function (element) {
      var computedPosition =
        window
          .getComputedStyle(element)
          .position;

      /*
       * z-index does not reliably work on
       * position: static elements.
       */

      if (
        computedPosition ===
        "static"
      ) {
        element.style.position =
          "relative";
      }

      element.style.zIndex = "20";
    }
  );

  var overlay =
    document.getElementById(
      "damageOverlay"
    );

  if (overlay) {
    overlay.style.position =
      "absolute";

    overlay.style.inset = "0";

    overlay.style.zIndex = "30";

    overlay.style.pointerEvents =
      "none";
  }
}


/* =========================================================
   INITIALIZE THREE.JS
========================================================= */

function initThree() {
  var canvas =
    document.getElementById(
      "gameCanvas"
    );

  if (!canvas) {
    throw new Error(
      "gameCanvas was not found in index.html."
    );
  }

  if (
    typeof THREE === "undefined"
  ) {
    throw new Error(
      "Three.js is not loading."
    );
  }

  ensureGameScreenLayering();

  scene =
    new THREE.Scene();

  /*
   * Warm atmospheric clear colour.
   * The sky dome in effects.js renders above it.
   */

  scene.background =
    new THREE.Color(
      0x91a9bd
    );

  /*
   * Natural atmospheric perspective.
   */

  scene.fog =
    new THREE.Fog(
      0x9aa4a8,
      52,
      235
    );

  camera =
    new THREE.PerspectiveCamera(
      56,

      window.innerWidth /
      window.innerHeight,

      0.1,
      450
    );

  camera.position.set(
    0,
    5.25,
    9.4
  );

  camera.lookAt(
    0,
    1.45,
    -14
  );

  var mobileDevice =
    window.innerWidth <= 720;

  renderer =
    new THREE.WebGLRenderer({
      canvas: canvas,

      antialias:
        !mobileDevice,

      alpha: false,

      powerPreference:
        "high-performance"
    });

  renderer.setSize(
    window.innerWidth,
    window.innerHeight,
    false
  );

  renderer.setPixelRatio(
    Math.min(
      window.devicePixelRatio || 1,

      mobileDevice
        ? 1.25
        : 1.6
    )
  );

  renderer.setClearColor(
    0x91a9bd,
    1
  );

  renderer.shadowMap.enabled =
    true;

  renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;

  renderer.shadowMap.autoUpdate =
    true;

  if (
    typeof THREE.ACESFilmicToneMapping !==
    "undefined"
  ) {
    renderer.toneMapping =
      THREE.ACESFilmicToneMapping;

    renderer.toneMappingExposure =
      0.92;
  }

  if (
    typeof THREE.sRGBEncoding !==
    "undefined"
  ) {
    renderer.outputEncoding =
      THREE.sRGBEncoding;
  }

  if (
    "physicallyCorrectLights" in
    renderer
  ) {
    renderer.physicallyCorrectLights =
      true;
  }

  createMainLighting();

  createMainGroups();

  createMainWorld();

  if (
    typeof initPostProcessing ===
    "function"
  ) {
    initPostProcessing();
  }

  onResize();

  console.log(
    "Velocity Runner realistic scene initialized:",
    scene.children.length,
    "scene objects"
  );
}
/* =========================================================
   LIGHTING
========================================================= */

function createMainLighting() {
  /*
   * Low ambient light preserves shape and shadows.
   */

  var ambientLight =
    new THREE.AmbientLight(
      0xffffff,
      0.24
    );

  scene.add(
    ambientLight
  );


  /*
   * Soft sky and warm ground illumination.
   */

  var hemisphereLight =
    new THREE.HemisphereLight(
      0xb9dcff,
      0x6a4a36,
      0.82
    );

  scene.add(
    hemisphereLight
  );


  /*
   * Main warm sunlight.
   */

  var sunlight =
    new THREE.DirectionalLight(
      0xffd4a8,
      1.7
    );

  sunlight.position.set(
    -18,
    28,
    14
  );

  sunlight.castShadow =
    true;

  var shadowResolution =
    window.innerWidth <= 720
      ? 1024
      : 2048;

  sunlight.shadow.mapSize.set(
    shadowResolution,
    shadowResolution
  );

  sunlight.shadow.camera.left =
    -13;

  sunlight.shadow.camera.right =
    13;

  sunlight.shadow.camera.top =
    15;

  sunlight.shadow.camera.bottom =
    -5;

  sunlight.shadow.camera.near =
    1;

  sunlight.shadow.camera.far =
    90;

  sunlight.shadow.bias =
    -0.00035;

  sunlight.shadow.normalBias =
    0.035;

  sunlight.shadow.radius =
    3;

  sunlight.target.position.set(
    0,
    0,
    -32
  );

  scene.add(
    sunlight
  );

  scene.add(
    sunlight.target
  );


  /*
   * Soft cool fill light prevents completely
   * black shadows without producing neon glare.
   */

  var coolFill =
    new THREE.DirectionalLight(
      0xa8c8e8,
      0.34
    );

  coolFill.position.set(
    14,
    10,
    6
  );

  coolFill.target.position.set(
    0,
    1,
    -20
  );

  scene.add(
    coolFill
  );

  scene.add(
    coolFill.target
  );


  /*
   * Warm horizon rim light.
   */

  var horizonFill =
    new THREE.DirectionalLight(
      0xffb878,
      0.22
    );

  horizonFill.position.set(
    -8,
    6,
    -45
  );

  horizonFill.target.position.set(
    0,
    3,
    -15
  );

  scene.add(
    horizonFill
  );

  scene.add(
    horizonFill.target
  );
}

/* =========================================================
   CREATE GAME GROUPS
========================================================= */

function createMainGroups() {
  roadGroup = new THREE.Group();
  obstacleGroup = new THREE.Group();
  shardGroup = new THREE.Group();
  cityGroup = new THREE.Group();
  rainGroup = new THREE.Group();
  bulletGroup = new THREE.Group();
  empGroup = new THREE.Group();

  scene.add(
    roadGroup,
    obstacleGroup,
    shardGroup,
    cityGroup,
    rainGroup,
    bulletGroup,
    empGroup
  );
}


/* =========================================================
   CREATE GAME WORLD
========================================================= */
function createMainWorld() {
  /*
   * Environment first.
   */

  if (
    typeof createRoad ===
    "function"
  ) {
    createRoad();
  }

  if (
    typeof createCity ===
    "function"
  ) {
    createCity();
  }

  if (
    ENABLE_RAIN_EFFECT &&
    typeof createRain ===
    "function"
  ) {
    createRain();
  }


  /*
   * Gameplay characters and enemies.
   */

  if (
    typeof createPlayer ===
    "function"
  ) {
    createPlayer();
  }

  if (
    typeof createDrone ===
    "function"
  ) {
    createDrone();
  }

  if (
    typeof createBoss ===
    "function"
  ) {
    createBoss();
  }

  if (
    typeof upgradeDroneVisuals ===
    "function"
  ) {
    upgradeDroneVisuals();
  }

  if (
    typeof upgradeBossVisuals ===
    "function"
  ) {
    upgradeBossVisuals();
  }


  /*
   * Do not load the old overlapping neon
   * decoration in realistic mode.
   */

  if (
    ENABLE_LEGACY_NEON_DECOR
  ) {
    if (
      typeof createSkySymbols ===
      "function"
    ) {
      createSkySymbols();
    }

    if (
      typeof createNeoAryavartaVisuals ===
      "function"
    ) {
      createNeoAryavartaVisuals();
    }
  }
}
/* =========================================================
   BEGIN A NEW RUN
========================================================= */

function beginRun() {
  if (isGameStarting) {
    return;
  }

  isGameStarting = true;

  try {
    gameRunning = false;

    disposeCurrentScene();

    applyDifficultySettings();

    resetGameState();

    showScreen(gameScreen);

    ensureGameScreenLayering();

    initThree();

    gameRunning = true;
    gamePaused = false;
    gameOver = false;

    if (runnerNameText) {
      runnerNameText.textContent =
        runnerName;
    }

    if (difficultyText) {
      difficultyText.textContent =
        getMainDifficultyLabel(
          selectedDifficulty
        );
    }

    if (highScoreText) {
      highScoreText.textContent =
        highScore;
    }

    onResize();

    if (
      typeof startAmbientAudio ===
      "function" &&
      !gameAudioMuted
    ) {
      startAmbientAudio();
    }

    animate();
  } catch (error) {
    gameRunning = false;

    console.error(
      "Velocity Runner startup failed:",
      error
    );

    alert(
      "The game could not start. Open the browser Console to view the exact error."
    );

    showScreen(homeScreen);
  } finally {
    isGameStarting = false;
  }
}


/* =========================================================
   START GAME BUTTON
========================================================= */

function startGame() {
  /*
   * Confirm that Three.js loaded correctly
   * before trying to start the game.
   */

  if (typeof THREE === "undefined") {
    alert(
      "Three.js is not loading.\n" +
      "Check the Three.js CDN links in index.html."
    );

    return;
  }

  /*
   * Confirm that the required form elements
   * exist in index.html.
   */

  if (
    !runnerNameInput ||
    !difficultySelect
  ) {
    console.error(
      "Runner name input or difficulty selector was not found."
    );

    return;
  }

  /*
   * Read and validate the player's details.
   */

  var enteredName =
    runnerNameInput.value.trim();

  var enteredDifficulty =
    difficultySelect.value;

  if (!enteredName) {
    alert(
      "Please enter the runner name."
    );

    runnerNameInput.focus();
    return;
  }

  if (!enteredDifficulty) {
    alert(
      "Please select a difficulty."
    );

    difficultySelect.focus();
    return;
  }

  /*
   * Save the selected player details
   * before opening the tutorial.
   */

  runnerName = enteredName;

  selectedDifficulty =
    enteredDifficulty;

  /*
   * Phase 2C tutorial integration:
   *
   * First-time player:
   * tutorial opens, then beginRun() executes.
   *
   * Returning player:
   * beginRun() executes immediately.
   *
   * Fallback:
   * if tutorial.js failed to load,
   * the game still starts normally.
   */

  if (
    typeof startGameWithTutorial ===
    "function"
  ) {
    startGameWithTutorial(
      function () {
        beginRun();
      }
    );
  } else {
    console.warn(
      "Tutorial system is unavailable. Starting the game directly."
    );

    beginRun();
  }
}
/* =========================================================
   RESTART GAME
========================================================= */

function restartGame() {
  if (runnerNameInput) {
    runnerNameInput.value =
      runnerName;
  }

  if (difficultySelect) {
    difficultySelect.value =
      selectedDifficulty;
  }

  beginRun();
}


/* =========================================================
   PAUSE AND RESUME
========================================================= */

function togglePauseGame() {
  if (
    !gameRunning ||
    gameOver
  ) {
    return;
  }

  gamePaused = !gamePaused;

  if (pauseBtn) {
    pauseBtn.textContent =
      gamePaused
        ? "Resume"
        : "Pause";
  }

  if (gamePaused) {
    if (missionText) {
      missionText.textContent =
        "Game Paused";
    }

    if (
      typeof stopAmbientAudio ===
      "function"
    ) {
      stopAmbientAudio();
    }
  } else {
    if (missionText) {
      missionText.textContent =
        "Protect the Surya Core";
    }

    if (
      typeof startAmbientAudio ===
      "function" &&
      !gameAudioMuted
    ) {
      startAmbientAudio();
    }
  }
}


/* =========================================================
   RETURN HOME
========================================================= */

function returnHome() {
  gameRunning = false;
  gamePaused = false;
  gameOver = false;

  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }

  if (
    typeof stopAmbientAudio ===
    "function"
  ) {
    stopAmbientAudio();
  }

  disposeCurrentScene();

  showScreen(homeScreen);

  updateStartButtonState();
}

/* =========================================================
   GAME-OVER MISSION SUMMARY
========================================================= */

function renderGameOverMissionSummary() {
  var summaryCard =
    document.getElementById(
      "gameOverMissionSummary"
    );

  var completedText =
    document.getElementById(
      "finalMissionsCompleted"
    );

  var bonusText =
    document.getElementById(
      "finalMissionBonus"
    );

  var statusText =
    document.getElementById(
      "missionSummaryStatus"
    );

  var summary = {
    completed: 0,
    total: 0,
    bonusShards: 0
  };

  if (
    typeof getMissionSummary ===
    "function"
  ) {
    var missionSummary =
      getMissionSummary();

    if (missionSummary) {
      summary.completed =
        Number.isFinite(
          missionSummary.completed
        )
          ? missionSummary.completed
          : 0;

      summary.total =
        Number.isFinite(
          missionSummary.total
        )
          ? missionSummary.total
          : 0;

      summary.bonusShards =
        Number.isFinite(
          missionSummary.bonusShards
        )
          ? missionSummary.bonusShards
          : 0;
    }
  }

  summary.completed =
    Math.max(
      0,
      Math.floor(
        summary.completed
      )
    );

  summary.total =
    Math.max(
      0,
      Math.floor(
        summary.total
      )
    );

  summary.bonusShards =
    Math.max(
      0,
      Math.floor(
        summary.bonusShards
      )
    );

  if (completedText) {
    completedText.textContent =
      summary.completed +
      " / " +
      summary.total;
  }

  if (bonusText) {
    bonusText.textContent =
      summary.bonusShards +
      " ✦";
  }

  var perfectRun =
    summary.total > 0 &&
    summary.completed >=
      summary.total;

  if (summaryCard) {
    summaryCard.classList.toggle(
      "perfect-run",
      perfectRun
    );
  }

  if (statusText) {
    if (perfectRun) {
      statusText.textContent =
        "Perfect mission run";
    } else if (
      summary.completed > 0
    ) {
      statusText.textContent =
        summary.completed +
        " objective" +
        (
          summary.completed === 1
            ? ""
            : "s"
        ) +
        " secured";
    } else {
      statusText.textContent =
        "No objectives completed";
    }
  }
}

/* =========================================================
   END GAME
========================================================= */

function endGame() {
  /*
   * Prevent endGame() from running more
   * than once for the same run.
   */

  if (
    typeof gameOver !== "undefined" &&
    gameOver
  ) {
    return;
  }


  /* =====================================================
     FINALIZE MISSIONS
  ===================================================== */

  var finalMissionSummary = null;

  try {
    /*
     * finalizeMissionSystem() should be used
     * when it exists because it performs one
     * final mission-progress calculation.
     */

    if (
      typeof finalizeMissionSystem ===
      "function"
    ) {
      finalMissionSummary =
        finalizeMissionSystem();
    } else if (
      typeof updateMissionSystem ===
      "function"
    ) {
      /*
       * Safe fallback when the newer
       * finalizeMissionSystem() function has
       * not yet been added to missions.js.
       */

      updateMissionSystem();

      if (
        typeof getMissionSummary ===
        "function"
      ) {
        finalMissionSummary =
          getMissionSummary();
      }
    }
  } catch (missionError) {
    console.warn(
      "Final mission processing failed:",
      missionError
    );
  }


  /* =====================================================
     STOP THE ACTIVE RUN
  ===================================================== */

  gameOver = true;
  gameRunning = false;
  gamePaused = false;

  if (
    typeof animationId !== "undefined" &&
    animationId
  ) {
    cancelAnimationFrame(
      animationId
    );

    animationId = null;
  }


  /* =====================================================
     STOP GAME AUDIO
  ===================================================== */

  if (
    typeof stopAmbientAudio ===
    "function"
  ) {
    stopAmbientAudio();
  }


  /* =====================================================
     CLOSE IN-GAME PANELS
  ===================================================== */

  if (
    typeof closeMissionPanel ===
    "function"
  ) {
    closeMissionPanel();
  }

  var inGameLeaderboard =
    document.getElementById(
      "gameLeaderboardCard"
    );

  if (inGameLeaderboard) {
    inGameLeaderboard.classList.add(
      "leaderboard-hidden"
    );
  }

  /*
   * Remove any mission toast that could
   * remain visible over the Game Over screen.
   */

  if (
    typeof hideMissionToast ===
    "function"
  ) {
    hideMissionToast(true);
  }


  /* =====================================================
     PLAY GAME-OVER SOUND
  ===================================================== */

  if (
    typeof playGameOverSound ===
    "function"
  ) {
    try {
      playGameOverSound();
    } catch (soundError) {
      console.warn(
        "Game-over sound failed:",
        soundError
      );
    }
  }


  /* =====================================================
     CALCULATE FINAL RESULTS
  ===================================================== */

  var safeDistance =
    (
      typeof distance === "number" &&
      Number.isFinite(distance)
    )
      ? distance
      : 0;

  var safeShards =
    (
      typeof shards === "number" &&
      Number.isFinite(shards)
    )
      ? shards
      : 0;

  /*
   * Calculate shards only after mission
   * finalization because the last completed
   * mission may add a reward.
   */

  var finalDistance =
    Math.max(
      0,
      Math.floor(
        safeDistance
      )
    );

  var finalShardCount =
    Math.max(
      0,
      Math.floor(
        safeShards
      )
    );

  var finalRunnerName =
    (
      typeof runnerName ===
        "string" &&
      runnerName.trim()
    )
      ? runnerName.trim()
      : "Aarav Astra";

  var finalDifficulty =
    (
      typeof selectedDifficulty ===
        "string" &&
      selectedDifficulty
    )
      ? selectedDifficulty
      : "normal";


  /* =====================================================
     UPDATE HIGH SCORE
  ===================================================== */

  if (
    typeof highScore !== "number" ||
    !Number.isFinite(highScore)
  ) {
    highScore = 0;
  }

  if (
    finalDistance > highScore
  ) {
    highScore =
      finalDistance;

    try {
      localStorage.setItem(
        "velocityRunnerHighScore",
        String(highScore)
      );
    } catch (storageError) {
      console.warn(
        "High score could not be saved:",
        storageError
      );
    }
  }


  /* =====================================================
     SAVE LEADERBOARD SCORE
  ===================================================== */

  if (
    typeof saveScoreToLeaderboard ===
    "function"
  ) {
    try {
      saveScoreToLeaderboard(
        finalDistance,
        finalShardCount,
        finalRunnerName,
        finalDifficulty
      );
    } catch (leaderboardError) {
      console.warn(
        "Leaderboard score could not be saved:",
        leaderboardError
      );
    }
  }


  /* =====================================================
     UPDATE GAME-OVER VALUES
  ===================================================== */

  var finalDistanceElement =
    document.getElementById(
      "finalDistance"
    );

  var finalShardsElement =
    document.getElementById(
      "finalShards"
    );

  var finalDifficultyElement =
    document.getElementById(
      "finalDifficulty"
    );

  var highScoreElement =
    document.getElementById(
      "highScore"
    );

  if (finalDistanceElement) {
    finalDistanceElement.textContent =
      String(finalDistance);
  }

  if (finalShardsElement) {
    finalShardsElement.textContent =
      String(finalShardCount);
  }

  if (finalDifficultyElement) {
    finalDifficultyElement.textContent =
      getMainDifficultyLabel(
        finalDifficulty
      );
  }

  if (highScoreElement) {
    highScoreElement.textContent =
      String(highScore);
  }


  /* =====================================================
     UPDATE MISSION SUMMARY
  ===================================================== */

  if (
    typeof renderGameOverMissionSummary ===
    "function"
  ) {
    try {
      renderGameOverMissionSummary();
    } catch (summaryError) {
      console.warn(
        "Mission summary could not be rendered:",
        summaryError
      );
    }
  } else {
    /*
     * Built-in fallback in case the separate
     * renderGameOverMissionSummary() function
     * has not yet been added to main.js.
     */

    if (
      !finalMissionSummary &&
      typeof getMissionSummary ===
        "function"
    ) {
      try {
        finalMissionSummary =
          getMissionSummary();
      } catch (summaryReadError) {
        console.warn(
          "Mission summary could not be read:",
          summaryReadError
        );
      }
    }

    if (!finalMissionSummary) {
      finalMissionSummary = {
        completed: 0,
        total: 0,
        bonusShards: 0
      };
    }

    var completedMissions =
      Number.isFinite(
        finalMissionSummary.completed
      )
        ? Math.max(
            0,
            Math.floor(
              finalMissionSummary.completed
            )
          )
        : 0;

    var totalMissions =
      Number.isFinite(
        finalMissionSummary.total
      )
        ? Math.max(
            0,
            Math.floor(
              finalMissionSummary.total
            )
          )
        : 0;

    var missionBonus =
      Number.isFinite(
        finalMissionSummary.bonusShards
      )
        ? Math.max(
            0,
            Math.floor(
              finalMissionSummary.bonusShards
            )
          )
        : 0;

    var completedElement =
      document.getElementById(
        "finalMissionsCompleted"
      );

    var bonusElement =
      document.getElementById(
        "finalMissionBonus"
      );

    var statusElement =
      document.getElementById(
        "missionSummaryStatus"
      );

    var summaryCard =
      document.getElementById(
        "gameOverMissionSummary"
      );

    if (completedElement) {
      completedElement.textContent =
        completedMissions +
        " / " +
        totalMissions;
    }

    if (bonusElement) {
      bonusElement.textContent =
        missionBonus + " ✦";
    }

    var perfectRun =
      totalMissions > 0 &&
      completedMissions >=
        totalMissions;

    if (summaryCard) {
      summaryCard.classList.toggle(
        "perfect-run",
        perfectRun
      );
    }

    if (statusElement) {
      if (perfectRun) {
        statusElement.textContent =
          "Perfect mission run";
      } else if (
        completedMissions > 0
      ) {
        statusElement.textContent =
          completedMissions +
          " objective" +
          (
            completedMissions === 1
              ? ""
              : "s"
          ) +
          " secured";
      } else {
        statusElement.textContent =
          "No objectives completed";
      }
    }
  }


  /* =====================================================
     REFRESH LEADERBOARDS
  ===================================================== */

  if (
    typeof renderLeaderboards ===
    "function"
  ) {
    try {
      renderLeaderboards();
    } catch (renderError) {
      console.warn(
        "Leaderboards could not be rendered:",
        renderError
      );
    }
  }


  /* =====================================================
     OPEN GAME-OVER SCREEN
  ===================================================== */

  var gameOverTarget =
    document.getElementById(
      "gameOverScreen"
    );

  if (
    typeof showScreen ===
      "function" &&
    gameOverTarget
  ) {
    showScreen(
      gameOverTarget
    );
  } else if (gameOverTarget) {
    /*
     * Emergency fallback when showScreen()
     * is unavailable.
     */

    var allScreens =
      document.querySelectorAll(
        ".screen"
      );

    allScreens.forEach(
      function (screen) {
        screen.classList.remove(
          "active"
        );
      }
    );

    gameOverTarget.classList.add(
      "active"
    );
  } else {
    console.error(
      "gameOverScreen was not found in index.html."
    );
  }
}
/* =========================================================
   UPDATE HUD
========================================================= */

function updateHUD() {
  if (distanceText) {
    distanceText.textContent =
      Math.floor(distance);
  }

  if (shardsText) {
    shardsText.textContent =
      Math.floor(shards);
  }

  if (highScoreText) {
    highScoreText.textContent =
      highScore;
  }

  if (runnerNameText) {
    runnerNameText.textContent =
      runnerName;
  }

  if (difficultyText) {
    difficultyText.textContent =
      getMainDifficultyLabel(
        selectedDifficulty
      );
  }
}


/* =========================================================
   SPAWN GAME OBJECTS
========================================================= */

function updateSpawnTimers() {
  spawnTimer--;
  shardTimer--;
  powerUpTimer--;

  if (
    typeof updateBalanceFrame ===
    "function"
  ) {
    updateBalanceFrame();
  }


  /* =====================================================
     OBSTACLE SPAWNING
  ===================================================== */

  if (spawnTimer <= 0) {
    if (
      typeof spawnObstacle ===
      "function"
    ) {
      spawnObstacle();
    }

    if (
      typeof getBalancedObstacleInterval ===
      "function"
    ) {
      spawnTimer =
        getBalancedObstacleInterval();
    } else {
      spawnTimer = 75;
    }
  }


  /* =====================================================
     SURYA SHARD SPAWNING
  ===================================================== */

  if (shardTimer <= 0) {
    if (
      typeof spawnShard ===
      "function"
    ) {
      spawnShard();
    }

    if (
      typeof getBalancedShardInterval ===
      "function"
    ) {
      shardTimer =
        getBalancedShardInterval();
    } else {
      shardTimer = 42;
    }
  }


  /* =====================================================
     POWER-UP SPAWNING
  ===================================================== */

  var forcePowerUp =
    typeof shouldForcePowerUpSpawn ===
      "function" &&
    shouldForcePowerUpSpawn();

  if (
    powerUpTimer <= 0 ||
    forcePowerUp
  ) {
    if (
      typeof spawnPowerUp ===
      "function"
    ) {
      spawnPowerUp();
    }

    if (
      typeof registerPowerUpSpawn ===
      "function"
    ) {
      registerPowerUpSpawn();
    }

    if (
      typeof getBalancedPowerUpInterval ===
      "function"
    ) {
      powerUpTimer =
        getBalancedPowerUpInterval();
    } else {
      powerUpTimer = 390;
    }
  }
}
/* =========================================================
   UPDATE GAME
========================================================= */

function updateGame() {
  if (
    !gameRunning ||
    gamePaused ||
    gameOver
  ) {
    return;
  }

  var maximumSpeed =
    difficultySettings
      .maximumSpeed ||
    getConfiguredStartSpeed() *
      2.4;

  speed =
    Math.min(
      maximumSpeed,
      speed + 0.000018
    );

  distance +=
    speed * 0.62;

  if (shootCooldown > 0) {
    shootCooldown--;

    if (shootCooldown === 0) {
      updateShootButton();
    }
  }

  updateSpawnTimers();

  if (
    !bossActive &&
    distance >=
      nextBossDistance &&
    typeof startBossEvent ===
      "function"
  ) {
    startBossEvent();
  }

  if (
    typeof updatePlayer ===
    "function"
  ) {
    updatePlayer();
  }

  if (
    typeof updateDrone ===
    "function"
  ) {
    updateDrone();
  }

  if (
    typeof updateBoss ===
    "function"
  ) {
    updateBoss();
  }

  if (
    typeof updateObstacles ===
    "function"
  ) {
    updateObstacles();
  }

  if (
    typeof updateShards ===
    "function"
  ) {
    updateShards();
  }

  if (
    typeof updatePowerUps ===
    "function"
  ) {
    updatePowerUps();
  }

  if (
    typeof updateBullets ===
    "function"
  ) {
    updateBullets();
  }

  if (
    typeof updateEMPShots ===
    "function"
  ) {
    updateEMPShots();
  }

  if (
    typeof updateExplosions ===
    "function"
  ) {
    updateExplosions();
  }

  if (
    typeof updateMovingWorld ===
    "function"
  ) {
    updateMovingWorld();
  }

  if (
    typeof updateNeoAryavartaVisuals ===
    "function"
  ) {
    updateNeoAryavartaVisuals();
  }

  if (
    typeof updateEnemyVisuals ===
    "function"
  ) {
    updateEnemyVisuals();
  }

  if (
    typeof updateCinematicCamera ===
    "function"
  ) {
    updateCinematicCamera();
  }

  if (messageTimer > 0) {
    messageTimer--;
  } else if (
    missionText &&
    missionText.textContent !==
      "Protect the Surya Core"
  ) {
    missionText.textContent =
      "Protect the Surya Core";
  }

  updateHUD();

if (
  typeof updateMissionSystem ===
  "function"
) {
  updateMissionSystem();
}
}


/* =========================================================
   ANIMATION LOOP
========================================================= */

function animate() {
  if (
    !gameRunning ||
    gameOver
  ) {
    return;
  }

  animationId =
    requestAnimationFrame(
      animate
    );

  if (!gamePaused) {
    updateGame();
  }

  /*
    Rendering remains active while paused so the scene
    does not disappear or become black.
  */

  if (
    typeof renderGameFrame ===
    "function"
  ) {
    renderGameFrame();
  } else if (
    renderer &&
    scene &&
    camera
  ) {
    renderer.render(
      scene,
      camera
    );
  }
}


/* =========================================================
   RESIZE
========================================================= */

function onResize() {
  if (
    !camera ||
    !renderer
  ) {
    return;
  }

  var width =
    window.innerWidth;

  var height =
    window.innerHeight;

  if (
    gameScreen &&
    gameScreen.classList.contains(
      "active"
    )
  ) {
    var bounds =
      gameScreen.getBoundingClientRect();

    if (bounds.width > 0) {
      width = bounds.width;
    }

    if (bounds.height > 0) {
      height = bounds.height;
    }
  }

  width =
    Math.max(1, width);

  height =
    Math.max(1, height);

  camera.aspect =
    width / height;

  camera.updateProjectionMatrix();

  renderer.setSize(
    width,
    height,
    false
  );

  renderer.setPixelRatio(
    Math.min(
      window.devicePixelRatio || 1,
      2
    )
  );

  if (
    typeof resizePostProcessing ===
    "function"
  ) {
    resizePostProcessing();
  }
}

/* =========================================================
   KEYBOARD CONTROLS
========================================================= */

function isTextInputActive(target) {
  if (!target) {
    return false;
  }

  var tagName =
    target.tagName
      ? target.tagName.toLowerCase()
      : "";

  return (
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    target.isContentEditable
  );
}


function isTutorialCurrentlyOpen() {
  var tutorialOverlay =
    document.getElementById(
      "tutorialOverlay"
    );

  return Boolean(
    tutorialOverlay &&
    tutorialOverlay.classList.contains(
      "is-visible"
    )
  );
}


function handleKeyDown(event) {
  /*
   * Do not activate game controls while the
   * player is typing their name or selecting
   * the difficulty.
   */

  if (
    isTextInputActive(event.target)
  ) {
    return;
  }

  /*
   * tutorial.js controls the keyboard while
   * the tutorial overlay is visible.
   */

  if (
    isTutorialCurrentlyOpen()
  ) {
    return;
  }

  var key =
    event.key.toLowerCase();

  /*
   * Pause controls only work during an
   * active game.
   */

  if (
    key === "p" ||
    key === "escape"
  ) {
    if (
      gameRunning &&
      !gameOver
    ) {
      event.preventDefault();
      togglePauseGame();
    }

    return;
  }

  /*
   * Ignore movement controls unless a run
   * is currently active.
   */

  if (
    !gameRunning ||
    gamePaused ||
    gameOver
  ) {
    return;
  }

  var controlledKeys = [
    "arrowleft",
    "arrowright",
    "arrowup",
    "arrowdown",
    " ",
    "shift",
    "a",
    "d",
    "w",
    "s",
    "f"
  ];

  if (
    controlledKeys.includes(key)
  ) {
    event.preventDefault();
  }

  /*
   * Prevent repeated movement, jump, slide,
   * and dash commands while a key is held.
   *
   * Shooting may repeat because its cooldown
   * is handled by the combat system.
   */

  if (
    event.repeat &&
    key !== "f"
  ) {
    return;
  }

  if (
    key === "arrowleft" ||
    key === "a"
  ) {
    if (
      typeof moveLeft === "function"
    ) {
      moveLeft();
    }
  } else if (
    key === "arrowright" ||
    key === "d"
  ) {
    if (
      typeof moveRight === "function"
    ) {
      moveRight();
    }
  } else if (
    key === "arrowup" ||
    key === "w" ||
    key === " "
  ) {
    if (
      typeof jump === "function"
    ) {
      jump();
    }
  } else if (
    key === "arrowdown" ||
    key === "s"
  ) {
    if (
      typeof slide === "function"
    ) {
      slide();
    }
  } else if (
    key === "shift"
  ) {
    if (
      typeof dash === "function"
    ) {
      dash();
    }
  } else if (
    key === "f"
  ) {
    if (
      typeof shoot === "function"
    ) {
      shoot();
    }
  }
}

/* =========================================================
   MOBILE TOUCH CONTROLS
========================================================= */

function isInteractiveTouchTarget(target) {
  if (
    !target ||
    typeof target.closest !==
      "function"
  ) {
    return false;
  }

  return Boolean(
    target.closest(
      [
        "button",
        "input",
        "select",
        "textarea",
        "a",
        "[role='button']",
        ".leaderboard-card",
        ".mission-panel"
      ].join(", ")
    )
  );
}


function handleTouchStart(event) {
  if (
    !gameRunning ||
    gamePaused ||
    gameOver
  ) {
    touchStartTime = 0;
    return;
  }

  /*
   * Do not interpret button presses as
   * swipe or double-tap gestures.
   */

  if (
    isInteractiveTouchTarget(
      event.target
    )
  ) {
    touchStartTime = 0;
    return;
  }

  if (
    !event.touches ||
    !event.touches.length
  ) {
    touchStartTime = 0;
    return;
  }

  touchStartX =
    event.touches[0].clientX;

  touchStartY =
    event.touches[0].clientY;

  touchStartTime =
    Date.now();
}


function handleTouchEnd(event) {
  if (
    !gameRunning ||
    gamePaused ||
    gameOver
  ) {
    touchStartTime = 0;
    return;
  }

  if (
    isInteractiveTouchTarget(
      event.target
    )
  ) {
    touchStartTime = 0;
    return;
  }

  /*
   * Ignore touchend when no valid gameplay
   * touchstart was registered.
   */

  if (!touchStartTime) {
    return;
  }

  if (
    !event.changedTouches ||
    !event.changedTouches.length
  ) {
    touchStartTime = 0;
    return;
  }

  var touchEndX =
    event.changedTouches[0].clientX;

  var touchEndY =
    event.changedTouches[0].clientY;

  var differenceX =
    touchEndX - touchStartX;

  var differenceY =
    touchEndY - touchStartY;

  var absoluteX =
    Math.abs(differenceX);

  var absoluteY =
    Math.abs(differenceY);

  var gestureDistance =
    Math.max(
      absoluteX,
      absoluteY
    );

  var gestureDuration =
    Date.now() - touchStartTime;

  touchStartTime = 0;

  /*
   * A swipe must cover at least 38 pixels
   * and finish within 800 milliseconds.
   */

  if (
    gestureDistance > 38 &&
    gestureDuration < 800
  ) {
    event.preventDefault();

    if (absoluteX > absoluteY) {
      if (differenceX > 0) {
        if (
          typeof moveRight ===
          "function"
        ) {
          moveRight();
        }
      } else if (
        typeof moveLeft ===
        "function"
      ) {
        moveLeft();
      }
    } else if (
      differenceY < 0
    ) {
      if (
        typeof jump === "function"
      ) {
        jump();
      }
    } else if (
      typeof slide === "function"
    ) {
      slide();
    }

    return;
  }

  /*
   * Two short taps activate Surya Dash.
   */

  if (
    gestureDistance <= 20 &&
    gestureDuration < 350
  ) {
    var currentTapTime =
      Date.now();

    if (
      currentTapTime -
        lastTapTime <
      320
    ) {
      if (
        typeof dash === "function"
      ) {
        dash();
      }

      lastTapTime = 0;
    } else {
      lastTapTime =
        currentTapTime;
    }
  }
}
/* =========================================================
   SETUP MAIN CONTROLS
========================================================= */

function setupMainControls() {
  if (
    startBtn &&
    !startBtn.dataset.mainReady
  ) {
    startBtn.dataset.mainReady =
      "true";

    startBtn.addEventListener(
      "click",
      startGame
    );
  }

  if (
    restartBtn &&
    !restartBtn.dataset.mainReady
  ) {
    restartBtn.dataset.mainReady =
      "true";

    restartBtn.addEventListener(
      "click",
      restartGame
    );
  }

  if (
    homeBtn &&
    !homeBtn.dataset.mainReady
  ) {
    homeBtn.dataset.mainReady =
      "true";

    homeBtn.addEventListener(
      "click",
      returnHome
    );
  }

  if (
    pauseBtn &&
    !pauseBtn.dataset.mainReady
  ) {
    pauseBtn.dataset.mainReady =
      "true";

    pauseBtn.addEventListener(
      "click",
      togglePauseGame
    );
  }

  if (
    shootBtn &&
    !shootBtn.dataset.mainReady
  ) {
    shootBtn.dataset.mainReady =
      "true";

    shootBtn.addEventListener(
      "click",
      shoot
    );
  }

  if (
    runnerNameInput &&
    !runnerNameInput.dataset
      .mainReady
  ) {
    runnerNameInput.dataset
      .mainReady = "true";

    runnerNameInput.addEventListener(
      "input",
      updateStartButtonState
    );

    runnerNameInput.addEventListener(
      "keydown",
      function (event) {
        if (
          event.key === "Enter" &&
          startBtn &&
          !startBtn.disabled
        ) {
          startGame();
        }
      }
    );
  }

  if (
    difficultySelect &&
    !difficultySelect.dataset
      .mainReady
  ) {
    difficultySelect.dataset
      .mainReady = "true";

    difficultySelect.addEventListener(
      "change",
      updateStartButtonState
    );
  }

  if (
    !document.body.dataset
      .velocityKeyboardReady
  ) {
    document.body.dataset
      .velocityKeyboardReady =
      "true";

    window.addEventListener(
      "keydown",
      handleKeyDown,
      {
        passive: false
      }
    );

    window.addEventListener(
      "resize",
      onResize
    );
  }

  if (
    gameScreen &&
    !gameScreen.dataset
      .velocityTouchReady
  ) {
    gameScreen.dataset
      .velocityTouchReady =
      "true";

    gameScreen.addEventListener(
      "touchstart",
      handleTouchStart,
      {
        passive: true
      }
    );

    gameScreen.addEventListener(
      "touchend",
      handleTouchEnd,
      {
        passive: false
      }
    );
  }
}


/* =========================================================
   INITIALIZE PAGE
========================================================= */

function initializeVelocityRunner() {
  setupMainControls();

  updateStartButtonState();

  updateHUD();

  if (
    typeof updateCoreHealth ===
    "function"
  ) {
    updateCoreHealth();
  }

  if (
    typeof updateShieldStatus ===
    "function"
  ) {
    updateShieldStatus();
  }

  if (
    typeof updateShootButton ===
    "function"
  ) {
    updateShootButton();
  }

  if (
    typeof renderLeaderboards ===
    "function"
  ) {
    renderLeaderboards();
  }

  if (
    typeof setupLeaderboardControls ===
      "function" &&
    !window
      .velocityLeaderboardControlsReady
  ) {
    setupLeaderboardControls();

    window
      .velocityLeaderboardControlsReady =
      true;
  }

   if (
  typeof setupMissionControls ===
  "function"
) {
  setupMissionControls();
}

if (
  typeof resetMissionSystem ===
  "function"
) {
  resetMissionSystem();
}
  showScreen(homeScreen);

  console.log(
    "Velocity Runner initialized successfully."
  );
}


/* =========================================================
   RUN INITIALIZATION
========================================================= */

if (
  document.readyState ===
  "loading"
) {
  document.addEventListener(
    "DOMContentLoaded",
    initializeVelocityRunner
  );
} else {
  initializeVelocityRunner();
}
