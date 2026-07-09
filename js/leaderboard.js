/* leaderboard.js
   Local leaderboard using browser localStorage
*/

function getDifficultyLabel(level) {
  if (level === "easy") return "Easy Runner";
  if (level === "hard") return "Hard Legend";
  return "Normal Warrior";
}

function getLeaderboard() {
  const saved = localStorage.getItem(LEADERBOARD_KEY);

  if (!saved) {
    return [];
  }

  try {
    const data = JSON.parse(saved);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    return [];
  }
}

function saveLeaderboard(list) {
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(list));
}

function saveScoreToLeaderboard(distanceScore, shardScore, playerName, difficultyLevel) {
  const leaderboard = getLeaderboard();

  const runData = {
    name: playerName,
    distance: distanceScore,
    shards: shardScore,
    difficulty: difficultyLevel,
    date: new Date().toLocaleDateString()
  };

  leaderboard.push(runData);

  leaderboard.sort(function (a, b) {
    return b.distance - a.distance;
  });

  const topRuns = leaderboard.slice(0, LEADERBOARD_LIMIT);

  saveLeaderboard(topRuns);
}

function renderLeaderboardList(targetElement) {
  if (!targetElement) return;

  const leaderboard = getLeaderboard();

  targetElement.innerHTML = "";

  if (leaderboard.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "empty-score";
    emptyItem.textContent = "No runs yet. Become the first champion.";
    targetElement.appendChild(emptyItem);
    return;
  }

  leaderboard.forEach(function (run) {
    const item = document.createElement("li");

    item.innerHTML =
      "<b>" +
      run.name +
      "</b> — " +
      run.distance +
      "m | " +
      run.shards +
      " shards | " +
      getDifficultyLabel(run.difficulty) +
      " | " +
      run.date;

    targetElement.appendChild(item);
  });
}

function renderLeaderboards() {
  renderLeaderboardList(homeLeaderboard);
  renderLeaderboardList(gameOverLeaderboard);
}
function setupLeaderboardCloseButtons() {
  const closeButtons = document.querySelectorAll(".leaderboard-close");

  closeButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const card = button.closest(".leaderboard-card");

      if (card) {
        card.classList.add("leaderboard-hidden");
      }
    });
  });
}
