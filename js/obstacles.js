/* =========================================================
   obstacles.js
   Velocity Runner: Rise of Bharat

   Phase R3B:
   - Realistic procedural 3D obstacles
   - Recognisable road and construction objects
   - No rotating glowing boxes
   - Accurate jump, slide and lane-change rules
   - Mobile-safe geometry
   - Safe recursive cleanup
========================================================= */


/* =========================================================
   MATERIAL HELPERS
========================================================= */

function createObstacleMaterial(options) {
  options = options || {};

  return new THREE.MeshStandardMaterial({
    color:
      options.color !== undefined
        ? options.color
        : 0x777777,

    roughness:
      options.roughness !== undefined
        ? options.roughness
        : 0.68,

    metalness:
      options.metalness !== undefined
        ? options.metalness
        : 0.12,

    emissive:
      options.emissive !== undefined
        ? options.emissive
        : 0x000000,

    emissiveIntensity:
      options.emissiveIntensity !== undefined
        ? options.emissiveIntensity
        : 0,

    transparent:
      Boolean(options.transparent),

    opacity:
      options.opacity !== undefined
        ? options.opacity
        : 1,

    side:
      options.side !== undefined
        ? options.side
        : THREE.FrontSide
  });
}


/* =========================================================
   BASIC MESH HELPERS
========================================================= */

function addObstacleBox(
  parent,
  width,
  height,
  depth,
  material,
  x,
  y,
  z,
  rotationX,
  rotationY,
  rotationZ
) {
  var mesh = new THREE.Mesh(
    new THREE.BoxGeometry(
      width,
      height,
      depth
    ),
    material
  );

  mesh.position.set(
    x || 0,
    y || 0,
    z || 0
  );

  mesh.rotation.set(
    rotationX || 0,
    rotationY || 0,
    rotationZ || 0
  );

  mesh.castShadow = true;
  mesh.receiveShadow = true;

  parent.add(mesh);

  return mesh;
}


function addObstacleCylinder(
  parent,
  radiusTop,
  radiusBottom,
  height,
  radialSegments,
  material,
  x,
  y,
  z,
  rotationX,
  rotationY,
  rotationZ
) {
  var mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(
      radiusTop,
      radiusBottom,
      height,
      radialSegments || 12
    ),
    material
  );

  mesh.position.set(
    x || 0,
    y || 0,
    z || 0
  );

  mesh.rotation.set(
    rotationX || 0,
    rotationY || 0,
    rotationZ || 0
  );

  mesh.castShadow = true;
  mesh.receiveShadow = true;

  parent.add(mesh);

  return mesh;
}


function addObstacleSphere(
  parent,
  radius,
  material,
  x,
  y,
  z,
  scaleX,
  scaleY,
  scaleZ
) {
  var mesh = new THREE.Mesh(
    new THREE.SphereGeometry(
      radius,
      12,
      10
    ),
    material
  );

  mesh.position.set(
    x || 0,
    y || 0,
    z || 0
  );

  mesh.scale.set(
    scaleX || 1,
    scaleY || 1,
    scaleZ || 1
  );

  mesh.castShadow = true;
  mesh.receiveShadow = true;

  parent.add(mesh);

  return mesh;
}


/* =========================================================
   WHEEL
========================================================= */

function createObstacleWheel(
  parent,
  x,
  y,
  z,
  radius,
  width
) {
  var tyreMaterial =
    createObstacleMaterial({
      color: 0x171717,
      roughness: 0.92,
      metalness: 0.02
    });

  var hubMaterial =
    createObstacleMaterial({
      color: 0x85898d,
      roughness: 0.34,
      metalness: 0.75
    });

  /*
   * Cylinder normally points vertically.
   * Rotation Z makes the axle run along X.
   */

  var tyre = addObstacleCylinder(
    parent,
    radius,
    radius,
    width,
    14,
    tyreMaterial,
    x,
    y,
    z,
    0,
    0,
    Math.PI / 2
  );

  addObstacleCylinder(
    tyre,
    radius * 0.43,
    radius * 0.43,
    width + 0.012,
    12,
    hubMaterial,
    0,
    0,
    0,
    0,
    0,
    0
  );

  return tyre;
}


/* =========================================================
   WARNING PANNEL
========================================================= */

