/* enemies.js
   Drone, EMP, boss, boss lasers, obstacles
*/

function createDrone() {
  drone = new THREE.Group();

  const droneMat = new THREE.MeshStandardMaterial({
    color: 0x090909,
    metalness: 0.8,
    roughness: 0.2,
    emissive: 0xff0033,
    emissiveIntensity: 0.9
  });

  const body = new THREE.Mesh(new THREE.OctahedronGeometry(0.35), droneMat);
  drone.add(body);

  const eye = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 24, 24),
    new THREE.MeshBasicMaterial({ color: 0xff0033 })
  );
  eye.position.set(0, 0, 0.32);
  drone.add(eye);

  const leftWing = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.06, 0.18),
    new THREE.MeshBasicMaterial({ color: 0xff0033 })
  );
  leftWing.position.set(-0.45, 0, 0);
  drone.add(leftWing);

  const rightWing = leftWing.clone();
  rightWing.position.x = 0.45;
  drone.add(rightWing);

  const droneLight = new THREE.PointLight(0xff0033, 2, 10);
  droneLight.position.set(0, 0, 0.4);
  drone.add(droneLight);

  drone.position.set(2.8, 3.3, 1.8);
  drone.scale.set(0.85, 0.85, 0.85);
  drone.visible = true;

  scene.add(drone);
}

function updateDrone() {
  if (droneAlive) {
    drone.position.x += (player.position.x + 2.6 - drone.position.x) * 0.035;
    drone.position.y = 3.3 + Math.sin(Date.now() * 0.006) * 0.18;
    drone.position.z = 1.8;
    drone.rotation.y += 0.04;

    droneShootTimer--;

    if (droneShootTimer <= 0) {
      droneShootEMP();
      droneShootTimer = Math.max(
        55,
        (150 - Math.floor(distance / 70)) / difficultySettings.droneAttackMultiplier
      );
    }
  } else {
    droneRespawnTimer--;

    if (droneRespawnTimer <= 0) {
      respawnDrone();
    }
  }
}

function droneShootEMP() {
  if (!droneAlive || !player || !empGroup) return;

  const emp = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xff2aff })
  );

  const empLight = new THREE.PointLight(0xff2aff, 2.6, 9);
  emp.add(empLight);

  emp.position.copy(drone.position);

  const target = new THREE.Vector3(
    player.position.x,
    player.position.y + 1.35,
    player.position.z
  );

  const direction = new THREE.Vector3().subVectors(target, emp.position).normalize();

  emp.userData.direction = direction;
  emp.userData.life = 110;

  empShots.push(emp);
  empGroup.add(emp);

  setMission("EMP fired by drone", 65);
}

function destroyDrone() {
  if (!droneAlive) return;

  droneAlive = false;
  drone.visible = false;
  droneRespawnTimer = 130;
  droneShootTimer = 130;
  dronesDestroyed++;

  shards += 5;

  setMission("Drone destroyed +5 Surya Shards", 100);

  if (abilityText) {
    abilityText.textContent = "Drone Down";
  }

  createExplosion(drone.position.x, drone.position.y, drone.position.z);

  setTimeout(() => {
    if (abilityText) {
      abilityText.textContent = "Surya Dash Ready";
    }
  }, 900);
}

function respawnDrone() {
  droneAlive = true;
  drone.visible = true;

  const side = Math.random() > 0.5 ? 1 : -1;
  drone.position.set(side * 2.8, 3.3, 1.8);

  droneShootTimer = Math.max(
    60,
    (145 - Math.floor(distance / 80)) / difficultySettings.droneAttackMultiplier
  );

  setMission("New drone incoming", 80);
}

function createBoss() {
  boss = new THREE.Group();

  const bossMat = new THREE.MeshStandardMaterial({
    color: 0x180018,
    metalness: 0.7,
    roughness: 0.2,
    emissive: 0xff2aff,
    emissiveIntensity: 0.9
  });

  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0033 });
  const coreMat = new THREE.MeshBasicMaterial({ color: 0xffd166 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(3.8, 3.8, 1), bossMat);
  body.position.y = 4.6;
  boss.add(body);

  const head = new THREE.Mesh(new THREE.OctahedronGeometry(1.2), bossMat);
  head.position.y = 7.1;
  boss.add(head);

  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.28, 24, 24), eyeMat);
  eye.position.set(0, 7.1, 0.65);
  boss.add(eye);

  const core = new THREE.Mesh(
    new THREE.TorusGeometry(1.2, 0.08, 12, 48),
    coreMat
  );
  core.position.set(0, 4.6, 0.7);
  boss.add(core);

  const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.55, 3.2, 0.55), bossMat);
  leftArm.position.set(-2.5, 4.7, 0);
  leftArm.rotation.z = 0.25;
  boss.add(leftArm);

  const rightArm = leftArm.clone();
  rightArm.position.x = 2.5;
  rightArm.rotation.z = -0.25;
  boss.add(rightArm);

  const bossLight = new THREE.PointLight(0xff2aff, 4, 40);
  bossLight.position.set(0, 5.5, 1);
  boss.add(bossLight);

  boss.position.set(0, 0, -28);
  boss.visible = false;

  scene.add(boss);
}

