/* player.js
   Velocity Runner: Rise of Bharat

   Phase 1B:
   - Detailed cyber runner
   - Running animation
   - Jump animation
   - Slide animation
   - Lane-change leaning
   - Surya Core pulse
   - Energy trail
*/

/* =====================================================
   PLAYER ANIMATION STATE
===================================================== */

let playerRunClock = 0;
let playerTrailGroup = null;
let playerTrailSegments = [];
let dashTrailTimer = 0;

/* =====================================================
   CREATE PLAYER
===================================================== */

function createPlayer() {
  player = new THREE.Group();

  const bodyRoot = new THREE.Group();
  player.add(bodyRoot);

  /* Main materials */

  const armourMaterial = new THREE.MeshStandardMaterial({
    color: 0x082c63,
    metalness: 0.72,
    roughness: 0.22,
    emissive: 0x00396f,
    emissiveIntensity: 0.22
  });

  const darkArmourMaterial = new THREE.MeshStandardMaterial({
    color: 0x031226,
    metalness: 0.78,
    roughness: 0.25,
    emissive: 0x00172e,
    emissiveIntensity: 0.16
  });

  const cyanGlowMaterial = new THREE.MeshBasicMaterial({
    color: 0x00c5dd,
    transparent: true,
    opacity: 0.82
  });

  const goldGlowMaterial = new THREE.MeshBasicMaterial({
    color: 0xe6aa38,
    transparent: true,
    opacity: 0.9
  });

  const purpleGlowMaterial = new THREE.MeshBasicMaterial({
    color: 0x8450cf,
    transparent: true,
    opacity: 0.72
  });

  /* =====================================================
     TORSO
  ===================================================== */

  const torso = new THREE.Mesh(
    new THREE.BoxGeometry(0.82, 1.05, 0.48),
    armourMaterial
  );

  torso.position.y = 1.55;
  torso.castShadow = true;

  bodyRoot.add(torso);

  const chestPlate = new THREE.Mesh(
    new THREE.BoxGeometry(0.58, 0.58, 0.12),
    darkArmourMaterial
  );

  chestPlate.position.set(0, 1.62, 0.31);
  chestPlate.rotation.x = -0.08;

  bodyRoot.add(chestPlate);

  const chestEnergyLine = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.7, 0.045),
    cyanGlowMaterial
  );

  chestEnergyLine.position.set(0, 1.58, 0.39);

  bodyRoot.add(chestEnergyLine);

  /* Shoulder armour */

  const leftShoulderPlate = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.22, 0.5),
    armourMaterial
  );

  leftShoulderPlate.position.set(-0.57, 1.95, 0);
  leftShoulderPlate.rotation.z = -0.18;

  bodyRoot.add(leftShoulderPlate);

  const rightShoulderPlate = leftShoulderPlate.clone();

  rightShoulderPlate.position.x = 0.57;
  rightShoulderPlate.rotation.z = 0.18;

  bodyRoot.add(rightShoulderPlate);

  /* Waist */

  const waist = new THREE.Mesh(
    new THREE.BoxGeometry(0.65, 0.26, 0.4),
    darkArmourMaterial
  );

  waist.position.y = 0.93;
  bodyRoot.add(waist);

  const waistGlow = new THREE.Mesh(
    new THREE.BoxGeometry(0.52, 0.06, 0.44),
    goldGlowMaterial
  );

  waistGlow.position.y = 1;
  bodyRoot.add(waistGlow);

  /* =====================================================
     HEAD AND HELMET
  ===================================================== */

  const headGroup = new THREE.Group();
  headGroup.position.y = 2.38;

  bodyRoot.add(headGroup);

  const helmet = new THREE.Mesh(
    new THREE.SphereGeometry(0.36, 24, 24),
    darkArmourMaterial
  );

  helmet.scale.set(1, 1.08, 0.95);
  helmet.castShadow = true;

  headGroup.add(helmet);

  const faceGuard = new THREE.Mesh(
    new THREE.BoxGeometry(0.53, 0.27, 0.11),
    armourMaterial
  );

  faceGuard.position.set(0, -0.08, 0.31);

  headGroup.add(faceGuard);

  const visor = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.1, 0.05),
    cyanGlowMaterial
  );

  visor.position.set(0, 0.07, 0.38);

  headGroup.add(visor);

  const helmetCrest = new THREE.Mesh(
    new THREE.ConeGeometry(0.11, 0.45, 4),
    goldGlowMaterial
  );

  helmetCrest.position.set(0, 0.48, -0.02);
  helmetCrest.rotation.y = Math.PI / 4;

  headGroup.add(helmetCrest);

  /* =====================================================
     ARMS
  ===================================================== */

  const leftArm = createCyberArm(
    armourMaterial,
    darkArmourMaterial,
    cyanGlowMaterial
  );

  leftArm.position.set(-0.55, 1.9, 0);
  bodyRoot.add(leftArm);

  const rightArm = createCyberArm(
    armourMaterial,
    darkArmourMaterial,
    goldGlowMaterial
  );

  rightArm.position.set(0.55, 1.9, 0);
  bodyRoot.add(rightArm);

  /* =====================================================
     LEGS
  ===================================================== */

  const leftLeg = createCyberLeg(
    armourMaterial,
    darkArmourMaterial,
    cyanGlowMaterial
  );

  leftLeg.position.set(-0.23, 0.92, 0);
  bodyRoot.add(leftLeg);

  const rightLeg = createCyberLeg(
    armourMaterial,
    darkArmourMaterial,
    goldGlowMaterial
  );

  rightLeg.position.set(0.23, 0.92, 0);
  bodyRoot.add(rightLeg);

  /* =====================================================
     SURYA CORE
  ===================================================== */

  suryaCore = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.25, 1),
    goldGlowMaterial
  );

  suryaCore.position.set(0, 1.63, 0.46);
  bodyRoot.add(suryaCore);

  const coreFrame = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.35, 0),
    new THREE.MeshBasicMaterial({
      color: 0x00a9c4,
      wireframe: true,
      transparent: true,
      opacity: 0.72
    })
  );

  coreFrame.position.copy(suryaCore.position);
  bodyRoot.add(coreFrame);

  const coreLight = new THREE.PointLight(
    0xe6aa38,
    2.2,
    11
  );

  coreLight.position.set(0, 1.63, 0.58);
  bodyRoot.add(coreLight);

  /* =====================================================
     BACK ENERGY UNIT
  ===================================================== */

  const backpack = new THREE.Mesh(
    new THREE.BoxGeometry(0.48, 0.72, 0.18),
    darkArmourMaterial
  );

  backpack.position.set(0, 1.55, -0.34);
  bodyRoot.add(backpack);

  const leftBackLight = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.48, 0.06),
    purpleGlowMaterial
  );

  leftBackLight.position.set(-0.14, 1.55, -0.45);
  bodyRoot.add(leftBackLight);

  const rightBackLight = leftBackLight.clone();
  rightBackLight.position.x = 0.14;

  bodyRoot.add(rightBackLight);

  /* =====================================================
     GROUND SHADOW
  ===================================================== */

  const shadowMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.35,
    depthWrite: false
  });

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.72, 24),
    shadowMaterial
  );

  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.025;

  player.add(shadow);

  /* Save animation rig */

  player.userData.rig = {
    bodyRoot: bodyRoot,
    torso: torso,
    headGroup: headGroup,
    leftArm: leftArm,
    rightArm: rightArm,
    leftLeg: leftLeg,
    rightLeg: rightLeg,
    coreFrame: coreFrame,
    coreLight: coreLight,
    shadow: shadow
  };

  player.userData.previousX = lanes[currentLane];

  player.position.set(
    lanes[currentLane],
    0,
    0
  );

  scene.add(player);

  createPlayerEnergyTrail();
}

