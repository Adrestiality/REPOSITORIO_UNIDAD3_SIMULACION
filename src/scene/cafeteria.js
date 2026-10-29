import * as THREE from 'three';
import { createWallClock } from './clock.js';
import { gameConfig } from '../data/gameConfig.js';
import { state } from '../state.js';

/**
 * Escena de la Cafetería 3D - "Nadie lo verá completo"
 * Vista abierta frontal (no isométrica, sin pared frontal).
 * Módulo 2: Reloj de pared, letrero interactivo que brilla de día y se voltea a "CERRADO".
 */
export function createCafeteria(scene) {
  // Paleta de materiales pastel
  const colors = {
    floor: 0xbfae9e,
    floorTrim: 0x9e8e7f,
    wallBack: 0xd0c4b7,
    wallSide: 0xc4b7aa,
    wallMolding: 0x8f8072,
    woodDark: 0x8a7b6c,
    woodLight: 0xd9cdbf,
    woodMedium: 0xad9e8f,
    door: 0xa19283,
    signBg: 0xf7efe6,
    signText: 0x4a3f35,
    signGlow: 0xfffae0,
    bushGreen: 0x6e7b64,
    bushGreenAlt: 0x7a876f,
    gardenSoil: 0x5a4f44,
    gardenBorder: 0x99897a,
    lampMetal: 0x6e6256,
    lampShade: 0xdfd4c7,
    lampGlow: 0xfff0d0,
    ceramicWhite: 0xf5efe8,
    ceramicPastel: 0x9fb3a8,
    glass: 0xdce8f2,
    flowerRed: 0xe05656,
    flowerYellow: 0xf2b93b,
    flowerPurple: 0x9b63c2,
    stemGreen: 0x56734c
  };

  // Materiales reutilizables
  const materials = {
    floor: new THREE.MeshStandardMaterial({ color: colors.floor, roughness: 0.85 }),
    floorTrim: new THREE.MeshStandardMaterial({ color: colors.floorTrim, roughness: 0.7 }),
    wallBack: new THREE.MeshStandardMaterial({ color: colors.wallBack, roughness: 0.9 }),
    wallSide: new THREE.MeshStandardMaterial({ color: colors.wallSide, roughness: 0.9 }),
    woodDark: new THREE.MeshStandardMaterial({ color: colors.woodDark, roughness: 0.7 }),
    woodLight: new THREE.MeshStandardMaterial({ color: colors.woodLight, roughness: 0.6 }),
    woodMedium: new THREE.MeshStandardMaterial({ color: colors.woodMedium, roughness: 0.65 }),
    door: new THREE.MeshStandardMaterial({ color: colors.door, roughness: 0.75 }),
    glass: new THREE.MeshStandardMaterial({
      color: colors.glass,
      roughness: 0.15,
      metalness: 0.1,
      transparent: true,
      opacity: 0.38
    }),
    bush: new THREE.MeshStandardMaterial({ color: colors.bushGreen, roughness: 0.9 }),
    bushAlt: new THREE.MeshStandardMaterial({ color: colors.bushGreenAlt, roughness: 0.9 }),
    soil: new THREE.MeshStandardMaterial({ color: colors.gardenSoil, roughness: 0.95 }),
    gardenBorder: new THREE.MeshStandardMaterial({ color: colors.gardenBorder, roughness: 0.8 }),
    lampShade: new THREE.MeshStandardMaterial({ color: colors.lampShade, roughness: 0.5 }),
    lampMetal: new THREE.MeshStandardMaterial({ color: colors.lampMetal, roughness: 0.4 }),
    lampBulb: new THREE.MeshBasicMaterial({ color: colors.lampGlow }),
    ceramic: new THREE.MeshStandardMaterial({ color: colors.ceramicWhite, roughness: 0.4 }),
    ceramicPastel: new THREE.MeshStandardMaterial({ color: colors.ceramicPastel, roughness: 0.4 })
  };

  const cafeteriaGroup = new THREE.Group();
  cafeteriaGroup.name = 'cafeteria';
  scene.add(cafeteriaGroup);

  // 1. ESTRUCTURA: Piso y tres paredes (abierto hacia el frente)
  const floorMesh = buildRoom(cafeteriaGroup, materials);

  // 2. LADO IZQUIERDO: Puerta con letrero interactivo giratorio
  const signData = buildLeftSection(cafeteriaGroup, materials, colors);

  // 3. LADO DERECHO: Ventanas translúcidas y mesas
  buildRightSection(cafeteriaGroup, materials);

  // 4. CENTRO: Jardín rectangular con 5 arbustos verde militar pastel y 3 flores vívidas
  const garden = buildCenterGarden(cafeteriaGroup, materials, colors);

  // 5. DETALLES Y LÁMPARAS COLGANTES
  const lamps = buildHangingLamps(cafeteriaGroup, materials);

  // 6. RELOJ DE PARED EN EL FONDO
  const clock = createWallClock(cafeteriaGroup);

  // 7. SISTEMA DE ILUMINACIÓN DÍA / NOCHE
  const lightingSystem = setupLighting(scene, lamps);

  let signGlowTimer = 0;

  /**
   * Actualización general de la cafetería
   * @param {number} delta
   * @param {'dia' | 'noche'} phase
   * @param {number} dayTime
   */
  function update(delta, phase = 'dia', dayTime = 0) {
    lightingSystem.update(delta);
    clock.update(delta, phase, dayTime);
    garden.update(delta);

    // Animación de brillo sutil en el letrero durante el día
    signGlowTimer += delta;
    if (phase === 'dia' && signData.isOpen) {
      const pulse = 0.35 + Math.sin(signGlowTimer * 3.5) * 0.15;
      signData.glowLight.intensity = pulse;
      signData.frontMat.emissive.setHex(0xfff6dc);
      signData.frontMat.emissiveIntensity = pulse * 0.7;
    } else {
      signData.glowLight.intensity = THREE.MathUtils.lerp(signData.glowLight.intensity, 0, delta * 5);
      signData.frontMat.emissiveIntensity = THREE.MathUtils.lerp(signData.frontMat.emissiveIntensity, 0, delta * 5);
    }

    // Animación suave de volteo del letrero
    if (signData.pivot) {
      signData.pivot.rotation.y = THREE.MathUtils.lerp(
        signData.pivot.rotation.y,
        signData.targetRotationY,
        delta * 6
      );
    }
  }

  return {
    group: cafeteriaGroup,
    setLighting: lightingSystem.setLighting,
    update,
    floorMesh,
    clock,
    sign: signData,
    garden,
    getHour: clock.getHour
  };
}

