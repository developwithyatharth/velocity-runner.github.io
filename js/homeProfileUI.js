/* =========================================================
   homeProfileUI.js
   RunNova runner-name and level interface
========================================================= */

(function () {
  "use strict";

  var nameModal;
  var nameEditor;
  var hiddenNameInput;
  var profileName;
  var toastTimer;


  function getElement(id) {
    return document.getElementById(id);
  }


  function showProfileToast(message) {
    var toast =
      getElement("homeActionToast");

    if (!toast) {
      return;
    }

    window.clearTimeout(
      toastTimer
    );

    toast.textContent =
      message;

    toast.classList.add(
      "is-visible"
    );

    toastTimer =
      window.setTimeout(
        function () {
          toast.classList.remove(
            "is-visible"
          );
        },
        2200
      );
  }


  function openNameModal() {
    if (!nameModal) {
      return;
    }

    nameEditor.value =
      hiddenNameInput.value ||
      profileName.textContent ||
      "NovaRider";

    nameModal.hidden = false;

    nameModal.setAttribute(
      "aria-hidden",
      "false"
    );

    window.requestAnimationFrame(
      function () {
        nameModal.classList.add(
          "is-open"
        );
      }
    );

    window.setTimeout(
      function () {
        nameEditor.focus();
        nameEditor.select();
      },
      160
    );
  }


  function closeNameModal() {
    if (!nameModal) {
      return;
    }

    nameModal.classList.remove(
      "is-open"
    );

    nameModal.setAttribute(
      "aria-hidden",
      "true"
    );

    window.setTimeout(
      function () {
        if (
          !nameModal.classList.contains(
            "is-open"
          )
        ) {
          nameModal.hidden = true;
        }
      },
      230
    );
  }


  function saveRunnerName() {
    var newName =
      nameEditor.value.trim();

    if (!newName) {
      showProfileToast(
        "Please enter a runner name."
      );

      nameEditor.focus();

      return;
    }

    hiddenNameInput.value =
      newName;

    profileName.textContent =
      newName;

    try {
      window.localStorage.setItem(
        "runnovaPlayerName",
        newName
      );
    } catch (error) {
      /*
       * RunNova still works if storage is blocked.
       */
    }

    /*
     * Notify the existing homeUI and main.js systems.
     */

    hiddenNameInput.dispatchEvent(
      new Event(
        "input",
        {
          bubbles: true
        }
      )
    );

    hiddenNameInput.dispatchEvent(
      new Event(
        "change",
        {
          bubbles: true
        }
      )
    );

    if (
      typeof updateStartButtonState ===
      "function"
    ) {
      updateStartButtonState();
    }

    closeNameModal();

    showProfileToast(
      "Runner name updated."
    );
  }


  function initializeProfileUI() {
    var nameButton =
      getElement("homeProfileBtn");

    var levelButton =
      getElement("homeLevelBtn");

    var closeButton =
      getElement("closeHomeNameBtn");

    var saveButton =
      getElement("saveHomeNameBtn");

    nameModal =
      getElement("homeNameModal");

    nameEditor =
      getElement("homeNameEditor");

    hiddenNameInput =
      getElement("runnerNameInput");

    profileName =
      getElement("homeProfileName");


    if (
      !nameButton ||
      !nameModal ||
      !nameEditor ||
      !hiddenNameInput ||
      !profileName
    ) {
      console.warn(
        "RunNova profile UI elements were not found."
      );

      return;
    }


    var savedName = "";

    try {
      savedName =
        window.localStorage.getItem(
          "runnovaPlayerName"
        ) || "";
    } catch (error) {
      savedName = "";
    }


    var initialName =
      savedName ||
      hiddenNameInput.value ||
      "NovaRider";


    hiddenNameInput.value =
      initialName;

    profileName.textContent =
      initialName;


    /*
     * Capture mode prevents the older temporary profile
     * toast handler in homeUI.js from also running.
     */

    nameButton.addEventListener(
      "click",
      function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();

        openNameModal();
      },
      true
    );


    if (levelButton) {
      levelButton.addEventListener(
        "click",
        function () {
          showProfileToast(
            "Complete runs and missions to increase your level."
          );
        }
      );
    }


    if (closeButton) {
      closeButton.addEventListener(
        "click",
        closeNameModal
      );
    }


    if (saveButton) {
      saveButton.addEventListener(
        "click",
        saveRunnerName
      );
    }


    nameModal.addEventListener(
      "click",
      function (event) {
        if (
          event.target &&
          event.target.hasAttribute(
            "data-close-name-modal"
          )
        ) {
          closeNameModal();
        }
      }
    );


    nameEditor.addEventListener(
      "keydown",
      function (event) {
        if (event.key === "Enter") {
          event.preventDefault();

          saveRunnerName();
        }
      }
    );


    document.addEventListener(
      "keydown",
      function (event) {
        if (
          event.key === "Escape" &&
          !nameModal.hidden
        ) {
          closeNameModal();
        }
      }
    );


    console.log(
      "RunNova professional profile cards initialized."
    );
  }


  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initializeProfileUI
    );
  } else {
    initializeProfileUI();
  }

})();
