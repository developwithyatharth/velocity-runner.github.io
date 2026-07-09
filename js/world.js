/* world.js
   Road, city, rain, sky symbols
*/

function createRoad() {
  const roadBaseMat = new THREE.MeshBasicMaterial({ color: 0x123c79 });
  const laneFloorMat = new THREE.MeshBasicMaterial({ color: 0x071d45 });
  const cyanMat = new THREE.MeshBasicMaterial({ color: 0x00f5ff });
  const goldMat = new THREE.MeshBasicMaterial({ color: 0xffd166 });
  const purpleMat = new THREE.MeshBasicMaterial({ color: 0x8f2cff });

  for (let i = 0; i < ROAD_TILE_COUNT; i++) {
    const tile = new THREE.Group();
    tile.position.z = -i * TILE_DEPTH;

    const base = new THREE.Mesh(
      new THREE.BoxGeometry(11, 0.18, TILE_DEPTH),
      roadBaseMat
    );
    base.position.set(0, -0.08, 0);
    tile.add(base);

    const leftLaneFloor = new THREE.Mesh(
      new THREE.BoxGeometry(2.65, 0.05, TILE_DEPTH - 0.25),
      laneFloorMat
    );
    leftLaneFloor.position.set(-3, 0.02, 0);
    tile.add(leftLaneFloor);

    const middleLaneFloor = new THREE.Mesh(
      new THREE.BoxGeometry(2.65, 0.05, TILE_DEPTH - 0.25),
      laneFloorMat
    );
    middleLaneFloor.position.set(0, 0.025, 0);
    tile.add(middleLaneFloor);

    const rightLaneFloor = new THREE.Mesh(
      new THREE.BoxGeometry(2.65, 0.05, TILE_DEPTH - 0.25),
      laneFloorMat
    );
    rightLaneFloor.position.set(3, 0.02, 0);
    tile.add(rightLaneFloor);

    const leftDivider = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.09, TILE_DEPTH - 0.6),
      cyanMat
    );
    leftDivider.position.set(-1.5, 0.14, 0);
    tile.add(leftDivider);

    const rightDivider = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.09, TILE_DEPTH - 0.6),
      cyanMat
    );
    rightDivider.position.set(1.5, 0.14, 0);
    tile.add(rightDivider);

    const leftEdge = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.14, TILE_DEPTH - 0.4),
      purpleMat
    );
    leftEdge.position.set(-5.25, 0.18, 0);
    tile.add(leftEdge);

    const rightEdge = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.14, TILE_DEPTH - 0.4),
      purpleMat
    );
    rightEdge.position.set(5.25, 0.18, 0);
    tile.add(rightEdge);

    const centerDash = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.11, 2.2),
      goldMat
    );
    centerDash.position.set(0, 0.18, 0);
    tile.add(centerDash);

    if (i % 3 === 0) {
      const mandala = new THREE.Mesh(
        new THREE.TorusGeometry(0.55, 0.035, 12, 48),
        goldMat
      );
      mandala.position.set(0, 0.24, 0);
      mandala.rotation.x = Math.PI / 2;
      tile.add(mandala);
    }

    roadTiles.push(tile);
    roadGroup.add(tile);
  }
}

function createCity() {
  const buildingMats = [
    new THREE.MeshStandardMaterial({
      color: 0x10152d,
      metalness: 0.5,
      roughness: 0.3,
      emissive: 0x001144,
      emissiveIntensity: 0.95
    }),
    new THREE.MeshStandardMaterial({
      color: 0x160b2e,
      metalness: 0.5,
      roughness: 0.25,
      emissive: 0x230044,
      emissiveIntensity: 0.95
    }),
    new THREE.MeshStandardMaterial({
      color: 0x07142f,
      metalness: 0.45,
      roughness: 0.25,
      emissive: 0x001f3f,
      emissiveIntensity: 0.85
    })
  ];

  const cyanWindowMat = new THREE.MeshBasicMaterial({ color: 0x00eaff });
  const goldWindowMat = new THREE.MeshBasicMaterial({ color: 0xffd166 });

  for (let i = 0; i < 70; i++) {
    const building = new THREE.Group();

    const side = Math.random() > 0.5 ? 1 : -1;
    const height = 3 + Math.random() * 10;
    const width = 1.3 + Math.random() * 2.2;
    const depth = 1.3 + Math.random() * 2.2;

    building.position.set(
      side * (7 + Math.random() * 8),
      0,
      -10 - Math.random() * 220
    );

    const tower = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      buildingMats[i % buildingMats.length]
    );

    tower.position.y = height / 2;
    building.add(tower);

    for (let j = 0; j < 5; j++) {
      const windowLine = new THREE.Mesh(
        new THREE.BoxGeometry(width * 0.75, 0.06, 0.04),
        j % 2 === 0 ? cyanWindowMat : goldWindowMat
      );

      windowLine.position.set(0, 1 + j * 1.35, depth / 2 + 0.04);
      building.add(windowLine);
    }

    const topRing = new THREE.Mesh(
      new THREE.TorusGeometry(width * 0.36, 0.025, 10, 28),
      goldWindowMat
    );

    topRing.position.set(0, height + 0.25, 0);
    topRing.rotation.x = Math.PI / 2;
    building.add(topRing);

    buildings.push(building);
    cityGroup.add(building);
  }
}

function createRain() {
  const rainMat = new THREE.MeshBasicMaterial({
    color: 0x8feaff,
    transparent: true,
    opacity: 0.55
  });

  for (let i = 0; i < 180; i++) {
    const drop = new THREE.Mesh(
      new THREE.BoxGeometry(0.025, 0.55, 0.025),
      rainMat
    );

    drop.position.set(
      (Math.random() - 0.5) * 28,
      Math.random() * 14,
      -Math.random() * 130
    );

    rainDrops.push(drop);
    rainGroup.add(drop);
  }
}

function createSkySymbols() {
  const goldMat = new THREE.MeshBasicMaterial({ color: 0xffd166 });
  const cyanMat = new THREE.MeshBasicMaterial({ color: 0x00f5ff });

  for (let i = 0; i < 15; i++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.8, 0.035, 12, 48),
      i % 2 === 0 ? goldMat : cyanMat
    );

    ring.position.set(
      (Math.random() - 0.5) * 18,
      5 + Math.random() * 7,
      -20 - i * 16
    );

    ring.rotation.x = Math.PI / 2;
    cityGroup.add(ring);
  }
}

function updateMovingWorld() {
  for (let tile of roadTiles) {
    tile.position.z += speed;

    if (tile.position.z > 12) {
      tile.position.z -= ROAD_LOOP_DISTANCE;
    }
  }

  for (let building of buildings) {
    building.position.z += speed * 0.65;

    if (building.position.z > 30) {
      building.position.z -= 240;
    }
  }

  for (let drop of rainDrops) {
    drop.position.z += speed * 1.8;
    drop.position.y -= 0.35;

    if (drop.position.y < 0 || drop.position.z > 12) {
      drop.position.y = 8 + Math.random() * 8;
      drop.position.z = -100 - Math.random() * 60;
      drop.position.x = (Math.random() - 0.5) * 28;
    }
  }
}