function createObstacleWarningPanel(
  parent,
  width,
  height,
  x,
  y,
  z
) {
  var panelGroup =
    new THREE.Group();

  panelGroup.position.set(
    x,
    y,
    z
  );

  parent.add(panelGroup);

  var yellowMaterial =
    createObstacleMaterial({
      color: 0xe7a72c,
      roughness: 0.58,
      metalness: 0.12
    });

  var blackMaterial =
    createObstacleMaterial({
      color: 0x222222,
      roughness: 0.82,
      metalness: 0.02
    });

  addObstacleBox(
    panelGroup,
    width,
    height,
    0.055,
    yellowMaterial,
    0,
    0,
    0
  );

  var stripeCount = 5;

  for (
    var stripeIndex = 0;
    stripeIndex < stripeCount;
    stripeIndex++
  ) {
    var stripeX =
      -width * 0.38 +
      stripeIndex *
        (
          width * 0.76 /
          (stripeCount - 1)
        );

    addObstacleBox(
      panelGroup,
      width * 0.09,
      height * 1.05,
      0.065,
      blackMaterial,
      stripeX,
      0,
      0.012,
      0,
      0,
      -0.42
    );
  }

  return panelGroup;
}


/* =========================================================
   BLINKING HAZARD LIGHT
========================================================= */

function createHazardLight(
  parent,
  x,
  y,
  z
) {
  var baseMaterial =
    createObstacleMaterial({
      color: 0x303236,
      roughness: 0.42,
      metalness: 0.6
    });

  var lightMaterial =
    createObstacleMaterial({
      color: 0xf2a11f,
      roughness: 0.28,
      metalness: 0.12,
      emissive: 0xff7b00,
      emissiveIntensity: 0.35
    });

  addObstacleCylinder(
    parent,
    0.105,
    0.125,
    0.07,
    12,
    baseMaterial,
    x,
    y - 0.065,
    z
  );

  var lamp = addObstacleCylinder(
    parent,
    0.08,
    0.1,
    0.14,
    12,
    lightMaterial,
    x,
    y,
    z
  );

  return {
    mesh: lamp,
    material: lightMaterial
  };
}


/* =========================================================
   BLOCK OBSTACLE 1
   NEO BHARAT AUTO-RICKSHAW
========================================================= */

function createAutoRickshawObstacle() {
  var obstacle =
    new THREE.Group();

  obstacle.name =
    "Realistic Auto Rickshaw";

  var greenMaterial =
    createObstacleMaterial({
      color: 0x295c3d,
      roughness: 0.62,
      metalness: 0.14
    });

  var darkGreenMaterial =
    createObstacleMaterial({
      color: 0x193e2d,
      roughness: 0.72,
      metalness: 0.1
    });

  var yellowMaterial =
    createObstacleMaterial({
      color: 0xd7a326,
      roughness: 0.55,
      metalness: 0.12
    });

  var darkMaterial =
    createObstacleMaterial({
      color: 0x202326,
      roughness: 0.75,
      metalness: 0.2
    });

  var glassMaterial =
    createObstacleMaterial({
      color: 0x8eb1bb,
      roughness: 0.18,
      metalness: 0.1,
      transparent: true,
      opacity: 0.58
    });

  var chromeMaterial =
    createObstacleMaterial({
      color: 0xaeb2b5,
      roughness: 0.25,
      metalness: 0.82
    });

  var headlightMaterial =
    createObstacleMaterial({
      color: 0xffe3a2,
      roughness: 0.22,
      metalness: 0.08,
      emissive: 0xffbd54,
      emissiveIntensity: 0.25
    });

  /* Chassis */

  addObstacleBox(
    obstacle,
    1.52,
    0.26,
    1.42,
    darkGreenMaterial,
    0,
    0.48,
    -0.05
  );

  /* Passenger body */

  addObstacleBox(
    obstacle,
    1.42,
    0.72,
    1.05,
    greenMaterial,
    0,
    0.91,
    -0.25
  );

  /* Front nose */

  addObstacleBox(
    obstacle,
    1.02,
    0.52,
    0.58,
    greenMaterial,
    0,
    0.79,
    0.66
  );

  /* Roof */

  addObstacleBox(
    obstacle,
    1.62,
    0.13,
    1.38,
    yellowMaterial,
    0,
    1.61,
    -0.08
  );

  /* Roof supports */

  var supportPositions = [
    [-0.65, 1.28, 0.42],
    [0.65, 1.28, 0.42],
    [-0.65, 1.28, -0.62],
    [0.65, 1.28, -0.62]
  ];

  supportPositions.forEach(
    function (position) {
      addObstacleBox(
        obstacle,
        0.07,
        0.65,
        0.07,
        darkMaterial,
        position[0],
        position[1],
        position[2]
      );
    }
  );

  /* Front windshield */

  addObstacleBox(
    obstacle,
    0.94,
    0.47,
    0.045,
    glassMaterial,
    0,
    1.24,
    0.735,
    -0.06,
    0,
    0
  );

  /* Side windows */

  addObstacleBox(
    obstacle,
    0.045,
    0.46,
    0.7,
    glassMaterial,
    -0.715,
    1.25,
    -0.05
  );

  addObstacleBox(
    obstacle,
    0.045,
    0.46,
    0.7,
    glassMaterial,
    0.715,
    1.25,
    -0.05
  );

  /* Front bumper */

  addObstacleBox(
    obstacle,
    1.12,
    0.11,
    0.1,
    chromeMaterial,
    0,
    0.48,
    0.99
  );

  /* Headlights */

  addObstacleSphere(
    obstacle,
    0.105,
    headlightMaterial,
    -0.32,
    0.78,
    0.96,
    1.1,
    0.8,
    0.42
  );

  addObstacleSphere(
    obstacle,
    0.105,
    headlightMaterial,
    0.32,
    0.78,
    0.96,
    1.1,
    0.8,
    0.42
  );

  /* Number plate */

  addObstacleBox(
    obstacle,
    0.42,
    0.13,
    0.035,
    chromeMaterial,
    0,
    0.56,
    1.02
  );

  /* Three wheels */

  createObstacleWheel(
    obstacle,
    0,
    0.3,
    0.63,
    0.28,
    0.18
  );

  createObstacleWheel(
    obstacle,
    -0.68,
    0.3,
    -0.55,
    0.3,
    0.17
  );

  createObstacleWheel(
    obstacle,
    0.68,
    0.3,
    -0.55,
    0.3,
    0.17
  );

  var hazardLight =
    createHazardLight(
      obstacle,
      0,
      1.78,
      -0.12
    );

  obstacle.userData.blinkMaterials = [
    hazardLight.material
  ];

  obstacle.userData.objectName =
    "Abandoned Auto-Rickshaw";

  obstacle.userData.hitHalfX =
    0.8;

  obstacle.userData.hitHalfZ =
    1.04;

  return obstacle;
}


