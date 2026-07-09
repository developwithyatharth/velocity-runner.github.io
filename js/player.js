/* player.js
   Player model, movement, dash, damage
*/

function createPlayer() {
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x0b3b7a,
    metalness: 0.45,
    roughness: 0.2,
    emissive: 0x003b85,
    emissiveIntensity: 0.8
  });

  const glowMat = new THREE.MeshBasicMaterial({ color: 0x00f5ff });
  const goldMat = new THREE.MeshBasicMaterial({ color: 0xffd166 });

  player = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 1.45, 0.45),
    bodyMat
  );
  body.position.y = 1.35;
  body.castShadow = true;
  player.add(body);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.34, 24, 24),
    bodyMat
  );
  head.position.y = 2.25;
  head.castShadow = true;
  player.add(head);

  const visor = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.08, 0.06),
    glowMat
  );
  visor.position.set(0, 2.28, 0.31);
  player.add(visor);

  const chestGlow = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.85, 0.06),
    glowMat
  );
  chestGlow.position.set(0, 1.42, 0.27);
  player.add(chestGlow);

  const leftArm = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.85, 0.18),
    bodyMat
  );
  leftArm.position.set(-0.52, 1.25, 0);
  player.add(leftArm);

  const rightArm = leftArm.clone();
  rightArm.position.x = 0.52;
  player.add(rightArm);

  const leftLeg = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.75, 0.22),
    bodyMat
  );
  leftLeg.position.set(-0.22, 0.42, 0);
  player.add(leftLeg);

  const rightLeg = leftLeg.clone();
  rightLeg.position.x = 0.22;
  player.add(rightLeg);

  suryaCore = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 32, 32),
    goldMat
  );
  suryaCore.position.set(0, 1.45, 0.38);
  player.add(suryaCore);

  const coreLight = new THREE.PointLight(0xffd166, 4, 16);
  coreLight.position.set(0, 1.45, 0.6);
  player.add(coreLight);

  const suitLight = new THREE.PointLight(0x00f5ff, 2.8, 12);
  suitLight.position.set(0, 1.4, 0.2);
  player.add(suitLight);

  player.position.set(lanes[currentLane], 0, 0);
  scene.add(player);
}

function moveLeft() {
  if (!gameRunning || gamePaused) return;
  currentLane = Math.max(0, currentLane - 1);
}

function moveRight() {
  if (!gameRunning || gamePaused) return;
  currentLane = Math.min(2, currentLane + 1);
}

function jump() {
  if (!gameRunning || gamePaused) return;

  if (!isJumping) {
    velocityY = 0.78;
    isJumping = true;
  }
}

function slide() {
  if (!gameRunning || gamePaused) return;

  isSliding = true;
  slideTimer = 34;

  if (player) {
    player.scale.y = 0.55;
  }
}

function dash() {
  if (!gameRunning || gamePaused) return;

  speed += 0.18;

  if (abilityText) {
    abilityText.textContent = "Surya Dash Activated";
  }

  setTimeout(() => {
    if (abilityText) {
      abilityText.textContent = "Surya Dash Ready";
    }
  }, 900);
}

function updatePlayer() {
  if (!player) return;

  player.position.x += (lanes[currentLane] - player.position.x) * 0.18;

  if (isJumping) {
    playerY += velocityY;
    velocityY += gravity;

    if (playerY <= 1) {
      playerY = 1;
      velocityY = 0;
      isJumping = false;
    }
  }

  player.position.y = playerY - 1;

  if (isSliding) {
    slideTimer--;

    if (slideTimer <= 0) {
      isSliding = false;
      player.scale.y = 1;
    }
  }

  if (suryaCore) {
    suryaCore.rotation.y += 0.08;
    suryaCore.rotation.x += 0.04;
  }

  if (invincibleTimer > 0) {
    invincibleTimer--;
    player.visible = Math.floor(invincibleTimer / 6) % 2 === 0;
  } else {
    player.visible = true;
  }
}

function damagePlayer(amount) {
  if (invincibleTimer > 0 || gameOver) return;

  if (shieldActive) {
    shieldActive = false;
    updateShieldStatus();
    invincibleTimer = 45;
    createExplosion(player.position.x, player.position.y + 1.2, player.position.z);
    setMission("Shield absorbed damage", 90);
    return;
  }

  coreHealth = Math.max(0, coreHealth - amount);
  invincibleTimer = 75;
  updateCoreHealth();

  createExplosion(player.position.x, player.position.y + 1.2, player.position.z);
  setMission("Core damaged", 85);

  if (coreHealth <= 0) {
    endGame();
  }
}
