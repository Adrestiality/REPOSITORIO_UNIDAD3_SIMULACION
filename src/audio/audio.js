import { state } from '../state.js';

/**
 * Sistema de Audio Procedural con Web Audio API
 * "Nadie lo verá completo" - Módulo 7
 *
 * Estética Ambient suave estilo Minecraft (C418):
 * - Notas largas de piano sintético y acordes lentos con reverb simulada por delay y filtros.
 * - 3 temas generados: Día, Noche y Edición de Jardín (transición suave de 1s).
 * - Cortes secos (silencio real) ante pensamientos, pósters, confirmaciones y pausas de visitantes.
 * - Sonidos ambientales: murmullo del café (escala con estrés), goteo lejano nocturno, zumbido de sala vacía.
 * - Efectos: pasos suaves del jardinero, clics táctiles, poda/borrado de voxels y aplausos procedurales.
 * - Sin archivos externos, sin librerías, 100% sintetizado.
 */

let audioCtx = null;
let isAudioUnlocked = false;

// Nodos principales del grafo de audio
let masterGain = null;
let musicGain = null;
let sfxGain = null;
let ambientGain = null;
let reverbInput = null;

// Sistema de música ambiente
let currentMusicTheme = 'dia'; // 'dia' | 'noche' | 'jardin' | 'silencio'
let isMusicCutDry = false;
let musicIntervalTimer = null;
let targetMusicVolume = 0.38;

// Ruido blanco/rosa precalculado en un buffer reutilizable
let noiseBuffer = null;

// Sonido de murmullo del café
let cafeMurmurSource = null;
let cafeMurmurFilter = null;
let cafeMurmurGain = null;

// Zumbido de cafetería vacía (room drone)
let roomDroneGain = null;

// Goteo lejano nocturno
let dripTimeout = null;

// Ruido filtrado de respiración tenue para la pausa del visitante
let breathSource = null;
let breathFilter = null;
let breathGain = null;

// Sistema de aplausos procedurales
let isApplauding = false;
let applauseInterval = null;

/**
 * Obtener o inicializar el contexto de audio
 */
function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
      setupAudioGraph();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Genera un buffer de ruido rosa (pink noise 1/f) cálido para el murmullo del café
 */
function createNoiseBuffer(ctx) {
  const bufferSize = ctx.sampleRate * 3;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
    b6 = white * 0.115926;
  }
  return buffer;
}

/**
 * Construcción del grafo de audio y red de reverberación simulada
 */
function setupAudioGraph() {
  const ctx = audioCtx;

  // Master Gain
  masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.75, ctx.currentTime);
  masterGain.connect(ctx.destination);

  // Bus de Música
  musicGain = ctx.createGain();
  musicGain.gain.setValueAtTime(targetMusicVolume, ctx.currentTime);
  musicGain.connect(masterGain);

  // Bus de Efectos
  sfxGain = ctx.createGain();
  sfxGain.gain.setValueAtTime(0.65, ctx.currentTime);
  sfxGain.connect(masterGain);

  // Bus de Ambiente
  ambientGain = ctx.createGain();
  ambientGain.gain.setValueAtTime(0.45, ctx.currentTime);
  ambientGain.connect(masterGain);

  // Reverb simulada tipo C418 (Red de retrasos retroalimentados con filtro paso bajo)
  reverbInput = ctx.createGain();
  reverbInput.gain.setValueAtTime(0.7, ctx.currentTime);

  const delayTimes = [0.185, 0.284, 0.412];
  const feedbackGains = [0.42, 0.38, 0.35];

  const reverbOutput = ctx.createGain();
  reverbOutput.gain.setValueAtTime(0.55, ctx.currentTime);
  reverbOutput.connect(masterGain);

  delayTimes.forEach((dt, idx) => {
    const delay = ctx.createDelay();
    delay.delayTime.setValueAtTime(dt, ctx.currentTime);

    const feedback = ctx.createGain();
    feedback.gain.setValueAtTime(feedbackGains[idx], ctx.currentTime);

    const dampFilter = ctx.createBiquadFilter();
    dampFilter.type = 'lowpass';
    dampFilter.frequency.setValueAtTime(2000, ctx.currentTime);

    // Entrada -> Delay -> Damp -> Feedback -> Delay
    reverbInput.connect(delay);
    delay.connect(dampFilter);
    dampFilter.connect(feedback);
    feedback.connect(delay);
    dampFilter.connect(reverbOutput);
  });

  // Crear buffer de ruido
  noiseBuffer = createNoiseBuffer(ctx);

  // Inicializar murmullo del café
  setupCafeMurmur();

  // Inicializar zumbido de sala vacía
  setupRoomDrone();

  // Iniciar el programador de música ambiente
  scheduleNextMusicPhrase();
}