/* =========================================================
   BLOCK OBSTACLE 2
   MAINTENANCE DELIVERY VAN
========================================================= */

function createMaintenanceVanObstacle() {
  var obstacle =
    new THREE.Group();

  obstacle.name =
    "Realistic Maintenance Van";

  var bodyMaterial =
    createObstacleMaterial({
      color: 0xb7b1a5,
      roughness: 0.68,
      metalness: 0.18
    });

  var orangeMaterial =
    createObstacleMaterial({
      color: 0xc96624,
      roughness: 0.58,
      metalness: 0.16
    });

  var darkMaterial =
    createObstacleMaterial({
      color: 0x24272a,
      roughness: 0.78,
      metalness: 0.18
    });

  var glassMaterial =
    createObstacleMaterial({
      color: 0x77909a,
      roughness: 0.18,
      metalness: 0.18,
      transparent: true,
      opacity: 0.62
    });

  var bumperMaterial =
    createObstacleMaterial({
      color: 0x50545a,
      roughness: 0.44,
      metalness: 0.62
    });

  var lightMaterial =
    createObstacleMaterial({
      color: 0xffe5ab,
      roughness: 0.2,
      emissive: 0xffc266,
      emissiveIntensity: 0.22
    });

  /* Main van body */

  addObstacleBox(
    obstacle,
    1.7,
    1.1,
    1.72,
    bodyMaterial,
    0,
    0.92,
    -0.18
  );

  /* Front cabin section */

  addObstacleBox(
    obstacle,
    1.62,
    0.72,
    0.66,
    orangeMaterial,
    0,
    1.15,
    0.91
  );

  /* Lower front */

  addObstacleBox(
    obstacle,
    1.66,
    0.48,
    0.5,
    orangeMaterial,
    0,
    0.62,
    0.99
  );

  /* Windshield */

  addObstacleBox(
    obstacle,
    1.24,
    0.44,
    0.045,
    glassMaterial,
    0,
    1.3,
    1.255,
    -0.05,
    0,
    0
  );

  /* Windshield divider */

  addObstacleBox(
    obstacle,
    0.045,
    0.46,
    0.055,
    darkMaterial,
    0,
    1.3,
    1.28
  );

  /* Side mirrors */

  addObstacleBox(
    obstacle,
    0.22,
    0.15,
    0.08,
    darkMaterial,
    -0.98,
    1.23,
    0.93
  );

  addObstacleBox(
    obstacle,
    0.22,
    0.15,
    0.08,
    darkMaterial,
    0.98,
    1.23,
    0.93
  );

  /* Front grille */

  addObstacleBox(
    obstacle,
    0.72,
    0.28,
    0.045,
    darkMaterial,
    0,
    0.65,
    1.275
  );

  /* Bumper */

  addObstacleBox(
    obstacle,
    1.76,
    0.13,
    0.12,
    bumperMaterial,
    0,
    0.37,
    1.3
  );

  /* Headlights */

  addObstacleBox(
    obstacle,
    0.28,
    0.16,
    0.055,
    lightMaterial,
    -0.52,
    0.78,
    1.29
  );

  addObstacleBox(
    obstacle,
    0.28,
    0.16,
    0.055,
    lightMaterial,
    0.52,
    0.78,
    1.29
  );

  /* Side maintenance stripe */

  addObstacleBox(
    obstacle,
    0.035,
    0.18,
    1.45,
    orangeMaterial,
    -0.86,
    0.95,
    -0.18
  );

  addObstacleBox(
    obstacle,
    0.035,
    0.18,
    1.45,
    orangeMaterial,
    0.86,
    0.95,
    -0.18
  );

  /* Four wheels */

  createObstacleWheel(
    obstacle,
    -0.79,
    0.3,
    0.73,
    0.3,
    0.18
  );

  createObstacleWheel(
    obstacle,
    0.79,
    0.3,
    0.73,
    0.3,
    0.18
  );

  createObstacleWheel(
    obstacle,
    -0.79,
    0.3,
    -0.78,
    0.3,
    0.18
  );

  createObstacleWheel(
    obstacle,
    0.79,
    0.3,
    -0.78,
    0.3,
    0.18
  );

  var leftHazard =
    createHazardLight(
      obstacle,
      -0.46,
      1.57,
      0.58
    );

  var rightHazard =
    createHazardLight(
      obstacle,
      0.46,
      1.57,
      0.58
    );

  obstacle.userData.blinkMaterials = [
    leftHazard.material,
    rightHazard.material
  ];

  obstacle.userData.objectName =
    "Stopped Maintenance Van";

  obstacle.userData.hitHalfX =
    0.84;

  obstacle.userData.hitHalfZ =
    1.13;

  return obstacle;
}


