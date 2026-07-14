/* =========================================================
   homeScene.js — RunNova Phase H1B
   Animated Three.js home-city background.
========================================================= */

(function () {
  "use strict";

  var homeScreen;
  var canvas;
  var scene;
  var camera;
  var renderer;
  var clock;
  var world;

  var train;
  var trainCurve;
  var trainProgress = 0.08;

  var clouds = [];
  var balloons = [];
  var pods = [];
  var signs = [];

  var animationId = 0;
  var initialized = false;
  var running = false;

  var pointerTargetX = 0;
  var pointerTargetY = 0;
  var pointerX = 0;
  var pointerY = 0;

  var reducedMotion = false;
  var homeObserver = null;
  var externalUpdaters = [];


  /* =======================================================
     MATERIAL HELPER
  ======================================================= */

  function material(options) {
    options = options || {};

    return new THREE.MeshStandardMaterial({
      color:
        options.color !== undefined
          ? options.color
          : 0xffffff,

      roughness:
        options.roughness !== undefined
          ? options.roughness
          : 0.68,

      metalness:
        options.metalness !== undefined
          ? options.metalness
          : 0.08,

      emissive:
        options.emissive !== undefined
          ? options.emissive
          : 0x000000,

      emissiveIntensity:
        options.emissiveIntensity || 0,

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
     MESH HELPERS
  ======================================================= */

  function box(
    parent,
    width,
    height,
    depth,
    meshMaterial,
    x,
    y,
    z
  ) {
    var mesh = new THREE.Mesh(
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

    parent.add(mesh);

    return mesh;
  }


  function sphere(
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
    var mesh = new THREE.Mesh(
      new THREE.SphereGeometry(
        radius,
        14,
        10
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

    parent.add(mesh);

    return mesh;
  }


  function cylinder(
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
    var mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(
        radiusTop,
        radiusBottom,
        height,
        segments || 12
      ),
      meshMaterial
    );

    mesh.position.set(
      x || 0,
      y || 0,
      z || 0
    );

    parent.add(mesh);

    return mesh;
  }


  function setShadows(
    object,
    castShadow,
    receiveShadow
  ) {
    object.traverse(
      function (child) {
        if (!child.isMesh) {
          return;
        }

        child.castShadow =
          Boolean(castShadow);

        child.receiveShadow =
          Boolean(receiveShadow);
      }
    );
  }


  function randomGenerator(
    seedValue
  ) {
    var seed =
      seedValue >>> 0;

    return function () {
      seed =
        (
          seed * 1664525 +
          1013904223
        ) >>> 0;

      return seed / 4294967296;
    };
  }


  /* =======================================================
     RENDERER
  ======================================================= */

  function setupRenderer() {
    renderer =
      new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true,
        powerPreference:
          "high-performance"
      });

    renderer.setClearColor(
      0x000000,
      0
    );

    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio || 1,
        1.7
      )
    );

    renderer.shadowMap.enabled =
      true;

    renderer.shadowMap.type =
      THREE.PCFSoftShadowMap;

    if (
      typeof THREE
        .ACESFilmicToneMapping !==
      "undefined"
    ) {
      renderer.toneMapping =
        THREE.ACESFilmicToneMapping;

      renderer.toneMappingExposure =
        1.08;
    }

    if (
      "outputColorSpace" in
        renderer &&
      typeof THREE.SRGBColorSpace !==
        "undefined"
    ) {
      renderer.outputColorSpace =
        THREE.SRGBColorSpace;
    } else if (
      "outputEncoding" in
        renderer &&
      typeof THREE.sRGBEncoding !==
        "undefined"
    ) {
      renderer.outputEncoding =
        THREE.sRGBEncoding;
    }
  }


  /* =======================================================
     SCENE AND CAMERA
  ======================================================= */

  function setupScene() {
    scene =
      new THREE.Scene();

    scene.fog =
      new THREE.FogExp2(
        0x88def3,
        0.018
      );

    camera =
      new THREE.PerspectiveCamera(
        48,
        1,
        0.1,
        220
      );

    camera.position.set(
      0,
      8.4,
      17.5
    );

    camera.lookAt(
      0,
      4.3,
      -22
    );

    clock =
      new THREE.Clock();

    world =
      new THREE.Group();

    world.name =
      "RunNova Home World";

    scene.add(world);
  }


  /* =======================================================
     LIGHTING
  ======================================================= */

  function setupLights() {
    var hemisphereLight =
      new THREE.HemisphereLight(
        0xe9fbff,
        0x506582,
        1.35
      );

    hemisphereLight.position.set(
      0,
      22,
      0
    );

    scene.add(
      hemisphereLight
    );


    var sunlight =
      new THREE.DirectionalLight(
        0xfff0c5,
        1.55
      );

    sunlight.position.set(
      -11,
      20,
      13
    );

    sunlight.castShadow =
      true;

    sunlight.shadow.mapSize.set(
      1024,
      1024
    );

    sunlight.shadow.camera.left =
      -24;

    sunlight.shadow.camera.right =
      24;

    sunlight.shadow.camera.top =
      24;

    sunlight.shadow.camera.bottom =
      -12;

    sunlight.shadow.camera.near =
      1;

    sunlight.shadow.camera.far =
      80;

    sunlight.shadow.bias =
      -0.0002;

    sunlight.shadow.normalBias =
      0.025;

    scene.add(sunlight);


    var rimLight =
      new THREE.DirectionalLight(
        0xff70c7,
        0.5
      );

    rimLight.position.set(
      14,
      10,
      -22
    );

    scene.add(rimLight);
  }


  /* =======================================================
     BUILDINGS
  ======================================================= */

  function createBuilding(
    parent,
    x,
    z,
    width,
    height,
    depth,
    buildingColor,
    accentColor,
    random
  ) {
    var building =
      new THREE.Group();


    var bodyMaterial =
      material({
        color: buildingColor,
        roughness: 0.72
      });


    var body =
      box(
        building,
        width,
        height,
        depth,
        bodyMaterial,
        0,
        height * 0.5 - 2.4,
        0
      );

    body.castShadow =
      height < 13;

    body.receiveShadow =
      true;


    var accentMaterial =
      material({
        color: accentColor,
        roughness: 0.42,
        metalness: 0.18,
        emissive: accentColor,
        emissiveIntensity: 0.08
      });


    box(
      building,
      width * 0.83,
      0.18,
      depth * 0.83,
      accentMaterial,
      0,
      height - 2.31,
      0
    );


    var coolWindowMaterial =
      material({
        color: 0xb8fbff,
        roughness: 0.2,
        emissive: 0x5adff4,
        emissiveIntensity: 0.42
      });


    var warmWindowMaterial =
      material({
        color: 0xffe89c,
        roughness: 0.24,
        emissive: 0xffb84b,
        emissiveIntensity: 0.36
      });


    var rows =
      Math.max(
        2,
        Math.floor(
          height / 2.2
        )
      );

    var columns =
      width > 3.5
        ? 3
        : 2;


    for (
      var row = 0;
      row < rows;
      row++
    ) {
      for (
        var column = 0;
        column < columns;
        column++
      ) {
        if (
          random() < 0.24
        ) {
          continue;
        }

        var windowX =
          (
            column -
            (
              columns - 1
            ) * 0.5
          ) *
          (
            width * 0.28
          );

        var windowY =
          0.2 +
          row * 1.55;


        box(
          building,
          width * 0.16,
          0.34,
          0.045,
          random() > 0.5
            ? coolWindowMaterial
            : warmWindowMaterial,
          windowX,
          windowY,
          depth * 0.505
        );
      }
    }


    if (
      random() > 0.57
    ) {
      var signMaterial =
        material({
          color: accentColor,
          roughness: 0.3,
          emissive: accentColor,
          emissiveIntensity: 0.72
        });


      var sign =
        box(
          building,
          width * 0.56,
          0.32,
          0.08,
          signMaterial,
          0,
          height * 0.68 - 2.4,
          depth * 0.53
        );


      sign.userData.phase =
        random() *
        Math.PI *
        2;

      signs.push(sign);
    }


    building.position.set(
      x,
      0,
      z
    );

    parent.add(building);
  }


  function createLandmark(
    parent
  ) {
    var tower =
      new THREE.Group();


    var shaftMaterial =
      material({
        color: 0x556ac0,
        roughness: 0.52,
        metalness: 0.28
      });


    var ringMaterial =
      material({
        color: 0xffb33c,
        roughness: 0.36,
        metalness: 0.2,
        emissive: 0xff8424,
        emissiveIntensity: 0.24
      });


    cylinder(
      tower,
      0.48,
      0.8,
      18,
      16,
      shaftMaterial,
      0,
      6.7,
      0
    );


    cylinder(
      tower,
      3,
      2.35,
      1.2,
      20,
      ringMaterial,
      0,
      11.6,
      0
    );


    cylinder(
      tower,
      0.18,
      0.32,
      8.5,
      12,
      shaftMaterial,
      0,
      16.2,
      0
    );


    var beaconMaterial =
      material({
        color: 0xffffff,
        roughness: 0.15,
        emissive: 0x5defff,
        emissiveIntensity: 1
      });


    var beacon =
      sphere(
        tower,
        0.24,
        beaconMaterial,
        0,
        20.8,
        0
      );


    beacon.userData.phase =
      0;

    signs.push(beacon);


    tower.position.set(
      -2,
      -2,
      -57
    );

    parent.add(tower);
  }


  function createCity() {
    var city =
      new THREE.Group();

    city.name =
      "RunNova City";

    world.add(city);


    var random =
      randomGenerator(
        87231
      );


    var buildingColors = [
      0x4c86c8,
      0xe07091,
      0x4eb7a9,
      0xd99a54,
      0x7d6bcb,
      0x4f9fbb
    ];


    var accentColors = [
      0x2eece8,
      0xffc234,
      0xf24fa4,
      0x8d6cff,
      0x4ce1a1
    ];


    [-1, 1].forEach(
      function (side) {
        for (
          var row = 0;
          row < 3;
          row++
        ) {
          for (
            var index = 0;
            index < 10;
            index++
          ) {
            createBuilding(
              city,

              side *
                (
                  7.5 +
                  row * 4.4 +
                  random() * 2.1
                ),

              -5 -
                index * 7.2 -
                row * 3.1 +
                random() * 2.2,

              2.2 +
                random() * 2.5,

              5.8 +
                random() *
                  (
                    13.5 -
                    row * 1.3
                  ),

              2.7 +
                random() * 3.1,

              buildingColors[
                (
                  index + row
                ) %
                buildingColors.length
              ],

              accentColors[
                (
                  index +
                  row * 2
                ) %
                accentColors.length
              ],

              random
            );
          }
        }
      }
    );


    createLandmark(city);
  }


  /* =======================================================
     ELEVATED TRACKS
  ======================================================= */

  function createDeckAlongCurve(
    parent,
    curve,
    trackColor,
    edgeColor,
    width,
    segments
  ) {
    var trackGroup =
      new THREE.Group();


    var deckMaterial =
      material({
        color: trackColor,
        roughness: 0.62
      });


    var edgeMaterial =
      material({
        color: edgeColor,
        roughness: 0.36,
        metalness: 0.2,
        emissive: edgeColor,
        emissiveIntensity: 0.14
      });


    var undersideMaterial =
      material({
        color: 0x294d7d,
        roughness: 0.78,
        metalness: 0.12
      });


    var previousPoint =
      curve.getPoint(0);


    for (
      var segmentIndex = 1;
      segmentIndex <= segments;
      segmentIndex++
    ) {
      var point =
        curve.getPoint(
          segmentIndex /
          segments
        );


      var midpoint =
        previousPoint
          .clone()
          .add(point)
          .multiplyScalar(0.5);


      var segmentLength =
        previousPoint.distanceTo(
          point
        );


      var tangent =
        point
          .clone()
          .sub(previousPoint)
          .normalize();


      var rotationY =
        Math.atan2(
          tangent.x,
          tangent.z
        );


      var sideVector =
        new THREE.Vector3(
          tangent.z,
          0,
          -tangent.x
        ).normalize();


      var underside =
        box(
          trackGroup,
          width + 0.7,
          0.38,
          segmentLength * 1.14,
          undersideMaterial,
          midpoint.x,
          midpoint.y - 0.24,
          midpoint.z
        );


      underside.rotation.y =
        rotationY;

      underside.receiveShadow =
        true;


      var deck =
        box(
          trackGroup,
          width,
          0.2,
          segmentLength * 1.14,
          deckMaterial,
          midpoint.x,
          midpoint.y,
          midpoint.z
        );


      deck.rotation.y =
        rotationY;

      deck.receiveShadow =
        true;


      [-1, 1].forEach(
        function (side) {
          var rail =
            box(
              trackGroup,
              0.11,
              0.16,
              segmentLength *
                1.14,
              edgeMaterial,
              midpoint.x,
              midpoint.y +
                0.19,
              midpoint.z
            );


          rail.position
            .addScaledVector(
              sideVector,
              side *
                width *
                0.43
            );


          rail.rotation.y =
            rotationY;
        }
      );


      previousPoint =
        point;
    }


    parent.add(trackGroup);
  }


  function createTracks() {
    trainCurve =
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(
          17,
          4.7,
          6
        ),

        new THREE.Vector3(
          14,
          4.4,
          -7
        ),

        new THREE.Vector3(
          9,
          4.2,
          -19
        ),

        new THREE.Vector3(
          3,
          4,
          -33
        ),

        new THREE.Vector3(
          -7,
          3.8,
          -55
        )
      ]);


    createDeckAlongCurve(
      world,
      trainCurve,
      0xf0645d,
      0xffd648,
      2.55,
      52
    );


    var secondCurve =
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(
          -18,
          2.7,
          8
        ),

        new THREE.Vector3(
          -15,
          3.1,
          -5
        ),

        new THREE.Vector3(
          -10,
          3.6,
          -17
        ),

        new THREE.Vector3(
          -4,
          4,
          -31
        ),

        new THREE.Vector3(
          7,
          4.4,
          -56
        )
      ]);


    createDeckAlongCurve(
      world,
      secondCurve,
      0x28c7d8,
      0x7df8ff,
      2.2,
      52
    );
  }


  /* =======================================================
     MOVING TRAIN
  ======================================================= */

  function createTrainCar(
    bodyMaterial,
    windowMaterial,
    accentMaterial
  ) {
    var trainCar =
      new THREE.Group();


    box(
      trainCar,
      2.25,
      1.1,
      2.65,
      bodyMaterial,
      0,
      0.68,
      0
    );


    box(
      trainCar,
      1.9,
      0.34,
      0.05,
      windowMaterial,
      0,
      0.88,
      1.35
    );


    box(
      trainCar,
      1.9,
      0.34,
      0.05,
      windowMaterial,
      0,
      0.88,
      -1.35
    );


    box(
      trainCar,
      2.3,
      0.12,
      2.3,
      accentMaterial,
      0,
      0.16,
      0
    );


    setShadows(
      trainCar,
      true,
      false
    );


    return trainCar;
  }


  function createTrain() {
    train =
      new THREE.Group();

    train.name =
      "RunNova NovaRail";


    var bodyMaterial =
      material({
        color: 0xf7fbff,
        roughness: 0.35,
        metalness: 0.34
      });


    var windowMaterial =
      material({
        color: 0x8ef4ff,
        roughness: 0.16,
        metalness: 0.32,
        emissive: 0x26cbe4,
        emissiveIntensity: 0.35
      });


    var accentMaterial =
      material({
        color: 0x5d5ce7,
        roughness: 0.32,
        metalness: 0.38,
        emissive: 0xf052b1,
        emissiveIntensity: 0.12
      });


    for (
      var carIndex = 0;
      carIndex < 3;
      carIndex++
    ) {
      var trainCar =
        createTrainCar(
          bodyMaterial,
          windowMaterial,
          accentMaterial
        );


      trainCar.position.z =
        -carIndex * 2.9;


      train.add(trainCar);
    }


    world.add(train);
  }


  function updateTrain(
    deltaTime
  ) {
    if (
      !train ||
      !trainCurve
    ) {
      return;
    }


    trainProgress +=
      deltaTime * 0.035;


    if (
      trainProgress > 1
    ) {
      trainProgress =
        0.025;
    }


    var point =
      trainCurve.getPointAt(
        trainProgress
      );


    var tangent =
      trainCurve
        .getTangentAt(
          trainProgress
        )
        .normalize();


    train.position.copy(point);


    train.lookAt(
      point
        .clone()
        .add(tangent)
    );


    train.position.y +=
      Math.sin(
        trainProgress *
        Math.PI *
        14
      ) *
      0.025;
  }


  /* =======================================================
     CLOUDS
  ======================================================= */

  function createCloud(
    x,
    y,
    z,
    scale,
    speed
  ) {
    var cloud =
      new THREE.Group();


    var cloudMaterial =
      material({
        color: 0xffffff,
        roughness: 1,
        transparent: true,
        opacity: 0.72,
        depthWrite: false
      });


    sphere(
      cloud,
      1.5,
      cloudMaterial,
      0,
      0,
      0,
      1.5,
      0.72,
      0.72
    );


    sphere(
      cloud,
      1.3,
      cloudMaterial,
      -1.35,
      -0.12,
      0,
      1.3,
      0.67,
      0.7
    );


    sphere(
      cloud,
      1.7,
      cloudMaterial,
      1.25,
      -0.05,
      0,
      1.25,
      0.72,
      0.72
    );


    sphere(
      cloud,
      1.1,
      cloudMaterial,
      0.35,
      0.7,
      0,
      1.1,
      0.85,
      0.8
    );


    cloud.position.set(
      x,
      y,
      z
    );


    cloud.scale.setScalar(
      scale
    );


    cloud.userData.speed =
      speed;

    cloud.userData.baseY =
      y;

    cloud.userData.phase =
      Math.random() *
      Math.PI *
      2;


    scene.add(cloud);

    clouds.push(cloud);
  }


  function createClouds() {
    createCloud(
      -21,
      15.5,
      -28,
      1.15,
      0.55
    );

    createCloud(
      15,
      13.8,
      -40,
      0.95,
      0.42
    );

    createCloud(
      -8,
      18.2,
      -65,
      1.45,
      0.3
    );

    createCloud(
      24,
      17,
      -78,
      1.25,
      0.34
    );
  }


  function updateClouds(
    deltaTime,
    elapsedTime
  ) {
    clouds.forEach(
      function (cloud) {
        cloud.position.x +=
          deltaTime *
          cloud.userData.speed;


        cloud.position.y =
          cloud.userData.baseY +
          Math.sin(
            elapsedTime *
              0.35 +
            cloud.userData.phase
          ) *
          0.18;


        if (
          cloud.position.x >
          28
        ) {
          cloud.position.x =
            -28;
        }
      }
    );
  }


  /* =======================================================
     BALLOONS
  ======================================================= */

  function createBalloon(
    x,
    y,
    z,
    balloonColor,
    scale,
    speed
  ) {
    var balloon =
      new THREE.Group();


    var balloonMaterial =
      material({
        color: balloonColor,
        roughness: 0.5
      });


    var basketMaterial =
      material({
        color: 0x9a5a35,
        roughness: 0.9
      });


    var ropeMaterial =
      material({
        color: 0x76524b,
        roughness: 0.9
      });


    sphere(
      balloon,
      1.15,
      balloonMaterial,
      0,
      1.7,
      0,
      1,
      1.3,
      1
    );


    cylinder(
      balloon,
      0.18,
      0.28,
      0.55,
      8,
      basketMaterial,
      0,
      0.1,
      0
    );


    [-0.34, 0.34].forEach(
      function (side) {
        var rope =
          cylinder(
            balloon,
            0.018,
            0.018,
            1.22,
            6,
            ropeMaterial,
            side,
            0.83,
            0
          );


        rope.rotation.z =
          side * 0.08;
      }
    );


    balloon.position.set(
      x,
      y,
      z
    );


    balloon.scale.setScalar(
      scale
    );


    balloon.userData.baseY =
      y;

    balloon.userData.phase =
      Math.random() *
      Math.PI *
      2;

    balloon.userData.speed =
      speed;


    scene.add(balloon);

    balloons.push(balloon);
  }


  function createBalloons() {
    createBalloon(
      -13,
      9,
      -35,
      0xff6a91,
      0.78,
      0.16
    );

    createBalloon(
      11,
      12,
      -56,
      0xffbe37,
      0.62,
      0.11
    );

    createBalloon(
      3,
      15,
      -81,
      0x755fe3,
      0.76,
      0.09
    );
  }


  function updateBalloons(
    deltaTime,
    elapsedTime
  ) {
    balloons.forEach(
      function (balloon) {
        balloon.position.x +=
          deltaTime *
          balloon.userData.speed;


        balloon.position.y =
          balloon.userData.baseY +
          Math.sin(
            elapsedTime *
              0.55 +
            balloon.userData.phase
          ) *
          0.35;


        balloon.rotation.y +=
          deltaTime * 0.08;


        if (
          balloon.position.x >
          22
        ) {
          balloon.position.x =
            -22;
        }
      }
    );
  }


  /* =======================================================
     FLYING PODS
  ======================================================= */

  function createPod(
    x,
    y,
    z,
    podColor,
    speed
  ) {
    var pod =
      new THREE.Group();


    var bodyMaterial =
      material({
        color: podColor,
        roughness: 0.32,
        metalness: 0.5,
        emissive: podColor,
        emissiveIntensity: 0.08
      });


    var glassMaterial =
      material({
        color: 0x9df6ff,
        roughness: 0.12,
        metalness: 0.36,
        emissive: 0x2bd6f2,
        emissiveIntensity: 0.26
      });


    sphere(
      pod,
      0.5,
      bodyMaterial,
      0,
      0,
      0,
      1.65,
      0.58,
      0.8
    );


    sphere(
      pod,
      0.34,
      glassMaterial,
      0.15,
      0.16,
      0,
      1.18,
      0.58,
      0.72
    );


    pod.position.set(
      x,
      y,
      z
    );


    pod.userData.speed =
      speed;

    pod.userData.baseY =
      y;

    pod.userData.phase =
      Math.random() *
      Math.PI *
      2;


    scene.add(pod);

    pods.push(pod);
  }


  function createPods() {
    createPod(
      -20,
      8.6,
      -22,
      0xff5b9f,
      3.1
    );

    createPod(
      18,
      11,
      -42,
      0x3bd8dc,
      -2.3
    );

    createPod(
      -24,
      13.5,
      -68,
      0xffc33c,
      1.8
    );
  }


  function updatePods(
    deltaTime,
    elapsedTime
  ) {
    pods.forEach(
      function (pod) {
        pod.position.x +=
          deltaTime *
          pod.userData.speed;


        pod.position.y =
          pod.userData.baseY +
          Math.sin(
            elapsedTime *
              1.4 +
            pod.userData.phase
          ) *
          0.12;


        pod.rotation.z =
          Math.sin(
            elapsedTime *
              1.1 +
            pod.userData.phase
          ) *
          0.08;


        if (
          pod.userData.speed > 0 &&
          pod.position.x > 26
        ) {
          pod.position.x =
            -26;
        }


        if (
          pod.userData.speed < 0 &&
          pod.position.x < -26
        ) {
          pod.position.x =
            26;
        }
      }
    );
  }


  /* =======================================================
     FLOATING PARTICLES
  ======================================================= */

  function createParticles() {
    var particleCount =
      90;

    var positions =
      new Float32Array(
        particleCount * 3
      );

    var colors =
      new Float32Array(
        particleCount * 3
      );


    var colorPalette = [
      new THREE.Color(
        0xffffff
      ),

      new THREE.Color(
        0xffd54a
      ),

      new THREE.Color(
        0xff66b2
      ),

      new THREE.Color(
        0x4ff4ef
      )
    ];


    for (
      var particleIndex = 0;
      particleIndex <
        particleCount;
      particleIndex++
    ) {
      positions[
        particleIndex * 3
      ] =
        (
          Math.random() -
          0.5
        ) *
        44;


      positions[
        particleIndex * 3 +
        1
      ] =
        4 +
        Math.random() *
        15;


      positions[
        particleIndex * 3 +
        2
      ] =
        4 -
        Math.random() *
        85;


      var particleColor =
        colorPalette[
          particleIndex %
          colorPalette.length
        ];


      colors[
        particleIndex * 3
      ] =
        particleColor.r;


      colors[
        particleIndex * 3 +
        1
      ] =
        particleColor.g;


      colors[
        particleIndex * 3 +
        2
      ] =
        particleColor.b;
    }


    var particleGeometry =
      new THREE.BufferGeometry();


    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(
        positions,
        3
      )
    );


    particleGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(
        colors,
        3
      )
    );


    var particles =
      new THREE.Points(
        particleGeometry,

        new THREE.PointsMaterial({
          size: 0.12,
          vertexColors: true,
          transparent: true,
          opacity: 0.72,
          depthWrite: false
        })
      );


    scene.userData.particles =
      particles;


    scene.add(particles);
  }


  function updateParticles(
    deltaTime,
    elapsedTime
  ) {
    var particles =
      scene.userData.particles;


    if (!particles) {
      return;
    }


    particles.rotation.y +=
      deltaTime * 0.012;


    particles.position.y =
      Math.sin(
        elapsedTime * 0.35
      ) *
      0.12;
  }


  /* =======================================================
     ANIMATED SIGNS
  ======================================================= */

  function updateSigns(
    elapsedTime
  ) {
    signs.forEach(
      function (sign) {
        if (!sign.material) {
          return;
        }


        sign.material
          .emissiveIntensity =
          Math.max(
            0.12,

            0.45 +
              Math.sin(
                elapsedTime *
                  2.1 +
                (
                  sign.userData
                    .phase ||
                  0
                )
              ) *
              0.22
          );
      }
    );
  }


  /* =======================================================
     CAMERA PARALLAX
  ======================================================= */

  function updateCamera(
    deltaTime,
    elapsedTime
  ) {
    pointerX +=
      (
        pointerTargetX -
        pointerX
      ) *
      Math.min(
        1,
        deltaTime * 4.5
      );


    pointerY +=
      (
        pointerTargetY -
        pointerY
      ) *
      Math.min(
        1,
        deltaTime * 4.5
      );


    camera.position.x =
      pointerX * 1.4 +
      Math.sin(
        elapsedTime * 0.16
      ) *
      0.22;


    camera.position.y =
      8.4 -
      pointerY * 0.55 +
      Math.sin(
        elapsedTime * 0.22
      ) *
      0.12;


    camera.lookAt(
      pointerX * 0.55,
      4.3 -
        pointerY * 0.25,
      -22
    );
  }


  /* =======================================================
     RENDER LOOP
  ======================================================= */

   /* =======================================================
   EXTERNAL HOME-SCENE ANIMATIONS
======================================================= */

