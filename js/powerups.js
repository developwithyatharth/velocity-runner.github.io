/* =========================================================
   powerups.js
   Velocity Runner: Rise of Bharat

   Features:
   - Animated Surya Shards
   - Shield power-up
   - Core repair power-up
   - Collection sounds
   - Mobile vibration through audio.js
   - Pickup camera feedback
   - Safe object removal and memory cleanup
========================================================= */


/* =========================================================
   SPAWN SURYA SHARD
========================================================= */

function spawnShard() {
  if (!shardGroup) {
    return;
  }

  const lane =
    Math.floor(Math.random() * 3);

  const shard = new THREE.Group();


  /* Main golden shard */

  const shardCoreMaterial =
    new THREE.MeshBasicMaterial({
      color: 0xffd166,
      transparent: true,
      opacity: 0.96
    });

  const shardCore =
    new THREE.Mesh(
      new THREE.OctahedronGeometry(
        0.28,
        0
      ),
      shardCoreMaterial
    );

  shard.add(shardCore);


  /* Cyan wireframe energy shell */

  const shardShell =
    new THREE.Mesh(
      new THREE.OctahedronGeometry(
        0.4,
        0
      ),
      new THREE.MeshBasicMaterial({
        color: 0x00eaff,
        wireframe: true,
        transparent: true,
        opacity: 0.48
      })
    );

  shard.add(shardShell);


  /* Floating horizontal energy ring */

  const shardRing =
    new THREE.Mesh(
      new THREE.TorusGeometry(
        0.42,
        0.025,
        10,
        32
      ),
      new THREE.MeshBasicMaterial({
        color: 0xffd166,
        transparent: true,
        opacity: 0.6,
        depthWrite: false,
        blending:
          THREE.AdditiveBlending
      })
    );

  shardRing.rotation.x =
    Math.PI / 2;

  shard.add(shardRing);


  /* Small energy light */

  const shardLight =
    new THREE.PointLight(
      0xffd166,
      1.15,
      4.5
    );

  shard.add(shardLight);


  const baseY =
    1.15 +
    Math.random() * 0.75;

  shard.position.set(
    lanes[lane],
    baseY,
    -105
  );


  shard.userData.baseY =
    baseY;

  shard.userData.floatOffset =
    Math.random() *
    Math.PI *
    2;

  shard.userData.core =
    shardCore;

  shard.userData.shell =
    shardShell;

  shard.userData.ring =
    shardRing;

  shard.userData.light =
    shardLight;


  shardItems.push(shard);
  shardGroup.add(shard);
}


/* =========================================================
   UPDATE SURYA SHARDS
========================================================= */

function updateShards() {
  const currentTime =
    Date.now() * 0.001;


  for (
    let shardIndex =
      shardItems.length - 1;

    shardIndex >= 0;

    shardIndex--
  ) {
    const shard =
      shardItems[shardIndex];


    /* Move towards the player */

    shard.position.z += speed;


    /* Floating movement */

    shard.position.y =
      shard.userData.baseY +
      Math.sin(
        currentTime * 2.5 +
        shard.userData.floatOffset
      ) * 0.12;


    /* Shard rotation */

    shard.rotation.y += 0.065;
    shard.rotation.x += 0.025;


    if (shard.userData.core) {
      shard.userData.core.rotation.y +=
        0.06;

      shard.userData.core.rotation.z +=
        0.025;
    }


    if (shard.userData.shell) {
      shard.userData.shell.rotation.x -=
        0.025;

      shard.userData.shell.rotation.y +=
        0.035;
    }


    if (shard.userData.ring) {
      shard.userData.ring.rotation.z +=
        0.045;
    }


    /* Gentle scale pulse */

    const pulse =
      1 +
      Math.sin(
        currentTime * 5 +
        shard.userData.floatOffset
      ) * 0.07;


    shard.scale.set(
      pulse,
      pulse,
      pulse
    );


    if (shard.userData.light) {
      shard.userData.light.intensity =
        1.05 +
        Math.sin(
          currentTime * 5 +
          shard.userData.floatOffset
        ) * 0.18;
    }


    /* Remove missed shard */

    if (shard.position.z > 8) {
      removeShard(
        shard,
        shardIndex
      );

      continue;
    }


    /* Player collision */

    const differenceX =
      Math.abs(
        shard.position.x -
        player.position.x
      );

    const differenceY =
      Math.abs(
        shard.position.y -
        (
          player.position.y +
          1.3
        )
      );

    const differenceZ =
      Math.abs(
        shard.position.z -
        player.position.z
      );


    if (
      differenceX < 0.9 &&
      differenceY < 1.2 &&
      differenceZ < 1
    ) {
      collectShard(
        shard,
        shardIndex
      );
    }
  }
}


/* =========================================================
   COLLECT SURYA SHARD
========================================================= */

