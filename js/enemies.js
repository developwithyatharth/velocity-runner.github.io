/* =========================================================
   enemies.js
   Velocity Runner: Rise of Bharat

   Features:
   - Trinetra Drone
   - EMP attacks
   - Drone destruction and respawn
   - AI Guardian boss
   - Boss laser attacks
   - Obstacles
   - Audio and camera feedback
   - Safe object cleanup
========================================================= */


/* =========================================================
   CREATE DRONE
========================================================= */

function createDrone() {
  drone = new THREE.Group();

  const droneMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x090909,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0xff0033,
      emissiveIntensity: 0.45
    });

  const body = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.35),
    droneMaterial
  );

  drone.add(body);

  const eye = new THREE.Mesh(
    new THREE.SphereGeometry(
      0.1,
      24,
      24
    ),
    new THREE.MeshBasicMaterial({
      color: 0xff0033
    })
  );

  eye.position.set(0, 0, 0.32);
  drone.add(eye);

  const leftWing = new THREE.Mesh(
    new THREE.BoxGeometry(
      0.7,
      0.06,
      0.18
    ),
    new THREE.MeshBasicMaterial({
      color: 0xff0033
    })
  );

  leftWing.position.set(
    -0.45,
    0,
    0
  );

  drone.add(leftWing);

  const rightWing =
    leftWing.clone();

  rightWing.position.x = 0.45;
  drone.add(rightWing);

  const droneLight =
    new THREE.PointLight(
      0xff0033,
      1.3,
      8
    );

  droneLight.position.set(
    0,
    0,
    0.4
  );

  drone.add(droneLight);

  drone.position.set(
    2.8,
    3.3,
    1.8
  );

  drone.scale.set(
    0.85,
    0.85,
    0.85
  );

  drone.visible = true;

  scene.add(drone);
}


/* =========================================================
   UPDATE DRONE
========================================================= */

function updateDrone() {
  if (!drone || !player) {
    return;
  }

  if (droneAlive) {
    drone.visible = true;

    drone.position.x +=
      (
        player.position.x +
        2.6 -
        drone.position.x
      ) * 0.035;

    drone.position.y =
      3.3 +
      Math.sin(
        Date.now() * 0.006
      ) * 0.18;

    drone.position.z = 1.8;

    drone.rotation.y += 0.04;

    droneShootTimer--;

    if (droneShootTimer <= 0) {
      droneShootEMP();

      droneShootTimer =
        Math.max(
          55,
          (
            150 -
            Math.floor(
              distance / 70
            )
          ) /
          difficultySettings
            .droneAttackMultiplier
        );
    }
  } else {
    droneRespawnTimer--;

    if (droneRespawnTimer <= 0) {
      respawnDrone();
    }
  }
}


/* =========================================================
   DRONE EMP ATTACK
========================================================= */

function droneShootEMP() {
  if (
    !droneAlive ||
    !drone ||
    !player ||
    !empGroup
  ) {
    return;
  }

  const emp = new THREE.Group();

  const empCore = new THREE.Mesh(
    new THREE.SphereGeometry(
      0.2,
      16,
      16
    ),
    new THREE.MeshBasicMaterial({
      color: 0xff2aff
    })
  );

  emp.add(empCore);

  const empShell = new THREE.Mesh(
    new THREE.SphereGeometry(
      0.3,
      14,
      14
    ),
    new THREE.MeshBasicMaterial({
      color: 0x00eaff,
      wireframe: true,
      transparent: true,
      opacity: 0.55
    })
  );

  emp.add(empShell);

  const empLight =
    new THREE.PointLight(
      0xff2aff,
      1.8,
      8
    );

  emp.add(empLight);

  emp.position.copy(
    drone.position
  );

  const target =
    new THREE.Vector3(
      player.position.x,
      player.position.y + 1.35,
      player.position.z
    );

  const direction =
    new THREE.Vector3()
      .subVectors(
        target,
        emp.position
      )
      .normalize();

  emp.userData.direction =
    direction;

  emp.userData.life = 110;

  emp.userData.core =
    empCore;

  emp.userData.shell =
    empShell;

  empShots.push(emp);
  empGroup.add(emp);

  if (
    typeof playGameTone ===
    "function"
  ) {
    playGameTone({
      frequency: 210,
      endFrequency: 90,
      duration: 0.22,
      volume: 0.06,
      type: "sawtooth"
    });
  }

  setMission(
    "EMP fired by drone",
    65
  );
}


/* =========================================================
   DESTROY DRONE
========================================================= */

