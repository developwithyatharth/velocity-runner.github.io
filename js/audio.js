/* =========================================================
   audio.js
   Velocity Runner: Rise of Bharat

   Features:
   - Procedural futuristic sound effects
   - Background energy ambience
   - Sound on/off button
   - Saves mute preference
   - Mobile vibration feedback
   - No external MP3 files required
========================================================= */

const GAME_AUDIO_MUTED_KEY =
  "velocityRunnerAudioMuted";

let gameAudioContext = null;
let gameMasterGain = null;

let gameAmbientNodes = [];
let gameAmbientPlaying = false;

let gameAudioMuted =
  localStorage.getItem(
    GAME_AUDIO_MUTED_KEY
  ) === "true";


/* =========================================================
   CREATE AUDIO SYSTEM
========================================================= */

function ensureGameAudio() {
  if (gameAudioContext) {
    return true;
  }

  const AudioContextClass =
    window.AudioContext ||
    window.webkitAudioContext;

  if (!AudioContextClass) {
    console.warn(
      "Web Audio API is not supported."
    );

    return false;
  }

  gameAudioContext =
    new AudioContextClass();

  gameMasterGain =
    gameAudioContext.createGain();

  gameMasterGain.gain.value =
    gameAudioMuted ? 0 : 0.65;

  gameMasterGain.connect(
    gameAudioContext.destination
  );

  return true;
}


function unlockGameAudio() {
  if (!ensureGameAudio()) {
    return;
  }

  if (
    gameAudioContext.state ===
    "suspended"
  ) {
    gameAudioContext.resume();
  }
}


/* =========================================================
   MASTER SOUND CONTROL
========================================================= */

function updateGameAudioVolume() {
  if (!gameMasterGain) {
    return;
  }

  const targetVolume =
    gameAudioMuted ? 0 : 0.65;

  gameMasterGain.gain.setTargetAtTime(
    targetVolume,
    gameAudioContext.currentTime,
    0.03
  );
}


function toggleGameAudio() {
  gameAudioMuted = !gameAudioMuted;

  localStorage.setItem(
    GAME_AUDIO_MUTED_KEY,
    String(gameAudioMuted)
  );

  updateGameAudioVolume();
  updateSoundButton();

  if (!gameAudioMuted) {
    unlockGameAudio();
    playButtonSound();
  }
}


function updateSoundButton() {
  const soundButton =
    document.getElementById("soundBtn");

  if (!soundButton) {
    return;
  }

  if (gameAudioMuted) {
    soundButton.textContent =
      "🔇 Sound";
  } else {
    soundButton.textContent =
      "🔊 Sound";
  }

  soundButton.setAttribute(
    "aria-pressed",
    String(gameAudioMuted)
  );
}


/* =========================================================
   BASIC TONE GENERATOR
========================================================= */

function playGameTone(options) {
  if (
    gameAudioMuted ||
    !ensureGameAudio()
  ) {
    return;
  }

  const settings =
    options || {};

  const currentTime =
    gameAudioContext.currentTime;

  const startTime =
    currentTime +
    (settings.delay || 0);

  const duration =
    Math.max(
      0.03,
      settings.duration || 0.15
    );

  const frequency =
    Math.max(
      20,
      settings.frequency || 440
    );

  const endFrequency =
    Math.max(
      20,
      settings.endFrequency ||
      frequency
    );

  const volume =
    Math.max(
      0.0001,
      settings.volume || 0.1
    );

  const oscillator =
    gameAudioContext.createOscillator();

  const soundGain =
    gameAudioContext.createGain();

  oscillator.type =
    settings.type || "sine";

  oscillator.frequency.setValueAtTime(
    frequency,
    startTime
  );

  oscillator.frequency.exponentialRampToValueAtTime(
    endFrequency,
    startTime + duration
  );

  soundGain.gain.setValueAtTime(
    0.0001,
    startTime
  );

  soundGain.gain.exponentialRampToValueAtTime(
    volume,
    startTime + 0.015
  );

  soundGain.gain.exponentialRampToValueAtTime(
    0.0001,
    startTime + duration
  );

  oscillator.connect(soundGain);

  soundGain.connect(gameMasterGain);

  oscillator.start(startTime);

  oscillator.stop(
    startTime +
    duration +
    0.03
  );
}


/* =========================================================
   NOISE GENERATOR
========================================================= */

