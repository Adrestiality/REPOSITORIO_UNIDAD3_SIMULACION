import { onThoughtStart, onThoughtEnd, onPosterOpen, onPosterClose } from '../audio/audio.js';
import { speakGardener, cancelSpeech, initSpeech } from '../audio/speech.js';
import { state, marcarPendientesRevisados } from '../state.js';
import { module6Texts } from '../data/visitors.js';

/**
 * Sistema de Diálogos, Pensamientos, Modales Nocturnos y Final
 * "Nadie lo verá completo" - Módulos 3 a 6
 */

let uiContainer = null;
let dialogBox = null;
let speakerElem = null;
let textElem = null;
let buttonsElem = null;
let thoughtBubble = null;
let visitorBubble = null;
let posterModal = null;
let gardenMenuModal = null;

// Elementos Módulo 6
let nightActionBar = null;
let btnNightThoughts = null;
let btnNightPending = null;
let pendingBadge = null;
let thoughtsModal = null;
let pendingModal = null;
let endingModal = null;

let typingInterval = null;
let currentFullText = '';
let isTyping = false;
let thoughtTimeout = null;

// Sistema de Cola de Diálogos (solo un cuadro a la vez)
const dialogQueue = [];
let isDialogOpen = false;
let currentButtons = null;
let currentOnComplete = null;

/**
 * Inicializar elementos del DOM si no existen
 */
