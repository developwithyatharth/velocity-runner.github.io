/* =========================================================
   ui.js
   Velocity Runner: Rise of Bharat

   Features:
   - Screen controls
   - HUD elements
   - Surya Core health bar
   - Damage flash
   - Shield status
   - Boss health display
========================================================= */


/* =========================================================
   SCREENS
========================================================= */

const homeScreen =
  document.getElementById("homeScreen");

const gameScreen =
  document.getElementById("gameScreen");

const gameOverScreen =
  document.getElementById("gameOverScreen");


/* =========================================================
   PLAYER SETUP
========================================================= */

const runnerNameInput =
  document.getElementById("runnerNameInput");

const difficultySelect =
  document.getElementById("difficultySelect");


/* =========================================================
   HUD ELEMENTS
========================================================= */

const runnerNameText =
  document.getElementById("runnerName");

const distanceText =
  document.getElementById("distance");

const shardsText =
  document.getElementById("shards");

const highScoreText =
  document.getElementById("highScore");

const difficultyText =
  document.getElementById("difficultyText");

const coreHealthText =
  document.getElementById("coreHealth");

const coreHealthPanel =
  document.getElementById("coreHealthPanel");

const coreHealthFill =
  document.getElementById("coreHealthFill");

const shieldStatusText =
  document.getElementById("shieldStatus");

const damageOverlay =
  document.getElementById("damageOverlay");


/* =========================================================
   GAME-OVER ELEMENTS
========================================================= */

const finalDistanceText =
  document.getElementById("finalDistance");

const finalShardsText =
  document.getElementById("finalShards");

const finalDifficultyText =
  document.getElementById("finalDifficulty");


/* =========================================================
   GAME MESSAGES
========================================================= */

const abilityText =
  document.getElementById("abilityText");

const missionText =
  document.getElementById("missionText");


/* =========================================================
   BUTTONS
========================================================= */

const startBtn =
  document.getElementById("startBtn");

const pauseBtn =
  document.getElementById("pauseBtn");

const restartBtn =
  document.getElementById("restartBtn");

const homeBtn =
  document.getElementById("homeBtn");

const shootBtn =
  document.getElementById("shootBtn");


/* =========================================================
   BOSS UI
========================================================= */

const bossUI =
  document.getElementById("bossUI");

const bossHealthFill =
  document.getElementById("bossHealthFill");


/* =========================================================
   LEADERBOARDS
========================================================= */

const homeLeaderboard =
  document.getElementById("homeLeaderboard");

const gameOverLeaderboard =
  document.getElementById(
    "gameOverLeaderboard"
  );

const homeLeaderboardCard =
  document.getElementById(
    "homeLeaderboardCard"
  );

const gameOverLeaderboardCard =
  document.getElementById(
    "gameOverLeaderboardCard"
  );

const showHomeLeaderboardBtn =
  document.getElementById(
    "showHomeLeaderboardBtn"
  );

const showGameOverLeaderboardBtn =
  document.getElementById(
    "showGameOverLeaderboardBtn"
  );

const gameLeaderboard =
  document.getElementById(
    "gameLeaderboard"
  );

const gameLeaderboardCard =
  document.getElementById(
    "gameLeaderboardCard"
  );

const showGameLeaderboardBtn =
  document.getElementById(
    "showGameLeaderboardBtn"
  );

const closeGameLeaderboardBtn =
  document.getElementById(
    "closeGameLeaderboardBtn"
  );

const clearGameLeaderboardBtn =
  document.getElementById(
    "clearGameLeaderboardBtn"
  );


/* =========================================================
   INITIAL HUD VALUES
========================================================= */

if (highScoreText) {
  highScoreText.textContent =
    highScore;
}


/* =========================================================
   SCREEN CONTROL
========================================================= */

function showScreen(targetScreen) {
  const allScreens = [
    homeScreen,
    gameScreen,
    gameOverScreen
  ];

  allScreens.forEach(function (screen) {
    if (!screen) return;

    screen.classList.remove("active");
    screen.hidden = true;
    screen.style.display = "none";
    screen.style.zIndex = "0";
  });

  if (!targetScreen) return;

  targetScreen.hidden = false;
  targetScreen.classList.add("active");
  targetScreen.style.zIndex = "10";

  if (targetScreen === gameScreen) {
    targetScreen.style.display = "block";
  } else {
    targetScreen.style.display = "flex";
  }
}


/* =========================================================
   MISSION MESSAGE
========================================================= */

function setMission(
  text,
  timer = 90
) {
  if (!missionText) {
    return;
  }

  missionText.textContent = text;
  messageTimer = timer;
}


/* =========================================================
   SHOOT BUTTON
========================================================= */

function updateShootButton() {
  if (!shootBtn) {
    return;
  }

  if (shootCooldown > 0) {
    shootBtn.textContent = "Cooling";
    shootBtn.classList.add("cooling");
  } else {
    shootBtn.textContent = "Shoot";
    shootBtn.classList.remove(
      "cooling"
    );
  }
}


/* =========================================================
   SURYA CORE HEALTH
========================================================= */

function updateCoreHealth() {
  const safeHealth =
    Math.max(
      0,
      Math.min(100, coreHealth)
    );

  if (coreHealthText) {
    coreHealthText.textContent =
      safeHealth;
  }

  if (coreHealthFill) {
    coreHealthFill.style.width =
      safeHealth + "%";

    coreHealthFill.classList.remove(
      "health-safe",
      "health-warning",
      "health-danger"
    );

    if (safeHealth > 60) {
      coreHealthFill.classList.add(
        "health-safe"
      );
    } else if (safeHealth > 30) {
      coreHealthFill.classList.add(
        "health-warning"
      );
    } else {
      coreHealthFill.classList.add(
        "health-danger"
      );
    }
  }

  if (coreHealthPanel) {
    coreHealthPanel.classList.toggle(
      "core-critical",
      safeHealth <= 30
    );
  }
}


/* =========================================================
   DAMAGE SCREEN FLASH
========================================================= */

function triggerDamageFlash(
  damageAmount = 10
) {
  if (!damageOverlay) {
    return;
  }

  damageOverlay.classList.remove(
    "damage-flash"
  );

  damageOverlay.style.setProperty(
    "--damage-opacity",
    String(
      Math.min(
        0.58,
        0.22 +
        damageAmount / 100
      )
    )
  );

  /*
    Force the browser to restart
    the animation.
  */

  void damageOverlay.offsetWidth;

  damageOverlay.classList.add(
    "damage-flash"
  );

  window.setTimeout(
    function () {
      damageOverlay.classList.remove(
        "damage-flash"
      );
    },
    450
  );
}


/* =========================================================
   SHIELD STATUS
========================================================= */

function updateShieldStatus() {
  if (!shieldStatusText) {
    return;
  }

  shieldStatusText.textContent =
    shieldActive
      ? "Active"
      : "Empty";

  shieldStatusText.classList.toggle(
    "shield-active",
    shieldActive
  );
}


/* =========================================================
   BOSS HEALTH
========================================================= */

function updateBossUI() {
  if (
    !bossUI ||
    !bossHealthFill
  ) {
    return;
  }

  if (bossActive) {
    bossUI.classList.add("active");

    const healthPercent =
      Math.max(
        0,
        bossHealth / bossMaxHealth
      ) * 100;

    bossHealthFill.style.width =
      healthPercent + "%";
  } else {
    bossUI.classList.remove("active");
  }
}


/* =========================================================
   INITIALIZE HEALTH DISPLAY
========================================================= */

updateCoreHealth();
updateShieldStatus();
