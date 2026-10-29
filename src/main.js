import * as THREE from 'three';
import {
  state,
  subscribe,
  startDay,
  startNight,
  getHour,
  registrarInteraccionNocturna,
  registrarRespuesta,
  registrarPensamientoVisto,
  finalizarJuego,
  registrarMesaAtendida,
  setMesaActiva
} from './state.js';
import { gameConfig } from './data/gameConfig.js';
import { getRandomThought, getTableDistressThought } from './data/dialogues.js';
import { getTablesForCycle } from './data/tables.js';
import { visitorsData, cycleVisitorsSchedule, module6Texts } from './data/visitors.js';
import { createCafeteria } from './scene/cafeteria.js';
import { createPeopleManager } from './scene/people.js';
import { createGardener } from './scene/gardener.js';
import { createObjectsManager } from './scene/objects.js';
import { createPostersManager } from './scene/posters.js';
import { createPotEditor } from './editors/potEditor.js';
import { createGardenEditor, applyChange, renderMiniature } from './editors/gardenEditor.js';
import {
  updateAudio,
  onSignFlip,
  setMusicTheme,
  playClick,
  resumeMusicSoft,
  playServeCoffee
} from './audio/audio.js';
import {
  initDialogs,
  showDialog,
  hideDialog,
  showThought,
  canShowThought,
  showPosterModal,
  showGardenMenu,
  isAnyDialogOpen,
  setNightBarVisible,
  updatePendingBadge,
  showVisitorBubble,
  hideVisitorBubble,
  updateVisitorBubblePosition,
  isVisitorBubbleVisible,
  showOpinionDialog,
  showEndingScreen
} from './ui/dialogs.js';

// Mensaje de título en consola
console.log(
  `%c ${gameConfig.titleConsole} %c - Módulo 6: El Bucle Completo (4 Días, Opiniones, Pendientes y Desenlace)`,
  'background: #6e7b64; color: #ffffff; font-weight: bold; font-size: 13px; padding: 4px 8px; border-radius: 4px;',
  'color: #d0c4b7; font-size: 12px;'
);

// 1. Escena de la Cafetería
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x2d2926);

// 2. Cámara frontal elevada (no isométrica)
const camera = new THREE.PerspectiveCamera(
  42,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 3.6, 9.8);
camera.lookAt(0, 2.1, -0.5);

// 3. Renderizador WebGL
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: 'high-performance'
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const container = document.getElementById('canvas-container') || document.body;
container.appendChild(renderer.domElement);

// Elementos de interfaz
const stressOverlay = document.getElementById('stress-overlay');
initDialogs();

// 4. Componentes y Subsistemas de la Escena
const cafeteria = createCafeteria(scene);
const peopleManager = createPeopleManager(scene);
const gardener = createGardener(scene);
const objectsManager = createObjectsManager(scene);
const postersManager = createPostersManager(cafeteria.group);
postersManager.renewForCycle(state.cicloActual);
postersManager.setNightMode(false);

// 5. Editor de Macetas a pantalla completa (Módulo 4)
const potEditor = createPotEditor({
  renderer,
  onExit: () => {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }
});

// 5b. Editor del Jardín 5x5 a pantalla completa (Módulo 5)
const gardenEditor = createGardenEditor({
  renderer,
  potEditor,
  onExit: () => {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // Sincronizar el jardín 3D de la cafetería con el nuevo estado
    cafeteria.garden.syncWithGrid(state.gardenGrid);
  },
  onGardenUpdated: () => {
    cafeteria.garden.syncWithGrid(state.gardenGrid);
  }
});

// Iniciar con objetos nocturnos ocultos
objectsManager.setVisible(false);

// 6. Manejo del Temporizador Rojo y Disolución
let dayTimer = 0;
let heartbeatTimer = 0;
let isRedDissolving = false;
let redDissolveOpacity = 0;

// 7. Pensamientos Espontáneos del Jardinero (cada 12 a 20 segundos)
let thoughtTimer = 0;
let nextThoughtInterval = 14 + Math.random() * 6;
let lastThoughtId = null;

// 8. Planificación y Gestión de Visitantes Opinantes (Módulo 6)
let scheduledVisitorIds = [];
let currentVisitorIndex = 0;
let isVisitorOpining = false;
let activeOpinionVisitorData = null;
let activeOpinionVisitorInstance = null;
let activeOpinion = null;
let nextVisitorTime = 8.0;

