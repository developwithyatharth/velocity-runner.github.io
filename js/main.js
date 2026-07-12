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
  }

  var interfaceElements =
    gameScreen.querySelectorAll(
      ".hud, .ability, .mission, .boss-ui, button, .leaderboard-card"
    );

  interfaceElements.forEach(
    function (element) {
      element.style.zIndex = "20";
    }
  );

  var overlay =
    document.getElementById(
      "damageOverlay"
    );

  if (overlay) {
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

  scene = new THREE.Scene();

  scene.background =
    new THREE.Color(0x020612);

  scene.fog =
    new THREE.Fog(
      0x020612,
      38,
      190
    );

  camera =
    new THREE.PerspectiveCamera(
      60,
      window.innerWidth /
        window.innerHeight,
      0.1,
      500
    );

  camera.position.set(
    0,
    4.8,
    8.5
  );

  camera.lookAt(
    0,
    1.3,
    -12
  );

  renderer =
    new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: false,
      powerPreference:
        "high-performance"
    });

  renderer.setClearColor(
    0x020612,
    1
  );

  renderer.setSize(
    window.innerWidth,
    window.innerHeight,
    false
  );

  renderer.setPixelRatio(
    Math.min(
      window.devicePixelRatio || 1,
      2
    )
  );

  renderer.shadowMap.enabled = true;

  renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;

  if (
    typeof THREE.ACESFilmicToneMapping !==
    "undefined"
  ) {
    renderer.toneMapping =
      THREE.ACESFilmicToneMapping;

    renderer.toneMappingExposure =
      1;
  }

  if (
    typeof THREE.sRGBEncoding !==
    "undefined"
  ) {
    renderer.outputEncoding =
      THREE.sRGBEncoding;
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
    "Velocity Runner scene initialized:",
    scene.children.length,
    "scene objects"
  );
}


/* =========================================================
   LIGHTING
========================================================= */

function createMainLighting() {
  var ambientLight =
    new THREE.AmbientLight(
      0xffffff,
      1.08
    );

  scene.add(ambientLight);

  var hemisphereLight =
    new THREE.HemisphereLight(
      0x63dfff,
      0x100c22,
      1
    );

  scene.add(hemisphereLight);

  var directionalLight =
    new THREE.DirectionalLight(
      0xffffff,
      1.15
    );

  directionalLight.position.set(
    5,
    12,
    8
  );

  directionalLight.castShadow =
    true;

  directionalLight.shadow.mapSize.set(
    1024,
    1024
  );

  scene.add(directionalLight);

  var cyanLight =
    new THREE.PointLight(
      0x00d9ef,
      1,
      48
    );

  cyanLight.position.set(
    -5,
    5,
    -12
  );

  scene.add(cyanLight);

  var goldLight =
    new THREE.PointLight(
      0xf2b544,
      0.9,
      48
    );

  goldLight.position.set(
    5,
    5,
    -28
  );

  scene.add(goldLight);

  var purpleLight =
    new THREE.PointLight(
      0x813fd1,
      0.75,
      42
    );

  purpleLight.position.set(
    0,
    7,
    -48
  );

  scene.add(purpleLight);
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
  if (
    typeof createRoad ===
    "function"
  ) {
    createRoad();
  }

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

  if (
    typeof createCity ===
    "function"
  ) {
    createCity();
  }

  if (
    typeof createRain ===
    "function"
  ) {
    createRain();
  }

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

function startGameWithTutorial(
  function () {
    startGame();
  }
); {
  if (
    typeof THREE === "undefined"
  ) {
    alert(
      "Three.js is not loading.\nCheck the Three.js CDN in index.html."
    );

    return;
  }

  if (
    !runnerNameInput ||
    !difficultySelect
  ) {
    console.error(
      "Runner name or difficulty input was not found."
    );

    return;
  }

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

  runnerName = enteredName;

  selectedDifficulty =
    enteredDifficulty;

  beginRun();
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
   END GAME
========================================================= */

function endGame() {
  if (gameOver) {
    return;
  }

  gameOver = true;
  gameRunning = false;
  gamePaused = false;

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

  if (
    typeof playGameOverSound ===
    "function"
  ) {
    playGameOverSound();
  }

  var finalDistance =
    Math.max(
      0,
      Math.floor(distance)
    );

  var finalShardCount =
    Math.max(
      0,
      Math.floor(shards)
    );

  if (finalDistance > highScore) {
    highScore = finalDistance;

    localStorage.setItem(
      "velocityRunnerHighScore",
      String(highScore)
    );
  }

  if (
    typeof saveScoreToLeaderboard ===
    "function"
  ) {
    saveScoreToLeaderboard(
      finalDistance,
      finalShardCount,
      runnerName,
      selectedDifficulty
    );
  }

  if (finalDistanceText) {
    finalDistanceText.textContent =
      finalDistance;
  }

  if (finalShardsText) {
    finalShardsText.textContent =
      finalShardCount;
  }

  if (finalDifficultyText) {
    finalDifficultyText.textContent =
      getMainDifficultyLabel(
        selectedDifficulty
      );
  }

  if (highScoreText) {
    highScoreText.textContent =
      highScore;
  }

  if (
    typeof renderLeaderboards ===
    "function"
  ) {
    renderLeaderboards();
  }

  showScreen(gameOverScreen);
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

function handleKeyDown(event) {
  var key =
    event.key.toLowerCase();

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
    "f",
    "p",
    "escape"
  ];

  if (
    controlledKeys.includes(key)
  ) {
    event.preventDefault();
  }

  if (
    key === "p" ||
    key === "escape"
  ) {
    togglePauseGame();
    return;
  }

  if (
    !gameRunning ||
    gamePaused ||
    gameOver
  ) {
    return;
  }

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
    moveLeft();
  } else if (
    key === "arrowright" ||
    key === "d"
  ) {
    moveRight();
  } else if (
    key === "arrowup" ||
    key === "w" ||
    key === " "
  ) {
    jump();
  } else if (
    key === "arrowdown" ||
    key === "s"
  ) {
    slide();
  } else if (
    key === "shift"
  ) {
    dash();
  } else if (
    key === "f"
  ) {
    shoot();
  }
}


/* =========================================================
   MOBILE TOUCH CONTROLS
========================================================= */

function handleTouchStart(event) {
  if (
    !gameRunning ||
    gamePaused ||
    gameOver
  ) {
    return;
  }

  if (!event.touches.length) {
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
    return;
  }

  if (!event.changedTouches.length) {
    return;
  }

  var touchEndX =
    event.changedTouches[0].clientX;

  var touchEndY =
    event.changedTouches[0].clientY;

  var differenceX =
    touchEndX -
    touchStartX;

  var differenceY =
    touchEndY -
    touchStartY;

  var absoluteX =
    Math.abs(differenceX);

  var absoluteY =
    Math.abs(differenceY);

  var gestureDistance =
    Math.max(
      absoluteX,
      absoluteY
    );

  if (gestureDistance > 38) {
    event.preventDefault();

    if (absoluteX > absoluteY) {
      if (differenceX > 0) {
        moveRight();
      } else {
        moveLeft();
      }
    } else if (
      differenceY < 0
    ) {
      jump();
    } else {
      slide();
    }

    return;
  }

  var currentTapTime =
    Date.now();

  if (
    currentTapTime -
      lastTapTime <
    320
  ) {
    dash();
    lastTapTime = 0;
  } else {
    lastTapTime =
      currentTapTime;
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
