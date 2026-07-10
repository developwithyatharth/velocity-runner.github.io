/* visuals.js
   Velocity Runner: Rise of Bharat
   Neo Aryavarta visual environment

   Improvements:
   - Reduced excessive glow
   - Removed central circular light structures
   - Replaced circles with rectangular cyber gates
   - Added diamond-shaped Bharat emblems
   - Added futuristic towers
   - Added Hindi holographic boards
   - Added flying vehicles
   - Added atmospheric particles
   - Added distant Neo Aryavarta monument
*/

/* =====================================================
   VISUAL GROUPS
===================================================== */

let neoVisualGroup = null;
let neoGateGroup = null;
let hologramGroup = null;
let flyingVehicleGroup = null;
let atmosphereGroup = null;
let neoSpireGroup = null;
let horizonGroup = null;

/* =====================================================
   VISUAL OBJECT ARRAYS
===================================================== */

let neoGates = [];
let hologramBoards = [];
let flyingVehicles = [];
let neoSpires = [];

let atmosphereParticles = null;
let horizonMonument = null;

/* =====================================================
   CONSTANTS
===================================================== */

const NEO_GATE_COUNT = 12;
const NEO_GATE_SPACING = 46;

const NEO_GATE_LOOP_DISTANCE =
  NEO_GATE_COUNT * NEO_GATE_SPACING;

const HOLOGRAM_TEXTS = [
  "भारत",
  "सूर्य",
  "वेग",
  "शक्ति",
  "नव युग",
  "आर्यावर्त"
];

/* =====================================================
   MAIN VISUAL CREATION
===================================================== */

function createNeoAryavartaVisuals() {
  if (!scene) return;

  removeOldNeoVisuals();

  neoGates = [];
  hologramBoards = [];
  flyingVehicles = [];
  neoSpires = [];

  atmosphereParticles = null;
  horizonMonument = null;

  neoVisualGroup = new THREE.Group();
  neoGateGroup = new THREE.Group();
  hologramGroup = new THREE.Group();
  flyingVehicleGroup = new THREE.Group();
  atmosphereGroup = new THREE.Group();
  neoSpireGroup = new THREE.Group();
  horizonGroup = new THREE.Group();

  neoVisualGroup.add(neoGateGroup);
  neoVisualGroup.add(hologramGroup);
  neoVisualGroup.add(flyingVehicleGroup);
  neoVisualGroup.add(atmosphereGroup);
  neoVisualGroup.add(neoSpireGroup);
  neoVisualGroup.add(horizonGroup);

  scene.add(neoVisualGroup);

  createNeoGates();
  createHologramBoards();
  createNeoSpires();
  createFlyingVehicles();
  createAtmosphereParticles();
  createHorizonMonument();
}

/* =====================================================
   REMOVE OLD VISUALS
===================================================== */

function removeOldNeoVisuals() {
  if (!neoVisualGroup || !scene) return;

  scene.remove(neoVisualGroup);

  neoVisualGroup.traverse(function (object) {
    if (object.geometry) {
      object.geometry.dispose();
    }

    if (object.material) {
      if (Array.isArray(object.material)) {
        object.material.forEach(function (material) {
          disposeVisualMaterial(material);
        });
      } else {
        disposeVisualMaterial(object.material);
      }
    }
  });

  neoVisualGroup = null;
}

function disposeVisualMaterial(material) {
  if (!material) return;

  if (material.map) {
    material.map.dispose();
  }

  material.dispose();
}

/* =====================================================
   CYBER GATES
===================================================== */

function createNeoGates() {
  for (let i = 0; i < NEO_GATE_COUNT; i++) {
    const gate = createSingleNeoGate(i);

    gate.position.z =
      -55 - i * NEO_GATE_SPACING;

    neoGates.push(gate);
    neoGateGroup.add(gate);
  }
}