// 8b. Servicio de Cafés y Conversaciones en las Mesas de Día
let activeCycleTables = [];
let currentTableOrderIndex = 0;
let activeTableData = null;
let activeCustomerInstance = null;
let isServingCoffee = false;
let hasCriticBeenAnswered = false;

/**
 * Busca al cliente sentado en la mesa asignada
 * @param {object} tableData
 * @returns {object|null}
 */
function findCustomerForTable(tableData) {
  const people = peopleManager.getPeople().filter((p) => p.isSitting);
  const byName = people.find((p) => p.data && p.data.name === tableData.customerName);
  if (byName) return byName;

  const byPos = people.find((p) => {
    const x = p.root.position.x;
    const z = p.root.position.z;
    if (tableData.tableIndex === 0) return x < -3.5 && z >= -0.2 && z <= 1.4;
    if (tableData.tableIndex === 1) return x < -3.5 && z >= 1.8 && z <= 3.5;
    if (tableData.tableIndex === 2) return x > 3.5 && z >= -2.6 && z <= -0.5;
    if (tableData.tableIndex === 3) return x > 3.5 && z >= 0.5 && z <= 2.6;
    return false;
  });
  if (byPos) return byPos;

  return people[tableData.tableIndex % people.length] || null;
}

/**
 * Activa la llamada de café de la siguiente mesa disponible
 */
function promptNextTableCustomer() {
  if (state.fase !== 'dia' || currentTableOrderIndex >= activeCycleTables.length) return;
  const tableData = activeCycleTables[currentTableOrderIndex];
  if (!tableData) return;

  const customer = findCustomerForTable(tableData);
  if (customer && customer.state !== 'fuera' && customer.state !== 'saliendo') {
    activeCustomerInstance = customer;
    activeTableData = tableData;
    setMesaActiva(tableData.id);
    customer.setCallingCoffee(true, tableData);
  }
}

/**
 * Sirve café a un cliente de mesa y despliega su conversación reflexiva
 * @param {object} person
 */
function serveCoffeeToPerson(person) {
  if (isServingCoffee) return;
  isServingCoffee = true;
  playClick();

  const currentTable = person.activeTableData || activeTableData || (activeCycleTables && activeCycleTables[currentTableOrderIndex]);

  // La Jardinera camina hacia la mesa
  const pPos = person.root.position;
  const walkTargetX = pPos.x < 0 ? pPos.x + 0.88 : pPos.x - 0.88;
  gardener.moveTo(walkTargetX, pPos.z);

  setTimeout(() => {
    playServeCoffee();
    person.serveCoffee();
    person.isServedCoffee = true;

    if (currentTable && currentTable.lines) {
      playTableConversation(currentTable.lines, () => {
        isServingCoffee = false;
        activeCustomerInstance = null;
        setMesaActiva(null);
        registrarMesaAtendida(currentTable.id);
        currentTableOrderIndex++;

        // Pensamiento reflexivo de agobio de la Jardinera desde src/data/: "quiero cerrar"
        const servedCount = state.mesasAtendidasDia.length;
        const tText = getTableDistressThought(servedCount);
        const gPos = gardener.getPosition().clone();
        gPos.y += 0.4;
        showThought(tText, getScreenCoords(gPos), false);

        // Programar la siguiente mesa si aún estamos de día
        if (currentTableOrderIndex < activeCycleTables.length && state.fase === 'dia') {
          setTimeout(() => {
            if (state.fase === 'dia') {
              promptNextTableCustomer();
            }
          }, 3500 + Math.random() * 2500);
        }
      });
    } else {
      isServingCoffee = false;
      activeCustomerInstance = null;
    }
  }, 550);
}

/**
 * Reproduce secuencialmente las líneas de diálogo de una conversación de mesa
 * @param {Array<{ speaker: string, text: string }>} lines
 * @param {Function} onFinished
 */
function playTableConversation(lines, onFinished) {
  let idx = 0;
  function showNext() {
    if (idx >= lines.length) {
      if (onFinished) onFinished();
      return;
    }
    const cur = lines[idx];
    idx++;
    showDialog({
      speaker: cur.speaker,
      text: cur.text,
      onComplete: () => {
        showNext();
      }
    });
  }
  showNext();
}

