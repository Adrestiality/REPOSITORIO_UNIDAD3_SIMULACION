import * as THREE from 'three';
import { updateTime, getHour as getStateHour } from '../state.js';
import { gameConfig } from '../data/gameConfig.js';

/**
 * Reloj de pared 3D visible en la pared del fondo
 * Muestra la hora del juego y avanza con el ciclo día/noche
 */
export function createWallClock(parent) {
  const clockGroup = new THREE.Group();
  clockGroup.name = 'wall_clock';
  // Ubicado en la pared del fondo
  clockGroup.position.set(2.6, 3.8, -4.72);

  const radius = 0.52;

  // Marco exterior
  const frameGeo = new THREE.CylinderGeometry(radius, radius, 0.06, 32);
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x5e5043,
    roughness: 0.6
  });
  const frame = new THREE.Mesh(frameGeo, frameMat);
  frame.rotation.x = Math.PI / 2;
  frame.castShadow = true;
  clockGroup.add(frame);

  // Esfera del reloj
  const faceGeo = new THREE.CylinderGeometry(radius * 0.88, radius * 0.88, 0.07, 32);
  const faceMat = new THREE.MeshStandardMaterial({
    color: 0xf9f6ef,
    roughness: 0.4
  });
  const face = new THREE.Mesh(faceGeo, faceMat);
  face.rotation.x = Math.PI / 2;
  face.position.z = 0.01;
  clockGroup.add(face);

  // 12 marcas horarias
  const markMat = new THREE.MeshBasicMaterial({ color: 0x3d352e });
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const isMain = i % 3 === 0;
    const markLength = isMain ? 0.08 : 0.04;
    const markWidth = isMain ? 0.02 : 0.012;

    const markGeo = new THREE.BoxGeometry(markWidth, markLength, 0.01);
    const mark = new THREE.Mesh(markGeo, markMat);

    const dist = radius * 0.72;
    mark.position.set(
      Math.sin(angle) * dist,
      Math.cos(angle) * dist,
      0.05
    );
    mark.rotation.z = -angle;
    clockGroup.add(mark);
  }

  // Manecilla de las Horas (más corta y gruesa)
  const hourHandPivot = new THREE.Group();
  hourHandPivot.position.set(0, 0, 0.055);
  const hourHandGeo = new THREE.BoxGeometry(0.03, 0.22, 0.01);
  const handMat = new THREE.MeshBasicMaterial({ color: 0x221d19 });
  const hourHandMesh = new THREE.Mesh(hourHandGeo, handMat);
  hourHandMesh.position.y = 0.11; // Pivotar desde la base
  hourHandPivot.add(hourHandMesh);
  clockGroup.add(hourHandPivot);

  // Manecilla de los Minutos (más larga y delgada)
  const minHandPivot = new THREE.Group();
  minHandPivot.position.set(0, 0, 0.06);
  const minHandGeo = new THREE.BoxGeometry(0.018, 0.32, 0.01);
  const minHandMesh = new THREE.Mesh(minHandGeo, handMat);
  minHandMesh.position.y = 0.16;
  minHandPivot.add(minHandMesh);
  clockGroup.add(minHandPivot);

  // Perno central
  const pinGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.02, 16);
  const pinMat = new THREE.MeshBasicMaterial({ color: 0x8a7863 });
  const pin = new THREE.Mesh(pinGeo, pinMat);
  pin.rotation.x = Math.PI / 2;
  pin.position.z = 0.065;
  clockGroup.add(pin);

  parent.add(clockGroup);

  let currentHourDecimal = gameConfig.dayStartHour;
  let nightTimer = 0;

  /**
   * Actualiza la posición de las manecillas
   * @param {number} hourDecimal - Hora en decimal (ej. 8.5)
   */
  function setTime(hourDecimal) {
    currentHourDecimal = hourDecimal;
    updateTime(hourDecimal);

    // Ángulo manecilla de horas (12 horas = 2 * PI rad)
    const hourAngle = -(hourDecimal % 12) * (Math.PI / 6);
    hourHandPivot.rotation.z = hourAngle;

    // Ángulo manecilla de minutos (60 minutos = 2 * PI rad)
    const minutes = (hourDecimal % 1) * 60;
    const minAngle = -(minutes / 60) * (Math.PI * 2);
    minHandPivot.rotation.z = minAngle;
  }

  // Inicializar a las 08:00
  setTime(gameConfig.dayStartHour);

  /**
   * Actualización por frame
   * @param {number} delta
   * @param {'dia' | 'noche'} phase
   * @param {number} dayTime - Segundos transcurridos en el día
   */
  function update(delta, phase, dayTime) {
    if (phase === 'dia') {
      nightTimer = 0;
      // De 8:00 a 18:00 a lo largo del temporizador diurno (60s)
      const ratio = dayTime / gameConfig.dayDurationSeconds;
      const totalDayHours = gameConfig.dayEndHour - gameConfig.dayStartHour; // 10 horas
      // Permite avanzar ligeramente más allá de las 18:00 si continúa el estrés
      const hour = gameConfig.dayStartHour + ratio * totalDayHours;
      setTime(hour);
    } else {
      // De noche marca entre 19:00 y 23:00 avanzando muy lentamente
      nightTimer += delta;
      const nightSpan = gameConfig.nightEndHour - gameConfig.nightStartHour; // 4 horas
      // Avanza lentamente a lo largo de varios minutos
      const nightHour = gameConfig.nightStartHour + ((nightTimer * 0.02) % nightSpan);
      setTime(nightHour);
    }
  }

  /**
   * Devuelve la hora formateada
   * @returns {string} ej. "08:30"
   */
  function getHour() {
    return getStateHour();
  }

  return {
    group: clockGroup,
    setTime,
    update,
    getHour
  };
}
