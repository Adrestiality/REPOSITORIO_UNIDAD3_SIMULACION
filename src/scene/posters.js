import * as THREE from 'three';
import { getPostersForCycle, getQuoteMugsForCycle } from '../data/posters.js';

/**
 * Generador y gestor de Pósters Motivacionales y Tazas con Citas
 * "Nadie lo verá completo" - Módulo 3 y Mejoras
 *
 * - 4 frases nuevas por ciclo (16 en total).
 * - En la noche brillan sutilmente igual que los objetos olvidados hasta ser leídos.
 * - Las tazas también se renuevan por ciclo.
 */
export function createPostersManager(parent) {
  const group = new THREE.Group();
  group.name = 'posters_group';
  parent.add(group);

  const interactiveMeshes = [];
  const posterSlots = [];
  const mugSlots = [];
  let isNightMode = false;
  let glowTimer = 0;

  // 1. Construir las estructuras de los 4 pósters
  const initialPosters = getPostersForCycle(1);
  initialPosters.forEach((poster, idx) => {
    const slot = buildPosterSlot(poster, idx);
    posterSlots.push(slot);
    group.add(slot.posterGroup);
    interactiveMeshes.push(slot.posterPlate);
  });

  // 2. Construir las 2 tazas
  const initialMugs = getQuoteMugsForCycle(1);
  initialMugs.forEach((mug, idx) => {
    const slot = buildQuoteMugSlot(mug, idx);
    mugSlots.push(slot);
    group.add(slot.mugGroup);
  });

  /**
   * Genera el lienzo 2D con tipografía elegante para el póster
   */
  function createPosterTexture(poster) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 700;
    const ctx = canvas.getContext('2d');

    // Fondo
    ctx.fillStyle = poster.palette.bg || '#f3ece2';
    ctx.fillRect(0, 0, 512, 700);

    // Marco / ribete interior
    ctx.strokeStyle = poster.palette.border || '#7a6a5b';
    ctx.lineWidth = 10;
    ctx.strokeRect(20, 20, 472, 660);

    ctx.lineWidth = 2;
    ctx.strokeRect(32, 32, 448, 636);

    // Texto de la cita
    ctx.fillStyle = poster.palette.text || '#38312b';
    ctx.font = 'bold 36px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Ajuste de saltos de línea para el texto
    const words = poster.quote.split(' ');
    let line = '';
    const lines = [];
    const maxCharsPerLine = 18;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      if (testLine.length > maxCharsPerLine && n > 0) {
        lines.push(line.trim());
        line = words[n] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line.trim());

    const startY = 320 - lines.length * 28;
    for (let k = 0; k < lines.length; k++) {
      ctx.fillText(lines[k], 256, startY + k * 56);
    }

    // Subtítulo inferior
    if (poster.subtext) {
      ctx.font = '600 18px sans-serif';
      ctx.letterSpacing = '3px';
      ctx.fillStyle = poster.palette.border || '#7a6a5b';
      ctx.fillText(poster.subtext, 256, 580);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    return texture;
  }

  /**
   * Construye el slot 3D de un póster
   */
  function buildPosterSlot(poster, index) {
    const posterGroup = new THREE.Group();
    posterGroup.position.set(poster.position.x, poster.position.y, poster.position.z);

    const texture = createPosterTexture(poster);
    const paperMat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.75,
      metalness: 0.05,
      emissive: new THREE.Color(0xfff6dc),
      emissiveIntensity: 0
    });

    const w = poster.width || 1.25;
    const h = poster.height || 1.7;

    // Placa del póster
    const posterPlate = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.02), paperMat);
    posterPlate.position.set(0, 0, 0.01);
    posterPlate.castShadow = true;
    posterPlate.userData = {
      isPoster: true,
      data: poster,
      slotIndex: index
    };
    posterGroup.add(posterPlate);

    // Marco exterior de madera fina
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x54473b, roughness: 0.7 });
    const frameBorder = new THREE.Mesh(new THREE.BoxGeometry(w + 0.08, h + 0.08, 0.03), frameMat);
    frameBorder.position.set(0, 0, -0.005);
    posterGroup.add(frameBorder);

    // Luz de brillo nocturno sutil (igual a los objetos olvidados)
    const glowLight = new THREE.PointLight(0xfff3cf, 0.45, 2.0);
    glowLight.position.set(0, 0, 0.22);
    glowLight.visible = false;
    posterGroup.add(glowLight);

    return {
      index,
      data: poster,
      posterGroup,
      posterPlate,
      paperMat,
      glowLight,
      isRead: false
    };
  }

  /**
   * Construye el slot 3D de una taza
   */
  function buildQuoteMugSlot(mug, index) {
    const mugGroup = new THREE.Group();
    mugGroup.position.set(mug.position.x, mug.position.y, mug.position.z);

    const mugMat = new THREE.MeshStandardMaterial({
      color: mug.color || 0xf2ebe2,
      roughness: 0.45
    });

    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.045, 0.09, 14), mugMat);
    body.position.y = 0.045;
    body.castShadow = true;
    mugGroup.add(body);

    // Asa
    const handle = new THREE.Mesh(
      new THREE.TorusGeometry(0.03, 0.01, 8, 12, Math.PI * 1.2),
      mugMat
    );
    handle.position.set(0.058, 0.045, 0);
    handle.rotation.y = Math.PI / 2;
    mugGroup.add(handle);

    return {
      index,
      data: mug,
      mugGroup,
      body,
      mugMat
    };
  }

  /**
   * Renueva los 4 pósters y las 2 tazas para el ciclo especificado
   * Cada noche se renuevan los 4 pósters y brillan hasta ser leídos
   * @param {number} cycle
   */
  function renewForCycle(cycle = 1) {
    const newPosters = getPostersForCycle(cycle);
    newPosters.forEach((pData, idx) => {
      const slot = posterSlots[idx];
      if (!slot) return;

      slot.data = pData;
      slot.isRead = false;
      slot.posterPlate.userData.data = pData;

      // Reemplazar textura
      if (slot.paperMat.map) {
        slot.paperMat.map.dispose();
      }
      slot.paperMat.map = createPosterTexture(pData);
      slot.paperMat.needsUpdate = true;

      // Si está en modo noche, activar brillo
      if (isNightMode) {
        slot.glowLight.visible = true;
      }
    });

    const newMugs = getQuoteMugsForCycle(cycle);
    newMugs.forEach((mData, idx) => {
      const slot = mugSlots[idx];
      if (!slot) return;

      slot.data = mData;
      slot.mugMat.color.setHex(mData.color || 0xf2ebe2);
    });
  }

  /**
   * Cambia el modo noche para encender o apagar el brillo nocturno de pósters
   * @param {boolean} isNight
   */
  function setNightMode(isNight) {
    isNightMode = isNight;
    posterSlots.forEach((slot) => {
      if (isNight && !slot.isRead) {
        slot.glowLight.visible = true;
      } else {
        slot.glowLight.visible = false;
        slot.paperMat.emissiveIntensity = 0;
      }
    });
  }

  /**
   * Marca un póster como leído: se apaga su brillo nocturno
   * @param {string} posterId
   */
  function markRead(posterId) {
    const slot = posterSlots.find((s) => s.data && s.data.id === posterId);
    if (!slot) return;

    slot.isRead = true;
    slot.glowLight.visible = false;
    slot.paperMat.emissiveIntensity = 0;
  }

  /**
   * Actualización de la animación del brillo sutil nocturno
   * @param {number} delta
   * @param {'dia'|'noche'} phase
   */
  function update(delta, phase = 'dia') {
    if (phase !== 'noche') {
      posterSlots.forEach((slot) => {
        if (slot.glowLight.visible) slot.glowLight.visible = false;
        if (slot.paperMat.emissiveIntensity > 0) slot.paperMat.emissiveIntensity = 0;
      });
      return;
    }

    glowTimer += delta;

    posterSlots.forEach((slot, i) => {
      if (!slot.isRead) {
        // Mismo efecto sutil y pulsante de los objetos olvidados
        const pulse = 0.4 + Math.sin(glowTimer * 3.0 + i * 1.5) * 0.22;
        slot.glowLight.intensity = pulse * 0.55;
        slot.paperMat.emissiveIntensity = pulse * 0.65;
        if (!slot.glowLight.visible) {
          slot.glowLight.visible = true;
        }
      } else {
        slot.glowLight.visible = false;
        slot.paperMat.emissiveIntensity = 0;
      }
    });
  }

  return {
    group,
    interactiveMeshes,
    getInteractiveMeshes: () => interactiveMeshes,
    renewForCycle,
    setNightMode,
    markRead,
    update
  };
}
