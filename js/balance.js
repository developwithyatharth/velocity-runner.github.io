/* =========================================================
   balance.js
   Velocity Runner: Rise of Bharat
   Phase 2D stable gameplay balancing

   Features:
   - Smooth distance-based difficulty progression
   - Safer obstacle spacing at every speed
   - Reduced repeated lane and obstacle patterns
   - Difficulty-aware shard and power-up pacing
   - Emergency power-up pity system
   - Difficulty-aware drone and boss damage
========================================================= */


/* =========================================================
   BALANCE CONSTANTS
========================================================= */

var BALANCE_MAX_DISTANCE = 7500;

var BALANCE_LANE_COUNT = 3;

var BALANCE_HISTORY_LIMIT = 4;

var POWER_UP_PITY_LIMITS = {
  easy: 720,
  normal: 840,
  hard: 960
};


/* =========================================================
   BALANCE STATE
========================================================= */

var balanceState = {
  lastObstacleLane: -1,
  sameLaneStreak: 0,
  recentObstacleLanes: [],

  lastObstacleType: "",
  sameTypeStreak: 0,
  recentObstacleTypes: [],

  framesWithoutPowerUp: 0,
  framesSinceObstacleSpawn: 0
};


/* =========================================================
   SAFE HELPERS
========================================================= */

function getBalanceSafeNumber(
  value,
  fallback
) {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  return typeof fallback === "number"
    ? fallback
    : 0;
}


function getBalanceDifficulty() {
  if (
    typeof selectedDifficulty ===
      "string" &&
    (
      selectedDifficulty === "easy" ||
      selectedDifficulty === "normal" ||
      selectedDifficulty === "hard"
    )
  ) {
    return selectedDifficulty;
  }

  return "normal";
}


function getBalanceDistance() {
  if (
    typeof distance === "undefined"
  ) {
    return 0;
  }

  return Math.max(
    0,
    getBalanceSafeNumber(
      distance,
      0
    )
  );
}


function getBalanceSpeed() {
  if (
    typeof speed === "undefined"
  ) {
    return 0.34;
  }

  return Math.max(
    0,
    getBalanceSafeNumber(
      speed,
      0.34
    )
  );
}


function getBalanceCoreHealth() {
  if (
    typeof coreHealth === "undefined"
  ) {
    return 100;
  }

  return Math.max(
    0,
    Math.min(
      100,
      getBalanceSafeNumber(
        coreHealth,
        100
      )
    )
  );
}


function getBalanceShieldState() {
  return (
    typeof shieldActive !==
      "undefined" &&
    Boolean(shieldActive)
  );
}


function getDifficultyMultiplier(
  name,
  fallback
) {
  if (
    typeof difficultySettings !==
      "undefined" &&
    difficultySettings &&
    typeof difficultySettings[name] ===
      "number" &&
    Number.isFinite(
      difficultySettings[name]
    )
  ) {
    return difficultySettings[name];
  }

  return fallback;
}


function rememberBalanceValue(
  history,
  value
) {
  history.push(value);

  while (
    history.length >
    BALANCE_HISTORY_LIMIT
  ) {
    history.shift();
  }
}


function chooseRandomArrayValue(
  values
) {
  if (
    !values ||
    values.length === 0
  ) {
    return null;
  }

  return values[
    Math.floor(
      Math.random() *
      values.length
    )
  ];
}


/* =========================================================
   RESET BALANCE STATE
========================================================= */

function resetBalanceState() {
  balanceState.lastObstacleLane = -1;
  balanceState.sameLaneStreak = 0;

  balanceState.recentObstacleLanes =
    [];

  balanceState.lastObstacleType = "";
  balanceState.sameTypeStreak = 0;

  balanceState.recentObstacleTypes =
    [];

  balanceState.framesWithoutPowerUp =
    0;

  balanceState.framesSinceObstacleSpawn =
    0;
}


/* =========================================================
   DISTANCE-BASED PROGRESS
========================================================= */

function getBalanceProgress() {
  return Math.min(
    1,
    getBalanceDistance() /
      BALANCE_MAX_DISTANCE
  );
}


/* =========================================================
   OBSTACLE SPAWN INTERVAL
========================================================= */

function getBalancedObstacleInterval() {
  var progress =
    getBalanceProgress();

  var difficulty =
    getBalanceDifficulty();

  var startingInterval = 94;
  var minimumInterval = 48;

  if (difficulty === "easy") {
    startingInterval = 112;
    minimumInterval = 62;
  } else if (
    difficulty === "hard"
  ) {
    startingInterval = 80;
    minimumInterval = 40;
  }

  var interval =
    startingInterval -
    (
      startingInterval -
      minimumInterval
    ) *
    progress;

  /*
   * Add extra spacing when the runner
   * reaches a high speed.
   */

  var currentSpeed =
    getBalanceSpeed();

  var speedSafetyBonus = 0;

  if (currentSpeed > 0.9) {
    speedSafetyBonus = 8;
  } else if (
    currentSpeed > 0.7
  ) {
    speedSafetyBonus = 5;
  } else if (
    currentSpeed > 0.55
  ) {
    speedSafetyBonus = 3;
  }

  return Math.max(
    minimumInterval,
    Math.round(
      interval +
      speedSafetyBonus
    )
  );
}