function createSingleNeoGate(index) {
  const gate = new THREE.Group();

  const primaryColor =
    index % 2 === 0 ? 0x00c8dd : 0xf2b84b;

  const secondaryColor =
    index % 3 === 0 ? 0x8754d9 : 0x1677a8;

  const pillarMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x071426,
      metalness: 0.72,
      roughness: 0.32,
      emissive: primaryColor,
      emissiveIntensity: 0.08
    });

  const primaryGlowMaterial =
    new THREE.MeshBasicMaterial({
      color: primaryColor,
      transparent: true,
      opacity: 0.68
    });

  const secondaryGlowMaterial =
    new THREE.MeshBasicMaterial({
      color: secondaryColor,
      transparent: true,
      opacity: 0.58
    });

  createGatePillar(
    gate,
    -5.6,
    pillarMaterial,
    primaryGlowMaterial,
    secondaryGlowMaterial
  );

  createGatePillar(
    gate,
    5.6,
    pillarMaterial,
    primaryGlowMaterial,
    secondaryGlowMaterial
  );

  /* Main rectangular top beam */

  const topBeam = new THREE.Mesh(
    new THREE.BoxGeometry(11.4, 0.34, 0.48),
    pillarMaterial
  );

  topBeam.position.set(0, 5.42, 0);
  gate.add(topBeam);

  /* Cyan/gold line under top beam */

  const beamGlow = new THREE.Mesh(
    new THREE.BoxGeometry(10.5, 0.09, 0.55),
    primaryGlowMaterial
  );

  beamGlow.position.set(0, 5.19, 0);
  gate.add(beamGlow);

  /* Diamond emblem instead of circular chakra */

  const centerEmblem = createDiamondEmblem(
    primaryColor,
    secondaryColor
  );

  centerEmblem.position.set(0, 5.43, 0.42);
  centerEmblem.scale.set(0.78, 0.78, 0.78);

  gate.add(centerEmblem);

  gate.userData.emblem = centerEmblem;
  gate.userData.emblemFloatOffset =
    Math.random() * Math.PI * 2;

  return gate;
}

function createGatePillar(
  gate,
  xPosition,
  pillarMaterial,
  primaryGlowMaterial,
  secondaryGlowMaterial
) {
  const pillar = new THREE.Mesh(
    new THREE.BoxGeometry(0.56, 5.4, 0.68),
    pillarMaterial
  );

  pillar.position.set(xPosition, 2.7, 0);
  gate.add(pillar);

  const innerGlow = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 4.3, 0.74),
    primaryGlowMaterial
  );

  innerGlow.position.set(
    xPosition > 0
      ? xPosition - 0.3
      : xPosition + 0.3,
    2.65,
    0
  );

  gate.add(innerGlow);

  const upperAccent = new THREE.Mesh(
    new THREE.ConeGeometry(0.64, 0.8, 4),
    secondaryGlowMaterial
  );

  upperAccent.position.set(
    xPosition,
    5.8,
    0
  );

  upperAccent.rotation.y = Math.PI / 4;

  gate.add(upperAccent);

  const lowerBase = new THREE.Mesh(
    new THREE.BoxGeometry(1.25, 0.18, 1.1),
    pillarMaterial
  );

  lowerBase.position.set(
    xPosition,
    0.15,
    0
  );

  gate.add(lowerBase);

  const baseGlow = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.07, 1.18),
    primaryGlowMaterial
  );

  baseGlow.position.set(
    xPosition,
    0.27,
    0
  );

  gate.add(baseGlow);
}

/* =====================================================
   DIAMOND EMBLEM
===================================================== */

