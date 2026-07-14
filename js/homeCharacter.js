/* =========================================================
   homeCharacter.js
   RunNova Phase H1C

   Original procedural 3D hero and Nova Board.
========================================================= */

(function () {
  "use strict";

  var characterRoot = null;
  var characterBody = null;
  var boardRoot = null;

  var leftArm = null;
  var rightArm = null;

  var leftHairTail = null;
  var rightHairTail = null;

  var boardGlowMaterials = [];
  var boardLights = [];
  var orbitParticles = null;

  var initialized = false;
  var resizeHandler = null;


  /* =======================================================
     MATERIAL HELPERS
  ======================================================= */

  function createMaterial(options) {
    options = options || {};

    return new THREE.MeshStandardMaterial({
      color:
        options.color !== undefined
          ? options.color
          : 0xffffff,

      roughness:
        options.roughness !== undefined
          ? options.roughness
          : 0.58,

      metalness:
        options.metalness !== undefined
          ? options.metalness
          : 0.08,

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

      depthWrite:
        options.depthWrite !== undefined
          ? options.depthWrite
          : true,

      side:
        options.side !== undefined
          ? options.side
          : THREE.FrontSide
    });
  }


  /* =======================================================
     GEOMETRY HELPERS
  ======================================================= */

  function addBox(
    parent,
    width,
    height,
    depth,
    meshMaterial,
    x,
    y,
    z
  ) {
    var mesh =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          width,
          height,
          depth
        ),
        meshMaterial
      );

    mesh.position.set(
      x || 0,
      y || 0,
      z || 0
    );

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    parent.add(mesh);

    return mesh;
  }


  function addSphere(
    parent,
    radius,
    meshMaterial,
    x,
    y,
    z,
    scaleX,
    scaleY,
    scaleZ
  ) {
    var mesh =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          radius,
          18,
          14
        ),
        meshMaterial
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


  function addCylinder(
    parent,
    radiusTop,
    radiusBottom,
    height,
    segments,
    meshMaterial,
    x,
    y,
    z
  ) {
    var mesh =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          radiusTop,
          radiusBottom,
          height,
          segments || 14
        ),
        meshMaterial
      );

    mesh.position.set(
      x || 0,
      y || 0,
      z || 0
    );

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    parent.add(mesh);

    return mesh;
  }


  function createSegment(
    parent,
    start,
    end,
    radius,
    meshMaterial
  ) {
    var direction =
      end.clone().sub(start);

    var length =
      direction.length();

    var midpoint =
      start
        .clone()
        .add(end)
        .multiplyScalar(0.5);

    var segment =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          radius,
          radius * 0.93,
          length,
          12
        ),
        meshMaterial
      );

    segment.position.copy(
      midpoint
    );

    segment.quaternion
      .setFromUnitVectors(
        new THREE.Vector3(
          0,
          1,
          0
        ),
        direction
          .clone()
          .normalize()
      );

    segment.castShadow = true;
    segment.receiveShadow = true;

    parent.add(segment);

    return segment;
  }


  function createStarGeometry() {
    var starShape =
      new THREE.Shape();

    var outerRadius = 0.3;
    var innerRadius = 0.13;
    var points = 5;

    for (
      var pointIndex = 0;
      pointIndex <
        points * 2;
      pointIndex++
    ) {
      var radius =
        pointIndex % 2 === 0
          ? outerRadius
          : innerRadius;

      var angle =
        -Math.PI / 2 +
        pointIndex *
          Math.PI /
          points;

      var x =
        Math.cos(angle) *
        radius;

      var y =
        Math.sin(angle) *
        radius;

      if (pointIndex === 0) {
        starShape.moveTo(
          x,
          y
        );
      } else {
        starShape.lineTo(
          x,
          y
        );
      }
    }

    starShape.closePath();

    return new THREE.ExtrudeGeometry(
      starShape,
      {
        depth: 0.045,
        bevelEnabled: true,
        bevelThickness: 0.015,
        bevelSize: 0.015,
        bevelSegments: 2
      }
    );
  }


  /* =======================================================
     NOVA BOARD
  ======================================================= */

  function createNovaBoard() {
    boardRoot =
      new THREE.Group();

    boardRoot.name =
      "Nova Board";


    var hullMaterial =
      createMaterial({
        color: 0xf4f8ff,
        roughness: 0.3,
        metalness: 0.42
      });


    var darkMaterial =
      createMaterial({
        color: 0x252d62,
        roughness: 0.38,
        metalness: 0.48
      });


    var purpleMaterial =
      createMaterial({
        color: 0x7653e8,
        roughness: 0.34,
        metalness: 0.4,
        emissive: 0x4826bc,
        emissiveIntensity: 0.16
      });


    var cyanGlowMaterial =
      createMaterial({
        color: 0x49fff5,
        roughness: 0.2,
        metalness: 0.22,
        emissive: 0x18e9f3,
        emissiveIntensity: 1.1
      });


    var magentaGlowMaterial =
      createMaterial({
        color: 0xff62c2,
        roughness: 0.22,
        metalness: 0.18,
        emissive: 0xe628af,
        emissiveIntensity: 0.85
      });


    var boardGeometry;

    if (
      typeof THREE
        .CapsuleGeometry !==
      "undefined"
    ) {
      boardGeometry =
        new THREE.CapsuleGeometry(
          0.54,
          2.65,
          8,
          18
        );
    } else {
      boardGeometry =
        new THREE.SphereGeometry(
          1,
          20,
          12
        );
    }


    var boardHull =
      new THREE.Mesh(
        boardGeometry,
        hullMaterial
      );


    if (
      typeof THREE
        .CapsuleGeometry !==
      "undefined"
    ) {
      boardHull.rotation.z =
        Math.PI / 2;

      boardHull.scale.set(
        1,
        0.32,
        1
      );
    } else {
      boardHull.scale.set(
        1.9,
        0.22,
        0.62
      );
    }


    boardHull.position.y =
      0.34;

    boardHull.castShadow = true;
    boardHull.receiveShadow = true;

    boardRoot.add(
      boardHull
    );


    var topPlate =
      addBox(
        boardRoot,
        2.9,
        0.14,
        0.72,
        darkMaterial,
        0,
        0.53,
        0
      );

    topPlate.rotation.z =
      -0.025;


    addBox(
      boardRoot,
      1.12,
      0.08,
      0.78,
      purpleMaterial,
      -0.82,
      0.63,
      0
    );


    addBox(
      boardRoot,
      1.12,
      0.08,
      0.78,
      purpleMaterial,
      0.82,
      0.63,
      0
    );


    var leftRail =
      addBox(
        boardRoot,
        2.82,
        0.08,
        0.08,
        cyanGlowMaterial,
        0,
        0.35,
        0.54
      );


    var rightRail =
      addBox(
        boardRoot,
        2.82,
        0.08,
        0.08,
        magentaGlowMaterial,
        0,
        0.35,
        -0.54
      );


    boardGlowMaterials.push(
      cyanGlowMaterial,
      magentaGlowMaterial
    );


    var leftThruster =
      addSphere(
        boardRoot,
        0.38,
        cyanGlowMaterial,
        -1.35,
        0.12,
        0,
        1.4,
        0.28,
        0.9
      );


    var rightThruster =
      addSphere(
        boardRoot,
        0.38,
        cyanGlowMaterial,
        1.35,
        0.12,
        0,
        1.4,
        0.28,
        0.9
      );


    boardLights.push(
      leftThruster,
      rightThruster,
      leftRail,
      rightRail
    );


    var underGlowMaterial =
      new THREE.MeshBasicMaterial({
        color: 0x38f4ff,
        transparent: true,
        opacity: 0.34,
        depthWrite: false
      });


    var underGlow =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          1,
          18,
          10
        ),
        underGlowMaterial
      );


    underGlow.position.y =
      0.02;

    underGlow.scale.set(
      2.05,
      0.16,
      0.78
    );

    boardRoot.add(
      underGlow
    );
     /*
 * Soft contact shadow gives the board visual weight.
 */

