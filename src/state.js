import { createInitialGrid } from './data/gardenData.js';

/**
 * Estado global del juego: "Nadie lo verá completo"
 * Módulos 1 a 5
 */
export const state = {
  cicloActual: 1,
  fase: 'dia', // 'dia' | 'noche'
  letreroEstado: 'abierto', // 'abierto' | 'cerrado'
  hora: '08:00',
  horaDecimal: 8.0,
  tiempoDia: 0, // Segundos transcurridos en el día
  estres: 0.0, // 0.0 a 1.0 (y > 1.0 en estrés crítico)
  bloqueadoInteraccion: false,
  objetosTocados: new Set(),
  objetosTocadosNoche: new Set(), // Objetos olvidados tocados en la noche actual
  postersVistosNoche: new Set(), // Pósters o tazas vistas en la noche actual
  jardinDesbloqueado: false, // Desbloqueo tras tocar 3 objetos o póster + 2 objetos
  macetasCreadas: [], // Registro de macetas creadas en el editor (Módulo 4)
  gardenName: 'Jardín de la cafetería', // Nombre del jardín del día (Módulo 5)
  gardenGrid: createInitialGrid(), // Cuadrícula 5x5 con 5 plantas iniciales (Módulo 5)
  // Módulo 6: Bucle completo de 4 días, opiniones, pendientes y final
  maxCiclos: 4,
  respuestasContador: { aceptadas: 0, consideradas: 0, refutadas: 0 },
  pendientes: [], // Registro de cambios considerados o aceptados
  pensamientosVistos: [], // Historial de reflexiones de la jardinera
  nuevosPendientesCount: 0, // Badge de notificación para la UI nocturna
  usoJardineroAutomatico: false, // Indicador si se utilizó la jardinera automática en el Taller de Macetas
  mesasAtendidasDia: [], // IDs de mesas atendidas durante el día actual
  mesaActivaId: null, // ID de la mesa esperando café actualmente
  juegoFinalizado: false,
  finalModo: null, // 'silencio' | 'duda'
  listeners: []
};

/**
 * Suscribirse a cambios en el estado
 * @param {Function} callback - fn(prop, value, state)
 * @returns {Function} unsubscribe
 */
export function subscribe(callback) {
  state.listeners.push(callback);
  return () => {
    state.listeners = state.listeners.filter((fn) => fn !== callback);
  };
}

/**
 * Notificar a los listeners sobre un cambio
 * @param {string} prop
 * @param {any} value
 */
export function notify(prop, value) {
  for (const listener of state.listeners) {
    try {
      listener(prop, value, state);
    } catch (err) {
      console.error('Error en listener de estado:', err);
    }
  }
}

/**
 * Obtener la hora actual en formato de texto
 * @returns {string} ej. "08:30"
 */
export function getHour() {
  return state.hora;
}

/**
 * Actualizar la hora interna
 * @param {number} hourDecimal - hora en float (ej. 8.5 -> 08:30)
 */
export function updateTime(hourDecimal) {
  state.horaDecimal = hourDecimal;
  const h = Math.floor(hourDecimal);
  const m = Math.floor((hourDecimal - h) * 60);
  const hStr = String(h).padStart(2, '0');
  const mStr = String(m).padStart(2, '0');
  const nuevaHora = `${hStr}:${mStr}`;
  if (nuevaHora !== state.hora) {
    state.hora = nuevaHora;
    notify('hora', nuevaHora);
  }
}

/**
 * Iniciar el día (Día nuevo o reapertura)
 * @param {number} [ciclo] - Número de ciclo opcional
 */
export function startDay(ciclo) {
  if (ciclo !== undefined && ciclo !== null) {
    state.cicloActual = ciclo;
  }
  state.fase = 'dia';
  state.letreroEstado = 'abierto';
  state.tiempoDia = 0;
  state.estres = 0;
  state.bloqueadoInteraccion = false;
  state.mesasAtendidasDia = [];
  state.mesaActivaId = null;
  state.objetosTocadosNoche.clear();
  state.postersVistosNoche.clear();
  updateTime(8.0);

  notify('cicloActual', state.cicloActual);
  notify('fase', 'dia');
  notify('letreroEstado', 'abierto');
  notify('estres', 0);
  notify('mesasAtendidasDia', []);
  notify('mesaActivaId', null);
  notify('startDay', state.cicloActual);
}

