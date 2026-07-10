/* enemyVisuals.js
   Velocity Runner: Rise of Bharat

   Phase 1C:
   - Trinetra drone visual upgrade
   - Animated attack blades
   - Thruster effects
   - Scanning beam
   - AI Guardian boss armour
   - Floating boss weapons
   - Pulsating energy effects
*/

let enemyVisualClock = 0;

/* =====================================================
   UPGRADE DRONE
===================================================== */

function upgradeDroneVisuals() {
  if (!drone) return;

  const visualRig = new THREE.Group();

  const armourMaterial = new THREE.MeshStandardMaterial({
    color: 0x120812,
    metalness: 0.88,
    roughness: 0.18,
    emissive: 0x5a0018,
    emissiveIntensity: 0.22
  });

  const darkMaterial = new THREE.MeshStandardMaterial({
    color: 0x030306,
    metalness: 0.92,
    roughness: 0.2
  });

  const redGlowMaterial = new THREE.MeshBasicMaterial({
    color: 0xff1744,
    transparent: true,
    opacity: 0.84
  });

  const purpleGlowMaterial = new THREE.MeshBasicMaterial({
    color: 0xb52cff,
    transparent: true,
    opacity: 0.68
  });

  /* Outer armoured shell */

  const shell = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.5, 0),
    armourMaterial
  );

  shell.scale.set(1.15, 0.8, 1);
  visualRig.add(shell);

  /* Front Trinetra eye */

  const eyeFrame = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.22, 0),
    darkMaterial
  );

  eyeFrame.position.set(0, 0, 0.48);
  eyeFrame.scale.set(1.25, 0.72, 0.35);

  visualRig.add(eyeFrame);

  const mainEye = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 18, 18),
    redGlowMaterial
  );

  mainEye.position.set(0, 0, 0.59);
  visualRig.add(mainEye);

  /* Three smaller AI eyes */

  const smallEyes = [];

  [-0.2, 0, 0.2].forEach(function (xPosition, index) {
    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.035, 12, 12),
      index === 1
        ? redGlowMaterial
        : purpleGlowMaterial
    );

    eye.position.set(
      xPosition,
      index === 1 ? 0.11 : -0.08,
      0.59
    );

    smallEyes.push(eye);
    visualRig.add(eye);
  });

  /* Rotating attack blades */

  const bladePivots = [];

  for (let i = 0; i < 3; i++) {
    const bladePivot = new THREE.Group();

    bladePivot.rotation.z =
      (Math.PI * 2 * i) / 3;

    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 0.09, 0.2),
      armourMaterial
    );

    blade.position.x = 0.58;
    blade.rotation.z = -0.16;

    bladePivot.add(blade);

    const bladeEdge = new THREE.Mesh(
      new THREE.BoxGeometry(0.62, 0.035, 0.23),
      redGlowMaterial
    );

    bladeEdge.position.set(0.59, 0.065, 0);
    bladePivot.add(bladeEdge);

    const bladeTip = new THREE.Mesh(
      new THREE.ConeGeometry(0.12, 0.34, 4),
      purpleGlowMaterial
    );

    bladeTip.position.set(0.98, 0, 0);
    bladeTip.rotation.z = -Math.PI / 2;
    bladeTip.rotation.y = Math.PI / 4;

    bladePivot.add(bladeTip);

    bladePivots.push(bladePivot);
    visualRig.add(bladePivot);
  }

  /* Side armour fins */

  [-1, 1].forEach(function (side) {
    const fin = new THREE.Mesh(
      new THREE.ConeGeometry(0.22, 0.9, 4),
      armourMaterial
    );

    fin.position.set(side * 0.73, 0, -0.05);
    fin.rotation.z =
      side > 0 ? -Math.PI / 2 : Math.PI / 2;

    visualRig.add(fin);

    const finGlow = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.035, 0.07),
      purpleGlowMaterial
    );

    finGlow.position.set(side * 0.72, 0.03, 0.1);
    visualRig.add(finGlow);
  });

  /* Rear thrusters */

  const thrusters = [];

  [-0.22, 0.22].forEach(function (xPosition) {
    const thruster = new THREE.Group();

    const engine = new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.11,
        0.14,
        0.32,
        12
      ),
      darkMaterial
    );

    engine.rotation.x = Math.PI / 2;
    thruster.add(engine);

    const flame = new THREE.Mesh(
      new THREE.ConeGeometry(0.095, 0.55, 12),
      purpleGlowMaterial
    );

    flame.position.z = -0.4;
    flame.rotation.x = -Math.PI / 2;

    thruster.add(flame);

    thruster.position.set(xPosition, -0.1, -0.48);

    thruster.userData.flame = flame;

    thrusters.push(thruster);
    visualRig.add(thruster);
  });

  /* Downward scanning beam */

  const scanBeamMaterial = new THREE.MeshBasicMaterial({
    color: 0xff1744,
    transparent: true,
    opacity: 0.16,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const scanBeam = new THREE.Mesh(
    new THREE.ConeGeometry(0.5, 3.6, 18, 1, true),
    scanBeamMaterial
  );

  scanBeam.position.y = -2;
  scanBeam.rotation.z = Math.PI;

  visualRig.add(scanBeam);

  /* Drone energy light */

  const droneEnergyLight = new THREE.PointLight(
    0xff1744,
    1.25,
    7
  );

  droneEnergyLight.position.set(0, 0, 0.4);
  visualRig.add(droneEnergyLight);

  visualRig.scale.set(1.05, 1.05, 1.05);

  drone.add(visualRig);

  drone.userData.visualRig = {
    root: visualRig,
    shell: shell,
    mainEye: mainEye,
    smallEyes: smallEyes,
    bladePivots: bladePivots,
    thrusters: thrusters,
    scanBeam: scanBeam,
    energyLight: droneEnergyLight
  };
}

/* =====================================================
   UPGRADE BOSS
===================================================== */

function upgradeBossVisuals() {
  if (!boss) return;

  const visualRig = new THREE.Group();

  const bossArmourMaterial = new THREE.MeshStandardMaterial({
    color: 0x160520,
    metalness: 0.82,
    roughness: 0.18,
    emissive: 0x4d075f,
    emissiveIntensity: 0.22
  });

  const darkBossMaterial = new THREE.MeshStandardMaterial({
    color: 0x030207,
    metalness: 0.9,
    roughness: 0.2
  });

  const purpleGlowMaterial = new THREE.MeshBasicMaterial({
    color: 0xe13cff,
    transparent: true,
    opacity: 0.7
  });

  const redGlowMaterial = new THREE.MeshBasicMaterial({
    color: 0xff1744,
    transparent: true,
    opacity: 0.78
  });

  const goldGlowMaterial = new THREE.MeshBasicMaterial({
    color: 0xffc857,
    transparent: true,
    opacity: 0.74
  });

  /* Shoulder armour */

  [-1, 1].forEach(function (side) {
    const shoulder = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.72, 1.2),
      bossArmourMaterial
    );

    shoulder.position.set(side * 2.45, 6.05, 0.1);
    shoulder.rotation.z = side * 0.18;

    visualRig.add(shoulder);

    const shoulderSpike = new THREE.Mesh(
      new THREE.ConeGeometry(0.34, 1.15, 4),
      redGlowMaterial
    );

    shoulderSpike.position.set(
      side * 2.65,
      6.92,
      0.05
    );

    shoulderSpike.rotation.z =
      side > 0 ? -0.38 : 0.38;

    shoulderSpike.rotation.y = Math.PI / 4;

    visualRig.add(shoulderSpike);

    const shoulderLine = new THREE.Mesh(
      new THREE.BoxGeometry(1.05, 0.09, 1.25),
      purpleGlowMaterial
    );

    shoulderLine.position.set(
      side * 2.45,
      6.05,
      0.72
    );

    visualRig.add(shoulderLine);
  });

  /* Chest armour panels */

  const leftChestPanel = new THREE.Mesh(
    new THREE.BoxGeometry(1.35, 2.3, 0.25),
    bossArmourMaterial
  );

  leftChestPanel.position.set(-0.92, 4.9, 0.62);
  leftChestPanel.rotation.z = -0.12;

  visualRig.add(leftChestPanel);

  const rightChestPanel = leftChestPanel.clone();

  rightChestPanel.position.x = 0.92;
  rightChestPanel.rotation.z = 0.12;

  visualRig.add(rightChestPanel);

  /* Central energy core */

  const bossCore = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.76, 1),
    goldGlowMaterial
  );

  bossCore.position.set(0, 4.85, 0.95);
  visualRig.add(bossCore);

  const coreFrame = new THREE.Mesh(
    new THREE.OctahedronGeometry(1.08, 0),
    new THREE.MeshBasicMaterial({
      color: 0xe13cff,
      wireframe: true,
      transparent: true,
      opacity: 0.58
    })
  );

  coreFrame.position.copy(bossCore.position);
  visualRig.add(coreFrame);

  /* Crown structure */

  const crownGroup = new THREE.Group();

  for (let i = -2; i <= 2; i++) {
    const spike = new THREE.Mesh(
      new THREE.ConeGeometry(
        0.2,
        1.2 + Math.abs(i) * 0.14,
        4
      ),
      i === 0
        ? goldGlowMaterial
        : purpleGlowMaterial
    );

    spike.position.set(
      i * 0.38,
      8.45 - Math.abs(i) * 0.08,
      0
    );

    spike.rotation.y = Math.PI / 4;

    crownGroup.add(spike);
  }

  visualRig.add(crownGroup);

  /* Face mask */

  const faceMask = new THREE.Mesh(
    new THREE.BoxGeometry(1.35, 0.72, 0.18),
    darkBossMaterial
  );

  faceMask.position.set(0, 7.1, 1.03);
  visualRig.add(faceMask);

  const faceEye = new THREE.Mesh(
    new THREE.BoxGeometry(0.95, 0.13, 0.06),
    redGlowMaterial
  );

  faceEye.position.set(0, 7.2, 1.15);
  visualRig.add(faceEye);

  /* Floating energy weapons */

  const floatingWeapons = [];

  [-1, 1].forEach(function (side) {
    const weaponGroup = new THREE.Group();

    const weaponBody = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.55, 0),
      bossArmourMaterial
    );

    weaponBody.scale.set(0.6, 1.6, 0.45);
    weaponGroup.add(weaponBody);

    const weaponEdge = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 1.75, 0.08),
      side > 0
        ? redGlowMaterial
        : purpleGlowMaterial
    );

    weaponEdge.position.z = 0.36;
    weaponGroup.add(weaponEdge);

    const weaponTip = new THREE.Mesh(
      new THREE.ConeGeometry(0.2, 0.65, 4),
      goldGlowMaterial
    );

    weaponTip.position.y = -1.22;
    weaponTip.rotation.z = Math.PI;

    weaponGroup.add(weaponTip);

    weaponGroup.position.set(
      side * 3.7,
      5.8,
      0.2
    );

    weaponGroup.userData.side = side;
    weaponGroup.userData.baseY = 5.8;
    weaponGroup.userData.floatOffset =
      side > 0 ? 0 : Math.PI;

    floatingWeapons.push(weaponGroup);
    visualRig.add(weaponGroup);
  });

  /* Vertical boss energy lines */

  [-1.48, 1.48].forEach(function (xPosition) {
    const energyLine = new THREE.Mesh(
      new THREE.BoxGeometry(0.09, 2.8, 0.08),
      purpleGlowMaterial
    );

    energyLine.position.set(xPosition, 4.65, 0.72);
    visualRig.add(energyLine);
  });

  const bossEnergyLight = new THREE.PointLight(
    0xe13cff,
    2.4,
    26
  );

  bossEnergyLight.position.set(0, 5.3, 1.1);
  visualRig.add(bossEnergyLight);

  boss.add(visualRig);

  boss.userData.visualRig = {
    root: visualRig,
    bossCore: bossCore,
    coreFrame: coreFrame,
    crownGroup: crownGroup,
    faceEye: faceEye,
    floatingWeapons: floatingWeapons,
    energyLight: bossEnergyLight
  };
}