function createDiamondEmblem(
  primaryColor,
  secondaryColor
) {
  const emblem = new THREE.Group();

  const primaryMaterial =
    new THREE.MeshBasicMaterial({
      color: primaryColor,
      transparent: true,
      opacity: 0.78
    });

  const secondaryMaterial =
    new THREE.MeshBasicMaterial({
      color: secondaryColor,
      transparent: true,
      opacity: 0.68
    });

  const outerDiamond = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.6, 0),
    primaryMaterial
  );

  outerDiamond.scale.set(1, 1.35, 0.2);
  emblem.add(outerDiamond);

  const innerDiamond = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.28, 0),
    secondaryMaterial
  );

  innerDiamond.scale.set(1, 1.35, 0.25);
  innerDiamond.position.z = 0.12;

  emblem.add(innerDiamond);

  const verticalLine = new THREE.Mesh(
    new THREE.BoxGeometry(0.045, 1.8, 0.05),
    secondaryMaterial
  );

  verticalLine.position.z = 0.18;
  emblem.add(verticalLine);

  const horizontalLine = new THREE.Mesh(
    new THREE.BoxGeometry(1.3, 0.045, 0.05),
    secondaryMaterial
  );

  horizontalLine.position.z = 0.18;
  emblem.add(horizontalLine);

  return emblem;
}

/* =====================================================
   HOLOGRAPHIC BOARDS
===================================================== */

function createHologramBoards() {
  for (let i = 0; i < 10; i++) {
    const side = i % 2 === 0 ? -1 : 1;

    const text =
      HOLOGRAM_TEXTS[
        i % HOLOGRAM_TEXTS.length
      ];

    const color =
      i % 3 === 0
        ? "#e6ae43"
        : "#00b8d4";

    const board = createHologramTextBoard(
      text,
      color
    );

    board.position.set(
      side * (7.8 + Math.random() * 2),
      3.7 + Math.random() * 3.2,
      -40 - i * 26
    );

    board.rotation.y =
      side > 0 ? -0.32 : 0.32;

    board.userData.baseY =
      board.position.y;

    board.userData.floatOffset =
      Math.random() * Math.PI * 2;

    hologramBoards.push(board);
    hologramGroup.add(board);
  }
}

function createHologramTextBoard(
  text,
  color
) {
  const canvas =
    document.createElement("canvas");

  canvas.width = 512;
  canvas.height = 256;

  const context =
    canvas.getContext("2d");

  context.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  context.fillStyle =
    "rgba(2, 10, 28, 0.76)";

  context.fillRect(
    18,
    18,
    canvas.width - 36,
    canvas.height - 36
  );

  context.strokeStyle = color;
  context.lineWidth = 4;

  context.strokeRect(
    20,
    20,
    canvas.width - 40,
    canvas.height - 40
  );

  /* Corner decorations */

  context.lineWidth = 9;

  context.beginPath();

  context.moveTo(20, 70);
  context.lineTo(20, 20);
  context.lineTo(70, 20);

  context.moveTo(
    canvas.width - 70,
    canvas.height - 20
  );

  context.lineTo(
    canvas.width - 20,
    canvas.height - 20
  );

  context.lineTo(
    canvas.width - 20,
    canvas.height - 70
  );

  context.stroke();

  context.shadowColor = color;
  context.shadowBlur = 10;

  context.fillStyle = color;

  context.font =
    'bold 78px "Noto Sans Devanagari", Arial, sans-serif';

  context.textAlign = "center";
  context.textBaseline = "middle";

  context.fillText(
    text,
    canvas.width / 2,
    canvas.height / 2
  );

  const texture =
    new THREE.CanvasTexture(canvas);

  texture.needsUpdate = true;

  const material =
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.76,
      side: THREE.DoubleSide,
      depthWrite: false
    });

  return new THREE.Mesh(
    new THREE.PlaneGeometry(4.2, 2.1),
    material
  );
}

/* =====================================================
   FUTURISTIC SPIRES
===================================================== */