function updateExternalAnimations(
  deltaTime,
  elapsedTime
) {
  externalUpdaters
    .slice()
    .forEach(
      function (updater) {
        if (
          typeof updater !==
          "function"
        ) {
          return;
        }

        try {
          updater(
            deltaTime,
            elapsedTime,
            reducedMotion
          );
        } catch (error) {
          console.error(
            "RunNova home updater failed:",
            error
          );

          var updaterIndex =
            externalUpdaters.indexOf(
              updater
            );

          if (updaterIndex !== -1) {
            externalUpdaters.splice(
              updaterIndex,
              1
            );
          }
        }
      }
    );
}

  function renderFrame() {
    if (
      !running ||
      !renderer
    ) {
      return;
    }


    animationId =
      window.requestAnimationFrame(
        renderFrame
      );


    var deltaTime =
      Math.min(
        clock.getDelta(),
        0.05
      );


    var elapsedTime =
      clock.elapsedTime;


    updateCamera(
      deltaTime,
      elapsedTime
    );


    if (!reducedMotion) {
      updateTrain(
        deltaTime
      );

      updateClouds(
        deltaTime,
        elapsedTime
      );

      updateBalloons(
        deltaTime,
        elapsedTime
      );

      updatePods(
        deltaTime,
        elapsedTime
      );

      updateParticles(
        deltaTime,
        elapsedTime
      );

      updateSigns(
        elapsedTime
      );
    }
     updateExternalAnimations(
  deltaTime,
  elapsedTime
);


    renderer.render(
      scene,
      camera
    );
  }


  function startScene() {
    if (
      !initialized ||
      running
    ) {
      return;
    }


    running =
      true;


    clock.start();


    renderFrame();
  }


  function stopScene() {
    running =
      false;


    if (animationId) {
      window.cancelAnimationFrame(
        animationId
      );

      animationId =
        0;
    }
  }


  /* =======================================================
     RESIZE
  ======================================================= */

  function resizeScene() {
    if (
      !renderer ||
      !camera ||
      !canvas
    ) {
      return;
    }


    var width =
      canvas.clientWidth ||
      homeScreen.clientWidth ||
      window.innerWidth;


    var height =
      canvas.clientHeight ||
      homeScreen.clientHeight ||
      window.innerHeight;


    width =
      Math.max(
        1,
        width
      );


    height =
      Math.max(
        1,
        height
      );


    renderer.setSize(
      width,
      height,
      false
    );


    camera.aspect =
      width / height;


    camera
      .updateProjectionMatrix();
  }


  /* =======================================================
     HOME-SCREEN STATE
  ======================================================= */

  function synchronizeSceneState() {
    if (!homeScreen) {
      return;
    }


    var shouldRun =
      homeScreen
        .classList
        .contains("active") &&
      !document.hidden;


    if (shouldRun) {
      resizeScene();
      startScene();
    } else {
      stopScene();
    }
  }


  /* =======================================================
     POINTER INPUT
  ======================================================= */

  function handlePointerMove(
    event
  ) {
    pointerTargetX =
      (
        event.clientX /
          Math.max(
            window.innerWidth,
            1
          ) -
        0.5
      ) *
      2;


    pointerTargetY =
      (
        event.clientY /
          Math.max(
            window.innerHeight,
            1
          ) -
        0.5
      ) *
      2;
  }


  function handlePointerLeave() {
    pointerTargetX =
      0;

    pointerTargetY =
      0;
  }


  /* =======================================================
     INITIALIZATION
  ======================================================= */

  function initializeHomeScene() {
    if (initialized) {
      return;
    }


    homeScreen =
      document.getElementById(
        "homeScreen"
      );


    canvas =
      document.getElementById(
        "homeCanvas"
      );


    if (
      !homeScreen ||
      !canvas
    ) {
      console.warn(
        "RunNova H1B: homeScreen or homeCanvas was not found."
      );

      return;
    }


    if (
      typeof THREE ===
      "undefined"
    ) {
      console.error(
        "RunNova H1B: Three.js must load before homeScene.js."
      );

      return;
    }


    reducedMotion =
      Boolean(
        window.matchMedia &&
        window
          .matchMedia(
            "(prefers-reduced-motion: reduce)"
          )
          .matches
      );


    setupRenderer();
    setupScene();
    setupLights();

    createCity();
    createTracks();
    createTrain();
    createClouds();
    createBalloons();
    createPods();
    createParticles();


    resizeScene();


    renderer.render(
      scene,
      camera
    );


    homeScreen
      .classList
      .add(
        "home-3d-ready"
      );


    homeScreen.addEventListener(
      "pointermove",
      handlePointerMove,
      {
        passive: true
      }
    );


    homeScreen.addEventListener(
      "pointerleave",
      handlePointerLeave,
      {
        passive: true
      }
    );


    window.addEventListener(
      "resize",
      resizeScene
    );


    document.addEventListener(
      "visibilitychange",
      synchronizeSceneState
    );


    homeObserver =
      new MutationObserver(
        synchronizeSceneState
      );


    homeObserver.observe(
      homeScreen,
      {
        attributes: true,
        attributeFilter: [
          "class"
        ]
      }
    );


    initialized =
      true;


    synchronizeSceneState();


    window.RunNovaHomeScene = {
  start:
    startScene,

  stop:
    stopScene,

  resize:
    resizeScene,

  getScene:
    function () {
      return scene;
    },

  getWorld:
    function () {
      return world;
    },

  getCamera:
    function () {
      return camera;
    },

  getRenderer:
    function () {
      return renderer;
    },

  addUpdater:
    function (updater) {
      if (
        typeof updater !==
        "function" ||
        externalUpdaters.indexOf(
          updater
        ) !== -1
      ) {
        return;
      }

      externalUpdaters.push(
        updater
      );
    },

  removeUpdater:
    function (updater) {
      var updaterIndex =
        externalUpdaters.indexOf(
          updater
        );

      if (updaterIndex !== -1) {
        externalUpdaters.splice(
          updaterIndex,
          1
        );
      }
    },

  isReducedMotion:
    function () {
      return reducedMotion;
    }
};
     window.dispatchEvent(
  new CustomEvent(
    "runnova-home-scene-ready"
  )
);


    console.log(
      "RunNova H1B animated 3D home city initialized."
    );
  }


  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initializeHomeScene
    );
  } else {
    initializeHomeScene();
  }

})();