/* =====================================================
   UPDATE ENEMY VISUALS
===================================================== */

function updateEnemyVisuals() {
  enemyVisualClock += 0.016;

  updateDroneVisuals();
  updateBossVisuals();
}

/* =====================================================
   UPDATE DRONE
===================================================== */

function updateDroneVisuals() {
  if (
    !drone ||
    !drone.userData ||
    !drone.userData.visualRig
  ) {
    return;
  }

  const rig = drone.userData.visualRig;

  rig.bladePivots.forEach(function (bladePivot, index) {
    bladePivot.rotation.z +=
      0.075 + index * 0.003;
  });

  const eyePulse =
    1 +
    Math.sin(enemyVisualClock * 7) *
    0.16;

  rig.mainEye.scale.set(
    eyePulse,
    eyePulse,
    eyePulse
  );

  rig.smallEyes.forEach(function (eye, index) {
    const pulse =
      1 +
      Math.sin(
        enemyVisualClock * 6 + index
      ) * 0.12;

    eye.scale.set(pulse, pulse, pulse);
  });

  rig.thrusters.forEach(function (thruster, index) {
    const flame = thruster.userData.flame;

    if (!flame) return;

    const flameScale =
      0.8 +
      Math.sin(
        enemyVisualClock * 12 + index
      ) * 0.2;

    flame.scale.y = flameScale;
  });

  rig.scanBeam.rotation.y =
    Math.sin(enemyVisualClock * 1.4) * 0.45;

  rig.scanBeam.material.opacity =
    0.1 +
    Math.sin(enemyVisualClock * 3) * 0.035;

  rig.energyLight.intensity =
    1 +
    Math.sin(enemyVisualClock * 5) * 0.22;

  rig.shell.rotation.x += 0.006;
  rig.shell.rotation.y += 0.009;
}