function createNeoSpires() {
  const cyanMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x081a31,
      metalness: 0.68,
      roughness: 0.35,
      emissive: 0x008ca3,
      emissiveIntensity: 0.08
    });

  const goldMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x271d0c,
      metalness: 0.65,
      roughness: 0.34,
      emissive: 0xb77b18,
      emissiveIntensity: 0.07
    });

  const purpleMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x1d1235,
      metalness: 0.67,
      roughness: 0.34,
      emissive: 0x5c2f99,
      emissiveIntensity: 0.07
    });

  const materials = [
    cyanMaterial,
    goldMaterial,
    purpleMaterial
  ];

  for (let i = 0; i < 28; i++) {
    const side =
      Math.random() > 0.5 ? 1 : -1;

    const height =
      5 + Math.random() * 9;

    const spire = new THREE.Group();

    const towerMaterial =
      materials[i % materials.length];

    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.75 + Math.random() * 0.35,
        1.2 + Math.random() * 0.4,
        height,
        6
      ),
      towerMaterial
    );

    base.position.y = height / 2;
    spire.add(base);

    const middleAccent =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          1.5,
          0.08,
          1.5
        ),
        new THREE.MeshBasicMaterial({
          color:
            i % 2 === 0
              ? 0x00a9c4
              : 0xc88b24,
          transparent: true,
          opacity: 0.55
        })
      );

    middleAccent.position.y =
      height * 0.62;

    spire.add(middleAccent);

    const crown = new THREE.Mesh(
      new THREE.ConeGeometry(
        1.05,
        2.1,
        6
      ),
      towerMaterial
    );

    crown.position.y = height + 1;
    crown.rotation.y = Math.PI / 6;

    spire.add(crown);

    const topGem = new THREE.Mesh(
      new THREE.OctahedronGeometry(
        0.22,
        0
      ),
      new THREE.MeshBasicMaterial({
        color:
          i % 2 === 0
            ? 0x00b8d4
            : 0xe3ad3f,
        transparent: true,
        opacity: 0.7
      })
    );

    topGem.position.y = height + 2.25;

    spire.add(topGem);

    spire.position.set(
      side * (10 + Math.random() * 12),
      0,
      -15 - Math.random() * 235
    );

    neoSpires.push(spire);
    neoSpireGroup.add(spire);
  }
}

/* =====================================================
   FLYING VEHICLES
===================================================== */

function createFlyingVehicles() {
  for (let i = 0; i < 9; i++) {
    const vehicle =
      createSingleFlyingVehicle(i);

    const side =
      Math.random() > 0.5 ? 1 : -1;

    vehicle.position.set(
      side * (10 + Math.random() * 8),
      4.8 + Math.random() * 6,
      -35 - Math.random() * 210
    );

    vehicle.userData.velocityX =
      -side *
      (0.012 + Math.random() * 0.022);

    vehicle.userData.floatOffset =
      Math.random() * Math.PI * 2;

    vehicle.userData.baseY =
      vehicle.position.y;

    flyingVehicles.push(vehicle);

    flyingVehicleGroup.add(vehicle);
  }
}

function createSingleFlyingVehicle(index) {
  const vehicle = new THREE.Group();

  const mainColor =
    index % 2 === 0
      ? 0x00a8bd
      : 0xd59b32;

  const accentColor =
    index % 3 === 0
      ? 0x7542b5
      : 0x236f98;

  const bodyMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x071425,
      metalness: 0.82,
      roughness: 0.28,
      emissive: mainColor,
      emissiveIntensity: 0.07
    });

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(
      1.15,
      0.25,
      2
    ),
    bodyMaterial
  );

  vehicle.add(body);

  const cockpit = new THREE.Mesh(
    new THREE.SphereGeometry(
      0.36,
      16,
      16
    ),
    new THREE.MeshBasicMaterial({
      color: mainColor,
      transparent: true,
      opacity: 0.52
    })
  );

  cockpit.scale.set(
    1,
    0.44,
    1.3
  );

  cockpit.position.set(
    0,
    0.27,
    0.12
  );

  vehicle.add(cockpit);

  const leftWing = new THREE.Mesh(
    new THREE.BoxGeometry(
      1.1,
      0.06,
      0.42
    ),
    new THREE.MeshBasicMaterial({
      color: accentColor,
      transparent: true,
      opacity: 0.65
    })
  );

  leftWing.position.x = -0.95;
  vehicle.add(leftWing);

  const rightWing =
    leftWing.clone();

  rightWing.position.x = 0.95;
  vehicle.add(rightWing);

  const rearGlow = new THREE.Mesh(
    new THREE.BoxGeometry(
      0.52,
      0.09,
      0.08
    ),
    new THREE.MeshBasicMaterial({
      color: mainColor,
      transparent: true,
      opacity: 0.65
    })
  );

  rearGlow.position.z = 1.03;
  vehicle.add(rearGlow);

  vehicle.scale.set(
    0.72,
    0.72,
    0.72
  );

  return vehicle;
}

