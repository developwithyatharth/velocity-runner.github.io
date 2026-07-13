/* =========================================================
   effects.js
   Velocity Runner: Rise of Bharat

   Stylized-realistic rendering foundation
   - Stable standard Three.js renderer
   - No EffectComposer black-screen risk
   - Sunset sky atmosphere
   - Smooth professional runner camera
   - Controlled camera shake
   - Mobile-safe rendering quality
========================================================= */


/* =========================================================
   RENDERING STATE
========================================================= */

var composer = null;
var bloomPass = null;
var bloomEnabled = false;


/* =========================================================
   SKY STATE
========================================================= */

var realisticSkyDome = null;


/* =========================================================
   CAMERA STATE
========================================================= */

var cameraShakeStrength = 0;

var cameraBaseX = 0;
var cameraBaseY = 5.25;
var cameraBaseZ = 9.4;

var cameraLookX = 0;
var cameraLookY = 1.45;
var cameraLookZ = -13;

var cameraLastUpdateTime = 0;
var cameraLastCallTime = 0;

var cameraLookTarget = null;


/* =========================================================
   SAFE HELPERS
========================================================= */

function getEffectsNumber(
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


function getEffectsSpeed() {
  if (
    typeof speed === "number" &&
    Number.isFinite(speed)
  ) {
    return Math.max(
      0,
      speed
    );
  }

  return 0.34;
}


function getEffectsStartSpeed() {
  if (
    typeof START_SPEED === "number" &&
    Number.isFinite(START_SPEED)
  ) {
    return Math.max(
      0.01,
      START_SPEED
    );
  }

  return 0.34;
}


function isEffectsMobile() {
  return (
    typeof window !== "undefined" &&
    window.innerWidth <= 720
  );
}


function getEffectsPixelRatio() {
  var deviceRatio =
    window.devicePixelRatio || 1;

  var maximumRatio =
    isEffectsMobile()
      ? 1.25
      : 1.6;

  return Math.min(
    deviceRatio,
    maximumRatio
  );
}


/* =========================================================
   INITIALIZE RENDERING
========================================================= */

function initPostProcessing() {
  /*
   * We deliberately use the standard renderer.
   * Bloom remains disabled until the realistic
   * materials and environment are stable.
   */

  composer = null;
  bloomPass = null;
  bloomEnabled = false;

  realisticSkyDome = null;

  cameraBaseX = 0;
  cameraBaseY = 5.25;
  cameraBaseZ = 9.4;

  cameraLookX = 0;
  cameraLookY = 1.45;
  cameraLookZ = -13;

  cameraLastUpdateTime = 0;
  cameraLastCallTime = 0;

  cameraLookTarget =
    new THREE.Vector3(
      cameraLookX,
      cameraLookY,
      cameraLookZ
    );

  configureRealisticRenderer();

  createRealisticSkyEnvironment();

  console.log(
    "Velocity Runner: stylized-realistic renderer enabled."
  );
}


/* =========================================================
   CONFIGURE RENDERER
========================================================= */

function configureRealisticRenderer() {
  if (!renderer) {
    return;
  }

  renderer.setPixelRatio(
    getEffectsPixelRatio()
  );

  renderer.shadowMap.enabled =
    true;

  renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;

  renderer.shadowMap.autoUpdate =
    true;

  if (
    typeof THREE.ACESFilmicToneMapping !==
    "undefined"
  ) {
    renderer.toneMapping =
      THREE.ACESFilmicToneMapping;

    /*
     * Lower exposure prevents white road glare
     * and preserves surface colours.
     */

    renderer.toneMappingExposure =
      0.92;
  }

  if (
    typeof THREE.sRGBEncoding !==
    "undefined"
  ) {
    renderer.outputEncoding =
      THREE.sRGBEncoding;
  }

  if (
    "physicallyCorrectLights" in renderer
  ) {
    renderer.physicallyCorrectLights =
      true;
  }

  renderer.setClearColor(
    0x91a9bd,
    1
  );

  if (renderer.domElement) {
    renderer.domElement.style.imageRendering =
      "auto";

    renderer.domElement.style.touchAction =
      "none";
  }
}


/* =========================================================
   REALISTIC SKY DOME
========================================================= */

function createRealisticSkyEnvironment() {
  if (
    !scene ||
    typeof THREE === "undefined"
  ) {
    return;
  }

  var skyGeometry =
    new THREE.SphereGeometry(
      410,
      isEffectsMobile()
        ? 24
        : 36,
      isEffectsMobile()
        ? 16
        : 24
    );

  var skyMaterial =
    new THREE.ShaderMaterial({
      side: THREE.BackSide,

      depthWrite: false,

      fog: false,

      uniforms: {
        topColor: {
          value:
            new THREE.Color(
              0x315d8a
            )
        },

        upperColor: {
          value:
            new THREE.Color(
              0x78a8c8
            )
        },

        horizonColor: {
          value:
            new THREE.Color(
              0xf1b27c
            )
        },

        lowerColor: {
          value:
            new THREE.Color(
              0x6f7580
            )
        },

        sunDirection: {
          value:
            new THREE.Vector3(
              -0.38,
              0.32,
              -1
            ).normalize()
        },

        sunColor: {
          value:
            new THREE.Color(
              0xffd6a0
            )
        }
      },

      vertexShader: [
        "varying vec3 vWorldPosition;",

        "void main() {",

        "  vec4 worldPosition =",
        "    modelMatrix *",
        "    vec4(position, 1.0);",

        "  vWorldPosition =",
        "    worldPosition.xyz;",

        "  gl_Position =",
        "    projectionMatrix *",
        "    modelViewMatrix *",
        "    vec4(position, 1.0);",

        "}"
      ].join("\n"),

      fragmentShader: [
        "uniform vec3 topColor;",
        "uniform vec3 upperColor;",
        "uniform vec3 horizonColor;",
        "uniform vec3 lowerColor;",
        "uniform vec3 sunDirection;",
        "uniform vec3 sunColor;",

        "varying vec3 vWorldPosition;",

        "void main() {",

        "  vec3 direction =",
        "    normalize(vWorldPosition);",

        "  float heightValue =",
        "    clamp(",
        "      direction.y * 0.5 + 0.5,",
        "      0.0,",
        "      1.0",
        "    );",

        "  vec3 skyColor =",
        "    mix(",
        "      lowerColor,",
        "      horizonColor,",
        "      smoothstep(",
        "        0.08,",
        "        0.42,",
        "        heightValue",
        "      )",
        "    );",

        "  skyColor =",
        "    mix(",
        "      skyColor,",
        "      upperColor,",
        "      smoothstep(",
        "        0.38,",
        "        0.7,",
        "        heightValue",
        "      )",
        "    );",

        "  skyColor =",
        "    mix(",
        "      skyColor,",
        "      topColor,",
        "      smoothstep(",
        "        0.68,",
        "        1.0,",
        "        heightValue",
        "      )",
        "    );",

        "  float sunAmount =",
        "    pow(",
        "      max(",
        "        dot(",
        "          direction,",
        "          sunDirection",
        "        ),",
        "        0.0",
        "      ),",
        "      180.0",
        "    );",

        "  float sunGlow =",
        "    pow(",
        "      max(",
        "        dot(",
        "          direction,",
        "          sunDirection",
        "        ),",
        "        0.0",
        "      ),",
        "      14.0",
        "    );",

        "  skyColor +=",
        "    sunColor *",
        "    sunAmount *",
        "    1.4;",

        "  skyColor +=",
        "    sunColor *",
        "    sunGlow *",
        "    0.12;",

        "  gl_FragColor =",
        "    vec4(",
        "      skyColor,",
        "      1.0",
        "    );",

        "}"
      ].join("\n")
    });

  realisticSkyDome =
    new THREE.Mesh(
      skyGeometry,
      skyMaterial
    );

  realisticSkyDome.name =
    "RealisticSkyDome";

  realisticSkyDome.frustumCulled =
    false;

  scene.add(
    realisticSkyDome
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

  renderer.render(
    scene,
    camera
  );
}


/* =========================================================
   RESIZE
========================================================= */

function resizePostProcessing() {
  if (!renderer) {
    return;
  }

  renderer.setPixelRatio(
    getEffectsPixelRatio()
  );

  if (
    composer &&
    typeof composer.setSize ===
      "function"
  ) {
    composer.setSize(
      window.innerWidth,
      window.innerHeight
    );
  }
}


/* =========================================================
   CAMERA SHAKE
========================================================= */

function triggerCameraShake(
  strength
) {
  cameraShakeStrength =
    Math.max(
      cameraShakeStrength,

      getEffectsNumber(
        strength,
        0.08
      )
    );
}


/* =========================================================
   CINEMATIC RUNNER CAMERA
========================================================= */

function updateCinematicCamera() {
  if (
    !camera ||
    !player
  ) {
    return;
  }

  var currentMilliseconds =
    typeof performance !==
      "undefined"
      ? performance.now()
      : Date.now();

  /*
   * visuals.js and main.js may both call this
   * function during the same frame. This guard
   * prevents double camera updates.
   */

  if (
    currentMilliseconds -
      cameraLastCallTime <
    2
  ) {
    return;
  }

  cameraLastCallTime =
    currentMilliseconds;

  var currentTime =
    currentMilliseconds *
    0.001;

  var deltaTime =
    cameraLastUpdateTime > 0
      ? Math.min(
          0.05,

          (
            currentMilliseconds -
            cameraLastUpdateTime
          ) *
          0.001
        )
      : 0.016;

  cameraLastUpdateTime =
    currentMilliseconds;

  var smoothPosition =
    1 -
    Math.exp(
      -5.4 *
      deltaTime
    );

  var smoothLook =
    1 -
    Math.exp(
      -7 *
      deltaTime
    );

  var currentSpeed =
    getEffectsSpeed();

  var startSpeed =
    getEffectsStartSpeed();

  var speedProgress =
    THREE.MathUtils.clamp(
      (
        currentSpeed -
        startSpeed
      ) /
      Math.max(
        0.01,
        startSpeed * 1.8
      ),

      0,
      1
    );

  var targetCameraX =
    player.position.x *
    0.1;

  var targetCameraY =
    5.25 +
    speedProgress *
    0.22;

  var targetCameraZ =
    9.4 +
    speedProgress *
    0.42;

  cameraBaseX +=
    (
      targetCameraX -
      cameraBaseX
    ) *
    smoothPosition;

  cameraBaseY +=
    (
      targetCameraY -
      cameraBaseY
    ) *
    smoothPosition;

  cameraBaseZ +=
    (
      targetCameraZ -
      cameraBaseZ
    ) *
    smoothPosition;


  /* Natural running movement */

  var bobStrength =
    gamePaused
      ? 0
      : 0.012 +
        speedProgress *
        0.018;

  var cameraBobY =
    Math.sin(
      currentTime * 8
    ) *
    bobStrength;

  var cameraSwayX =
    Math.sin(
      currentTime * 2
    ) *
    bobStrength *
    0.45;


  /* Camera shake */

  var shakeX = 0;
  var shakeY = 0;
  var shakeZ = 0;

  if (
    cameraShakeStrength >
    0.001
  ) {
    shakeX =
      (
        Math.random() -
        0.5
      ) *
      cameraShakeStrength;

    shakeY =
      (
        Math.random() -
        0.5
      ) *
      cameraShakeStrength;

    shakeZ =
      (
        Math.random() -
        0.5
      ) *
      cameraShakeStrength *
      0.55;

    cameraShakeStrength *=
      Math.pow(
        0.012,
        deltaTime
      );
  } else {
    cameraShakeStrength = 0;
  }


  camera.position.set(
    cameraBaseX +
      cameraSwayX +
      shakeX,

    cameraBaseY +
      cameraBobY +
      shakeY,

    cameraBaseZ +
      shakeZ
  );


  /* Look farther down the road */

  var targetLookX =
    player.position.x *
    0.075;

  var targetLookY =
    player.position.y +
    1.35;

  var targetLookZ =
    -14 -
    speedProgress *
    2.2;

  cameraLookX +=
    (
      targetLookX -
      cameraLookX
    ) *
    smoothLook;

  cameraLookY +=
    (
      targetLookY -
      cameraLookY
    ) *
    smoothLook;

  cameraLookZ +=
    (
      targetLookZ -
      cameraLookZ
    ) *
    smoothLook;

  cameraLookTarget.set(
    cameraLookX,
    cameraLookY,
    cameraLookZ
  );

  camera.lookAt(
    cameraLookTarget
  );


  /* Small lane-change lean */

  camera.rotation.z =
    -player.position.x *
    0.004 +
    shakeX *
    0.02;


  /* Mild speed-based FOV */

  var targetFov =
    56 +
    speedProgress *
    3;

  camera.fov +=
    (
      targetFov -
      camera.fov
    ) *
    smoothPosition;

  camera.updateProjectionMatrix();
}