/* =====================================================
   CREATE ARM
===================================================== */

function createCyberArm(
  armourMaterial,
  darkMaterial,
  glowMaterial
) {
  const arm = new THREE.Group();

  const upperArm = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.58, 0.22),
    armourMaterial
  );

  upperArm.position.y = -0.28;
  upperArm.castShadow = true;

  arm.add(upperArm);

  const elbow = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 14, 14),
    glowMaterial
  );

  elbow.position.y = -0.6;
  arm.add(elbow);

  const lowerArm = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.52, 0.2),
    darkMaterial
  );

  lowerArm.position.y = -0.86;
  lowerArm.rotation.x = -0.08;

  arm.add(lowerArm);

  const wristGlow = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.07, 0.24),
    glowMaterial
  );

  wristGlow.position.y = -1.14;
  arm.add(wristGlow);

  return arm;
}

/* =====================================================
   CREATE LEG
===================================================== */

function createCyberLeg(
  armourMaterial,
  darkMaterial,
  glowMaterial
) {
  const leg = new THREE.Group();

  const upperLeg = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.68, 0.3),
    armourMaterial
  );

  upperLeg.position.y = -0.34;
  upperLeg.castShadow = true;

  leg.add(upperLeg);

  const knee = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, 0.18, 0.36),
    glowMaterial
  );

  knee.position.set(0, -0.72, 0.06);
  leg.add(knee);

  const lowerLeg = new THREE.Mesh(
    new THREE.BoxGeometry(0.25, 0.65, 0.27),
    darkMaterial
  );

  lowerLeg.position.y = -1.08;
  lowerLeg.castShadow = true;

  leg.add(lowerLeg);

  const boot = new THREE.Mesh(
    new THREE.BoxGeometry(0.34, 0.22, 0.54),
    armourMaterial
  );

  boot.position.set(0, -1.44, 0.1);
  boot.castShadow = true;

  leg.add(boot);

  const bootGlow = new THREE.Mesh(
    new THREE.BoxGeometry(0.25, 0.06, 0.48),
    glowMaterial
  );

  bootGlow.position.set(0, -1.55, 0.12);
  leg.add(bootGlow);

  return leg;
}

