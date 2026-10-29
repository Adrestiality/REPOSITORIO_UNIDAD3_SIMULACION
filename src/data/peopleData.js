/**
 * Datos y arquetipos de visitantes estilo años 60
 * "Nadie lo verá completo" - Módulo 2
 */

export const peopleData = [
  // --- Mesa redonda izquierda 1 (X = -4.6, Z = 0.6) ---
  {
    id: 'persona_1',
    name: 'Elena',
    style: 'dress', // Vestido sesentero corte A
    gender: 'female',
    palette: {
      dress: 0x8fa89b, // Verde salvia pastel
      hair: 0x3d3028,
      skin: 0xf2ded1,
      shoes: 0x4a4038
    },
    hat: 'pillbox',
    hatColor: 0x7e9488,
    position: { x: -4.6, y: 0, z: 0.15 },
    rotationY: 0,
    isSitting: true,
    activity: 'cup_lifting',
    dialogue: 'Este café tiene algo especial... me calma los nervios antes de volver a la oficina.'
  },
  {
    id: 'persona_2',
    name: 'Arturo',
    style: 'suit', // Traje elegante años 60
    gender: 'male',
    palette: {
      jacket: 0x6e7b8b, // Azul pizarra pastel
      pants: 0x566270,
      shirt: 0xf5f3ee,
      tie: 0xa85858,
      hair: 0x2b221d,
      skin: 0xedd6c5,
      shoes: 0x2b2521
    },
    hat: 'fedora',
    hatColor: 0x5a6574,
    position: { x: -4.6, y: 0, z: 1.05 },
    rotationY: Math.PI,
    isSitting: true,
    activity: 'head_nod',
    dialogue: 'Miro las ramas podadas y pienso en las decisiones que dejamos a medio camino.'
  },

  // --- Mesa redonda izquierda 2 (X = -4.6, Z = 2.6) ---
  {
    id: 'persona_3',
    name: 'Margarita',
    style: 'dress',
    gender: 'female',
    palette: {
      dress: 0xc89898, // Rosa empolvado pastel
      hair: 0xb58a57,
      skin: 0xf7e5db,
      shoes: 0x5e4844
    },
    hat: null,
    position: { x: -4.6, y: 0, z: 2.15 },
    rotationY: 0,
    isSitting: true,
    activity: 'cup_lifting',
    dialogue: 'Siempre me siento aquí para ver cómo la luz de la tarde atraviesa las hojas del jardín.'
  },
  {
    id: 'persona_4',
    name: 'Julián',
    style: 'vest', // Chaleco sesentero y corbata
    gender: 'male',
    palette: {
      vest: 0x9e886b, // Mostaza pastel / camel
      pants: 0x4f443b,
      shirt: 0xffffff,
      tie: 0x486b63,
      hair: 0x222222,
      skin: 0xecd0be,
      shoes: 0x332820
    },
    hat: null,
    position: { x: -4.6, y: 0, z: 3.05 },
    rotationY: Math.PI,
    isSitting: true,
    activity: 'reading',
    dialogue: 'Un buen libro, café negro y el verde de fondo. No le pido mucho más a la vida.'
  },

  // --- Mesa rectangular derecha 1 (X = 4.8, Z = -1.6) ---
  {
    id: 'persona_5',
    name: 'Beatriz',
    style: 'dress',
    gender: 'female',
    palette: {
      dress: 0x7d94b0, // Celeste empolvado
      hair: 0x48382c,
      skin: 0xf3dfd4,
      shoes: 0x3a4857
    },
    hat: null,
    position: { x: 4.15, y: 0, z: -1.6 },
    rotationY: Math.PI / 2,
    isSitting: true,
    activity: 'cup_lifting',
    dialogue: 'A veces pienso que las plantas tienen más paciencia con nosotros que nosotros con ellas.'
  },
  {
    id: 'persona_6',
    name: 'Ignacio',
    style: 'suit',
    gender: 'male',
    palette: {
      jacket: 0x787a74, // Gris oliva pastel
      pants: 0x585a54,
      shirt: 0xfaf8f2,
      tie: 0xba7654,
      hair: 0x54473b,
      skin: 0xebd3c3,
      shoes: 0x292826
    },
    hat: 'fedora',
    hatColor: 0x656761,
    position: { x: 5.45, y: 0, z: -1.6 },
    rotationY: -Math.PI / 2,
    isSitting: true,
    activity: 'talking',
    dialogue: 'El silencio de esta esquina vale más que cualquier consejo bienintencionado.'
  },

  // --- Mesa rectangular derecha 2 (X = 4.8, Z = 1.6) ---
  {
    id: 'persona_7',
    name: 'Clara',
    style: 'dress',
    gender: 'female',
    palette: {
      dress: 0xbfa882, // Crema tostado suave
      hair: 0x2d241e,
      skin: 0xf4ded3,
      shoes: 0x4a3c2c
    },
    hat: 'pillbox',
    hatColor: 0xb09873,
    position: { x: 4.15, y: 0, z: 1.6 },
    rotationY: Math.PI / 2,
    isSitting: true,
    activity: 'cup_lifting',
    dialogue: 'Me gusta observar cómo la jardinera cuida cada detalle sin esperar que la feliciten.'
  },
  {
    id: 'persona_8',
    name: 'Guillermo',
    style: 'vest',
    gender: 'male',
    palette: {
      vest: 0x738276, // Salvia oscuro
      pants: 0x424a44,
      shirt: 0xf4f1ea,
      tie: 0x9c5c56,
      hair: 0x6e5c4d,
      skin: 0xedd5c6,
      shoes: 0x2d2824
    },
    hat: null,
    position: { x: 5.45, y: 0, z: 1.6 },
    rotationY: -Math.PI / 2,
    isSitting: true,
    activity: 'talking',
    dialogue: 'La constancia no hace ruido, pero al final del día deja su huella.'
  },

  // --- Personas de pie (cerca de la ventana, jardín o pared) ---
  {
    id: 'persona_9',
    name: 'Tomás',
    style: 'suit',
    gender: 'male',
    palette: {
      jacket: 0x8a7f76, // Beige grisáceo
      pants: 0x675f58,
      shirt: 0xf8f6f0,
      tie: 0x4d667a,
      hair: 0x1f1f1f,
      skin: 0xebd2c2,
      shoes: 0x28231e
    },
    hat: 'fedora',
    hatColor: 0x776d65,
    position: { x: 5.8, y: 0, z: -3.2 },
    rotationY: -Math.PI * 0.75, // Mirando hacia la ventana/fondo
    isSitting: false,
    activity: 'sway',
    dialogue: 'Desde este ventanal, la ciudad parece moverse un poco más despacio.'
  },
  {
    id: 'persona_10',
    name: 'Silvia',
    style: 'dress',
    gender: 'female',
    palette: {
      dress: 0x88a3a0, // Verde azulado pastel
      hair: 0x3d2b20,
      skin: 0xf5ded1,
      shoes: 0x3e4d4b
    },
    hat: null,
    position: { x: -2.2, y: 0, z: -3.4 },
    rotationY: 0.3,
    isSitting: false,
    activity: 'sway',
    dialogue: 'Vine buscando despejar la mente... contemplar este jardín me ayuda a respirar.'
  },
  {
    id: 'persona_11',
    name: 'Esteban',
    style: 'vest',
    gender: 'male',
    palette: {
      vest: 0x8f766e, // Terracota pastel
      pants: 0x4a3d38,
      shirt: 0xfaf9f5,
      tie: 0x3e5246,
      hair: 0x423831,
      skin: 0xecd4c6,
      shoes: 0x261f1c
    },
    hat: null,
    position: { x: 2.3, y: 0, z: -3.4 },
    rotationY: -0.25,
    isSitting: false,
    activity: 'sway',
    dialogue: 'Cada quien encuentra aquí un rincón donde no tener que fingir prisa.'
  }
];

