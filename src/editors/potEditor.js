import * as THREE from 'three';
import { state, guardarMaceta, getHour } from '../state.js';
import { getRandomPruningDoubt } from '../data/dialogues.js';
import { showThought, canShowThought, setPotConfirmChecker } from '../ui/dialogs.js';
import {
  setMusicTheme,
  playVoxelErase,
  playClick,
  onConfirmOpen,
  onConfirmClose
} from '../audio/audio.js';

/**
 * Editor de Macetas 3D - "Nadie lo verá completo"
 * Módulo 4: Creación de maceta, etiqueta, poda voxel 12x12x12 con InstancedMesh,
 * flores vívidas, dudas del jardinero y confirmaciones insistentes.
 */

// Dimensiones de la cuadrícula de voxels
const GRID_SIZE = 12;
const TOTAL_VOXELS = GRID_SIZE * GRID_SIZE * GRID_SIZE; // 1728
const VOXEL_SIZE = 0.155;

// Colores disponibles de flores
const FLOWER_COLORS = [
  { name: 'Rojo Coral', hex: 0xe63946, css: '#e63946' },
  { name: 'Amarillo Sol', hex: 0xffb703, css: '#ffb703' },
  { name: 'Fucsia Vivo', hex: 0xf72585, css: '#f72585' },
  { name: 'Violeta Intenso', hex: 0x7209b7, css: '#7209b7' },
  { name: 'Azul Eléctrico', hex: 0x3a86ff, css: '#3a86ff' },
  { name: 'Naranja Fuego', hex: 0xfb5607, css: '#fb5607' }
];