function getScreenCoords(position3D) {
  const v = position3D.clone();
  v.y += 1.65;
  v.project(camera);

  const x = (v.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-(v.y * 0.5) + 0.5) * window.innerHeight;
  return { x, y };
}

/**
 * Simula un cambio en una copia de la cuadrícula para renderizar la miniatura
 * @param {Array<object|null>} grid
 * @param {'mover'|'quitar'|'flores'|'renombrar'} tipo
 * @param {object|string} datos
 * @returns {Array<object|null>}
 */
function simulateGridChange(grid, tipo, datos) {
  const sim = grid.map((c) => (c ? { ...c, flores: c.flores ? [...c.flores] : [] } : null));
  if (!datos) return sim;

  if (tipo === 'mover') {
    let fRow = datos.from ? datos.from.row : datos.fromRow;
    let fCol = datos.from ? datos.from.col : datos.fromCol;
    let tRow = datos.to ? datos.to.row : datos.toRow;
    let tCol = datos.to ? datos.to.col : datos.toCol;
    if (fRow !== undefined && fCol !== undefined && tRow !== undefined && tCol !== undefined) {
      const fromIdx = fRow * 5 + fCol;
      const toIdx = tRow * 5 + tCol;
      if (sim[fromIdx] && sim[toIdx] === null) {
        sim[toIdx] = { ...sim[fromIdx], row: tRow, col: tCol };
        sim[fromIdx] = null;
      }
    }
  } else if (tipo === 'quitar') {
    let row = datos.row;
    let col = datos.col;
    if (row !== undefined && col !== undefined) {
      const idx = row * 5 + col;
      const count = sim.filter(Boolean).length;
      if (count > 1) {
        sim[idx] = null;
      }
    }
  } else if (tipo === 'flores') {
    let row = datos.row;
    let col = datos.col;
    if (row !== undefined && col !== undefined) {
      const idx = row * 5 + col;
      if (sim[idx]) {
        if (!sim[idx].flores) sim[idx].flores = [];
        sim[idx].flores.push({
          color: datos.color || 0xffb703,
          height: 0.44
        });
      }
    }
  }
  return sim;
}

/**
 * Registra una sola vez la respuesta o silencio a la opinión del visitante
 * @param {'aceptadas'|'consideradas'|'refutadas'} tipo
 * @param {object|null} pendienteData
 */
function recordOpinionResponse(tipo, pendienteData = null) {
  if (!activeOpinionVisitorInstance || activeOpinionVisitorInstance.hasBeenRecorded) {
    return;
  }
  activeOpinionVisitorInstance.hasBeenRecorded = true;
  hasCriticBeenAnswered = true;
  registrarRespuesta(tipo, pendienteData);
}

/**
 * Genera el siguiente visitante opinante planificado para el día
 */
function spawnNextOpinionVisitor() {
  if (isVisitorOpining || currentVisitorIndex >= scheduledVisitorIds.length) return;
  const visitorId = scheduledVisitorIds[currentVisitorIndex];
  const vData = visitorsData.find((v) => v.id === visitorId);
  if (!vData) {
    currentVisitorIndex++;
    return;
  }

  isVisitorOpining = true;
  activeOpinionVisitorData = vData;
  hasCriticBeenAnswered = false;

  const opIdx = (state.cicloActual + currentVisitorIndex) % vData.opinions.length;
  activeOpinion = vData.opinions[opIdx];

  const visitor = peopleManager.spawnOpinionVisitor({
    visitorData: vData,
    onReadyToOpine: (visitorInstance) => {
      activeOpinionVisitorInstance = visitorInstance;
      const coords = getScreenCoords(visitorInstance.root.position);
      showVisitorBubble({
        screenCoords: coords,
        text: '💬',
        onClick: () => {
          openOpinionDialog();
        }
      });
    }
  });

  activeOpinionVisitorInstance = visitor;
  if (visitor) {
    visitor.hasBeenRecorded = false;
  }
}

/**
 * Abre el diálogo interactivo de opinión con los 3 botones (Refutar, Considerar, Aceptar)
 */
