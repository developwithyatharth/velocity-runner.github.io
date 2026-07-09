/* ui.js
   Screens, HUD, buttons, mission text
*/

const homeScreen = document.getElementById("homeScreen");
const gameScreen = document.getElementById("gameScreen");
const gameOverScreen = document.getElementById("gameOverScreen");

const runnerNameInput = document.getElementById("runnerNameInput");
const difficultySelect = document.getElementById("difficultySelect");

const runnerNameText = document.getElementById("runnerName");
const distanceText = document.getElementById("distance");
const shardsText = document.getElementById("shards");
const highScoreText = document.getElementById("highScore");
const coreHealthText = document.getElementById("coreHealth");
const shieldStatusText = document.getElementById("shieldStatus");

const finalDistanceText = document.getElementById("finalDistance");
const finalShardsText = document.getElementById("finalShards");
const abilityText = document.getElementById("abilityText");
const missionText = document.getElementById("missionText");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");
const homeBtn = document.getElementById("homeBtn");
const shootBtn = document.getElementById("shootBtn");

const bossUI = document.getElementById("bossUI");
const bossHealthFill = document.getElementById("bossHealthFill");

if (highScoreText) {
  highScoreText.textContent = highScore;
}

function showScreen(screen) {
  if (!homeScreen || !gameScreen || !gameOverScreen) return;

  homeScreen.classList.remove("active");
  gameScreen.classList.remove("active");
  gameOverScreen.classList.remove("active");

  screen.classList.add("active");
}

function setMission(text, timer = 90) {
  if (!missionText) return;

  missionText.textContent = text;
  messageTimer = timer;
}

function updateShootButton() {
  if (!shootBtn) return;

  if (shootCooldown > 0) {
    shootBtn.textContent = "Cooling";
    shootBtn.classList.add("cooling");
  } else {
    shootBtn.textContent = "Shoot";
    shootBtn.classList.remove("cooling");
  }
}

function updateCoreHealth() {
  if (!coreHealthText) return;

  coreHealthText.textContent = coreHealth;

  const parent = coreHealthText.parentElement;

  if (parent) {
    parent.classList.toggle("core-danger", coreHealth <= 40);
  }
}

function updateShieldStatus() {
  if (!shieldStatusText) return;

  shieldStatusText.textContent = shieldActive ? "Active" : "Empty";
}

function updateBossUI() {
  if (!bossUI || !bossHealthFill) return;

  if (bossActive) {
    bossUI.classList.add("active");
    const percent = Math.max(0, bossHealth / bossMaxHealth) * 100;
    bossHealthFill.style.width = percent + "%";
  } else {
    bossUI.classList.remove("active");
  }
}
