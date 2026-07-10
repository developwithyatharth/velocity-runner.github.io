/* effects.js
   Cinematic camera and optional bloom effects

   Bloom automatically disables on:
   - Small screens
   - Low-powered devices
   - Reduced-motion preference
   - Unsupported browsers
*/

let composer = null;
let renderScenePass = null;
let bloomPass = null;

let bloomEnabled = false;
let cameraShakeStrength = 0;

/* -----------------------------------------
   Post-processing
----------------------------------------- */

function initPostProcessing() {
  composer = null;
  renderScenePass = null;
  bloomPass = null;
  bloomEnabled = false;

  if (!renderer || !scene || !camera) return;

  const hasRequiredClasses =
    typeof THREE.EffectComposer !== "undefined" &&
    typeof THREE.RenderPass !== "undefined" &&
    typeof THREE.UnrealBloomPass !== "undefined";

  const isSmallScreen = window.innerWidth < 760;

  const isLowPoweredDevice =
    navigator.hardwareConcurrency &&
    navigator.hardwareConcurrency <= 4;

  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (
    !hasRequiredClasses ||
    isSmallScreen ||
    isLowPoweredDevice ||
    prefersReducedMotion
  ) {
    console.info("Velocity Runner: lightweight rendering mode active.");
    return;
  }

  try {
    composer = new THREE.EffectComposer(renderer);

    renderScenePass = new THREE.RenderPass(scene, camera);

    bloomPass = new THREE.UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.82,
      0.42,
      0.18
    );

    bloomPass.threshold = 0.17;
    bloomPass.strength = 0.82;
    bloomPass.radius = 0.38;

    composer.addPass(renderScenePass);
    composer.addPass(bloomPass);

    bloomEnabled = true;

    console.info("Velocity Runner: cinematic bloom enabled.");
  } catch (error) {
    console.warn(
      "Bloom could not start. Standard rendering will be used.",
      error
    );

    composer = null;
    bloomPass = null;
    bloomEnabled = false;
  }
}

function renderGameFrame() {
  if (bloomEnabled && composer) {
    composer.render();
    return;
  }

  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
}

function resizePostProcessing() {
  if (composer) {
    composer.setSize(window.innerWidth, window.innerHeight);
  }

  if (bloomPass) {
    bloomPass.setSize(window.innerWidth, window.innerHeight);
  }
}

/* -----------------------------------------
   Camera effects
----------------------------------------- */

function triggerCameraShake(strength = 0.1) {
  cameraShakeStrength = Math.max(
    cameraShakeStrength,
    strength
  );
}

function updateCinematicCamera() {
  if (!camera || !player) return;

  const speedDifference = Math.max(
    0,
    speed - START_SPEED
  );

  const speedFovIncrease = Math.min(
    10,
    speedDifference * 22
  );

  const jumpFovIncrease = isJumping ? 1.2 : 0;

  const targetFov =
    68 +
    speedFovIncrease +
    jumpFovIncrease;

  camera.fov += (targetFov - camera.fov) * 0.06;
  camera.updateProjectionMatrix();

  let shakeX = 0;
  let shakeY = 0;
  let shakeZ = 0;

  if (cameraShakeStrength > 0.001) {
    shakeX =
      (Math.random() - 0.5) *
      cameraShakeStrength;

    shakeY =
      (Math.random() - 0.5) *
      cameraShakeStrength;

    shakeZ =
      (Math.random() - 0.5) *
      cameraShakeStrength *
      0.5;

    cameraShakeStrength *= 0.88;
  } else {
    cameraShakeStrength = 0;
  }

  const targetCameraX =
    player.position.x * 0.3 + shakeX;

  camera.position.x +=
    (targetCameraX - camera.position.x) * 0.08;

  camera.position.y =
    5.2 +
    Math.sin(Date.now() * 0.002) * 0.025 +
    shakeY;

  camera.position.z = 9.2 + shakeZ;

  camera.lookAt(
    player.position.x * 0.16,
    0.48,
    -13
  );
}
