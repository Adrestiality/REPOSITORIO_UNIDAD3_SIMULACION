/**
 * Banco de textos y pensamientos del Jardinero
 * "Nadie lo verá completo" - Módulos 3, 4 y 5
 * Tema: dudas interiores, perfeccionismo y exigencia silenciosa
 */

// 1. Pensamientos espontáneos en la cafetería
export const thoughtsBank = [
  {
    id: 'thought_1',
    phase: 'dia',
    text: 'Espero que a la gente le guste mi jardín... aunque casi nadie se detiene a mirarlo.'
  },
  {
    id: 'thought_2',
    phase: 'noche',
    text: 'Anoche volví a podar tres plantas desde cero. Aún no tienen la simetría exacta que imagino.'
  },
  {
    id: 'thought_3',
    phase: 'dia',
    text: 'Esa flor amarilla debió abrir hacia el este. La luz de las diez le habría sentado mejor.'
  },
  {
    id: 'thought_4',
    phase: 'noche',
    text: 'El silencio de la noche es el único juez que no tiene prisa.'
  },
  {
    id: 'thought_5',
    phase: 'ambas',
    text: 'Crear es como traducir un grito en un susurro... y que ellos solo escuchen el viento.'
  },
  {
    id: 'thought_6',
    phase: 'dia',
    text: 'Hablan de negocios y contratos frente a las camelias. Para ellos es solo fondo verde.'
  },
  {
    id: 'thought_7',
    phase: 'noche',
    text: '¿Y si mañana nadie nota que cambié la tierra de todas las jardineras?'
  },
  {
    id: 'thought_8',
    phase: 'ambas',
    text: 'Si no está completamente bien, para mí no existe.'
  },
  {
    id: 'thought_9',
    phase: 'dia',
    text: 'Una hoja torcida puede arruinarle la mañana a quien de verdad sepa mirar.'
  },
  {
    id: 'thought_10',
    phase: 'noche',
    text: 'A oscuras, hasta las malas hierbas parecen haber aprendido su lugar.'
  },
  {
    id: 'thought_11',
    phase: 'ambas',
    text: 'Tardo semanas en planear una curva que una pisada descuidada borra en un segundo.'
  },
  {
    id: 'thought_12',
    phase: 'noche',
    text: 'No busco aplausos. Solo busco un instante donde nada sobre ni nada falte.'
  }
];

// 2. Pensamientos de duda durante la poda de macetas (Módulo 4)
export const pruningDoubtsBank = [
  {
    id: 'prune_doubt_1',
    text: '¿Lo estaré haciendo bien?'
  },
  {
    id: 'prune_doubt_2',
    text: 'Creo que lo dañé con este trazo...'
  },
  {
    id: 'prune_doubt_3',
    text: 'Sí, creo que está quedando bien... o tal vez no.'
  },
  {
    id: 'prune_doubt_4',
    text: 'No es exactamente lo que quería transmitir.'
  },
  {
    id: 'prune_doubt_5',
    text: 'Tal vez quité demasiado en la esquina.'
  },
  {
    id: 'prune_doubt_6',
    text: 'Si corto aquí, ya no habrá marcha atrás.'
  },
  {
    id: 'prune_doubt_7',
    text: 'Parece que tiene sentido, pero le falta alma.'
  },
  {
    id: 'prune_doubt_8',
    text: '¿Y si nadie entiende lo que intenté formar?'
  },
  {
    id: 'prune_doubt_9',
    text: 'Siento que el corte anterior fue un error que ahora tengo que disimular.'
  },
  {
    id: 'prune_doubt_10',
    text: 'Podría dejarlo así... pero sé que no está perfecto.'
  }
];

// 3. Pensamientos durante el arreglo del jardín 5x5 (Módulo 5)
export const gardenDoubtsBank = [
  {
    id: 'garden_doubt_1',
    text: '¿Estás seguro de que esto va con la temática del jardín?'
  },
  {
    id: 'garden_doubt_2',
    text: 'Aún no es perfecto. Hay algo en este rincón que desentona.'
  },
  {
    id: 'garden_doubt_3',
    text: 'El peso visual está recargado hacia un lado... ¿o es solo mi mirada?'
  },
  {
    id: 'garden_doubt_4',
    text: 'Mover esta planta aquí deja un vacío que se siente incómodo.'
  },
  {
    id: 'garden_doubt_5',
    text: 'La simetría parece forzada, pero el desorden me produce angustia.'
  },
  {
    id: 'garden_doubt_6',
    text: 'Nadie más notará que la tercera planta está un poco más a la derecha.'
  },
  {
    id: 'garden_doubt_7',
    text: '¿Y si el orden de ayer era mejor que este?'
  },
  {
    id: 'garden_doubt_8',
    text: 'Un jardín nunca se termina; solo se abandona por cansancio.'
  },
  {
    id: 'garden_doubt_9',
    text: 'Quité una flor y ahora el conjunto perdió el ritmo.'
  },
  {
    id: 'garden_doubt_10',
    text: 'Cada planta debería contar una parte de la misma historia.'
  }
];

/**
 * Obtener un pensamiento aleatorio que coincida con la fase actual
 * evitando repetir el último id mostrado.
 * @param {'dia' | 'noche'} currentPhase
 * @param {string|null} lastThoughtId
 * @returns {object} thought
 */
export function getRandomThought(currentPhase, lastThoughtId) {
  const eligible = thoughtsBank.filter(
    (t) => (t.phase === 'ambas' || t.phase === currentPhase) && t.id !== lastThoughtId
  );

  if (eligible.length === 0) {
    return thoughtsBank[0];
  }

  const randomIndex = Math.floor(Math.random() * eligible.length);
  return eligible[randomIndex];
}

/**
 * Obtener una duda aleatoria para la poda sin repetir la última
 * @param {string|null} lastDoubtId
 * @returns {object} doubt
 */
export function getRandomPruningDoubt(lastDoubtId) {
  const eligible = pruningDoubtsBank.filter((d) => d.id !== lastDoubtId);
  if (eligible.length === 0) return pruningDoubtsBank[0];
  const idx = Math.floor(Math.random() * eligible.length);
  return eligible[idx];
}

/**
 * Obtener una duda aleatoria para el editor de jardín sin repetir
 * @param {string|null} lastDoubtId
 * @param {string} [currentHour]
 * @returns {object} doubt
 */
export function getRandomGardenDoubt(lastDoubtId, currentHour = '') {
  const eligible = gardenDoubtsBank.filter((d) => d.id !== lastDoubtId);
  if (eligible.length === 0) return gardenDoubtsBank[0];
  const idx = Math.floor(Math.random() * eligible.length);
  const item = { ...eligible[idx] };

  // Ocasionalmente incorporar la hora si está disponible
  if (currentHour && (idx === 1 || idx === 6)) {
    item.text = `${item.text} Y ya son las ${currentHour}.`;
  }
  return item;
}

/**
 * Pensamientos de la Jardinera tras atender mesas (Desespero Progresivo: "quiero cerrar")
 */
export const tableDistressThoughts = [
  'Quiero cerrar... el murmullo empieza a subir.',
  'Tantas voces en la cabeza... quiero cerrar ya.',
  'Quiero cerrar el letrero... necesito el silencio del jardín.',
  'El ruido es casi insoportable... quiero cerrar la cafetería.'
];

export function getTableDistressThought(servedCount = 1) {
  const idx = Math.max(0, Math.min(tableDistressThoughts.length - 1, servedCount - 1));
  return tableDistressThoughts[idx];
}