function collectShard(
  shard,
  shardIndex
) {
  shards++;


  /* Immediately refresh HUD */

  if (shardsText) {
    shardsText.textContent =
      shards;
  }


  /* Collection sound */

  if (
    typeof playCollectSound ===
    "function"
  ) {
    playCollectSound();
  }


  /* Very small camera feedback */

  if (
    typeof triggerCameraShake ===
    "function"
  ) {
    triggerCameraShake(0.018);
  }


  removeShard(
    shard,
    shardIndex
  );
}


/* =========================================================
   REMOVE SURYA SHARD
========================================================= */

function removeShard(
  shard,
  shardIndex
) {
  if (!shard) {
    return;
  }


  if (shardGroup) {
    shardGroup.remove(shard);
  }


  disposePickupObject(shard);


  if (
    shardIndex >= 0 &&
    shardIndex <
      shardItems.length
  ) {
    shardItems.splice(
      shardIndex,
      1
    );
  }
}


/* =========================================================
   SPAWN POWER-UP
========================================================= */

function spawnPowerUp() {
  if (!shardGroup) {
    return;
  }


  const lane =
    Math.floor(Math.random() * 3);


  const type =
    Math.random() > 0.5
      ? "shield"
      : "repair";


  const mainColor =
    type === "shield"
      ? 0x00f5ff
      : 0x30ff7a;


  const secondaryColor =
    type === "shield"
      ? 0x596cff
      : 0xffd166;


  const powerUp =
    new THREE.Group();


  /* Main energy core */

  const body =
    new THREE.Mesh(
      new THREE.IcosahedronGeometry(
        0.34,
        1
      ),
      new THREE.MeshBasicMaterial({
        color: mainColor,
        transparent: true,
        opacity: 0.9
      })
    );

  powerUp.add(body);


  /* Outer wireframe shell */

  const shell =
    new THREE.Mesh(
      new THREE.IcosahedronGeometry(
        0.52,
        1
      ),
      new THREE.MeshBasicMaterial({
        color: secondaryColor,
        wireframe: true,
        transparent: true,
        opacity: 0.5
      })
    );

  powerUp.add(shell);


  /* First rotating ring */

  const ringOne =
    new THREE.Mesh(
      new THREE.TorusGeometry(
        0.55,
        0.032,
        12,
        40
      ),
      new THREE.MeshBasicMaterial({
        color: mainColor,
        transparent: true,
        opacity: 0.72,
        depthWrite: false,
        blending:
          THREE.AdditiveBlending
      })
    );

  ringOne.rotation.x =
    Math.PI / 2;

  powerUp.add(ringOne);


  /* Second rotating ring */

  const ringTwo =
    new THREE.Mesh(
      new THREE.TorusGeometry(
        0.45,
        0.022,
        10,
        36
      ),
      new THREE.MeshBasicMaterial({
        color: secondaryColor,
        transparent: true,
        opacity: 0.62,
        depthWrite: false,
        blending:
          THREE.AdditiveBlending
      })
    );

  ringTwo.rotation.y =
    Math.PI / 2;

  powerUp.add(ringTwo);


  /* Shield or repair symbol */

  const symbol =
    createPowerUpSymbol(
      type,
      secondaryColor
    );

  symbol.position.z = -0.38;

  powerUp.add(symbol);


  /* Energy light */

  const light =
    new THREE.PointLight(
      mainColor,
      1.8,
      8
    );

  powerUp.add(light);


  powerUp.position.set(
    lanes[lane],
    1.35,
    -105
  );


  powerUp.userData.type =
    type;

  powerUp.userData.baseY =
    1.35;

  powerUp.userData.floatOffset =
    Math.random() *
    Math.PI *
    2;

  powerUp.userData.body =
    body;

  powerUp.userData.shell =
    shell;

  powerUp.userData.ringOne =
    ringOne;

  powerUp.userData.ringTwo =
    ringTwo;

  powerUp.userData.symbol =
    symbol;

  powerUp.userData.light =
    light;


  powerUps.push(powerUp);
  shardGroup.add(powerUp);
}


/* =========================================================
   CREATE POWER-UP SYMBOL
========================================================= */

function createPowerUpSymbol(
  type,
  color
) {
  const symbol =
    new THREE.Group();


  const symbolMaterial =
    new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.9
    });


  if (type === "shield") {
    /*
      Diamond-shaped shield symbol.
    */

    const shieldShape =
      new THREE.Mesh(
        new THREE.OctahedronGeometry(
          0.2,
          0
        ),
        symbolMaterial
      );

    shieldShape.scale.set(
      0.85,
      1.25,
      0.18
    );

    symbol.add(shieldShape);
  } else {
    /*
      Medical repair plus symbol.
    */

    const verticalBar =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.1,
          0.46,
          0.06
        ),
        symbolMaterial
      );

    symbol.add(verticalBar);


    const horizontalBar =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.46,
          0.1,
          0.06
        ),
        symbolMaterial
      );

    symbol.add(horizontalBar);
  }


  return symbol;
}


/* =========================================================
   UPDATE POWER-UPS
========================================================= */

