/**
 * Datos de los Pósters Motivacionales y Tazas con Frases
 * "Nadie lo verá completo" - Módulo 3 y Mejoras
 *
 * 16 frases de pósters en total (4 por ciclo).
 * 8 frases de tazas (2 por ciclo).
 * Los textos viven en src/data/ siguiendo la regla global.
 */

export const postersDataByCycle = {
  // --- CICLO 1: La Exigencia Inicial ---
  1: [
    {
      id: 'poster_c1_1',
      cycle: 1,
      slot: 1,
      title: 'Póster I',
      quote: 'Si no lo vas a hacer bien, ¿para qué hacerlo?',
      subtext: 'EXIGENCIA DIARIA · 1962',
      position: { x: -4.0, y: 3.5, z: -4.7 },
      width: 1.25,
      height: 1.7,
      palette: {
        bg: '#f3ece2',
        border: '#7a6a5b',
        text: '#38312b'
      },
      gardenerThought: 'Leí esa frase mil veces mientras podaba los setos de la entrada. A veces creo que quien la imprimió jamás intentó crear nada vivo con las manos.'
    },
    {
      id: 'poster_c1_2',
      cycle: 1,
      slot: 2,
      title: 'Póster II',
      quote: 'La perfección no es un accidente.',
      subtext: 'MÉTODO Y DISCIPLINA',
      position: { x: -1.6, y: 3.5, z: -4.7 },
      width: 1.25,
      height: 1.7,
      palette: {
        bg: '#ede6da',
        border: '#6b6055',
        text: '#2e2823'
      },
      gardenerThought: 'No es un accidente, claro... es una condena voluntaria que nadie te agradece y de la que no se puede escapar sin culpa.'
    },
    {
      id: 'poster_c1_3',
      cycle: 1,
      slot: 3,
      title: 'Póster III',
      quote: 'El orden exterior calma el caos interior.',
      subtext: 'ARMONÍA Y EQUILIBRIO',
      position: { x: 0.8, y: 3.5, z: -4.7 },
      width: 1.25,
      height: 1.7,
      palette: {
        bg: '#e8e2d5',
        border: '#736557',
        text: '#342d27'
      },
      gardenerThought: 'Mentiría si digo que no lo intento cada mañana. Alineo cada hoja buscando una serenidad que de noche se me desmorona.'
    },
    {
      id: 'poster_c1_4',
      cycle: 1,
      slot: 4,
      title: 'Póster IV',
      quote: 'Lo que hagas hoy será tu único reflejo.',
      subtext: 'CONSTANCIA SILENCIOSA',
      position: { x: 4.4, y: 3.5, z: -4.7 },
      width: 1.25,
      height: 1.7,
      palette: {
        bg: '#f0e9dd',
        border: '#6e5e50',
        text: '#312a24'
      },
      gardenerThought: 'Si mi único reflejo son estas ramas podadas y estas flores que duran tres días, espero al menos que den una sombra limpia.'
    }
  ],

  // --- CICLO 2: La Mirada Ajena y la Eficiencia ---
  2: [
    {
      id: 'poster_c2_1',
      cycle: 2,
      slot: 1,
      title: 'Póster I',
      quote: 'El tiempo no espera a quien duda.',
      subtext: 'PRODUCCIÓN Y RITMO · 1963',
      position: { x: -4.0, y: 3.5, z: -4.7 },
      width: 1.25,
      height: 1.7,
      palette: {
        bg: '#ebdcd0',
        border: '#8f6855',
        text: '#3a2820'
      },
      gardenerThought: 'Dicen que dudar es perder tiempo. Para mí, quien no duda solo está repitiendo mecánicamente lo que otros le mandaron a hacer.'
    },
    {
      id: 'poster_c2_2',
      cycle: 2,
      slot: 2,
      title: 'Póster II',
      quote: 'La sencillez es la mayor sofisticación.',
      subtext: 'DISEÑO Y SOBRIEDAD',
      position: { x: -1.6, y: 3.5, z: -4.7 },
      width: 1.25,
      height: 1.7,
      palette: {
        bg: '#dfdcd5',
        border: '#626859',
        text: '#292b25'
      },
      gardenerThought: 'Hablan de sencillez como si fuera fácil. Quitar lo que sobra duele más que añadir adornos baratos para tapar los huecos.'
    },
    {
      id: 'poster_c2_3',
      cycle: 2,
      slot: 3,
      title: 'Póster III',
      quote: 'Un trabajo terminado habla por sí mismo.',
      subtext: 'EFICACIA RIGUROSA',
      position: { x: 0.8, y: 3.5, z: -4.7 },
      width: 1.25,
      height: 1.7,
      palette: {
        bg: '#e4dcd0',
        border: '#7c6553',
        text: '#362a22'
      },
      gardenerThought: 'Habla, sí... pero casi nunca dice lo que uno sintió mientras lo cuidaba a solas en la penumbra de esta sala.'
    },
    {
      id: 'poster_c2_4',
      cycle: 2,
      slot: 4,
      title: 'Póster IV',
      quote: 'La perseverancia vence lo que la dicha no alcanza.',
      subtext: 'VOLUNTAD INCANSABLE',
      position: { x: 4.4, y: 3.5, z: -4.7 },
      width: 1.25,
      height: 1.7,
      palette: {
        bg: '#ded9d2',
        border: '#5d6359',
        text: '#2b3028'
      },
      gardenerThought: 'Persevero, barro la arena, humedezco las raíces. Pero a veces la dicha simplemente no estaba incluida en la rutina.'
    }
  ],

  // --- CICLO 3: La Ilusión del Control ---
  3: [
    {
      id: 'poster_c3_1',
      cycle: 3,
      slot: 1,
      title: 'Póster I',
      quote: 'Dominar la naturaleza es civilizar el alma.',
      subtext: 'ORDEN MODERNO · 1964',
      position: { x: -4.0, y: 3.5, z: -4.7 },
      width: 1.25,
      height: 1.7,
      palette: {
        bg: '#d6dde4',
        border: '#53657a',
        text: '#232d3a'
      },
      gardenerThought: 'Civilizar... como si estas raíces rebeldes quisieran obedecer a una escuadra de carpintero y a un reloj de pared.'
    },
    {
      id: 'poster_c3_2',
      cycle: 3,
      slot: 2,
      title: 'Póster II',
      quote: 'La disciplina es el puente entre metas y logros.',
      subtext: 'DIRECCIÓN Y FOCO',
      position: { x: -1.6, y: 3.5, z: -4.7 },
      width: 1.25,
      height: 1.7,
      palette: {
        bg: '#e0d8e2',
        border: '#6f5a77',
        text: '#312536'
      },
      gardenerThought: 'A veces el puente se alarga tanto que uno olvida cuál era la orilla a la que en verdad quería llegar.'
    },
    {
      id: 'poster_c3_3',
      cycle: 3,
      slot: 3,
      title: 'Póster III',
      quote: 'Nada grande se creó jamás sin sacrificio.',
      subtext: 'ABNEGACIÓN CONSTANTE',
      position: { x: 0.8, y: 3.5, z: -4.7 },
      width: 1.25,
      height: 1.7,
      palette: {
        bg: '#d7dfda',
        border: '#526b60',
        text: '#203029'
      },
      gardenerThought: '¿Y qué pasa cuando el sacrificio se vuelve un hábito ciego que devora el gusto mismo por ver brotar una hoja?'
    },
    {
      id: 'poster_c3_4',
      cycle: 3,
      slot: 4,
      title: 'Póster IV',
      quote: 'Lo visible sostiene lo invisible.',
      subtext: 'ESTRUCTURA FUNDAMENTAL',
      position: { x: 4.4, y: 3.5, z: -4.7 },
      width: 1.25,
      height: 1.7,
      palette: {
        bg: '#e2dad2',
        border: '#746255',
        text: '#342921'
      },
      gardenerThought: 'Ellos ven las macetas alineadas y la grava limpia. Lo invisible son las horas despierto corrigiendo una milésima de inclinación.'
    }
  ],

  // --- CICLO 4: El Veredicto y la Reconciliación ---
  4: [
    {
      id: 'poster_c4_1',
      cycle: 4,
      slot: 1,
      title: 'Póster I',
      quote: 'Al final, solo queda lo que diste en silencio.',
      subtext: 'LEGADO SILENCIOSO · 1965',
      position: { x: -4.0, y: 3.5, z: -4.7 },
      width: 1.25,
      height: 1.7,
      palette: {
        bg: '#dfdbd5',
        border: '#6f6962',
        text: '#2e2b27'
      },
      gardenerThought: 'Di mis mañanas, mis dudas y mis manos ásperas. Nadie vio el proceso completo, pero las hojas siguen vivas bajo la sombra.'
    },
    {
      id: 'poster_c4_2',
      cycle: 4,
      slot: 2,
      title: 'Póster II',
      quote: 'La belleza verdadera no necesita testigos.',
      subtext: 'VERDAD ESENCIAL',
      position: { x: -1.6, y: 3.5, z: -4.7 },
      width: 1.25,
      height: 1.7,
      palette: {
        bg: '#dadcd8',
        border: '#5f695d',
        text: '#262d24'
      },
      gardenerThought: 'Si una flor se abre a medianoche y nadie la aplaude, ¿deja de ser hermosa? Esta noche por fin creo tener la respuesta.'
    },
    {
      id: 'poster_c4_3',
      cycle: 4,
      slot: 3,
      title: 'Póster III',
      quote: 'Todo jardín es un intento de reconciliación.',
      subtext: 'PAZ INTERIOR',
      position: { x: 0.8, y: 3.5, z: -4.7 },
      width: 1.25,
      height: 1.7,
      palette: {
        bg: '#ded7d3',
        border: '#706057',
        text: '#332722'
      },
      gardenerThought: 'Reconciliarme con lo imperfecto... dejar que una rama crezca a su aire sin sentir que he fracasado como creador.'
    },
    {
      id: 'poster_c4_4',
      cycle: 4,
      slot: 4,
      title: 'Póster IV',
      quote: 'Acepta el corte y confía en el rebrote.',
      subtext: 'RENOVACIÓN VITAL',
      position: { x: 4.4, y: 3.5, z: -4.7 },
      width: 1.25,
      height: 1.7,
      palette: {
        bg: '#dcd9de',
        border: '#645d6c',
        text: '#2b2532'
      },
      gardenerThought: 'Podé con miedo durante semanas enteras. Ahora entiendo que podar no es castigar, sino abrirle paso a la luz que viene.'
    }
  ]
};

