/**
 * Datos de los Objetos Olvidados nocturnos
 * "Nadie lo verá completo"
 *
 * 16 objetos en total (4 por ciclo), cada uno enlazado a una mesa atendida durante el día.
 * Solo aparecen los objetos de las mesas que la Jardinera atendió ese día.
 * Al tocarlos, la Jardinera continúa mentalmente la conversación con su propia interpretación.
 * Los textos viven en src/data/ siguiendo la regla global.
 */

export const forgottenObjects = [
  // =========================================================================
  // CICLO 1: Consecuencias de las Primeras Charlas
  // =========================================================================
  {
    id: 'obj_c1_libreta',
    tableId: 'mesa_c1_t1',
    cycle: 1,
    tableIndex: 0,
    type: 'libreta',
    name: 'Libreta de poemas incompleta',
    position: { x: -4.6, y: 1.03, z: 0.6 },
    color: 0x9e886b,
    dialogue: {
      speaker: 'Jardinera',
      text: 'Arturo la dejó abierta junto a la azucarera. Tachó seis veces el intento de describir el aroma del jazmín. Me reconozco tanto en esa rabia... pasar horas podando una rama para que nadie distinga la intención del corte.'
    }
  },
  {
    id: 'obj_c1_taza',
    tableId: 'mesa_c1_t2',
    cycle: 1,
    tableIndex: 1,
    type: 'taza_humeante',
    name: 'Taza de café fría',
    position: { x: -4.6, y: 1.03, z: 2.6 },
    color: 0xf4eee4,
    dialogue: {
      speaker: 'Jardinera',
      text: 'Elena bebió solo dos sorbos antes de irse. Esperó a quien nunca llegó con una dignidad que me partió el alma. Dejó dos monedas exactas y la taza casi llena, como quien no quiere admitir la derrota.'
    }
  },
  {
    id: 'obj_c1_chaqueta',
    tableId: 'mesa_c1_t3',
    cycle: 1,
    tableIndex: 2,
    type: 'chaqueta',
    name: 'Chaqueta de paño olvidada',
    position: { x: 4.8, y: 1.03, z: -1.6 },
    color: 0x5a6575,
    dialogue: {
      speaker: 'Jardinera',
      text: 'Julián se marchó tan enfurecido por la discusión que ni sintió el frío al cruzar la puerta. Su abrigo de paño quedó aquí colgado como un cascarón vacío. La rabia siempre nos hace olvidar lo que nos abriga.'
    }
  },
  {
    id: 'obj_c1_periodico',
    tableId: 'mesa_c1_t4',
    cycle: 1,
    tableIndex: 3,
    type: 'periodico',
    name: 'Periódico con ofertas de empleo',
    position: { x: 4.8, y: 1.03, z: 1.6 },
    color: 0xd6cebe,
    dialogue: {
      speaker: 'Jardinera',
      text: 'Margarita dobló el diario con pulcritud de tipógrafa. Marcó con lápiz azul tres talleres de encuadernación. Treinta años de oficio borrados en una tarde... pero sus manos aún saben acariciar el papel con reverencia.'
    }
  },

  // =========================================================================
  // CICLO 2: El Tiempo y la Distancia
  // =========================================================================
  {
    id: 'obj_c2_reloj_bolsillo',
    tableId: 'mesa_c2_t1',
    cycle: 2,
    tableIndex: 0,
    type: 'reloj_bolsillo',
    name: 'Reloj de bolsillo detenido',
    position: { x: -4.6, y: 1.03, z: 0.6 },
    color: 0xb59e78,
    dialogue: {
      speaker: 'Jardinera',
      text: 'Don Aurelio lo dejó boca arriba sobre la madera. La aguja clavada a las cuatro y cuarto. No quiso darle cuerda porque hay instantes que uno prefiere congelar para no ver cómo el mundo sigue sin pedir permiso.'
    }
  },
  {
    id: 'obj_c2_guantes',
    tableId: 'mesa_c2_t2',
    cycle: 2,
    tableIndex: 1,
    type: 'guantes',
    name: 'Guantes de terciopelo borgoña',
    position: { x: -4.6, y: 1.03, z: 2.6 },
    color: 0x8a5252,
    dialogue: {
      speaker: 'Jardinera',
      text: 'Beatriz se los quitó nerviosa mientras hablaba de su hermana. El terciopelo conserva la silueta de sus dedos tensos. Es curioso cómo un pedazo de tela puede acumular tanta distancia y tanto dolor contenido.'
    }
  },
  {
    id: 'obj_c2_carta',
    tableId: 'mesa_c2_t3',
    cycle: 2,
    tableIndex: 2,
    type: 'carta',
    name: 'Sobre cerrado sin remitente',
    position: { x: 4.8, y: 1.03, z: -1.6 },
    color: 0xeae4d8,
    dialogue: {
      speaker: 'Jardinera',
      text: 'Ignacio no tuvo el valor de llevarla al buzón. La dejó discretamente al lado del servilletero. El papel pesa más sellado que abierto; las palabras no dichas terminan enmoheciendo todo lo que tocan.'
    }
  },
  {
    id: 'obj_c2_gafas',
    tableId: 'mesa_c2_t4',
    cycle: 2,
    tableIndex: 3,
    type: 'gafas',
    name: 'Gafas de lectura de carey',
    position: { x: 4.8, y: 1.03, z: 1.6 },
    color: 0x5c4231,
    dialogue: {
      speaker: 'Jardinera',
      text: 'Clara las olvidó al guardar su monedero. A través de estos cristales gruesos las hojas de mis macetas se ven borrosas pero luminosas. Quizá perder la vista sea solo una forma cruel de obligarnos a sentir con el alma.'
    }
  },

  // =========================================================================
  // CICLO 3: Objetos de Identidad y Secreto
  // =========================================================================
  {
    id: 'obj_c3_espejo',
    tableId: 'mesa_c3_t1',
    cycle: 3,
    tableIndex: 0,
    type: 'espejo',
    name: 'Espejo de mano plateado',
    position: { x: -4.6, y: 1.03, z: 0.6 },
    color: 0xced4db,
    dialogue: {
      speaker: 'Jardinera',
      text: 'El cristal tiene una pequeña fisura en la esquina izquierda. Silvia pasó diez minutos mirándose con angustia. Quien busca su propia verdad en el reflejo de los demás siempre termina encontrando una imagen partida.'
    }
  },
  {
    id: 'obj_c3_llave',
    tableId: 'mesa_c3_t2',
    cycle: 3,
    tableIndex: 1,
    type: 'llave',
    name: 'Llave de latón antigua',
    position: { x: -4.6, y: 1.03, z: 2.6 },
    color: 0xc2a85e,
    dialogue: {
      speaker: 'Jardinera',
      text: 'Tomás la apoyó junto a la ventana antes de despedirse. Una llave pesada que ya no custodia nada. Cerrar una puerta para siempre duele, pero quedarse vigilando un cerrojo muerto es mucho más triste.'
    }
  },
  {
    id: 'obj_c3_caja_musica',
    tableId: 'mesa_c3_t3',
    cycle: 3,
    tableIndex: 2,
    type: 'caja_musica',
    name: 'Cajita de música de madera',
    position: { x: 4.8, y: 1.03, z: -1.6 },
    color: 0x6e4e3b,
    dialogue: {
      speaker: 'Jardinera',
      text: 'La madera de nogal está gastada por el roce de los dedos de Guillermo. Si le doy media vuelta al engranaje suena una nota desafinada pero dulce. El amor de un padre es ese empeño terco en reparar cosas que el tiempo ya cambió.'
    }
  },
  {
    id: 'obj_c3_cinta_metrica',
    tableId: 'mesa_c3_t4',
    cycle: 3,
    tableIndex: 3,
    type: 'cinta_metrica',
    name: 'Cinta métrica de sastre',
    position: { x: 4.8, y: 1.03, z: 1.6 },
    color: 0xd9c58b,
    dialogue: {
      speaker: 'Jardinera',
      text: 'Esteban la enrolló a medias con la prisa del cierre. Pasó su vida midiendo cinturas y espaldas para disimular jorobas ajenas. Cómo nos engañamos buscando una simetría que la vida jamás tuvo el cuidado de otorgarnos.'
    }
  },

  // =========================================================================
  // CICLO 4: La Madurez y la Huella
  // =========================================================================
  {
    id: 'obj_c4_fotografia',
    tableId: 'mesa_c4_t1',
    cycle: 4,
    tableIndex: 0,
    type: 'fotografia',
    name: 'Fotografía en blanco y negro',
    position: { x: -4.6, y: 1.03, z: 0.6 },
    color: 0xd9d3c5,
    dialogue: {
      speaker: 'Jardinera',
      text: 'Don Manuel la dejó boca arriba. La cafetería en los años treinta: los mismos arcos, otras miradas, las mismas dudas. Nadie lo verá completo jamás, porque cada generación solo ve el jardín que le tocó habitar.'
    }
  },
  {
    id: 'obj_c4_semilla',
    tableId: 'mesa_c4_t2',
    cycle: 4,
    tableIndex: 1,
    type: 'semilla',
    name: 'Semilla oscura en servilleta',
    position: { x: -4.6, y: 1.03, z: 2.6 },
    color: 0x3d322b,
    dialogue: {
      speaker: 'Jardinera',
      text: 'Matilde me la dejó como un regalo silencioso. La enterraré mañana al alba en la maceta del rincón este. Sembrar es admitir que el futuro nos supera y que otros disfrutarán la sombra que hoy cuidamos a tientas.'
    }
  },
  {
    id: 'obj_c4_tijeras',
    tableId: 'mesa_c4_t3',
    cycle: 4,
    tableIndex: 2,
    type: 'tijeras',
    name: 'Tijeras de latón de bordado',
    position: { x: 4.8, y: 1.03, z: -1.6 },
    color: 0x7a828a,
    dialogue: {
      speaker: 'Jardinera',
      text: 'Valeria las dejó sobre la mesa con un suspiro largo. El latón tiene el brillo que dejan décadas de trabajo paciente. Una tijera corta para unir prendas; podar es cortar para permitir que el tronco respire.'
    }
  },
  {
    id: 'obj_c4_pipa',
    tableId: 'mesa_c4_t4',
    cycle: 4,
    tableIndex: 3,
    type: 'pipa',
    name: 'Pipa de brezo y fósforos',
    position: { x: 4.8, y: 1.03, z: 1.6 },
    color: 0x4a2e21,
    dialogue: {
      speaker: 'Jardinera',
      text: 'Camilo se fue hacia la estación del tren y olvidó su pipa cargada de tabaco rubio. Un aroma dulce flota sobre la mesa vacía. Quien de verdad sabe despedirse no deja deudas ni rencores; solo una huella tibia en el aire.'
    }
  }
];

/**
 * Obtener los objetos olvidados para un ciclo
 * Si se especifica servedTableIds (array de strings), SOLO devuelve
 * los objetos que correspondan a mesas atendidas en el día.
 * @param {number} cycle
 * @param {Array<string>|null} [servedTableIds=null]
 * @returns {Array<object>}
 */
export function getObjectsForCycle(cycle = 1, servedTableIds = null) {
  const c = Math.max(1, Math.min(4, cycle));
  const cycleObjs = forgottenObjects.filter((o) => o.cycle === c);

  if (Array.isArray(servedTableIds)) {
    return cycleObjs.filter((o) => servedTableIds.includes(o.tableId));
  }

  return cycleObjs;
}

/**
 * Buscar un objeto por su ID
 * @param {string} objectId
 * @returns {object|null}
 */
export function getObjectById(objectId) {
  return forgottenObjects.find((o) => o.id === objectId) || null;
}
