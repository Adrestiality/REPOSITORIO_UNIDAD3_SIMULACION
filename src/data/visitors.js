/**
 * Datos de los 10 Visitantes y Banco de Opiniones
 * "Nadie lo verá completo" - Módulo 6
 * Textos en src/data/ siguiendo la regla global.
 */

export const visitorsData = [
  {
    id: 'visitante_ernesto',
    name: 'Don Ernesto',
    description: 'Crítico jubilado que acostumbra sentarse junto a la puerta.',
    gender: 'male',
    style: 'suit',
    isKind: false,
    palette: {
      jacket: 0x5c6258,
      pants: 0x41453e,
      shirt: 0xf5f2eb,
      tie: 0x8a4545,
      hair: 0xdedede,
      skin: 0xeed7c5,
      shoes: 0x2e2b27
    },
    hat: 'fedora',
    hatColor: 0x4d5249,
    opinions: [
      {
        id: 'op_ernesto_1',
        changeType: 'mover',
        text: 'Este "{gardenName}" se siente cargado hacia un lado. Si movieras una planta al centro se vería más equilibrado.',
        replyRefute: 'Bueno, al fin y al cabo tú eres quien barre las hojas caídas.',
        replyConsider: 'Piénsalo con calma esta noche. Los buenos jardines maduran despacio.',
        replyAccept: 'Me alegra que sepas escuchar la voz de la experiencia.',
        suggestedChange: { from: { row: 0, col: 0 }, to: { row: 1, col: 2 } }
      },
      {
        id: 'op_ernesto_2',
        changeType: 'renombrar',
        text: 'Llamar a esto "{gardenName}" suena grandilocuente. "Jardín de paso" sería mucho más honesto.',
        replyRefute: 'Como quieras. La modestia es una virtud rara en estos tiempos.',
        replyConsider: 'Consúltalo con la almohada; las palabras pesan más de lo que parecen.',
        replyAccept: 'Mucho mejor. Un nombre sobrio dignifica cualquier rincón.',
        suggestedChange: { nombre: 'Jardín de paso' }
      }
    ]
  },
  {
    id: 'visitante_valerie',
    name: 'Señora Valerie',
    description: 'Dama elegante de la sociedad local con pañuelo de seda.',
    gender: 'female',
    style: 'dress',
    isKind: false,
    palette: {
      dress: 0x9e808a,
      hair: 0x33261f,
      skin: 0xf8e5dc,
      shoes: 0x47343c
    },
    hat: 'pillbox',
    hatColor: 0x8a6e77,
    opinions: [
      {
        id: 'op_valerie_1',
        changeType: 'flores',
        text: 'El "{gardenName}" es demasiado lúgubre... con unas flores vivas en la planta del frente ganaría la alegría que le falta.',
        replyRefute: 'Qué terquedad. Una flor nunca le ha hecho daño a nadie.',
        replyConsider: 'Espero que lo medites; el buen gusto no se improvisa.',
        replyAccept: '¡Qué encanto! Ahora sí parece el jardín de una confitería respetable.',
        suggestedChange: { row: 2, col: 2, color: 0xf72585 }
      },
      {
        id: 'op_valerie_2',
        changeType: 'quitar',
        text: 'Para llamarse "{gardenName}", ese arbusto en la esquina estorba el paso visual. Quitarlo abriría el espacio.',
        replyRefute: 'En fin, cada quien se encierra en su propio desorden.',
        replyConsider: 'Fíjate de noche cuando esté vacío; notarás que tengo razón.',
        replyAccept: 'Una decisión acertada. A veces el arte consiste en saber podar.',
        suggestedChange: { row: 0, col: 4 }
      }
    ]
  },
  {
    id: 'visitante_lucia',
    name: 'Lucía',
    description: 'Joven pintora aficionada que mira el jardín con ternura.',
    gender: 'female',
    style: 'dress',
    isKind: true, // Persona amable (1 de 2)
    palette: {
      dress: 0xa8bca1, // Verde menta pastel
      hair: 0x916b47,
      skin: 0xf6e3d7,
      shoes: 0x4a4a40
    },
    hat: null,
    opinions: [
      {
        id: 'op_lucia_1',
        changeType: 'flores',
        text: 'Me gusta que este "{gardenName}" haya salido de tu corazón. Si le añadieras una flor amarilla, brillaría como un rayo de sol.',
        replyRefute: 'Lo entiendo. Tu visión ya es hermosa tal y como está.',
        replyConsider: 'Tómate tu tiempo; las mejores ideas germinan en silencio.',
        replyAccept: '¡Gracias por compartir esta chispa de luz conmigo!',
        suggestedChange: { row: 2, col: 2, color: 0xffb703 }
      },
      {
        id: 'op_lucia_auto',
        changeType: 'mover',
        // Comentario sutil si se usó el Jardinero Automático
        textAuto: 'Es muy perfecto... pero no sé a quién pertenece.',
        text: 'Veo tanto cariño en "{gardenName}". Tal vez acercar esa planta de la sombra a la luz completaría tu intención.',
        replyRefute: 'Respeto tu decisión. Lo que tú ves tiene su propio misterio.',
        replyConsider: 'Míralo con calma; el jardín te dirá dónde quiere descansar.',
        replyAccept: 'Se siente como si siempre hubiera pertenecido a ese sitio.',
        suggestedChange: { from: { row: 4, col: 0 }, to: { row: 3, col: 1 } }
      }
    ]
  },
  {
    id: 'visitante_octavio',
    name: 'Octavio',
    description: 'Profesor de botánica con lentes y chaleco tweed.',
    gender: 'male',
    style: 'vest',
    isKind: false,
    palette: {
      vest: 0x82705e,
      pants: 0x4a423b,
      shirt: 0xffffff,
      tie: 0x4d6350,
      hair: 0x2e2722,
      skin: 0xecd5c4,
      shoes: 0x2b221a
    },
    hat: null,
    opinions: [
      {
        id: 'op_octavio_1',
        changeType: 'mover',
        text: 'La distribución de "{gardenName}" desafía la fotosíntesis. Esa planta de atrás necesita moverse a una celda despejada.',
        replyRefute: 'La botánica no perdona los caprichos estéticos, muchacho.',
        replyConsider: 'Revisa cómo le da la luz de las lámparas nocturnas.',
        replyAccept: 'Una corrección taxonómicamente impecable.',
        suggestedChange: { from: { row: 4, col: 4 }, to: { row: 2, col: 3 } }
      }
    ]
  },
  {
    id: 'visitante_cecilia',
    name: 'Cecilia',
    description: 'Estudiante de literatura con abrigo y cuaderno bajo el brazo.',
    gender: 'female',
    style: 'dress',
    isKind: false,
    palette: {
      dress: 0x7c8fa6,
      hair: 0x221c17,
      skin: 0xf5dfd3,
      shoes: 0x3d3d45
    },
    hat: null,
    opinions: [
      {
        id: 'op_cecilia_1',
        changeType: 'renombrar',
        text: '"{gardenName}" me suena incompleto. En mi libreta anoté que debería titularse "Jardín del Olvido".',
        replyRefute: 'A veces los poetas no encontramos eco en la realidad.',
        replyConsider: 'Léelo en voz baja cuando cierres la puerta esta noche.',
        replyAccept: 'Qué emoción ver que una metáfora encuentra su lugar.',
        suggestedChange: { nombre: 'Jardín del Olvido' }
      }
    ]
  },
  {
    id: 'visitante_mateo',
    name: 'Mateo',
    description: 'Músico de jazz con boina que toma café despacio.',
    gender: 'male',
    style: 'vest',
    isKind: true, // Persona amable (2 de 2)
    palette: {
      vest: 0x6e7b75,
      pants: 0x3d4742,
      shirt: 0xf7f5ee,
      tie: 0xb57855,
      hair: 0x3a2f26,
      skin: 0xebd2bf,
      shoes: 0x262320
    },
    hat: 'pillbox',
    hatColor: 0x4a544f,
    opinions: [
      {
        id: 'op_mateo_1',
        changeType: 'mover',
        text: 'El ritmo de "{gardenName}" tiene swing. Aunque si corrieras una planta un compás más a la derecha, sonaría perfecto.',
        replyRefute: 'Cada músico compone su propia melodía. La tuya me gusta igual.',
        replyConsider: 'Escucha el silencio de la cafetería esta noche; allí está el tempo.',
        replyAccept: '¡Eso es! La armonía fluye cuando no le tienes miedo al cambio.',
        suggestedChange: { from: { row: 2, col: 2 }, to: { row: 1, col: 3 } }
      },
      {
        id: 'op_mateo_2',
        changeType: 'flores',
        text: 'Me gusta que este "{gardenName}" haya salido de tu corazón. Un toque violeta sería como una nota azul a medianoche.',
        replyRefute: 'Está bien. El silencio también es una nota musical hermosa.',
        replyConsider: 'Duerme sobre esa nota; mañana la melodía se aclarará.',
        replyAccept: 'Qué acorde tan bello le has regalado a este rincón.',
        suggestedChange: { row: 0, col: 0, color: 0x7209b7 }
      }
    ]
  },
  {
    id: 'visitante_miriam',
    name: 'Dra. Miriam',
    description: 'Médica del barrio que visita la cafetería en su descanso.',
    gender: 'female',
    style: 'suit',
    isKind: false,
    palette: {
      jacket: 0x8f7d73,
      pants: 0x5a4e47,
      shirt: 0xffffff,
      tie: 0x3d5c52,
      hair: 0x4a3d34,
      skin: 0xf4dfd2,
      shoes: 0x2a2420
    },
    hat: null,
    opinions: [
      {
        id: 'op_miriam_1',
        changeType: 'quitar',
        text: 'La congestión visual en "{gardenName}" produce agobio. Quitar una de las plantas del rincón traería alivio.',
        replyRefute: 'Como terapeuta te digo: acumular no siempre es sanar.',
        replyConsider: 'Obsérvalo cuando sientas fatiga; el espacio vacío cura.',
        replyAccept: 'Un diagnóstico que se convirtió en medicina para la vista.',
        suggestedChange: { row: 4, col: 0 }
      }
    ]
  },
  {
    id: 'visitante_fernando',
    name: 'Fernando',
    description: 'Arquitecto urbanista obsesionado con las líneas rectas.',
    gender: 'male',
    style: 'suit',
    isKind: false,
    palette: {
      jacket: 0x4a525d,
      pants: 0x343a42,
      shirt: 0xf4f1ea,
      tie: 0xa15247,
      hair: 0x1f1f1f,
      skin: 0xebd3c5,
      shoes: 0x202428
    },
    hat: 'fedora',
    hatColor: 0x3d434c,
    opinions: [
      {
        id: 'op_fernando_1',
        changeType: 'renombrar',
        text: '"{gardenName}" carece de rigor funcional. Debería llamarse "Módulo Verde Central".',
        replyRefute: 'Típico desprecio por la geometría y el orden estructurado.',
        replyConsider: 'El plano manda sobre el sentimiento; recuérdalo.',
        replyAccept: 'Por fin una denominación acorde a la planta arquitectónica.',
        suggestedChange: { nombre: 'Módulo Verde Central' }
      }
    ]
  },
  {
    id: 'visitante_clara_vis',
    name: 'Clara',
    description: 'Antigua clienta que viene a leer el periódico de la tarde.',
    gender: 'female',
    style: 'dress',
    isKind: false,
    palette: {
      dress: 0xb58d72,
      hair: 0x4d3326,
      skin: 0xf6dfd2,
      shoes: 0x422f25
    },
    hat: 'pillbox',
    hatColor: 0xa37b60,
    opinions: [
      {
        id: 'op_clara_1',
        changeType: 'flores',
        text: 'Para llamarse "{gardenName}", necesita un destello carmesí como los labios de las actrices de cine.',
        replyRefute: 'La timidez nunca ha llenado las salas de cine, querido.',
        replyConsider: 'Míralo desde mi mesa y verás qué bien luciría.',
        replyAccept: '¡Maravilloso! Ahora tiene el dramatismo que merecía.',
        suggestedChange: { row: 0, col: 4, color: 0xe63946 }
      }
    ]
  },
  {
    id: 'visitante_martin',
    name: 'Martín',
    description: 'Fotógrafo ambulante con gabardina ligera.',
    gender: 'male',
    style: 'suit',
    isKind: false,
    palette: {
      jacket: 0x6e706c,
      pants: 0x4f524e,
      shirt: 0xf2efe9,
      tie: 0x6b4f4f,
      hair: 0x38302b,
      skin: 0xedd6c7,
      shoes: 0x2b2b29
    },
    hat: 'fedora',
    hatColor: 0x5e615c,
    opinions: [
      {
        id: 'op_martin_1',
        changeType: 'mover',
        text: 'El encuadre de "{gardenName}" tiene mala perspectiva. Desplazar esa planta a la esquina mejoraría la toma.',
        replyRefute: 'Una pena. La foto habría salido en la portada local.',
        replyConsider: 'Mira cómo incide el reflejo del vidrio esta noche.',
        replyAccept: '¡Excelente composición! Justo en el tercio áureo.',
        suggestedChange: { from: { row: 2, col: 2 }, to: { row: 0, col: 2 } }
      }
    ]
  }
];