function updatePowerUps() {
  const currentTime =
    Date.now() * 0.001;


  for (
    let powerUpIndex =
      powerUps.length - 1;

    powerUpIndex >= 0;

    powerUpIndex--
  ) {
    const item =
      powerUps[powerUpIndex];


    item.position.z += speed;


    item.position.y =
      item.userData.baseY +
      Math.sin(
        currentTime * 2 +
        item.userData.floatOffset
      ) * 0.16;


    item.rotation.y += 0.035;


    if (item.userData.body) {
      item.userData.body.rotation.x +=
        0.025;

      item.userData.body.rotation.y +=
        0.045;
    }


    if (item.userData.shell) {
      item.userData.shell.rotation.x -=
        0.018;

      item.userData.shell.rotation.z +=
        0.024;
    }


    if (item.userData.ringOne) {
      item.userData.ringOne.rotation.z +=
        0.045;
    }


    if (item.userData.ringTwo) {
      item.userData.ringTwo.rotation.x +=
        0.035;
    }


    if (item.userData.symbol) {
      item.userData.symbol.rotation.z =
        Math.sin(
          currentTime * 1.7 +
          item.userData.floatOffset
        ) * 0.12;
    }


    const pulse =
      1 +
      Math.sin(
        currentTime * 4 +
        item.userData.floatOffset
      ) * 0.06;


    item.scale.set(
      pulse,
      pulse,
      pulse
    );


    if (item.userData.light) {
      item.userData.light.intensity =
        1.6 +
        Math.sin(
          currentTime * 4 +
          item.userData.floatOffset
        ) * 0.3;
    }


    /* Remove missed power-up */

    if (item.position.z > 8) {
      removePowerUp(
        item,
        powerUpIndex
      );

      continue;
    }


    const differenceX =
      Math.abs(
        item.position.x -
        player.position.x
      );

    const differenceY =
      Math.abs(
        item.position.y -
        (
          player.position.y +
          1.3
        )
      );

    const differenceZ =
      Math.abs(
        item.position.z -
        player.position.z
      );


    if (
      differenceX < 0.9 &&
      differenceY < 1.2 &&
      differenceZ < 1
    ) {
      collectPowerUp(
        item,
        powerUpIndex
      );
    }
  }
}


/* =========================================================
   COLLECT POWER-UP
========================================================= */

function collectPowerUp(
  item,
  powerUpIndex
) {
  if (!item) {
    return;
  }


  if (
    item.userData.type ===
    "shield"
  ) {
    shieldActive = true;

    updateShieldStatus();

    setMission(
      "Surya Shield activated",
      100
    );
  }


  if (
    item.userData.type ===
    "repair"
  ) {
    const previousHealth =
      coreHealth;


    coreHealth =
      Math.min(
        100,
        coreHealth + 25
      );


    const repairedAmount =
      coreHealth -
      previousHealth;


    updateCoreHealth();


    if (repairedAmount > 0) {
      setMission(
        "Surya Core repaired +" +
        repairedAmount,
        100
      );
    } else {
      setMission(
        "Surya Core already stable",
        90
      );
    }
  }


  /* Play power-up sound */

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
    triggerCameraShake(0.055);
  }


  removePowerUp(
    item,
    powerUpIndex
  );
}


/* =========================================================
   REMOVE POWER-UP
========================================================= */

function removePowerUp(
  item,
  powerUpIndex
) {
  if (!item) {
    return;
  }


  if (shardGroup) {
    shardGroup.remove(item);
  }


  disposePickupObject(item);


  if (
    powerUpIndex >= 0 &&
    powerUpIndex <
      powerUps.length
  ) {
    powerUps.splice(
      powerUpIndex,
      1
    );
  }
}


/* =========================================================
   DISPOSE PICKUP OBJECT
========================================================= */

function disposePickupObject(object) {
  if (!object) {
    return;
  }


  object.traverse(
    function (child) {
      if (child.geometry) {
        child.geometry.dispose();
      }


      if (child.material) {
        if (
          Array.isArray(
            child.material
          )
        ) {
          child.material.forEach(
            function (material) {
              disposePickupMaterial(
                material
              );
            }
          );
        } else {
          disposePickupMaterial(
            child.material
          );
        }
      }
    }
  );
}


function disposePickupMaterial(
  material
) {
  if (!material) {
    return;
  }


  if (material.map) {
    material.map.dispose();
  }


  material.dispose();
}


/* =========================================================
   CLEAR ALL PICKUPS
========================================================= */

function clearPickupObjects() {
  for (
    let shardIndex =
      shardItems.length - 1;

    shardIndex >= 0;

    shardIndex--
  ) {
    removeShard(
      shardItems[shardIndex],
      shardIndex
    );
  }


  for (
    let powerUpIndex =
      powerUps.length - 1;

    powerUpIndex >= 0;

    powerUpIndex--
  ) {
    removePowerUp(
      powerUps[powerUpIndex],
      powerUpIndex
    );
  }
}