/**
 * Genera textura de lona/madera para el letrero sin imágenes externas
 */
function createSignTexture(text) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#f7efe6';
  ctx.fillRect(0, 0, 256, 128);

  ctx.strokeStyle = '#8a7b6c';
  ctx.lineWidth = 6;
  ctx.strokeRect(6, 6, 244, 116);

  ctx.fillStyle = '#4a3f35';
  ctx.font = 'bold 34px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 64);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * 1. Habitación: Piso y 3 paredes
 */
function buildRoom(parent, mat) {
  const room = new THREE.Group();
  room.name = 'room_structure';

  const width = 14;
  const height = 5.2;
  const depth = 9.5;
  const wallThickness = 0.25;

  // Piso marcado para detección de Raycaster
  const floorGeo = new THREE.BoxGeometry(width, wallThickness, depth);
  const floorMesh = new THREE.Mesh(floorGeo, mat.floor);
  floorMesh.name = 'floor';
  floorMesh.userData = { isFloor: true };
  floorMesh.position.set(0, -wallThickness / 2, 0);
  floorMesh.receiveShadow = true;
  room.add(floorMesh);

  // Pared del fondo (Z = -depth/2)
  const backGeo = new THREE.BoxGeometry(width, height, wallThickness);
  const backMesh = new THREE.Mesh(backGeo, mat.wallBack);
  backMesh.position.set(0, height / 2, -depth / 2 - wallThickness / 2);
  backMesh.receiveShadow = true;
  room.add(backMesh);

  // Zócalo de la pared del fondo
  const backBaseboard = new THREE.Mesh(
    new THREE.BoxGeometry(width, 0.22, 0.08),
    mat.floorTrim
  );
  backBaseboard.position.set(0, 0.11, -depth / 2 + 0.04);
  room.add(backBaseboard);

  // Moldura decorativa intermedia en pared del fondo
  const backDadoRail = new THREE.Mesh(
    new THREE.BoxGeometry(width, 0.08, 0.06),
    mat.floorTrim
  );
  backDadoRail.position.set(0, 2.1, -depth / 2 + 0.03);
  room.add(backDadoRail);

  // Pared izquierda (X = -width/2)
  const leftGeo = new THREE.BoxGeometry(wallThickness, height, depth);
  const leftMesh = new THREE.Mesh(leftGeo, mat.wallSide);
  leftMesh.position.set(-width / 2 - wallThickness / 2, height / 2, 0);
  leftMesh.receiveShadow = true;
  room.add(leftMesh);

  // Zócalo pared izquierda
  const leftBaseboard = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.22, depth),
    mat.floorTrim
  );
  leftBaseboard.position.set(-width / 2 + 0.04, 0.11, 0);
  room.add(leftBaseboard);

  // Pared derecha (X = +width/2)
  const rightGeo = new THREE.BoxGeometry(wallThickness, height, depth);
  const rightMesh = new THREE.Mesh(rightGeo, mat.wallSide);
  rightMesh.position.set(width / 2 + wallThickness / 2, height / 2, 0);
  rightMesh.receiveShadow = true;
  room.add(rightMesh);

  // Zócalo pared derecha
  const rightBaseboard = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.22, depth),
    mat.floorTrim
  );
  rightBaseboard.position.set(width / 2 - 0.04, 0.11, 0);
  room.add(rightBaseboard);

  // Viga superior del techo
  const topBeam = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.5, 0.3, 0.4),
    mat.floorTrim
  );
  topBeam.position.set(0, height + 0.15, depth / 2);
  room.add(topBeam);

  parent.add(room);
  return floorMesh;
}