function destroyDrone() {
  if (
    !droneAlive ||
    !drone
  ) {
    return;
  }

  const explosionX =
    drone.position.x;

  const explosionY =
    drone.position.y;

  const explosionZ =
    drone.position.z;

  droneAlive = false;
  drone.visible = false;

  droneRespawnTimer = 130;
  droneShootTimer = 130;

  dronesDestroyed++;
  shards += 5;

  if (
    typeof playDroneDestroyedSound ===
    "function"
  ) {
    playDroneDestroyedSound();
  }

  createExplosion(
    explosionX,
    explosionY,
    explosionZ
  );

  if (
    typeof triggerCameraShake ===
    "function"
  ) {
    triggerCameraShake(0.18);
  }

  setMission(
    "Drone destroyed +5 Surya Shards",
    100
  );

  if (abilityText) {
    abilityText.textContent =
      "Drone Down";
  }

  setTimeout(function () {
    if (abilityText) {
      abilityText.textContent =
        "Surya Dash Ready";
    }
  }, 900);
}


/* =========================================================
   RESPAWN DRONE
========================================================= */

function respawnDrone() {
  if (!drone) {
    return;
  }

  droneAlive = true;
  drone.visible = true;

  const side =
    Math.random() > 0.5
      ? 1
      : -1;

  drone.position.set(
    side * 2.8,
    3.3,
    1.8
  );

  droneShootTimer =
    Math.max(
      60,
      (
        145 -
        Math.floor(
          distance / 80
        )
      ) /
      difficultySettings
        .droneAttackMultiplier
    );

  setMission(
    "New Trinetra drone incoming",
    80
  );
}


/* =========================================================
   CREATE BOSS
========================================================= */

function createBoss() {
  boss = new THREE.Group();

  const bossMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x180018,
      metalness: 0.7,
      roughness: 0.2,
      emissive: 0xff2aff,
      emissiveIntensity: 0.4
    });

  const eyeMaterial =
    new THREE.MeshBasicMaterial({
      color: 0xff0033
    });

  const coreMaterial =
    new THREE.MeshBasicMaterial({
      color: 0xffd166
    });

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(
      3.8,
      3.8,
      1
    ),
    bossMaterial
  );

  body.position.y = 4.6;
  boss.add(body);

  const head = new THREE.Mesh(
    new THREE.OctahedronGeometry(
      1.2
    ),
    bossMaterial
  );

  head.position.y = 7.1;
  boss.add(head);

  const eye = new THREE.Mesh(
    new THREE.SphereGeometry(
      0.28,
      24,
      24
    ),
    eyeMaterial
  );

  eye.position.set(
    0,
    7.1,
    0.65
  );

  boss.add(eye);

  const core = new THREE.Mesh(
    new THREE.TorusGeometry(
      1.2,
      0.08,
      12,
      48
    ),
    coreMaterial
  );

  core.position.set(
    0,
    4.6,
    0.7
  );

  boss.add(core);

  const leftArm = new THREE.Mesh(
    new THREE.BoxGeometry(
      0.55,
      3.2,
      0.55
    ),
    bossMaterial
  );

  leftArm.position.set(
    -2.5,
    4.7,
    0
  );

  leftArm.rotation.z = 0.25;
  boss.add(leftArm);

  const rightArm =
    leftArm.clone();

  rightArm.position.x = 2.5;
  rightArm.rotation.z = -0.25;

  boss.add(rightArm);

  const bossLight =
    new THREE.PointLight(
      0xff2aff,
      2.4,
      30
    );

  bossLight.position.set(
    0,
    5.5,
    1
  );

  boss.add(bossLight);

  boss.position.set(
    0,
    0,
    -28
  );

  boss.visible = false;

  scene.add(boss);
}


/* =========================================================
   START BOSS EVENT
========================================================= */

function startBossEvent() {
  if (bossActive) {
    return;
  }

  bossActive = true;

  bossHealth =
    bossMaxHealth;

  bossAttackTimer = 70;

  if (boss) {
    boss.visible = true;

    boss.position.set(
      0,
      0,
      -28
    );
  }

  if (
    typeof playBossSound ===
    "function"
  ) {
    playBossSound();
  }

  if (
    typeof triggerCameraShake ===
    "function"
  ) {
    triggerCameraShake(0.45);
  }

  setMission(
    "Boss Event: AI Guardian awakened",
    120
  );

  updateBossUI();
}


/* =========================================================
   END BOSS EVENT
========================================================= */

