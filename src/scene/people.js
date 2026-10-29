import * as THREE from 'three';
import { peopleData, getPeopleDataForCycle } from '../data/peopleData.js';
import { gameConfig } from '../data/gameConfig.js';
import { state } from '../state.js';
import {
  onVisitorPauseStart,
  onVisitorPauseEnd,
  startApplause,
  stopApplause
} from '../audio/audio.js';

/**
 * Generador y gestor de personajes estilo años 60
 * Módulos 2 y 6 - "Nadie lo verá completo"
 */
export function createPeopleManager(scene) {
  let people = [];
  let temporaryOwners = [];
  let currentOpinionVisitor = null;
  let allOpinionVisitors = [];

  const peopleGroup = new THREE.Group();
  peopleGroup.name = 'people_group';
  scene.add(peopleGroup);

  /**
   * Genera un personaje procedural tierno estilo muñeco Chibi años 60
   * @param {object} data
   * @returns {object} Person instance
   */
  function createPerson(data) {
    const root = new THREE.Group();
    root.name = data.id;
    root.position.set(data.position.x, data.position.y, data.position.z);
    root.rotation.y = data.rotationY;

    // Altura del asiento en proporción Chibi
    const seatY = 0.50;
    const bodyBaseY = data.isSitting ? seatY : 0.44;

    // --- Piernas Chibi ---
    const legsGroup = new THREE.Group();
    legsGroup.position.set(0, 0, 0);
    const legRadius = 0.048;
    const legMat = new THREE.MeshStandardMaterial({
      color: data.style === 'dress' ? data.palette.skin : data.palette.pants || 0x3d3835,
      roughness: 0.8
    });
    const shoeMat = new THREE.MeshStandardMaterial({
      color: data.palette.shoes || 0x221f1d,
      roughness: 0.5
    });

    let leftLeg, rightLeg;

    if (data.isSitting) {
      // Muslo horizontal redondeado
      const thighGeo = new THREE.BoxGeometry(0.09, 0.08, 0.24);
      const thighL = new THREE.Mesh(thighGeo, legMat);
      thighL.position.set(-0.09, seatY + 0.04, 0.10);
      legsGroup.add(thighL);

      const thighR = new THREE.Mesh(thighGeo, legMat);
      thighR.position.set(0.09, seatY + 0.04, 0.10);
      legsGroup.add(thighR);

      // Pantorrilla vertical hacia abajo
      const shinGeo = new THREE.BoxGeometry(0.08, seatY, 0.08);
      const shinL = new THREE.Mesh(shinGeo, legMat);
      shinL.position.set(-0.09, seatY / 2, 0.20);
      legsGroup.add(shinL);

      const shinR = new THREE.Mesh(shinGeo, legMat);
      shinR.position.set(0.09, seatY / 2, 0.20);
      legsGroup.add(shinR);

      // Zapatos sesenteros redondeados
      const shoeGeo = new THREE.BoxGeometry(0.09, 0.055, 0.13);
      const shoeL = new THREE.Mesh(shoeGeo, shoeMat);
      shoeL.position.set(-0.09, 0.028, 0.23);
      legsGroup.add(shoeL);

      const shoeR = new THREE.Mesh(shoeGeo, shoeMat);
      shoeR.position.set(0.09, 0.028, 0.23);
      legsGroup.add(shoeR);
    } else {
      // De pie: piernas cortitas articulables
      const legGeo = new THREE.CylinderGeometry(legRadius, legRadius * 0.9, 0.44, 10);
      leftLeg = new THREE.Mesh(legGeo, legMat);
      leftLeg.position.set(-0.09, 0.22, 0);
      leftLeg.castShadow = true;
      legsGroup.add(leftLeg);

      rightLeg = new THREE.Mesh(legGeo, legMat);
      rightLeg.position.set(0.09, 0.22, 0);
      rightLeg.castShadow = true;
      legsGroup.add(rightLeg);

      // Zapatos redondeados
      const shoeGeo = new THREE.BoxGeometry(0.095, 0.055, 0.14);
      const shoeL = new THREE.Mesh(shoeGeo, shoeMat);
      shoeL.position.set(-0.09, 0.028, 0.03);
      legsGroup.add(shoeL);

      const shoeR = new THREE.Mesh(shoeGeo, shoeMat);
      shoeR.position.set(0.09, 0.028, 0.03);
      legsGroup.add(shoeR);
    }
    root.add(legsGroup);

    // --- Torso / Ropa de los Años 60 ---
    const torsoGroup = new THREE.Group();
    torsoGroup.position.set(0, bodyBaseY, 0);

    const skinMat = new THREE.MeshStandardMaterial({
      color: data.palette.skin || 0xf5ded1,
      roughness: 0.85
    });

    let torsoMesh;
    if (data.style === 'dress') {
      // Vestido corte A acampanado años 60
      const dressMat = new THREE.MeshStandardMaterial({
        color: data.palette.dress,
        roughness: 0.75
      });
      torsoMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.23, 0.40, 14), dressMat);
      torsoMesh.position.y = 0.20;
      torsoMesh.castShadow = true;
      torsoGroup.add(torsoMesh);

      // Cuello Peter Pan blanco marfil
      const collarMat = new THREE.MeshStandardMaterial({ color: 0xfbf8f2, roughness: 0.6 });
      const collar = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.014, 6, 12, Math.PI), collarMat);
      collar.position.set(0, 0.38, 0.06);
      collar.rotation.x = Math.PI / 2.2;
      torsoGroup.add(collar);

      // Cinturón o lazo suave en la cintura
      const beltMat = new THREE.MeshStandardMaterial({ color: 0x3d332e, roughness: 0.6 });
      const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.138, 0.138, 0.02, 14), beltMat);
      belt.position.y = 0.18;
      torsoGroup.add(belt);
    } else if (data.style === 'suit') {
      // Traje sastre entallado años 60
      const suitMat = new THREE.MeshStandardMaterial({
        color: data.palette.jacket,
        roughness: 0.75
      });
      torsoMesh = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.38, 0.20), suitMat);
      torsoMesh.position.y = 0.19;
      torsoMesh.castShadow = true;
      torsoGroup.add(torsoMesh);

      // Camisa blanca
      const shirtMat = new THREE.MeshStandardMaterial({ color: data.palette.shirt || 0xffffff });
      const shirt = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.26, 0.02), shirtMat);
      shirt.position.set(0, 0.24, 0.102);
      torsoGroup.add(shirt);

      // Corbata estrecha o corbatín
      if (data.palette.tie) {
        const tieMat = new THREE.MeshStandardMaterial({ color: data.palette.tie });
        const tie = new THREE.Mesh(new THREE.BoxGeometry(0.034, 0.18, 0.015), tieMat);
        tie.position.set(0, 0.23, 0.11);
        torsoGroup.add(tie);
      }
    } else {
      // Chaleco con botones y camisa
      const shirtMat = new THREE.MeshStandardMaterial({ color: data.palette.shirt || 0xffffff });
      torsoMesh = new THREE.Mesh(new THREE.BoxGeometry(0.27, 0.38, 0.19), shirtMat);
      torsoMesh.position.y = 0.19;
      torsoMesh.castShadow = true;
      torsoGroup.add(torsoMesh);

      const vestMat = new THREE.MeshStandardMaterial({
        color: data.palette.vest || 0x6e5d4f,
        roughness: 0.8
      });
      const vest = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.31, 0.20), vestMat);
      vest.position.y = 0.16;
      vest.castShadow = true;
      torsoGroup.add(vest);

      // Botones del chaleco
      const buttonMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.5 });
      for (let b = 0; b < 3; b++) {
        const btn = new THREE.Mesh(new THREE.SphereGeometry(0.011, 6, 6), buttonMat);
        btn.position.set(0, 0.10 + b * 0.06, 0.105);
        torsoGroup.add(btn);
      }

      if (data.palette.tie) {
        const tieMat = new THREE.MeshStandardMaterial({ color: data.palette.tie });
        const tie = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.16, 0.015), tieMat);
        tie.position.set(0, 0.24, 0.106);
        torsoGroup.add(tie);
      }
    }

    // Cuello
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.06, 10), skinMat);
    neck.position.y = 0.40;
    torsoGroup.add(neck);

    // --- Cabeza Chibi Grande (rostro tierno) ---
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.58, 0);

    const headGeo = new THREE.SphereGeometry(0.20, 16, 14);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.castShadow = true;
    headGroup.add(headMesh);

    // Ojos tiernos (esferas oscuras con brillo)
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x1f1917, roughness: 0.2 });
    const glintMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const eyeGeo = new THREE.SphereGeometry(0.022, 8, 8);

    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-0.07, 0.01, 0.185);
    headGroup.add(eyeL);

    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.position.set(0.07, 0.01, 0.185);
    headGroup.add(eyeR);

    // Brillos de ojos
    const glintL = new THREE.Mesh(new THREE.SphereGeometry(0.006, 6, 6), glintMat);
    glintL.position.set(-0.063, 0.02, 0.202);
    headGroup.add(glintL);

    const glintR = new THREE.Mesh(new THREE.SphereGeometry(0.006, 6, 6), glintMat);
    glintR.position.set(0.077, 0.02, 0.202);
    headGroup.add(glintR);

    // Cejas
    const browMat = new THREE.MeshStandardMaterial({ color: data.palette.hair || 0x3d3028 });
    const browGeo = new THREE.BoxGeometry(0.034, 0.005, 0.008);
    const browL = new THREE.Mesh(browGeo, browMat);
    browL.position.set(-0.07, 0.05, 0.188);
    browL.rotation.z = 0.10;
    headGroup.add(browL);

    const browR = new THREE.Mesh(browGeo, browMat);
    browR.position.set(0.07, 0.05, 0.188);
    browR.rotation.z = -0.10;
    headGroup.add(browR);

    // --- Peinados distintos de los años 60 ---
    const hairMat = new THREE.MeshStandardMaterial({
      color: data.palette.hair || 0x3d3028,
      roughness: 0.85
    });

    const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.208, 16, 12), hairMat);
    hairCap.position.set(0, 0.02, -0.018);
    hairCap.scale.set(1.02, 1.04, 1.05);
    headGroup.add(hairCap);

    // Variaciones de peinado (rulos, moño, peinado hacia atrás, corto)
    const personIdx = parseInt(data.id.replace(/\D/g, '') || '0', 10);
    const styleChoice = personIdx % 4;

    if (data.gender === 'female' || styleChoice === 0) {
      if (styleChoice === 0 || styleChoice === 2) {
        // Rulos / Curls voluminosos años 60
        for (let r = 0; r < 4; r++) {
          const curlL = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), hairMat);
          curlL.position.set(-0.17, -0.04 - r * 0.035, 0.02 + (r % 2) * 0.04);
          headGroup.add(curlL);

          const curlR = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), hairMat);
          curlR.position.set(0.17, -0.04 - r * 0.035, 0.02 + (r % 2) * 0.04);
          headGroup.add(curlR);
        }
      } else {
        // Moño alto / Chignon elegante
        const bun = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), hairMat);
        bun.position.set(0, 0.18, -0.08);
        headGroup.add(bun);

        const band = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.012, 6, 14), new THREE.MeshStandardMaterial({ color: 0x8a5242 }));
        band.position.set(0, 0.16, -0.07);
        headGroup.add(band);
      }
    } else {
      if (styleChoice === 1) {
        // Peinado hacia atrás / slicked suave
        const pompadour = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.07, 0.16), hairMat);
        pompadour.position.set(0, 0.18, 0.02);
        pompadour.rotation.x = -0.15;
        headGroup.add(pompadour);
      } else {
        // Corto elegante con raya lateral
        const partedHair = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.20, 0.08, 12), hairMat);
        partedHair.position.set(0.02, 0.16, 0);
        partedHair.rotation.z = -0.08;
        headGroup.add(partedHair);
      }
    }

    // Sombreros de los años 60
    if (data.hat === 'pillbox') {
      const hatMat = new THREE.MeshStandardMaterial({
        color: data.hatColor || data.palette.dress || 0x8fa89b,
        roughness: 0.7
      });
      const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.07, 16), hatMat);
      hat.position.set(0.04, 0.19, -0.01);
      hat.rotation.z = -0.14;
      headGroup.add(hat);
    } else if (data.hat === 'fedora') {
      const hatMat = new THREE.MeshStandardMaterial({
        color: data.hatColor || 0x4d5249,
        roughness: 0.85
      });
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.018, 18), hatMat);
      brim.position.set(0, 0.17, 0.01);
      headGroup.add(brim);

      const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 0.11, 16), hatMat);
      crown.position.set(0, 0.22, 0.01);
      headGroup.add(crown);
    }
    torsoGroup.add(headGroup);

    // --- Signo de Exclamación (!) para llamar café ---
    const exclamationGroup = new THREE.Group();
    exclamationGroup.position.set(0, 1.45, 0);
    exclamationGroup.visible = false;

    const exclMat = new THREE.MeshStandardMaterial({
      color: 0xffe066,
      emissive: new THREE.Color(0xffcc00),
      emissiveIntensity: 0.8,
      roughness: 0.2
    });

    const exclBar = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.02, 0.18, 8), exclMat);
    exclBar.position.y = 0.08;
    exclamationGroup.add(exclBar);

    const exclDot = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 8), exclMat);
    exclDot.position.y = -0.06;
    exclamationGroup.add(exclDot);

    const exclLight = new THREE.PointLight(0xffe066, 0.6, 1.8);
    exclLight.position.set(0, 0.04, 0);
    exclamationGroup.add(exclLight);

    root.add(exclamationGroup);

    // --- Brazos articulados con manos redondeadas ---
    const armGeo = new THREE.CylinderGeometry(0.038, 0.032, 0.28, 8);
    const sleeveColor = data.style === 'dress' ? data.palette.dress : data.style === 'suit' ? data.palette.jacket : data.palette.shirt;
    const armMat = new THREE.MeshStandardMaterial({ color: sleeveColor, roughness: 0.75 });

    // Brazo izquierdo
    const armLeftPivot = new THREE.Group();
    armLeftPivot.position.set(-0.17, 0.30, 0);
    const armLeft = new THREE.Mesh(armGeo, armMat);
    armLeft.position.y = -0.14;
    armLeft.castShadow = true;
    armLeftPivot.add(armLeft);

    const handLeft = new THREE.Mesh(new THREE.SphereGeometry(0.038, 8, 8), skinMat);
    handLeft.position.y = -0.30;
    armLeftPivot.add(handLeft);
    torsoGroup.add(armLeftPivot);

    // Brazo derecho (se levanta al pedir café)
    const armRightPivot = new THREE.Group();
    armRightPivot.position.set(0.17, 0.30, 0);
    const armRight = new THREE.Mesh(armGeo, armMat);
    armRight.position.y = -0.14;
    armRight.castShadow = true;
    armRightPivot.add(armRight);

    const handRight = new THREE.Mesh(new THREE.SphereGeometry(0.038, 8, 8), skinMat);
    handRight.position.y = -0.30;
    armRightPivot.add(handRight);

    let cupMesh = null;
    if (data.activity === 'cup_lifting') {
      const cupMat = new THREE.MeshStandardMaterial({ color: 0xf4eee4, roughness: 0.5 });
      cupMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.02, 0.05, 10), cupMat);
      cupMesh.position.set(0, -0.32, 0.03);
      cupMesh.rotation.x = Math.PI / 2;
      armRightPivot.add(cupMesh);
    }
    torsoGroup.add(armRightPivot);

    root.add(torsoGroup);
    peopleGroup.add(root);

    const personInstance = {
      data,
      root,
      torsoGroup,
      headGroup,
      armLeftPivot,
      armRightPivot,
      leftLeg,
      rightLeg,
      legsGroup,
      cupMesh,
      exclamationGroup,
      exclLight,
      isCallingCoffee: false,
      activeTableData: null,
      // Máquina de estados: 'entrando' | 'sentado' | 'esperando' | 'hablando' | 'saliendo' | 'fuera' | 'applauding'
      state: data.isSitting ? 'sentado' : 'esperando',
      animTimer: Math.random() * 10,
      isSitting: data.isSitting,
      waypoints: [],
      waypointIndex: 0,
      walkSpeed: 2.1,
      walkCycle: 0,
      leaveDelay: 0,
      onPathComplete: null,
      targetStateOnPathComplete: 'esperando',

      /**
       * Activa o desactiva la llamada de café con mano levantada y signo '!' brillante
       * @param {boolean} calling
       * @param {object} [tableData=null]
       */
      setCallingCoffee(calling, tableData = null) {
        this.isCallingCoffee = !!calling;
        this.activeTableData = tableData;
        this.exclamationGroup.visible = !!calling;

        if (calling) {
          this.armRightPivot.rotation.x = -2.35;
          this.armRightPivot.rotation.z = 0.35;
        } else {
          this.armRightPivot.rotation.x = 0;
          this.armRightPivot.rotation.z = 0;
        }

        // Marcar en userData para raycasting
        this.root.userData.isCallingCoffee = !!calling;
        this.root.userData.tableData = tableData;
        this.root.traverse((c) => {
          if (c.isMesh) {
            c.userData.isCallingCoffee = !!calling;
            c.userData.tableData = tableData;
          }
        });
      },

      /**
       * Sirve el café: baja la mano, apaga el signo de exclamación y muestra la taza
       */
      serveCoffee() {
        this.setCallingCoffee(false, null);
        if (this.cupMesh) {
          this.cupMesh.visible = true;
        }
      },

      setState(newState) {
        if (newState === 'saliendo') {
          this.startLeaving(0);
          return;
        }
        this.state = newState;
      },

      startLeaving(delay = 0) {
        this.leaveDelay = delay || 0;
        this.state = 'saliendo';

        const door = gameConfig.doorPosition;
        this.waypoints = [];

        if (this.root.position.x > 1.5) {
          if (this.root.position.z > 0) {
            this.waypoints.push(new THREE.Vector3(2.0, 0, 2.6));
            this.waypoints.push(new THREE.Vector3(-2.2, 0, 2.6));
          } else {
            this.waypoints.push(new THREE.Vector3(2.0, 0, -2.2));
            this.waypoints.push(new THREE.Vector3(-2.2, 0, -2.2));
          }
        } else if (this.root.position.x < -1.5) {
          this.waypoints.push(new THREE.Vector3(-4.0, 0, this.root.position.z));
        }

        this.waypoints.push(new THREE.Vector3(door.x, 0, door.z));
        this.waypointIndex = 0;

        if (this.leaveDelay <= 0) {
          this.standUp();
        }
      },

      walkToPath(waypoints, onComplete, targetState = 'esperando') {
        this.standUp();
        this.waypoints = waypoints;
        this.waypointIndex = 0;
        this.state = 'entrando';
        this.onPathComplete = onComplete;
        this.targetStateOnPathComplete = targetState;
      },

      standUp() {
        if (!this.isSitting) return;
        this.isSitting = false;

        while (this.legsGroup.children.length > 0) {
          this.legsGroup.remove(this.legsGroup.children[0]);
        }

        const legGeo = new THREE.CylinderGeometry(0.048, 0.042, 0.44, 8);
        this.leftLeg = new THREE.Mesh(legGeo, legMat);
        this.leftLeg.position.set(-0.09, 0.22, 0);
        this.legsGroup.add(this.leftLeg);

        this.rightLeg = new THREE.Mesh(legGeo, legMat);
        this.rightLeg.position.set(0.09, 0.22, 0);
        this.legsGroup.add(this.rightLeg);

        this.torsoGroup.position.y = 0.44;
        if (this.cupMesh) {
          this.cupMesh.visible = false;
        }
      },

      startApplauding() {
        this.state = 'applauding';
      },

      update(delta) {
        if (this.state === 'fuera') return;
        this.animTimer += delta;

        // Animación de llamada de café (brazo alzado saludando y signo '!' flotando)
        if (this.isCallingCoffee) {
          this.armRightPivot.rotation.x = -2.35 + Math.sin(this.animTimer * 5.0) * 0.10;
          this.armRightPivot.rotation.z = 0.35 + Math.cos(this.animTimer * 5.0) * 0.06;
          if (this.exclamationGroup) {
            this.exclamationGroup.position.y = 1.45 + Math.sin(this.animTimer * 4.0) * 0.06;
            if (this.exclLight) {
              this.exclLight.intensity = 0.6 + Math.sin(this.animTimer * 6.0) * 0.35;
            }
          }
        }

        if (this.state === 'sentado') {
          const breathe = Math.sin(this.animTimer * 1.5) * 0.015;
          this.torsoGroup.position.y = seatY + breathe;
          this.headGroup.rotation.y = Math.sin(this.animTimer * 0.8) * 0.08;

          if (this.isCallingCoffee) {
            // No sobreescribir la animación de llamada
          } else if (data.activity === 'cup_lifting') {
            const cycle = (Math.sin(this.animTimer * 0.7) + 1) / 2;
            if (cycle > 0.6) {
              const liftProgress = (cycle - 0.6) / 0.4;
              this.armRightPivot.rotation.x = -liftProgress * 1.2;
              this.armRightPivot.rotation.z = -liftProgress * 0.3;
            } else {
              this.armRightPivot.rotation.x = -0.3;
              this.armRightPivot.rotation.z = 0;
            }
          } else if (data.activity === 'talking') {
            this.headGroup.rotation.x = Math.sin(this.animTimer * 3.0) * 0.04;
            this.armRightPivot.rotation.x = Math.sin(this.animTimer * 2.0) * 0.15;
          } else {
            this.armLeftPivot.rotation.x = Math.sin(this.animTimer * 1.2) * 0.05;
            this.armRightPivot.rotation.x = -Math.sin(this.animTimer * 1.2) * 0.05;
          }
        } else if (this.state === 'esperando') {
          const breathe = Math.sin(this.animTimer * 1.4) * 0.015;
          this.torsoGroup.position.y = 0.44 + breathe;
          this.headGroup.rotation.y = Math.sin(this.animTimer * 0.6) * 0.06;
          this.armLeftPivot.rotation.x = Math.sin(this.animTimer * 1.0) * 0.04;
          if (!this.isCallingCoffee) {
            this.armRightPivot.rotation.x = -Math.sin(this.animTimer * 1.0) * 0.04;
          }
        } else if (this.state === 'hablando') {
          const breathe = Math.sin(this.animTimer * 2.0) * 0.015;
          this.torsoGroup.position.y = (this.isSitting ? seatY : 0.44) + breathe;
          this.headGroup.rotation.x = Math.sin(this.animTimer * 4.0) * 0.06;
          this.headGroup.rotation.y = Math.sin(this.animTimer * 1.5) * 0.08;
          this.armRightPivot.rotation.x = -0.4 + Math.sin(this.animTimer * 3.5) * 0.15;
          this.armLeftPivot.rotation.x = -0.2 + Math.sin(this.animTimer * 2.0) * 0.08;
          this.armRightPivot.rotation.x = -0.4 + Math.sin(this.animTimer * 3.5) * 0.15;
          this.armLeftPivot.rotation.x = -0.2 + Math.sin(this.animTimer * 2.0) * 0.08;
        } else if (this.state === 'applauding') {
          this.torsoGroup.position.y = this.isSitting ? seatY : 0.65;
          const clap = Math.sin(this.animTimer * 14.0) * 0.22;
          this.armLeftPivot.rotation.x = -1.25;
          this.armLeftPivot.rotation.z = 0.45 + clap;
          this.armRightPivot.rotation.x = -1.25;
          this.armRightPivot.rotation.z = -0.45 - clap;
          this.headGroup.rotation.x = Math.sin(this.animTimer * 4.0) * 0.05;
        } else if (this.state === 'saliendo' || this.state === 'entrando') {
          if (this.leaveDelay > 0) {
            this.leaveDelay -= delta;
            if (this.leaveDelay <= 0) {
              this.standUp();
            }
            return;
          }

          if (this.waypointIndex < this.waypoints.length) {
            const target = this.waypoints[this.waypointIndex];
            const dx = target.x - this.root.position.x;
            const dz = target.z - this.root.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);

            const targetAngle = Math.atan2(dx, dz);
            this.root.rotation.y = THREE.MathUtils.lerp(this.root.rotation.y, targetAngle, delta * 8);

            const step = Math.min(dist, this.walkSpeed * delta);
            this.root.position.x += Math.sin(targetAngle) * step;
            this.root.position.z += Math.cos(targetAngle) * step;

            this.walkCycle += delta * 9;
            const legSwing = Math.sin(this.walkCycle) * 0.45;
            if (this.leftLeg) this.leftLeg.rotation.x = legSwing;
            if (this.rightLeg) this.rightLeg.rotation.x = -legSwing;
            this.armLeftPivot.rotation.x = -legSwing * 0.6;
            this.armRightPivot.rotation.x = legSwing * 0.6;
            this.torsoGroup.position.y = 0.65 + Math.abs(Math.sin(this.walkCycle)) * 0.03;

            if (dist < 0.2) {
              this.waypointIndex++;
            }
          } else {
            if (this.state === 'saliendo') {
              this.state = 'fuera';
              this.root.visible = false;
            } else if (this.state === 'entrando') {
              this.state = this.targetStateOnPathComplete || 'esperando';
              if (this.leftLeg) this.leftLeg.rotation.x = 0;
              if (this.rightLeg) this.rightLeg.rotation.x = 0;
              this.armLeftPivot.rotation.x = 0;
              this.armRightPivot.rotation.x = 0;
              if (this.onPathComplete) {
                const cb = this.onPathComplete;
                this.onPathComplete = null;
                cb();
              }
            }
          }
        }
      }
    };

    // Etiquetar grupo principal y todas las mallas del cuerpo con userData completo
    root.userData = {
      isPerson: true,
      personId: data.id,
      personInstance,
      data
    };

    root.traverse((child) => {
      if (child.isMesh) {
        child.userData = {
          isPersonPart: true,
          personId: data.id,
          personRoot: root,
          personInstance,
          data
        };
      }
    });

    return personInstance;
  }

  /**
   * Generar los visitantes en la cafetería con el aspecto distintivo del ciclo
   * @param {number} [cycle=1]
   */
  function spawnPeople(cycle = 1) {
    clearPeople();
    const dataList = getPeopleDataForCycle(cycle);
    people = dataList.map((d) => createPerson(d));
  }

  let nightSafetyTimeout = null;

  /**
   * Vaciar la cafetería: TODO visitante (sentado, de pie o crítico) sale por la puerta
   * Con red de seguridad de 20 segundos para eliminar a cualquiera atascado
   * @param {Function} [onComplete]
   */
  function evacuateAllPeople(onComplete) {
    if (nightSafetyTimeout) {
      clearTimeout(nightSafetyTimeout);
      nightSafetyTimeout = null;
    }

    // 1. Iniciar salida de la gente sentada y de pie
    people.forEach((p, idx) => {
      if (p.state !== 'fuera') {
        p.startLeaving(idx * 0.25);
      }
    });

    // 2. TAREA B2: El muñequito que hace la queja sobre las plantas desaparece inmediatamente al caer la noche
    forceRemoveAllCritics();

    // 3. Iniciar salida de dueños temporales
    temporaryOwners.forEach((to) => {
      if (to.state !== 'fuera') {
        to.startLeaving(0);
      }
    });

    let completed = false;
    const finish = () => {
      if (completed) return;
      completed = true;
      if (checkInterval) clearInterval(checkInterval);
      if (nightSafetyTimeout) clearTimeout(nightSafetyTimeout);
      nightSafetyTimeout = null;
      stopApplause();

      // Garantizar que ningún modelo del visitante que opina quede visible de noche
      allOpinionVisitors.forEach((v) => {
        v.state = 'fuera';
        v.root.visible = false;
        if (v.root.parent) v.root.parent.remove(v.root);
      });
      allOpinionVisitors = [];
      if (currentOpinionVisitor) {
        currentOpinionVisitor.state = 'fuera';
        currentOpinionVisitor.root.visible = false;
        if (currentOpinionVisitor.root.parent) {
          currentOpinionVisitor.root.parent.remove(currentOpinionVisitor.root);
        }
        currentOpinionVisitor = null;
      }

      if (onComplete) onComplete();
    };

    const checkInterval = setInterval(() => {
      const allPeopleOut = people.every((p) => p.state === 'fuera');
      const criticsOut = allOpinionVisitors.every((v) => v.state === 'fuera') && (!currentOpinionVisitor || currentOpinionVisitor.state === 'fuera');
      const ownersOut = temporaryOwners.every((to) => to.state === 'fuera');

      if (allPeopleOut && criticsOut && ownersOut) {
        finish();
      }
    }, 200);

    // Red de seguridad: si tras 15 segundos de noche alguien sigue en escena, se elimina
    nightSafetyTimeout = setTimeout(() => {
      forceRemoveAllStuck();
      finish();
    }, 15000);
  }

  /**
   * Forzar eliminación inmediata de cualquier visitante atascado
   */
  function forceRemoveAllStuck() {
    people.forEach((p) => {
      p.state = 'fuera';
      p.root.visible = false;
    });
    allOpinionVisitors.forEach((v) => {
      v.state = 'fuera';
      v.root.visible = false;
      if (v.root.parent) v.root.parent.remove(v.root);
    });
    allOpinionVisitors = [];
    if (currentOpinionVisitor) {
      currentOpinionVisitor.state = 'fuera';
      currentOpinionVisitor.root.visible = false;
      if (currentOpinionVisitor.root.parent) {
        currentOpinionVisitor.root.parent.remove(currentOpinionVisitor.root);
      }
      currentOpinionVisitor = null;
    }
    temporaryOwners.forEach((to) => {
      to.state = 'fuera';
      to.root.visible = false;
      if (to.root.parent) to.root.parent.remove(to.root);
    });
    temporaryOwners = [];
  }

  /**
   * Animación de entrada de los dueños de los objetos olvidados para recogerlos
   * @param {Array<object>} objectsList
   * @param {Function} onComplete
   */
  function pickupNightObjects(objectsList, onComplete) {
    if (!objectsList || objectsList.length === 0) {
      if (onComplete) onComplete();
      return;
    }

    const door = gameConfig.doorPosition;
    let completedCount = 0;

    objectsList.forEach((objInstance, i) => {
      const ownerData = {
        id: `owner_${objInstance.id}`,
        name: 'Dueño',
        style: i % 2 === 0 ? 'suit' : 'dress',
        gender: i % 2 === 0 ? 'male' : 'female',
        palette: {
          jacket: 0x6e706b,
          dress: 0x8a9e8f,
          pants: 0x474a44,
          shirt: 0xffffff,
          hair: 0x332822,
          skin: 0xf0decb,
          shoes: 0x222222
        },
        hat: i === 0 ? 'fedora' : null,
        hatColor: 0x5a5c57,
        position: { x: door.x, y: 0, z: door.z },
        rotationY: Math.PI / 2,
        isSitting: false,
        activity: 'walk'
      };

      const owner = createPerson(ownerData);
      temporaryOwners.push(owner);

      const objPos = objInstance.data.position;
      const waypoints = [
        new THREE.Vector3(-4.0, 0, -2.0),
        new THREE.Vector3(objPos.x > 0 ? 1.5 : -2.5, 0, objPos.z),
        new THREE.Vector3(objPos.x, 0, objPos.z + (objPos.z > 0 ? 0.35 : -0.35))
      ];

      setTimeout(() => {
        owner.walkToPath(waypoints, () => {
          owner.torsoGroup.rotation.x = 0.45;
          setTimeout(() => {
            objInstance.root.visible = false;
            owner.torsoGroup.rotation.x = 0;

            const exitWaypoints = [
              new THREE.Vector3(-4.0, 0, -2.0),
              new THREE.Vector3(door.x, 0, door.z)
            ];
            owner.walkToPath(exitWaypoints, () => {
              owner.state = 'fuera';
              owner.root.visible = false;
              completedCount++;
              if (completedCount >= objectsList.length) {
                temporaryOwners.forEach((to) => {
                  if (to.root.parent) to.root.parent.remove(to.root);
                });
                temporaryOwners = [];
                if (onComplete) onComplete();
              }
            }, 'fuera');
          }, 650);
        }, 'esperando');
      }, i * 650);
    });
  }

  /**
   * Spawnea un visitante opinante que camina frente al jardín, pausa 2 segundos y opina
   * @param {object} options
   * @param {object} options.visitorData
   * @param {Function} options.onReadyToOpine - callback(visitorInstance)
   */
  function spawnOpinionVisitor({ visitorData, onReadyToOpine }) {
    dismissOpinionVisitor();

    const door = gameConfig.doorPosition;
    const vData = {
      ...visitorData,
      position: { x: door.x, y: 0, z: door.z },
      rotationY: Math.PI / 2,
      isSitting: false,
      activity: 'walk'
    };

    const visitor = createPerson(vData);
    visitor.isCritic = true;
    visitor.visitorData = visitorData;
    currentOpinionVisitor = visitor;
    if (!allOpinionVisitors.includes(visitor)) {
      allOpinionVisitors.push(visitor);
    }

    // Etiquetar para clics en 3D
    visitor.root.userData = {
      isPerson: true,
      personId: vData.id,
      isOpinionVisitor: true,
      visitorData,
      personInstance: visitor
    };
    visitor.root.traverse((c) => {
      if (c.isMesh) {
        c.userData = {
          isPersonPart: true,
          personId: vData.id,
          personRoot: visitor.root,
          isOpinionVisitor: true,
          visitorData,
          personInstance: visitor
        };
      }
    });

    const waypoints = [
      new THREE.Vector3(-3.2, 0, -1.0),
      new THREE.Vector3(-1.0, 0, 1.8),
      new THREE.Vector3(0.0, 0, 1.8) // Frente al jardín central
    ];

    visitor.walkToPath(waypoints, () => {
      visitor.root.rotation.y = Math.PI;
      visitor.state = 'esperando';

      // Pausa muda de 2 segundos con silencio y respiración tenue
      onVisitorPauseStart();
      setTimeout(() => {
        onVisitorPauseEnd();
        // Si no fue despedido o evacuado, avisar que está listo para opinar
        if (visitor.state === 'esperando') {
          if (onReadyToOpine) {
            onReadyToOpine(visitor, visitorData);
          }
        }
      }, 2000);
    }, 'esperando');

    return visitor;
  }

  /**
   * Despide al visitante opinante hacia la salida
   * @param {Function} [onDone]
   */
  function dismissOpinionVisitor(onDone) {
    if (!currentOpinionVisitor) {
      if (onDone) onDone();
      return;
    }

    const v = currentOpinionVisitor;
    currentOpinionVisitor = null;
    v.isCritic = false;
    v.walkSpeed = 2.8;
    const door = gameConfig.doorPosition;
    const exitWaypoints = [
      new THREE.Vector3(-3.2, 0, 0.5),
      new THREE.Vector3(-4.5, 0, -2.0),
      new THREE.Vector3(door.x, 0, door.z)
    ];

    v.walkToPath(exitWaypoints, () => {
      v.state = 'fuera';
      v.root.visible = false;
      if (v.root.parent) v.root.parent.remove(v.root);
      const idx = allOpinionVisitors.indexOf(v);
      if (idx !== -1) allOpinionVisitors.splice(idx, 1);
      if (onDone) onDone();
    }, 'fuera');
  }

  /**
   * Activar animación de aplausos
   * @param {boolean} isFull - Si es mayoría aplauden todos; si no, unos pocos
   */
  function setApplauding(isFull = true) {
    startApplause(isFull);

    people.forEach((p, idx) => {
      const dx = 0 - p.root.position.x;
      const dz = 0.2 - p.root.position.z;
      p.root.rotation.y = Math.atan2(dx, dz);

      if (isFull || idx % 2 === 0) {
        p.startApplauding();
      }
    });
  }

  /**
   * Eliminar todas las personas de la escena
   */
  function clearPeople() {
    stopApplause();
    if (nightSafetyTimeout) {
      clearTimeout(nightSafetyTimeout);
      nightSafetyTimeout = null;
    }
    dismissOpinionVisitor();
    allOpinionVisitors.forEach((v) => {
      v.state = 'fuera';
      v.root.visible = false;
      if (v.root.parent) v.root.parent.remove(v.root);
    });
    allOpinionVisitors = [];
    currentOpinionVisitor = null;

    while (peopleGroup.children.length > 0) {
      peopleGroup.remove(peopleGroup.children[0]);
    }
    people = [];
    temporaryOwners = [];
  }

  /**
   * Eliminar inmediatamente a cualquier visitante opinante/crítico
   * Asegura que no quede visible ni colisionable de noche
   */
  function forceRemoveAllCritics() {
    allOpinionVisitors.forEach((v) => {
      v.state = 'fuera';
      v.root.visible = false;
      if (v.root.parent) v.root.parent.remove(v.root);
    });
    allOpinionVisitors = [];
    if (currentOpinionVisitor) {
      currentOpinionVisitor.state = 'fuera';
      currentOpinionVisitor.root.visible = false;
      if (currentOpinionVisitor.root.parent) {
        currentOpinionVisitor.root.parent.remove(currentOpinionVisitor.root);
      }
      currentOpinionVisitor = null;
    }
  }

  /**
   * Devuelve todas las mallas clicables de los personajes activos
   * Durante la noche devuelve un array vacío para evitar cualquier colisión o clic
   * @returns {Array<THREE.Mesh>}
   */
  function getAllInteractiveMeshes() {
    if (state.fase === 'noche') {
      return [];
    }
    const meshes = [];
    const allInstances = [...people];
    if (currentOpinionVisitor && !allInstances.includes(currentOpinionVisitor)) {
      allInstances.push(currentOpinionVisitor);
    }
    allOpinionVisitors.forEach((ov) => {
      if (!allInstances.includes(ov)) allInstances.push(ov);
    });
    allInstances.push(...temporaryOwners);

    for (const p of allInstances) {
      if (p.state !== 'fuera' && p.root.visible) {
        p.root.traverse((c) => {
          if (c.isMesh) {
            meshes.push(c);
          }
        });
      }
    }
    return meshes;
  }

  /**
   * Actualizar animaciones de todos los personajes
   * @param {number} delta
   */
  function update(delta) {
    for (let i = 0; i < people.length; i++) {
      people[i].update(delta);
    }
    for (let i = 0; i < temporaryOwners.length; i++) {
      temporaryOwners[i].update(delta);
    }
    if (currentOpinionVisitor) {
      currentOpinionVisitor.update(delta);
    }
  }

  return {
    group: peopleGroup,
    spawnPeople,
    evacuatePeople: evacuateAllPeople,
    evacuateAllPeople,
    pickupNightObjects,
    spawnOpinionVisitor,
    dismissOpinionVisitor,
    setApplauding,
    clearPeople,
    update,
    getPeople: () => people,
    getCurrentOpinionVisitor: () => currentOpinionVisitor,
    getAllInteractiveMeshes,
    forceRemoveAllCritics,
    forceRemoveAllStuck
  };
}
