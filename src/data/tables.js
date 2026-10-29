/**
 * Guiones de conversaciones de mesas de día
 * "Nadie lo verá completo"
 *
 * 16 mesas en total (4 por ciclo, 4 ciclos).
 * Cada mesa tiene un cliente con un dilema personal y deja un objeto olvidado de noche.
 * Los textos viven en src/data/ siguiendo la regla global.
 */

export const tablesData = [
  // =========================================================================
  // CICLO 1: Primeras Confidencias
  // =========================================================================
  {
    id: 'mesa_c1_t1',
    objetoAsociado: 'Libro de poemas',
    cycle: 1,
    tableIndex: 0, // Mesa redonda izquierda 1 (-4.6, 0.6)
    customerName: 'Arturo',
    theme: 'poemas',
    objectId: 'obj_c1_libreta',
    lines: [
      { speaker: 'Arturo', text: 'Perdón si tardé en pedir... estaba intentando tachar un verso que no dice nada de lo que siento.' },
      { speaker: 'Jardinera', text: 'Aquí tiene su café negro. A veces lo que no cabe en las palabras se queda flotando en la taza.' },
      { speaker: 'Arturo', text: 'Llevo cuatro horas escribiendo sobre el jazmín del patio y solo consigo adjetivos prestados.' },
      { speaker: 'Jardinera', text: 'El jazmín no busca explicarse a sí mismo; solo florece y deja que el aire cargue con su olor.' }
    ]
  },
  {
    id: 'mesa_c1_t2',
    objetoAsociado: 'Taza de café fría',
    cycle: 1,
    tableIndex: 1, // Mesa redonda izquierda 2 (-4.6, 2.6)
    customerName: 'Elena',
    theme: 'espera y abandono',
    objectId: 'obj_c1_taza',
    lines: [
      { speaker: 'Elena', text: 'Un café bien caliente, por favor. La persona con la que iba a hablar no va a venir.' },
      { speaker: 'Jardinera', text: 'Enseguida se lo sirvo. La prisa ajena casi nunca tiene que ver con nosotros.' },
      { speaker: 'Elena', text: 'Me pasé la tarde convenciéndome de que esta vez tendría el valor de escucharme.' },
      { speaker: 'Jardinera', text: 'A veces el silencio de una silla vacía es la respuesta más clara de todas.' }
    ]
  },
  {
    id: 'mesa_c1_t3',
    objetoAsociado: 'Chaqueta de paño',
    cycle: 1,
    tableIndex: 2, // Mesa rectangular derecha 1 (4.8, -1.6)
    customerName: 'Julián',
    theme: 'discusión y prisa',
    objectId: 'obj_c1_chaqueta',
    lines: [
      { speaker: 'Julián', text: 'Un expreso rápido, señorita. Acabo de colgar el teléfono y necesito enfriar la cabeza.' },
      { speaker: 'Jardinera', text: 'Aquí tiene. Tómelo despacio; las palabras amargas se atoran si se tragan con prisa.' },
      { speaker: 'Julián', text: 'Discutir con quien quieres es como podar una rama sana por puro orgullo.' },
      { speaker: 'Jardinera', text: 'Una rama cortada con rabia tarda el doble de primaveras en volver a brotar.' }
    ]
  },
  {
    id: 'mesa_c1_t4',
    objetoAsociado: 'Periódico del día',
    cycle: 1,
    tableIndex: 3, // Mesa rectangular derecha 2 (4.8, 1.6)
    customerName: 'Margarita',
    theme: 'despido y periódico',
    objectId: 'obj_c1_periodico',
    lines: [
      { speaker: 'Margarita', text: 'Café con leche, por favor. Hoy me entregaron mi última liquidación en la imprenta.' },
      { speaker: 'Jardinera', text: 'Aquí lo tiene bien servido. Lo siento mucho... las máquinas no distinguen el cariño puesto en el oficio.' },
      { speaker: 'Margarita', text: 'Treinta años cuidando tipografías y letras de plomo para que te despidan en una esquela.' },
      { speaker: 'Jardinera', text: 'Las raíces no se mueren cuando se trasplanta la maceta; solo necesitan otra tierra donde asentarse.' }
    ]
  },

  // =========================================================================
  // CICLO 2: El Tiempo y la Distancia
  // =========================================================================
  {
    id: 'mesa_c2_t1',
    objetoAsociado: 'Reloj de bolsillo',
    cycle: 2,
    tableIndex: 0,
    customerName: 'Don Aurelio',
    theme: 'reloj detenido y vejez',
    objectId: 'obj_c2_reloj_bolsillo',
    lines: [
      { speaker: 'Don Aurelio', text: 'Jardinera, un cortado. Este reloj se detuvo a las cuatro y cuarto y no he querido darle cuerda.' },
      { speaker: 'Jardinera', text: 'Aquí lo tiene, Don Aurelio. Quizás a las cuatro y cuarto ocurrió algo que merecía durar más tiempo.' },
      { speaker: 'Don Aurelio', text: 'A esa hora mi esposa me esperaba cada tarde en este mismo banco de madera.' },
      { speaker: 'Jardinera', text: 'Los recuerdos son como las plantas perennes: parecen dormidos en invierno, pero siguen ahí abajo.' }
    ]
  },
  {
    id: 'mesa_c2_t2',
    objetoAsociado: 'Guantes de terciopelo',
    cycle: 2,
    tableIndex: 1,
    customerName: 'Beatriz',
    theme: 'guantes y frialdad',
    objectId: 'obj_c2_guantes',
    lines: [
      { speaker: 'Beatriz', text: 'Un capuchino, por favor. Tengo las manos heladas y el alma un poco más.' },
      { speaker: 'Jardinera', text: 'Aquí tiene, recién preparado. Abrace la taza con las dos palmas; el calor ayuda a templar las ideas.' },
      { speaker: 'Beatriz', text: 'Discutí con mi hermana antes de entrar. Se fue sin mirarme y me dejó con la sensación de ser una extraña.' },
      { speaker: 'Jardinera', text: 'A veces el orgullo nos pone una coraza de terciopelo que no deja pasar ni el afecto más limpio.' }
    ]
  },
  {
    id: 'mesa_c2_t3',
    objetoAsociado: 'Carta sin enviar',
    cycle: 2,
    tableIndex: 2,
    customerName: 'Ignacio',
    theme: 'carta sin enviar',
    objectId: 'obj_c2_carta',
    lines: [
      { speaker: 'Ignacio', text: 'Un café solo. Llevo este sobre sellado en el bolsillo desde el lunes y no me animo a meterlo al buzón.' },
      { speaker: 'Jardinera', text: 'Aquí tiene su café. Guardar una carta sin enviar pesa más en el bolsillo que una piedra de río.' },
      { speaker: 'Ignacio', text: 'Dice todo lo que callé en diez años. Si la lee, nada volverá a ser igual.' },
      { speaker: 'Jardinera', text: 'A veces las ramas necesitan doblarse con el vendaval para que entre la luz que estaba tapada.' }
    ]
  },
  {
    id: 'mesa_c2_t4',
    objetoAsociado: 'Gafas de lectura',
    cycle: 2,
    tableIndex: 3,
    customerName: 'Clara',
    theme: 'gafas y miopía',
    objectId: 'obj_c2_gafas',
    lines: [
      { speaker: 'Clara', text: 'Un café suave, jardinera. Hoy el oftalmólogo me dijo que mi vista se irá apagando poco a poco.' },
      { speaker: 'Jardinera', text: 'Aquí tiene su taza. Me duele oírlo, Clara... pero ver no es solo enfocar con los ojos.' },
      { speaker: 'Clara', text: 'Tengo miedo de olvidar cómo lucen las begonias cuando empieza la primavera.' },
      { speaker: 'Jardinera', text: 'El tacto y el aroma de la tierra húmeda tienen una memoria mucho más profunda que la retina.' }
    ]
  },

  // =========================================================================
  // CICLO 3: Secretos y Recuerdos
  // =========================================================================
  {
    id: 'mesa_c3_t1',
    objetoAsociado: 'Espejo de mano',
    cycle: 3,
    tableIndex: 0,
    customerName: 'Silvia',
    theme: 'espejo y apariencia',
    objectId: 'obj_c3_espejo',
    lines: [
      { speaker: 'Silvia', text: 'Un café americano, por favor. Miro mi reflejo en este espejo y casi no reconozco a quien me mira.' },
      { speaker: 'Jardinera', text: 'Aquí tiene. Los espejos solo devuelven la superficie; el fondo siempre se queda de nuestro lado.' },
      { speaker: 'Silvia', text: 'Pasé la juventud fingiendo una serenidad que nunca tuve para complacer a los demás.' },
      { speaker: 'Jardinera', text: 'Un jardín nunca pide disculpas por sus espinas; crecen juntas con la rosa y nadie las desprecia.' }
    ]
  },
  {
    id: 'mesa_c3_t2',
    objetoAsociado: 'Llave de latón',
    cycle: 3,
    tableIndex: 1,
    customerName: 'Tomás',
    theme: 'llave de casa perdida',
    objectId: 'obj_c3_llave',
    lines: [
      { speaker: 'Tomás', text: 'Buenas tardes, jardinera. Sírveme un café fuerte. Hoy entregué la llave de la casa de mis padres.' },
      { speaker: 'Jardinera', text: 'Aquí lo tiene. Desprenderse de un cerrojo viejo deja un vacío extraño en las manos.' },
      { speaker: 'Tomás', text: 'Conservo esta copia en latón aunque ya no abra nada. No sé a dónde ir ahora.' },
      { speaker: 'Jardinera', text: 'El hogar no son cuatro paredes con cerrojo; es el rincón donde uno puede sentarse a respirar sin miedo.' }
    ]
  },
  {
    id: 'mesa_c3_t3',
    objetoAsociado: 'Cajita de música',
    cycle: 3,
    tableIndex: 2,
    customerName: 'Guillermo',
    theme: 'caja de música rota',
    objectId: 'obj_c3_caja_musica',
    lines: [
      { speaker: 'Guillermo', text: 'Un café solo, por favor. Esta cajita de música era de mi hija cuando era pequeña y no consigo que suene afinada.' },
      { speaker: 'Jardinera', text: 'Aquí tiene su taza. Las melodías gastadas tienen su propio encanto, como las hojas otoñales.' },
      { speaker: 'Guillermo', text: 'Se marchó a estudiar al extranjero y temo que la distancia nos vuelva desconocidos.' },
      { speaker: 'Jardinera', text: 'Quien tiene raíces firmes siempre encuentra el camino de regreso al jardín de donde salió.' }
    ]
  },
  {
    id: 'mesa_c3_t4',
    objetoAsociado: 'Cinta métrica de sastre',
    cycle: 3,
    tableIndex: 3,
    customerName: 'Esteban',
    theme: 'cinta métrica y medida',
    objectId: 'obj_c3_cinta_metrica',
    lines: [
      { speaker: 'Esteban', text: 'Un café con canela. Trabajo como sastre y me paso el día midiendo a la gente para ocultar sus defectos.' },
      { speaker: 'Jardinera', text: 'Aquí tiene. Curioso oficio... vestir a quien quiere parecer perfecto ante los ojos ajenos.' },
      { speaker: 'Esteban', text: 'Nadie tiene hombros rectos ni espaldas simétricas, pero todos me exigen que el traje los haga parecer reyes.' },
      { speaker: 'Jardinera', text: 'En la naturaleza no hay una sola hoja perfectamente recta, y es justamente ahí donde reside la belleza.' }
    ]
  },

  // =========================================================================
  // CICLO 4: La Madurez y la Despedida
  // =========================================================================
  {
    id: 'mesa_c4_t1',
    objetoAsociado: 'Fotografía en blanco y negro',
    cycle: 4,
    tableIndex: 0,
    customerName: 'Don Manuel',
    theme: 'fotografía antigua',
    objectId: 'obj_c4_fotografia',
    lines: [
      { speaker: 'Don Manuel', text: 'Jardinera, un café aromático. Mire esta foto en blanco y negro: esta cafetería existía antes de que naciéramos.' },
      { speaker: 'Jardinera', text: 'Aquí tiene, Don Manuel. Me asombra pensar cuántas personas se habrán sentado aquí a contemplar las plantas.' },
      { speaker: 'Don Manuel', text: 'Ninguna de aquellas personas está viva hoy, pero este aroma a café tostado y tierra sigue idéntico.' },
      { speaker: 'Jardinera', text: 'Cuidar un rincón como este es un pacto con quienes ya no están y con quienes aún no han llegado.' }
    ]
  },
  {
    id: 'mesa_c4_t2',
    objetoAsociado: 'Semilla en servilleta',
    cycle: 4,
    tableIndex: 1,
    customerName: 'Matilde',
    theme: 'semilla misteriosa',
    objectId: 'obj_c4_semilla',
    lines: [
      { speaker: 'Matilde', text: 'Un té de menta o café ligero. Traigo esta semilla en una servilleta, no sé qué árbol dará.' },
      { speaker: 'Jardinera', text: 'Aquí tiene su taza. Qué misterio más hermoso encierra una semilla oscura en la palma de la mano.' },
      { speaker: 'Matilde', text: 'La recogí en un viaje a las montañas. Quería sembrarla aquí, en tu jardín, si me lo permites.' },
      { speaker: 'Jardinera', text: 'La cuidaré con esmero. Cada semilla es un acto de fe en un mañana que no alcanzamos a ver.' }
    ]
  },
  {
    id: 'mesa_c4_t3',
    objetoAsociado: 'Tijeras de bordar',
    cycle: 4,
    tableIndex: 2,
    customerName: 'Valeria',
    theme: 'tijeras de bordar',
    objectId: 'obj_c4_tijeras',
    lines: [
      { speaker: 'Valeria', text: 'Un cortado, por favor. Dejo de coser por hoy; mis dedos ya no tienen la precisión de antes.' },
      { speaker: 'Jardinera', text: 'Aquí tiene, bien caliente. Descanse sus manos; han creado cosas hermosas que durarán muchos años.' },
      { speaker: 'Valeria', text: 'Estas tijeras de latón me acompañaron toda la vida. Me aterra pensar en el día en que ya no pueda usarlas.' },
      { speaker: 'Jardinera', text: 'Las herramientas que crearon con amor nunca se quedan quietas; su eco sigue en cada prenda que acarició.' }
    ]
  },
  {
    id: 'mesa_c4_t4',
    objetoAsociado: 'Pipa de brezo',
    cycle: 4,
    tableIndex: 3,
    customerName: 'Camilo',
    theme: 'pipa y despedida',
    objectId: 'obj_c4_pipa',
    lines: [
      { speaker: 'Camilo', text: 'El último café del día, jardinera. Mañana tomo el tren hacia el sur y no sé si volveré a esta ciudad.' },
      { speaker: 'Jardinera', text: 'Aquí tiene su taza, Camilo. Los viajes largos siempre despiertan una nostalgia anticipada.' },
      { speaker: 'Camilo', text: 'Extrañaré la calma de este jardín. En ningún otro lugar encontré tanto respeto por el silencio.' },
      { speaker: 'Jardinera', text: 'El silencio se lo lleva usted en el pecho. Este jardín siempre guardará un rincón para quien supo escucharlo.' }
    ]
  }
];

/**
 * Obtener las 4 mesas programadas para un ciclo específico (1 a 4)
 * @param {number} cycle
 * @returns {Array<object>}
 */
export function getTablesForCycle(cycle = 1) {
  const c = Math.max(1, Math.min(4, cycle));
  return tablesData.filter((t) => t.cycle === c);
}

/**
 * Buscar una mesa por su ID
 * @param {string} tableId
 * @returns {object|null}
 */
export function getTableById(tableId) {
  return tablesData.find((t) => t.id === tableId) || null;
}
