/* main.js
   Game initialization, update loop, controls
*/

function applyDifficultySettings(level) {
  if (level === "easy") {
    difficultySettings = {
      startSpeed: 0.27,
      obstacleMultiplier: 0.75,
      droneAttackMultiplier: 0.8,
      bossAttackMultiplier: 0.85
    };
  } else if (level === "hard") {
    difficultySettings = {
      startSpeed: 0.43,
      obstacleMultiplier: 1.35,
      droneAttackMultiplier: 1.35,
      bossAttackMultiplier: 1.35
    };
  } else {
    difficultySettings = {
      startSpeed: START_SPEED,
      obstacleMultiplier: 1,
      droneAttackMultiplier: 1,
      bossAttackMultiplier: 1
    };
  }
}

function startGame() {
  if (typeof THREE === "undefined") {
    alert(
      "Three.js is not loading.\nCheck the Three.js CDN in index.html."
    );

    return;
  }

  const enteredName = runnerNameInput ? runnerNameInput.value.trim() : "";

  if (enteredName === "") {
    alert("Please enter your runner name before starting the game.");

    if (runnerNameInput) {
      runnerNameInput.focus();
    }

    return;
  }

  const difficultyValue = difficultySelect ? difficultySelect.value : "";

  if (difficultyValue === "") {
    alert("Please select difficulty before starting the game.");

    if (difficultySelect) {
      difficultySelect.focus();
    }

    return;
  }

  runnerName = enteredName;
  selectedDifficulty = difficultyValue;
  applyDifficultySettings(selectedDifficulty);

  if (runnerNameText) {
    runnerNameText.textContent = runnerName;
  }
   if (difficultyText) {
  difficultyText.textContent = getDifficultyLabel(selectedDifficulty);
}

  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }

  showScreen(gameScreen);

  distance = 0;
  shards = 0;
  speed = difficultySettings.startSpeed;

  coreHealth = 100;
  invincibleTimer = 0;
  shieldActive = false;

  currentLane = 1;
  playerY = 1;
  velocityY = 0;
  isJumping = false;
  isSliding = false;
  slideTimer = 0;

  gameRunning = true;
  gamePaused = false;
  gameOver = false;

  obstacles = [];
  shardItems = [];
  roadTiles = [];
  buildings = [];
  rainDrops = [];
  bullets = [];
  explosions = [];
  empShots = [];
  bossLasers = [];
  powerUps = [];

  spawnTimer = 0;
  shardTimer = 0;
  powerUpTimer = 0;

  droneAlive = true;
  droneRespawnTimer = 0;
  dronesDestroyed = 0;
  droneShootTimer = 130;

  bossActive = false;
  bossHealth = 100;
  bossMaxHealth = 100;
  nextBossDistance = BOSS_DISTANCE_GAP;
  bossAttackTimer = 90;

  shootCooldown = 0;
  messageTimer = 0;

  updateShootButton();
  updateCoreHealth();
  updateShieldStatus();
  updateBossUI();

  initThree();
  animate();
}

window.startGame = startGame;

function initThree() {
  const canvas = document.getElementById("gameCanvas");

  if (!canvas) {
    alert("gameCanvas not found in index.html.");
    return;
  }

  if (renderer) {
    renderer.dispose();
  }

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x02030a);
  scene.fog = new THREE.FogExp2(0x061025, 0.01);

  camera = new THREE.PerspectiveCamera(
    68,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  camera.position.set(0, 5.2, 9.2);
  camera.lookAt(0, 0.45, -13);

  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;

  const ambient = new THREE.AmbientLight(0x9feaff, 0.95);
scene.add(ambient);

const bharatGlow = new THREE.HemisphereLight(0x00eaff, 0xffaa00, 0.95);
scene.add(bharatGlow);

const mainLight = new THREE.DirectionalLight(0xffffff, 1.05);
mainLight.position.set(5, 12, 8);
mainLight.castShadow = true;
scene.add(mainLight);

const cyanLight = new THREE.PointLight(0x00f5ff, 1.4, 40);
cyanLight.position.set(-5, 5, -8);
scene.add(cyanLight);

const goldLight = new THREE.PointLight(0xffd166, 1.2, 40);
goldLight.position.set(0, 5, -22);
scene.add(goldLight);

const purpleLight = new THREE.PointLight(0x8f2cff, 1.15, 40);
purpleLight.position.set(5, 5, -35);
scene.add(purpleLight);

  roadGroup = new THREE.Group();
  obstacleGroup = new THREE.Group();
  shardGroup = new THREE.Group();
  cityGroup = new THREE.Group();
  rainGroup = new THREE.Group();
  bulletGroup = new THREE.Group();
  empGroup = new THREE.Group();

  scene.add(roadGroup);
  scene.add(obstacleGroup);
  scene.add(shardGroup);
  scene.add(cityGroup);
  scene.add(rainGroup);
  scene.add(bulletGroup);
  scene.add(empGroup);

createRoad();
createPlayer();

createDrone();
createBoss();

/* Phase 1C enemy visual upgrades */
upgradeDroneVisuals();
upgradeBossVisuals();

createCity();
createRain();
createSkySymbols();

/* Phase 1 visual foundation */
createNeoAryavartaVisuals();
initPostProcessing();

  window.removeEventListener("resize", onResize);
  window.addEventListener("resize", onResize);
}