/**
 * Iniciar la noche (Cierre de cafetería)
 * @param {number} [ciclo] - Número de ciclo actual
 */
export function startNight(ciclo) {
  if (ciclo !== undefined && ciclo !== null) {
    state.cicloActual = ciclo;
  }
  state.fase = 'noche';
  state.letreroEstado = 'cerrado';
  state.estres = 0;
  state.mesaActivaId = null;
  state.objetosTocadosNoche.clear();
  state.postersVistosNoche.clear();
  updateTime(19.0);

  notify('fase', 'noche');
  notify('letreroEstado', 'cerrado');
  notify('estres', 0);
  notify('mesaActivaId', null);
  notify('startNight', state.cicloActual);
}

/**
 * Registrar una mesa atendida durante el día
 * @param {string} tableId
 */
export function registrarMesaAtendida(tableId) {
  if (!state.mesasAtendidasDia.includes(tableId)) {
    state.mesasAtendidasDia.push(tableId);
    notify('mesasAtendidasDia', [...state.mesasAtendidasDia]);
  }
}

/**
 * Establecer la mesa que actualmente espera café
 * @param {string|null} tableId
 */
export function setMesaActiva(tableId) {
  state.mesaActivaId = tableId;
  notify('mesaActivaId', tableId);
}

/**
 * Cambiar fase directamente
 * @param {'dia' | 'noche'} nuevaFase
 */
export function setFase(nuevaFase) {
  if (nuevaFase === 'dia') {
    startDay(state.cicloActual);
  } else if (nuevaFase === 'noche') {
    startNight(state.cicloActual);
  }
}

/**
 * Registrar interacción nocturna (objeto olvidado o póster)
 * Verifica si se cumple la condición de desbloqueo del jardín
 * @param {'objeto' | 'poster'} type
 * @param {string} id
 */
export function registrarInteraccionNocturna(type, id) {
  if (type === 'objeto') {
    state.objetosTocadosNoche.add(id);
    state.objetosTocados.add(id);
  } else if (type === 'poster') {
    state.postersVistosNoche.add(id);
  }

  notify('objetosTocadosNoche', Array.from(state.objetosTocadosNoche));

  // Condición de desbloqueo:
  // Al menos 3 objetos o pósters tocados durante la noche
  const objCount = state.objetosTocadosNoche.size;
  const posterCount = state.postersVistosNoche.size;

  const cumpleDesbloqueo = (objCount + posterCount) >= 3;

  if (cumpleDesbloqueo && !state.jardinDesbloqueado) {
    state.jardinDesbloqueado = true;
    console.log(
      '%c 🌿 Evento: gardenUnlocked %c - El jardín de la cafetería ha sido desbloqueado. Comienza a emitir un brillo suave.',
      'background: #56734c; color: #ffffff; font-weight: bold; padding: 4px 8px; border-radius: 4px;',
      'color: #92b888;'
    );
    notify('gardenUnlocked', true);
  }
}

/**
 * Registrar un objeto interactuado/tocado general
 * @param {string} objetoId
 */
export function registrarObjetoTocado(objetoId) {
  if (!state.objetosTocados.has(objetoId)) {
    state.objetosTocados.add(objetoId);
    notify('objetosTocados', Array.from(state.objetosTocados));
  }
}

/**
 * Verificar si un objeto ha sido tocado
 * @param {string} objetoId
 * @returns {boolean}
 */
export function haSidoTocado(objetoId) {
  return state.objetosTocados.has(objetoId);
}

/**
 * Reiniciar objetos tocados
 */
export function reiniciarObjetosTocados() {
  state.objetosTocados.clear();
  state.objetosTocadosNoche.clear();
  state.postersVistosNoche.clear();
  notify('objetosTocados', []);
}

/**
 * Guardar una nueva maceta creada en el editor (Módulo 4)
 * @param {object} nuevaMaceta
 * @param {string} nuevaMaceta.etiqueta - Texto de lo que se desea transmitir
 * @param {Array<boolean>} nuevaMaceta.voxelGrid - Array plano de 12x12x12 voxels
 * @param {Array<object>} nuevaMaceta.flores - Flores colocadas
 * @param {number|string} nuevaMaceta.color - Color principal
 */