/* =====================================================
   ENERGY TRAIL
===================================================== */

function createPlayerEnergyTrail() {
  playerTrailSegments = [];
  playerTrailGroup = new THREE.Group();

  for (let i = 0; i < 12; i++) {
    const material = new THREE.MeshBasicMaterial({
      color: i % 2 === 0 ? 0x00c5dd : 0xe6aa38,
      transparent: true,
      opacity: 0.08,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const segment = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.08, 0.9),
      material
    );

    segment.userData.index = i;

    playerTrailSegments.push(segment);
    playerTrailGroup.add(segment);
  }

  scene.add(playerTrailGroup);
}

function updatePlayerEnergyTrail() {
  if (!playerTrailGroup || !player) return;

  if (dashTrailTimer > 0) {
    dashTrailTimer--;
  }

  const dashStrength =
    dashTrailTimer > 0 ? 1 : 0;

  const regularStrength = Math.min(
    1,
    Math.max(0, speed - START_SPEED) * 2.2
  );

  const trailStrength = Math.max(
    regularStrength * 0.35,
    dashStrength
  );

  playerTrailSegments.forEach(function (
    segment,
    index
  ) {
    const row = index % 3;
    const depthIndex = Math.floor(index / 3);

    const xOffset =
      row === 0
        ? -0.32
        : row === 1
          ? 0
          : 0.32;

    const targetX =
      player.position.x + xOffset;

    segment.position.x +=
      (targetX - segment.position.x) * 0.22;

    segment.position.y =
      0.45 + row * 0.48 + player.position.y;

    segment.position.z =
      0.8 + depthIndex * 0.72;

    segment.scale.z =
      0.7 + trailStrength * 2.5;

    segment.material.opacity =
      trailStrength *
      Math.max(
        0.08,
        0.42 - depthIndex * 0.075
      );

    segment.visible =
      segment.material.opacity > 0.015;
  });
}

/* =====================================================
   MOVEMENT CONTROLS
===================================================== */

function moveLeft() {
  if (!gameRunning || gamePaused) return;

  currentLane = Math.max(
    0,
    currentLane - 1
  );
}

function moveRight() {
  if (!gameRunning || gamePaused) return;

  currentLane = Math.min(
    2,
    currentLane + 1
  );
}

function jump() {
  if (!gameRunning || gamePaused) return;

  if (!isJumping && !isSliding) {
    velocityY = 0.78;
    isJumping = true;

    triggerCameraShake(0.04);
  }
}

function slide() {
  if (!gameRunning || gamePaused) return;
  if (isJumping) return;

  isSliding = true;
  slideTimer = 34;

  triggerCameraShake(0.035);
}

function dash() {
  if (!gameRunning || gamePaused) return;

  speed += 0.18;
  dashTrailTimer = 34;

  triggerCameraShake(0.1);

  if (abilityText) {
    abilityText.textContent =
      "Surya Dash Activated";
  }

  setTimeout(function () {
    if (abilityText) {
      abilityText.textContent =
        "Surya Dash Ready";
    }
  }, 900);
}

/* =====================================================
   UPDATE PLAYER
===================================================== */