export function initDialogs() {
  if (uiContainer) return;

  initSpeech();

  uiContainer = document.getElementById('ui-layer');
  if (!uiContainer) {
    uiContainer = document.createElement('div');
    uiContainer.id = 'ui-layer';
    document.body.appendChild(uiContainer);
  }

  // 1. Cuadro de diálogo principal
  dialogBox = document.createElement('div');
  dialogBox.className = 'dialog-box hidden';
  dialogBox.innerHTML = `
    <div class="dialog-header">
      <span class="dialog-speaker">Jardinera</span>
    </div>
    <div class="dialog-body">
      <p class="dialog-text"></p>
    </div>
    <div class="dialog-buttons"></div>
  `;
  uiContainer.appendChild(dialogBox);

  speakerElem = dialogBox.querySelector('.dialog-speaker');
  textElem = dialogBox.querySelector('.dialog-text');
  buttonsElem = dialogBox.querySelector('.dialog-buttons');

  dialogBox.addEventListener('click', (e) => {
    if (e.target.tagName !== 'BUTTON' && isTyping) {
      completeTyping(currentButtons, currentOnComplete);
    }
  });

  // 2. Burbuja de pensamiento espontáneo tenue del jardinero
  thoughtBubble = document.createElement('div');
  thoughtBubble.className = 'thought-bubble hidden';
  thoughtBubble.innerHTML = `<p class="thought-text"></p>`;
  uiContainer.appendChild(thoughtBubble);

  // 2b. Burbuja interactiva sobre la cabeza del visitante opinante
  visitorBubble = document.createElement('div');
  visitorBubble.className = 'visitor-bubble hidden';
  visitorBubble.innerHTML = `
    <div class="visitor-bubble-inner">
      <span class="vb-icon">💬</span>
      <span class="vb-text">...</span>
    </div>
  `;
  uiContainer.appendChild(visitorBubble);

  // 3. Modal de póster ampliado
  posterModal = document.createElement('div');
  posterModal.className = 'poster-modal hidden';
  posterModal.innerHTML = `
    <div class="poster-modal-backdrop"></div>
    <div class="poster-modal-card">
      <button class="poster-close-btn" aria-label="Cerrar">&times;</button>
      <div class="poster-preview">
        <h2 class="poster-preview-quote"></h2>
        <span class="poster-preview-sub"></span>
      </div>
      <div class="poster-gardener-note">
        <span class="poster-speaker">Jardinera</span>
        <p class="poster-thought-text"></p>
      </div>
    </div>
  `;
  uiContainer.appendChild(posterModal);

  const closeBtn = posterModal.querySelector('.poster-close-btn');
  const backdrop = posterModal.querySelector('.poster-modal-backdrop');
  closeBtn.addEventListener('click', hidePosterModal);
  backdrop.addEventListener('click', hidePosterModal);

  // 4. Modal de Menú de Opciones del Jardín
  gardenMenuModal = document.createElement('div');
  gardenMenuModal.className = 'garden-menu-modal hidden';
  gardenMenuModal.innerHTML = `
    <div class="garden-menu-backdrop"></div>
    <div class="garden-menu-card">
      <h3>Jardín de la cafetería</h3>
      <button class="garden-menu-btn" id="gm-create-pot">🪴 Crear una maceta nueva</button>
      <button class="garden-menu-btn-secondary" id="gm-fix-garden">🌿 Arreglar el jardín</button>
      <button class="garden-menu-btn-close" id="gm-close">Cancelar</button>
    </div>
  `;
  uiContainer.appendChild(gardenMenuModal);

  const gmBackdrop = gardenMenuModal.querySelector('.garden-menu-backdrop');
  const gmClose = gardenMenuModal.querySelector('#gm-close');
  gmBackdrop.addEventListener('click', hideGardenMenu);
  gmClose.addEventListener('click', hideGardenMenu);

  // --- 5. Barra de Menús Nocturnos Fijos (Módulo 6) ---
  nightActionBar = document.createElement('div');
  nightActionBar.className = 'night-action-bar hidden';
  nightActionBar.innerHTML = `
    <button class="night-hud-btn" id="nb-thoughts">
      <span>💭</span> Pensamientos
    </button>
    <button class="night-hud-btn" id="nb-pending">
      <span>📋</span> Pendientes
      <span class="badge-count hidden" id="nb-badge">0</span>
    </button>
  `;
  uiContainer.appendChild(nightActionBar);

  btnNightThoughts = nightActionBar.querySelector('#nb-thoughts');
  btnNightPending = nightActionBar.querySelector('#nb-pending');
  pendingBadge = nightActionBar.querySelector('#nb-badge');

  btnNightThoughts.addEventListener('click', showThoughtsModal);
  btnNightPending.addEventListener('click', showPendingModal);

  // --- 6. Modal de Historial de Pensamientos del Jardinero ---
  thoughtsModal = document.createElement('div');
  thoughtsModal.className = 'app-modal-backdrop hidden';
  thoughtsModal.innerHTML = `
    <div class="app-modal-card">
      <div class="app-modal-header">
        <h2>${module6Texts.modalThoughtsTitle}</h2>
        <button class="app-modal-close" id="tm-close">&times;</button>
      </div>
      <div class="app-modal-body" id="tm-list"></div>
    </div>
  `;
  uiContainer.appendChild(thoughtsModal);

  thoughtsModal.querySelector('#tm-close').addEventListener('click', hideThoughtsModal);
  thoughtsModal.addEventListener('click', (e) => {
    if (e.target === thoughtsModal) hideThoughtsModal();
  });

  // --- 7. Modal de Sugerencias y Pendientes del Jardín ---
  pendingModal = document.createElement('div');
  pendingModal.className = 'app-modal-backdrop hidden';
  pendingModal.innerHTML = `
    <div class="app-modal-card">
      <div class="app-modal-header">
        <h2>${module6Texts.modalPendingTitle}</h2>
        <button class="app-modal-close" id="pm-close">&times;</button>
      </div>
      <div class="app-modal-body" id="pm-list"></div>
    </div>
  `;
  uiContainer.appendChild(pendingModal);

  pendingModal.querySelector('#pm-close').addEventListener('click', hidePendingModal);
  pendingModal.addEventListener('click', (e) => {
    if (e.target === pendingModal) hidePendingModal();
  });

  // --- 8. Pantalla del Desenlace Final (Ciclo 4) ---
  endingModal = document.createElement('div');
  endingModal.className = 'ending-screen-backdrop hidden';
  endingModal.innerHTML = `
    <div class="ending-card">
      <span class="ending-cycle-badge">Ciclo 4 &bull; Fin del trayecto</span>
      <h1 class="ending-question">${module6Texts.finalQuestion}</h1>
      <p class="ending-narrative" id="ending-narrative-text"></p>
      <div class="ending-stats-box" id="ending-stats-box"></div>
      <p class="ending-sub">${module6Texts.finalSubtitle}</p>
    </div>
  `;
  uiContainer.appendChild(endingModal);
}