/* =========================================================
   LOW OBSTACLE 1
   CONCRETE ROAD DIVIDER
========================================================= */

function createConcreteDividerObstacle() {
  var obstacle =
    new THREE.Group();

  obstacle.name =
    "Concrete Road Divider";

  var concreteMaterial =
    createObstacleMaterial({
      color: 0xa39f95,
      roughness: 0.94,
      metalness: 0.01
    });

  var wornConcreteMaterial =
    createObstacleMaterial({
      color: 0x827f78,
      roughness: 0.96,
      metalness: 0
    });

  /* Wide weighted base */

  addObstacleBox(
    obstacle,
    1.86,
    0.24,
    0.72,
    wornConcreteMaterial,
    0,
    0.12,
    0
  );

  /* Tapered appearance through stacked sections */

  addObstacleBox(
    obstacle,
    1.66,
    0.34,
    0.64,
    concreteMaterial,
    0,
    0.38,
    0
  );

  addObstacleBox(
    obstacle,
    1.38,
    0.26,
    0.56,
    concreteMaterial,
    0,
    0.68,
    0
  );

  createObstacleWarningPanel(
    obstacle,
    1.06,
    0.3,
    0,
    0.56,
    0.315
  );

  var leftLamp =
    createHazardLight(
      obstacle,
      -0.68,
      0.96,
      0
    );

  var rightLamp =
    createHazardLight(
      obstacle,
      0.68,
      0.96,
      0
    );

  obstacle.userData.blinkMaterials = [
    leftLamp.material,
    rightLamp.material
  ];

  obstacle.userData.objectName =
    "Concrete Road Divider";

  obstacle.userData.hitHalfX =
    0.88;

  obstacle.userData.hitHalfZ =
    0.68;

  obstacle.userData.minimumJumpHeight =
    0.58;

  return obstacle;
}


/* =========================================================
   LOW OBSTACLE 2
   SANDBAG BARRICADE
========================================================= */