/* =====================================================
   ATMOSPHERIC PARTICLES
===================================================== */

function createAtmosphereParticles() {
  const particleCount =
    window.innerWidth < 720
      ? 180
      : 360;

  const positions =
    new Float32Array(
      particleCount * 3
    );

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] =
      (Math.random() - 0.5) * 40;

    positions[i * 3 + 1] =
      Math.random() * 16;

    positions[i * 3 + 2] =
      -Math.random() * 195;
  }

  const geometry =
    new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(
      positions,
      3
    )
  );

  const material =
    new THREE.PointsMaterial({
      color: 0x79c7d4,
      size: 0.055,
      transparent: true,
      opacity: 0.42,
      depthWrite: false
    });

  atmosphereParticles =
    new THREE.Points(
      geometry,
      material
    );

  atmosphereGroup.add(
    atmosphereParticles
  );
}

/* =====================================================
   DISTANT HORIZON MONUMENT
   No circular lighting
===================================================== */

function createHorizonMonument() {
  horizonMonument =
    new THREE.Group();

  const darkMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x081427,
      metalness: 0.7,
      roughness: 0.32,
      emissive: 0x0b3d55,
      emissiveIntensity: 0.05
    });

  const goldMaterial =
    new THREE.MeshBasicMaterial({
      color: 0xb98124,
      transparent: true,
      opacity: 0.45
    });

  const cyanMaterial =
    new THREE.MeshBasicMaterial({
      color: 0x008fa6,
      transparent: true,
      opacity: 0.45
    });

  /* Central monument tower */

  const centralTower = new THREE.Mesh(
    new THREE.BoxGeometry(
      2.4,
      14,
      1.2
    ),
    darkMaterial
  );

  centralTower.position.y = 7;

  horizonMonument.add(
    centralTower
  );

  /* Monument crown */

  const crown = new THREE.Mesh(
    new THREE.ConeGeometry(
      2.2,
      4,
      4
    ),
    darkMaterial
  );

  crown.position.y = 16;
  crown.rotation.y = Math.PI / 4;

  horizonMonument.add(crown);

  /* Vertical energy lines */

  const leftBeam = new THREE.Mesh(
    new THREE.BoxGeometry(
      0.12,
      12,
      0.14
    ),
    cyanMaterial
  );

  leftBeam.position.set(
    -0.65,
    7,
    0.68
  );

  horizonMonument.add(leftBeam);

  const rightBeam = new THREE.Mesh(
    new THREE.BoxGeometry(
      0.12,
      12,
      0.14
    ),
    goldMaterial
  );

  rightBeam.position.set(
    0.65,
    7,
    0.68
  );

  horizonMonument.add(rightBeam);

  /* Floating diamond above tower */

  const topDiamond =
    createDiamondEmblem(
      0xc78c27,
      0x0098ad
    );

  topDiamond.position.set(
    0,
    19,
    0
  );

  topDiamond.scale.set(
    1.4,
    1.4,
    1.4
  );

  horizonMonument.add(
    topDiamond
  );

  horizonMonument.userData.topDiamond =
    topDiamond;

  horizonMonument.position.set(
    0,
    0,
    -142
  );

  horizonGroup.add(
    horizonMonument
  );
}

/* =====================================================
   VISUAL UPDATE LOOP
===================================================== */

