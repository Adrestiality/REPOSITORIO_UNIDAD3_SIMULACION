import * as THREE from 'three';
import {
  state,
  getHour,
  setGardenName,
  getGardenName,
  getGardenGrid,
  getPlantCount,
  addPlantToGrid,
  movePlantInGrid,
  removePlantFromGrid,
  addFlowerToPlantInGrid
} from '../state.js';
import { gardenTexts } from '../data/gardenData.js';
import { getRandomGardenDoubt } from '../data/dialogues.js';
import { setMusicTheme, playClick } from '../audio/audio.js';
import { showThought, canShowThought, registerModalBlocker } from '../ui/dialogs.js';

/**
 * Editor del Jardín 5x5 - "Nadie lo verá completo"
 * Módulo 5:
 * 1) Vista ortográfica isométrica solo del jardín.
 * 2) Mover con clic y arrastre, quitar planta (>1 planta), botón "Crear otra maceta", límite 25.
 * 3) Voz del jardinero y pensamientos con la hora.
 * 4) Nombramiento con 3 cuadros de cuestionamiento insistente.
 * 5) Salida a cafetería nocturna, applyChange y renderMiniature.
 */

const GRID_SIZE = 5;
const CELL_SIZE = 0.65;
const FRUSTUM_SIZE = 5.4;

// Materiales reutilizables del editor
const soilMat = new THREE.MeshStandardMaterial({
  color: 0x3e352f, // Tierra oscura
  roughness: 0.95
});

const borderMat = new THREE.MeshStandardMaterial({
  color: 0x7a6958, // Borde de madera/terracota
  roughness: 0.8
});

const bushMatA = new THREE.MeshStandardMaterial({
  color: 0x6e7b64, // Verde militar pastel
  roughness: 0.85
});

const bushMatB = new THREE.MeshStandardMaterial({
  color: 0x5d6b54, // Verde militar alternativo
  roughness: 0.85
});

const potMat = new THREE.MeshStandardMaterial({
  color: 0xbf967e, // Terracota pastel
  roughness: 0.8
});

const stemMat = new THREE.MeshStandardMaterial({
  color: 0x556b4f,
  roughness: 0.7
});