function createSandbagBarricadeObstacle() {
  var obstacle =
    new THREE.Group();

  obstacle.name =
    "Realistic Sandbag Barricade";

  var sandMaterial =
    createObstacleMaterial({
      color: 0xa78b59,
      roughness: 0.97,
      metalness: 0
    });

  var darkSandMaterial =
    createObstacleMaterial({
      color: 0x897044,
      roughness: 0.98,
      metalness: 0
    });

  var ropeMaterial =
    createObstacleMaterial({
      color: 0x4e402b,
      roughness: 0.96,
      metalness: 0
    });

  function addSandbag(
    x,
    y,
    z,
    rotationY,
    alternate
  ) {
    var bag = addObstacleSphere(
      obstacle,
      0.42,
      alternate
        ? darkSandMaterial
        : sandMaterial,
      x,
      y,
      z,
      1,
      0.42,
      0.62
    );

    bag.rotation.y =
      rotationY || 0;

    var rope = addObstacleCylinder(
      bag,
      0.045,
      0.045,
      0.46,
      8,
      ropeMaterial,
      0,
      0,
      0,
      Math.PI / 2,
      0,
      0
    );

    rope.scale.z = 0.8;

    return bag;
  }

  /* Bottom row */

  addSandbag(
    -0.58,
    0.22,
    0,
    0.06,
    false
  );

  addSandbag(
    0,
    0.22,
    0.02,
    -0.04,
    true
  );

  addSandbag(
    0.58,
    0.22,
    0,
    0.05,
    false
  );

  /* Top row */

  addSandbag(
    -0.3,
    0.54,
    0,
    -0.05,
    true
  );

  addSandbag(
    0.3,
    0.54,
    0,
    0.04,
    false
  );

  createObstacleWarningPanel(
    obstacle,
    0.82,
    0.23,
    0,
    0.58,
    0.39
  );

  obstacle.userData.objectName =
    "Sandbag Barricade";

  obstacle.userData.hitHalfX =
    0.86;

  obstacle.userData.hitHalfZ =
    0.68;

  obstacle.userData.minimumJumpHeight =
    0.48;

  return obstacle;
}


/* =========================================================
   SLIDE OBSTACLE 1
   CONSTRUCTION SCAFFOLD
========================================================= */

function createScaffoldObstacle() {
  var obstacle =
    new THREE.Group();

  obstacle.name =
    "Construction Scaffold";

  var steelMaterial =
    createObstacleMaterial({
      color: 0x596168,
      roughness: 0.38,
      metalness: 0.72
    });

  var darkSteelMaterial =
    createObstacleMaterial({
      color: 0x33383d,
      roughness: 0.44,
      metalness: 0.68
    });

  var boardMaterial =
    createObstacleMaterial({
      color: 0xbd712d,
      roughness: 0.72,
      metalness: 0.04
    });

  /* Vertical supports */

  addObstacleBox(
    obstacle,
    0.12,
    2.24,
    0.14,
    steelMaterial,
    -0.94,
    1.12,
    0
  );

  addObstacleBox(
    obstacle,
    0.12,
    2.24,
    0.14,
    steelMaterial,
    0.94,
    1.12,
    0
  );

  /* Ground feet */

  addObstacleBox(
    obstacle,
    0.42,
    0.1,
    0.48,
    darkSteelMaterial,
    -0.94,
    0.05,
    0
  );

  addObstacleBox(
    obstacle,
    0.42,
    0.1,
    0.48,
    darkSteelMaterial,
    0.94,
    0.05,
    0
  );

  /* Top frame */

  addObstacleBox(
    obstacle,
    2.02,
    0.15,
    0.16,
    steelMaterial,
    0,
    2.18,
    0
  );

  /* Low plank requiring slide */

  addObstacleBox(
    obstacle,
    2.02,
    0.28,
    0.5,
    boardMaterial,
    0,
    1.63,
    0
  );

  createObstacleWarningPanel(
    obstacle,
    1.12,
    0.24,
    0,
    1.64,
    0.27
  );

  /* Cross braces */

  addObstacleBox(
    obstacle,
    0.08,
    2.05,
    0.08,
    steelMaterial,
    -0.47,
    1.12,
    -0.04,
    0,
    0,
    -0.72
  );

  addObstacleBox(
    obstacle,
    0.08,
    2.05,
    0.08,
    steelMaterial,
    0.47,
    1.12,
    -0.04,
    0,
    0,
    0.72
  );

  var leftLamp =
    createHazardLight(
      obstacle,
      -0.78,
      1.9,
      0.12
    );

  var rightLamp =
    createHazardLight(
      obstacle,
      0.78,
      1.9,
      0.12
    );

  obstacle.userData.blinkMaterials = [
    leftLamp.material,
    rightLamp.material
  ];

  obstacle.userData.objectName =
    "Construction Scaffold";

  obstacle.userData.hitHalfX =
    0.94;

  obstacle.userData.hitHalfZ =
    0.72;

  return obstacle;
}


