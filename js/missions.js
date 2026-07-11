/* =========================================================
   missions.js
   Velocity Runner: Rise of Bharat

   Run mission system:
   - Distance mission
   - Shard mission
   - Drone mission
   - Boss mission
   - Bonus rewards
   - Mission panel
   - Completion notifications
========================================================= */


/* =========================================================
   MISSION STATE
========================================================= */

var missionBossDefeats = 0;

var runMissions = [];

var missionToastTimer = null;


/* =========================================================
   CREATE MISSION DATA
========================================================= */

function createRunMissions() {
  return [
    {
      id: "distance",
      title: "Velocity Initiate",
      description: "Run 500 metres",
      target: 500,
      progress: 0,
      reward: 10,
      completed: false
    },

    {
      id: "shards",
      title: "Surya Collector",
      description: "Collect 25 Surya Shards",
      target: 25,
      progress: 0,
      reward: 15,
      completed: false
    },

    {
      id: "drones",
      title: "Trinetra Hunter",
      description: "Destroy 3 Trinetra drones",
      target: 3,
      progress: 0,
      reward: 20,
      completed: false
    },

    {
      id: "boss",
      title: "Guardian Breaker",
      description: "Defeat 1 AI Guardian",
      target: 1,
      progress: 0,
      reward: 30,
      completed: false
    }
  ];
}


/* =========================================================
   RESET MISSIONS
========================================================= */

function resetMissionSystem() {
  missionBossDefeats = 0;

  runMissions =
    createRunMissions();

  hideMissionToast();

  renderMissionPanel();
}


/* =========================================================
   UPDATE MISSION PROGRESS
========================================================= */

function updateMissionSystem() {
  if (
    !gameRunning ||
    gameOver
  ) {
    return;
  }

  runMissions.forEach(
    function (mission) {
      if (mission.completed) {
        return;
      }

      if (mission.id === "distance") {
        mission.progress =
          Math.floor(distance);
      }

      if (mission.id === "shards") {
        mission.progress =
          Math.floor(shards);
      }

      if (mission.id === "drones") {
        mission.progress =
          Math.floor(
            dronesDestroyed
          );
      }

      if (mission.id === "boss") {
        mission.progress =
          missionBossDefeats;
      }

      if (
        mission.progress >=
        mission.target
      ) {
        completeRunMission(
          mission
        );
      }
    }
  );

  renderMissionPanel();
}


/* =========================================================
   COMPLETE MISSION
========================================================= */

function completeRunMission(mission) {
  if (
    !mission ||
    mission.completed
  ) {
    return;
  }

  mission.completed = true;

  mission.progress =
    mission.target;

  shards += mission.reward;

  if (shardsText) {
    shardsText.textContent =
      Math.floor(shards);
  }

  showMissionToast(
    mission.title,
    mission.reward
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
    triggerCameraShake(0.055);
  }

  if (
    typeof setMission ===
    "function"
  ) {
    setMission(
      mission.title +
      " completed! +" +
      mission.reward +
      " shards",
      120
    );
  }
}


/* =========================================================
   REGISTER BOSS DEFEAT
========================================================= */

function registerBossDefeat() {
  missionBossDefeats++;

  updateMissionSystem();
}


/* =========================================================
   RENDER MISSION PANEL
========================================================= */

function renderMissionPanel() {
  var missionList =
    document.getElementById(
      "missionList"
    );

  if (!missionList) {
    return;
  }

  missionList.innerHTML = "";

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
            mission.progress
          )
        );

      var progressPercent =
        Math.min(
          100,
          (
            safeProgress /
            mission.target
          ) * 100
        );

      missionItem.innerHTML =
        '<div class="mission-item-heading">' +
          "<div>" +
            "<strong>" +
              escapeMissionText(
                mission.title
              ) +
            "</strong>" +
            "<span>" +
              escapeMissionText(
                mission.description
              ) +
            "</span>" +
          "</div>" +

          '<div class="mission-reward">' +
            "+" +
            mission.reward +
            " ✦" +
          "</div>" +
        "</div>" +

        '<div class="mission-progress-row">' +
          '<div class="mission-progress-track">' +
            '<div class="mission-progress-fill" ' +
              'style="width:' +
              progressPercent +
              '%"></div>' +
          "</div>" +

          '<span class="mission-progress-text">' +
            safeProgress +
            "/" +
            mission.target +
          "</span>" +
        "</div>";

      missionList.appendChild(
        missionItem
      );
    }
  );
}


/* =========================================================
   SAFE TEXT
========================================================= */

function escapeMissionText(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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

  renderMissionPanel();

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
      .missionReady = "true";

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
      .missionReady = "true";

    closeButton.addEventListener(
      "click",
      closeMissionPanel
    );
  }
}


/* =========================================================
   MISSION COMPLETION TOAST
========================================================= */

function showMissionToast(
  missionTitle,
  reward
) {
  var toast =
    document.getElementById(
      "missionToast"
    );

  if (!toast) {
    return;
  }

  toast.innerHTML =
    "<strong>Mission Completed</strong>" +
    "<span>" +
      escapeMissionText(
        missionTitle
      ) +
      " · +" +
      reward +
      " Surya Shards" +
    "</span>";

  toast.classList.remove(
    "mission-toast-visible"
  );

  void toast.offsetWidth;

  toast.classList.add(
    "mission-toast-visible"
  );

  if (missionToastTimer) {
    clearTimeout(
      missionToastTimer
    );
  }

  missionToastTimer =
    window.setTimeout(
      hideMissionToast,
      3000
    );
}


function hideMissionToast() {
  var toast =
    document.getElementById(
      "missionToast"
    );

  if (toast) {
    toast.classList.remove(
      "mission-toast-visible"
    );
  }

  if (missionToastTimer) {
    clearTimeout(
      missionToastTimer
    );

    missionToastTimer = null;
  }
}