/**
 * Configuración del murmullo del café de día (ruido filtrado que sube con el estrés)
 */
function setupCafeMurmur() {
  const ctx = audioCtx;
  if (!ctx || !noiseBuffer) return;

  cafeMurmurSource = ctx.createBufferSource();
  cafeMurmurSource.buffer = noiseBuffer;
  cafeMurmurSource.loop = true;

  // Filtro pasa banda para emular murmullo lejano de voces y vajilla
  cafeMurmurFilter = ctx.createBiquadFilter();
  cafeMurmurFilter.type = 'bandpass';
  cafeMurmurFilter.frequency.setValueAtTime(650, ctx.currentTime);
  cafeMurmurFilter.Q.setValueAtTime(1.2, ctx.currentTime);

  cafeMurmurGain = ctx.createGain();
  // Al inicio suave de día
  cafeMurmurGain.gain.setValueAtTime(state.fase === 'dia' ? 0.08 : 0.0, ctx.currentTime);

  cafeMurmurSource.connect(cafeMurmurFilter);
  cafeMurmurFilter.connect(cafeMurmurGain);
  cafeMurmurGain.connect(ambientGain);

  cafeMurmurSource.start();
}

/**
 * Configuración del zumbido sutil de lugar vacío (drone bajo)
 */
function setupRoomDrone() {
  const ctx = audioCtx;
  if (!ctx) return;

  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();

  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(55, ctx.currentTime); // La1 (55Hz)
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(110.2, ctx.currentTime); // La2 con ligero batimiento

  roomDroneGain = ctx.createGain();
  roomDroneGain.gain.setValueAtTime(0.04, ctx.currentTime);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(220, ctx.currentTime);

  osc1.connect(roomDroneGain);
  osc2.connect(roomDroneGain);
  roomDroneGain.connect(filter);
  filter.connect(ambientGain);

  osc1.start();
  osc2.start();
}

// =======================================================================
// 1) MÚSICA RELAJANTE TIPO C418 (PIANO SINTÉTICO, ACORDES LENTOS)
// =======================================================================

// Escalas y acordes por tema
const MUSIC_PALETTES = {
  dia: {
    // Cálido y tranquilo: Fa Mayor / Do Mayor / Pentatónica luminosa
    notes: [174.61, 220.0, 261.63, 329.63, 392.0, 440.0, 523.25, 659.25], // F3, A3, C4, E4, G4, A4, C5, E5
    filterFreq: 1400,
    chordSize: 2,
    intervalMin: 4.2,
    intervalMax: 6.8,
    decay: 3.8
  },
  noche: {
    // Frío y espaciado: Re menor / La menor / Dórico contemplativo
    notes: [146.83, 220.0, 261.63, 329.63, 349.23, 440.0, 523.25, 587.33], // D3, A3, C4, E4, F4, A4, C5, D5
    filterFreq: 950,
    chordSize: 1, // Más notas aisladas y solitarias
    intervalMin: 6.5,
    intervalMax: 10.0,
    decay: 4.6
  },
  jardin: {
    // Mínima y contemplativa: Notas cristalinas, campanitas y pausas largas
    notes: [329.63, 392.0, 493.88, 587.33, 659.25, 783.99, 987.77], // E4, G4, B4, D5, E5, G5, B5
    filterFreq: 2200,
    chordSize: 1,
    intervalMin: 5.5,
    intervalMax: 8.5,
    decay: 3.2
  }
};

/**
 * Toca una nota o acorde suave de piano sintético estilo C418
 * @param {Array<number>} freqs - Frecuencias en Hz
 * @param {number} filterFreq - Frecuencia de corte
 * @param {number} decayTime - Duración de la cola en segundos
 */