function playGameNoise(
  duration,
  volume
) {
  if (
    gameAudioMuted ||
    !ensureGameAudio()
  ) {
    return;
  }

  const noiseDuration =
    Math.max(
      0.04,
      duration || 0.15
    );

  const sampleRate =
    gameAudioContext.sampleRate;

  const bufferLength =
    Math.floor(
      sampleRate *
      noiseDuration
    );

  const noiseBuffer =
    gameAudioContext.createBuffer(
      1,
      bufferLength,
      sampleRate
    );

  const noiseData =
    noiseBuffer.getChannelData(0);

  for (
    let index = 0;
    index < bufferLength;
    index++
  ) {
    noiseData[index] =
      Math.random() * 2 - 1;
  }

  const noiseSource =
    gameAudioContext.createBufferSource();

  const noiseGain =
    gameAudioContext.createGain();

  const filter =
    gameAudioContext.createBiquadFilter();

  noiseSource.buffer =
    noiseBuffer;

  filter.type = "lowpass";
  filter.frequency.value = 1200;

  const currentTime =
    gameAudioContext.currentTime;

  noiseGain.gain.setValueAtTime(
    Math.max(
      0.0001,
      volume || 0.04
    ),
    currentTime
  );

  noiseGain.gain.exponentialRampToValueAtTime(
    0.0001,
    currentTime +
    noiseDuration
  );

  noiseSource.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(gameMasterGain);

  noiseSource.start();

  noiseSource.stop(
    currentTime +
    noiseDuration +
    0.02
  );
}


/* =========================================================
   MOBILE VIBRATION
========================================================= */

function vibrateGame(pattern) {
  if (
    gameAudioMuted ||
    !navigator.vibrate
  ) {
    return;
  }

  navigator.vibrate(pattern);
}


/* =========================================================
   AMBIENT BACKGROUND SOUND
========================================================= */

function startAmbientAudio() {
  if (
    gameAudioMuted ||
    gameAmbientPlaying ||
    !ensureGameAudio()
  ) {
    return;
  }

  stopAmbientAudio();

  const ambientGain =
    gameAudioContext.createGain();

  ambientGain.gain.value = 0.025;

  ambientGain.connect(
    gameMasterGain
  );

  const lowOscillator =
    gameAudioContext.createOscillator();

  lowOscillator.type = "sine";
  lowOscillator.frequency.value = 48;

  const energyOscillator =
    gameAudioContext.createOscillator();

  energyOscillator.type = "triangle";
  energyOscillator.frequency.value = 82;

  const lowGain =
    gameAudioContext.createGain();

  lowGain.gain.value = 0.55;

  const energyGain =
    gameAudioContext.createGain();

  energyGain.gain.value = 0.18;

  lowOscillator.connect(lowGain);
  energyOscillator.connect(energyGain);

  lowGain.connect(ambientGain);
  energyGain.connect(ambientGain);

  lowOscillator.start();
  energyOscillator.start();

  gameAmbientNodes = [
    lowOscillator,
    energyOscillator,
    ambientGain,
    lowGain,
    energyGain
  ];

  gameAmbientPlaying = true;
}


function stopAmbientAudio() {
  if (!gameAmbientPlaying) {
    return;
  }

  gameAmbientNodes.forEach(
    function (node) {
      try {
        if (
          typeof node.stop ===
          "function"
        ) {
          node.stop();
        }

        if (
          typeof node.disconnect ===
          "function"
        ) {
          node.disconnect();
        }
      } catch (error) {
        // Node may already be stopped.
      }
    }
  );

  gameAmbientNodes = [];
  gameAmbientPlaying = false;
}


/* =========================================================
   PLAYER SOUNDS
========================================================= */

function playJumpSound() {
  playGameTone({
    frequency: 260,
    endFrequency: 620,
    duration: 0.18,
    volume: 0.11,
    type: "sine"
  });

  vibrateGame(18);
}


function playSlideSound() {
  playGameNoise(
    0.18,
    0.045
  );

  playGameTone({
    frequency: 180,
    endFrequency: 95,
    duration: 0.16,
    volume: 0.05,
    type: "triangle"
  });

  vibrateGame(15);
}


function playDashSound() {
  playGameTone({
    frequency: 180,
    endFrequency: 780,
    duration: 0.25,
    volume: 0.13,
    type: "sawtooth"
  });

  playGameTone({
    frequency: 360,
    endFrequency: 1040,
    duration: 0.2,
    volume: 0.06,
    type: "sine",
    delay: 0.03
  });

  vibrateGame([
    20,
    20,
    35
  ]);
}


/* =========================================================
   COMBAT SOUNDS
========================================================= */

function playShootSound() {
  playGameTone({
    frequency: 760,
    endFrequency: 180,
    duration: 0.12,
    volume: 0.09,
    type: "square"
  });

  vibrateGame(10);
}


