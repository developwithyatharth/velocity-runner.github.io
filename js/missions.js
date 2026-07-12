/* =========================================================
   missions.js
   Velocity Runner: Rise of Bharat
   Phase 2D stable mission system
========================================================= */


/* =========================================================
   MISSION STATE
========================================================= */

var missionBossDefeats = 0;
var missionCollectedShards = 0;
var missionCoreGuardDistance = 0;
var missionRewardShards = 0;

var missionLastObservedShards = 0;
var missionLastObservedDistance = 0;
var missionLastPanelRenderTime = 0;

var runMissions = [];

var missionToastTimer = null;
var missionToastQueue = [];
var missionToastActive = false;

var MISSION_PANEL_RENDER_INTERVAL = 120;
var MISSION_TOAST_DURATION = 3000;
var CORE_GUARD_MINIMUM_HEALTH = 50;


/* =========================================================
   SAFE HELPERS
========================================================= */

function getMissionSafeNumber(
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


function getMissionCurrentDistance() {
  if (
    typeof distance === "undefined"
  ) {
    return 0;
  }

  return Math.max(
    0,
    getMissionSafeNumber(
      distance,
      0
    )
  );
}


function getMissionCurrentShards() {
  if (
    typeof shards === "undefined"
  ) {
    return 0;
  }

  return Math.max(
    0,
    getMissionSafeNumber(
      shards,
      0
    )
  );
}


function getMissionCurrentCoreHealth() {
  if (
    typeof coreHealth === "undefined"
  ) {
    return 100;
  }

  return Math.max(
    0,
    getMissionSafeNumber(
      coreHealth,
      100
    )
  );
}


function getMissionDroneCount() {
  if (
    typeof dronesDestroyed ===
    "undefined"
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.floor(
      getMissionSafeNumber(
        dronesDestroyed,
        0
      )
    )
  );
}


/* =========================================================
   CREATE MISSION DATA
========================================================= */

function createRunMissions() {
  return [
    {
      id: "distance",
      title: "Velocity Initiate",
      description: "Run 250 metres",
      target: 250,
      progress: 0,
      reward: 10,
      completed: false
    },

    {
      id: "shards",
      title: "Surya Collector",
      description:
        "Collect 15 Surya Shards",
      target: 15,
      progress: 0,
      reward: 15,
      completed: false
    },

    {
      id: "drones",
      title: "Trinetra Hunter",
      description:
        "Destroy 3 Trinetra drones",
      target: 3,
      progress: 0,
      reward: 20,
      completed: false
    },

    {
      id: "coreGuardian",
      title: "Core Guardian",
      description:
        "Travel 500 metres with Core Health at 50% or higher",
      target: 500,
      progress: 0,
      reward: 25,
      completed: false
    },

    {
      id: "longDistance",
      title: "Neo Bharat Runner",
      description:
        "Run 1,000 metres",
      target: 1000,
      progress: 0,
      reward: 30,
      completed: false
    },

    {
      id: "boss",
      title: "Guardian Breaker",
      description:
        "Defeat 1 AI Guardian",
      target: 1,
      progress: 0,
      reward: 50,
      completed: false
    }
  ];
}


/* =========================================================
   RESET MISSIONS
========================================================= */

function resetMissionSystem() {
  missionBossDefeats = 0;
  missionCollectedShards = 0;
  missionCoreGuardDistance = 0;
  missionRewardShards = 0;

  missionLastObservedShards =
    getMissionCurrentShards();

  missionLastObservedDistance =
    getMissionCurrentDistance();

  missionLastPanelRenderTime = 0;

  runMissions =
    createRunMissions();

  hideMissionToast(true);
  closeMissionPanel();
  renderMissionPanel(true);
}


/* =========================================================
   TRACK RAW GAME PROGRESS
========================================================= */

function updateMissionShardTracking() {
  var currentShardTotal =
    getMissionCurrentShards();

  var shardIncrease =
    currentShardTotal -
    missionLastObservedShards;

  /*
   * Mission rewards are excluded from
   * collection progress.
   */

  if (shardIncrease > 0) {
    missionCollectedShards +=
      shardIncrease;
  }

  missionLastObservedShards =
    currentShardTotal;
}


function updateMissionCoreGuardTracking() {
  var currentDistance =
    getMissionCurrentDistance();

  var distanceIncrease =
    currentDistance -
    missionLastObservedDistance;

  if (distanceIncrease < 0) {
    distanceIncrease = 0;
  }

  if (
    getMissionCurrentCoreHealth() >=
    CORE_GUARD_MINIMUM_HEALTH
  ) {
    missionCoreGuardDistance +=
      distanceIncrease;
  } else {
    /*
     * Progress restarts when Core Health
     * drops below 50%.
     */

    missionCoreGuardDistance = 0;
  }

  missionLastObservedDistance =
    currentDistance;
}


/* =========================================================
   UPDATE MISSION PROGRESS
========================================================= */

function updateMissionSystem() {
  if (
    typeof gameRunning !==
      "undefined" &&
    !gameRunning
  ) {
    return;
  }

  if (
    typeof gamePaused !==
      "undefined" &&
    gamePaused
  ) {
    return;
  }

  if (
    typeof gameOver !==
      "undefined" &&
    gameOver
  ) {
    return;
  }

  updateMissionShardTracking();
  updateMissionCoreGuardTracking();

  var currentDistance =
    Math.floor(
      getMissionCurrentDistance()
    );

  var missionCompletedThisFrame =
    false;

  runMissions.forEach(
    function (mission) {
      if (mission.completed) {
        return;
      }

      if (
        mission.id === "distance"
      ) {
        mission.progress =
          currentDistance;
      } else if (
        mission.id === "shards"
      ) {
        mission.progress =
          Math.floor(
            missionCollectedShards
          );
      } else if (
        mission.id === "drones"
      ) {
        mission.progress =
          getMissionDroneCount();
      } else if (
        mission.id ===
        "coreGuardian"
      ) {
        mission.progress =
          Math.floor(
            missionCoreGuardDistance
          );
      } else if (
        mission.id ===
        "longDistance"
      ) {
        mission.progress =
          currentDistance;
      } else if (
        mission.id === "boss"
      ) {
        mission.progress =
          missionBossDefeats;
      }

      mission.progress =
        Math.max(
          0,
          Math.min(
            mission.target,
            mission.progress
          )
        );

      if (
        mission.progress >=
        mission.target
      ) {
        completeRunMission(
          mission
        );

        missionCompletedThisFrame =
          true;
      }
    }
  );

  renderMissionPanel(
    missionCompletedThisFrame
  );
}


/* =========================================================
   COMPLETE MISSION
========================================================= */

function completeRunMission(
  mission
) {
  if (
    !mission ||
    mission.completed
  ) {
    return;
  }

  mission.completed = true;

  mission.progress =
    mission.target;

  var reward =
    Math.max(
      0,
      Math.floor(
        getMissionSafeNumber(
          mission.reward,
          0
        )
      )
    );

  if (
    typeof shards !== "undefined"
  ) {
    shards += reward;

    missionRewardShards +=
      reward;

    /*
     * Prevent reward shards from being
     * counted as collected shards.
     */

    missionLastObservedShards =
      getMissionCurrentShards();
  }

  if (
    typeof shardsText !==
      "undefined" &&
    shardsText
  ) {
    shardsText.textContent =
      Math.floor(
        getMissionCurrentShards()
      );
  }

  showMissionToast(
    mission.title,
    reward
  );

  if (
    typeof playPowerUpSound ===
    "function"
  ) {
    playPowerUpSound();
  }

  if (
    typeof triggerCameraShake ===
    "function"
  ) {
    triggerCameraShake(
      0.055
    );
  }

  if (
    typeof setMission ===
    "function"
  ) {
    setMission(
      mission.title +
        " completed! +" +
        reward +
        " shards",
      120
    );
  }
}


/* =========================================================
   REGISTER BOSS DEFEAT
========================================================= */

function registerBossDefeat() {
  missionBossDefeats += 1;

  updateMissionSystem();
}


/* =========================================================
   MISSION SUMMARY HELPERS
========================================================= */

function getCompletedMissionCount() {
  return runMissions.filter(
    function (mission) {
      return mission.completed;
    }
  ).length;
}


function getTotalMissionCount() {
  return runMissions.length;
}


function getMissionBonusShards() {
  return Math.max(
    0,
    Math.floor(
      missionRewardShards
    )
  );
}


function getMissionSummary() {
  return {
    completed:
      getCompletedMissionCount(),

    total:
      getTotalMissionCount(),

    bonusShards:
      getMissionBonusShards()
  };
}


/* =========================================================
   RENDER MISSION PANEL
========================================================= */

function renderMissionPanel(
  forceRender
) {
  var missionList =
    document.getElementById(
      "missionList"
    );

  if (!missionList) {
    return;
  }

  var currentTime =
    typeof performance !==
      "undefined" &&
    typeof performance.now ===
      "function"
      ? performance.now()
      : Date.now();

  /*
   * Do not rebuild the mission-panel DOM
   * on every animation frame.
   */

  if (
    !forceRender &&
    currentTime -
      missionLastPanelRenderTime <
      MISSION_PANEL_RENDER_INTERVAL
  ) {
    return;
  }

  missionLastPanelRenderTime =
    currentTime;

  missionList.textContent = "";

  runMissions.forEach(
    function (mission) {
      var missionItem =
        document.createElement(
          "div"
        );

      missionItem.className =
        "mission-item";

      if (mission.completed) {
        missionItem.classList.add(
          "mission-completed"
        );
      }

      var safeProgress =
        Math.min(
          mission.target,
          Math.max(
            0,
            Math.floor(
              getMissionSafeNumber(
                mission.progress,
                0
              )
            )
          )
        );

      var progressPercent =
        mission.target > 0
          ? Math.min(
              100,
              (
                safeProgress /
                mission.target
              ) * 100
            )
          : 100;


      /* MISSION HEADING */

      var heading =
        document.createElement(
          "div"
        );

      heading.className =
        "mission-item-heading";

      var textGroup =
        document.createElement(
          "div"
        );

      var title =
        document.createElement(
          "strong"
        );

      title.textContent =
        mission.title;

      var description =
        document.createElement(
          "span"
        );

      description.textContent =
        mission.description;

      textGroup.appendChild(
        title
      );

      textGroup.appendChild(
        description
      );


      /* MISSION REWARD */

      var reward =
        document.createElement(
          "div"
        );

      reward.className =
        "mission-reward";

      reward.textContent =
        "+" +
        mission.reward +
        " ✦";

      heading.appendChild(
        textGroup
      );

      heading.appendChild(
        reward
      );


      /* PROGRESS BAR */

      var progressRow =
        document.createElement(
          "div"
        );

      progressRow.className =
        "mission-progress-row";

      var progressTrack =
        document.createElement(
          "div"
        );

      progressTrack.className =
        "mission-progress-track";

      var progressFill =
        document.createElement(
          "div"
        );

      progressFill.className =
        "mission-progress-fill";

      progressFill.style.width =
        progressPercent + "%";

      progressTrack.appendChild(
        progressFill
      );

      var progressText =
        document.createElement(
          "span"
        );

      progressText.className =
        "mission-progress-text";

      progressText.textContent =
        safeProgress +
        "/" +
        mission.target;

      progressRow.appendChild(
        progressTrack
      );

      progressRow.appendChild(
        progressText
      );

      missionItem.appendChild(
        heading
      );

      missionItem.appendChild(
        progressRow
      );

      missionList.appendChild(
        missionItem
      );
    }
  );
}


/* =========================================================
   MISSION PANEL CONTROLS
========================================================= */

function openMissionPanel() {
  var missionPanel =
    document.getElementById(
      "missionPanel"
    );

  if (!missionPanel) {
    return;
  }

  renderMissionPanel(true);

  missionPanel.classList.remove(
    "mission-hidden"
  );
}


function closeMissionPanel() {
  var missionPanel =
    document.getElementById(
      "missionPanel"
    );

  if (!missionPanel) {
    return;
  }

  missionPanel.classList.add(
    "mission-hidden"
  );
}


function setupMissionControls() {
  var showButton =
    document.getElementById(
      "showMissionPanelBtn"
    );

  var closeButton =
    document.getElementById(
      "closeMissionPanelBtn"
    );

  if (
    showButton &&
    !showButton.dataset
      .missionReady
  ) {
    showButton.dataset
      .missionReady =
      "true";

    showButton.addEventListener(
      "click",
      openMissionPanel
    );
  }

  if (
    closeButton &&
    !closeButton.dataset
      .missionReady
  ) {
    closeButton.dataset
      .missionReady =
      "true";

    closeButton.addEventListener(
      "click",
      closeMissionPanel
    );
  }
}


/* =========================================================
   MISSION COMPLETION TOAST QUEUE
========================================================= */

function showMissionToast(
  missionTitle,
  reward
) {
  missionToastQueue.push({
    title:
      String(missionTitle),

    reward:
      Math.max(
        0,
        Math.floor(
          getMissionSafeNumber(
            reward,
            0
          )
        )
      )
  });

  displayNextMissionToast();
}


function displayNextMissionToast() {
  if (
    missionToastActive ||
    missionToastQueue.length === 0
  ) {
    return;
  }

  var toast =
    document.getElementById(
      "missionToast"
    );

  if (!toast) {
    missionToastQueue = [];
    missionToastActive = false;
    return;
  }

  var nextToast =
    missionToastQueue.shift();

  missionToastActive = true;

  toast.textContent = "";


  /* TOAST HEADING */

  var heading =
    document.createElement(
      "strong"
    );

  heading.textContent =
    "Mission Completed";


  /* TOAST MESSAGE */

  var message =
    document.createElement(
      "span"
    );

  message.textContent =
    nextToast.title +
    " · +" +
    nextToast.reward +
    " Surya Shards";

  toast.appendChild(
    heading
  );

  toast.appendChild(
    message
  );


  /* RESTART TOAST ANIMATION */

  toast.classList.remove(
    "mission-toast-visible"
  );

  void toast.offsetWidth;

  toast.classList.add(
    "mission-toast-visible"
  );

  missionToastTimer =
    window.setTimeout(
      function () {
        toast.classList.remove(
          "mission-toast-visible"
        );

        missionToastTimer =
          window.setTimeout(
            function () {
              missionToastTimer =
                null;

              missionToastActive =
                false;

              displayNextMissionToast();
            },
            220
          );
      },
      MISSION_TOAST_DURATION
    );
}


function hideMissionToast(
  clearQueue
) {
  var toast =
    document.getElementById(
      "missionToast"
    );

  if (missionToastTimer) {
    clearTimeout(
      missionToastTimer
    );

    missionToastTimer = null;
  }

  missionToastActive = false;

  if (clearQueue) {
    missionToastQueue = [];
  }

  if (toast) {
    toast.classList.remove(
      "mission-toast-visible"
    );

    toast.textContent = "";
  }
}