var boardShadow =
  new THREE.Mesh(
    new THREE.CircleGeometry(
      1.75,
      32
    ),

    new THREE.MeshBasicMaterial({
      color: 0x153568,
      transparent: true,
      opacity: 0.2,
      depthWrite: false
    })
  );

boardShadow.rotation.x =
  -Math.PI / 2;

boardShadow.position.y =
  -0.13;

boardShadow.scale.set(
  1.35,
  0.5,
  1
);

boardRoot.add(
  boardShadow
);

    boardGlowMaterials.push(
      underGlowMaterial
    );


    var boardLight =
      new THREE.PointLight(
        0x35efff,
        1.15,
        7,
        2
      );

    boardLight.position.set(
      0,
      -0.05,
      0.5
    );

    boardRoot.add(
      boardLight
    );


    return boardRoot;
  }


  /* =======================================================
     SHOES
  ======================================================= */

  function createShoe(
    parent,
    x,
    y,
    z,
    rotationY
  ) {
    var shoeGroup =
      new THREE.Group();


    var shoeMaterial =
      createMaterial({
        color: 0xf8f9ff,
        roughness: 0.45
      });


    var darkSoleMaterial =
      createMaterial({
        color: 0x272a55,
        roughness: 0.75
      });


    var cyanMaterial =
      createMaterial({
        color: 0x4ff4ed,
        roughness: 0.34,
        emissive: 0x24bfc7,
        emissiveIntensity: 0.18
      });


    addBox(
      shoeGroup,
      0.43,
      0.22,
      0.72,
      darkSoleMaterial,
      0,
      0,
      0.05
    );


    addBox(
      shoeGroup,
      0.39,
      0.27,
      0.62,
      shoeMaterial,
      0,
      0.16,
      0.02
    );


    addBox(
      shoeGroup,
      0.28,
      0.05,
      0.44,
      cyanMaterial,
      0,
      0.31,
      0.06
    );


    shoeGroup.position.set(
      x,
      y,
      z
    );

    shoeGroup.rotation.y =
      rotationY || 0;

    parent.add(
      shoeGroup
    );

    return shoeGroup;
  }


  /* =======================================================
     CHARACTER
  ======================================================= */

  function createRunNovaCharacter() {
    characterBody =
      new THREE.Group();

    characterBody.name =
      "Nova Runner";


    var skinMaterial =
      createMaterial({
        color: 0xd98c6c,
        roughness: 0.7
      });


    var skinHighlightMaterial =
      createMaterial({
        color: 0xeaaa86,
        roughness: 0.65
      });


    var jacketMaterial =
      createMaterial({
        color: 0x159eb8,
        roughness: 0.5,
        metalness: 0.08
      });


    var jacketDarkMaterial =
      createMaterial({
        color: 0x114f7c,
        roughness: 0.62
      });


    var shirtMaterial =
      createMaterial({
        color: 0x181c35,
        roughness: 0.72
      });


    var pantsMaterial =
      createMaterial({
        color: 0x1c2048,
        roughness: 0.74
      });


    var purpleFabricMaterial =
      createMaterial({
        color: 0x7c47da,
        roughness: 0.6
      });


    var magentaFabricMaterial =
      createMaterial({
        color: 0xe94a9f,
        roughness: 0.58
      });


    var hairDarkMaterial =
      createMaterial({
        color: 0x21183f,
        roughness: 0.58
      });


    var hairPurpleMaterial =
      createMaterial({
        color: 0x6335a4,
        roughness: 0.5
      });


    var hairMagentaMaterial =
      createMaterial({
        color: 0xd73598,
        roughness: 0.48
      });


    var eyeWhiteMaterial =
      createMaterial({
        color: 0xffffff,
        roughness: 0.42
      });


    var eyeDarkMaterial =
      createMaterial({
        color: 0x1b1a33,
        roughness: 0.52
      });


    var accentMaterial =
      createMaterial({
        color: 0x4af4ef,
        roughness: 0.3,
        emissive: 0x20cfd2,
        emissiveIntensity: 0.3
      });


    /* Pelvis */

    addSphere(
      characterBody,
      0.46,
      pantsMaterial,
      0,
      2.04,
      0,
      1,
      0.75,
      0.8
    );


    /* Torso */

    var torso =
      addCylinder(
        characterBody,
        0.55,
        0.43,
        1.15,
        16,
        shirtMaterial,
        0,
        2.82,
        0
      );

    torso.rotation.x =
      -0.08;


    /* Jacket panels */

    var leftJacketPanel =
      addBox(
        characterBody,
        0.45,
        1.04,
        0.2,
        jacketMaterial,
        -0.29,
        2.84,
        0.38
      );

    leftJacketPanel.rotation.z =
      -0.07;


    var rightJacketPanel =
      addBox(
        characterBody,
        0.45,
        1.04,
        0.2,
        jacketMaterial,
        0.29,
        2.84,
        0.38
      );

    rightJacketPanel.rotation.z =
      0.07;


    addBox(
      characterBody,
      1.12,
      0.16,
      0.18,
      jacketDarkMaterial,
      0,
      3.32,
      0.34
    );


    /* Chest star */

    var chestStar =
      new THREE.Mesh(
        createStarGeometry(),
        accentMaterial
      );

    chestStar.position.set(
      0,
      2.9,
      0.51
    );

    chestStar.rotation.x =
      Math.PI / 2;

    chestStar.scale.setScalar(
      0.72
    );

    chestStar.castShadow = true;

    characterBody.add(
      chestStar
    );


    /* Neck */

    addCylinder(
      characterBody,
      0.17,
      0.19,
      0.28,
      14,
      skinMaterial,
      0,
      3.55,
      0
    );


    /* Head */

    addSphere(
      characterBody,
      0.54,
      skinHighlightMaterial,
      0,
      4.12,
      0.06,
      0.86,
      1.05,
      0.88
    );


    /* Ears */

    addSphere(
      characterBody,
      0.11,
      skinMaterial,
      -0.47,
      4.12,
      0.05,
      0.55,
      0.9,
      0.55
    );


    addSphere(
      characterBody,
      0.11,
      skinMaterial,
      0.47,
      4.12,
      0.05,
      0.55,
      0.9,
      0.55
    );


    /* Eyes */

    addSphere(
      characterBody,
      0.105,
      eyeWhiteMaterial,
      -0.19,
      4.18,
      0.48,
      1.18,
      0.72,
      0.35
    );


    addSphere(
      characterBody,
      0.105,
      eyeWhiteMaterial,
      0.19,
      4.18,
      0.48,
      1.18,
      0.72,
      0.35
    );


    addSphere(
      characterBody,
      0.05,
      eyeDarkMaterial,
      -0.18,
      4.18,
      0.56,
      1,
      1,
      0.48
    );


    addSphere(
      characterBody,
      0.05,
      eyeDarkMaterial,
      0.18,
      4.18,
      0.56,
      1,
      1,
      0.48
    );


    /* Eyebrows */

    var leftBrow =
      addBox(
        characterBody,
        0.24,
        0.035,
        0.03,
        hairDarkMaterial,
        -0.19,
        4.35,
        0.53
      );

    leftBrow.rotation.z =
      0.1;


    var rightBrow =
      addBox(
        characterBody,
        0.24,
        0.035,
        0.03,
        hairDarkMaterial,
        0.19,
        4.35,
        0.53
      );

    rightBrow.rotation.z =
      -0.1;


    /* Nose */

    addSphere(
      characterBody,
      0.055,
      skinMaterial,
      0,
      4.06,
      0.57,
      0.65,
      0.85,
      0.45
    );


    /* Smile */

    var smileMaterial =
      createMaterial({
        color: 0x7b2947,
        roughness: 0.7
      });


    var smile =
      addBox(
        characterBody,
        0.22,
        0.035,
        0.025,
        smileMaterial,
        0.03,
        3.93,
        0.55
      );

    smile.rotation.z =
      -0.08;


    /* Hair cap */

    addSphere(
      characterBody,
      0.57,
      hairDarkMaterial,
      -0.04,
      4.39,
      -0.02,
      0.94,
      0.72,
      0.92
    );


    /* Swept fringe */

    var fringe =
      addSphere(
        characterBody,
        0.4,
        hairPurpleMaterial,
        -0.2,
        4.46,
        0.34,
        1.25,
        0.46,
        0.58
      );

    fringe.rotation.z =
      -0.35;


    /* Animated hair tails */

    leftHairTail =
      addSphere(
        characterBody,
        0.36,
        hairPurpleMaterial,
        -0.5,
        4.28,
        -0.2,
        1.35,
        0.42,
        0.62
      );

    leftHairTail.rotation.z =
      0.28;


    rightHairTail =
      addSphere(
        characterBody,
        0.33,
        hairMagentaMaterial,
        -0.75,
        4.12,
        -0.12,
        1.45,
        0.36,
        0.58
      );

    rightHairTail.rotation.z =
      0.48;


    /* Legs */

    var leftHip =
      new THREE.Vector3(
        -0.27,
        2.03,
        0
      );

    var leftKnee =
      new THREE.Vector3(
        -0.48,
        1.32,
        0.22
      );

    var leftAnkle =
      new THREE.Vector3(
        -0.7,
        0.69,
        0.15
      );


    var rightHip =
      new THREE.Vector3(
        0.27,
        2.03,
        0
      );

    var rightKnee =
      new THREE.Vector3(
        0.52,
        1.38,
        -0.18
      );

    var rightAnkle =
      new THREE.Vector3(
        0.72,
        0.69,
        -0.12
      );


    createSegment(
      characterBody,
      leftHip,
      leftKnee,
      0.18,
      pantsMaterial
    );


    createSegment(
      characterBody,
      leftKnee,
      leftAnkle,
      0.16,
      purpleFabricMaterial
    );


    createSegment(
      characterBody,
      rightHip,
      rightKnee,
      0.18,
      pantsMaterial
    );


    createSegment(
      characterBody,
      rightKnee,
      rightAnkle,
      0.16,
      magentaFabricMaterial
    );


    createShoe(
      characterBody,
      -0.73,
      0.58,
      0.2,
      -0.08
    );


    createShoe(
      characterBody,
      0.75,
      0.58,
      -0.08,
      0.09
    );


    /* Arms */

    leftArm =
      new THREE.Group();

    rightArm =
      new THREE.Group();


    leftArm.position.set(
      -0.52,
      3.27,
      0
    );


    rightArm.position.set(
      0.52,
      3.27,
      0
    );


    characterBody.add(
      leftArm,
      rightArm
    );


    createSegment(
      leftArm,
      new THREE.Vector3(
        0,
        0,
        0
      ),
      new THREE.Vector3(
        -0.52,
        -0.35,
        0.2
      ),
      0.15,
      jacketMaterial
    );


    createSegment(
      leftArm,
      new THREE.Vector3(
        -0.52,
        -0.35,
        0.2
      ),
      new THREE.Vector3(
        -0.98,
        -0.7,
        0.45
      ),
      0.12,
      skinMaterial
    );


    addSphere(
      leftArm,
      0.15,
      skinHighlightMaterial,
      -1,
      -0.71,
      0.46,
      0.8,
      1,
      0.65
    );


    createSegment(
      rightArm,
      new THREE.Vector3(
        0,
        0,
        0
      ),
      new THREE.Vector3(
        0.48,
        -0.25,
        0.35
      ),
      0.15,
      jacketMaterial
    );


    createSegment(
      rightArm,
      new THREE.Vector3(
        0.48,
        -0.25,
        0.35
      ),
      new THREE.Vector3(
        0.94,
        -0.48,
        0.55
      ),
      0.12,
      skinMaterial
    );


    addSphere(
      rightArm,
      0.15,
      skinHighlightMaterial,
      0.96,
      -0.49,
      0.56,
      0.8,
      1,
      0.65
    );
/*
 * Dynamic balancing pose.
 * This avoids the stiff T-pose appearance.
 */

characterBody.rotation.y =
  0.08;

characterBody.rotation.x =
  -0.035;

characterBody.rotation.z =
  -0.025;

if (leftArm) {
  leftArm.rotation.x =
    -0.2;

  leftArm.rotation.y =
    -0.12;

  leftArm.rotation.z =
    0.34;
}

if (rightArm) {
  rightArm.rotation.x =
    0.14;

  rightArm.rotation.y =
    0.15;

  rightArm.rotation.z =
    -0.48;
}

    return characterBody;
  }


  /* =======================================================
     ORBIT PARTICLES
  ======================================================= */

  function createOrbitParticles() {
    orbitParticles =
      new THREE.Group();

    var particleMaterial =
      new THREE.MeshBasicMaterial({
        color: 0x69fff6,
        transparent: true,
        opacity: 0.75,
        depthWrite: false
      });


    for (
      var particleIndex = 0;
      particleIndex < 18;
      particleIndex++
    ) {
      var particle =
        new THREE.Mesh(
          new THREE.SphereGeometry(
            0.035,
            6,
            4
          ),
          particleMaterial.clone()
        );


      var angle =
        particleIndex /
        18 *
        Math.PI *
        2;


      particle.position.set(
        Math.cos(angle) *
          (
            1.55 +
            Math.random() *
              0.45
          ),

        0.1 +
          Math.random() *
            0.6,

        Math.sin(angle) *
          0.7
      );


      particle.userData.phase =
        angle;


      orbitParticles.add(
        particle
      );
    }


    characterRoot.add(
      orbitParticles
    );
  }


  /* =======================================================
     CHARACTER LIGHTING
  ======================================================= */

  function addCharacterLighting() {
    var keyLight =
      new THREE.PointLight(
        0xffffff,
        1.45,
        14,
        2
      );


    keyLight.position.set(
      -2.2,
      5.6,
      5.4
    );


    characterRoot.add(
      keyLight
    );


    var rimLight =
      new THREE.PointLight(
        0xff70c8,
        0.72,
        9,
        2
      );


    rimLight.position.set(
      2.8,
      4.3,
      -1.5
    );


    characterRoot.add(
      rimLight
    );
  }


  /* =======================================================
     RESPONSIVE SCALE
  ======================================================= */