export function createPotEditor({ renderer, onExit }) {
  // 1. Escena y cámara propia con fondo blanco de estudio
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xfcfbfa);

  const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 50);
  camera.position.set(0, 1.8, 5.2);
  camera.lookAt(0, 0.6, 0);

  // Iluminación de estudio
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xfff7ed, 1.4);
  keyLight.position.set(4, 7, 5);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 1024;
  keyLight.shadow.mapSize.height = 1024;
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0xedf4ff, 0.6);
  rimLight.position.set(-4, 3, -4);
  scene.add(rimLight);

  // Piso sutil de estudio con sombra
  const floorGeo = new THREE.PlaneGeometry(16, 16);
  const floorMat = new THREE.ShadowMaterial({ opacity: 0.15 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.65;
  floor.receiveShadow = true;
  scene.add(floor);

  // Grupo pivotable del modelo completo (maceta + arbusto)
  const modelPivot = new THREE.Group();
  scene.add(modelPivot);

  // 2. Construcción de la Maceta de Terracota y Etiqueta
  const potTopY = 0.0;
  const potMat = new THREE.MeshStandardMaterial({
    color: 0xbf967e, // Terracota pastel
    roughness: 0.8
  });

  // Cuerpo de la maceta
  const potGeo = new THREE.CylinderGeometry(1.05, 0.8, 0.75, 32);
  const potMesh = new THREE.Mesh(potGeo, potMat);
  potMesh.position.y = -0.375;
  potMesh.castShadow = true;
  potMesh.receiveShadow = true;
  modelPivot.add(potMesh);

  // Borde superior de la maceta
  const rimGeo = new THREE.CylinderGeometry(1.12, 1.12, 0.08, 32);
  const rimMesh = new THREE.Mesh(rimGeo, potMat);
  rimMesh.position.y = -0.04;
  rimMesh.castShadow = true;
  modelPivot.add(rimMesh);

  // Placa de etiqueta
  const labelCanvas = document.createElement('canvas');
  labelCanvas.width = 512;
  labelCanvas.height = 256;
  const labelTexture = new THREE.CanvasTexture(labelCanvas);

  const labelMat = new THREE.MeshStandardMaterial({
    map: labelTexture,
    roughness: 0.6
  });

  const labelMesh = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.32, 0.02), labelMat);
  labelMesh.position.set(0, -0.36, 0.94);
  labelMesh.rotation.x = 0.12;
  modelPivot.add(labelMesh);

  function updateLabelTexture(text = '') {
    const ctx = labelCanvas.getContext('2d');
    ctx.fillStyle = '#f8f4ec';
    ctx.fillRect(0, 0, 512, 256);
    ctx.strokeStyle = '#8a7a6b';
    ctx.lineWidth = 8;
    ctx.strokeRect(10, 10, 492, 236);

    if (text) {
      ctx.fillStyle = '#3a3028';
      ctx.font = 'italic bold 28px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Ajuste de texto multilínea
      const words = text.split(' ');
      let line = '';
      const lines = [];
      for (let w of words) {
        if ((line + w).length > 22) {
          lines.push(line.trim());
          line = w + ' ';
        } else {
          line += w + ' ';
        }
      }
      lines.push(line.trim());

      const startY = 128 - (lines.length - 1) * 20;
      for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], 256, startY + i * 40);
      }
    }
    labelTexture.needsUpdate = true;
  }
  updateLabelTexture('');

  // 3. Voxel Mesh con THREE.InstancedMesh
  const voxelGeo = new THREE.BoxGeometry(VOXEL_SIZE * 0.98, VOXEL_SIZE * 0.98, VOXEL_SIZE * 0.98);
  const bushMat = new THREE.MeshStandardMaterial({
    color: 0x6e7b64, // Verde militar pastel
    roughness: 0.85
  });

  const instancedMesh = new THREE.InstancedMesh(voxelGeo, bushMat, TOTAL_VOXELS);
  instancedMesh.castShadow = true;
  instancedMesh.receiveShadow = true;
  modelPivot.add(instancedMesh);

  // Estado de los voxels (1D array de 1728 booleanos)
  const voxelGrid = new Uint8Array(TOTAL_VOXELS);
  const dummy = new THREE.Object3D();

  function getVoxelPos(ix, iy, iz) {
    const half = (GRID_SIZE - 1) / 2;
    return {
      x: (ix - half) * VOXEL_SIZE,
      y: potTopY + iy * VOXEL_SIZE + VOXEL_SIZE / 2,
      z: (iz - half) * VOXEL_SIZE
    };
  }

  function getCoordsFromIndex(idx) {
    const iz = Math.floor(idx / (GRID_SIZE * GRID_SIZE));
    const rem = idx % (GRID_SIZE * GRID_SIZE);
    const iy = Math.floor(rem / GRID_SIZE);
    const ix = rem % GRID_SIZE;
    return { ix, iy, iz };
  }

  function getIndex(ix, iy, iz) {
    return ix + iy * GRID_SIZE + iz * (GRID_SIZE * GRID_SIZE);
  }

  function fillFullVoxelBlock() {
    for (let i = 0; i < TOTAL_VOXELS; i++) {
      voxelGrid[i] = 1;
      const { ix, iy, iz } = getCoordsFromIndex(i);
      const pos = getVoxelPos(ix, iy, iz);
      dummy.position.set(pos.x, pos.y, pos.z);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      instancedMesh.setMatrixAt(i, dummy.matrix);
    }
    instancedMesh.instanceMatrix.needsUpdate = true;
    instancedMesh.visible = true;
  }

  function clearAllVoxels() {
    for (let i = 0; i < TOTAL_VOXELS; i++) {
      voxelGrid[i] = 0;
      dummy.scale.set(0, 0, 0);
      dummy.updateMatrix();
      instancedMesh.setMatrixAt(i, dummy.matrix);
    }
    instancedMesh.instanceMatrix.needsUpdate = true;
    instancedMesh.visible = false;
  }

  // Contenedor de flores 3D añadidas
  const flowersGroup = new THREE.Group();
  modelPivot.add(flowersGroup);
  let placedFlowers = [];

  function clearFlowers() {
    while (flowersGroup.children.length > 0) {
      const child = flowersGroup.children[0];
      child.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m && m.dispose && m.dispose());
          } else if (obj.material && obj.material.dispose) {
            obj.material.dispose();
          }
        }
      });
      flowersGroup.remove(child);
    }
    placedFlowers = [];
  }

  function addFlowerAtVoxel(ix, iy, iz, colorHex) {
    const pos = getVoxelPos(ix, iy, iz);
    const flowerGroup = new THREE.Group();
    flowerGroup.position.set(pos.x, pos.y + VOXEL_SIZE * 0.45, pos.z);

    const fMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.4 });
    const blossom = new THREE.Mesh(new THREE.DodecahedronGeometry(0.045, 0), fMat);
    blossom.castShadow = true;
    flowerGroup.add(blossom);

    const center = new THREE.Mesh(
      new THREE.SphereGeometry(0.02, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    center.position.y = 0.02;
    flowerGroup.add(center);

    flowersGroup.add(flowerGroup);
    placedFlowers.push({
      ix,
      iy,
      iz,
      color: colorHex,
      colorHex: colorHex
    });
  }

  // 4. Estados del Flujo
  // 'label' -> 'pruning' -> 'flowers' -> 'confirmation'
  let currentStep = 'label';
  let labelText = '';
  let selectedFlowerColor = FLOWER_COLORS[0].hex;
  let activeConfirmationIndex = 0;
  let erasedInCurrentStroke = 0;
  let isPruningActive = false;

  // Manejo de dudas del jardinero
  let doubtTimer = 0;
  let lastDoubtId = null;

  // 5. Interfaz HTML del Editor
  const domContainer = document.createElement('div');
  domContainer.id = 'pot-editor-ui';
  domContainer.className = 'pot-editor-root hidden';
  document.body.appendChild(domContainer);

  domContainer.innerHTML = `
    <!-- Barra superior con botón permanente de Volver a Empezar -->
    <header class="pe-header">
      <span class="pe-badge">Taller de Macetas</span>
      <button class="pe-btn-reset" id="pe-btn-reset">↺ Volver a empezar</button>
    </header>

    <!-- Notificación de duda de la jardinera -->
    <div class="pe-doubt-banner hidden" id="pe-doubt-banner">
      <span class="pe-doubt-speaker">Voz de la Jardinera</span>
      <p class="pe-doubt-text" id="pe-doubt-text"></p>
    </div>

    <!-- PASO 1: Etiqueta -->
    <div class="pe-panel pe-panel-label" id="pe-panel-label">
      <h2>Nueva Maceta</h2>
      <p class="pe-prompt">¿Por qué estás creando esta maceta?<br><strong>¿Qué quieres transmitir?</strong></p>
      <input type="text" id="pe-input-label" maxlength="50" placeholder="Escribe lo que quieres transmitir..." autofocus autocomplete="off" />
      <button class="pe-btn-primary" id="pe-btn-submit-label">Grabar en la maceta</button>
    </div>

    <!-- PASO 2: Poda -->
    <div class="pe-panel pe-panel-pruning hidden" id="pe-panel-pruning">
      <div class="pe-instructions">
        <h3>Poda la planta con la figura que quieres transmitir</h3>
        <p class="pe-warning">⚠️ Ojo: no se puede deshacer</p>
        <p class="pe-hint">Arrastra clic izquierdo: podar &bull; Arrastra clic derecho o teclas A/D: rotar</p>
      </div>
      <button class="pe-btn-primary" id="pe-btn-goto-flowers">Siguiente: Poner flores &rarr;</button>
    </div>

    <!-- PASO 3: Flores -->
    <div class="pe-panel pe-panel-flowers hidden" id="pe-panel-flowers">
      <div class="pe-instructions">
        <h3>Elige y coloca flores de colores vivos</h3>
        <p class="pe-hint">Haz clic sobre las ramas para colocar flores</p>
      </div>
      <div class="pe-color-palette" id="pe-color-palette"></div>
      <button class="pe-btn-primary pe-btn-finish" id="pe-btn-finish">Finalizar maceta</button>
    </div>

    <!-- PASO 4: Confirmaciones Insistentes -->
    <div class="pe-modal-confirm hidden" id="pe-modal-confirm">
      <div class="pe-confirm-card" id="pe-confirm-card">
        <p class="pe-confirm-title" id="pe-confirm-title"></p>
        <div class="pe-confirm-actions" id="pe-confirm-actions">
          <button class="pe-btn-secondary" id="pe-btn-confirm-cancel">Pensarlo mejor</button>
          <button class="pe-btn-danger" id="pe-btn-confirm-ok">Sí, continuar</button>
        </div>
        <div class="pe-auto-gardener hidden" id="pe-auto-gardener">
          <a href="#" id="pe-link-auto-gardener">¿Quieres que lo termine yo?</a>
        </div>
      </div>
    </div>
  `;

  // Referencias DOM
  const btnReset = domContainer.querySelector('#pe-btn-reset');
  const doubtBanner = domContainer.querySelector('#pe-doubt-banner');
  const doubtText = domContainer.querySelector('#pe-doubt-text');

  const panelLabel = domContainer.querySelector('#pe-panel-label');
  const inputLabel = domContainer.querySelector('#pe-input-label');
  const btnSubmitLabel = domContainer.querySelector('#pe-btn-submit-label');

  const panelPruning = domContainer.querySelector('#pe-panel-pruning');
  const btnGotoFlowers = domContainer.querySelector('#pe-btn-goto-flowers');

  const panelFlowers = domContainer.querySelector('#pe-panel-flowers');
  const paletteContainer = domContainer.querySelector('#pe-color-palette');
  const btnFinish = domContainer.querySelector('#pe-btn-finish');

  const modalConfirm = domContainer.querySelector('#pe-modal-confirm');
  const confirmCard = domContainer.querySelector('#pe-confirm-card');
  const confirmTitle = domContainer.querySelector('#pe-confirm-title');
  const confirmActions = domContainer.querySelector('#pe-confirm-actions');
  const btnConfirmOk = domContainer.querySelector('#pe-btn-confirm-ok');
  const btnConfirmCancel = domContainer.querySelector('#pe-btn-confirm-cancel');
  const autoGardenerDiv = domContainer.querySelector('#pe-auto-gardener');
  const linkAutoGardener = domContainer.querySelector('#pe-link-auto-gardener');

  // Construir paleta de 6 colores
  FLOWER_COLORS.forEach((c, idx) => {
    const sw = document.createElement('button');
    sw.className = `pe-swatch ${idx === 0 ? 'selected' : ''}`;
    sw.style.backgroundColor = c.css;
    sw.title = c.name;
    sw.addEventListener('click', () => {
      domContainer.querySelectorAll('.pe-swatch').forEach((s) => s.classList.remove('selected'));
      sw.classList.add('selected');
      selectedFlowerColor = c.hex;
    });
    paletteContainer.appendChild(sw);
  });

  // Mostrar duda de la voz del jardinero
  let doubtHideTimeout = null;
  function triggerDoubt() {
    const d = getRandomPruningDoubt(lastDoubtId);
    lastDoubtId = d.id;
    doubtText.textContent = d.text;
    doubtBanner.classList.remove('hidden');

    if (doubtHideTimeout) clearTimeout(doubtHideTimeout);
    doubtHideTimeout = setTimeout(() => {
      doubtBanner.classList.add('hidden');
    }, 4200);
  }

  // --- Manejo del botón permanente "Volver a empezar" ---
  btnReset.addEventListener('click', () => {
    resetToStart();
  });

  function resetToStart() {
    currentStep = 'label';
    labelText = '';
    activeConfirmationIndex = 0;
    updateLabelTexture('');
    clearAllVoxels();
    clearFlowers();
    modelPivot.rotation.y = 0;

    panelLabel.classList.remove('hidden');
    panelPruning.classList.add('hidden');
    panelFlowers.classList.add('hidden');
    modalConfirm.classList.add('hidden');
    doubtBanner.classList.add('hidden');
    inputLabel.value = '';
    inputLabel.focus();
  }

  // --- PASO 1: Enviar Etiqueta ---
  btnSubmitLabel.addEventListener('click', submitLabel);
  inputLabel.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submitLabel();
  });

  function submitLabel() {
    const val = inputLabel.value.trim() || 'Sin palabras';
    labelText = val;
    updateLabelTexture(labelText);

    // Llenar la maceta con el bloque verde militar pastel de 12x12x12 voxels
    fillFullVoxelBlock();

    // Avanzar a poda
    currentStep = 'pruning';
    panelLabel.classList.add('hidden');
    panelPruning.classList.remove('hidden');
    doubtTimer = 0;
  }

  // --- PASO 2: Avanzar a Flores ---
  btnGotoFlowers.addEventListener('click', () => {
    currentStep = 'flowers';
    panelPruning.classList.add('hidden');
    panelFlowers.classList.remove('hidden');
    doubtBanner.classList.add('hidden');
  });

  // --- PASO 3: Finalizar e Iniciar Confirmaciones Insistentes ---
  btnFinish.addEventListener('click', () => {
    startConfirmationFlow();
  });

  // 6 Confirmaciones Insistentes
  function startConfirmationFlow() {
    currentStep = 'confirmation';
    activeConfirmationIndex = 0;
    modalConfirm.classList.remove('hidden');
    onConfirmOpen();
    showConfirmationStep(0);
  }

  function showConfirmationStep(index) {
    activeConfirmationIndex = index;
    const hour = getHour();

    // Textos de las 6 confirmaciones
    const stepsData = [
      {
        title: '¿Estás seguro de que está bien?',
        okText: 'Sí, seguro',
        cancelText: 'Dejarlo así',
        showAuto: false,
        isDotsOnly: false
      },
      {
        title: `Todavía son las ${hour}, hay tiempo para empezar de nuevo. ¿No crees que es mejor volver a empezar?`,
        okText: 'No, así está bien',
        cancelText: 'Empezar de nuevo',
        showAuto: false,
        isDotsOnly: false
      },
      {
        title: '¿Completamente seguro?',
        okText: 'Completamente seguro',
        cancelText: 'Volver a revisar',
        showAuto: true, // Jardinero automático
        isDotsOnly: false
      },
      {
        title: `Son las ${hour}. Si lo dejas así, cualquiera podría pensar que te rendiste. ¿De verdad quieres terminarlo?`,
        okText: 'Terminarlo',
        cancelText: 'Pensarlo',
        showAuto: false,
        isDotsOnly: false
      },
      {
        title: 'Piénsalo una vez más. La perfección no perdona los descuidos. ¿Seguro?',
        okText: 'Sí, acepto el resultado',
        cancelText: 'Revisar',
        showAuto: false,
        isDotsOnly: false
      },
      {
        title: '', // Sin pregunta
        okText: '...',
        cancelText: '',
        showAuto: false,
        isDotsOnly: true
      }
    ];

    const current = stepsData[index];

    if (current.isDotsOnly) {
      confirmTitle.textContent = '';
      btnConfirmOk.textContent = '...';
      btnConfirmCancel.classList.add('hidden');
    } else {
      confirmTitle.textContent = current.title;
      btnConfirmOk.textContent = current.okText;
      btnConfirmCancel.textContent = current.cancelText;
      btnConfirmCancel.classList.remove('hidden');
    }

    if (current.showAuto) {
      autoGardenerDiv.classList.remove('hidden');
    } else {
      autoGardenerDiv.classList.add('hidden');
    }

    // Botones de confirmación siempre bien centrados
    confirmActions.className = 'pe-confirm-actions align-center';
    if (index % 2 === 1) {
      // Invertir orden de los botones
      confirmActions.appendChild(btnConfirmOk);
      confirmActions.appendChild(btnConfirmCancel);
    } else {
      confirmActions.appendChild(btnConfirmCancel);
      confirmActions.appendChild(btnConfirmOk);
    }
  }

  btnConfirmOk.addEventListener('click', () => {
    if (activeConfirmationIndex < 5) {
      showConfirmationStep(activeConfirmationIndex + 1);
    } else {
      // Última confirmación completada: Guardar y salir
      finishAndSavePot(false);
    }
  });

  btnConfirmCancel.addEventListener('click', () => {
    onConfirmClose();
    // Si cancela en el paso 2 que sugiere empezar de nuevo, o simplemente cierra
    if (activeConfirmationIndex === 1) {
      resetToStart();
    } else {
      modalConfirm.classList.add('hidden');
      currentStep = 'flowers';
    }
  });

  // Enlace discreto del "Jardinero Automático"
  linkAutoGardener.addEventListener('click', (e) => {
    e.preventDefault();
    applyAutomaticGardener();
  });

  function applyAutomaticGardener() {
    // Reemplaza la planta por una forma simétrica y perfecta generada por código
    clearFlowers();
    const half = (GRID_SIZE - 1) / 2;
    const maxRadius = 4.8;

    for (let i = 0; i < TOTAL_VOXELS; i++) {
      const { ix, iy, iz } = getCoordsFromIndex(i);
      const dx = ix - half;
      const dy = iy - half;
      const dz = iz - half;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      // Esfera topiary perfecta
      if (dist <= maxRadius) {
        voxelGrid[i] = 1;
        const pos = getVoxelPos(ix, iy, iz);
        dummy.position.set(pos.x, pos.y, pos.z);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);
      } else {
        voxelGrid[i] = 0;
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);
      }
    }
    instancedMesh.instanceMatrix.needsUpdate = true;

    // La etiqueta queda vacía
    labelText = '';
    updateLabelTexture('');

    // Guardar directamente
    finishAndSavePot(true);
  }

  function finishAndSavePot(isAutomated = false) {
    onConfirmClose();
    modalConfirm.classList.add('hidden');

    const createdPotData = {
      etiqueta: labelText,
      esAutomatica: isAutomated,
      voxelGrid: Array.from(voxelGrid),
      flores: placedFlowers,
      color: 0x6e7b64
    };

    guardarMaceta(createdPotData);

    // Salir del editor y regresar a la cafetería
    close();
  }

  // --- 6. Raycasting y Controles de Interacción 3D ---
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let isRightDragging = false;
  let isLeftDragging = false;
  let previousMousePosition = { x: 0, y: 0 };

  // Teclas A y D para rotación continua
  const keysPressed = {};
  window.addEventListener('keydown', (e) => {
    if (domContainer.classList.contains('hidden')) return;
    if (e.target.tagName === 'INPUT') return;
    keysPressed[e.key.toLowerCase()] = true;
  });
  window.addEventListener('keyup', (e) => {
    keysPressed[e.key.toLowerCase()] = false;
  });

  const domElement = renderer.domElement;

  function onPointerDown(e) {
    if (domContainer.classList.contains('hidden')) return;
    if (e.target !== domElement) return;

    if (e.button === 2) {
      // Clic derecho: rotación
      isRightDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    } else if (e.button === 0) {
      // Clic izquierdo: podar o colocar flor
      isLeftDragging = true;
      erasedInCurrentStroke = 0;
      handleVoxelAction(e);
    }
  }

  function onPointerMove(e) {
    if (domContainer.classList.contains('hidden')) return;

    if (isRightDragging) {
      const deltaX = e.clientX - previousMousePosition.x;
      modelPivot.rotation.y += deltaX * 0.012;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    } else if (isLeftDragging && currentStep === 'pruning') {
      handleVoxelAction(e);
    }
  }

  function onPointerUp(e) {
    if (e.button === 2) isRightDragging = false;
    if (e.button === 0) {
      isLeftDragging = false;
      // Tras un trazo largo (> 6 voxels podados en un arrastre), lanzar duda
      if (currentStep === 'pruning' && erasedInCurrentStroke >= 6) {
        triggerDoubt();
      }
    }
  }

  function handleVoxelAction(e) {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    if (currentStep === 'pruning') {
      const hits = raycaster.intersectObject(instancedMesh);
      if (hits.length > 0) {
        const hit = hits[0];
        const instanceId = hit.instanceId;
        if (instanceId !== undefined && voxelGrid[instanceId] === 1) {
          eraseVoxelRadius(instanceId);
        }
      }
    } else if (currentStep === 'flowers') {
      // Solo en clic inicial
      const hits = raycaster.intersectObject(instancedMesh);
      if (hits.length > 0) {
        const hit = hits[0];
        const instanceId = hit.instanceId;
        if (instanceId !== undefined && voxelGrid[instanceId] === 1) {
          const { ix, iy, iz } = getCoordsFromIndex(instanceId);
          addFlowerAtVoxel(ix, iy, iz, selectedFlowerColor);
        }
      }
    }
  }

  /**
   * Borra un voxel y sus vecinos inmediatos (radio pequeño)
   */
  function eraseVoxelRadius(centerIdx) {
    const { ix: cx, iy: cy, iz: cz } = getCoordsFromIndex(centerIdx);
    let changed = false;

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dz = -1; dz <= 1; dz++) {
          const distSq = dx * dx + dy * dy + dz * dz;
          if (distSq <= 1.4) {
            const nx = cx + dx;
            const ny = cy + dy;
            const nz = cz + dz;
            if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE && nz >= 0 && nz < GRID_SIZE) {
              const idx = getIndex(nx, ny, nz);
              if (voxelGrid[idx] === 1) {
                voxelGrid[idx] = 0;
                dummy.scale.set(0, 0, 0);
                dummy.updateMatrix();
                instancedMesh.setMatrixAt(idx, dummy.matrix);
                changed = true;
                erasedInCurrentStroke++;
              }
            }
          }
        }
      }
    }

    if (changed) {
      instancedMesh.instanceMatrix.needsUpdate = true;
      playVoxelErase();
    }
  }

  // Desactivar menú contextual al arrastrar con clic derecho
  function onContextMenu(e) {
    if (!domContainer.classList.contains('hidden')) {
      e.preventDefault();
    }
  }

  window.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('contextmenu', onContextMenu);

  // --- 7. Métodos Públicos de Control ---
  let isActive = false;

  function open() {
    isActive = true;
    domContainer.classList.remove('hidden');
    setMusicTheme('jardin');
    resetToStart();
  }

  let potThoughtTimer = 0;
  let nextPotThoughtInterval = 4.0 + Math.random() * 2.0;
  let lastPruningDoubtId = null;

  function isConfirmOpen() {
    return currentStep === 'confirmation' && !modalConfirm.classList.contains('hidden');
  }

  setPotConfirmChecker(() => isConfirmOpen());

  function close() {
    isActive = false;
    potThoughtTimer = 0;
    domContainer.classList.add('hidden');
    setMusicTheme(state.fase === 'dia' ? 'dia' : 'noche');
    if (onExit) onExit();
  }

  function update(delta) {
    if (!isActive) return;

    // Rotación con teclas A y D
    if (keysPressed['a']) {
      modelPivot.rotation.y += delta * 2.2;
    }
    if (keysPressed['d']) {
      modelPivot.rotation.y -= delta * 2.2;
    }

    // Pensamientos rápidos del jardinero (cada 4 a 6 segundos), nunca durante confirmaciones
    if (!isConfirmOpen() && currentStep !== 'confirmation') {
      potThoughtTimer += delta;
      if (potThoughtTimer >= nextPotThoughtInterval) {
        potThoughtTimer = 0;
        nextPotThoughtInterval = 4.0 + Math.random() * 2.0;
        if (canShowThought()) {
          const doubt = getRandomPruningDoubt(lastPruningDoubtId);
          if (doubt) {
            lastPruningDoubtId = doubt.id;
            showThought(doubt.text, null, true);
          }
        }
      }
    } else {
      potThoughtTimer = 0;
    }
  }

  function render() {
    if (!isActive) return;
    renderer.render(scene, camera);
  }

  function onResize() {
    if (!isActive) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }

  window.addEventListener('resize', onResize);

  return {
    open,
    close,
    update,
    render,
    isActive: () => isActive,
    isConfirmOpen: () => isConfirmOpen()
  };
}
