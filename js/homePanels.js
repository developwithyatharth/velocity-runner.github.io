/* =========================================================
   homePanels.js — RunNova H2A
   Missions, Daily Challenge, Crew, World Tour and rewards.
========================================================= */

(function () {
  "use strict";

  var homeScreen = null;
  var overlay = null;
  var panelTitle = null;
  var panelEyebrow = null;
  var panelDescription = null;
  var panelSymbol = null;
  var panelContent = null;
  var closeTimer = null;

  var panelMeta = {
    missions: {
      symbol: "◎",
      eyebrow: "RUN PROGRESS",
      title: "Missions",
      description:
        "Complete objectives to earn Nova Coins and level progress."
    },

    daily: {
      symbol: "★",
      eyebrow: "TODAY'S RUN",
      title: "Daily Challenge",
      description:
        "A new challenge set appears every day."
    },

    crew: {
      symbol: "◉",
      eyebrow: "RUNNER COLLECTION",
      title: "Nova Crew",
      description:
        "Meet the runners joining the World Circuit."
    },

    tour: {
      symbol: "◌",
      eyebrow: "SEASON EVENT",
      title: "World Tour",
      description:
        "The first RunNova destination is under construction."
    }
  };


  /* =======================================================
     BASIC HELPERS
  ======================================================= */

  function getElement(id) {
    return document.getElementById(id);
  }


  function todayKey() {
    var now = new Date();

    return [
      now.getFullYear(),

      String(
        now.getMonth() + 1
      ).padStart(2, "0"),

      String(
        now.getDate()
      ).padStart(2, "0")
    ].join("-");
  }


  function safeReadNumber(
    key,
    fallback
  ) {
    try {
      var value =
        Number(
          window.localStorage.getItem(
            key
          )
        );

      return Number.isFinite(value)
        ? value
        : fallback;
    } catch (error) {
      return fallback;
    }
  }


  function safeWriteNumber(
    key,
    value
  ) {
    try {
      window.localStorage.setItem(
        key,
        String(value)
      );
    } catch (error) {
      /*
       * Local storage is optional.
       */
    }
  }


  function updateCoinDisplay(
    value
  ) {
    var coinDisplay =
      getElement("homeNovaCoins");

    if (coinDisplay) {
      coinDisplay.textContent =
        String(value);
    }
  }


  /* =======================================================
     CREATE HOME PANEL OVERLAY
  ======================================================= */

  function createOverlay() {
    overlay =
      document.createElement("div");

    overlay.id =
      "homeHubOverlay";

    overlay.hidden = true;

    overlay.setAttribute(
      "role",
      "dialog"
    );

    overlay.setAttribute(
      "aria-modal",
      "true"
    );

    overlay.setAttribute(
      "aria-hidden",
      "true"
    );

    overlay.innerHTML = [
      '<div class="home-hub-backdrop" data-close-home-hub></div>',

      '<section class="home-hub-panel" aria-labelledby="homeHubTitle">',

      '  <button',
      '    type="button"',
      '    class="home-hub-close"',
      '    aria-label="Close panel"',
      '  >×</button>',

      '  <header class="home-hub-header">',

      '    <span',
      '      class="home-hub-symbol"',
      '      aria-hidden="true"',
      '    >◎</span>',

      '    <div class="home-hub-heading">',

      '      <small class="home-hub-eyebrow">',
      '        RUN PROGRESS',
      '      </small>',

      '      <h2 id="homeHubTitle">',
      '        Missions',
      '      </h2>',

      '      <p class="home-hub-description"></p>',

      '    </div>',

      '  </header>',

      '  <div class="home-hub-content"></div>',

      '</section>'
    ].join("");

    homeScreen.appendChild(
      overlay
    );

    panelTitle =
      overlay.querySelector(
        "#homeHubTitle"
      );

    panelEyebrow =
      overlay.querySelector(
        ".home-hub-eyebrow"
      );

    panelDescription =
      overlay.querySelector(
        ".home-hub-description"
      );

    panelSymbol =
      overlay.querySelector(
        ".home-hub-symbol"
      );

    panelContent =
      overlay.querySelector(
        ".home-hub-content"
      );

    var closeButton =
      overlay.querySelector(
        ".home-hub-close"
      );

    if (closeButton) {
      closeButton.addEventListener(
        "click",
        closePanel
      );
    }

    overlay.addEventListener(
      "click",
      function (event) {
        if (
          event.target &&
          event.target.hasAttribute(
            "data-close-home-hub"
          )
        ) {
          closePanel();
        }
      }
    );
  }


  /* =======================================================
     PANEL META INFORMATION
  ======================================================= */

  function setPanelMeta(type) {
    var meta =
      panelMeta[type] ||
      panelMeta.missions;

    panelSymbol.textContent =
      meta.symbol;

    panelEyebrow.textContent =
      meta.eyebrow;

    panelTitle.textContent =
      meta.title;

    panelDescription.textContent =
      meta.description;
  }


  /* =======================================================
     MISSIONS
  ======================================================= */

  function getMissionItemsFromGame() {
    var missionList =
      getElement("missionList");

    if (!missionList) {
      return [];
    }

    var nodes =
      missionList.querySelectorAll(
        ".mission-item"
      );

    var items = [];

    nodes.forEach(
      function (node, index) {
        var titleNode =
          node.querySelector(
            "strong"
          );

        var descriptionNode =
          node.querySelector(
            ".mission-item-heading span"
          );

        var rewardNode =
          node.querySelector(
            ".mission-reward"
          );

        var progressNode =
          node.querySelector(
            ".mission-progress-text"
          );

        var fillNode =
          node.querySelector(
            ".mission-progress-fill"
          );

        items.push({
          icon:
            ["↟", "N", "◇"][
              index % 3
            ],

          title:
            titleNode
              ? titleNode.textContent.trim()
              : "Run Mission",

          description:
            descriptionNode
              ? descriptionNode.textContent.trim()
              : "Complete the objective during a run.",

          reward:
            rewardNode
              ? rewardNode.textContent.trim()
              : "+50 Coins",

          progress:
            progressNode
              ? progressNode.textContent.trim()
              : "0 / 1",

          percent:
            fillNode
              ? parseFloat(
                  fillNode.style.width
                ) || 0
              : 0
        });
      }
    );

    return items;
  }


  function fallbackMissions() {
    return [
      {
        icon: "↟",
        title: "Distance Dash",
        description:
          "Run 750 metres in one session.",
        reward: "+60 Coins",
        progress: "0 / 750 m",
        percent: 0
      },

      {
        icon: "N",
        title: "Token Trail",
        description:
          "Collect 20 Nova Tokens.",
        reward: "+40 Coins",
        progress: "0 / 20",
        percent: 0
      },

      {
        icon: "◇",
        title: "Clean Run",
        description:
          "Dodge 12 obstacles without a collision.",
        reward: "+80 Coins",
        progress: "0 / 12",
        percent: 0
      }
    ];
  }


  function renderTaskCards(items) {
    return items
      .map(
        function (item) {
          var percent =
            Math.max(
              0,
              Math.min(
                100,
                Number(item.percent) ||
                  0
              )
            );

          return [
            '<article class="home-task-card">',

            '  <div class="home-task-top">',

            '    <span',
            '      class="home-task-icon"',
            '      aria-hidden="true"',
            '    >' +
              item.icon +
              "</span>",

            '    <span class="home-task-reward">' +
              item.reward +
              "</span>",

            "  </div>",

            "  <h3>" +
              item.title +
              "</h3>",

            "  <p>" +
              item.description +
              "</p>",

            '  <div class="home-progress-row">',

            '    <span class="home-progress-track">',

            '      <span',
            '        class="home-progress-fill"',
            '        style="width:' +
              percent +
              '%"',
            "      ></span>",

            "    </span>",

            '    <span class="home-progress-text">' +
              item.progress +
              "</span>",

            "  </div>",

            "</article>"
          ].join("");
        }
      )
      .join("");
  }


  function renderMissions() {
    var missions =
      getMissionItemsFromGame();

    if (!missions.length) {
      missions =
        fallbackMissions();
    }

    panelContent.innerHTML  function renderMissions() {
    var missions =
      getMissionItemsFromGame();

    if (!missions.length) = [
      '<div class="home-hub-summary">',

      "  <div>",

      "    <strong>",
      "      Active objectives",
      "    </strong>",

      "    <span>",
      "      Mission progress is saved between runs.",
      "    </span>",

      "  </div>",

      '  <span class="home-hub-pill">' +
        missions.length +
        " ACTIVE</span>",

      "</div>",

      '<div class="home-hub-grid">',

      renderTaskCards(
        missions
      ),

      "</div>"
    ].join("");
  }


  /* =======================================================
     DAILY CHALLENGES
  ======================================================= */

  function getDailyChallenges() {
    var key =
      "runnovaDailyProgress:" +
      todayKey();

    var saved = null;

    try {
      saved =
        JSON.parse(
          window.localStorage.getItem(
            key
          ) || "null"
        );
    } catch (error) {
      saved = null;
    }

    var progress =
      saved &&
      Array.isArray(saved.progress)
        ? saved.progress
        : [0, 0, 0];

    return [
      {
        icon: "⚡",
        title: "Quick Start",
        description:
          "Reach 400 metres in a single run.",
        reward: "+30 Coins",
        progress:
          progress[0] +
          " / 400 m",
        percent:
          Math.min(
            100,
            progress[0] / 4
          )
      },

      {
        icon: "✦",
        title: "Nova Collector",
        description:
          "Collect 12 Nova Tokens today.",
        reward: "+35 Coins",
        progress:
          progress[1] +
          " / 12",
        percent:
          Math.min(
            100,
            progress[1] /
              12 *
              100
          )
      },

      {
        icon: "⇄",
        title: "Lane Master",
        description:
          "Change lanes 25 times during today's runs.",
        reward: "+35 Coins",
        progress:
          progress[2] +
          " / 25",
        percent:
          Math.min(
            100,
            progress[2] /
              25 *
              100
          )
      }
    ];
  }


  function renderDaily() {
    var challenges =
      getDailyChallenges();

    var complete =
      challenges.every(
        function (challenge) {
          return (
            challenge.percent >=
            100
          );
        }
      );

    panelContent.innerHTML = [
      '<div class="home-hub-summary">',

      "  <div>",

      "    <strong>",
      "      Daily set · " +
        todayKey(),
      "    </strong>",

      "    <span>",
      "      Complete all three to unlock the bonus chest.",
      "    </span>",

      "  </div>",

      '  <span class="home-hub-pill">',
      "    100 BONUS",
      "  </span>",

      "</div>",

      '<div class="home-hub-grid">',

      renderTaskCards(
        challenges
      ),

      "</div>",

      '<button',
      '  type="button"',
      '  class="home-hub-action"',
      '  id="dailyBonusBtn" ' +
        (
          complete
            ? ""
            : "disabled"
        ) +
        ">",

      complete
        ? "CLAIM DAILY BONUS"
        : "COMPLETE ALL CHALLENGES",

      "</button>"
    ].join("");
  }


  /* =======================================================
     CREW
  ======================================================= */

  function renderCrew() {
    var crew = [
      {
        initials: "NV",
        name: "Nova",
        role: "Balanced Runner",
        status: "SELECTED",
        selected: true
      },

      {
        initials: "MY",
        name: "Maya",
        role: "Agile Explorer",
        status: "COMING SOON",
        locked: true
      },

      {
        initials: "RF",
        name: "Riff",
        role: "Street Specialist",
        status: "COMING SOON",
        locked: true
      },

      {
        initials: "KJ",
        name: "Kenji",
        role: "Tech Runner",
        status: "COMING SOON",
        locked: true
      }
    ];

    panelContent.innerHTML = [
      '<div class="home-hub-summary">',

      "  <div>",

      "    <strong>",
      "      Your runners",
      "    </strong>",

      "    <span>",
      "      Future characters will use original animations and outfits.",
      "    </span>",

      "  </div>",

      '  <span class="home-hub-pill">',
      "    1 / 4",
      "  </span>",

      "</div>",

      '<div class="home-hub-grid">',

      crew
        .map(
          function (member) {
            return [
              '<article class="home-crew-card ' +
                (
                  member.selected
                    ? "is-selected "
                    : ""
                ) +
                (
                  member.locked
                    ? "is-locked"
                    : ""
                ) +
                '">',

              '  <div class="home-crew-avatar">' +
                member.initials +
                "</div>",

              "  <h3>" +
                member.name +
                "</h3>",

              "  <p>" +
                member.role +
                "</p>",

              '  <span class="home-card-status ' +
                (
                  member.locked
                    ? "is-locked"
                    : ""
                ) +
                '">' +
                member.status +
                "</span>",

              "</article>"
            ].join("");
          }
        )
        .join(""),

      "</div>"
    ].join("");
  }


  /* =======================================================
     WORLD TOUR
  ======================================================= */

  function renderTour() {
    panelContent.innerHTML = [
      '<article class="home-tour-card">',

      "  <div>",

      '    <span class="home-hub-pill">',
      "      SEASON 01",
      "    </span>",

      '    <h3 style="margin-top:16px;font-size:28px;">',
      "      Metro Pulse",
      "    </h3>",

      "    <p>",
      "      RunNova’s first global destination will introduce moving transit, rooftop shortcuts, street events and new obstacle families.",
      "    </p>",

      '    <button',
      '      type="button"',
      '      class="home-hub-action"',
      "      disabled",
      "    >",
      "      COMING SOON",
      "    </button>",

      "  </div>",

      '  <div',
      '    class="home-tour-art"',
      '    aria-hidden="true"',
      "  ></div>",

      "</article>"
    ].join("");
  }


  /* =======================================================
     PANEL RENDERING
  ======================================================= */

  function renderPanel(type) {
    setPanelMeta(type);

    if (type === "daily") {
      renderDaily();
    } else if (
      type === "crew"
    ) {
      renderCrew();
    } else if (
      type === "tour"
    ) {
      renderTour();
    } else {
      renderMissions();
    }
  }


  function openPanel(type) {
    if (!overlay) {
      return;
    }

    window.clearTimeout(
      closeTimer
    );

    renderPanel(type);

    overlay.hidden = false;

    overlay.setAttribute(
      "aria-hidden",
      "false"
    );

    homeScreen.classList.add(
      "home-modal-active"
    );

    window.requestAnimationFrame(
      function () {
        overlay.classList.add(
          "is-open"
        );

        var closeButton =
          overlay.querySelector(
            ".home-hub-close"
          );

        if (closeButton) {
          closeButton.focus();
        }
      }
    );
  }


  function closePanel() {
    if (
      !overlay ||
      overlay.hidden
    ) {
      return;
    }

    overlay.classList.remove(
      "is-open"
    );

    overlay.setAttribute(
      "aria-hidden",
      "true"
    );

    closeTimer =
      window.setTimeout(
        function () {
          overlay.hidden = true;

          var otherModalOpen =
            homeScreen.querySelector(
              ".home-modal.is-open"
            );

          if (!otherModalOpen) {
            homeScreen.classList.remove(
              "home-modal-active"
            );
          }
        },
        230
      );
  }


  /* =======================================================
     FREE DAILY REWARD
  ======================================================= */

  function claimFreeReward(event) {
    event.preventDefault();
    event.stopImmediatePropagation();

    var rewardKey =
      "runnovaFreeReward:" +
      todayKey();

    var alreadyClaimed =
      false;

    try {
      alreadyClaimed =
        window.localStorage.getItem(
          rewardKey
        ) === "claimed";
    } catch (error) {
      alreadyClaimed =
        false;
    }

    if (alreadyClaimed) {
      openPanel("daily");
      return;
    }

    var coins =
      safeReadNumber(
        "runnovaNovaCoins",
        0
      ) + 100;

    safeWriteNumber(
      "runnovaNovaCoins",
      coins
    );

    updateCoinDisplay(
      coins
    );

    try {
      window.localStorage.setItem(
        rewardKey,
        "claimed"
      );
    } catch (error) {
      /*
       * Local storage is optional.
       */
    }

    var rewardButton =
      getElement("homeRewardBtn");

    if (rewardButton) {
      var strong =
        rewardButton.querySelector(
          ".event-copy strong"
        );

      var span =
        rewardButton.querySelector(
          ".event-copy > span"
        );

      if (strong) {
        strong.textContent =
          "CLAIMED";
      }

      if (span) {
        span.textContent =
          "+100 Nova Coins";
      }
    }

    openPanel("daily");
  }


  /* =======================================================
     BUTTON BINDING
  ======================================================= */

  function bindAction(
    selector,
    action
  ) {
    var button =
      homeScreen.querySelector(
        selector
      );

    if (!button) {
      return;
    }

    button.addEventListener(
      "click",
      function (event) {
        event.preventDefault();

        event.stopImmediatePropagation();

        openPanel(action);
      },
      true
    );
  }


  /* =======================================================
     RESTORE REWARD AND CURRENCY STATE
  ======================================================= */

  function initializeRewardState() {
    var coins =
      safeReadNumber(
        "runnovaNovaCoins",
        0
      );

    updateCoinDisplay(
      coins
    );

    var claimed = false;

    try {
      claimed =
        window.localStorage.getItem(
          "runnovaFreeReward:" +
            todayKey()
        ) === "claimed";
    } catch (error) {
      claimed = false;
    }

    if (claimed) {
      var rewardButton =
        getElement(
          "homeRewardBtn"
        );

      if (rewardButton) {
        var strong =
          rewardButton.querySelector(
            ".event-copy strong"
          );

        var span =
          rewardButton.querySelector(
            ".event-copy > span"
          );

        if (strong) {
          strong.textContent =
            "CLAIMED";
        }

        if (span) {
          span.textContent =
            "Come back tomorrow";
        }
      }
    }
  }


  /* =======================================================
     INITIALIZATION
  ======================================================= */

  function initializeHomePanels() {
    homeScreen =
      getElement("homeScreen");

    if (!homeScreen) {
      console.warn(
        "RunNova H2A: homeScreen was not found."
      );

      return;
    }

    /*
     * Prevent duplicate overlays if the script is
     * accidentally loaded twice.
     */

    var existingOverlay =
      getElement("homeHubOverlay");

    if (existingOverlay) {
      console.warn(
        "RunNova H2A home panels are already initialized."
      );

      return;
    }

    createOverlay();
    initializeRewardState();

    bindAction(
      '[data-home-action="missions"]',
      "missions"
    );

    bindAction(
      '[data-home-action="daily"]',
      "daily"
    );

    bindAction(
      '[data-home-action="crew"]',
      "crew"
    );

    bindAction(
      '[data-home-action="world-tour"]',
      "tour"
    );

    var rewardButton =
      getElement("homeRewardBtn");

    if (rewardButton) {
      rewardButton.addEventListener(
        "click",
        claimFreeReward,
        true
      );
    }

    document.addEventListener(
      "keydown",
      function (event) {
        if (
          event.key === "Escape" &&
          overlay &&
          !overlay.hidden
        ) {
          closePanel();
        }
      }
    );

    var screenObserver =
      new MutationObserver(
        function () {
          if (
            !homeScreen.classList.contains(
              "active"
            )
          ) {
            closePanel();
          }
        }
      );

    screenObserver.observe(
      homeScreen,
      {
        attributes: true,
        attributeFilter: [
          "class"
        ]
      }
    );

    console.log(
      "RunNova H2A home panels initialized."
    );
  }


  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initializeHomePanels
    );
  } else {
    initializeHomePanels();
  }

})();