/**
 * Limpiar la cola de diálogos pendientes
 */
export function clearDialogQueue() {
  dialogQueue.length = 0;
}

/**
 * Mostrar cuadro de diálogo con efecto de escritura (con soporte de cola: solo 1 a la vez)
 * @param {object} options
 * @param {string} options.speaker - Nombre de quien habla
 * @param {string} options.text - Texto completo a escribir
 * @param {Array<{label: string, onClick?: Function}>} [options.buttons] - Botones opcionales
 * @param {Function} [options.onComplete] - Callback al terminar
 */
export function showDialog({ speaker = 'Jardinera', text = '', buttons = null, onComplete = null }) {
  initDialogs();

  // Si ya hay un diálogo abierto, encolar este diálogo para cuando termine el anterior
  if (isDialogOpen) {
    dialogQueue.push({ speaker, text, buttons, onComplete });
    return;
  }

  isDialogOpen = true;
  currentButtons = buttons;
  currentOnComplete = onComplete;

  hideThought();
  hideVisitorBubble();

  // Si habla la jardinera, leer en voz alta con Web Speech API; si habla otro, cancelar voz anterior
  if (speaker === 'Jardinera') {
    speakGardener(text);
  } else {
    cancelSpeech();
  }

  speakerElem.textContent = speaker;
  currentFullText = text;
  textElem.textContent = '';
  buttonsElem.innerHTML = '';
  dialogBox.classList.remove('hidden');

  if (typingInterval) clearInterval(typingInterval);
  isTyping = true;

  let index = 0;
  const speed = 22; // ms por carácter

  typingInterval = setInterval(() => {
    if (index < currentFullText.length) {
      textElem.textContent += currentFullText[index];
      index++;
    } else {
      completeTyping(currentButtons, currentOnComplete);
    }
  }, speed);
}

function completeTyping(buttons = currentButtons, onComplete = currentOnComplete) {
  if (typingInterval) {
    clearInterval(typingInterval);
    typingInterval = null;
  }
  isTyping = false;
  textElem.textContent = currentFullText;
  renderButtons(buttons || currentButtons, onComplete || currentOnComplete);
}

function renderButtons(buttons = null, onComplete = null) {
  buttonsElem.innerHTML = '';

  if (buttons && buttons.length > 0) {
    buttons.forEach((b) => {
      const btn = document.createElement('button');
      btn.className = 'dialog-btn';
      btn.textContent = b.label;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        hideDialog();
        if (b.onClick) b.onClick();
        if (onComplete) onComplete();
      });
      buttonsElem.appendChild(btn);
    });
  } else {
    const btn = document.createElement('button');
    btn.className = 'dialog-btn';
    btn.textContent = 'Continuar';
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      hideDialog();
      if (onComplete) onComplete();
    });
    buttonsElem.appendChild(btn);
  }
}

export function hideDialog() {
  if (typingInterval) {
    clearInterval(typingInterval);
    typingInterval = null;
  }
  isTyping = false;
  currentButtons = null;
  currentOnComplete = null;
  isDialogOpen = false;
  cancelSpeech();

  if (dialogBox) {
    dialogBox.classList.add('hidden');
  }

  // Si hay diálogos esperando en la cola, mostrar el siguiente
  if (dialogQueue.length > 0) {
    const nextDialog = dialogQueue.shift();
    setTimeout(() => {
      showDialog(nextDialog);
    }, 60);
  }
}