function playPianoNote(freqs, filterFreq = 1200, decayTime = 3.5) {
  const ctx = getAudioContext();
  if (!ctx || isMusicCutDry) return;

  const now = ctx.currentTime;

  freqs.forEach((freq) => {
    // Oscilador 1: Fundamental (seno puro)
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);

    // Oscilador 2: Segundo armónico tenue ligeramente desafinado (+3 cents) para calidez de piano
    const osc2 = ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, now);
    osc2.detune.setValueAtTime(3.5, now);

    // Ganancia envolvente ADSR de piano
    const noteGain = ctx.createGain();
    noteGain.gain.setValueAtTime(0.0001, now);
    // Ataque suave (25ms)
    noteGain.gain.exponentialRampToValueAtTime(0.22, now + 0.028);
    // Decaimiento exponencial largo y natural
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + decayTime);

    // Filtro paso bajo dinámico (abre un poco al pulsar y cierra despacio)
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(filterFreq * 1.3, now);
    filter.frequency.exponentialRampToValueAtTime(filterFreq * 0.7, now + decayTime * 0.85);

    // Conectar osciladores
    osc1.connect(noteGain);
    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.18, now);
    osc2.connect(subGain);
    subGain.connect(noteGain);

    noteGain.connect(filter);
    filter.connect(musicGain);

    // Envío a la reverb simulada
    if (reverbInput) {
      const sendGain = ctx.createGain();
      sendGain.gain.setValueAtTime(0.48, now);
      filter.connect(sendGain);
      sendGain.connect(reverbInput);
    }

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + decayTime + 0.1);
    osc2.stop(now + decayTime + 0.1);
  });
}

/**
 * Programa la siguiente frase o nota musical del tema actual
 */
function scheduleNextMusicPhrase() {
  if (musicIntervalTimer) {
    clearTimeout(musicIntervalTimer);
    musicIntervalTimer = null;
  }

  // Comprobar condición especial de la noche:
  // "Si el jugador aceptó más cambios de los que refutó, la noche siguiente tiene el goteo pero ninguna música"
  if (
    currentMusicTheme === 'noche' &&
    state.respuestasContador.aceptadas > state.respuestasContador.refutadas
  ) {
    // Silencio de música en esta noche; programar revisión en unos segundos
    musicIntervalTimer = setTimeout(scheduleNextMusicPhrase, 5000);
    return;
  }

  // Si el tema es silencio (por ejemplo, en el final con aplausos), no tocar nada
  if (currentMusicTheme === 'silencio') {
    return;
  }

  const palette = MUSIC_PALETTES[currentMusicTheme] || MUSIC_PALETTES.dia;

  if (!isMusicCutDry && isAudioUnlocked) {
    // Seleccionar 1 o 2 notas según la paleta
    const noteCount = palette.chordSize;
    const selectedFreqs = [];
    const available = [...palette.notes];

    for (let i = 0; i < noteCount && available.length > 0; i++) {
      const idx = Math.floor(Math.random() * available.length);
      selectedFreqs.push(available[idx]);
      available.splice(idx, 1);
    }

    playPianoNote(selectedFreqs, palette.filterFreq, palette.decay);
  }

  const nextDelay =
    palette.intervalMin + Math.random() * (palette.intervalMax - palette.intervalMin);

  musicIntervalTimer = setTimeout(scheduleNextMusicPhrase, nextDelay * 1000);
}

/**
 * Cambia el tema musical con una transición suave de 1 segundo
 * @param {'dia' | 'noche' | 'jardin' | 'silencio'} nuevoTema
 */
export function setMusicTheme(nuevoTema) {
  if (currentMusicTheme === nuevoTema) return;

  const ctx = getAudioContext();
  if (!ctx || !musicGain) {
    currentMusicTheme = nuevoTema;
    return;
  }

  const now = ctx.currentTime;
  const currentVal = musicGain.gain.value;

  // Fade out suave de 1 segundo
  musicGain.gain.cancelScheduledValues(now);
  musicGain.gain.setValueAtTime(currentVal, now);
  musicGain.gain.linearRampToValueAtTime(0.0001, now + 1.0);

  setTimeout(() => {
    currentMusicTheme = nuevoTema;

    // Si el nuevo tema no está silenciado por corte seco ni es silencio del final, fade in de 1s
    if (!isMusicCutDry && nuevoTema !== 'silencio') {
      // Verificar regla nocturna de mayoría aceptada
      if (
        nuevoTema === 'noche' &&
        state.respuestasContador.aceptadas > state.respuestasContador.refutadas
      ) {
        // En este caso la noche se queda sin música
        return;
      }

      const inTime = ctx.currentTime;
      musicGain.gain.cancelScheduledValues(inTime);
      musicGain.gain.setValueAtTime(0.0001, inTime);
      musicGain.gain.linearRampToValueAtTime(targetMusicVolume, inTime + 1.0);
    }

    scheduleNextMusicPhrase();
  }, 1000);
}