/**
 * 2. Lado Izquierdo: Puerta, letrero interactivo "ABIERTO" / "CERRADO", mesas y sillas
 */
function buildLeftSection(parent, mat, colors) {
  const leftGroup = new THREE.Group();
  leftGroup.name = 'left_section';

  // --- Puerta en la pared izquierda ---
  const doorWidth = 1.4;
  const doorHeight = 3.0;
  const doorThickness = 0.08;

  const doorGroup = new THREE.Group();
  doorGroup.position.set(-6.8, doorHeight / 2, -2.4);

  // Marco de la puerta
  const frameMat = mat.woodDark;
  const frameOuter = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, doorHeight + 0.16, doorWidth + 0.2),
    frameMat
  );
  frameOuter.position.set(-0.06, 0.08, 0);
  doorGroup.add(frameOuter);

  // Hoja de la puerta
  const doorPanel = new THREE.Mesh(
    new THREE.BoxGeometry(doorThickness, doorHeight, doorWidth),
    mat.door
  );
  doorPanel.position.set(0, 0, 0);
  doorPanel.castShadow = true;
  doorGroup.add(doorPanel);

  // Manija / pomo
  const knob = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.035, 0.08, 12),
    mat.lampMetal
  );
  knob.rotation.z = Math.PI / 2;
  knob.position.set(0.08, 0, doorWidth * 0.35);
  doorGroup.add(knob);

  // --- Cartel colgado interactivo con pivote para voltearse ---
  const signPivot = new THREE.Group();
  signPivot.position.set(0.08, 0.25, 0);

  // Materiales para las dos caras
  const frontTexture = createSignTexture(gameConfig.signOpenText);
  const backTexture = createSignTexture(gameConfig.signClosedText);

  const frontMat = new THREE.MeshStandardMaterial({
    map: frontTexture,
    roughness: 0.6,
    emissive: new THREE.Color(0xfffae0),
    emissiveIntensity: 0.35
  });

  const backMat = new THREE.MeshStandardMaterial({
    map: backTexture,
    roughness: 0.6
  });

  const sideMat = new THREE.MeshStandardMaterial({
    color: 0xdfd2c4,
    roughness: 0.7
  });

  // Placa del letrero con materiales en cada cara:
  // indices: [0: +X, 1: -X, 2: +Y, 3: -Y, 4: +Z (abierto), 5: -Z (cerrado)]
  const signMaterials = [
    sideMat,
    sideMat,
    sideMat,
    sideMat,
    frontMat,
    backMat
  ];

  const signPlate = new THREE.Mesh(
    new THREE.BoxGeometry(0.02, 0.35, 0.65),
    signMaterials
  );
  signPlate.name = 'door_sign';
  signPlate.userData = { isSign: true };
  signPlate.castShadow = true;
  signPivot.add(signPlate);

  // Cordones de suspensión
  const cordMat = mat.lampMetal;
  const cordL = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.25), cordMat);
  cordL.rotation.x = 0.35;
  cordL.position.set(0, 0.25, -0.18);
  signPivot.add(cordL);

  const cordR = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.25), cordMat);
  cordR.rotation.x = -0.35;
  cordR.position.set(0, 0.25, 0.18);
  signPivot.add(cordR);

  // Luz puntual sutil que hace brillar al letrero por la mañana
  const glowLight = new THREE.PointLight(colors.signGlow, 0.45, 1.6);
  glowLight.position.set(0.15, 0, 0);
  signPivot.add(glowLight);

  doorGroup.add(signPivot);
  leftGroup.add(doorGroup);

  // --- Mesas y sillas del lado izquierdo ---
  createTableWithChairs(leftGroup, mat, -4.6, 0.6, true);
  createTableWithChairs(leftGroup, mat, -4.6, 2.6, false);

  parent.add(leftGroup);

  const signController = {
    pivot: signPivot,
    plate: signPlate,
    frontMat,
    backMat,
    glowLight,
    isOpen: true,
    targetRotationY: 0,

    /**
     * Voltea el letrero al estado deseado
     * @param {'abierto' | 'cerrado'} state
     */
    setState(state) {
      if (state === 'cerrado') {
        this.isOpen = false;
        this.targetRotationY = Math.PI; // Voltear a CERRADO
      } else {
        this.isOpen = true;
        this.targetRotationY = 0; // Voltear a ABIERTO
      }
    },

    /**
     * Alternar estado
     */
    toggle() {
      if (this.isOpen) {
        this.setState('cerrado');
      } else {
        this.setState('abierto');
      }
      return this.isOpen ? 'abierto' : 'cerrado';
    }
  };

  return signController;
}