// --- Sistema de Pensamientos del Jardinero ---
const thoughtQueue = [];
let isThoughtActive = false;
let isThoughtCooldownActive = false;
let thoughtActiveTimer = null;
let thoughtCooldownTimer = null;
let potConfirmChecker = null;
const modalBlockers = [];

export function setPotConfirmChecker(fn) {
  potConfirmChecker = fn;
}

export function registerModalBlocker(fn) {
  if (typeof fn === 'function' && !modalBlockers.includes(fn)) {
    modalBlockers.push(fn);
  }
}

export function canShowThought() {
  if (state.finalModo === 'silencio') return false;
  if (isAnyDialogOpen()) return false;
  if (potConfirmChecker && potConfirmChecker()) return false;
  for (let i = 0; i < modalBlockers.length; i++) {
    try {
      if (modalBlockers[i]()) return false;
    } catch (e) {
      // ignore
    }
  }
  if (isThoughtActive || isThoughtCooldownActive) return false;
  return true;
}

export function clearThoughtQueue() {
  thoughtQueue.length = 0;
  if (thoughtActiveTimer) {
    clearTimeout(thoughtActiveTimer);
    thoughtActiveTimer = null;
  }
  if (thoughtCooldownTimer) {
    clearTimeout(thoughtCooldownTimer);
    thoughtCooldownTimer = null;
  }
  isThoughtActive = false;
  isThoughtCooldownActive = false;
  if (thoughtBubble) {
    thoughtBubble.classList.add('hidden');
  }
  cancelSpeech();
}

/**
 * Mostrar un pensamiento del jardinero con cola, duración dinámica y voz en español
 * - Solo uno a la vez.
 * - Aparece arriba en pantalla cerca del jardinero (no en la esquina inferior).
 * - Duración proporcional a la longitud (4 a 7 segundos).
 * - Espera mínima (8-12s cafetería, 4-6s editores).
 * @param {string} text
 * @param {{x: number, y: number}} [screenCoords]
 * @param {boolean} [isEditor=false]
 */
export function showThought(text, screenCoords = null, isEditor = false) {
  initDialogs();

  // Condiciones de bloqueo estrictas: diálogos abiertos, pósters abiertos o confirmación de maceta
  if (state.finalModo === 'silencio' || isAnyDialogOpen()) return;
  if (potConfirmChecker && potConfirmChecker()) return;

  // Si ya hay un pensamiento activo o estamos en período de enfriamiento obligatorio, encolar
  if (isThoughtActive || isThoughtCooldownActive) {
    if (thoughtQueue.length < 2) {
      thoughtQueue.push({ text, screenCoords, isEditor });
    }
    return;
  }

  isThoughtActive = true;
  onThoughtStart();

  const thoughtText = thoughtBubble.querySelector('.thought-text');
  thoughtText.textContent = text;

  // Ubicación: cerca del jardinero y ARRIBA en pantalla (o centro superior en editores)
  if (screenCoords) {
    const posX = Math.min(window.innerWidth - 240, Math.max(240, screenCoords.x));
    const posY = Math.max(65, Math.min(window.innerHeight * 0.44, screenCoords.y - 15));
    thoughtBubble.style.left = `${posX}px`;
    thoughtBubble.style.top = `${posY}px`;
    thoughtBubble.style.transform = 'translate(-50%, -100%)';
  } else {
    thoughtBubble.style.left = '50%';
    thoughtBubble.style.top = '85px';
    thoughtBubble.style.transform = 'translate(-50%, 0)';
  }

  thoughtBubble.classList.remove('hidden');

  // Lectura en voz alta con Web Speech API
  speakGardener(text);

  // Duración en función de la longitud del texto (unos 4 a 7 segundos)
  const durationMs = Math.min(7000, Math.max(4000, Math.round(text.length * 70)));

  if (thoughtActiveTimer) clearTimeout(thoughtActiveTimer);
  thoughtActiveTimer = setTimeout(() => {
    hideThought(isEditor);
  }, durationMs);
}