// =======================================================================
// 2) CORTES SECOS DE MÚSICA (SILENCIO REAL) Y REANUDACIÓN
// =======================================================================

/**
 * Detiene la música de golpe con silencio absoluto inmediato
 */
export function cutMusicDry() {
  isMusicCutDry = true;
  const ctx = getAudioContext();
  if (ctx && musicGain) {
    const now = ctx.currentTime;
    musicGain.gain.cancelScheduledValues(now);
    // Corte instantáneo a 0 (corte seco sin fade)
    musicGain.gain.setValueAtTime(0, now);
  }
}

/**
 * Reanuda la música con fade in suave
 * @param {number} [fadeDuration=1.2]
 */
export function resumeMusicSoft(fadeDuration = 1.2) {
  isMusicCutDry = false;
  const ctx = getAudioContext();
  if (ctx && musicGain && currentMusicTheme !== 'silencio') {
    // Comprobar regla de noche con mayoría aceptada
    if (
      currentMusicTheme === 'noche' &&
      state.respuestasContador.aceptadas > state.respuestasContador.refutadas
    ) {
      return;
    }

    const now = ctx.currentTime;
    musicGain.gain.cancelScheduledValues(now);
    musicGain.gain.setValueAtTime(0.0001, now);
    musicGain.gain.linearRampToValueAtTime(targetMusicVolume, now + fadeDuration);
  }
}

// (a) Pensamiento del jardinero
export function onThoughtStart() {
  cutMusicDry();
}

export function onThoughtEnd() {
  resumeMusicSoft(1.2);
}

// (b) Póster o taza ampliada
export function onPosterOpen() {
  cutMusicDry();
}

export function onPosterClose() {
  resumeMusicSoft(1.0);
}

// (c) Confirmación del editor de maceta
export function onConfirmOpen() {
  cutMusicDry();
}

export function onConfirmClose() {
  resumeMusicSoft(1.0);
}

// (d) Pausa de 2 segundos del visitante frente al jardín (se oye solo un leve respirar)
export function onVisitorPauseStart() {
  cutMusicDry();
  playVisitorBreath();
}

export function onVisitorPauseEnd() {
  stopVisitorBreath();
  // El diálogo se abrirá inmediatamente; la música reanudará al finalizar el diálogo o al despedir al visitante
}

/**
 * Sonido tenue de respiración filtrada durante la pausa muda del visitante
 */
function playVisitorBreath() {
  const ctx = getAudioContext();
  if (!ctx || !noiseBuffer) return;

  stopVisitorBreath();

  breathSource = ctx.createBufferSource();
  breathSource.buffer = noiseBuffer;
  breathSource.loop = true;

  breathFilter = ctx.createBiquadFilter();
  breathFilter.type = 'bandpass';
  breathFilter.frequency.setValueAtTime(420, ctx.currentTime);
  breathFilter.Q.setValueAtTime(2.2, ctx.currentTime);

  breathGain = ctx.createGain();
  const now = ctx.currentTime;
  breathGain.gain.setValueAtTime(0.001, now);
  // Respiración suave que sube y baja muy tenuemente
  breathGain.gain.linearRampToValueAtTime(0.035, now + 0.8);
  breathGain.gain.linearRampToValueAtTime(0.015, now + 1.8);

  breathSource.connect(breathFilter);
  breathFilter.connect(breathGain);
  breathGain.connect(ambientGain);

  breathSource.start(now);
}

function stopVisitorBreath() {
  if (breathSource) {
    try {
      breathSource.stop();
      breathSource.disconnect();
    } catch (_) {}
    breathSource = null;
  }
}

// =======================================================================
// 3) SILENCIOS ESPECIALES, TRANSICIÓN DE LETRERO Y GOTEO NOCTURNO
// =======================================================================

let nightSilenceTimeout = null;

