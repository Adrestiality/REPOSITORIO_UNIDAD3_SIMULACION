import * as THREE from 'three';
import { gameConfig } from '../data/gameConfig.js';
import { state } from '../state.js';
import { playFootstep } from '../audio/audio.js';

/**
 * Personaje del Jardinero
 * Controlado con Point & Click, patrullaje idle y respuesta al estrés
 * Módulo 2 - "Nadie lo verá completo"
 */
export function createGardener(scene) {
  const root = new THREE.Group();
  root.name = 'gardener';
  // Posición inicial cerca del jardín central
  root.position.set(0, 0, 1.8);
  scene.add(root);

  // Paleta de colores de la Jardinera
  const colors = {
    skin: 0xf5ded1,
    shirt: 0xf4ede2, // Blusa lino marfil pastel
    apron: 0x6e8067, // Delantal verde militar / oliva pastel
    apronStraps: 0x586b51,
    pants: 0x54473b, // Pantalón marrón de trabajo
    boots: 0x3d2d22, // Botas de cuero suaves
    strawHat: 0xdfc282, // Sombrero de paja
    hatRibbon: 0x8a5242, // Cinta terracota
    hair: 0x38281e, // Cabello castaño cálido
    gloves: 0x82937e, // Guantes de jardinería salvia pastel
    eyeColor: 0x1a1512
  };

  // Materiales
  const mat = {
    skin: new THREE.MeshStandardMaterial({ color: colors.skin, roughness: 0.8 }),
    shirt: new THREE.MeshStandardMaterial({ color: colors.shirt, roughness: 0.75 }),
    apron: new THREE.MeshStandardMaterial({ color: colors.apron, roughness: 0.85 }),
    apronStraps: new THREE.MeshStandardMaterial({ color: colors.apronStraps, roughness: 0.85 }),
    pants: new THREE.MeshStandardMaterial({ color: colors.pants, roughness: 0.8 }),
    boots: new THREE.MeshStandardMaterial({ color: colors.boots, roughness: 0.55 }),
    strawHat: new THREE.MeshStandardMaterial({ color: colors.strawHat, roughness: 0.9 }),
    hatRibbon: new THREE.MeshStandardMaterial({ color: colors.hatRibbon, roughness: 0.7 }),
    hair: new THREE.MeshStandardMaterial({ color: colors.hair, roughness: 0.85 }),
    gloves: new THREE.MeshStandardMaterial({ color: colors.gloves, roughness: 0.8 }),
    eyes: new THREE.MeshStandardMaterial({ color: colors.eyeColor, roughness: 0.2 }),
    eyeHighlight: new THREE.MeshBasicMaterial({ color: 0xffffff })
  };

  // --- Piernas articuladas chibi (más cortitas y redondeadas) ---
  const legRadius = 0.05;
  const legH = 0.44;
  const legGeo = new THREE.CylinderGeometry(legRadius, legRadius * 0.88, legH, 10);

  const leftLeg = new THREE.Mesh(legGeo, mat.pants);
  leftLeg.position.set(-0.10, legH / 2, 0);
  leftLeg.castShadow = true;
  root.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeo, mat.pants);
  rightLeg.position.set(0.10, legH / 2, 0);
  rightLeg.castShadow = true;
  root.add(rightLeg);

  // Botas redondeadas de jardinera
  const bootGeo = new THREE.BoxGeometry(0.11, 0.08, 0.16);
  const bootL = new THREE.Mesh(bootGeo, mat.boots);
  bootL.position.set(0, -legH / 2 + 0.04, 0.03);
  bootL.castShadow = true;
  leftLeg.add(bootL);

  const bootR = new THREE.Mesh(bootGeo, mat.boots);
  bootR.position.set(0, -legH / 2 + 0.04, 0.03);
  bootR.castShadow = true;
  rightLeg.add(bootR);

  // --- Torso y Delantal Chibi ---
  const bodyBaseY = 0.44;
  const torsoGroup = new THREE.Group();
  torsoGroup.position.set(0, bodyBaseY, 0);

  // Blusa marfil
  const shirtGeo = new THREE.BoxGeometry(0.28, 0.36, 0.20);
  const shirt = new THREE.Mesh(shirtGeo, mat.shirt);
  shirt.position.y = 0.18;
  shirt.castShadow = true;
  torsoGroup.add(shirt);

  // Pechera del delantal
  const apronGeo = new THREE.BoxGeometry(0.26, 0.34, 0.03);
  const apron = new THREE.Mesh(apronGeo, mat.apron);
  apron.position.set(0, 0.17, 0.10);
  apron.castShadow = true;
  torsoGroup.add(apron);

  // Falda acampanada del delantal (cubre cadera)
  const apronSkirtGeo = new THREE.CylinderGeometry(0.14, 0.17, 0.18, 14, 1, false, 0, Math.PI * 1.5);
  const apronSkirt = new THREE.Mesh(apronSkirtGeo, mat.apron);
  apronSkirt.position.set(0, 0.02, 0.02);
  apronSkirt.rotation.y = -Math.PI * 0.75;
  torsoGroup.add(apronSkirt);

  // Bolsillo delantero del delantal
  const pocketGeo = new THREE.BoxGeometry(0.14, 0.10, 0.02);
  const pocket = new THREE.Mesh(pocketGeo, mat.apronStraps);
  pocket.position.set(0, 0.12, 0.12);
  torsoGroup.add(pocket);

  // Cuello
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.06, 10), mat.skin);
  neck.position.y = 0.38;
  torsoGroup.add(neck);

  // --- Cabeza Chibi Grande (proporción tierno muñeco) ---
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.58, 0);

  const headGeo = new THREE.SphereGeometry(0.21, 16, 14);
  const head = new THREE.Mesh(headGeo, mat.skin);
  head.castShadow = true;
  headGroup.add(head);

  // Ojos tiernos chibi (expresivos con brillo)
  const eyeGeo = new THREE.SphereGeometry(0.024, 10, 8);
  const eyeL = new THREE.Mesh(eyeGeo, mat.eyes);
  eyeL.position.set(-0.075, 0.01, 0.19);
  headGroup.add(eyeL);

  const eyeR = new THREE.Mesh(eyeGeo, mat.eyes);
  eyeR.position.set(0.075, 0.01, 0.19);
  headGroup.add(eyeR);

  // Brillo en los ojos (pupila viva)
  const glintGeo = new THREE.SphereGeometry(0.007, 6, 6);
  const glintL = new THREE.Mesh(glintGeo, mat.eyeHighlight);
  glintL.position.set(-0.068, 0.02, 0.208);
  headGroup.add(glintL);

  const glintR = new THREE.Mesh(glintGeo, mat.eyeHighlight);
  glintR.position.set(0.082, 0.02, 0.208);
  headGroup.add(glintR);

  // Cejas suaves
  const browGeo = new THREE.BoxGeometry(0.036, 0.006, 0.01);
  const browL = new THREE.Mesh(browGeo, mat.hair);
  browL.position.set(-0.075, 0.055, 0.192);
  browL.rotation.z = 0.12;
  headGroup.add(browL);

  const browR = new THREE.Mesh(browGeo, mat.hair);
  browR.position.set(0.075, 0.055, 0.192);
  browR.rotation.z = -0.12;
  headGroup.add(browR);

  // Cabello femenino con peinado recogido / trenza
  const hairCapGeo = new THREE.SphereGeometry(0.22, 16, 12);
  const hairCap = new THREE.Mesh(hairCapGeo, mat.hair);
  hairCap.position.set(0, 0.02, -0.02);
  hairCap.scale.set(1.02, 1.04, 1.05);
  headGroup.add(hairCap);

  // Mechones laterales delicados
  const tuftGeo = new THREE.CylinderGeometry(0.02, 0.01, 0.12, 8);
  const tuftL = new THREE.Mesh(tuftGeo, mat.hair);
  tuftL.position.set(-0.19, -0.05, 0.06);
  tuftL.rotation.z = -0.2;
  headGroup.add(tuftL);

  const tuftR = new THREE.Mesh(tuftGeo, mat.hair);
  tuftR.position.set(0.19, -0.05, 0.06);
  tuftR.rotation.z = 0.2;
  headGroup.add(tuftR);

  // Moño / Trenza estilizada atrás
  const braidGroup = new THREE.Group();
  braidGroup.position.set(0, -0.08, -0.19);
  for (let i = 0; i < 3; i++) {
    const node = new THREE.Mesh(new THREE.SphereGeometry(0.055 - i * 0.01, 10, 8), mat.hair);
    node.position.y = -i * 0.065;
    braidGroup.add(node);
  }
  const hairTie = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.018, 10), mat.hatRibbon);
  hairTie.position.y = -0.16;
  braidGroup.add(hairTie);
  headGroup.add(braidGroup);

  // Sombrero de paja de Jardinera
  const hatGroup = new THREE.Group();
  hatGroup.position.set(0, 0.16, 0);

  // Ala ancha circular
  const brimGeo = new THREE.CylinderGeometry(0.32, 0.34, 0.02, 24);
  const brim = new THREE.Mesh(brimGeo, mat.strawHat);
  brim.castShadow = true;
  hatGroup.add(brim);

  // Copa del sombrero
  const crownGeo = new THREE.CylinderGeometry(0.15, 0.18, 0.11, 20);
  const crown = new THREE.Mesh(crownGeo, mat.strawHat);
  crown.position.y = 0.055;
  crown.castShadow = true;
  hatGroup.add(crown);

  // Cinta decorativa terracota
  const ribbonGeo = new THREE.CylinderGeometry(0.172, 0.182, 0.03, 20);
  const ribbon = new THREE.Mesh(ribbonGeo, mat.hatRibbon);
  ribbon.position.y = 0.02;
  hatGroup.add(ribbon);

  headGroup.add(hatGroup);
  torsoGroup.add(headGroup);

  // --- Brazos articulados chibi con guantes de jardinería ---
  const armGeo = new THREE.CylinderGeometry(0.04, 0.035, 0.28, 8);

  const armL = new THREE.Group();
  armL.position.set(-0.18, 0.30, 0);
  const armMeshL = new THREE.Mesh(armGeo, mat.shirt);
  armMeshL.position.y = -0.14;
  armMeshL.castShadow = true;
  armL.add(armMeshL);

  // Guante redondeado izquierdo
  const gloveL = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), mat.gloves);
  gloveL.position.y = -0.30;
  armL.add(gloveL);
  torsoGroup.add(armL);

  const armR = new THREE.Group();
  armR.position.set(0.18, 0.30, 0);
  const armMeshR = new THREE.Mesh(armGeo, mat.shirt);
  armMeshR.position.y = -0.14;
  armMeshR.castShadow = true;
  armR.add(armMeshR);

  // Guante redondeado derecho
  const gloveR = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), mat.gloves);
  gloveR.position.y = -0.30;
  armR.add(gloveR);
  torsoGroup.add(armR);

  root.add(torsoGroup);

  // --- Circuito de patrullaje en círculos (alrededor de mesas y jardín) ---
  const patrolWaypoints = [
    new THREE.Vector3(-2.8, 0, 2.0),
    new THREE.Vector3(2.8, 0, 2.0),
    new THREE.Vector3(2.8, 0, -2.0),
    new THREE.Vector3(-2.8, 0, -2.0)
  ];
  let patrolIndex = 0;

  // Variables de navegación y estado
  const currentTarget = root.position.clone();
  const waypoints = [];
  let isMoving = false;
  let isPatrolling = false;
  let walkCycle = 0;
  let prevStepPhase = 0;
  let idleTimer = 0;
  let timeSinceLastClick = 0;
  let pendingDelay = 0; // Retraso "pesado" durante estrés

  // Parámetros de movimiento
  const baseSpeed = 2.4;
  const stressedSpeed = 1.35;

  /**
   * Determina si una línea recta entre A y B cruza el área central del jardín
   */
  function lineIntersectsGarden(x1, z1, x2, z2) {
    // Zona del jardín central con margen
    const minGX = -1.9, maxGX = 1.9;
    const minGZ = -1.4, maxGZ = 1.6;

    // Si ambos puntos están del mismo lado, no cruza
    if ((x1 < minGX && x2 < minGX) || (x1 > maxGX && x2 > maxGX)) return false;
    if ((z1 < minGZ && z2 < minGZ) || (z1 > maxGZ && z2 > maxGZ)) return false;

    return true;
  }

  /**
   * Ordena al jardinero moverse a unas coordenadas (x, z)
   * @param {number} x
   * @param {number} z
   */
  function moveTo(x, z) {
    timeSinceLastClick = 0;
    isPatrolling = false;

    // Clampear coordenadas al piso de la cafetería
    const b = gameConfig.bounds;
    const targetX = THREE.MathUtils.clamp(x, b.minX, b.maxX);
    const targetZ = THREE.MathUtils.clamp(z, b.minZ, b.maxZ);

    // Si el estrés es crítico (temporizador rojo > 60s), simula retraso/pesadez
    if (state.estres > 1.0) {
      pendingDelay = 0.35; // 350ms de retraso "pesado" antes de reaccionar
    } else {
      pendingDelay = 0;
    }

    waypoints.length = 0;

    const curX = root.position.x;
    const curZ = root.position.z;

    // Si la trayectoria cruza el jardín, rodear por el frente o el fondo
    if (lineIntersectsGarden(curX, curZ, targetX, targetZ)) {
      // Elegir el pasillo más cercano (frente z = 2.2 o fondo z = -2.2)
      const corridorZ = (curZ + targetZ) / 2 > 0 ? 2.2 : -2.2;
      waypoints.push(new THREE.Vector3(curX, 0, corridorZ));
      waypoints.push(new THREE.Vector3(targetX, 0, corridorZ));
    }

    waypoints.push(new THREE.Vector3(targetX, 0, targetZ));
    isMoving = true;
  }

  /**
   * Actualización por frame
   * @param {number} delta
   */
  function update(delta) {
    idleTimer += delta;
    timeSinceLastClick += delta;

    // Manejar retraso de cansancio/estrés
    if (pendingDelay > 0) {
      pendingDelay -= delta;
      return;
    }

    // Patrullaje Idle si el jugador no hace nada por varios segundos
    if (!isMoving && timeSinceLastClick >= gameConfig.idlePatrolDelaySeconds) {
      isPatrolling = true;
      const nextPatrolPoint = patrolWaypoints[patrolIndex];
      waypoints.push(nextPatrolPoint.clone());
      isMoving = true;
      patrolIndex = (patrolIndex + 1) % patrolWaypoints.length;
    }

    // Movimiento hacia waypoints
    if (isMoving && waypoints.length > 0) {
      const target = waypoints[0];
      const dx = target.x - root.position.x;
      const dz = target.z - root.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      // Velocidad ajustada por pesadez si hay estrés
      const currentSpeed = state.estres > 1.0 ? stressedSpeed : baseSpeed;

      // Giro suave hacia la dirección
      const targetAngle = Math.atan2(dx, dz);
      const turnSpeed = state.estres > 1.0 ? 5.0 : 10.0;
      root.rotation.y = THREE.MathUtils.lerp(root.rotation.y, targetAngle, delta * turnSpeed);

      const step = Math.min(dist, currentSpeed * delta);
      root.position.x += Math.sin(targetAngle) * step;
      root.position.z += Math.cos(targetAngle) * step;

      // Animación de caminata y pasos suaves
      walkCycle += delta * (currentSpeed * 4.5);
      const swing = Math.sin(walkCycle);
      if ((prevStepPhase <= 0 && swing > 0) || (prevStepPhase >= 0 && swing < 0)) {
        playFootstep();
      }
      prevStepPhase = swing;

      leftLeg.rotation.x = swing * 0.55;
      rightLeg.rotation.x = -swing * 0.55;
      armL.rotation.x = -swing * 0.38;
      armR.rotation.x = swing * 0.38;
      torsoGroup.position.y = bodyBaseY + Math.abs(swing) * 0.04;

      if (dist < 0.2) {
        waypoints.shift();
        if (waypoints.length === 0) {
          isMoving = false;
          // Si estaba patrullando, el temporizador de click se mantiene para el siguiente punto
          if (!isPatrolling) {
            timeSinceLastClick = 0;
          }
        }
      }
    } else {
      // Reposo (Idle suave respirando)
      const breathe = Math.sin(idleTimer * 2.0) * 0.012;
      torsoGroup.position.y = bodyBaseY + breathe;
      leftLeg.rotation.x = 0;
      rightLeg.rotation.x = 0;
      armL.rotation.x = Math.sin(idleTimer * 1.5) * 0.04;
      armR.rotation.x = -Math.sin(idleTimer * 1.5) * 0.04;
    }
  }

  return {
    root,
    moveTo,
    update,
    getPosition: () => root.position.clone()
  };
}