export function hideThought(isEditor = false) {
  if (thoughtActiveTimer) {
    clearTimeout(thoughtActiveTimer);
    thoughtActiveTimer = null;
  }
  cancelSpeech();

  if (thoughtBubble && !thoughtBubble.classList.contains('hidden')) {
    thoughtBubble.classList.add('hidden');
    onThoughtEnd();
  }

  isThoughtActive = false;

  // Espera mínima obligatoria entre el final de uno y la aparición del siguiente:
  // - En editores: 4 a 6 segundos
  // - En cafetería: 8 a 12 segundos
  isThoughtCooldownActive = true;
  const cooldownMs = isEditor
    ? Math.round(4000 + Math.random() * 2000)
    : Math.round(8000 + Math.random() * 4000);

  if (thoughtCooldownTimer) clearTimeout(thoughtCooldownTimer);
  thoughtCooldownTimer = setTimeout(() => {
    isThoughtCooldownActive = false;

    // Si hay un pensamiento esperando en cola y se puede mostrar:
    if (thoughtQueue.length > 0 && canShowThought()) {
      const next = thoughtQueue.shift();
      showThought(next.text, next.screenCoords, next.isEditor);
    }
  }, cooldownMs);
}

/**
 * Mostrar la burbuja interactiva de opinión sobre la cabeza de un visitante
 * @param {object} options
 * @param {{x: number, y: number}} options.screenCoords
 * @param {string} [options.text]
 * @param {Function} options.onClick
 */
export function showVisitorBubble({ screenCoords, text = '...', onClick }) {
  initDialogs();
  const innerText = visitorBubble.querySelector('.vb-text');
  innerText.textContent = text;

  const posX = Math.min(window.innerWidth - 180, Math.max(30, screenCoords.x - 60));
  const posY = Math.max(40, screenCoords.y - 90);
  visitorBubble.style.left = `${posX}px`;
  visitorBubble.style.top = `${posY}px`;

  visitorBubble.onclick = (e) => {
    e.stopPropagation();
    hideVisitorBubble();
    if (onClick) onClick();
  };

  visitorBubble.classList.remove('hidden');
}

export function hideVisitorBubble() {
  if (visitorBubble) {
    visitorBubble.classList.add('hidden');
  }
}

export function updateVisitorBubblePosition(screenCoords) {
  if (!visitorBubble || visitorBubble.classList.contains('hidden') || !screenCoords) return;
  const posX = Math.min(window.innerWidth - 180, Math.max(30, screenCoords.x - 60));
  const posY = Math.max(40, screenCoords.y - 90);
  visitorBubble.style.left = `${posX}px`;
  visitorBubble.style.top = `${posY}px`;
}

export function isVisitorBubbleVisible() {
  return visitorBubble ? !visitorBubble.classList.contains('hidden') : false;
}

/**
 * Muestra el diálogo de opinión de un visitante con 3 opciones
 * @param {object} options
 * @param {string} options.visitorName
 * @param {string} options.text
 * @param {Function} options.onRefute
 * @param {Function} options.onConsider
 * @param {Function} options.onAccept
 */
export function showOpinionDialog({ visitorName, text, onRefute, onConsider, onAccept }) {
  showDialog({
    speaker: visitorName,
    text,
    buttons: [
      {
        label: module6Texts.btnRefute,
        onClick: onRefute
      },
      {
        label: module6Texts.btnConsider,
        onClick: onConsider
      },
      {
        label: module6Texts.btnAccept,
        onClick: onAccept
      }
    ]
  });
}

