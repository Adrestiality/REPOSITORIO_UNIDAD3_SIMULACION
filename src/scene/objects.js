import * as THREE from 'three';
import { getObjectsForCycle } from '../data/objects.js';

/**
 * Gestor y generador de Objetos Olvidados 3D
 * "Nadie lo verá completo" - Módulo 3
 */
export function createObjectsManager(scene) {
  const group = new THREE.Group();
  group.name = 'forgotten_objects_group';
  scene.add(group);

  let objectsList = [];
  let glowTimer = 0;

  /**
   * Generar modelos 3D para los objetos del ciclo actual
   * Si se especifican servedTableIds, SOLO spawnea los objetos de las mesas atendidas ese día.
   * @param {number} cycle
   * @param {Array<string>|null} [servedTableIds=null]
   */
  function spawnForCycle(cycle = 1, servedTableIds = null) {
    clearObjects();

    const dataList = getObjectsForCycle(cycle, servedTableIds);

    dataList.forEach((data) => {
      const objInstance = buildObject3D(data);
      objectsList.push(objInstance);
      group.add(objInstance.root);
    });
  }

  /**
   * Construye la forma 3D procedural simple de un objeto
   * @param {object} data
   * @returns {object}
   */
  function buildObject3D(data) {
    const root = new THREE.Group();
    root.name = data.id;
    root.position.set(data.position.x, data.position.y, data.position.z);

    const glowColor = 0xfff3cf;
    const glowLight = new THREE.PointLight(glowColor, 0.45, 1.4);
    glowLight.position.set(0, 0.18, 0);
    root.add(glowLight);

    const interactiveMeshes = [];
    const steamParticles = [];
    let mainMaterial = null;

    if (data.type === 'chaqueta') {
      // Chaqueta doblada/apoyada con cuerpo y mangas
      mainMaterial = new THREE.MeshStandardMaterial({
        color: data.color || 0x5a6575,
        roughness: 0.85,
        emissive: new THREE.Color(0x8fa3bf),
        emissiveIntensity: 0.3
      });

      const body = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.12, 0.32), mainMaterial);
      body.position.y = 0.06;
      body.castShadow = true;
      root.add(body);
      interactiveMeshes.push(body);

      // Solapa / cuello
      const collar = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.06, 0.16), mainMaterial);
      collar.position.set(0, 0.13, -0.06);
      collar.rotation.x = -0.2;
      root.add(collar);
      interactiveMeshes.push(collar);

      // Manga doblada
      const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.34, 10), mainMaterial);
      sleeve.rotation.z = Math.PI / 2.2;
      sleeve.position.set(0.12, 0.07, 0.12);
      root.add(sleeve);
      interactiveMeshes.push(sleeve);
    } else if (data.type === 'taza_humeante') {
      // Taza de café
      mainMaterial = new THREE.MeshStandardMaterial({
        color: data.color || 0xf4eee4,
        roughness: 0.4,
        emissive: new THREE.Color(0xffeed0),
        emissiveIntensity: 0.25
      });

      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.045, 0.1, 14), mainMaterial);
      cup.position.y = 0.05;
      cup.castShadow = true;
      root.add(cup);
      interactiveMeshes.push(cup);

      // Café oscuro interior
      const coffeeMat = new THREE.MeshStandardMaterial({ color: 0x241812, roughness: 0.2 });
      const coffee = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.052, 0.01, 12), coffeeMat);
      coffee.position.y = 0.09;
      root.add(coffee);

      // Asa
      const handleMat = mainMaterial;
      const handle = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.012, 8, 12, Math.PI * 1.2), handleMat);
      handle.position.set(0.065, 0.05, 0);
      handle.rotation.y = Math.PI / 2;
      root.add(handle);

      // Vapor humeante (esferas tenues que ascienden)
      const steamMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.35
      });
      for (let i = 0; i < 4; i++) {
        const steam = new THREE.Mesh(new THREE.SphereGeometry(0.02 + i * 0.008, 8, 6), steamMat.clone());
        steam.position.set(
          (Math.random() - 0.5) * 0.04,
          0.12 + i * 0.07,
          (Math.random() - 0.5) * 0.04
        );
        steam.userData = {
          baseY: 0.12,
          speed: 0.18 + Math.random() * 0.08,
          phase: i * 1.2
        };
        root.add(steam);
        steamParticles.push(steam);
      }
    } else if (data.type === 'libreta') {
      // Libreta con hojas entreabiertas
      mainMaterial = new THREE.MeshStandardMaterial({
        color: data.color || 0x9e886b,
        roughness: 0.75,
        emissive: new THREE.Color(0xf6e5cb),
        emissiveIntensity: 0.3
      });

      // Tapa inferior
      const cover = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.02, 0.2), mainMaterial);
      cover.position.y = 0.01;
      cover.rotation.y = 0.25;
      cover.castShadow = true;
      root.add(cover);
      interactiveMeshes.push(cover);

      // Páginas blancas
      const pageMat = new THREE.MeshStandardMaterial({ color: 0xfaf6ed, roughness: 0.6 });
      const pages = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.03, 0.18), pageMat);
      pages.position.set(0, 0.025, 0);
      pages.rotation.y = 0.25;
      root.add(pages);
      interactiveMeshes.push(pages);

      // Lomo y cinta marcapáginas
      const ribbonMat = new THREE.MeshStandardMaterial({ color: 0x9c3d3d, roughness: 0.5 });
      const ribbon = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.02, 0.24), ribbonMat);
      ribbon.position.set(0.04, 0.042, 0.02);
      ribbon.rotation.y = 0.45;
      root.add(ribbon);
    } else if (data.type === 'reloj_bolsillo') {
      mainMaterial = new THREE.MeshStandardMaterial({
        color: data.color || 0xb59e78,
        roughness: 0.35,
        metalness: 0.6,
        emissive: new THREE.Color(0xfff0c4),
        emissiveIntensity: 0.3
      });
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 18), mainMaterial);
      body.position.y = 0.01;
      root.add(body);
      interactiveMeshes.push(body);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.028, 0.007, 8, 14), mainMaterial);
      ring.position.set(0, 0.01, -0.09);
      ring.rotation.x = Math.PI / 2;
      root.add(ring);
    } else if (data.type === 'guantes') {
      mainMaterial = new THREE.MeshStandardMaterial({
        color: data.color || 0x8a5252,
        roughness: 0.85,
        emissive: new THREE.Color(0xd99b9b),
        emissiveIntensity: 0.3
      });
      const g1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.035, 0.22), mainMaterial);
      g1.position.set(-0.04, 0.02, 0);
      g1.rotation.y = 0.2;
      root.add(g1);
      interactiveMeshes.push(g1);
      const g2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.035, 0.22), mainMaterial);
      g2.position.set(0.04, 0.03, 0);
      g2.rotation.y = -0.3;
      root.add(g2);
      interactiveMeshes.push(g2);
    } else if (data.type === 'carta') {
      mainMaterial = new THREE.MeshStandardMaterial({
        color: data.color || 0xeae4d8,
        roughness: 0.6,
        emissive: new THREE.Color(0xfffaea),
        emissiveIntensity: 0.3
      });
      const env = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.015, 0.15), mainMaterial);
      env.position.y = 0.008;
      env.rotation.y = 0.35;
      root.add(env);
      interactiveMeshes.push(env);
      const seal = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.01, 10), new THREE.MeshStandardMaterial({ color: 0x9c3d3d }));
      seal.position.set(0, 0.018, 0);
      root.add(seal);
    } else if (data.type === 'espejo') {
      mainMaterial = new THREE.MeshStandardMaterial({
        color: data.color || 0xced4db,
        roughness: 0.2,
        metalness: 0.7,
        emissive: new THREE.Color(0xe0e8f2),
        emissiveIntensity: 0.3
      });
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.015, 20), mainMaterial);
      plate.position.y = 0.01;
      root.add(plate);
      interactiveMeshes.push(plate);
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.014, 0.16, 8), mainMaterial);
      handle.position.set(0, 0.01, 0.14);
      handle.rotation.x = Math.PI / 2;
      root.add(handle);
    } else if (data.type === 'llave') {
      mainMaterial = new THREE.MeshStandardMaterial({
        color: data.color || 0xc2a85e,
        roughness: 0.4,
        metalness: 0.7,
        emissive: new THREE.Color(0xfff1bf),
        emissiveIntensity: 0.3
      });
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.22, 8), mainMaterial);
      shaft.rotation.z = Math.PI / 2;
      shaft.position.y = 0.012;
      root.add(shaft);
      interactiveMeshes.push(shaft);
      const bow = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.01, 8, 16), mainMaterial);
      bow.position.set(-0.11, 0.012, 0);
      bow.rotation.y = Math.PI / 2;
      root.add(bow);
    } else if (data.type === 'caja_musica') {
      mainMaterial = new THREE.MeshStandardMaterial({
        color: data.color || 0x6e4e3b,
        roughness: 0.7,
        emissive: new THREE.Color(0xab8872),
        emissiveIntensity: 0.3
      });
      const cbox = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.11, 0.17), mainMaterial);
      cbox.position.y = 0.055;
      cbox.rotation.y = -0.2;
      root.add(cbox);
      interactiveMeshes.push(cbox);
    } else if (data.type === 'fotografia') {
      mainMaterial = new THREE.MeshStandardMaterial({
        color: data.color || 0xd9d3c5,
        roughness: 0.6,
        emissive: new THREE.Color(0xfffaec),
        emissiveIntensity: 0.3
      });
      const card = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.008, 0.22), mainMaterial);
      card.position.y = 0.004;
      card.rotation.y = 0.4;
      root.add(card);
      interactiveMeshes.push(card);
    } else if (data.type === 'semilla') {
      mainMaterial = new THREE.MeshStandardMaterial({
        color: data.color || 0x3d322b,
        roughness: 0.8,
        emissive: new THREE.Color(0x918073),
        emissiveIntensity: 0.3
      });
      const seed = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), mainMaterial);
      seed.position.y = 0.04;
      seed.scale.set(0.8, 1.2, 0.8);
      root.add(seed);
      interactiveMeshes.push(seed);
    } else if (data.type === 'tijeras') {
      mainMaterial = new THREE.MeshStandardMaterial({
        color: data.color || 0x7a828a,
        roughness: 0.3,
        metalness: 0.8,
        emissive: new THREE.Color(0xc9d4de),
        emissiveIntensity: 0.3
      });
      const b1 = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.01, 0.24), mainMaterial);
      b1.position.y = 0.01;
      b1.rotation.y = 0.3;
      root.add(b1);
      interactiveMeshes.push(b1);
      const b2 = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.01, 0.24), mainMaterial);
      b2.position.y = 0.01;
      b2.rotation.y = -0.3;
      root.add(b2);
      interactiveMeshes.push(b2);
    } else if (data.type === 'periodico') {
      mainMaterial = new THREE.MeshStandardMaterial({
        color: data.color || 0xd6cebe,
        roughness: 0.85,
        emissive: new THREE.Color(0xf5eedb),
        emissiveIntensity: 0.3
      });
      const paper = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.025, 0.22), mainMaterial);
      paper.position.y = 0.012;
      paper.rotation.y = 0.2;
      paper.castShadow = true;
      root.add(paper);
      interactiveMeshes.push(paper);

      // Trazo de lápiz azul
      const markMat = new THREE.MeshStandardMaterial({ color: 0x4a6b82, roughness: 0.5 });
      const mark = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.005, 0.04), markMat);
      mark.position.set(0.02, 0.026, -0.02);
      mark.rotation.y = 0.2;
      root.add(mark);
    } else if (data.type === 'gafas') {
      mainMaterial = new THREE.MeshStandardMaterial({
        color: data.color || 0x5c4231,
        roughness: 0.4,
        emissive: new THREE.Color(0xd6a87c),
        emissiveIntensity: 0.3
      });
      const ringL = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.008, 8, 16), mainMaterial);
      ringL.position.set(-0.05, 0.02, 0);
      ringL.rotation.x = Math.PI / 2;
      root.add(ringL);
      interactiveMeshes.push(ringL);

      const ringR = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.008, 8, 16), mainMaterial);
      ringR.position.set(0.05, 0.02, 0);
      ringR.rotation.x = Math.PI / 2;
      root.add(ringR);
      interactiveMeshes.push(ringR);

      const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.008, 0.008), mainMaterial);
      bridge.position.set(0, 0.02, 0);
      root.add(bridge);
    } else if (data.type === 'cinta_metrica') {
      mainMaterial = new THREE.MeshStandardMaterial({
        color: data.color || 0xd9c58b,
        roughness: 0.5,
        metalness: 0.4,
        emissive: new THREE.Color(0xf6e8bc),
        emissiveIntensity: 0.3
      });
      const casing = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.03, 16), mainMaterial);
      casing.position.y = 0.015;
      root.add(casing);
      interactiveMeshes.push(casing);

      // Trozo de cinta que sobresale
      const tapeMat = new THREE.MeshStandardMaterial({ color: 0xded5be, roughness: 0.8 });
      const ribbon = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.005, 0.022), tapeMat);
      ribbon.position.set(0.07, 0.01, 0);
      root.add(ribbon);
    } else if (data.type === 'pipa') {
      mainMaterial = new THREE.MeshStandardMaterial({
        color: data.color || 0x4a2e21,
        roughness: 0.6,
        emissive: new THREE.Color(0x966047),
        emissiveIntensity: 0.3
      });
      const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.025, 0.07, 12), mainMaterial);
      bowl.position.set(-0.06, 0.035, 0);
      root.add(bowl);
      interactiveMeshes.push(bowl);

      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.012, 0.16, 8), mainMaterial);
      stem.rotation.z = Math.PI / 2.3;
      stem.position.set(0.02, 0.02, 0);
      root.add(stem);
      interactiveMeshes.push(stem);
    } else {
      // Objeto genérico
      mainMaterial = new THREE.MeshStandardMaterial({
        color: data.color || 0xd0c4b7,
        roughness: 0.6,
        emissive: new THREE.Color(0xfffae0),
        emissiveIntensity: 0.3
      });
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.15, 0.2), mainMaterial);
      box.position.y = 0.08;
      root.add(box);
      interactiveMeshes.push(box);
    }

    // Configurar userData para raycaster en todos los meshes interactivos
    interactiveMeshes.forEach((m) => {
      m.userData = {
        isForgottenObject: true,
        objectId: data.id,
        data
      };
    });

    return {
      id: data.id,
      data,
      root,
      interactiveMeshes,
      glowLight,
      mainMaterial,
      steamParticles,
      isTouched: false
    };
  }

  /**
   * Marcar objeto como tocado: cesa el brillo
   * @param {string} id
   */
  function markTouched(id) {
    const obj = objectsList.find((o) => o.id === id);
    if (!obj) return;

    obj.isTouched = true;
    obj.glowLight.visible = false;
    if (obj.mainMaterial) {
      obj.mainMaterial.emissiveIntensity = 0;
    }
  }

  /**
   * Actualizar animaciones de vapor y brillo pulsante
   * @param {number} delta
   */
  function update(delta) {
    glowTimer += delta;

    for (let i = 0; i < objectsList.length; i++) {
      const obj = objectsList[i];

      // Pulso suave de brillo si aún no ha sido tocado
      if (!obj.isTouched) {
        const pulse = 0.4 + Math.sin(glowTimer * 3.0 + i) * 0.22;
        obj.glowLight.intensity = pulse;
        if (obj.mainMaterial) {
          obj.mainMaterial.emissiveIntensity = pulse * 0.6;
        }
      }

      // Animación de partículas de vapor si es taza
      if (obj.steamParticles.length > 0) {
        obj.steamParticles.forEach((sp) => {
          sp.position.y += sp.userData.speed * delta;
          sp.position.x += Math.sin(glowTimer * 2.0 + sp.userData.phase) * 0.003;
          // Reiniciar ciclo de elevación
          if (sp.position.y > 0.4) {
            sp.position.y = sp.userData.baseY;
          }
        });
      }
    }
  }

  /**
   * Limpiar objetos actuales
   */
  function clearObjects() {
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }
    objectsList = [];
  }

  /**
   * Mostrar u ocultar el grupo
   * @param {boolean} visible
   */
  function setVisible(visible) {
    group.visible = visible;
  }

  /**
   * Obtener todos los meshes detectables por Raycaster
   * @returns {Array<THREE.Mesh>}
   */
  function getInteractiveMeshes() {
    const meshes = [];
    objectsList.forEach((obj) => {
      meshes.push(...obj.interactiveMeshes);
    });
    return meshes;
  }

  return {
    group,
    spawnForCycle,
    markTouched,
    update,
    setVisible,
    getInteractiveMeshes,
    getObjects: () => objectsList
  };
}
