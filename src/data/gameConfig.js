/**
 * Configuración global del juego "Nadie lo verá completo"
 * Módulo 2
 */
export const gameConfig = {
  // Tiempos
  dayDurationSeconds: 90, // Duración del día (90s máximo según especificación)
  redFadeOutSeconds: 2.0, // Tiempo de disolución del rojo al cerrar
  idlePatrolDelaySeconds: 4.5, // Tiempo de inactividad antes de patrullar en círculos

  // Horas del reloj
  dayStartHour: 8.0, // 08:00
  dayEndHour: 18.0, // 18:00
  nightStartHour: 19.0, // 19:00
  nightEndHour: 23.0, // 23:00

  // Textos y etiquetas
  signOpenText: 'ABIERTO',
  signClosedText: 'CERRADO',
  titleConsole: 'Nadie lo verá completo',

  // Límites transitables del piso para el jardinero (X y Z)
  bounds: {
    minX: -6.0,
    maxX: 6.0,
    minZ: -4.0,
    maxZ: 3.6
  },

  // Posición de la puerta para salidas
  doorPosition: {
    x: -6.5,
    y: 0,
    z: -2.4
  }
};