function openOpinionDialog() {
  if (!activeOpinionVisitorData || !activeOpinion) return;
  hideVisitorBubble();

  if (activeOpinionVisitorInstance) {
    activeOpinionVisitorInstance.setState('hablando');
  }

  const visitor = activeOpinionVisitorData;
  const opinion = activeOpinion;

  const currentGardenName = state.gardenName || 'Jardín de la cafetería';
  let opinionText = opinion.text.replace(/{gardenName}/g, currentGardenName);

  // Módulo 6 Regla 6:
  // "Si el jugador usó el 'Jardinero Automático' en el módulo 4, un visitante amable lo nota de forma sutil ('Es muy perfecto... pero no sé a quién pertenece')."
  if (state.usoJardineroAutomatico && visitor.isKind) {
    if (opinion.textAuto) {
      opinionText = opinion.textAuto;
    } else {
      opinionText = 'Es muy perfecto... pero no sé a quién pertenece.';
    }
  }

  showOpinionDialog({
    visitorName: visitor.name,
    text: opinionText,
    onRefute: () => {
      // 1. Refutar: no pasa nada en el jardín, el visitante replica con otra frase
      recordOpinionResponse('refutadas');
      showDialog({
        speaker: visitor.name,
        text: opinion.replyRefute,
        onComplete: () => {
          dismissCurrentOpinionVisitor();
        }
      });
    },
    onConsider: () => {
      // 2. Considerar: se crea un pendiente con una miniatura del cambio simulado
      const simGrid = simulateGridChange(state.gardenGrid, opinion.changeType, opinion.suggestedChange);
      const thumb = renderMiniature(simGrid);

      recordOpinionResponse('consideradas', {
        visitorName: visitor.name,
        phrase: opinionText,
        changeType: opinion.changeType,
        thumbnail: thumb,
        suggestedChange: opinion.suggestedChange
      });

      showDialog({
        speaker: visitor.name,
        text: opinion.replyConsider,
        onComplete: () => {
          dismissCurrentOpinionVisitor();
        }
      });
    },
    onAccept: () => {
      // 3. Aceptar: el cambio se aplica de inmediato al jardín con applyChange sin pasar por el jugador
      applyChange(opinion.changeType, opinion.suggestedChange);
      cafeteria.garden.syncWithGrid(state.gardenGrid);
      const thumb = renderMiniature(state.gardenGrid);

      recordOpinionResponse('aceptadas', {
        visitorName: visitor.name,
        phrase: opinionText,
        changeType: opinion.changeType,
        thumbnail: thumb,
        suggestedChange: opinion.suggestedChange
      });

      showDialog({
        speaker: visitor.name,
        text: opinion.replyAccept,
        onComplete: () => {
          dismissCurrentOpinionVisitor();
        }
      });
    }
  });
}

function dismissCurrentOpinionVisitor() {
  resumeMusicSoft(1.2);
  peopleManager.dismissOpinionVisitor(() => {
    isVisitorOpining = false;
    activeOpinionVisitorData = null;
    activeOpinionVisitorInstance = null;
    activeOpinion = null;
    currentVisitorIndex++;
    nextVisitorTime = dayTimer + 14.0 + Math.random() * 6.0;
  });
}

/**
 * Secuencia de Desenlace Final (Ciclo 4)
 */
function triggerEndingSequence() {
  if (state.juegoFinalizado) return;

  state.bloqueadoInteraccion = true;
  hideVisitorBubble();
  setNightBarVisible(false);

  // TAREA B: Si el visitante estaba opinando y llega el desenlace sin respuesta, se cuenta como refutado por silencio
  if (activeOpinionVisitorInstance && !activeOpinionVisitorInstance.hasBeenRecorded) {
    recordOpinionResponse('refutadas');
  }
  peopleManager.forceRemoveAllCritics();

  const { aceptadas, consideradas, refutadas } = state.respuestasContador;
  const mayoriaAceptadas = aceptadas > (consideradas + refutadas);
  const modo = mayoriaAceptadas ? 'silencio' : 'duda';

  finalizarJuego(modo);

  // Los visitantes aplauden al jardín
  peopleManager.setApplauding(mayoriaAceptadas);

  const reflectionText = mayoriaAceptadas
    ? module6Texts.applauseMany
    : module6Texts.applauseFew;

  setTimeout(() => {
    showDialog({
      speaker: 'Jardinera',
      text: reflectionText,
      buttons: [
        {
          label: 'La cafetería duerme...',
          onClick: () => {
            // Vaciar la cafetería: los visitantes salen uno a uno
            peopleManager.evacuatePeople(() => {
              cafeteria.setLighting('noche');
              cafeteria.sign.setState('cerrado');

              // Objetos del ciclo 4 visibles en la cafetería vacía (solo de mesas atendidas)
              objectsManager.spawnForCycle(4, state.mesasAtendidasDia);
              objectsManager.setVisible(true);

              setTimeout(() => {
                showEndingScreen({
                  modo,
                  stats: state.respuestasContador
                });
              }, 1200);
            });
          }
        }
      ]
    });
  }, 1600);
}

