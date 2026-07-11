/* =========================================================
   effects.js
   Velocity Runner: Rise of Bharat

   Stable rendering system
   - Uses normal Three.js rendering
   - Prevents black screen caused by EffectComposer
   - Keeps cinematic camera shake
   - Bloom can be restored later after the game is stable
========================================================= */


/* =========================================================
   POST-PROCESSING STATE
========================================================= */

var composer = null;
var bloomPass = null;

/*
  Keep bloom disabled for now.

  The previous EffectComposer configuration was generating
  a completely black canvas even though the game was running.
*/

var bloomEnabled = false;


/* =========================================================
   CAMERA SHAKE STATE
========================================================= */

var cameraShakeStrength = 0;

var cameraBaseX = 0;
var cameraBaseY = 4.8;
var cameraBaseZ = 8.5;


/* =========================================================
   INITIALIZE RENDERING
========================================================= */

function initPostProcessing() {
  /*
    Do not create EffectComposer right now.

    The normal renderer is more stable across desktop,
    mobile and GitHub Pages.
  */

  composer = null;
  bloomPass = null;
  bloomEnabled = false;

  console.log(
    "Velocity Runner: stable renderer enabled."
  );
}


/* =========================================================
   RENDER GAME FRAME
========================================================= */

function renderGameFrame() {
  if (
    !renderer ||
    !scene ||
    !camera
  ) {
    return;
  }

  /*
    Always use the standard Three.js renderer.

    This prevents the black screen caused by the previous
    EffectComposer rendering pipeline.
  */

  renderer.render(
    scene,
    camera
  );
}


/* =========================================================
   RESIZE RENDERING
========================================================= */

function resizePostProcessing() {
  if (
    !renderer ||
    !camera
  ) {
    return;
  }

  const width =
    window.innerWidth;

  const height =
    window.innerHeight;

  renderer.setSize(
    width,
    height
  );

  renderer.setPixelRatio(
    Math.min(
      window.devicePixelRatio || 1,
      2
    )
  );

  camera.aspect =
    width / height;

  camera.updateProjectionMatrix();

  /*
    Kept for future compatibility if bloom is restored.
  */

  if (
    composer &&
    typeof composer.setSize ===
      "function"
  ) {
    composer.setSize(
      width,
      height
    );
  }
}


/* =========================================================
   CAMERA SHAKE
========================================================= */

function triggerCameraShake(
  strength = 0.08
) {
  cameraShakeStrength =
    Math.max(
      cameraShakeStrength,
      strength
    );
}


/* =========================================================
   CINEMATIC CAMERA
========================================================= */

function updateCinematicCamera() {
  if (
    !camera ||
    !player
  ) {
    return;
  }

  /*
    Follow the player's lane gently.
  */

  const targetCameraX =
    player.position.x * 0.12;

  cameraBaseX +=
    (
      targetCameraX -
      cameraBaseX
    ) * 0.06;


  /*
    Slight speed-based camera movement.
  */

  const speedOffset =
    Math.min(
      0.55,
      Math.max(
        0,
        speed - START_SPEED
      ) * 0.8
    );


  const targetCameraY =
    4.8 +
    speedOffset * 0.2;


  const targetCameraZ =
    8.5 +
    speedOffset;


  cameraBaseY +=
    (
      targetCameraY -
      cameraBaseY
    ) * 0.04;


  cameraBaseZ +=
    (
      targetCameraZ -
      cameraBaseZ
    ) * 0.04;


  /*
    Apply temporary camera shake.
  */

  let shakeX = 0;
  let shakeY = 0;
  let shakeZ = 0;


  if (cameraShakeStrength > 0.001) {
    shakeX =
      (
        Math.random() - 0.5
      ) * cameraShakeStrength;

    shakeY =
      (
        Math.random() - 0.5
      ) * cameraShakeStrength;

    shakeZ =
      (
        Math.random() - 0.5
      ) * cameraShakeStrength;


    cameraShakeStrength *= 0.86;
  } else {
    cameraShakeStrength = 0;
  }


  camera.position.set(
    cameraBaseX + shakeX,
    cameraBaseY + shakeY,
    cameraBaseZ + shakeZ
  );


  /*
    Look slightly ahead of the player.
  */

  camera.lookAt(
    player.position.x * 0.08,
    player.position.y + 1.25,
    -8
  );
}