/**
 * Al voltear el letrero:
 * Requisito 3: SILENCIO. Al cerrar el letrero, corte seco de todo el audio:
 * 2 segundos de silencio absoluto antes de que empiece el zumbido nocturno y la música nocturna (ahora más tenue y lejana).
 * @param {'dia' | 'noche'} nuevaFase
 */
export function onSignFlip(nuevaFase) {
  const ctx = getAudioContext();
  playClick(); // Clic del letrero de madera

  if (!ctx) return;
  const now = ctx.currentTime;

  if (nightSilenceTimeout) {
    clearTimeout(nightSilenceTimeout);
    nightSilenceTimeout = null;
  }

  if (nuevaFase === 'noche') {
    // Corte seco inmediato de todo el audio (silencio absoluto)
    isMusicCutDry = true;
    stopDripScheduler();

    if (musicGain) {
      musicGain.gain.cancelScheduledValues(now);
      musicGain.gain.setValueAtTime(0.0, now);
    }
    if (ambientGain) {
      ambientGain.gain.cancelScheduledValues(now);
      ambientGain.gain.setValueAtTime(0.0, now);
    }
    if (cafeMurmurGain) {
      cafeMurmurGain.gain.cancelScheduledValues(now);
      cafeMurmurGain.gain.setValueAtTime(0.0, now);
    }

    // 2 segundos de silencio absoluto
    nightSilenceTimeout = setTimeout(() => {
      nightSilenceTimeout = null;
      if (state.fase !== 'noche') return;

      const resumeNow = ctx.currentTime;
      isMusicCutDry = false;

      // Zumbido de cafetería vacía
      if (ambientGain) {
        ambientGain.gain.cancelScheduledValues(resumeNow);
        ambientGain.gain.setValueAtTime(0.0, resumeNow);
        ambientGain.gain.linearRampToValueAtTime(0.32, resumeNow + 1.2);
      }

      // Música nocturna ahora más tenue y lejana
      targetMusicVolume = 0.22;
      setMusicTheme('noche');

      // Iniciar goteo lejano nocturno
      startDripScheduler();
    }, 2000);
  } else {
    // Al abrir de día
    if (nightSilenceTimeout) {
      clearTimeout(nightSilenceTimeout);
      nightSilenceTimeout = null;
    }
    isMusicCutDry = false;
    stopDripScheduler();

    targetMusicVolume = 0.38;

    if (ambientGain) {
      ambientGain.gain.cancelScheduledValues(now);
      ambientGain.gain.setValueAtTime(0.0, now);
      ambientGain.gain.linearRampToValueAtTime(0.45, now + 1.0);
    }

    if (cafeMurmurFilter && cafeMurmurGain) {
      cafeMurmurFilter.frequency.cancelScheduledValues(now);
      cafeMurmurFilter.frequency.setValueAtTime(80, now);
      cafeMurmurFilter.frequency.exponentialRampToValueAtTime(650, now + 1.4);

      cafeMurmurGain.gain.cancelScheduledValues(now);
      cafeMurmurGain.gain.setValueAtTime(0.0, now);
      cafeMurmurGain.gain.linearRampToValueAtTime(0.08, now + 1.4);
    }

    setMusicTheme('dia');
  }
}

/**
 * Goteo lejano muy tenue con reverb larga para la noche
 */
function startDripScheduler() {
  stopDripScheduler();

  function triggerDrip() {
    if (state.fase !== 'noche') return;

    playSingleDrip();

    // Siguiente gota en 4.5 a 8.5 segundos
    const nextTime = 4.5 + Math.random() * 4.0;
    dripTimeout = setTimeout(triggerDrip, nextTime * 1000);
  }

  dripTimeout = setTimeout(triggerDrip, 3000);
}

function stopDripScheduler() {
  if (dripTimeout) {
    clearTimeout(dripTimeout);
    dripTimeout = null;
  }
}

/**
 * Síntesis de una gota de agua solitaria y lejana
 */
function playSingleDrip() {
  const ctx = getAudioContext();
  if (!ctx || !reverbInput) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const dripGain = ctx.createGain();

  // Frecuencia con caída rápida de tono (pitch drop característico de una gota)
  const baseFreq = 1400 + Math.random() * 500;
  osc.type = 'sine';
  osc.frequency.setValueAtTime(baseFreq, now);
  osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.55, now + 0.045);

  dripGain.gain.setValueAtTime(0.001, now);
  dripGain.gain.linearRampToValueAtTime(0.08, now + 0.006);
  dripGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.065);

  osc.connect(dripGain);

  // Se envía principalmente a la reverb larga para que suene lejana y en el fondo
  dripGain.connect(reverbInput);

  osc.start(now);
  osc.stop(now + 0.08);
}