/**
 * Conexión reactiva con el estado global
 */
subscribe((prop, value) => {
  if (prop === 'startDay') {
    dayTimer = 0;
    heartbeatTimer = 0;
    isRedDissolving = false;
    cafeteria.sign.setState('abierto');
    cafeteria.setLighting('dia');
    cafeteria.garden.setUnlocked(false);
    objectsManager.setVisible(false);
    peopleManager.spawnPeople(value);
    postersManager.setNightMode(false);
    document.body.classList.remove('heavy-cursor');

    // Menús nocturnos y programación de opiniones
    setNightBarVisible(false);
    hideVisitorBubble();

    // Cola de mesas de café de día
    activeCycleTables = getTablesForCycle(value);
    currentTableOrderIndex = 0;
    activeTableData = null;
    activeCustomerInstance = null;
    hasCriticBeenAnswered = false;
    isServingCoffee = false;

    setTimeout(() => {
      if (state.fase === 'dia') {
        promptNextTableCustomer();
      }
    }, 2400);

    scheduledVisitorIds = cycleVisitorsSchedule[value] ? [...cycleVisitorsSchedule[value]] : [];
    currentVisitorIndex = 0;
    isVisitorOpining = false;
    activeOpinionVisitorData = null;
    activeOpinionVisitorInstance = null;
    activeOpinion = null;
    nextVisitorTime = scheduledVisitorIds.length > 0 ? 8.0 + Math.random() * 4.0 : 9999;
  } else if (prop === 'startNight') {
    isRedDissolving = true;
    redDissolveOpacity = parseFloat(stressOverlay.style.opacity) || 0.6;
    cafeteria.sign.setState('cerrado');
    cafeteria.setLighting('noche');
    postersManager.renewForCycle(state.cicloActual);
    postersManager.setNightMode(true);
    document.body.classList.remove('heavy-cursor');

    if (activeCustomerInstance) {
      activeCustomerInstance.setCallingCoffee(false, null);
      activeCustomerInstance = null;
    }
    setMesaActiva(null);

    // Menú nocturno con notificación de pendientes
    setNightBarVisible(true);
    updatePendingBadge(state.nuevosPendientesCount);
    hideVisitorBubble();
    hideDialog();

    // Requisito 4: Si el jugador no responde antes de cerrar el letrero,
    // el visitante se cuenta como "refutado por silencio" solo si no había sido respondido
    if (activeOpinionVisitorInstance && !activeOpinionVisitorInstance.hasBeenRecorded) {
      recordOpinionResponse('refutadas');
    }
    isVisitorOpining = false;
    activeOpinionVisitorData = null;
    activeOpinionVisitorInstance = null;
    activeOpinion = null;

    // TAREA B2: El muñequito que hace la queja sobre las plantas desaparece también cuando cae la noche
    peopleManager.forceRemoveAllCritics();

    // Requisito 5: Todo visitante sale por la puerta con red de seguridad de 20s
    peopleManager.evacuateAllPeople(() => {
      objectsManager.spawnForCycle(state.cicloActual, state.mesasAtendidasDia);
      objectsManager.setVisible(true);
      console.log('Cafetería vacía. Objetos olvidados visibles para el Ciclo', state.cicloActual, state.mesasAtendidasDia);
    });
  } else if (prop === 'nuevosPendientesCount') {
    if (state.fase === 'noche') {
      updatePendingBadge(value);
    }
  } else if (prop === 'gardenUnlocked') {
    cafeteria.garden.setUnlocked(true);
  } else if (prop === 'potCreated') {
    gardenEditor.open({ newPot: value });
  }
});

// Iniciar el día 1 de inmediato para conectar mesas, visitantes y programación
startDay(state.cicloActual);

