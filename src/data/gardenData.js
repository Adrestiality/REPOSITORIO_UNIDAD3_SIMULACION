/**
 * Datos y textos para el Editor del Jardín 5x5 y Nombres
 * "Nadie lo verá completo" - Módulo 5
 * Cumple con la regla global: textos en src/data/, nunca en la lógica.
 */

export const gardenTexts = {
  title: 'Arreglo del Jardín',
  subtitle: 'Cuadrícula de 5×5 celdas. Arrastra para mover o haz clic derecho para quitar.',
  badge: 'Modo Edición',
  btnCreateAnother: '🪴 Crear otra maceta',
  btnFinish: 'Finalizar arreglo',
  btnRemove: '🗑️ Quitar planta',
  btnCancel: 'Cancelar',
  btnContinue: 'Continuar',
  btnConfirm: 'Sí, seguro',
  btnReconsider: 'Cambiar nombre',
  btnKeepName: 'Así se queda',
  btnEditName: 'Modificar nombre',
  defaultGardenName: 'Jardín de la cafetería',
  namingTitle: 'Nombre del jardín del día',
  namingPrompt: 'Elige cómo se llamará este espacio antes de que comience el nuevo día:',
  namingPlaceholder: 'Escribe el nombre del jardín...',
  question1: '¿Seguro que ese es el nombre?',
  question2: '¿Suena demasiado simple?',
  question3: (hour) => `Son las ${hour}. Todavía hay tiempo de cambiarlo.`,
  alerts: {
    gridFull: 'La cuadrícula del jardín está llena (25/25). No puedes añadir más plantas.',
    cannotEmpty: 'El jardín nunca puede quedar vacío: debe haber al menos 1 planta.',
    cellOccupied: 'Esa celda ya está ocupada por otra planta.',
    plantRemoved: 'Planta retirada del jardín.',
    plantMoved: 'Planta reubicada con éxito.'
  }
};

/**
 * 5 Plantas iniciales correspondientes a la cafetería del Módulo 1:
 * 4 en las esquinas y 1 en el centro de la cuadrícula de 5x5.
 */
export const initialPlants = [
  {
    id: 'bush_0_0',
    type: 'bush',
    row: 0,
    col: 0,
    name: 'Arbusto de la esquina noroeste',
    scale: 0.44,
    alt: false,
    color: 0x6e7b64,
    flores: [{ color: 0xe63946, height: 0.45 }]
  },
  {
    id: 'bush_0_4',
    type: 'bush',
    row: 0,
    col: 4,
    name: 'Arbusto de la esquina noreste',
    scale: 0.42,
    alt: true,
    color: 0x5d6b54,
    flores: []
  },
  {
    id: 'bush_2_2',
    type: 'bush',
    row: 2,
    col: 2,
    name: 'Arbusto del corazón del jardín',
    scale: 0.52,
    alt: false,
    color: 0x6e7b64,
    flores: [{ color: 0xffb703, height: 0.42 }]
  },
  {
    id: 'bush_4_0',
    type: 'bush',
    row: 4,
    col: 0,
    name: 'Arbusto de la esquina suroeste',
    scale: 0.40,
    alt: true,
    color: 0x5d6b54,
    flores: [{ color: 0x7209b7, height: 0.48 }]
  },
  {
    id: 'bush_4_4',
    type: 'bush',
    row: 4,
    col: 4,
    name: 'Arbusto de la esquina sureste',
    scale: 0.45,
    alt: false,
    color: 0x6e7b64,
    flores: []
  }
];

/**
 * Genera la cuadrícula inicial de 5x5 (25 celdas)
 * @returns {Array<object|null>}
 */
export function createInitialGrid() {
  const grid = new Array(25).fill(null);
  for (const plant of initialPlants) {
    const idx = plant.row * 5 + plant.col;
    grid[idx] = { ...plant, flores: [...plant.flores] };
  }
  return grid;
}