/* =========================================================
   SLIDE OBSTACLE 2
   OVERHEAD UTILITY PIPE
========================================================= */

function createUtilityPipeObstacle() {
  var obstacle =
    new THREE.Group();

  obstacle.name =
    "Overhead Utility Pipe";

  var postMaterial =
    createObstacleMaterial({
      color: 0x4d555a,
      roughness: 0.42,
      metalness: 0.68
    });

  var pipeMaterial =
    createObstacleMaterial({
      color: 0x787c78,
      roughness: 0.48,
      metalness: 0.58
    });

  var rustMaterial =
    createObstacleMaterial({
      color: 0x8b4f2e,
      roughness: 0.76,
      metalness: 0.2
    });

  var cableMaterial =
    createObstacleMaterial({
      color: 0x1e2021,
      roughness: 0.82,
      metalness: 0.22
    });

  /* Support posts */

  addObstacleBox(
    obstacle,
    0.16,
    2.18,
    0.18,
    postMaterial,
    -0.94,
    1.09,
    0
  );

  addObstacleBox(
    obstacle,
    0.16,
    2.18,
    0.18,
    postMaterial,
    0.94,
    1.09,
    0
  );

  /* Post feet */

  addObstacleBox(
    obstacle,
    0.44,
    0.1,
    0.5,
    rustMaterial,
    -0.94,
    0.05,
    0
  );

  addObstacleBox(
    obstacle,
    0.44,
    0.1,
    0.5,
    rustMaterial,
    0.94,
    0.05,
    0
  );

  /*
   * Main pipe runs horizontally along X.
   */

  addObstacleCylinder(
    obstacle,
    0.19,
    0.19,
    2.12,
    16,
    pipeMaterial,
    0,
    1.62,
    0,
    0,
    0,
    Math.PI / 2
  );

  /* Pipe clamps */

  addObstacleCylinder(
    obstacle,
    0.225,
    0.225,
    0.12,
    14,
    rustMaterial,
    -0.65,
    1.62,
    0,
    0,
    0,
    Math.PI / 2
  );

  addObstacleCylinder(
    obstacle,
    0.225,
    0.225,
    0.12,
    14,
    rustMaterial,
    0.65,
    1.62,
    0,
    0,
    0,
    Math.PI / 2
  );

  /* Hanging cables */

  var leftCable = addObstacleCylinder(
    obstacle,
    0.025,
    0.025,
    0.48,
    8,
    cableMaterial,
    -0.48,
    1.28,
    0.08
  );

  var rightCable = addObstacleCylinder(
    obstacle,
    0.025,
    0.025,
    0.42,
    8,
    cableMaterial,
    0.48,
    1.31,
    0.08
  );

  obstacle.userData.swingParts = [
    {
      mesh: leftCable,
      baseRotationZ: 0,
      offset: 0
    },
    {
      mesh: rightCable,
      baseRotationZ: 0,
      offset: Math.PI
    }
  ];

  createObstacleWarningPanel(
    obstacle,
    0.96,
    0.24,
    0,
    1.93,
    0.12
  );

  var hazard =
    createHazardLight(
      obstacle,
      0,
      2.18,
      0
    );

  obstacle.userData.blinkMaterials = [
    hazard.material
  ];

  obstacle.userData.objectName =
    "Low Utility Pipe";

  obstacle.userData.hitHalfX =
    0.94;

  obstacle.userData.hitHalfZ =
    0.72;

  return obstacle;
}


/* =========================================================
   REALISTIC OBSTACLE FACTORY
========================================================= */

function createRealisticBlockObstacle() {
  return Math.random() < 0.52
    ? createAutoRickshawObstacle()
    : createMaintenanceVanObstacle();
}


function createRealisticLowObstacle() {
  return Math.random() < 0.54
    ? createConcreteDividerObstacle()
    : createSandbagBarricadeObstacle();
}


function createRealisticSlideObstacle() {
  return Math.random() < 0.52
    ? createScaffoldObstacle()
    : createUtilityPipeObstacle();
}