// 9. Raycasting e interacción Point & Click con el mouse
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('pointerdown', (event) => {
  if (event.button !== 0) return;

  // Si algún editor o modal está activo, ignorar clics 3D en la cafetería
  if (potEditor.isActive() || gardenEditor.isActive()) return;
  if (isAnyDialogOpen()) return;

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  // A. Comprobar clic en el letrero de la puerta
  const signHits = raycaster.intersectObject(cafeteria.sign.plate, true);
  if (signHits.length > 0) {
    onSignClicked();
    return;
  }

  // B. Comprobar clic en CUALQUIER PERSONAJE (Solo durante el día)
  if (state.fase === 'dia') {
    const personHits = raycaster.intersectObjects(peopleManager.getAllInteractiveMeshes(), true);
    if (personHits.length > 0) {
      let obj = personHits[0].object;
      while (obj && !obj.userData?.personInstance) {
        obj = obj.parent;
      }
      const person = obj?.userData?.personInstance;
      if (person && person.state !== 'fuera' && person.state !== 'saliendo') {
        // 1. Si es el visitante que vino a opinar/criticar el jardín
        if (person.isCritic || (isVisitorOpining && person === activeOpinionVisitorInstance)) {
          playClick();
          openOpinionDialog();
          return;
        }

        // 2. Si es el cliente que está llamando para pedir café
        if (person.isCallingCoffee && !isServingCoffee) {
          serveCoffeeToPerson(person);
          return;
        }

        // 3. Si el jugador hace clic en un cliente sentado que aún no fue atendido hoy
        if (!isServingCoffee && person.isSitting) {
          const currentTable = person.activeTableData || activeCycleTables.find((t) => t.tableIndex === person.data.tableIndex);
          if (currentTable && !state.mesasAtendidasDia.includes(currentTable.id)) {
            // Atender directamente a este cliente
            person.setCallingCoffee(true, currentTable);
            activeCustomerInstance = person;
            activeTableData = currentTable;
            setMesaActiva(currentTable.id);
            serveCoffeeToPerson(person);
            return;
          } else if (person.isServedCoffee || (currentTable && state.mesasAtendidasDia.includes(currentTable.id))) {
            playClick();
            showDialog({
              speaker: person.data.name || 'Cliente',
              text: 'Gracias por el café, señorita. Se siente la dedicación en cada rincón.'
            });
            return;
          }
        }
      }
    }
  }

  // C. Comprobar clic en los OBJETOS OLVIDADOS (durante la noche)
  if (state.fase === 'noche' && objectsManager.group.visible) {
    const objHits = raycaster.intersectObjects(objectsManager.getInteractiveMeshes(), true);
    if (objHits.length > 0) {
      playClick();
      const hit = objHits[0];
      const data = hit.object.userData.data;

      gardener.moveTo(data.position.x, data.position.z + 0.5);

      setTimeout(() => {
        showDialog({
          speaker: data.dialogue.speaker,
          text: data.dialogue.text
        });
        registrarPensamientoVisto(data.dialogue.text, 'objeto');
      }, 350);

      objectsManager.markTouched(data.id);
      registrarInteraccionNocturna('objeto', data.id);
      return;
    }
  }

  // D. Comprobar clic en PÓSTERS EN LA PARED
  const posterHits = raycaster.intersectObjects(postersManager.getInteractiveMeshes(), true);
  if (posterHits.length > 0) {
    playClick();
    const hit = posterHits[0];
    const data = hit.object.userData.data;

    postersManager.markRead(data.id);
    showPosterModal(data);
    if (data.gardenerThought) {
      registrarPensamientoVisto(data.gardenerThought, 'poster');
    }

    if (state.fase === 'noche') {
      registrarInteraccionNocturna('poster', data.id);
    }
    return;
  }

  // E. Comprobar clic en el JARDÍN CENTRAL (Módulos 4 y 5)
  const gardenHits = raycaster.intersectObject(cafeteria.garden.group, true);
  if (gardenHits.length > 0) {
    if (state.fase === 'noche' && !state.jardinDesbloqueado) {
      return;
    }
    playClick();

    const pt = gardenHits[0].point;
    gardener.moveTo(pt.x, pt.z > 0 ? 1.6 : -1.6);

    showGardenMenu({
      onCreatePot: () => {
        potEditor.open();
      },
      onFixGarden: () => {
        gardenEditor.open();
      }
    });
    return;
  }

  // F. Clic en el piso para mover al jardinero
  const floorHits = raycaster.intersectObject(cafeteria.floorMesh, false);
  if (floorHits.length > 0) {
    const pt = floorHits[0].point;
    gardener.moveTo(pt.x, pt.z);
  }
});