export function guardarMaceta(nuevaMaceta) {
  const macetaData = {
    id: `maceta_${Date.now()}`,
    ciclo: state.cicloActual,
    horaCreacion: state.hora,
    ...nuevaMaceta
  };

  state.macetasCreadas.push(macetaData);

  console.log(
    '%c 🪴 Evento: potCreated %c - Nueva planta/maceta guardada con éxito:',
    'background: #738a6e; color: #ffffff; font-weight: bold; padding: 4px 8px; border-radius: 4px;',
    'color: #92b888;',
    macetaData
  );

  if (nuevaMaceta && nuevaMaceta.esAutomatica) {
    state.usoJardineroAutomatico = true;
    notify('usoJardineroAutomatico', true);
  }

  notify('potCreated', macetaData);
  return macetaData;
}

// --- Módulo 5: Métodos de Gestión del Jardín 5x5 y Nombre ---

/**
 * Establecer y notificar el nombre del jardín
 * @param {string} name
 */
export function setGardenName(name) {
  state.gardenName = (name && name.trim()) || 'Jardín de la cafetería';
  notify('gardenName', state.gardenName);
}

/**
 * Obtener el nombre actual del jardín
 * @returns {string}
 */
export function getGardenName() {
  return state.gardenName;
}

/**
 * Obtener la cuadrícula actual del jardín (array de 25 celdas)
 * @returns {Array<object|null>}
 */
export function getGardenGrid() {
  return state.gardenGrid;
}

/**
 * Contar cuántas plantas hay actualmente en el jardín
 * @returns {number}
 */
export function getPlantCount() {
  return state.gardenGrid.reduce((acc, cell) => (cell !== null ? acc + 1 : acc), 0);
}

/**
 * Actualizar la cuadrícula completa del jardín
 * @param {Array<object|null>} newGrid
 */
export function setGardenGrid(newGrid) {
  state.gardenGrid = [...newGrid];
  notify('gardenGrid', state.gardenGrid);
}

/**
 * Añadir una planta a la primera celda libre de la cuadrícula
 * @param {object} plantData
 * @returns {{ row: number, col: number, plant: object } | null}
 */
export function addPlantToGrid(plantData) {
  if (getPlantCount() >= 25) {
    return null; // Cuadrícula llena
  }

  // Si especifica celda y está libre, usarla
  if (
    plantData.row !== undefined &&
    plantData.col !== undefined &&
    plantData.row >= 0 && plantData.row < 5 &&
    plantData.col >= 0 && plantData.col < 5
  ) {
    const idx = plantData.row * 5 + plantData.col;
    if (state.gardenGrid[idx] === null) {
      const normalizedFlores = plantData.flores
        ? plantData.flores.map((f) => ({
            ...f,
            color: f.color !== undefined ? f.color : f.colorHex,
            colorHex: f.colorHex !== undefined ? f.colorHex : f.color
          }))
        : [];
      const plant = { ...plantData, flores: normalizedFlores };
      state.gardenGrid[idx] = plant;
      notify('gardenGrid', state.gardenGrid);
      return { row: plantData.row, col: plantData.col, plant };
    }
  }

  // Buscar la primera celda vacía
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const idx = r * 5 + c;
      if (state.gardenGrid[idx] === null) {
        const normalizedFlores = plantData.flores
          ? plantData.flores.map((f) => ({
              ...f,
              color: f.color !== undefined ? f.color : f.colorHex,
              colorHex: f.colorHex !== undefined ? f.colorHex : f.color
            }))
          : [];
        const plant = {
          ...plantData,
          row: r,
          col: c,
          flores: normalizedFlores
        };
        state.gardenGrid[idx] = plant;
        notify('gardenGrid', state.gardenGrid);
        return { row: r, col: c, plant };
      }
    }
  }

  return null;
}

/**
 * Mover una planta de una celda a otra celda libre
 * @param {number} fromRow
 * @param {number} fromCol
 * @param {number} toRow
 * @param {number} toCol
 * @returns {boolean}
 */
export function movePlantInGrid(fromRow, fromCol, toRow, toCol) {
  if (fromRow < 0 || fromRow >= 5 || fromCol < 0 || fromCol >= 5) return false;
  if (toRow < 0 || toRow >= 5 || toCol < 0 || toCol >= 5) return false;

  const fromIdx = fromRow * 5 + fromCol;
  const toIdx = toRow * 5 + toCol;

  const plant = state.gardenGrid[fromIdx];
  if (!plant) return false;
  if (state.gardenGrid[toIdx] !== null && fromIdx !== toIdx) return false; // Celda de destino ocupada

  state.gardenGrid[fromIdx] = null;
  plant.row = toRow;
  plant.col = toCol;
  state.gardenGrid[toIdx] = plant;

  notify('gardenGrid', state.gardenGrid);
  return true;
}