/**
 * Mostrar la vista ampliada de un póster o taza
 * @param {object} poster
 */
export function showPosterModal(poster) {
  initDialogs();
  hideAll();

  onPosterOpen();

  const quoteElem = posterModal.querySelector('.poster-preview-quote');
  const subElem = posterModal.querySelector('.poster-preview-sub');
  const thoughtElem = posterModal.querySelector('.poster-thought-text');
  const previewBox = posterModal.querySelector('.poster-preview');

  quoteElem.textContent = `"${poster.quote}"`;
  subElem.textContent = poster.subtext || '';
  thoughtElem.textContent = poster.gardenerThought;

  if (poster.gardenerThought) {
    speakGardener(poster.gardenerThought);
  }

  if (poster.palette) {
    previewBox.style.backgroundColor = poster.palette.bg;
    previewBox.style.borderColor = poster.palette.border;
    quoteElem.style.color = poster.palette.text;
  } else {
    previewBox.style.backgroundColor = '#f3ece2';
    previewBox.style.borderColor = '#7a6a5b';
    quoteElem.style.color = '#38312b';
  }

  posterModal.classList.remove('hidden');
}

export function hidePosterModal() {
  cancelSpeech();
  if (posterModal) {
    posterModal.classList.add('hidden');
    onPosterClose();
  }
}

/**
 * Mostrar el menú de opciones del jardín (Módulos 4 y 5)
 */
export function showGardenMenu({ onCreatePot, onFixGarden }) {
  initDialogs();
  hideAll();

  const btnCreate = gardenMenuModal.querySelector('#gm-create-pot');
  const btnFix = gardenMenuModal.querySelector('#gm-fix-garden');

  btnCreate.onclick = () => {
    hideGardenMenu();
    if (onCreatePot) onCreatePot();
  };

  btnFix.onclick = () => {
    hideGardenMenu();
    if (onFixGarden) onFixGarden();
  };

  gardenMenuModal.classList.remove('hidden');
}

export function hideGardenMenu() {
  if (gardenMenuModal) {
    gardenMenuModal.classList.add('hidden');
  }
}

/**
 * Visibilidad de la barra nocturna fija
 * @param {boolean} visible
 */
export function setNightBarVisible(visible) {
  initDialogs();
  if (visible) {
    nightActionBar.classList.remove('hidden');
    updatePendingBadge(state.nuevosPendientesCount);
  } else {
    nightActionBar.classList.add('hidden');
  }
}

/**
 * Actualizar el badge de nuevos pendientes
 * @param {number} count
 */
export function updatePendingBadge(count) {
  if (!pendingBadge) return;
  if (count > 0) {
    pendingBadge.textContent = String(count);
    pendingBadge.classList.remove('hidden');
  } else {
    pendingBadge.classList.add('hidden');
  }
}

/**
 * Modal de Historial de Pensamientos
 */
export function showThoughtsModal() {
  initDialogs();
  hideAll();

  const listContainer = thoughtsModal.querySelector('#tm-list');
  listContainer.innerHTML = '';

  const thoughts = state.pensamientosVistos || [];
  if (thoughts.length === 0) {
    listContainer.innerHTML = `<p class="app-empty-msg">${module6Texts.modalThoughtsEmpty}</p>`;
  } else {
    thoughts.forEach((t) => {
      const card = document.createElement('div');
      card.className = 'thought-log-card';
      card.innerHTML = `
        <div class="tl-header">
          <span class="tl-badge">Ciclo ${t.ciclo} &bull; ${t.fase === 'noche' ? 'Noche' : 'Día'}</span>
          <span class="tl-hour">${t.hora || ''}</span>
        </div>
        <p class="tl-text">"${t.text}"</p>
      `;
      listContainer.appendChild(card);
    });
  }

  thoughtsModal.classList.remove('hidden');
}

export function hideThoughtsModal() {
  if (thoughtsModal) {
    thoughtsModal.classList.add('hidden');
  }
}