export const quoteMugsDataByCycle = {
  1: [
    {
      id: 'mug_c1_1',
      cycle: 1,
      slot: 1,
      type: 'mug',
      quote: 'Impecable o nada.',
      position: { x: -4.6, y: 1.04, z: 0.5 },
      color: 0xf2ebe2,
      gardenerThought: 'Una taza que parece juzgar cada sorbo. Hasta la cerámica tiene aquí una exigencia muda.'
    },
    {
      id: 'mug_c1_2',
      cycle: 1,
      slot: 2,
      type: 'mug',
      quote: 'Cada detalle cuenta.',
      position: { x: 4.8, y: 1.04, z: 1.7 },
      color: 0x9fb3a8,
      gardenerThought: 'Cuentan tanto que a veces uno termina perdiéndose en las esquinas y olvidando el cuadro entero.'
    }
  ],
  2: [
    {
      id: 'mug_c2_1',
      cycle: 2,
      slot: 1,
      type: 'mug',
      quote: 'Rinde más, duda menos.',
      position: { x: -4.6, y: 1.04, z: 0.5 },
      color: 0xdecebe,
      gardenerThought: 'Como si dudar fuera un defecto que se cura sirviéndose otra taza de café cargado.'
    },
    {
      id: 'mug_c2_2',
      cycle: 2,
      slot: 2,
      type: 'mug',
      quote: 'Primero el deber.',
      position: { x: 4.8, y: 1.04, z: 1.7 },
      color: 0x8a9b8f,
      gardenerThought: 'Y después del deber, la noche... donde las ramas siguen creciendo sin pedirle permiso a nadie.'
    }
  ],
  3: [
    {
      id: 'mug_c3_1',
      cycle: 3,
      slot: 1,
      type: 'mug',
      quote: 'Sin concesiones.',
      position: { x: -4.6, y: 1.04, z: 0.5 },
      color: 0xd2d7df,
      gardenerThought: 'Ni un brote torcido, ni una queja dicha en voz alta. Qué agotador resulta este lema.'
    },
    {
      id: 'mug_c3_2',
      cycle: 3,
      slot: 2,
      type: 'mug',
      quote: 'El rigor es belleza.',
      position: { x: 4.8, y: 1.04, z: 1.7 },
      color: 0xa394a8,
      gardenerThought: 'Un rigor que a veces parece más una reja que un homenaje a la belleza.'
    }
  ],
  4: [
    {
      id: 'mug_c4_1',
      cycle: 4,
      slot: 1,
      type: 'mug',
      quote: 'Déjalo respirar.',
      position: { x: -4.6, y: 1.04, z: 0.5 },
      color: 0xe6e0d8,
      gardenerThought: 'Por fin una frase que no suena a orden marcial. El café sabe un poco más tibio así.'
    },
    {
      id: 'mug_c4_2',
      cycle: 4,
      slot: 2,
      type: 'mug',
      quote: 'Lo inacabado vive.',
      position: { x: 4.8, y: 1.04, z: 1.7 },
      color: 0x939c94,
      gardenerThought: 'Tal vez la perfección era una trampa y la vida estaba justamente en lo que no pudimos controlar.'
    }
  ]
};

/**
 * Obtener pósters para un ciclo específico (1 a 4)
 * @param {number} cycle
 * @returns {Array<object>}
 */
export function getPostersForCycle(cycle = 1) {
  const c = Math.max(1, Math.min(4, cycle));
  return postersDataByCycle[c] || postersDataByCycle[1];
}

/**
 * Obtener tazas con citas para un ciclo específico (1 a 4)
 * @param {number} cycle
 * @returns {Array<object>}
 */
export function getQuoteMugsForCycle(cycle = 1) {
  const c = Math.max(1, Math.min(4, cycle));
  return quoteMugsDataByCycle[c] || quoteMugsDataByCycle[1];
}

// Compatibilidad retroactiva
export const postersData = getPostersForCycle(1);
export const quoteMugsData = getQuoteMugsForCycle(1);