/**
 * Quitar una planta de una celda
 * Regla: El jardín nunca puede quedar vacío (mínimo 1 planta)
 * @param {number} row
 * @param {number} col
 * @returns {boolean} true si se pudo quitar, false si es la última planta o celda vacía
 */
export function removePlantFromGrid(row, col) {
  if (row < 0 || row >= 5 || col < 0 || col >= 5) return false;
  const idx = row * 5 + col;
  if (state.gardenGrid[idx] === null) return false;

  // No permitir quitar si solo queda 1 planta
  if (getPlantCount() <= 1) {
    return false;
  }

  state.gardenGrid[idx] = null;
  notify('gardenGrid', state.gardenGrid);
  return true;
}

/**
 * Añadir flores a una planta en la celda
 * @param {number} row
 * @param {number} col
 * @param {number|string} flowerColor
 * @returns {boolean}
 */
export function addFlowerToPlantInGrid(row, col, flowerColor = 0xffb703) {
  if (row < 0 || row >= 5 || col < 0 || col >= 5) return false;
  const idx = row * 5 + col;
  const plant = state.gardenGrid[idx];
  if (!plant) return false;

  if (!plant.flores) plant.flores = [];
  plant.flores.push({
    color: typeof flowerColor === 'string' && flowerColor.startsWith('#')
      ? parseInt(flowerColor.replace('#', '0x'), 16)
      : flowerColor,
    height: 0.44
  });

  notify('gardenGrid', state.gardenGrid);
  return true;
}

// --- Módulo 6: Métodos del Bucle Completo (Opiniones, Pendientes, Pensamientos y Final) ---

/**
 * Registrar una respuesta del jardinero a una opinión
 * @param {'aceptadas' | 'consideradas' | 'refutadas'} tipo
 * @param {object} [pendienteData]
 */
export function registrarRespuesta(tipo, pendienteData = null) {
  if (state.respuestasContador[tipo] !== undefined) {
    state.respuestasContador[tipo]++;
  }

  if (pendienteData && (tipo === 'aceptadas' || tipo === 'consideradas')) {
    const item = {
      id: `pend_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ciclo: state.cicloActual,
      hora: state.hora,
      status: tipo === 'aceptadas' ? 'aceptado' : 'considerado',
      ...pendienteData
    };
    state.pendientes.unshift(item);

    if (tipo === 'consideradas') {
      state.nuevosPendientesCount++;
      notify('nuevosPendientesCount', state.nuevosPendientesCount);
    }

    notify('pendientes', state.pendientes);
  }

  notify('respuestasContador', { ...state.respuestasContador });
}

/**
 * Registrar un pensamiento reflexivo visto del jardinero
 * @param {string} text
 * @param {string} [tipo='espontaneo']
 */
export function registrarPensamientoVisto(text, tipo = 'espontaneo') {
  if (!text || typeof text !== 'string') return;
  // Evitar duplicados inmediatos
  if (state.pensamientosVistos.length > 0 && state.pensamientosVistos[0].text === text) {
    return;
  }

  const pItem = {
    id: `pens_${Date.now()}`,
    text,
    tipo,
    hora: state.hora,
    fase: state.fase,
    ciclo: state.cicloActual
  };

  state.pensamientosVistos.unshift(pItem);
  notify('pensamientosVistos', state.pensamientosVistos);
}

/**
 * Limpiar el contador de nuevos pendientes al abrir el menú nocturno
 */
export function marcarPendientesRevisados() {
  if (state.nuevosPendientesCount > 0) {
    state.nuevosPendientesCount = 0;
    notify('nuevosPendientesCount', 0);
  }
}

/**
 * Finalizar el juego en el Ciclo 4
 * @param {'silencio' | 'duda'} modo
 */
export function finalizarJuego(modo) {
  state.juegoFinalizado = true;
  state.finalModo = modo;
  notify('juegoFinalizado', { modo, stats: { ...state.respuestasContador } });
}