/* =========================================================
   SPAWN OBSTACLE
   Overrides the old enemies.js version
========================================================= */

function spawnObstacle() {
  if (
    !obstacleGroup ||
    !Array.isArray(lanes)
  ) {
    return;
  }

  var lane =
    typeof chooseBalancedObstacleLane ===
      "function"
      ? chooseBalancedObstacleLane()
      : Math.floor(
          Math.random() * 3
        );

  lane = THREE.MathUtils.clamp(
    Number(lane) || 0,
    0,
    2
  );

  var obstacleType =
    typeof chooseBalancedObstacleType ===
      "function"
      ? chooseBalancedObstacleType()
      : "block";

  /*
   * Protect compatibility in case an older balance
   * file returns "high" rather than "slide".
   */

  if (obstacleType === "high") {
    obstacleType = "slide";
  }

  if (
    obstacleType !== "block" &&
    obstacleType !== "low" &&
    obstacleType !== "slide"
  ) {
    obstacleType = "block";
  }

  var obstacle;

  if (obstacleType === "low") {
    obstacle =
      createRealisticLowObstacle();
  } else if (
    obstacleType === "slide"
  ) {
    obstacle =
      createRealisticSlideObstacle();
  } else {
    obstacle =
      createRealisticBlockObstacle();
  }

  if (!obstacle) {
    return;
  }

  obstacle.userData.type =
    obstacleType;

  obstacle.userData.laneIndex =
    lane;

  obstacle.userData.spawnTime =
    Date.now();

  obstacle.userData.animationPhase =
    Math.random() *
    Math.PI *
    2;

  obstacle.userData.hitHalfX =
    Number.isFinite(
      obstacle.userData.hitHalfX
    )
      ? obstacle.userData.hitHalfX
      : 0.84;

  obstacle.userData.hitHalfZ =
    Number.isFinite(
      obstacle.userData.hitHalfZ
    )
      ? obstacle.userData.hitHalfZ
      : 0.78;

  obstacle.position.set(
    lanes[lane],
    0,
    -105
  );

  /*
   * Tiny realistic placement variation.
   * Slide obstacles stay perfectly aligned for fairness.
   */

  if (obstacleType !== "slide") {
    obstacle.rotation.y =
      (
        Math.random() -
        0.5
      ) * 0.035;
  }

  obstacle.traverse(
    function (child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    }
  );

  obstacles.push(obstacle);
  obstacleGroup.add(obstacle);
}


/* =========================================================
   ANIMATE REALISTIC DETAILS
========================================================= */

function updateRealisticObstacleDetails(
  obstacle,
  currentTime
) {
  if (
    !obstacle ||
    !obstacle.userData
  ) {
    return;
  }

  var phase =
    obstacle.userData.animationPhase ||
    0;

  var blinkMaterials =
    obstacle.userData.blinkMaterials;

  if (
    Array.isArray(
      blinkMaterials
    )
  ) {
    var blinkWave =
      Math.sin(
        currentTime * 0.012 +
        phase
      );

    var blinkIntensity =
      blinkWave > 0.08
        ? 1.15
        : 0.16;

    blinkMaterials.forEach(
      function (material) {
        if (
          material &&
          material.emissive
        ) {
          material.emissiveIntensity =
            blinkIntensity;
        }
      }
    );
  }

  var swingParts =
    obstacle.userData.swingParts;

  if (
    Array.isArray(
      swingParts
    )
  ) {
    swingParts.forEach(
      function (swingPart) {
        if (
          !swingPart ||
          !swingPart.mesh
        ) {
          return;
        }

        swingPart.mesh.rotation.z =
          swingPart.baseRotationZ +
          Math.sin(
            currentTime * 0.004 +
            phase +
            swingPart.offset
          ) * 0.055;
      }
    );
  }
}


/* =========================================================
   COLLISION RESPONSE
========================================================= */

function hasPlayerClearedObstacle(
  obstacle
) {
  if (
    !obstacle ||
    !obstacle.userData
  ) {
    return false;
  }

  var type =
    obstacle.userData.type;

  if (type === "low") {
    var minimumJumpHeight =
      Number.isFinite(
        obstacle.userData
          .minimumJumpHeight
      )
        ? obstacle.userData
            .minimumJumpHeight
        : 0.55;

    return (
      isJumping &&
      player.position.y >=
        minimumJumpHeight
    );
  }

  if (type === "slide") {
    return Boolean(isSliding);
  }

  /*
   * Full-sized vehicle:
   * it cannot be jumped or slid under.
   */

  return false;
}