/**
 * 3. Lado Derecho: Ventanas translúcidas y mesas pegadas a la pared
 */
function buildRightSection(parent, mat) {
  const rightGroup = new THREE.Group();
  rightGroup.name = 'right_section';

  // --- Grandes ventanales en pared derecha (X = +6.8) ---
  const windowCount = 2;
  const windowSpacing = 3.2;
  const startZ = -1.6;

  for (let i = 0; i < windowCount; i++) {
    const winZ = startZ + i * windowSpacing;
    const winGroup = new THREE.Group();
    winGroup.position.set(6.85, 2.4, winZ);

    const winW = 2.4;
    const winH = 2.2;
    const frameThick = 0.08;

    // Marco exterior de ventana
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(frameThick * 2, winH, winW),
      mat.woodDark
    );
    winGroup.add(frame);

    // Vidrio translúcido
    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, winH - 0.16, winW - 0.16),
      mat.glass
    );
    winGroup.add(glass);

    // Divisiones de madera de la ventana (retícula)
    const dividerH = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.05, winW - 0.16),
      mat.woodDark
    );
    winGroup.add(dividerH);

    const dividerV = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, winH - 0.16, 0.05),
      mat.woodDark
    );
    winGroup.add(dividerV);

    rightGroup.add(winGroup);
  }

  // --- Mesas pegadas a la pared derecha ---
  createRectTableWithChairs(rightGroup, mat, 4.8, -1.6);
  createRectTableWithChairs(rightGroup, mat, 4.8, 1.6);

  parent.add(rightGroup);
}

/**
 * 4. Centro: Jardín rectangular con 5 arbustos verde militar pastel y 3 flores vívidas
 */