function updatePlayer() {
  if (!player || !player.userData.rig) {
    return;
  }

  const rig = player.userData.rig;
  const targetX = lanes[currentLane];

  const laneDifference =
    targetX - player.position.x;

  player.position.x +=
    laneDifference * 0.18;

  /* Jump physics */

  if (isJumping) {
    playerY += velocityY;
    velocityY += gravity;

    if (playerY <= 1) {
      playerY = 1;
      velocityY = 0;
      isJumping = false;

      triggerCameraShake(0.055);
    }
  }

  player.position.y = playerY - 1;

  /* Slide timer */

  if (isSliding) {
    slideTimer--;

    if (slideTimer <= 0) {
      isSliding = false;
    }
  }

  playerRunClock +=
    0.16 + speed * 0.55;

  const runWave =
    Math.sin(playerRunClock);

  const oppositeRunWave =
    Math.sin(playerRunClock + Math.PI);

  const runStrength = Math.min(
    0.82,
    0.48 + speed * 0.42
  );

  /* Default running pose */

  let leftArmRotation =
    oppositeRunWave * runStrength;

  let rightArmRotation =
    runWave * runStrength;

  let leftLegRotation =
    runWave * runStrength;

  let rightLegRotation =
    oppositeRunWave * runStrength;

  let bodyTargetY = 0;
  let bodyTargetRotationX = 0;
  let bodyTargetScaleY = 1;

  /* Jump pose */

  if (isJumping) {
    leftArmRotation = -0.55;
    rightArmRotation = -0.55;

    leftLegRotation = 0.42;
    rightLegRotation = -0.28;

    bodyTargetRotationX = -0.08;
  }

  /* Slide pose */

  if (isSliding) {
    leftArmRotation = -1.2;
    rightArmRotation = -1.2;

    leftLegRotation = 0.95;
    rightLegRotation = 0.55;

    bodyTargetY = -0.48;
    bodyTargetRotationX = -0.82;
    bodyTargetScaleY = 0.62;
  }

  rig.leftArm.rotation.x +=
    (
      leftArmRotation -
      rig.leftArm.rotation.x
    ) * 0.3;

  rig.rightArm.rotation.x +=
    (
      rightArmRotation -
      rig.rightArm.rotation.x
    ) * 0.3;

  rig.leftLeg.rotation.x +=
    (
      leftLegRotation -
      rig.leftLeg.rotation.x
    ) * 0.3;

  rig.rightLeg.rotation.x +=
    (
      rightLegRotation -
      rig.rightLeg.rotation.x
    ) * 0.3;

  rig.bodyRoot.position.y +=
    (
      bodyTargetY -
      rig.bodyRoot.position.y
    ) * 0.28;

  rig.bodyRoot.rotation.x +=
    (
      bodyTargetRotationX -
      rig.bodyRoot.rotation.x
    ) * 0.25;

  rig.bodyRoot.scale.y +=
    (
      bodyTargetScaleY -
      rig.bodyRoot.scale.y
    ) * 0.3;

  /* Lean while changing lanes */

  const targetLean = THREE.MathUtils.clamp(
    -laneDifference * 0.1,
    -0.22,
    0.22
  );

  rig.bodyRoot.rotation.z +=
    (
      targetLean -
      rig.bodyRoot.rotation.z
    ) * 0.18;

  /* Running body movement */

  if (!isSliding && !isJumping) {
    rig.bodyRoot.position.y +=
      Math.abs(runWave) * 0.025;

    rig.headGroup.rotation.z =
      Math.sin(playerRunClock * 0.5) *
      0.025;
  } else {
    rig.headGroup.rotation.z *= 0.85;
  }

  /* Surya Core pulse */

  if (suryaCore) {
    suryaCore.rotation.x += 0.035;
    suryaCore.rotation.y += 0.065;

    const corePulse =
      1 +
      Math.sin(Date.now() * 0.006) *
      0.09;

    suryaCore.scale.set(
      corePulse,
      corePulse,
      corePulse
    );
  }

  if (rig.coreFrame) {
    rig.coreFrame.rotation.x -= 0.018;
    rig.coreFrame.rotation.y += 0.028;
  }

  if (rig.coreLight) {
    rig.coreLight.intensity =
      1.9 +
      Math.sin(Date.now() * 0.006) *
      0.35;
  }

  /* Ground shadow */

  if (rig.shadow) {
    const jumpHeight =
      Math.max(0, player.position.y);

    const shadowScale =
      Math.max(
        0.55,
        1 - jumpHeight * 0.12
      );

    rig.shadow.scale.set(
      shadowScale,
      shadowScale,
      shadowScale
    );

    rig.shadow.material.opacity =
      Math.max(
        0.12,
        0.35 - jumpHeight * 0.055
      );

    rig.shadow.position.y =
      -player.position.y + 0.025;
  }

  updatePlayerEnergyTrail();

  /* Damage blink */

  if (invincibleTimer > 0) {
    invincibleTimer--;

    player.visible =
      Math.floor(invincibleTimer / 6) %
        2 ===
      0;
  } else {
    player.visible = true;
  }

  player.userData.previousX =
    player.position.x;
}

/* =====================================================
   PLAYER DAMAGE
===================================================== */

function damagePlayer(amount) {
  if (
    invincibleTimer > 0 ||
    gameOver
  ) {
    return;
  }

  if (shieldActive) {
    shieldActive = false;

    updateShieldStatus();

    invincibleTimer = 45;

    createExplosion(
      player.position.x,
      player.position.y + 1.2,
      player.position.z
    );

    triggerCameraShake(0.18);

    setMission(
      "Shield absorbed damage",
      90
    );

    return;
  }

  coreHealth = Math.max(
    0,
    coreHealth - amount
  );

  invincibleTimer = 75;

  updateCoreHealth();

  createExplosion(
    player.position.x,
    player.position.y + 1.2,
    player.position.z
  );

  triggerCameraShake(0.3);

  setMission(
    "Surya Core damaged",
    85
  );

  if (coreHealth <= 0) {
    endGame();
  }
}
