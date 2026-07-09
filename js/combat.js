/* combat.js
   Shoot, bullets, EMP updates, explosions
*/

function shoot() {
  if (!gameRunning || gamePaused || gameOver) return;
  if (shootCooldown > 0) return;

  shootCooldown = SHOOT_COOLDOWN_MAX;
  updateShootButton();

  const bullet = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 18, 18),
    new THREE.MeshBasicMaterial({ color: 0xffd166 })
  );

  const bulletLight = new THREE.PointLight(0xffd166, 2.4, 8);
  bullet.add(bulletLight);

  bullet.position.set(
    player.position.x,
    player.position.y + 1.55,
    player.position.z + 0.35
  );

  bullet.userData.life = 70;

  bullets.push(bullet);
  bulletGroup.add(bullet);

  setMission("Shoot fired", 40);
}

function updateBullets() {
  const targetVector = new THREE.Vector3();
  const direction = new THREE.Vector3();

  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];

    bullet.userData.life--;
    bullet.rotation.y += 0.18;
    bullet.rotation.x += 0.12;

    if (bossActive && boss) {
      targetVector.set(boss.position.x, 5.2, boss.position.z + 0.8);
      direction.subVectors(targetVector, bullet.position).normalize();
      bullet.position.add(direction.multiplyScalar(0.78));

      if (bullet.position.distanceTo(targetVector) < 0.9) {
        bulletGroup.remove(bullet);
        bullets.splice(i, 1);
        damageBoss(12);
        continue;
      }
    } else if (droneAlive) {
      targetVector.set(drone.position.x, drone.position.y, drone.position.z);
      direction.subVectors(targetVector, bullet.position).normalize();
      bullet.position.add(direction.multiplyScalar(0.72));

      if (bullet.position.distanceTo(drone.position) < 0.55) {
        bulletGroup.remove(bullet);
        bullets.splice(i, 1);
        destroyDrone();
        continue;
      }
    } else {
      bullet.position.z -= 0.75;
    }

    if (bullet.userData.life <= 0) {
      bulletGroup.remove(bullet);
      bullets.splice(i, 1);
    }
  }
}

function updateEMPShots() {
  const playerHitPoint = new THREE.Vector3();

  for (let i = empShots.length - 1; i >= 0; i--) {
    const emp = empShots[i];

    emp.userData.life--;
    emp.rotation.y += 0.15;
    emp.rotation.x += 0.1;

    emp.position.add(emp.userData.direction.clone().multiplyScalar(0.2));

    playerHitPoint.set(
      player.position.x,
      player.position.y + 1.3,
      player.position.z
    );

    if (emp.position.distanceTo(playerHitPoint) < 0.65) {
      empGroup.remove(emp);
      empShots.splice(i, 1);
      damagePlayer(20);
      continue;
    }

    if (
      emp.userData.life <= 0 ||
      emp.position.y < -1 ||
      emp.position.y > 12 ||
      emp.position.z > 12 ||
      emp.position.z < -25
    ) {
      empGroup.remove(emp);
      empShots.splice(i, 1);
    }
  }
}

function createExplosion(x, y, z) {
  const colors = [0xff0033, 0xffd166, 0x00f5ff];

  for (let i = 0; i < 14; i++) {
    const piece = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 10, 10),
      new THREE.MeshBasicMaterial({ color: colors[i % colors.length] })
    );

    piece.position.set(x, y, z);

    piece.userData.life = 24;
    piece.userData.vx = (Math.random() - 0.5) * 0.28;
    piece.userData.vy = (Math.random() - 0.5) * 0.28;
    piece.userData.vz = (Math.random() - 0.5) * 0.28;

    explosions.push(piece);
    bulletGroup.add(piece);
  }
}

function updateExplosions() {
  for (let i = explosions.length - 1; i >= 0; i--) {
    const piece = explosions[i];

    piece.userData.life--;
    piece.position.x += piece.userData.vx;
    piece.position.y += piece.userData.vy;
    piece.position.z += piece.userData.vz;
    piece.scale.multiplyScalar(0.96);

    if (piece.userData.life <= 0) {
      bulletGroup.remove(piece);
      explosions.splice(i, 1);
    }
  }
}