function buildCenterGarden(parent, mat, colors) {
  const gardenGroup = new THREE.Group();
  gardenGroup.name = 'center_garden';
  gardenGroup.position.set(0, 0, 0.2);

  const gardenWidth = 3.4;
  const gardenDepth = 2.4;
  const borderHeight = 0.18;
  const borderThickness = 0.12;

  // Borde exterior delimitado en el piso (jardinera limpia)
  const borderGeo = new THREE.BoxGeometry(gardenWidth, borderHeight, gardenDepth);
  const borderMesh = new THREE.Mesh(borderGeo, mat.gardenBorder);
  borderMesh.position.set(0, borderHeight / 2, 0);
  borderMesh.castShadow = true;
  borderMesh.receiveShadow = true;
  gardenGroup.add(borderMesh);

  // Tierra / sustrato interior
  const soilGeo = new THREE.BoxGeometry(
    gardenWidth - borderThickness * 2,
    0.06,
    gardenDepth - borderThickness * 2
  );
  const soilMesh = new THREE.Mesh(soilGeo, mat.soil);
  soilMesh.position.set(0, borderHeight - 0.02, 0);
  soilMesh.receiveShadow = true;
  gardenGroup.add(soilMesh);

  // Grupo dinámico de plantas sincronizado con state.gardenGrid (Módulo 5)
  const plantsGroup = new THREE.Group();
  plantsGroup.name = 'garden_plants';
  gardenGroup.add(plantsGroup);

  const stemMat = new THREE.MeshStandardMaterial({
    color: colors.stemGreen,
    roughness: 0.7
  });

  const potBaseMat = new THREE.MeshStandardMaterial({
    color: 0xbf967e, // Terracota pastel
    roughness: 0.8
  });

  function disposeHierarchy(obj) {
    if (!obj) return;
    obj.traverse((child) => {
      if (child.geometry) {
        child.geometry.dispose();
      }
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m && m.dispose && m.dispose());
        } else if (child.material.dispose) {
          child.material.dispose();
        }
      }
    });
  }

  /**
   * Renderiza las plantas de la cuadrícula en la escena de la cafetería
   * Cada planta contiene exclusivamente sus voxels y sus flores elegidas.
   * @param {Array<object|null>} grid - Cuadrícula de 25 celdas
   */
  function renderGridPlants(grid) {
    while (plantsGroup.children.length > 0) {
      const child = plantsGroup.children[0];
      disposeHierarchy(child);
      plantsGroup.remove(child);
    }

    if (!grid || !Array.isArray(grid)) return;

    grid.forEach((plant, idx) => {
      if (!plant) return;
      const r = plant.row !== undefined ? plant.row : Math.floor(idx / 5);
      const c = plant.col !== undefined ? plant.col : idx % 5;
      const posX = (c - 2) * 0.62;
      const posZ = (r - 2) * 0.42;

      const plantContainer = new THREE.Group();
      plantContainer.position.set(posX, borderHeight, posZ);

      if (plant.type === 'pot') {
        const POT_SCALE = 0.20;
        const VOXEL_SIZE = 0.155;

        // Maceta de terracota cilíndrica con borde
        const potBase = new THREE.Mesh(
          new THREE.CylinderGeometry(0.18, 0.13, 0.14, 20),
          potBaseMat
        );
        potBase.position.y = 0.07;
        potBase.castShadow = true;
        plantContainer.add(potBase);

        const potRim = new THREE.Mesh(
          new THREE.CylinderGeometry(0.195, 0.195, 0.024, 20),
          potBaseMat
        );
        potRim.position.y = 0.14;
        potRim.castShadow = true;
        plantContainer.add(potRim);

        // Etiqueta sutil en la maceta si tiene texto
        if (plant.etiqueta) {
          const tag = new THREE.Mesh(
            new THREE.BoxGeometry(0.12, 0.05, 0.01),
            new THREE.MeshStandardMaterial({ color: 0xf5eedf, roughness: 0.5 })
          );
          tag.position.set(0, 0.07, 0.145);
          plantContainer.add(tag);
        }

        // Follaje: Si la maceta contiene sus voxels esculpidos, renderizarlos con escala idéntica
        if (plant.voxelGrid && Array.isArray(plant.voxelGrid)) {
          const activeIndices = [];
          for (let i = 0; i < plant.voxelGrid.length; i++) {
            if (plant.voxelGrid[i]) activeIndices.push(i);
          }

          if (activeIndices.length > 0) {
            const vGeo = new THREE.BoxGeometry(
              VOXEL_SIZE * 0.95 * POT_SCALE,
              VOXEL_SIZE * 0.95 * POT_SCALE,
              VOXEL_SIZE * 0.95 * POT_SCALE
            );
            const vMat = plant.alt ? mat.bushAlt : mat.bush;
            const instMesh = new THREE.InstancedMesh(vGeo, vMat, activeIndices.length);
            instMesh.castShadow = true;
            instMesh.receiveShadow = true;

            const dummy = new THREE.Object3D();
            for (let k = 0; k < activeIndices.length; k++) {
              const vIdx = activeIndices[k];
              const iz = Math.floor(vIdx / 144);
              const rem = vIdx % 144;
              const iy = Math.floor(rem / 12);
              const ix = rem % 12;

              const vx = (ix - 5.5) * VOXEL_SIZE * POT_SCALE;
              const vy = 0.152 + (iy * VOXEL_SIZE + VOXEL_SIZE / 2) * POT_SCALE;
              const vz = (iz - 5.5) * VOXEL_SIZE * POT_SCALE;

              dummy.position.set(vx, vy, vz);
              dummy.updateMatrix();
              instMesh.setMatrixAt(k, dummy.matrix);
            }
            instMesh.instanceMatrix.needsUpdate = true;
            plantContainer.add(instMesh);
          } else {
            const foliage = new THREE.Mesh(
              new THREE.SphereGeometry(0.18, 12, 10),
              plant.alt ? mat.bushAlt : mat.bush
            );
            foliage.position.y = 0.28;
            foliage.castShadow = true;
            plantContainer.add(foliage);
          }
        } else {
          const foliage = new THREE.Mesh(
            new THREE.SphereGeometry(0.20, 12, 10),
            plant.alt ? mat.bushAlt : mat.bush
          );
          foliage.position.y = 0.28;
          foliage.scale.set(1.0, 0.85, 0.95);
          foliage.castShadow = true;
          plantContainer.add(foliage);
        }

        // Flores elegidas por el jugador en la maceta (posicionadas exactamente donde fueron colocadas)
        if (plant.flores && plant.flores.length > 0) {
          plant.flores.forEach((f, fIdx) => {
            const fColor = f.color !== undefined ? f.color : (f.colorHex !== undefined ? f.colorHex : 0xffb703);

            if (f.ix !== undefined && f.iy !== undefined && f.iz !== undefined) {
              const fx = (f.ix - 5.5) * VOXEL_SIZE * POT_SCALE;
              const fy = 0.152 + (f.iy * VOXEL_SIZE + VOXEL_SIZE * 0.88) * POT_SCALE;
              const fz = (f.iz - 5.5) * VOXEL_SIZE * POT_SCALE;

              const fGroup = new THREE.Group();
              fGroup.position.set(fx, fy, fz);

              const blossom = new THREE.Mesh(
                new THREE.DodecahedronGeometry(0.024, 0),
                new THREE.MeshStandardMaterial({ color: fColor, roughness: 0.4 })
              );
              blossom.castShadow = true;
              fGroup.add(blossom);

              const center = new THREE.Mesh(
                new THREE.SphereGeometry(0.009, 8, 8),
                new THREE.MeshBasicMaterial({ color: 0xffffff })
              );
              center.position.y = 0.008;
              fGroup.add(center);

              plantContainer.add(fGroup);
            } else {
              const angle = fIdx * 1.5;
              const radius = 0.12;
              const fx = Math.cos(angle) * radius;
              const fz = Math.sin(angle) * radius;
              const fy = 0.30;

              const fGroup = new THREE.Group();
              fGroup.position.set(fx, fy, fz);

              const blossom = new THREE.Mesh(
                new THREE.DodecahedronGeometry(0.024, 0),
                new THREE.MeshStandardMaterial({ color: fColor, roughness: 0.4 })
              );
              blossom.castShadow = true;
              fGroup.add(blossom);

              const center = new THREE.Mesh(
                new THREE.SphereGeometry(0.009, 8, 8),
                new THREE.MeshBasicMaterial({ color: 0xffffff })
              );
              center.position.y = 0.008;
              fGroup.add(center);

              plantContainer.add(fGroup);
            }
          });
        }
      } else {
        // Arbusto inicial de la escena
        const bushMat = plant.alt ? mat.bushAlt : mat.bush;
        const scale = plant.scale || 0.42;

        const mainSphere = new THREE.Mesh(
          new THREE.SphereGeometry(scale, 14, 12),
          bushMat
        );
        mainSphere.position.set(0, scale * 0.85, 0);
        mainSphere.scale.set(1.0, 0.9, 0.95);
        mainSphere.castShadow = true;
        plantContainer.add(mainSphere);

        const subSphere = new THREE.Mesh(
          new THREE.SphereGeometry(scale * 0.65, 10, 8),
          bushMat
        );
        subSphere.position.set(
          scale * ((r + c) % 2 === 0 ? 0.35 : -0.35),
          scale * 0.7,
          scale * 0.25
        );
        subSphere.castShadow = true;
        plantContainer.add(subSphere);

        // Flores en el arbusto inicial
        if (plant.flores && plant.flores.length > 0) {
          plant.flores.forEach((f, fIdx) => {
            const flowerGroup = new THREE.Group();
            const fHeight = f.height || 0.42;
            const offsetX = (fIdx - (plant.flores.length - 1) / 2) * 0.12;
            flowerGroup.position.set(offsetX, 0, (fIdx % 2 === 0 ? 0.08 : -0.08));

            const stem = new THREE.Mesh(
              new THREE.CylinderGeometry(0.015, 0.015, fHeight),
              stemMat
            );
            stem.position.set(0, fHeight / 2, 0);
            stem.castShadow = true;
            flowerGroup.add(stem);

            const fColor = f.color !== undefined ? f.color : (f.colorHex !== undefined ? f.colorHex : colors.flowerRed);
            const flowerMat = new THREE.MeshStandardMaterial({
              color: fColor,
              roughness: 0.4,
              metalness: 0.05
            });
            const blossom = new THREE.Mesh(
              new THREE.DodecahedronGeometry(0.075, 0),
              flowerMat
            );
            blossom.position.set(0, fHeight, 0);
            blossom.castShadow = true;
            flowerGroup.add(blossom);

            const center = new THREE.Mesh(
              new THREE.SphereGeometry(0.03, 8, 8),
              new THREE.MeshBasicMaterial({ color: 0xffffff })
            );
            center.position.set(0, fHeight + 0.02, 0);
            flowerGroup.add(center);

            plantContainer.add(flowerGroup);
          });
        }
      }

      plantsGroup.add(plantContainer);
    });
  }

  // Carga inicial de las plantas desde state
  renderGridPlants(state.gardenGrid);

  // Luz suave del jardín (desactivada hasta el evento gardenUnlocked)
  const gardenGlowLight = new THREE.PointLight(0xb2e8cb, 0, 4.0, 1.8);
  gardenGlowLight.position.set(0, 0.7, 0);
  gardenGroup.add(gardenGlowLight);

  borderMesh.userData = { isGarden: true };

  parent.add(gardenGroup);

  let isUnlocked = false;
  let gardenTimer = 0;

  const gardenController = {
    group: gardenGroup,
    setUnlocked(val) {
      isUnlocked = val;
      if (!val) {
        gardenGlowLight.intensity = 0;
      }
    },
    syncWithGrid(grid) {
      renderGridPlants(grid || state.gardenGrid);
    },
    update(delta) {
      if (isUnlocked) {
        gardenTimer += delta;
        const pulse = 0.65 + Math.sin(gardenTimer * 2.4) * 0.18;
        gardenGlowLight.intensity = pulse;
        mat.bush.emissive.setHex(0x283b26);
        mat.bush.emissiveIntensity = pulse * 0.45;
        mat.bushAlt.emissive.setHex(0x283b26);
        mat.bushAlt.emissiveIntensity = pulse * 0.45;
      } else {
        gardenGlowLight.intensity = 0;
        mat.bush.emissiveIntensity = 0;
        mat.bushAlt.emissiveIntensity = 0;
      }
    },
    isUnlocked: () => isUnlocked
  };

  return gardenController;
}