/* =========================================================
   UPDATE OBSTACLES
========================================================= */

function updateObstacles() {
  if (
    !player ||
    !Array.isArray(obstacles)
  ) {
    return;
  }

  var currentTime =
    Date.now();

  for (
    var obstacleIndex =
      obstacles.length - 1;

    obstacleIndex >= 0;

    obstacleIndex--
  ) {
    var obstacle =
      obstacles[obstacleIndex];

    if (!obstacle) {
      obstacles.splice(
        obstacleIndex,
        1
      );

      continue;
    }

    /*
     * Obstacles remain upright and realistic.
     * The old continuous rotation has been removed.
     */

    obstacle.position.z += speed;

    updateRealisticObstacleDetails(
      obstacle,
      currentTime
    );

    if (
      obstacle.position.z > 9
    ) {
      removeObstacle(
        obstacle,
        obstacleIndex
      );

      continue;
    }

    var differenceZ =
      Math.abs(
        obstacle.position.z -
        player.position.z
      );

    var differenceX =
      Math.abs(
        obstacle.position.x -
        player.position.x
      );

    var hitHalfZ =
      obstacle.userData.hitHalfZ ||
      0.78;

    var hitHalfX =
      obstacle.userData.hitHalfX ||
      0.84;

    var intersectsLane =
      differenceX < hitHalfX;

    var intersectsDepth =
      differenceZ < hitHalfZ;

    if (
      intersectsLane &&
      intersectsDepth
    ) {
      var cleared =
        hasPlayerClearedObstacle(
          obstacle
        );

      if (!cleared) {
        if (
          typeof triggerCameraShake ===
          "function"
        ) {
          triggerCameraShake(
            0.18
          );
        }

        if (
          typeof setMission ===
          "function"
        ) {
          setMission(
            "Collision: " +
              (
                obstacle.userData
                  .objectName ||
                "road obstacle"
              ),
            75
          );
        }

        endGame();
        return;
      }
    }
  }
}


/* =========================================================
   SAFE MATERIAL DISPOSAL
========================================================= */

function disposeObstacleMaterial(
  material
) {
  if (!material) {
    return;
  }

  var textureProperties = [
    "map",
    "alphaMap",
    "normalMap",
    "roughnessMap",
    "metalnessMap",
    "emissiveMap",
    "aoMap"
  ];

  textureProperties.forEach(
    function (propertyName) {
      if (
        material[propertyName] &&
        typeof material[propertyName]
          .dispose === "function"
      ) {
        material[propertyName]
          .dispose();
      }
    }
  );

  material.dispose();
}


/* =========================================================
   REMOVE OBSTACLE
   Supports grouped multi-mesh objects
========================================================= */

function removeObstacle(
  obstacle,
  obstacleIndex
) {
  if (!obstacle) {
    return;
  }

  if (
    obstacleGroup &&
    obstacle.parent ===
      obstacleGroup
  ) {
    obstacleGroup.remove(
      obstacle
    );
  } else if (
    obstacle.parent
  ) {
    obstacle.parent.remove(
      obstacle
    );
  }

  var disposedGeometries =
    new Set();

  var disposedMaterials =
    new Set();

  obstacle.traverse(
    function (child) {
      if (
        child.geometry &&
        !disposedGeometries.has(
          child.geometry
        )
      ) {
        disposedGeometries.add(
          child.geometry
        );

        child.geometry.dispose();
      }

      if (!child.material) {
        return;
      }

      var materials =
        Array.isArray(
          child.material
        )
          ? child.material
          : [child.material];

      materials.forEach(
        function (material) {
          if (
            material &&
            !disposedMaterials.has(
              material
            )
          ) {
            disposedMaterials.add(
              material
            );

            disposeObstacleMaterial(
              material
            );
          }
        }
      );
    }
  );

  if (
    obstacleIndex >= 0 &&
    obstacleIndex <
      obstacles.length
  ) {
    obstacles.splice(
      obstacleIndex,
      1
    );
  } else {
    var foundIndex =
      obstacles.indexOf(
        obstacle
      );

    if (foundIndex !== -1) {
      obstacles.splice(
        foundIndex,
        1
      );
    }
  }
}


window
  .velocityRealisticObstaclesReady =
  true;

console.log(
  "Velocity Runner R3B realistic obstacles loaded."
);