function endBossEvent() {
  bossActive = false;

  nextBossDistance +=
    BOSS_DISTANCE_GAP;

  shards += 15;

  if (boss) {
    boss.visible = false;
  }

  clearBossLasers();

  if (
    typeof playPowerUpSound ===
    "function"
  ) {
    playPowerUpSound();
  }

  if (
    typeof triggerCameraShake ===
    "function"
  ) {
    triggerCameraShake(0.22);
  }

  setMission(
    "Boss defeated +15 Surya Shards",
    140
  );

  updateBossUI();
}


/* =========================================================
   UPDATE BOSS
========================================================= */

function updateBoss() {
  if (
    !bossActive ||
    !boss
  ) {
    return;
  }

  boss.rotation.y =
    Math.sin(
      Date.now() * 0.001
    ) * 0.15;

  boss.position.y =
    Math.sin(
      Date.now() * 0.002
    ) * 0.25;

  bossAttackTimer--;

  if (bossAttackTimer <= 0) {
    bossLaserAttack();

    bossAttackTimer =
      Math.max(
        35,
        (
          95 -
          Math.floor(
            distance / 120
          )
        ) /
        difficultySettings
          .bossAttackMultiplier
      );
  }

  updateBossLasers();
}


/* =========================================================
   DAMAGE BOSS
========================================================= */

function damageBoss(amount) {
  if (!bossActive) {
    return;
  }

  bossHealth =
    Math.max(
      0,
      bossHealth - amount
    );

  updateBossUI();

  if (boss) {
    createExplosion(
      boss.position.x,
      5.4,
      boss.position.z + 0.8
    );
  }

  if (
    typeof triggerCameraShake ===
    "function"
  ) {
    triggerCameraShake(0.07);
  }

  if (bossHealth <= 0) {
    endBossEvent();
  }
}


/* =========================================================
   BOSS LASER ATTACK
========================================================= */

function bossLaserAttack() {
  if (
    !bossActive ||
    !empGroup
  ) {
    return;
  }

  const laneIndex =
    Math.floor(
      Math.random() * 3
    );

  const laneX =
    lanes[laneIndex];

  const laserMaterial =
    new THREE.MeshBasicMaterial({
      color: 0xff2aff,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending:
        THREE.AdditiveBlending
    });

  const laser = new THREE.Mesh(
    new THREE.BoxGeometry(
      2.3,
      0.16,
      20
    ),
    laserMaterial
  );

  laser.position.set(
    laneX,
    0.35,
    -12
  );

  laser.userData.life = 80;
  laser.userData.damageFrame = 42;
  laser.userData.laneIndex =
    laneIndex;

  laser.userData.hasDamaged =
    false;

  bossLasers.push(laser);
  empGroup.add(laser);

  if (
    typeof playGameTone ===
    "function"
  ) {
    playGameTone({
      frequency: 150,
      endFrequency: 55,
      duration: 0.42,
      volume: 0.08,
      type: "sawtooth"
    });
  }

  setMission(
    "Boss laser incoming",
    65
  );
}


/* =========================================================
   UPDATE BOSS LASERS
========================================================= */

function updateBossLasers() {
  for (
    let laserIndex =
      bossLasers.length - 1;

    laserIndex >= 0;

    laserIndex--
  ) {
    const laser =
      bossLasers[laserIndex];

    laser.userData.life--;

    if (
      laser.userData.life < 42
    ) {
      laser.material.opacity = 1;
      laser.scale.y = 2.2;
    } else {
      const warningPulse =
        0.35 +
        Math.abs(
          Math.sin(
            Date.now() * 0.015
          )
        ) * 0.35;

      laser.material.opacity =
        warningPulse;
    }

    if (
      !laser.userData.hasDamaged &&
      laser.userData.life <
        laser.userData.damageFrame &&
      currentLane ===
        laser.userData.laneIndex &&
      playerY <= 1.5
    ) {
      laser.userData.hasDamaged =
        true;

      var bossDamage =
  typeof getBossLaserDamage ===
    "function"
    ? getBossLaserDamage()
    : 20;

damagePlayer(bossDamage);
    }

    if (
      laser.userData.life <= 0
    ) {
      removeBossLaser(
        laser,
        laserIndex
      );
    }
  }
}


/* =========================================================
   REMOVE BOSS LASER
========================================================= */

function removeBossLaser(
  laser,
  laserIndex
) {
  if (!laser) {
    return;
  }

  if (empGroup) {
    empGroup.remove(laser);
  }

  if (laser.geometry) {
    laser.geometry.dispose();
  }

  if (laser.material) {
    laser.material.dispose();
  }

  if (
    laserIndex >= 0 &&
    laserIndex <
      bossLasers.length
  ) {
    bossLasers.splice(
      laserIndex,
      1
    );
  }
}


/* =========================================================
   CLEAR BOSS LASERS
========================================================= */