function resizeCharacter() {
  if (!characterRoot) {
    return;
  }

  var width =
    window.innerWidth;

  var height =
    window.innerHeight;

  /*
   * The runner is the main visual attraction.
   * It should occupy roughly one-third of the screen height.
   */

  var characterScale =
    width < 760
      ? 0.94
      : width < 1100
        ? 1.25
        : 1.46;

  if (height < 650) {
    characterScale *= 0.9;
  }

  var characterY =
    width < 760
      ? 2.1
      : 2.55;

  var characterZ =
    width < 760
      ? 7
      : 7.4;

  if (height < 650) {
    characterY = 2.25;
  }

  characterRoot.scale.setScalar(
    characterScale
  );

  characterRoot.position.set(
    0,
    characterY,
    characterZ
  );

  characterRoot.userData.baseY =
    characterY;
}


  /* =======================================================
     IDLE ANIMATION
  ======================================================= */

  function updateCharacter(
    deltaTime,
    elapsedTime,
    reducedMotion
  ) {
    if (
      !characterRoot ||
      !boardRoot ||
      !characterBody
    ) {
      return;
    }


    if (reducedMotion) {
      characterRoot.position.y =
        characterRoot.userData.baseY;

      return;
    }


    var hover =
      Math.sin(
        elapsedTime * 1.5
      ) * 0.09;


    var balance =
      Math.sin(
        elapsedTime * 0.78
      );


    characterRoot.position.y =
      characterRoot.userData.baseY +
      hover;


    characterRoot.rotation.y =
      -0.05 +
      Math.sin(
        elapsedTime * 0.36
      ) * 0.025;


    boardRoot.rotation.z =
      balance * 0.045;


    boardRoot.rotation.x =
      0.035 +
      Math.sin(
        elapsedTime * 1.15
      ) * 0.018;


    characterBody.rotation.z =
      -balance * 0.018;


    characterBody.position.y =
      Math.sin(
        elapsedTime * 1.5 +
        0.6
      ) * 0.018;


    characterBody.scale.y =
      1 +
      Math.sin(
        elapsedTime * 1.9
      ) * 0.006;


    if (leftArm) {
      leftArm.rotation.z =
        Math.sin(
          elapsedTime * 0.9
        ) * 0.035;
    }


    if (rightArm) {
      rightArm.rotation.z =
        -Math.sin(
          elapsedTime * 0.9 +
          0.8
        ) * 0.04;
    }


    if (leftHairTail) {
      leftHairTail.rotation.z =
        0.28 +
        Math.sin(
          elapsedTime * 1.35
        ) * 0.09;
    }


    if (rightHairTail) {
      rightHairTail.rotation.z =
        0.48 +
        Math.sin(
          elapsedTime * 1.35 +
          0.65
        ) * 0.11;
    }


    boardGlowMaterials.forEach(
      function (glowMaterial) {
        if (
          glowMaterial &&
          "emissiveIntensity" in
            glowMaterial
        ) {
          glowMaterial.emissiveIntensity =
            0.72 +
            Math.sin(
              elapsedTime * 3.4
            ) * 0.25;
        }


        if (
          glowMaterial &&
          "opacity" in
            glowMaterial &&
          glowMaterial.transparent
        ) {
          glowMaterial.opacity =
            0.28 +
            Math.sin(
              elapsedTime * 3
            ) * 0.08;
        }
      }
    );


    boardLights.forEach(
      function (boardLight) {
        var lightScale =
          1 +
          Math.sin(
            elapsedTime * 3.1 +
            boardLight.position.x
          ) * 0.08;


        boardLight.scale.setScalar(
          lightScale
        );
      }
    );


    if (orbitParticles) {
      orbitParticles.rotation.y +=
        deltaTime * 0.55;


      orbitParticles.children
        .forEach(
          function (particle) {
            particle.position.y =
              0.25 +
              Math.sin(
                elapsedTime *
                  1.8 +
                particle.userData
                  .phase
              ) *
              0.28;
          }
        );
    }
  }


  /* =======================================================
     INITIALIZATION
  ======================================================= */

  function initializeHomeCharacter() {
    if (initialized) {
      return;
    }


    var homeScene =
      window.RunNovaHomeScene;


    if (
      !homeScene ||
      typeof homeScene.getWorld !==
        "function"
    ) {
      return;
    }


    var world =
      homeScene.getWorld();


    if (!world) {
      return;
    }


    characterRoot =
      new THREE.Group();


    characterRoot.name =
      "RunNova Home Character";


    characterRoot.add(
      createNovaBoard()
    );


    characterRoot.add(
      createRunNovaCharacter()
    );


    createOrbitParticles();
    addCharacterLighting();


    world.add(
      characterRoot
    );


    resizeCharacter();


    characterRoot.userData.baseY =
      characterRoot.position.y;


    if (
      typeof homeScene.addUpdater ===
        "function"
    ) {
      homeScene.addUpdater(
        updateCharacter
      );
    }


    resizeHandler =
      resizeCharacter;


    window.addEventListener(
      "resize",
      resizeHandler
    );


    var homeScreen =
      document.getElementById(
        "homeScreen"
      );


    if (homeScreen) {
      homeScreen.classList.add(
        "home-3d-character-ready"
      );
    }


    initialized = true;


    console.log(
      "RunNova H1C animated 3D hero initialized."
    );
  }


  function waitForHomeScene() {
    if (
      window.RunNovaHomeScene
    ) {
      initializeHomeCharacter();
      return;
    }


    window.addEventListener(
      "runnova-home-scene-ready",
      initializeHomeCharacter,
      {
        once: true
      }
    );


    var attempts = 0;


    var waitTimer =
      window.setInterval(
        function () {
          attempts += 1;


          if (
            window.RunNovaHomeScene
          ) {
            window.clearInterval(
              waitTimer
            );

            initializeHomeCharacter();
          } else if (
            attempts > 40
          ) {
            window.clearInterval(
              waitTimer
            );


            console.warn(
              "RunNova H1C could not find the home scene."
            );
          }
        },
        100
      );
  }


  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      waitForHomeScene
    );
  } else {
    waitForHomeScene();
  }

})();