/**
 * Programación de visitantes opinantes por ciclo
 * Ciclo 1: ninguno opina.
 * Ciclo 2: 2 visitantes.
 * Ciclo 3: 2 o 3 visitantes (uno repite de ciclo 2: Don Ernesto).
 * Ciclo 4: visitantes según modo final.
 */
export const cycleVisitorsSchedule = {
  1: [],
  2: ['visitante_ernesto', 'visitante_valerie'],
  3: ['visitante_ernesto', 'visitante_lucia', 'visitante_octavio'],
  4: ['visitante_mateo', 'visitante_cecilia']
};

/**
 * Textos fijos y preguntas para el Módulo 6
 */
export const module6Texts = {
  btnThoughts: '💭 Pensamientos',
  btnPending: '📋 Pendientes',
  badgeNew: 'Nuevo',
  modalThoughtsTitle: 'Pensamientos de la Jardinera',
  modalThoughtsEmpty: 'Aún no se han registrado pensamientos reflexivos.',
  modalPendingTitle: 'Sugerencias y Pendientes del Jardín',
  modalPendingEmpty: 'No hay sugerencias pendientes en este ciclo.',
  btnRefute: 'Refutar',
  btnConsider: 'Considerar',
  btnAccept: 'Aceptar',
  btnDismiss: 'Cerrar',
  badgeAccepted: 'Aceptado (Ejecutado)',
  badgeConsidered: 'Considerado (Pendiente)',
  statusApplied: 'Aplicado de inmediato al jardín',
  statusPending: 'Esperando tu decisión en el arreglo',
  ownerPickupTitle: 'Dueño del objeto',
  ownerPickupText: (name) => `Entra a la cafetería, recoge su ${name} olvidado y sale en silencio.`,
  finalQuestion: '¿Lo habrías creado igual si supieras que nadie lo vería completo?',
  finalSubtitle: 'El día ha terminado. La cafetería duerme en silencio.',
  applauseMany: 'Los visitantes contemplan el jardín y aplauden con entusiasmo. El jardín ya no es tuyo; es de ellos.',
  applauseFew: 'Unos pocos visitantes aplauden tibiamente. Tu voz interior sigue dudando en el silencio.'
};