function updateNeoAryavartaVisuals() {
  if (!neoVisualGroup) return;

  const currentTime =
    Date.now() * 0.001;

  updateNeoGates(currentTime);
  updateHologramBoards(currentTime);
  updateNeoSpires();
  updateFlyingVehicles(currentTime);
  updateAtmosphereParticles();
  updateHorizonMonument(currentTime);
}

/* =====================================================
   UPDATE GATES
===================================================== */

function updateNeoGates(currentTime) {
  neoGates.forEach(function (gate) {
    gate.position.z += speed;

    if (gate.position.z > 18) {
      gate.position.z -=
        NEO_GATE_LOOP_DISTANCE;
    }

    if (gate.userData.emblem) {
      gate.userData.emblem.rotation.z =
        Math.sin(
          currentTime * 0.7 +
          gate.userData.emblemFloatOffset
        ) * 0.08;

      const emblemScale =
        0.78 +
        Math.sin(
          currentTime * 1.2 +
          gate.userData.emblemFloatOffset
        ) * 0.015;

      gate.userData.emblem.scale.set(
        emblemScale,
        emblemScale,
        emblemScale
      );
    }
  });
}

/* =====================================================
   UPDATE HOLOGRAMS
===================================================== */

function updateHologramBoards(currentTime) {
  hologramBoards.forEach(function (board) {
    board.position.z += speed * 0.82;

    board.position.y =
      board.userData.baseY +
      Math.sin(
        currentTime * 1.4 +
        board.userData.floatOffset
      ) * 0.1;

    board.material.opacity =
      0.65 +
      Math.sin(
        currentTime * 2.4 +
        board.userData.floatOffset
      ) * 0.06;

    if (board.position.z > 22) {
      board.position.z -= 260;
    }
  });
}

/* =====================================================
   UPDATE SPIRES
===================================================== */

function updateNeoSpires() {
  neoSpires.forEach(function (spire) {
    spire.position.z += speed * 0.66;

    if (spire.position.z > 34) {
      spire.position.z -= 250;
    }
  });
}

/* =====================================================
   UPDATE VEHICLES
===================================================== */

function updateFlyingVehicles(currentTime) {
  flyingVehicles.forEach(function (vehicle) {
    vehicle.position.z += speed * 0.76;

    vehicle.position.x +=
      vehicle.userData.velocityX;

    vehicle.position.y =
      vehicle.userData.baseY +
      Math.sin(
        currentTime * 1.8 +
        vehicle.userData.floatOffset
      ) * 0.08;

    if (
      vehicle.position.z > 26 ||
      Math.abs(vehicle.position.x) > 24
    ) {
      resetFlyingVehicle(vehicle);
    }
  });
}

function resetFlyingVehicle(vehicle) {
  const side =
    Math.random() > 0.5 ? 1 : -1;

  vehicle.position.set(
    side * (10 + Math.random() * 8),
    4.8 + Math.random() * 6,
    -175 - Math.random() * 90
  );

  vehicle.userData.baseY =
    vehicle.position.y;

  vehicle.userData.velocityX =
    -side *
    (0.012 + Math.random() * 0.022);
}

/* =====================================================
   UPDATE PARTICLES
===================================================== */

function updateAtmosphereParticles() {
  if (!atmosphereParticles) return;

  atmosphereParticles.position.z +=
    speed * 0.18;

  atmosphereParticles.rotation.y +=
    0.00035;

  if (
    atmosphereParticles.position.z > 28
  ) {
    atmosphereParticles.position.z =
      -65;
  }
}

/* =====================================================
   UPDATE HORIZON MONUMENT
===================================================== */

function updateHorizonMonument(currentTime) {
  if (!horizonMonument) return;

  const topDiamond =
    horizonMonument.userData.topDiamond;

  if (topDiamond) {
    topDiamond.rotation.y += 0.004;

    topDiamond.position.y =
      19 +
      Math.sin(currentTime * 0.8) *
      0.18;
  }
}