/* =====================================================
   UPDATE BOSS
===================================================== */

function updateBossVisuals() {
  if (
    !boss ||
    !boss.userData ||
    !boss.userData.visualRig
  ) {
    return;
  }

  const rig = boss.userData.visualRig;

  if (!bossActive) {
    return;
  }

  rig.bossCore.rotation.x += 0.018;
  rig.bossCore.rotation.y += 0.03;

  const corePulse =
    1 +
    Math.sin(enemyVisualClock * 3.5) *
    0.08;

  rig.bossCore.scale.set(
    corePulse,
    corePulse,
    corePulse
  );

  rig.coreFrame.rotation.x -= 0.012;
  rig.coreFrame.rotation.y += 0.02;

  rig.crownGroup.rotation.y =
    Math.sin(enemyVisualClock * 0.8) * 0.08;

  rig.faceEye.scale.x =
    0.85 +
    Math.sin(enemyVisualClock * 5) * 0.15;

  rig.floatingWeapons.forEach(function (
    weapon,
    index
  ) {
    weapon.position.y =
      weapon.userData.baseY +
      Math.sin(
        enemyVisualClock * 1.6 +
        weapon.userData.floatOffset
      ) * 0.32;

    weapon.rotation.y +=
      weapon.userData.side * 0.012;

    weapon.rotation.z =
      Math.sin(
        enemyVisualClock +
        index
      ) * 0.08;
  });

  rig.energyLight.intensity =
    2 +
    Math.sin(enemyVisualClock * 2.5) * 0.4;
}
