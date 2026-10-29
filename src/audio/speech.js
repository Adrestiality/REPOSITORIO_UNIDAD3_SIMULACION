/**
 * Módulo de Voz del Jardinero con Web Speech API (speechSynthesis)
 * "Nadie lo verá completo" - Voz interior en español
 *
 * - Lee en voz alta pensamientos y diálogos del jardinero.
 * - Selecciona preferentemente una voz femenina en español si existe en el navegador.
 * - Si llega otro pensamiento o diálogo, cancela inmediatamente el anterior.
 * - Incluye botón flotante de altavoz (🔊 / 🔇) para silenciar/activar.
 * - Si el navegador no soporta síntesis o no tiene voces en español, se desactiva sin romper nada.
 */

let synth = null;
let chosenVoice = null;
let hasCheckedVoices = false;
let isMuted = false;
let isSupported = false;
let speakerBtn = null;

// Palabras clave para detectar voces femeninas en español
const FEMALE_KEYWORDS = [
  'female', 'mujer', 'sabina', 'helena', 'monica', 'mónica', 'laura', 'lucia', 'lucía',
  'paulina', 'soledad', 'elena', 'rosa', 'francisca', 'hilda', 'zira', 'carmen',
  'penelope', 'penélope', 'juana', 'maria', 'maría', 'conchita', 'lupe', 'mia', 'mía', 'victoria'
];

/**
 * Inicializar el sintetizador de voz y cargar las voces disponibles
 */
export function initSpeech() {
  if (typeof window === 'undefined') return;

  if ('speechSynthesis' in window) {
    synth = window.speechSynthesis;
    isSupported = true;

    loadVoices();
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = loadVoices;
    }
  } else {
    isSupported = false;
  }

  createSpeakerButton();
}

/**
 * Cargar y seleccionar la mejor voz en español (prioridad femenina)
 */
function loadVoices() {
  if (!synth) return;
  const voices = synth.getVoices() || [];
  if (voices.length === 0) return;

  hasCheckedVoices = true;

  // Filtrar voces en español
  const spanishVoices = voices.filter((v) => {
    const lang = (v.lang || '').toLowerCase();
    return lang.startsWith('es') || lang.includes('spa');
  });

  if (spanishVoices.length === 0) {
    chosenVoice = null;
    return;
  }

  // Buscar una voz femenina en español
  const femaleSpanish = spanishVoices.find((v) => {
    const name = (v.name || '').toLowerCase();
    return FEMALE_KEYWORDS.some((kw) => name.includes(kw));
  });

  chosenVoice = femaleSpanish || spanishVoices[0];
}

/**
 * Leer texto en voz alta con la voz interior del jardinero
 * @param {string} text
 */
export function speakGardener(text) {
  if (!isSupported || !synth || isMuted || !text) return;

  // Si no se han cargado las voces aún, intentar cargarlas
  if (!hasCheckedVoices) {
    loadVoices();
  }

  // Cancelar inmediatamente cualquier lectura anterior
  try {
    synth.cancel();
  } catch (err) {
    // Silencioso
  }

  try {
    const cleanText = text.replace(/[{}]/g, '').trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);

    if (chosenVoice) {
      utterance.voice = chosenVoice;
      utterance.lang = chosenVoice.lang || 'es-ES';
    } else {
      utterance.lang = 'es-ES';
    }

    // Tono sereno y cadencia ligeramente pausada para la voz interior
    utterance.pitch = 1.05;
    utterance.rate = 0.94;
    utterance.volume = 1.0;

    synth.speak(utterance);
  } catch (e) {
    console.warn('Web Speech API no disponible en este entorno:', e);
  }
}

/**
 * Cancelar de inmediato cualquier audio de voz en curso
 */
export function cancelSpeech() {
  if (!synth) return;
  try {
    synth.cancel();
  } catch (err) {
    // Silencioso
  }
}

/**
 * Alternar silencio de voz
 */
export function toggleSpeechMute() {
  isMuted = !isMuted;
  if (isMuted) {
    cancelSpeech();
  }
  updateSpeakerButtonUI();
  return isMuted;
}

export function isSpeechMuted() {
  return isMuted;
}

export function isSpeechSupported() {
  return isSupported && chosenVoice !== null;
}

/**
 * Crear el botón flotante en la esquina superior para silenciar/activar
 */
function createSpeakerButton() {
  if (speakerBtn || typeof document === 'undefined') return;

  speakerBtn = document.createElement('button');
  speakerBtn.id = 'speech-toggle-btn';
  speakerBtn.className = 'speech-toggle-btn';
  speakerBtn.setAttribute('type', 'button');
  speakerBtn.setAttribute('aria-label', 'Silenciar voz interior de la jardinera');
  speakerBtn.title = 'Voz interior de la jardinera: Activa (Clic para silenciar)';
  speakerBtn.innerHTML = '🔊';

  speakerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleSpeechMute();
  });

  document.body.appendChild(speakerBtn);
}

function updateSpeakerButtonUI() {
  if (!speakerBtn) return;
  if (isMuted) {
    speakerBtn.innerHTML = '🔇';
    speakerBtn.classList.add('muted');
    speakerBtn.title = 'Voz interior de la jardinera: Silenciada (Clic para activar)';
  } else {
    speakerBtn.innerHTML = '🔊';
    speakerBtn.classList.remove('muted');
    speakerBtn.title = 'Voz interior de la jardinera: Activa (Clic para silenciar)';
  }
}