/**
 * Lógica al clicar el letrero de la puerta (Módulos 1 a 6)
 */
function onSignClicked() {
  if (state.bloqueadoInteraccion) return;
  playClick();

  if (state.fase === 'dia') {
    onSignFlip('noche');

    if (activeCustomerInstance) {
      activeCustomerInstance.setCallingCoffee(false, null);
      activeCustomerInstance = null;
    }
    setMesaActiva(null);

    // TAREA B: Si el visitante estaba opinando y el letrero se cierra sin responder, se cuenta como refutado por silencio
    if (activeOpinionVisitorInstance && !activeOpinionVisitorInstance.hasBeenRecorded) {
      recordOpinionResponse('refutadas');
    }
    hideDialog();
    hideVisitorBubble();
    isVisitorOpining = false;
    activeOpinionVisitorData = null;
    activeOpinionVisitorInstance = null;
    activeOpinion = null;

    // Si estamos en el ciclo 4, el cierre del día desencadena el final
    if (state.cicloActual >= 4) {
      triggerEndingSequence();
      return;
    }
    startNight(state.cicloActual);
  } else if (state.fase === 'noche') {
    onSignFlip('dia');
    const nextCycle = state.cicloActual + 1;
    if (nextCycle > state.maxCiclos) {
      triggerEndingSequence();
      return;
    }

    // Regla 1 (Módulo 6):
    // "Al abrir el letrero después de una noche, los dueños de esos objetos entran, recogen sus cosas y se van. Entran además otros visitantes sentados (personas con distinto aspecto cada ciclo)."
    state.bloqueadoInteraccion = true;
    cafeteria.sign.setState('abierto');
    cafeteria.setLighting('dia');
    setNightBarVisible(false);

    const nightObjs = objectsManager.getObjects();
    if (nightObjs && nightObjs.length > 0) {
      peopleManager.pickupNightObjects(nightObjs, () => {
        objectsManager.setVisible(false);
        state.bloqueadoInteraccion = false;
        startDay(nextCycle);
      });
    } else {
      objectsManager.setVisible(false);
      state.bloqueadoInteraccion = false;
      startDay(nextCycle);
    }
  }
}

// 10. Funciones globales de depuración y soporte para el Módulo 6
window.getHour = () => getHour();
window.setLighting = (fase) => cafeteria.setLighting(fase);
window.startDay = (ciclo) => startDay(ciclo);
window.startNight = (ciclo) => startNight(ciclo);
window.openPotEditor = () => potEditor.open();
window.openGardenEditor = (opts) => gardenEditor.open(opts);

// Cambios ejecutables: 'mover', 'quitar', 'flores', 'renombrar'
window.applyChange = (tipo, datos) => {
  const result = applyChange(tipo, datos);
  cafeteria.garden.syncWithGrid(state.gardenGrid);
  if (gardenEditor.isActive()) {
    gardenEditor.rebuildPlantsMeshes();
  }
  return result;
};

// Renderizador de miniatura de la cuadrícula
window.renderMiniature = (grid) => renderMiniature(grid || state.gardenGrid);

// Disparador manual de visitantes opinantes para pruebas
window.spawnOpinionVisitor = (visitorId) => {
  const v = visitorId ? visitorsData.find((x) => x.id === visitorId) : visitorsData[0];
  if (v) {
    scheduledVisitorIds = [v.id];
    currentVisitorIndex = 0;
    spawnNextOpinionVisitor();
  }
};

// Disparador manual del desenlace para pruebas
window.triggerEnding = (modo) => {
  if (modo === 'silencio') {
    state.respuestasContador = { aceptadas: 5, consideradas: 1, refutadas: 0 };
  } else if (modo === 'duda') {
    state.respuestasContador = { aceptadas: 1, consideradas: 3, refutadas: 2 };
  }
  triggerEndingSequence();
};