function updateGame() {
  if (!gameRunning || gamePaused || gameOver) return;

  distance += speed;
  speed += 0.00015;

  if (messageTimer > 0) {
    messageTimer--;
  }

  if (shootCooldown > 0) {
    shootCooldown--;
    updateShootButton();
  }

  if (distanceText) distanceText.textContent = Math.floor(distance);
  if (shardsText) shardsText.textContent = shards;

  updatePlayer();
updateDrone();
updateMovingWorld();
updateNeoAryavartaVisuals();

/* Animate upgraded drone and boss */
updateEnemyVisuals();

  spawnTimer++;
  shardTimer++;
  powerUpTimer++;

  const obstacleDelay = Math.max(
    38,
    (110 - distance / 80) / difficultySettings.obstacleMultiplier
  );

  if (spawnTimer > obstacleDelay) {
    spawnObstacle();
    spawnTimer = 0;
  }

  if (shardTimer > 28) {
    spawnShard();
    shardTimer = 0;
  }

  if (powerUpTimer > 420) {
    spawnPowerUp();
    powerUpTimer = 0;
  }

  if (!bossActive && distance >= nextBossDistance) {
    startBossEvent();
  }

  updateBoss();
  updateBullets();
  updateEMPShots();
  updateExplosions();
  updateObstacles();
  updateShards();
  updatePowerUps();
  updateMissionText();

  updateCinematicCamera();
}

function updateMissionText() {
  if (!missionText) return;
  if (messageTimer > 0) return;

  if (bossActive) {
    missionText.textContent = "Boss active: dodge lasers and shoot";
    return;
  }

  if (!droneAlive) return;

  if (droneShootTimer < 35) {
    missionText.textContent = "Warning: Drone EMP charging";
  } else if (Math.floor(distance) > 0 && Math.floor(distance) % 1000 < 4) {
    missionText.textContent = "Maharakshak Titan Signal Detected";
  } else if (Math.floor(distance) > 500 && Math.floor(distance) % 500 < 4) {
    missionText.textContent = "Trinetra Drone is learning your speed";
  } else {
    missionText.textContent = "Protect the Surya Core";
  }
}

function animate() {
  if (!gameRunning) return;

  animationId = requestAnimationFrame(animate);
   
  updateGame();
  renderGameFrame();
}

function endGame() {
  if (gameOver) return;

  gameOver = true;
  gameRunning = false;

  const finalDistance = Math.floor(distance);

  if (finalDistance > highScore) {
    highScore = finalDistance;
    localStorage.setItem("velocityRunnerHighScore", highScore);
  }

  if (player) {
    player.visible = true;
  }

  saveScoreToLeaderboard(finalDistance, shards, runnerName, selectedDifficulty);

if (finalDistanceText) finalDistanceText.textContent = finalDistance;
if (finalShardsText) finalShardsText.textContent = shards;
if (finalDifficultyText) {
  finalDifficultyText.textContent = getDifficultyLabel(selectedDifficulty);
}
if (highScoreText) highScoreText.textContent = highScore;

renderLeaderboards();
setupLeaderboardControls();

showScreen(gameOverScreen);
}

function goHome() {
  gameRunning = false;
  gamePaused = false;
  gameOver = false;

  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }

  renderLeaderboards();
  showScreen(homeScreen);
}

function togglePause() {
  if (!gameRunning || gameOver) return;

  gamePaused = !gamePaused;

  if (pauseBtn) {
    pauseBtn.textContent = gamePaused ? "Resume" : "Pause";
  }
}

function onResize() {
  if (!camera || !renderer) return;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio || 1, 2)
  );

  resizePostProcessing();
}

/* Controls */

document.addEventListener("keydown", function (e) {
  if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") moveLeft();
  if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") moveRight();
  if (e.key === "ArrowUp" || e.key === " " || e.key.toLowerCase() === "w") jump();
  if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") slide();
  if (e.key === "Shift") dash();
  if (e.key.toLowerCase() === "f") shoot();
});

let touchStartX = 0;
let touchStartY = 0;
let lastTap = 0;

document.addEventListener("touchstart", function (e) {
  const t = e.changedTouches[0];

  touchStartX = t.clientX;
  touchStartY = t.clientY;

  const now = Date.now();

  if (now - lastTap < 300) {
    dash();
  }

  lastTap = now;
});

document.addEventListener("touchend", function (e) {
  const t = e.changedTouches[0];
  const dx = t.clientX - touchStartX;
  const dy = t.clientY - touchStartY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 40) moveRight();
    if (dx < -40) moveLeft();
  } else {
    if (dy < -40) jump();
    if (dy > 40) slide();
  }
});

/* Start Button Validation */

function checkStartReady() {
  if (!runnerNameInput || !difficultySelect || !startBtn) return;

  const hasName = runnerNameInput.value.trim().length > 0;
  const hasDifficulty = difficultySelect.value !== "";

  startBtn.disabled = !(hasName && hasDifficulty);
  startBtn.classList.toggle("disabled", !(hasName && hasDifficulty));
}

if (runnerNameInput && difficultySelect && startBtn) {
  startBtn.disabled = true;
  startBtn.classList.add("disabled");

  runnerNameInput.addEventListener("input", checkStartReady);
  difficultySelect.addEventListener("change", checkStartReady);

  checkStartReady();
}

/* Button Events */

if (startBtn) {
  startBtn.addEventListener("click", startGame);
}

if (pauseBtn) {
  pauseBtn.addEventListener("click", togglePause);
}

if (restartBtn) {
  restartBtn.addEventListener("click", startGame);
}

if (homeBtn) {
  homeBtn.addEventListener("click", goHome);
}

if (shootBtn) {
  shootBtn.addEventListener("click", shoot);
}
renderLeaderboards();