// =======================================================================
// 4) EFECTOS DE SONIDO (PASOS, CLICS, PODA DE VOXELS, APLAUSOS)
// =======================================================================

/**
 * Pasos suaves y apagados del jardinero sobre el suelo de madera
 */
let lastStepTime = 0;
export function playFootstep() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  if (now - lastStepTime < 0.28) return; // Evitar disparos repetidos
  lastStepTime = now;

  // Golpe bajo sordo
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  const freq = 75 + Math.random() * 15;
  osc.frequency.setValueAtTime(freq, now);
  osc.frequency.exponentialRampToValueAtTime(35, now + 0.05);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.09, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

  osc.connect(gain);
  gain.connect(sfxGain);

  osc.start(now);
  osc.stop(now + 0.06);

  // Fricción tenue de suela
  if (noiseBuffer) {
    const nSource = ctx.createBufferSource();
    nSource.buffer = noiseBuffer;

    const nFilter = ctx.createBiquadFilter();
    nFilter.type = 'bandpass';
    nFilter.frequency.setValueAtTime(240, now);
    nFilter.Q.setValueAtTime(1.5, now);

    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.03, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    nSource.connect(nFilter);
    nFilter.connect(nGain);
    nGain.connect(sfxGain);

    nSource.start(now);
    nSource.stop(now + 0.05);
  }
}

/**
 * Clic sutil de objetos, letrero o botones
 */
export function playClick() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(1400, now);
  osc.frequency.exponentialRampToValueAtTime(450, now + 0.035);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  osc.connect(gain);
  gain.connect(sfxGain);

  osc.start(now);
  osc.stop(now + 0.045);
}

/**
 * Sonido de borrado/poda de voxels en el taller de macetas (corte de tijera / snip vegetal)
 */
export function playVoxelErase() {
  const ctx = getAudioContext();
  if (!ctx || !noiseBuffer) return;

  const now = ctx.currentTime;

  // Ruido filtrado agudo simulando tijera cortando rama
  const source = ctx.createBufferSource();
  source.buffer = noiseBuffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(3200 + Math.random() * 400, now);
  filter.Q.setValueAtTime(3.0, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.16, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(sfxGain);

  source.start(now);
  source.stop(now + 0.06);

  // Pequeño chasquido de madera
  const clickOsc = ctx.createOscillator();
  clickOsc.type = 'sine';
  clickOsc.frequency.setValueAtTime(800, now);
  clickOsc.frequency.exponentialRampToValueAtTime(200, now + 0.02);

  const clickGain = ctx.createGain();
  clickGain.gain.setValueAtTime(0.08, now);
  clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

  clickOsc.connect(clickGain);
  clickGain.connect(sfxGain);

  clickOsc.start(now);
  clickOsc.stop(now + 0.03);
}

/**
 * Inicia la síntesis de aplausos procedurales para el final
 * (En el final con aplausos no hay música)
 * @param {boolean} isFull - Si es mayoría aceptadas aplauden muchos; si no, pocos
 */
export function startApplause(isFull = true) {
  // En el final con aplausos no hay música
  setMusicTheme('silencio');
  cutMusicDry();

  isApplauding = true;
  const ctx = getAudioContext();
  if (!ctx || !noiseBuffer) return;

  const clapRate = isFull ? 24 : 10; // Ráfagas por segundo
  const intervalMs = Math.floor(1000 / clapRate);

  if (applauseInterval) clearInterval(applauseInterval);

  applauseInterval = setInterval(() => {
    if (!isApplauding) return;

    const now = ctx.currentTime;
    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000 + Math.random() * 1200, now);
    filter.Q.setValueAtTime(2.2, now);

    const gain = ctx.createGain();
    const vol = isFull ? 0.08 + Math.random() * 0.07 : 0.03 + Math.random() * 0.04;
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(sfxGain);

    if (reverbInput) {
      gain.connect(reverbInput);
    }

    source.start(now);
    source.stop(now + 0.05);
  }, intervalMs);
}