/* =========================================================
   SHARD SPAWN INTERVAL
========================================================= */

function getBalancedShardInterval() {
  var progress =
    getBalanceProgress();

  var difficulty =
    getBalanceDifficulty();

  var startingInterval = 44;
  var minimumInterval = 30;

  if (difficulty === "easy") {
    startingInterval = 38;
    minimumInterval = 25;
  } else if (
    difficulty === "hard"
  ) {
    startingInterval = 50;
    minimumInterval = 34;
  }

  var interval =
    startingInterval -
    (
      startingInterval -
      minimumInterval
    ) *
    progress;

  return Math.max(
    minimumInterval,
    Math.round(interval)
  );
}


/* =========================================================
   POWER-UP SPAWN INTERVAL
========================================================= */

function getBalancedPowerUpInterval() {
  var difficulty =
    getBalanceDifficulty();

  var progress =
    getBalanceProgress();

  var health =
    getBalanceCoreHealth();

  var baseInterval = 370;
  var randomRange = 110;

  if (difficulty === "easy") {
    baseInterval = 300;
    randomRange = 90;
  } else if (
    difficulty === "hard"
  ) {
    baseInterval = 440;
    randomRange = 120;
  }

  /*
   * Emergency help when the Surya Core
   * becomes weak.
   */

  if (health <= 20) {
    return difficulty === "hard"
      ? 170
      : 140;
  }

  if (health <= 35) {
    return difficulty === "hard"
      ? 220
      : 185;
  }

  if (health <= 50) {
    return difficulty === "easy"
      ? 210
      : 245;
  }

  if (
    !getBalanceShieldState() &&
    health <= 70
  ) {
    return difficulty === "hard"
      ? 330
      : 285;
  }

  /*
   * Provide slightly more assistance
   * during longer runs.
   */

  var longRunHelp =
    Math.round(
      progress * 35
    );

  return Math.max(
    220,
    baseInterval -
      longRunHelp +
      Math.floor(
        Math.random() *
        randomRange
      )
  );
}


/* =========================================================
   BALANCE FRAME UPDATE
========================================================= */

function updateBalanceFrame() {
  balanceState.framesWithoutPowerUp +=
    1;

  balanceState.framesSinceObstacleSpawn +=
    1;
}


function registerPowerUpSpawn() {
  balanceState.framesWithoutPowerUp =
    0;
}


function shouldForcePowerUpSpawn() {
  var difficulty =
    getBalanceDifficulty();

  var health =
    getBalanceCoreHealth();

  var pityLimit =
    POWER_UP_PITY_LIMITS[
      difficulty
    ] ||
    POWER_UP_PITY_LIMITS.normal;

  /*
   * Guarantee that a player does not
   * go too long without assistance.
   */

  if (
    balanceState.framesWithoutPowerUp >=
    pityLimit
  ) {
    return true;
  }

  if (
    health <= 20 &&
    balanceState.framesWithoutPowerUp >=
      240
  ) {
    return true;
  }

  if (
    health <= 35 &&
    balanceState.framesWithoutPowerUp >=
      360
  ) {
    return true;
  }

  return false;
}


/* =========================================================
   FAIR OBSTACLE LANE
========================================================= */

function chooseBalancedObstacleLane() {
  var allLanes = [0, 1, 2];

  var candidates =
    allLanes.slice();

  var lastLane =
    balanceState.lastObstacleLane;

  var laneHistory =
    balanceState
      .recentObstacleLanes;

  /*
   * Never allow three consecutive
   * obstacles in one lane.
   */

  if (
    balanceState.sameLaneStreak >= 2 &&
    lastLane >= 0
  ) {
    candidates =
      candidates.filter(
        function (laneIndex) {
          return laneIndex !==
            lastLane;
        }
      );
  }

  /*
   * Prevent repeating lane patterns:
   * 0, 1, 0, 1 or 1, 2, 1, 2.
   */

  if (
    laneHistory.length >= 3
  ) {
    var firstLane =
      laneHistory[
        laneHistory.length - 3
      ];

    var secondLane =
      laneHistory[
        laneHistory.length - 2
      ];

    var thirdLane =
      laneHistory[
        laneHistory.length - 1
      ];

    if (
      firstLane === thirdLane &&
      firstLane !== secondLane
    ) {
      var saferCandidates =
        candidates.filter(
          function (laneIndex) {
            return laneIndex !==
              secondLane;
          }
        );

      if (
        saferCandidates.length > 0
      ) {
        candidates =
          saferCandidates;
      }
    }
  }

  var lane =
    chooseRandomArrayValue(
      candidates
    );

  if (lane === null) {
    lane =
      Math.floor(
        Math.random() *
        BALANCE_LANE_COUNT
      );
  }

  if (lane === lastLane) {
    balanceState.sameLaneStreak +=
      1;
  } else {
    balanceState.sameLaneStreak =
      1;
  }

  balanceState.lastObstacleLane =
    lane;

  balanceState.framesSinceObstacleSpawn =
    0;

  rememberBalanceValue(
    balanceState.recentObstacleLanes,
    lane
  );

  return lane;
}