/**
 * 5. Lámparas colgantes y detalles menores
 */
function buildHangingLamps(parent, mat) {
  const lampsGroup = new THREE.Group();
  lampsGroup.name = 'hanging_lamps';

  const lampPositions = [
    { x: -3.8, z: 0.5 },
    { x: 0.0, z: -2.0 },
    { x: 3.8, z: 0.5 }
  ];

  const pointLights = [];

  lampPositions.forEach((pos) => {
    const lamp = new THREE.Group();
    lamp.position.set(pos.x, 5.0, pos.z);

    // Cable colgante
    const cableLen = 1.9;
    const cable = new THREE.Mesh(
      new THREE.CylinderGeometry(0.01, 0.01, cableLen),
      mat.lampMetal
    );
    cable.position.set(0, -cableLen / 2, 0);
    lamp.add(cable);

    // Pantalla cónica pastel
    const shade = new THREE.Mesh(
      new THREE.ConeGeometry(0.42, 0.32, 16, 1, true),
      mat.lampShade
    );
    shade.position.set(0, -cableLen, 0);
    shade.rotation.x = Math.PI;
    shade.castShadow = true;
    lamp.add(shade);

    // Foco emisor
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 12, 10),
      mat.lampBulb
    );
    bulb.position.set(0, -cableLen + 0.04, 0);
    lamp.add(bulb);

    // Luz puntual
    const pLight = new THREE.PointLight(0xffecd0, 0.7, 5.0, 1.8);
    pLight.position.set(0, -cableLen - 0.1, 0);
    lamp.add(pLight);
    pointLights.push(pLight);

    lampsGroup.add(lamp);
  });

  parent.add(lampsGroup);
  return pointLights;
}