export function createGardenEditor({ renderer, potEditor, onExit, onGardenUpdated }) {
  // 1. Escena propia con fondo neutro pastel
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf1ece5);

  // Cámara ortográfica isométrica
  const aspect = window.innerWidth / window.innerHeight;
  const camera = new THREE.OrthographicCamera(
    (-FRUSTUM_SIZE * aspect) / 2,
    (FRUSTUM_SIZE * aspect) / 2,
    FRUSTUM_SIZE / 2,
    -FRUSTUM_SIZE / 2,
    0.1,
    100
  );

  // Posición isométrica clásica (igual ángulo en ejes)
  const isoDist = 12;
  camera.position.set(isoDist, isoDist * 1.15, isoDist);
  camera.lookAt(0, 0.25, 0);

  // Iluminación de estudio
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.25);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xfff6ec, 1.35);
  mainLight.position.set(6, 12, 6);
  mainLight.castShadow = true;
  mainLight.shadow.mapSize.width = 1024;
  mainLight.shadow.mapSize.height = 1024;
  scene.add(mainLight);

  const fillLight = new THREE.DirectionalLight(0xdbe7ff, 0.55);
  fillLight.position.set(-6, 8, -6);
  scene.add(fillLight);

  // --- 2. Jardín Base 5x5 y Malla de Celdas ---
  const gardenGroup = new THREE.Group();
  scene.add(gardenGroup);

  // Macetón / jardinera
  const planterW = GRID_SIZE * CELL_SIZE + 0.35;
  const planterBorderGeo = new THREE.BoxGeometry(planterW, 0.22, planterW);
  const planterBorder = new THREE.Mesh(planterBorderGeo, borderMat);
  planterBorder.position.y = 0.11;
  planterBorder.receiveShadow = true;
  gardenGroup.add(planterBorder);

  // Sustrato / Tierra
  const soilW = GRID_SIZE * CELL_SIZE + 0.12;
  const soilMesh = new THREE.Mesh(new THREE.BoxGeometry(soilW, 0.1, soilW), soilMat);
  soilMesh.position.y = 0.18;
  soilMesh.receiveShadow = true;
  gardenGroup.add(soilMesh);

  // Plano invisible horizontal para raycasting de arrastre a nivel del suelo
  const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.23);

  // Grupo contenedor de visuales de celdas (tiles de suelo)
  const cellTiles = [];
  const cellTilesGroup = new THREE.Group();
  gardenGroup.add(cellTilesGroup);

  const defaultTileMat = new THREE.MeshStandardMaterial({
    color: 0x473d36,
    roughness: 0.9,
    transparent: true,
    opacity: 0.55
  });

  const validHoverMat = new THREE.MeshStandardMaterial({
    color: 0x98c379,
    roughness: 0.7,
    transparent: true,
    opacity: 0.75
  });

  const invalidHoverMat = new THREE.MeshStandardMaterial({
    color: 0xe06c75,
    roughness: 0.7,
    transparent: true,
    opacity: 0.75
  });

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const x = (c - 2) * CELL_SIZE;
      const z = (r - 2) * CELL_SIZE;

      const tileMesh = new THREE.Mesh(
        new THREE.BoxGeometry(CELL_SIZE - 0.04, 0.02, CELL_SIZE - 0.04),
        defaultTileMat.clone()
      );
      tileMesh.position.set(x, 0.231, z);
      tileMesh.receiveShadow = true;
      tileMesh.userData = { row: r, col: c };
      cellTilesGroup.add(tileMesh);
      cellTiles.push(tileMesh);
    }
  }

  // Grupo contenedor de mallas 3D de plantas
  const plantsGroup = new THREE.Group();
  plantsGroup.name = 'editor_plants';
  gardenGroup.add(plantsGroup);

  const plantMeshes = []; // Lista para raycasting

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
   * Reconstruir las mallas 3D de las plantas a partir de state.gardenGrid
   * Cada planta contiene exclusivamente sus voxels y sus flores elegidas.
   */
  function rebuildPlantsMeshes() {
    // Limpiar anteriores y liberar memoria (dispose)
    while (plantsGroup.children.length > 0) {
      const child = plantsGroup.children[0];
      disposeHierarchy(child);
      plantsGroup.remove(child);
    }
    plantMeshes.length = 0;

    const grid = getGardenGrid();
    grid.forEach((plant, idx) => {
      if (!plant) return;
      const r = plant.row !== undefined ? plant.row : Math.floor(idx / 5);
      const c = plant.col !== undefined ? plant.col : idx % 5;
      const x = (c - 2) * CELL_SIZE;
      const z = (r - 2) * CELL_SIZE;

      const plantContainer = new THREE.Group();
      plantContainer.position.set(x, 0.23, z);
      plantContainer.userData = { isPlant: true, plant, row: r, col: c };

      if (plant.type === 'pot') {
        const POT_SCALE = 0.20;
        const VOXEL_SIZE = 0.155;

        // Maceta cilíndrica de terracota
        const base = new THREE.Mesh(
          new THREE.CylinderGeometry(0.18, 0.13, 0.14, 20),
          potMat
        );
        base.position.y = 0.07;
        base.castShadow = true;
        base.receiveShadow = true;
        base.userData = { parentGroup: plantContainer };
        plantContainer.add(base);

        const rim = new THREE.Mesh(
          new THREE.CylinderGeometry(0.195, 0.195, 0.024, 20),
          potMat
        );
        rim.position.y = 0.14;
        rim.castShadow = true;
        rim.userData = { parentGroup: plantContainer };
        plantContainer.add(rim);

        // Etiqueta estilizada en el frente de la maceta
        if (plant.etiqueta) {
          const tag = new THREE.Mesh(
            new THREE.BoxGeometry(0.12, 0.05, 0.01),
            new THREE.MeshStandardMaterial({ color: 0xfbf6ee, roughness: 0.5 })
          );
          tag.position.set(0, 0.07, 0.145);
          tag.userData = { parentGroup: plantContainer };
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
            const vMat = plant.alt ? bushMatB : bushMatA;
            const instMesh = new THREE.InstancedMesh(vGeo, vMat, activeIndices.length);
            instMesh.castShadow = true;
            instMesh.receiveShadow = true;
            instMesh.userData = { parentGroup: plantContainer };

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
              plant.alt ? bushMatB : bushMatA
            );
            foliage.position.y = 0.28;
            foliage.castShadow = true;
            foliage.userData = { parentGroup: plantContainer };
            plantContainer.add(foliage);
          }
        } else {
          // Follaje esférico estándar de respaldo
          const foliage = new THREE.Mesh(
            new THREE.SphereGeometry(0.20, 12, 10),
            plant.alt ? bushMatB : bushMatA
          );
          foliage.position.y = 0.28;
          foliage.scale.set(1.0, 0.88, 0.95);
          foliage.castShadow = true;
          foliage.userData = { parentGroup: plantContainer };
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
        // Arbusto inicial estilizado
        const bMat = plant.alt ? bushMatB : bushMatA;
        const scale = plant.scale || 0.44;

        const mainSphere = new THREE.Mesh(
          new THREE.SphereGeometry(scale * 0.72, 14, 12),
          bMat
        );
        mainSphere.position.set(0, scale * 0.62, 0);
        mainSphere.scale.set(1.0, 0.9, 0.95);
        mainSphere.castShadow = true;
        mainSphere.userData = { parentGroup: plantContainer };
        plantContainer.add(mainSphere);

        const subSphere = new THREE.Mesh(
          new THREE.SphereGeometry(scale * 0.48, 10, 8),
          bMat
        );
        subSphere.position.set(
          scale * ((r + c) % 2 === 0 ? 0.28 : -0.28),
          scale * 0.52,
          scale * 0.2
        );
        subSphere.castShadow = true;
        subSphere.userData = { parentGroup: plantContainer };
        plantContainer.add(subSphere);

        // Flores en el arbusto inicial
        if (plant.flores && plant.flores.length > 0) {
          plant.flores.forEach((f, fIdx) => {
            const flowerGroup = new THREE.Group();
            const fHeight = f.height || 0.40;
            const offsetX = (fIdx - (plant.flores.length - 1) / 2) * 0.11;
            flowerGroup.position.set(offsetX, 0, fIdx % 2 === 0 ? 0.07 : -0.07);

            const stem = new THREE.Mesh(
              new THREE.CylinderGeometry(0.014, 0.014, fHeight),
              stemMat
            );
            stem.position.set(0, fHeight / 2, 0);
            stem.castShadow = true;
            flowerGroup.add(stem);

            const fColor = f.color !== undefined ? f.color : (f.colorHex !== undefined ? f.colorHex : 0xffb703);
            const blossom = new THREE.Mesh(
              new THREE.DodecahedronGeometry(0.06, 0),
              new THREE.MeshStandardMaterial({ color: fColor, roughness: 0.4 })
            );
            blossom.position.set(0, fHeight, 0);
            blossom.castShadow = true;
            flowerGroup.add(blossom);

            const center = new THREE.Mesh(
              new THREE.SphereGeometry(0.024, 8, 8),
              new THREE.MeshBasicMaterial({ color: 0xffffff })
            );
            center.position.set(0, fHeight + 0.02, 0);
            flowerGroup.add(center);

            plantContainer.add(flowerGroup);
          });
        }
      }

      plantsGroup.add(plantContainer);
      plantMeshes.push(plantContainer);
    });
  }

  // --- 3. Interfaz de Usuario HTML del Editor ---
  const domContainer = document.createElement('div');
  domContainer.id = 'garden-editor-ui';
  domContainer.className = 'garden-editor-root hidden';
  document.body.appendChild(domContainer);

  domContainer.innerHTML = `
    <!-- Barra superior -->
    <header class="ge-header">
      <div class="ge-header-left">
        <span class="ge-badge">${gardenTexts.badge}</span>
        <h1 class="ge-title">${gardenTexts.title}</h1>
        <span class="ge-clock-tag" id="ge-clock-tag">Hora: --:--</span>
      </div>
      <div class="ge-header-right">
        <button class="ge-btn-secondary" id="ge-btn-create-pot">${gardenTexts.btnCreateAnother}</button>
        <button class="ge-btn-primary" id="ge-btn-finish">${gardenTexts.btnFinish}</button>
      </div>
    </header>

    <!-- Notificación emergente de la voz interior del jardinero -->
    <div class="ge-doubt-banner" id="ge-doubt-banner">
      <div class="ge-doubt-icon">🌱</div>
      <div class="ge-doubt-content">
        <span class="ge-doubt-speaker">Voz interior</span>
        <p class="ge-doubt-text" id="ge-doubt-text">Aún no es perfecto...</p>
      </div>
    </div>

    <!-- Menú contextual para clic derecho o botón Quitar -->
    <div class="ge-context-menu hidden" id="ge-context-menu">
      <div class="ge-context-title" id="ge-context-title">Planta</div>
      <button class="ge-context-btn-remove" id="ge-context-btn-remove">${gardenTexts.btnRemove}</button>
      <button class="ge-context-btn-cancel" id="ge-context-btn-cancel">${gardenTexts.btnCancel}</button>
    </div>

    <!-- Alerta de advertencia rápida (Toast) -->
    <div class="ge-toast hidden" id="ge-toast">
      <span class="ge-toast-icon">⚠️</span>
      <span class="ge-toast-text" id="ge-toast-text"></span>
    </div>

    <!-- Modal de Nombramiento del Jardín (Paso 4) -->
    <div class="ge-modal-backdrop hidden" id="ge-naming-modal">
      <div class="ge-modal-card">
        <div id="ge-naming-step-input">
          <h2 class="ge-modal-title">${gardenTexts.namingTitle}</h2>
          <p class="ge-modal-desc">${gardenTexts.namingPrompt}</p>
          <input type="text" class="ge-input-name" id="ge-input-garden-name" maxlength="45" placeholder="${gardenTexts.namingPlaceholder}" />
          <div class="ge-modal-actions">
            <button class="ge-btn-secondary" id="ge-btn-cancel-naming">${gardenTexts.btnCancel}</button>
            <button class="ge-btn-primary" id="ge-btn-submit-name">${gardenTexts.btnContinue}</button>
          </div>
        </div>

        <!-- Pregunta 1 -->
        <div class="ge-question-step hidden" id="ge-step-q1">
          <span class="ge-question-num">Duda 1 de 3</span>
          <h3 class="ge-question-title">${gardenTexts.question1}</h3>
          <p class="ge-question-preview" id="ge-name-preview-1"></p>
          <div class="ge-modal-actions">
            <button class="ge-btn-secondary" id="ge-btn-reconsider-1">${gardenTexts.btnReconsider}</button>
            <button class="ge-btn-primary" id="ge-btn-confirm-1">${gardenTexts.btnConfirm}</button>
          </div>
        </div>

        <!-- Pregunta 2 -->
        <div class="ge-question-step hidden" id="ge-step-q2">
          <span class="ge-question-num">Duda 2 de 3</span>
          <h3 class="ge-question-title">${gardenTexts.question2}</h3>
          <p class="ge-question-preview" id="ge-name-preview-2"></p>
          <div class="ge-modal-actions">
            <button class="ge-btn-secondary" id="ge-btn-reconsider-2">${gardenTexts.btnReconsider}</button>
            <button class="ge-btn-primary" id="ge-btn-confirm-2">${gardenTexts.btnConfirm}</button>
          </div>
        </div>

        <!-- Pregunta 3 -->
        <div class="ge-question-step hidden" id="ge-step-q3">
          <span class="ge-question-num">Duda 3 de 3</span>
          <h3 class="ge-question-title" id="ge-q3-title"></h3>
          <p class="ge-question-preview" id="ge-name-preview-3"></p>
          <div class="ge-modal-actions">
            <button class="ge-btn-secondary" id="ge-btn-reconsider-3">${gardenTexts.btnEditName}</button>
            <button class="ge-btn-primary" id="ge-btn-confirm-3">${gardenTexts.btnKeepName}</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Referencias a elementos DOM
  const clockTag = domContainer.querySelector('#ge-clock-tag');
  const btnCreatePot = domContainer.querySelector('#ge-btn-create-pot');
  const btnFinish = domContainer.querySelector('#ge-btn-finish');
  const doubtBanner = domContainer.querySelector('#ge-doubt-banner');
  const doubtText = domContainer.querySelector('#ge-doubt-text');
  const contextMenu = domContainer.querySelector('#ge-context-menu');
  const contextTitle = domContainer.querySelector('#ge-context-title');
  const contextBtnRemove = domContainer.querySelector('#ge-context-btn-remove');
  const contextBtnCancel = domContainer.querySelector('#ge-context-btn-cancel');
  const toastElem = domContainer.querySelector('#ge-toast');
  const toastText = domContainer.querySelector('#ge-toast-text');

  // Elementos del modal de nombramiento
  const namingModal = domContainer.querySelector('#ge-naming-modal');
  const stepInput = domContainer.querySelector('#ge-naming-step-input');
  const inputGardenName = domContainer.querySelector('#ge-input-garden-name');
  const btnCancelNaming = domContainer.querySelector('#ge-btn-cancel-naming');
  const btnSubmitName = domContainer.querySelector('#ge-btn-submit-name');

  const stepQ1 = domContainer.querySelector('#ge-step-q1');
  const preview1 = domContainer.querySelector('#ge-name-preview-1');
  const btnReconsider1 = domContainer.querySelector('#ge-btn-reconsider-1');
  const btnConfirm1 = domContainer.querySelector('#ge-btn-confirm-1');

  const stepQ2 = domContainer.querySelector('#ge-step-q2');
  const preview2 = domContainer.querySelector('#ge-name-preview-2');
  const btnReconsider2 = domContainer.querySelector('#ge-btn-reconsider-2');
  const btnConfirm2 = domContainer.querySelector('#ge-btn-confirm-2');

  const stepQ3 = domContainer.querySelector('#ge-step-q3');
  const q3Title = domContainer.querySelector('#ge-q3-title');
  const preview3 = domContainer.querySelector('#ge-name-preview-3');
  const btnReconsider3 = domContainer.querySelector('#ge-btn-reconsider-3');
  const btnConfirm3 = domContainer.querySelector('#ge-btn-confirm-3');

  let toastTimer = null;
  function showToast(message) {
    if (toastTimer) clearTimeout(toastTimer);
    toastText.textContent = message;
    toastElem.classList.remove('hidden');
    toastTimer = setTimeout(() => {
      toastElem.classList.add('hidden');
    }, 3200);
  }

  // Dudas periódicas del jardinero (ritmo de 4 a 6 segundos en editores)
  let doubtTimer = 0;
  let nextDoubtInterval = 4.0 + Math.random() * 2.0;
  let lastDoubtId = null;

  // Registrar bloqueador para no mostrar pensamientos mientras el modal de nombramiento esté visible
  registerModalBlocker(() => {
    return isActive && namingModal && !namingModal.classList.contains('hidden');
  });

  function triggerDoubt() {
    if (!isActive) return;
    if (namingModal && !namingModal.classList.contains('hidden')) return;
    if (!canShowThought()) return;

    const doubt = getRandomGardenDoubt(lastDoubtId, getHour());
    lastDoubtId = doubt.id;
    doubtText.textContent = doubt.text;
    doubtBanner.classList.add('active');

    // Mostrar en el sistema de pensamientos arriba en pantalla con voz
    showThought(doubt.text, null, true);
  }

  // --- 4. Interacción con Raycasting: Arrastre y Clic Derecho ---
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  let isDragging = false;
  let draggedPlantGroup = null;
  let dragOriginCell = null;
  let currentHoveredTile = null;
  let selectedPlantForMenu = null;

  function getIntersectedPlant(e) {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(plantsGroup.children, true);
    if (intersects.length > 0) {
      let obj = intersects[0].object;
      while (obj && !obj.userData.isPlant && obj.parent) {
        if (obj.userData.parentGroup) {
          obj = obj.userData.parentGroup;
          break;
        }
        obj = obj.parent;
      }
      if (obj && obj.userData.isPlant) {
        return obj;
      }
    }
    return null;
  }

  function getGridCellFromPoint(point) {
    const col = Math.round(point.x / CELL_SIZE) + 2;
    const row = Math.round(point.z / CELL_SIZE) + 2;
    if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
      return { row, col };
    }
    return null;
  }

  function clearTileHighlights() {
    cellTiles.forEach((tile) => {
      tile.material = defaultTileMat;
    });
    currentHoveredTile = null;
  }

  function updateTileHighlight(cell) {
    if (!cell) {
      clearTileHighlights();
      return;
    }
    const idx = cell.row * GRID_SIZE + cell.col;
    const tile = cellTiles[idx];
    if (tile !== currentHoveredTile) {
      clearTileHighlights();
      currentHoveredTile = tile;
      if (tile) {
        const grid = getGardenGrid();
        const isFree =
          grid[idx] === null ||
          (dragOriginCell && dragOriginCell.row === cell.row && dragOriginCell.col === cell.col);
        tile.material = isFree ? validHoverMat : invalidHoverMat;
      }
    }
  }

  function hideContextMenu() {
    contextMenu.classList.add('hidden');
    selectedPlantForMenu = null;
  }

  function openContextMenu(clientX, clientY, plantGroup) {
    selectedPlantForMenu = plantGroup;
    const plant = plantGroup.userData.plant;
    contextTitle.textContent = plant.etiqueta ? `"${plant.etiqueta}"` : plant.name || 'Planta';

    // Ajustar posición para no desbordar
    const x = Math.min(clientX + 10, window.innerWidth - 180);
    const y = Math.min(clientY + 10, window.innerHeight - 120);
    contextMenu.style.left = `${x}px`;
    contextMenu.style.top = `${y}px`;
    contextMenu.classList.remove('hidden');
  }

  // Controladores de eventos del mouse
  function onPointerDown(e) {
    if (!isActive) return;
    if (e.target.closest('#ge-context-menu') || e.target.closest('.ge-modal-card')) return;
    hideContextMenu();

    if (e.button === 0) {
      // Clic izquierdo: arrastrar planta
      const plantGroup = getIntersectedPlant(e);
      if (plantGroup) {
        isDragging = true;
        draggedPlantGroup = plantGroup;
        dragOriginCell = {
          row: plantGroup.userData.row,
          col: plantGroup.userData.col
        };
        // Levantar la planta para retroalimentación visual táctil
        draggedPlantGroup.position.y = 0.55;
        draggedPlantGroup.scale.set(1.08, 1.08, 1.08);
      }
    } else if (e.button === 2) {
      // Clic derecho: menú quitar
      e.preventDefault();
      const plantGroup = getIntersectedPlant(e);
      if (plantGroup) {
        openContextMenu(e.clientX, e.clientY, plantGroup);
      }
    }
  }

  function onPointerMove(e) {
    if (!isActive) return;

    if (isDragging && draggedPlantGroup) {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const intersectionPoint = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(dragPlane, intersectionPoint)) {
        draggedPlantGroup.position.x = intersectionPoint.x;
        draggedPlantGroup.position.z = intersectionPoint.z;

        const cell = getGridCellFromPoint(intersectionPoint);
        updateTileHighlight(cell);
      }
    }
  }

  function onPointerUp(e) {
    if (!isActive) return;

    if (isDragging && draggedPlantGroup) {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const intersectionPoint = new THREE.Vector3();
      let droppedSuccessfully = false;

      if (raycaster.ray.intersectPlane(dragPlane, intersectionPoint)) {
        const targetCell = getGridCellFromPoint(intersectionPoint);
        if (targetCell) {
          const fromR = dragOriginCell.row;
          const fromC = dragOriginCell.col;
          const toR = targetCell.row;
          const toC = targetCell.col;

          if (fromR === toR && fromC === toC) {
            // Mismo casillero, volver a colocar
            droppedSuccessfully = true;
          } else {
            // Mover en el estado
            const moved = movePlantInGrid(fromR, fromC, toR, toC);
            if (moved) {
              droppedSuccessfully = true;
              draggedPlantGroup.userData.row = toR;
              draggedPlantGroup.userData.col = toC;
              showToast(gardenTexts.alerts.plantMoved);
              triggerDoubt();
              if (onGardenUpdated) onGardenUpdated();
            } else {
              showToast(gardenTexts.alerts.cellOccupied);
            }
          }
        }
      }

      // Restaurar posición y escala
      draggedPlantGroup.scale.set(1.0, 1.0, 1.0);
      draggedPlantGroup.position.y = 0.23;

      const finalR = draggedPlantGroup.userData.row;
      const finalC = draggedPlantGroup.userData.col;
      draggedPlantGroup.position.x = (finalC - 2) * CELL_SIZE;
      draggedPlantGroup.position.z = (finalR - 2) * CELL_SIZE;

      clearTileHighlights();
      isDragging = false;
      draggedPlantGroup = null;
      dragOriginCell = null;
    }
  }

  function onContextMenu(e) {
    if (isActive) {
      e.preventDefault();
    }
  }

  window.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('contextmenu', onContextMenu);
  window.addEventListener('resize', () => {
    if (isActive) {
      updateCameraAspect();
    }
  });

  // --- 5. Botones y Flujos del Editor ---

  // Quitar planta seleccionada (clic derecho o botón de menú)
  contextBtnRemove.addEventListener('click', () => {
    if (!selectedPlantForMenu) return;
    const { row, col } = selectedPlantForMenu.userData;

    // Regla: El jardín nunca puede quedar vacío (>1 planta)
    if (getPlantCount() <= 1) {
      showToast(gardenTexts.alerts.cannotEmpty);
      triggerDoubt();
      hideContextMenu();
      return;
    }

    const removed = removePlantFromGrid(row, col);
    if (removed) {
      showToast(gardenTexts.alerts.plantRemoved);
      rebuildPlantsMeshes();
      triggerDoubt();
      if (onGardenUpdated) onGardenUpdated();
    } else {
      showToast(gardenTexts.alerts.cannotEmpty);
    }
    hideContextMenu();
  });

  contextBtnCancel.addEventListener('click', hideContextMenu);

  // Botón "Crear otra maceta" (vuelve al Módulo 4)
  btnCreatePot.addEventListener('click', () => {
    if (getPlantCount() >= 25) {
      showToast(gardenTexts.alerts.gridFull);
      triggerDoubt();
      return;
    }
    // Cerrar temporalmente este editor y abrir potEditor
    close(false);
    if (potEditor) {
      potEditor.open();
    }
  });

  // Botón "Finalizar arreglo": Abre el modal de nombramiento con los 3 pasos de duda
  let pendingGardenName = '';

  btnFinish.addEventListener('click', () => {
    pendingGardenName = getGardenName() || gardenTexts.defaultGardenName;
    inputGardenName.value = pendingGardenName;

    // Mostrar modal con paso 1 (input)
    showNamingStep('input');
    namingModal.classList.remove('hidden');
  });

  function showNamingStep(step) {
    stepInput.classList.add('hidden');
    stepQ1.classList.add('hidden');
    stepQ2.classList.add('hidden');
    stepQ3.classList.add('hidden');

    if (step === 'input') {
      stepInput.classList.remove('hidden');
      setTimeout(() => inputGardenName.focus(), 80);
    } else if (step === 'q1') {
      preview1.textContent = `"${pendingGardenName}"`;
      stepQ1.classList.remove('hidden');
    } else if (step === 'q2') {
      preview2.textContent = `"${pendingGardenName}"`;
      stepQ2.classList.remove('hidden');
    } else if (step === 'q3') {
      q3Title.textContent = gardenTexts.question3(getHour());
      preview3.textContent = `"${pendingGardenName}"`;
      stepQ3.classList.remove('hidden');
    }
  }

  // Cancelar nombramiento y volver al editor
  btnCancelNaming.addEventListener('click', () => {
    namingModal.classList.add('hidden');
  });

  // Paso 1 -> Pregunta 1
  btnSubmitName.addEventListener('click', () => {
    const val = inputGardenName.value.trim();
    pendingGardenName = val || gardenTexts.defaultGardenName;
    showNamingStep('q1');
  });

  // Pregunta 1: "¿Seguro que ese es el nombre?"
  btnReconsider1.addEventListener('click', () => showNamingStep('input'));
  btnConfirm1.addEventListener('click', () => showNamingStep('q2'));

  // Pregunta 2: "¿Suena demasiado simple?"
  btnReconsider2.addEventListener('click', () => showNamingStep('input'));
  btnConfirm2.addEventListener('click', () => showNamingStep('q3'));

  // Pregunta 3: "Son las [HORA]. Todavía hay tiempo de cambiarlo."
  btnReconsider3.addEventListener('click', () => showNamingStep('input'));
  btnConfirm3.addEventListener('click', () => {
    // Guardar nombre definitivo
    setGardenName(pendingGardenName);
    namingModal.classList.add('hidden');

    // Cerrar editor y volver a la cafetería
    close(true);
  });

  // --- 6. Métodos de Control del Editor ---
  let isActive = false;

  function open(options = {}) {
    isActive = true;
    domContainer.classList.remove('hidden');
    setMusicTheme('jardin');
    clockTag.textContent = `Hora: ${getHour()}`;

    // Si viene con una nueva maceta terminada de potEditor ('potCreated'), sumarla a la cuadrícula
    if (options.newPot) {
      if (getPlantCount() >= 25) {
        showToast(gardenTexts.alerts.gridFull);
      } else {
        const added = addPlantToGrid({
          id: options.newPot.id || `pot_${Date.now()}`,
          type: 'pot',
          etiqueta: options.newPot.etiqueta,
          color: options.newPot.color || 0x6e7b64,
          flores: options.newPot.flores ? [...options.newPot.flores] : [],
          voxelGrid: options.newPot.voxelGrid ? [...options.newPot.voxelGrid] : null,
          esAutomatica: options.newPot.esAutomatica || false
        });
        if (added) {
          showToast(`Nueva maceta "${options.newPot.etiqueta || 'sin etiqueta'}" añadida al jardín.`);
        }
      }
    }

    rebuildPlantsMeshes();
    doubtTimer = 2.0;
    nextDoubtInterval = 4.0 + Math.random() * 2.0;
    triggerDoubt();

    // Actualizar proyección ortográfica al tamaño actual de la pantalla
    updateCameraAspect();
  }

  function close(triggerExit = true) {
    isActive = false;
    domContainer.classList.add('hidden');
    hideContextMenu();
    namingModal.classList.add('hidden');
    setMusicTheme(state.fase === 'dia' ? 'dia' : 'noche');

    // Limpiar geometrías al cambiar de pantalla
    while (plantsGroup.children.length > 0) {
      const child = plantsGroup.children[0];
      disposeHierarchy(child);
      plantsGroup.remove(child);
    }
    plantMeshes.length = 0;

    if (triggerExit && onExit) {
      onExit();
    }
  }

  function updateCameraAspect() {
    const asp = window.innerWidth / window.innerHeight;
    camera.left = (-FRUSTUM_SIZE * asp) / 2;
    camera.right = (FRUSTUM_SIZE * asp) / 2;
    camera.top = FRUSTUM_SIZE / 2;
    camera.bottom = -FRUSTUM_SIZE / 2;
    camera.updateProjectionMatrix();
  }

  function update(delta) {
    if (!isActive) return;

    clockTag.textContent = `Hora: ${getHour()}`;

    // Temporizador de dudas espontáneas cada 4 a 6 segundos (uno a la vez)
    doubtTimer += delta;
    if (doubtTimer >= nextDoubtInterval) {
      doubtTimer = 0;
      nextDoubtInterval = 4.0 + Math.random() * 2.0;
      triggerDoubt();
    }
  }

  function render() {
    if (!isActive) return;
    renderer.render(scene, camera);
  }

  return {
    open,
    close,
    update,
    render,
    isActive: () => isActive,
    rebuildPlantsMeshes,
    getScene: () => scene,
    getCamera: () => camera
  };
}

// =======================================================================
// CAMBIOS EJECUTABLES (Módulo 6): 'mover', 'quitar', 'flores', 'renombrar'
// =======================================================================

/**
 * Aplica uno de los 4 cambios automáticos requeridos
 * @param {'mover' | 'quitar' | 'flores' | 'renombrar'} tipo
 * @param {object|string} datos
 * @returns {boolean} éxito del cambio
 */
export function applyChange(tipo, datos) {
  let success = false;

  switch (tipo) {
    case 'mover': {
      // Formato flexible: { from: { row, col }, to: { row, col } } o { fromRow, fromCol, toRow, toCol } o { plantId, to }
      let fRow = datos.from ? datos.from.row : datos.fromRow;
      let fCol = datos.from ? datos.from.col : datos.fromCol;
      let tRow = datos.to ? datos.to.row : datos.toRow;
      let tCol = datos.to ? datos.to.col : datos.toCol;

      if ((fRow === undefined || fCol === undefined) && datos.plantId) {
        const grid = getGardenGrid();
        const pIdx = grid.findIndex((p) => p && p.id === datos.plantId);
        if (pIdx !== -1) {
          fRow = Math.floor(pIdx / 5);
          fCol = pIdx % 5;
        }
      }

      if (fRow !== undefined && fCol !== undefined && tRow !== undefined && tCol !== undefined) {
        success = movePlantInGrid(fRow, fCol, tRow, tCol);
      }
      break;
    }

    case 'quitar': {
      // Formato: { row, col } o { plantId } o { id }
      let row = datos.row;
      let col = datos.col;
      const pid = datos.plantId || datos.id;

      if ((row === undefined || col === undefined) && pid) {
        const grid = getGardenGrid();
        const pIdx = grid.findIndex((p) => p && p.id === pid);
        if (pIdx !== -1) {
          row = Math.floor(pIdx / 5);
          col = pIdx % 5;
        }
      }

      if (row !== undefined && col !== undefined) {
        success = removePlantFromGrid(row, col);
      }
      break;
    }

    case 'flores': {
      // Formato: { row, col, color } o { plantId, color }
      let row = datos.row;
      let col = datos.col;
      const color = datos.color || datos.flowerColor || 0xffb703;
      const pid = datos.plantId || datos.id;

      if ((row === undefined || col === undefined) && pid) {
        const grid = getGardenGrid();
        const pIdx = grid.findIndex((p) => p && p.id === pid);
        if (pIdx !== -1) {
          row = Math.floor(pIdx / 5);
          col = pIdx % 5;
        }
      }

      if (row !== undefined && col !== undefined) {
        success = addFlowerToPlantInGrid(row, col, color);
      }
      break;
    }

    case 'renombrar': {
      // Formato: { nombre: '...' } o { name: '...' } o '...' (string)
      const nuevoNombre = typeof datos === 'string' ? datos : datos.nombre || datos.name;
      if (nuevoNombre) {
        setGardenName(nuevoNombre);
        success = true;
      }
      break;
    }

    default:
      console.warn(`applyChange: tipo de cambio desconocido "${tipo}".`);
      return false;
  }

  if (success) {
    console.log(`%c 🌿 applyChange ejecutado con éxito: [${tipo}]`, 'color: #98c379; font-weight: bold;', datos);
  } else {
    console.warn(`%c ⚠️ applyChange falló o no fue válido: [${tipo}]`, 'color: #e06c75;', datos);
  }

  return success;
}

// =======================================================================
// RENDERIZADOR DE MINIATURA (Módulo 6): renderMiniature(estadoJardin)
// =======================================================================

/**
 * Devuelve una imagen pequeña en base64 (Data URL) de la cuadrícula tras aplicar un cambio
 * @param {Array<object|null>} [estadoJardin] - Cuadrícula opcional; usa la actual si no se provee
 * @returns {string} Data URL de la miniatura en formato PNG
 */
export function renderMiniature(estadoJardin) {
  const grid = estadoJardin || getGardenGrid();
  const canvas = document.createElement('canvas');
  canvas.width = 160;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');

  // Fondo del macetón
  ctx.fillStyle = '#7a6958'; // Marco de madera
  ctx.fillRect(0, 0, 160, 160);

  ctx.fillStyle = '#3a3128'; // Tierra interior
  ctx.fillRect(8, 8, 144, 144);

  const cellSize = 144 / 5; // 28.8px

  // Dibujar las 25 celdas y sus plantas
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const x = 8 + c * cellSize;
      const y = 8 + r * cellSize;
      const idx = r * 5 + c;
      const plant = grid[idx];

      // Borde de la celda
      ctx.strokeStyle = '#4e433a';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 1, y + 1, cellSize - 2, cellSize - 2);

      if (plant) {
        const cx = x + cellSize / 2;
        const cy = y + cellSize / 2;
        const radius = cellSize * 0.38;

        if (plant.type === 'pot') {
          // Base de maceta terracota
          ctx.fillStyle = '#bf967e';
          ctx.beginPath();
          ctx.arc(cx, cy + 2, radius * 0.85, 0, Math.PI * 2);
          ctx.fill();

          // Follaje central
          ctx.fillStyle = plant.alt ? '#5d6b54' : '#6e7b64';
          ctx.beginPath();
          ctx.arc(cx, cy - 2, radius * 0.75, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Arbusto esférico verde militar pastel
          ctx.fillStyle = plant.alt ? '#5d6b54' : '#6e7b64';
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.fill();

          // Lóbulo orgánico
          ctx.fillStyle = plant.alt ? '#505d48' : '#5f6c56';
          ctx.beginPath();
          ctx.arc(cx + radius * 0.3, cy - radius * 0.2, radius * 0.55, 0, Math.PI * 2);
          ctx.fill();
        }

        // Flores vívidas si tiene
        if (plant.flores && plant.flores.length > 0) {
          plant.flores.forEach((f, fIdx) => {
            const rawCol = f.color !== undefined ? f.color : f.colorHex;
            const fColor =
              typeof rawCol === 'number'
                ? `#${rawCol.toString(16).padStart(6, '0')}`
                : rawCol || '#ffb703';

            const fx = cx + (fIdx - (plant.flores.length - 1) / 2) * 5;
            const fy = cy + (fIdx % 2 === 0 ? -3 : 3);

            ctx.fillStyle = fColor;
            ctx.beginPath();
            ctx.arc(fx, fy, 2.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(fx, fy, 0.8, 0, Math.PI * 2);
            ctx.fill();
          });
        }
      }
    }
  }

  return canvas.toDataURL('image/png');
}