/* =========================================================
   OBSTACLE TYPE WEIGHTS
========================================================= */

function getObstacleTypeWeights() {
  var progress =
    getBalanceProgress();

  var difficulty =
    getBalanceDifficulty();

  var weights = {
    block: 0.5,
    low: 0.32,
    slide: 0.18
  };

  /*
   * Introduce more action variety
   * gradually rather than immediately.
   */

  if (progress > 0.35) {
    weights.block = 0.44;
    weights.low = 0.32;
    weights.slide = 0.24;
  }

  if (progress > 0.7) {
    weights.block = 0.4;
    weights.low = 0.31;
    weights.slide = 0.29;
  }

  if (difficulty === "easy") {
    weights.block += 0.07;
    weights.slide -= 0.07;
  } else if (
    difficulty === "hard"
  ) {
    weights.block -= 0.05;
    weights.slide += 0.05;
  }

  return weights;
}


function chooseWeightedObstacleType() {
  var weights =
    getObstacleTypeWeights();

  var randomValue =
    Math.random();

  if (
    randomValue <
    weights.block
  ) {
    return "block";
  }

  if (
    randomValue <
    weights.block +
      weights.low
  ) {
    return "low";
  }

  return "slide";
}


/* =========================================================
   FAIR OBSTACLE TYPE
========================================================= */

function chooseBalancedObstacleType() {
  var obstacleType =
    chooseWeightedObstacleType();

  var lastType =
    balanceState.lastObstacleType;

  var typeHistory =
    balanceState
      .recentObstacleTypes;

  /*
   * Avoid three identical obstacle
   * actions in succession.
   */

  if (
    balanceState.sameTypeStreak >= 2 &&
    obstacleType === lastType
  ) {
    var alternatives = [
      "block",
      "low",
      "slide"
    ].filter(
      function (type) {
        return type !== lastType;
      }
    );

    obstacleType =
      chooseRandomArrayValue(
        alternatives
      ) || "block";
  }

  /*
   * Prevent alternating action patterns:
   * block, low, block, low.
   */

  if (
    typeHistory.length >= 3
  ) {
    var firstType =
      typeHistory[
        typeHistory.length - 3
      ];

    var secondType =
      typeHistory[
        typeHistory.length - 2
      ];

    var thirdType =
      typeHistory[
        typeHistory.length - 1
      ];

    if (
      firstType === thirdType &&
      firstType !== secondType &&
      obstacleType === secondType
    ) {
      var patternAlternatives = [
        "block",
        "low",
        "slide"
      ].filter(
        function (type) {
          return type !==
            secondType;
        }
      );

      obstacleType =
        chooseRandomArrayValue(
          patternAlternatives
        ) || "block";
    }
  }

  if (
    obstacleType === lastType
  ) {
    balanceState.sameTypeStreak +=
      1;
  } else {
    balanceState.sameTypeStreak =
      1;
  }

  balanceState.lastObstacleType =
    obstacleType;

  rememberBalanceValue(
    balanceState.recentObstacleTypes,
    obstacleType
  );

  return obstacleType;
}


/* =========================================================
   DAMAGE BALANCING
========================================================= */

function getDroneHitDamage() {
  var difficulty =
    getBalanceDifficulty();

  var fallbackMultiplier = 1;

  if (difficulty === "easy") {
    fallbackMultiplier = 0.8;
  } else if (
    difficulty === "hard"
  ) {
    fallbackMultiplier = 1.25;
  }

  var multiplier =
    getDifficultyMultiplier(
      "droneAttackMultiplier",
      fallbackMultiplier
    );

  return Math.max(
    6,
    Math.min(
      16,
      Math.round(
        10 * multiplier
      )
    )
  );
}


function getBossLaserDamage() {
  var difficulty =
    getBalanceDifficulty();

  var fallbackMultiplier = 1;

  if (difficulty === "easy") {
    fallbackMultiplier = 0.8;
  } else if (
    difficulty === "hard"
  ) {
    fallbackMultiplier = 1.3;
  }

  var multiplier =
    getDifficultyMultiplier(
      "bossAttackMultiplier",
      fallbackMultiplier
    );

  return Math.max(
    12,
    Math.min(
      30,
      Math.round(
        20 * multiplier
      )
    )
  );
}