// 11. Ajuste reactivo al tamaño de ventana
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// 12. Bucle de animación
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  if (potEditor.isActive()) {
    potEditor.update(delta);
    potEditor.render();
    return;
  }

  if (gardenEditor.isActive()) {
    gardenEditor.update(delta);
    gardenEditor.render();
    return;
  }

  // A. Temporizador Rojo de Estrés (Cafetería)
  if (state.fase === 'dia') {
    dayTimer += delta;
    state.tiempoDia = dayTimer;

    // Escalamiento del estrés: saltos notables por cada mesa atendida
    const tableBaseStress = [0.0, 0.28, 0.52, 0.78, 1.05];
    const servedCount = (state.mesasAtendidasDia && state.mesasAtendidasDia.length) || 0;
    const baseStress = tableBaseStress[Math.min(servedCount, tableBaseStress.length - 1)];
    const timeRatio = dayTimer / gameConfig.dayDurationSeconds;
    const combinedStress = Math.max(baseStress, timeRatio);
    state.estres = combinedStress;

    if (combinedStress <= 1.0 && servedCount < 3) {
      const currentAlpha = combinedStress * 0.72;
      stressOverlay.style.opacity = currentAlpha.toFixed(3);
      document.body.classList.remove('heavy-cursor');
    } else {
      // Latidos / pulsos rojos tras 3-4 mesas o al superar tiempo máximo
      heartbeatTimer += delta;
      const heartRate = 4.0 + (servedCount >= 4 ? 3.5 : 2.0);
      const pulse = Math.pow((Math.sin(heartbeatTimer * heartRate) + 1) / 2, 2.5);
      const pulseAlpha = 0.55 + pulse * 0.42;
      stressOverlay.style.opacity = pulseAlpha.toFixed(3);
      document.body.classList.add('heavy-cursor');
    }

    // El letrero de la puerta brilla más cuando aumenta el agobio (3+ mesas o estrés alto)
    if (cafeteria.sign && cafeteria.sign.plate && cafeteria.sign.plate.material) {
      if (servedCount >= 3 || combinedStress >= 0.8) {
        const glow = 0.35 + Math.sin(Date.now() * 0.006) * 0.25;
        cafeteria.sign.plate.material.emissive = new THREE.Color(0xd4af37);
        cafeteria.sign.plate.material.emissiveIntensity = glow;
      } else {
        cafeteria.sign.plate.material.emissiveIntensity = 0;
      }
    }

    // Programación de visitantes que opinan durante el día (Módulo 6)
    if (
      !isVisitorOpining &&
      currentVisitorIndex < scheduledVisitorIds.length &&
      dayTimer >= nextVisitorTime &&
      !isAnyDialogOpen()
    ) {
      spawnNextOpinionVisitor();
    }

    // Mantener la burbuja de opinión centrada sobre el visitante si está activa
    if (isVisitorBubbleVisible() && activeOpinionVisitorInstance) {
      const coords = getScreenCoords(activeOpinionVisitorInstance.root.position);
      updateVisitorBubblePosition(coords);
    }
  } else {
    if (isRedDissolving) {
      redDissolveOpacity -= delta / gameConfig.redFadeOutSeconds;
      if (redDissolveOpacity <= 0) {
        redDissolveOpacity = 0;
        isRedDissolving = false;
      }
      stressOverlay.style.opacity = redDissolveOpacity.toFixed(3);
    } else {
      stressOverlay.style.opacity = '0';
    }
  }

  // B. Pensamientos espontáneos del jardinero: solo 1 a la vez, arriba en pantalla cerca del jardinero,
  // con espera mínima de 8 a 12 segundos entre pensamientos y nunca durante diálogos, pósters o modales
  if (canShowThought()) {
    thoughtTimer += delta;
    if (thoughtTimer >= nextThoughtInterval) {
      thoughtTimer = 0;
      nextThoughtInterval = 8 + Math.random() * 4; // 8 a 12 segundos

      const thought = getRandomThought(state.fase, lastThoughtId);
      lastThoughtId = thought.id;

      registrarPensamientoVisto(thought.text, 'espontaneo');

      const gardenerPos = gardener.getPosition().clone();
      gardenerPos.y += 0.4;
      const screenPos = getScreenCoords(gardenerPos);
      showThought(thought.text, screenPos, false);
    }
  } else {
    thoughtTimer = 0;
  }

  // C. Actualización de subsistemas de la Cafetería y Audio
  cafeteria.update(delta, state.fase, state.tiempoDia);
  peopleManager.update(delta);
  gardener.update(delta);
  objectsManager.update(delta);
  postersManager.update(delta, state.fase);
  updateAudio(delta, state);

  renderer.render(scene, camera);
}

requestAnimationFrame(animate);