/**
 * Detiene los aplausos
 */
export function stopApplause() {
  isApplauding = false;
  if (applauseInterval) {
    clearInterval(applauseInterval);
    applauseInterval = null;
  }
}

// =======================================================================
// ACTUALIZACIÓN DINÁMICA POR FRAME (ESTRÉS Y AMBIENTE)
// =======================================================================

/**
 * Actualiza modulaciones de murmullo con el estrés del día
 * @param {number} delta
/**
 * Sonido procedimental de servir café: tintineo de porcelana y vertido cálido
 */
export function playServeCoffee() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  // Tintineo sutil de taza de cerámica (porcelana)
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(1760, now);
  osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

  osc.connect(gain);
  gain.connect(sfxGain);

  osc.start(now);
  osc.stop(now + 0.1);

  // Vertido breve de café caliente
  if (noiseBuffer) {
    const pSource = ctx.createBufferSource();
    pSource.buffer = noiseBuffer;
    const pFilter = ctx.createBiquadFilter();
    pFilter.type = 'bandpass';
    pFilter.frequency.setValueAtTime(900, now + 0.03);
    pFilter.Q.setValueAtTime(2.5, now + 0.03);

    const pGain = ctx.createGain();
    pGain.gain.setValueAtTime(0.001, now + 0.03);
    pGain.gain.linearRampToValueAtTime(0.05, now + 0.07);
    pGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    pSource.connect(pFilter);
    pFilter.connect(pGain);
    pGain.connect(sfxGain);

    pSource.start(now + 0.03);
    pSource.stop(now + 0.24);
  }
}

/**
 * Actualización frame a frame del audio según estado del juego
 * Requisito 2: Cada conversación aumenta el estrés; el murmullo del café sube con saltos notables.
 * Tras 3 a 4 mesas, el sonido es denso y casi insoportable.
 * @param {number} delta
 * @param {object} gameState
 */
export function updateAudio(delta, gameState) {
  if (!audioCtx || !isAudioUnlocked) return;

  if (gameState.fase === 'dia' && cafeMurmurGain && cafeMurmurFilter && !isMusicCutDry) {
    const stress = gameState.estres || 0; // 0.0 a 1.0+
    const tablesCount = (gameState.mesasAtendidasDia && gameState.mesasAtendidasDia.length) || 0;
    const tableRatio = tablesCount / 4;
    const combined = Math.max(stress, tableRatio);

    // Salto notable de volumen y frecuencia por mesa:
    // 0 mesas: 0.07
    // 1 mesa: 0.18
    // 2 mesas: 0.32
    // 3 mesas: 0.48
    // 4 mesas: 0.65 (murmullo denso y agobiante)
    const targetVol = 0.07 + combined * 0.58;
    const targetFreq = 500 + combined * 1400; // 500Hz a 1900Hz

    const now = audioCtx.currentTime;
    cafeMurmurGain.gain.setTargetAtTime(targetVol, now, 0.15);
    cafeMurmurFilter.frequency.setTargetAtTime(targetFreq, now, 0.15);
  }
}

// =======================================================================
// DESBLOQUEO POR GESTO DEL USUARIO (POLÍTICA DE AUTOPLAY)
// =======================================================================

/**
 * Desbloquea el audio en la primera interacción del jugador
 */
export function unlockAudio() {
  if (isAudioUnlocked) return;
  const ctx = getAudioContext();
  if (ctx) {
    isAudioUnlocked = true;
    console.log(
      '%c 🎵 Audio Web API Inicializado %c - Estilo Ambient C418 activado.',
      'background: #4a6344; color: #fff; font-weight: bold; padding: 4px 8px; border-radius: 4px;',
      'color: #b5d4ab;'
    );

    // Ajustar tema inicial según la fase del juego
    setMusicTheme(state.fase === 'dia' ? 'dia' : 'noche');
  }
}

// Escuchar primer clic o tecla del usuario para desbloquear el audio
if (typeof window !== 'undefined') {
  const onFirstInteraction = () => {
    unlockAudio();
    window.removeEventListener('pointerdown', onFirstInteraction);
    window.removeEventListener('keydown', onFirstInteraction);
  };
  window.addEventListener('pointerdown', onFirstInteraction);
  window.addEventListener('keydown', onFirstInteraction);
}