function playDamageSound() {
  playGameNoise(
    0.28,
    0.1
  );

  playGameTone({
    frequency: 180,
    endFrequency: 55,
    duration: 0.32,
    volume: 0.16,
    type: "sawtooth"
  });

  vibrateGame([
    45,
    25,
    55
  ]);
}


function playShieldSound() {
  playGameTone({
    frequency: 320,
    endFrequency: 880,
    duration: 0.28,
    volume: 0.12,
    type: "sine"
  });

  playGameTone({
    frequency: 620,
    endFrequency: 420,
    duration: 0.35,
    volume: 0.06,
    type: "triangle",
    delay: 0.04
  });

  vibrateGame([
    18,
    15,
    18
  ]);
}


/* =========================================================
   COLLECTIBLE SOUNDS
========================================================= */

function playCollectSound() {
  playGameTone({
    frequency: 520,
    endFrequency: 840,
    duration: 0.1,
    volume: 0.075,
    type: "sine"
  });

  playGameTone({
    frequency: 740,
    endFrequency: 1080,
    duration: 0.1,
    volume: 0.045,
    type: "sine",
    delay: 0.06
  });
}


function playPowerUpSound() {
  playGameTone({
    frequency: 280,
    endFrequency: 560,
    duration: 0.22,
    volume: 0.1,
    type: "triangle"
  });

  playGameTone({
    frequency: 560,
    endFrequency: 980,
    duration: 0.26,
    volume: 0.08,
    type: "sine",
    delay: 0.1
  });

  vibrateGame([
    20,
    15,
    30
  ]);
}


/* =========================================================
   ENEMY AND BOSS SOUNDS
========================================================= */

function playDroneDestroyedSound() {
  playGameNoise(
    0.22,
    0.09
  );

  playGameTone({
    frequency: 280,
    endFrequency: 65,
    duration: 0.3,
    volume: 0.12,
    type: "square"
  });

  vibrateGame(28);
}


function playBossSound() {
  playGameTone({
    frequency: 90,
    endFrequency: 42,
    duration: 0.8,
    volume: 0.18,
    type: "sawtooth"
  });

  playGameTone({
    frequency: 180,
    endFrequency: 85,
    duration: 0.65,
    volume: 0.08,
    type: "triangle",
    delay: 0.12
  });

  vibrateGame([
    70,
    40,
    100
  ]);
}


function playGameOverSound() {
  playGameTone({
    frequency: 420,
    endFrequency: 160,
    duration: 0.45,
    volume: 0.13,
    type: "triangle"
  });

  playGameTone({
    frequency: 240,
    endFrequency: 70,
    duration: 0.65,
    volume: 0.1,
    type: "sine",
    delay: 0.2
  });
}


function playButtonSound() {
  playGameTone({
    frequency: 440,
    endFrequency: 620,
    duration: 0.08,
    volume: 0.045,
    type: "sine"
  });
}


/* =========================================================
   AUDIO BUTTON AND GAME EVENTS
========================================================= */

function setupAudioControls() {
  const soundButton =
    document.getElementById("soundBtn");

  const startButton =
    document.getElementById("startBtn");

  const restartButton =
    document.getElementById("restartBtn");

  const homeButton =
    document.getElementById("homeBtn");

  updateSoundButton();

  if (
    soundButton &&
    !soundButton.dataset.audioReady
  ) {
    soundButton.dataset.audioReady =
      "true";

    soundButton.addEventListener(
      "click",
      function () {
        unlockGameAudio();
        toggleGameAudio();
      }
    );
  }

  if (
    startButton &&
    !startButton.dataset.audioReady
  ) {
    startButton.dataset.audioReady =
      "true";

    startButton.addEventListener(
      "click",
      function () {
        unlockGameAudio();

        if (!gameAudioMuted) {
          playButtonSound();
          startAmbientAudio();
        }
      }
    );
  }

  if (
    restartButton &&
    !restartButton.dataset.audioReady
  ) {
    restartButton.dataset.audioReady =
      "true";

    restartButton.addEventListener(
      "click",
      function () {
        unlockGameAudio();

        if (!gameAudioMuted) {
          playButtonSound();
          startAmbientAudio();
        }
      }
    );
  }

  if (
    homeButton &&
    !homeButton.dataset.audioReady
  ) {
    homeButton.dataset.audioReady =
      "true";

    homeButton.addEventListener(
      "click",
      function () {
        playButtonSound();
        stopAmbientAudio();
      }
    );
  }
}


/*
  The scripts are loaded at the bottom of index.html,
  so the buttons already exist when this runs.
*/

setupAudioControls();