/**
 * Helper: Mesa redonda con sillas
 */
function createTableWithChairs(parent, mat, x, z, withVase) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  const tableH = 1.0;
  const tableRadius = 0.65;

  // Tablero redondo
  const top = new THREE.Mesh(
    new THREE.CylinderGeometry(tableRadius, tableRadius, 0.06, 24),
    mat.woodLight
  );
  top.position.set(0, tableH, 0);
  top.castShadow = true;
  top.receiveShadow = true;
  group.add(top);

  // Pata central
  const leg = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, tableH, 12),
    mat.woodDark
  );
  leg.position.set(0, tableH / 2, 0);
  leg.castShadow = true;
  group.add(leg);

  // Base
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.32, 0.04, 16),
    mat.woodDark
  );
  base.position.set(0, 0.02, 0);
  group.add(base);

  // Sillas
  createChair(group, mat, 0, -tableRadius - 0.32, 0);
  createChair(group, mat, 0, tableRadius + 0.32, Math.PI);

  // Taza / florero
  const cup = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.035, 0.07, 12),
    mat.ceramic
  );
  cup.position.set(0.18, tableH + 0.035, 0.1);
  cup.castShadow = true;
  group.add(cup);

  if (withVase) {
    const vase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.035, 0.16, 12),
      mat.ceramicPastel
    );
    vase.position.set(-0.1, tableH + 0.08, -0.08);
    vase.castShadow = true;
    group.add(vase);
  }

  parent.add(group);
}

/**
 * Helper: Mesa rectangular con sillas
 */
function createRectTableWithChairs(parent, mat, x, z) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  const tableW = 1.1;
  const tableD = 1.6;
  const tableH = 1.0;

  const top = new THREE.Mesh(
    new THREE.BoxGeometry(tableW, 0.06, tableD),
    mat.woodLight
  );
  top.position.set(0, tableH, 0);
  top.castShadow = true;
  top.receiveShadow = true;
  group.add(top);

  const legRadius = 0.035;
  const legGeo = new THREE.CylinderGeometry(legRadius, legRadius, tableH, 10);
  const px = tableW / 2 - 0.1;
  const pz = tableD / 2 - 0.12;

  [
    [-px, -pz],
    [px, -pz],
    [-px, pz],
    [px, pz]
  ].forEach(([lx, lz]) => {
    const legMesh = new THREE.Mesh(legGeo, mat.woodDark);
    legMesh.position.set(lx, tableH / 2, lz);
    legMesh.castShadow = true;
    group.add(legMesh);
  });

  createChair(group, mat, -tableW / 2 - 0.35, 0, Math.PI / 2);

  const mug = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.04, 0.08, 12),
    mat.ceramicPastel
  );
  mug.position.set(0.05, tableH + 0.04, 0.2);
  mug.castShadow = true;
  group.add(mug);

  parent.add(group);
}