/**
 * Modal de Sugerencias y Pendientes
 */
export function showPendingModal() {
  initDialogs();
  hideAll();

  marcarPendientesRevisados();

  const listContainer = pendingModal.querySelector('#pm-list');
  listContainer.innerHTML = '';

  const items = state.pendientes || [];
  if (items.length === 0) {
    listContainer.innerHTML = `<p class="app-empty-msg">${module6Texts.modalPendingEmpty}</p>`;
  } else {
    items.forEach((item) => {
      const card = document.createElement('div');
      card.className = `pending-card ${item.status === 'aceptado' ? 'accepted' : 'considered'}`;

      const statusBadge =
        item.status === 'aceptado'
          ? `<span class="badge-status accepted">${module6Texts.badgeAccepted}</span>`
          : `<span class="badge-status considered">${module6Texts.badgeConsidered}</span>`;

      const thumbImg = item.thumbnail
        ? `<img src="${item.thumbnail}" class="pending-thumb" alt="Miniatura del cambio sugerido" />`
        : `<div class="pending-thumb-placeholder">🌿</div>`;

      card.innerHTML = `
        <div class="pending-thumb-wrapper">${thumbImg}</div>
        <div class="pending-info">
          <div class="pending-header">
            <h4 class="pending-visitor-name">${item.visitorName || 'Visitante'}</h4>
            ${statusBadge}
          </div>
          <p class="pending-phrase">"${item.phrase || ''}"</p>
          <span class="pending-type-tag">Tipo: ${item.changeType} &bull; Ciclo ${item.ciclo} (${item.hora || ''})</span>
          <p class="pending-note">${item.status === 'aceptado' ? module6Texts.statusApplied : module6Texts.statusPending}</p>
        </div>
      `;
      listContainer.appendChild(card);
    });
  }

  pendingModal.classList.remove('hidden');
}

export function hidePendingModal() {
  if (pendingModal) {
    pendingModal.classList.add('hidden');
  }
}

/**
 * Pantalla de Desenlace Final (Ciclo 4)
 * @param {object} options
 * @param {'silencio' | 'duda'} options.modo
 * @param {object} options.stats
 */
export function showEndingScreen({ modo, stats }) {
  initDialogs();
  hideAll();

  const narrativeText = endingModal.querySelector('#ending-narrative-text');
  const statsBox = endingModal.querySelector('#ending-stats-box');

  if (modo === 'silencio') {
    narrativeText.textContent = module6Texts.applauseMany;
  } else {
    narrativeText.textContent = module6Texts.applauseFew;
  }

  const { aceptadas = 0, consideradas = 0, refutadas = 0 } = stats || {};
  statsBox.innerHTML = `
    <div class="stat-pill"><strong>${aceptadas}</strong> sugerencias aceptadas</div>
    <div class="stat-pill"><strong>${consideradas}</strong> sugerencias consideradas</div>
    <div class="stat-pill"><strong>${refutadas}</strong> opiniones refutadas</div>
  `;

  endingModal.classList.remove('hidden');
}

export function hideAll() {
  clearDialogQueue();
  clearThoughtQueue();
  cancelSpeech();
  hideDialog();
  hideThought();
  hideVisitorBubble();
  hidePosterModal();
  hideGardenMenu();
  hideThoughtsModal();
  hidePendingModal();
}

export function isAnyDialogOpen() {
  if (!dialogBox) return false;
  return (
    !dialogBox.classList.contains('hidden') ||
    (posterModal && !posterModal.classList.contains('hidden')) ||
    (gardenMenuModal && !gardenMenuModal.classList.contains('hidden')) ||
    (thoughtsModal && !thoughtsModal.classList.contains('hidden')) ||
    (pendingModal && !pendingModal.classList.contains('hidden')) ||
    (endingModal && !endingModal.classList.contains('hidden'))
  );
}