function clearBossLasers() {
  for (
    let laserIndex =
      bossLasers.length - 1;

    laserIndex >= 0;

    laserIndex--
  ) {
    removeBossLaser(
      bossLasers[laserIndex],
      laserIndex
    );
  }
}


/* =========================================================
   SPAWN OBSTACLE
========================================================= */

function spawnObstacle() {
  if (!obstacleGroup) {
    return;
  }

  var lane =
    typeof chooseBalancedObstacleLane ===
      "function"
      ? chooseBalancedObstacleLane()
      : Math.floor(
          Math.random() * 3
        );

  var obstacleType =
    typeof chooseBalancedObstacleType ===
      "function"
      ? chooseBalancedObstacleType()
      : "block";

  var obstacle;


  /* =====================================================
     SOLID BLOCK
  ===================================================== */

  if (obstacleType === "block") {
    obstacle =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          1.35,
          1.45,
          1
        ),
        new THREE.MeshStandardMaterial({
          color: 0x6d071d,
          emissive: 0xff0033,
          emissiveIntensity: 0.34,
          metalness: 0.4,
          roughness: 0.4
        })
      );

    obstacle.position.y = 0.8;
  }


  /* =====================================================
     LOW OBSTACLE — PLAYER MUST JUMP
  ===================================================== */

  else if (
    obstacleType === "low"
  ) {
    obstacle =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          1.6,
          0.55,
          1
        ),
        new THREE.MeshStandardMaterial({
          color: 0x715616,
          emissive: 0xffd166,
          emissiveIntensity: 0.32,
          metalness: 0.36,
          roughness: 0.42
        })
      );

    obstacle.position.y = 0.5;
  }


  /* =====================================================
     HIGH BARRIER — PLAYER MUST SLIDE
  ===================================================== */

  else {
    obstacle =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          2.25,
          0.3,
          1
        ),
        new THREE.MeshStandardMaterial({
          color: 0x45116f,
          emissive: 0xb14cff,
          emissiveIntensity: 0.36,
          metalness: 0.38,
          roughness: 0.4
        })
      );

    obstacle.position.y = 2.05;
  }


  obstacle.userData.type =
    obstacleType;

  obstacle.userData.laneIndex =
    lane;

  obstacle.position.x =
    lanes[lane];

  obstacle.position.z =
    -105;

  obstacle.castShadow = true;
  obstacle.receiveShadow = true;

  obstacles.push(obstacle);
  obstacleGroup.add(obstacle);
}
/* =========================================================
   UPDATE OBSTACLES
========================================================= */

function updateObstacles() {
  if (!player) {
    return;
  }

  for (
    let obstacleIndex =
      obstacles.length - 1;

    obstacleIndex >= 0;

    obstacleIndex--
  ) {
    const obstacle =
      obstacles[obstacleIndex];

    obstacle.position.z += speed;

    obstacle.rotation.y += 0.012;

    if (
      obstacle.position.z > 8
    ) {
      removeObstacle(
        obstacle,
        obstacleIndex
      );

      continue;
    }

    const differenceZ =
      Math.abs(
        obstacle.position.z -
        player.position.z
      );

    const differenceX =
      Math.abs(
        obstacle.position.x -
        player.position.x
      );

    if (
      differenceZ < 0.9 &&
      differenceX < 0.9
    ) {
      if (
        obstacle.userData.type ===
        "slide"
      ) {
        if (!isSliding) {
          endGame();
        }
      } else if (
        obstacle.userData.type ===
        "low"
      ) {
        if (!isJumping) {
          endGame();
        }
      } else {
        endGame();
      }
    }
  }
}


/* =========================================================
   REMOVE OBSTACLE
========================================================= */

function removeObstacle(
  obstacle,
  obstacleIndex
) {
  if (!obstacle) {
    return;
  }

  if (obstacleGroup) {
    obstacleGroup.remove(
      obstacle
    );
  }

  if (obstacle.geometry) {
    obstacle.geometry.dispose();
  }

  if (obstacle.material) {
    obstacle.material.dispose();
  }

  if (
    obstacleIndex >= 0 &&
    obstacleIndex <
      obstacles.length
  ) {
    obstacles.splice(
      obstacleIndex,
      1
    );
  }
}


/* =========================================================
   CLEAR ENEMY OBJECTS
========================================================= */

function clearEnemyObjects() {
  clearBossLasers();

  for (
    let obstacleIndex =
      obstacles.length - 1;

    obstacleIndex >= 0;

    obstacleIndex--
  ) {
    removeObstacle(
      obstacles[obstacleIndex],
      obstacleIndex
    );
  }
}