/**
 * Helper: Silla pastel
 */
function createChair(parent, mat, x, z, rotY) {
  const chair = new THREE.Group();
  chair.position.set(x, 0, z);
  chair.rotation.y = rotY;

  const seatH = 0.55;
  const seatSize = 0.42;

  const seat = new THREE.Mesh(
    new THREE.BoxGeometry(seatSize, 0.04, seatSize),
    mat.woodMedium
  );
  seat.position.set(0, seatH, 0);
  seat.castShadow = true;
  chair.add(seat);

  const back = new THREE.Mesh(
    new THREE.BoxGeometry(seatSize, 0.4, 0.03),
    mat.woodMedium
  );
  back.position.set(0, seatH + 0.28, -seatSize / 2 + 0.02);
  back.castShadow = true;
  chair.add(back);

  const legGeo = new THREE.CylinderGeometry(0.02, 0.02, seatH, 8);
  const offset = seatSize / 2 - 0.04;
  [
    [-offset, -offset],
    [offset, -offset],
    [-offset, offset],
    [offset, offset]
  ].forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(legGeo, mat.woodDark);
    leg.position.set(lx, seatH / 2, lz);
    leg.castShadow = true;
    chair.add(leg);
  });

  parent.add(chair);
}

/**
 * 7. Iluminación con transición suave
 */
function setupLighting(scene, pointLights) {
  const ambientLight = new THREE.AmbientLight(0xfff6ea, 0.9);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xfff1dc, 1.35);
  sunLight.position.set(6.5, 8.5, 4.0);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = 25;
  sunLight.shadow.camera.left = -9;
  sunLight.shadow.camera.right = 9;
  sunLight.shadow.camera.top = 9;
  sunLight.shadow.camera.bottom = -4;
  sunLight.shadow.bias = -0.0005;
  scene.add(sunLight);

  const fillLight = new THREE.DirectionalLight(0xdeebf7, 0.45);
  fillLight.position.set(-6, 5, 5);
  scene.add(fillLight);

  const lightTargets = {
    dia: {
      ambientColor: new THREE.Color(0xfff6ea),
      ambientIntensity: 0.95,
      sunColor: new THREE.Color(0xfff1dc),
      sunIntensity: 1.35,
      fillColor: new THREE.Color(0xdeebf7),
      fillIntensity: 0.45,
      pointIntensity: 0.55,
      bgColor: new THREE.Color(0x2d2926)
    },
    noche: {
      ambientColor: new THREE.Color(0x4a5d7c), // Azul pizarra pastel frío pero claro
      ambientIntensity: 0.92, // Mucho más iluminado para ver el suelo y rincones
      sunColor: new THREE.Color(0x84a8d4), // Luz de luna suave
      sunIntensity: 1.1, // Buena definición direccional
      fillColor: new THREE.Color(0x4a4468), // Relleno violeta pastel que evita negros
      fillIntensity: 0.6,
      pointIntensity: 1.45, // Lámparas cálidas que contrastan
      bgColor: new THREE.Color(0x181e2b) // Cielo nocturno pastel profundo
    }
  };

  let currentPhase = 'dia';
  let targetPhase = 'dia';
  let transitionProgress = 1.0;
  const transitionDuration = 1.5;

  function setLighting(phase) {
    if (phase !== 'dia' && phase !== 'noche') return;
    if (phase === targetPhase) return;
    targetPhase = phase;
    transitionProgress = 0.0;
  }

  function update(delta) {
    if (transitionProgress < 1.0) {
      transitionProgress = Math.min(1.0, transitionProgress + delta / transitionDuration);

      const fromState = lightTargets[currentPhase];
      const toState = lightTargets[targetPhase];
      const t = transitionProgress;

      ambientLight.color.lerpColors(fromState.ambientColor, toState.ambientColor, t);
      ambientLight.intensity = THREE.MathUtils.lerp(fromState.ambientIntensity, toState.ambientIntensity, t);

      sunLight.color.lerpColors(fromState.sunColor, toState.sunColor, t);
      sunLight.intensity = THREE.MathUtils.lerp(fromState.sunIntensity, toState.sunIntensity, t);

      fillLight.color.lerpColors(fromState.fillColor, toState.fillColor, t);
      fillLight.intensity = THREE.MathUtils.lerp(fromState.fillIntensity, toState.fillIntensity, t);

      const pIntensity = THREE.MathUtils.lerp(fromState.pointIntensity, toState.pointIntensity, t);
      pointLights.forEach((pl) => {
        pl.intensity = pIntensity;
      });

      if (scene.background && scene.background.isColor) {
        scene.background.lerpColors(fromState.bgColor, toState.bgColor, t);
      }

      if (transitionProgress >= 1.0) {
        currentPhase = targetPhase;
      }
    }
  }

  return {
    setLighting,
    update
  };
}