function startBossEvent() {
  if (bossActive) return;

  bossActive = true;
  bossHealth = bossMaxHealth;
  bossAttackTimer = 70;

  if (boss) {
    boss.visible = true;
    boss.position.set(0, 0, -28);
  }

  setMission("Boss Event: AI Guardian awakened", 120);
  updateBossUI();
}

function endBossEvent() {
  bossActive = false;
  nextBossDistance += BOSS_DISTANCE_GAP;
  shards += 15;

  if (boss) {
    boss.visible = false;
  }

  clearBossLasers();

  setMission("Boss defeated +15 Surya Shards", 140);
  updateBossUI();
}

function updateBoss() {
  if (!bossActive) return;

  if (boss) {
    boss.rotation.y = Math.sin(Date.now() * 0.001) * 0.15;
    boss.position.y = Math.sin(Date.now() * 0.002) * 0.25;
  }

  bossAttackTimer--;

  if (bossAttackTimer <= 0) {
    bossLaserAttack();
    bossAttackTimer = Math.max(
      35,
      (95 - Math.floor(distance / 120)) / difficultySettings.bossAttackMultiplier
    );
  }

  updateBossLasers();
}

function damageBoss(amount) {
  if (!bossActive) return;

  bossHealth = Math.max(0, bossHealth - amount);
  updateBossUI();

  if (boss) {
    createExplosion(boss.position.x, 5.4, boss.position.z + 0.8);
  }

  if (bossHealth <= 0) {
    endBossEvent();
  }
}

function bossLaserAttack() {
  if (!bossActive || !empGroup) return;

  const laneIndex = Math.floor(Math.random() * 3);
  const laneX = lanes[laneIndex];

  const warningMat = new THREE.MeshBasicMaterial({
    color: 0xff2aff,
    transparent: true,
    opacity: 0.75
  });

  const laser = new THREE.Mesh(
    new THREE.BoxGeometry(2.3, 0.16, 20),
    warningMat
  );

  laser.position.set(laneX, 0.35, -12);
  laser.userData.life = 80;
  laser.userData.damageFrame = 42;
  laser.userData.laneIndex = laneIndex;
  laser.userData.hasDamaged = false;

  bossLasers.push(laser);
  empGroup.add(laser);

  setMission("Boss laser incoming", 65);
}

function updateBossLasers() {
  for (let i = bossLasers.length - 1; i >= 0; i--) {
    const laser = bossLasers[i];

    laser.userData.life--;

    if (laser.userData.life < 42) {
      laser.material.opacity = 1;
      laser.scale.y = 2.2;
    }

    if (
      !laser.userData.hasDamaged &&
      laser.userData.life < laser.userData.damageFrame &&
      currentLane === laser.userData.laneIndex &&
      playerY <= 1.5
    ) {
      laser.userData.hasDamaged = true;
      damagePlayer(25);
    }

    if (laser.userData.life <= 0) {
      empGroup.remove(laser);
      bossLasers.splice(i, 1);
    }
  }
}

function clearBossLasers() {
  for (let i = bossLasers.length - 1; i >= 0; i--) {
    empGroup.remove(bossLasers[i]);
  }

  bossLasers = [];
}

function spawnObstacle() {
  const lane = Math.floor(Math.random() * 3);
  const type = Math.random();

  let obstacle;

  if (type < 0.45) {
    obstacle = new THREE.Mesh(
      new THREE.BoxGeometry(1.35, 1.45, 1),
      new THREE.MeshBasicMaterial({ color: 0xff0033 })
    );
    obstacle.userData.type = "block";
    obstacle.position.y = 0.8;
  } else if (type < 0.75) {
    obstacle = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.55, 1),
      new THREE.MeshBasicMaterial({ color: 0xffd166 })
    );
    obstacle.userData.type = "low";
    obstacle.position.y = 0.5;
  } else {
    obstacle = new THREE.Mesh(
      new THREE.BoxGeometry(2.25, 0.3, 1),
      new THREE.MeshBasicMaterial({ color: 0xb14cff })
    );
    obstacle.userData.type = "slide";
    obstacle.position.y = 2.05;
  }

  obstacle.position.x = lanes[lane];
  obstacle.position.z = -105;

  obstacles.push(obstacle);
  obstacleGroup.add(obstacle);
}

function updateObstacles() {
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];
    obs.position.z += speed;

    if (obs.position.z > 8) {
      obstacleGroup.remove(obs);
      obstacles.splice(i, 1);
      continue;
    }

    if (Math.abs(obs.position.z - player.position.z) < 0.9) {
      if (Math.abs(obs.position.x - player.position.x) < 0.9) {
        if (obs.userData.type === "slide") {
          if (!isSliding) endGame();
        } else if (obs.userData.type === "low") {
          if (!isJumping) endGame();
        } else {
          endGame();
        }
      }
    }
  }
}