// Paletas temáticas por ciclo para variar el aspecto de las personas (Módulo 6)
const cyclePalettes = {
  1: {
    dress: [0x8fa89b, 0xc89898, 0x7d94b0, 0xbfa882, 0x88a3a0],
    suit: [0x6e7b8b, 0x787a74, 0x8a7f76],
    vest: [0x9e886b, 0x738276, 0x8f766e]
  },
  2: { // Ciclo 2: Otoño / tonos cálidos terracota y borgoña
    dress: [0xb87a68, 0xa37682, 0x6e8a85, 0xc2a67a, 0x967a65],
    suit: [0x544741, 0x61665a, 0x705d52],
    vest: [0xa86e58, 0x637060, 0x8a6250]
  },
  3: { // Ciclo 3: Nocturno elegante / azul marino y ciruela
    dress: [0x5c697a, 0x7a5e74, 0x4d6961, 0x8c786a, 0x696078],
    suit: [0x3c4552, 0x48424b, 0x544a42],
    vest: [0x505b6b, 0x6b5065, 0x5a544b]
  },
  4: { // Ciclo 4: Crepuscular melancólico / gris pizarra y lavanda empolvada
    dress: [0x857e8a, 0x7d8785, 0x94827d, 0x737d8c, 0x8c8378],
    suit: [0x424045, 0x4d4c4a, 0x474240],
    vest: [0x6b6770, 0x606967, 0x6e6360]
  }
};

/**
 * Obtener lista de visitantes con aspecto adaptado al ciclo actual
 * @param {number} cycle (1 a 4)
 * @returns {Array<object>}
 */
export function getPeopleDataForCycle(cycle = 1) {
  const c = Math.max(1, Math.min(4, cycle));
  const pal = cyclePalettes[c] || cyclePalettes[1];

  return peopleData.map((person, idx) => {
    const clone = JSON.parse(JSON.stringify(person));
    if (clone.style === 'dress') {
      clone.palette.dress = pal.dress[idx % pal.dress.length];
      if (clone.hat) clone.hatColor = pal.dress[idx % pal.dress.length];
    } else if (clone.style === 'suit') {
      clone.palette.jacket = pal.suit[idx % pal.suit.length];
      if (clone.hat) clone.hatColor = pal.suit[idx % pal.suit.length];
    } else if (clone.style === 'vest') {
      clone.palette.vest = pal.vest[idx % pal.vest.length];
    }
    return clone;
  });
}
