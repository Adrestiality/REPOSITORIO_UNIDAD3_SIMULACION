import * as THREE from 'three/webgpu';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import WebGPU from 'three/addons/capabilities/WebGPU.js';
import { color, mix, smoothstep, length } from 'three/tsl';
import './styles.css';

import { createParameters } from './simulation/parameters.js';
import { createSimulation } from './simulation/createSimulation.js';
import { createLabPanel } from './ui/labPanel.js';

const PARTICLE_COUNT = 131072;

async function main() {
  const mount = document.querySelector('#app');

  if (!WebGPU.isAvailable()) {
    mount.appendChild(WebGPU.getErrorMessage());
    throw new Error('Este proyecto requiere WebGPU para ejecutar compute shaders.');
  }

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#050607');

  const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.05, 100);
  camera.position.set(0, 0, 11);

  const renderer = new THREE.WebGPURenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  mount.appendChild(renderer.domElement);
  await renderer.init();

  const orbit = new OrbitControls(camera, renderer.domElement);
  orbit.enableDamping = true;
  orbit.target.set(0, 0, 0);

  orbit.mouseButtons = {
    LEFT: THREE.MOUSE.NONE,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.NONE
  };

  const params = createParameters();
  const simulation = createSimulation({ renderer, scene, params, count: PARTICLE_COUNT });

  // DEFINICIÓN DE PALETAS SEGÚN MODO
  // Paleta 1 (+ / Arriba / Derecha): Azul y Amarillo (#0066ff / #ffea00)
  // Paleta 2 (- / Abajo / Izquierda): Verde y Fucsia (#00ff66 / #ff007f)
  const setPalette = (theme) => {
    if (!simulation.material) return;

    if (theme === 'YELLOW_BLUE') {
      const colA = color('#0066ff'); // Azul
      const colB = color('#ffea00'); // Amarillo
      const speed = length(simulation.velocityNode || vec3(0));
      const t = smoothstep(0.0, 4.0, speed);
      simulation.material.colorNode = mix(colA, colB, t);
    } else if (theme === 'GREEN_FUCHSIA') {
      const colA = color('#00ff66'); // Verde
      const colB = color('#ff007f'); // Fucsia
      const speed = length(simulation.velocityNode || vec3(0));
      const t = smoothstep(0.0, 4.0, speed);
      simulation.material.colorNode = mix(colA, colB, t);
    }
  };

  // Paleta inicial (Azul / Amarillo)
  setPalette('YELLOW_BLUE');

  const attractorHelper = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 16, 12),
    new THREE.MeshBasicMaterial({ color: '#ffffff' })
  );
  scene.add(attractorHelper);
  const axes = new THREE.AxesHelper(1.5);
  scene.add(axes);

  const pointerNdc = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();
  const interactionPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const hit = new THREE.Vector3();

  addEventListener('pointermove', (event) => {
    pointerNdc.x = (event.clientX / innerWidth) * 2 - 1;
    pointerNdc.y = -(event.clientY / innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointerNdc, camera);
    if (raycaster.ray.intersectPlane(interactionPlane, hit)) {
      params.attractor.value.copy(hit);
      attractorHelper.position.copy(hit);
    }
  });

  renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());

  let isLeftClickAttracting = false;
  let isRightClickRepelling = false;

  let savedRadialStrength = params.radialStrength.value;
  let savedRadialEnabled = params.radialEnabled.value;
  let savedWindEnabled = params.windEnabled.value;
  let savedVortexEnabled = params.vortexEnabled.value;
  let savedLorenzEnabled = params.lorenzEnabled.value;
  let savedCurlEnabled = params.curlEnabled.value;
  let savedPulseEnabled = params.pulseEnabled.value;
  let savedBoidsEnabled = params.boidsEnabled.value;
  let savedPressureEnabled = params.pressureEnabled.value;

  renderer.domElement.addEventListener('pointerdown', (event) => {
    if (event.button === 0) {
      isLeftClickAttracting = true;
      savedRadialStrength = params.radialStrength.value;
      savedRadialEnabled = params.radialEnabled.value;
      savedWindEnabled = params.windEnabled.value;
      savedVortexEnabled = params.vortexEnabled.value;
      savedLorenzEnabled = params.lorenzEnabled.value;
      savedCurlEnabled = params.curlEnabled.value;
      savedPulseEnabled = params.pulseEnabled.value;
      savedBoidsEnabled = params.boidsEnabled.value;
      savedPressureEnabled = params.pressureEnabled.value;

      params.radialEnabled.value = 1.0;
      params.radialStrength.value = 8.0;
      params.windEnabled.value = 0.0;
      params.vortexEnabled.value = 0.0;
      params.lorenzEnabled.value = 0.0;
      params.curlEnabled.value = 0.0;
      params.pulseEnabled.value = 0.0;
      params.boidsEnabled.value = 0.0;
      params.pressureEnabled.value = 0.0;
      panel?.refresh();
    }

    if (event.button === 2) {
      isRightClickRepelling = true;
      savedRadialStrength = params.radialStrength.value;
      savedRadialEnabled = params.radialEnabled.value;

      params.radialEnabled.value = 1.0;
      params.radialStrength.value = -6.0;
      panel?.refresh();
    }
  });

  addEventListener('pointerup', (event) => {
    if (event.button === 0 && isLeftClickAttracting) {
      isLeftClickAttracting = false;
      params.radialEnabled.value = savedRadialEnabled;
      params.radialStrength.value = savedRadialStrength;
      params.windEnabled.value = savedWindEnabled;
      params.vortexEnabled.value = savedVortexEnabled;
      params.lorenzEnabled.value = savedLorenzEnabled;
      params.curlEnabled.value = savedCurlEnabled;
      params.pulseEnabled.value = savedPulseEnabled;
      params.boidsEnabled.value = savedBoidsEnabled;
      params.pressureEnabled.value = savedPressureEnabled;
      panel?.refresh();
    }

    if (event.button === 2 && isRightClickRepelling) {
      isRightClickRepelling = false;
      params.radialEnabled.value = savedRadialEnabled;
      params.radialStrength.value = savedRadialStrength;
      panel?.refresh();
    }
  });

  let paused = false;
  let mode = 'LAB';
  let panel;

  const setShape = (type) => {
    if (params.shapeType.value !== type) {
      simulation.startMorph(type);
    }
  };

  const applyPreset = (id) => {
    params.windEnabled.value = 1;
    params.radialEnabled.value = 0;
    params.vortexEnabled.value = 0;
    params.dragEnabled.value = 0;
    params.lorenzEnabled.value = 0;
    params.lorenzStrength.value = 0;
    params.curlEnabled.value = 0;
    params.curlStrength.value = 0;
    params.pulseEnabled.value = 0;
    params.pulseStrength.value = 0;
    params.boidsEnabled.value = 0;
    params.boidsStrength.value = 0;
    params.pressureEnabled.value = 0;
    params.pressureStrength.value = 0;
    params.wind.value.set(0, 0, 0);
    params.initialSpeed.value = 0;

    if (id === 'inertia') {
      params.initialSpeed.value = 0.8;
    } else if (id === 'wind') {
      params.windEnabled.value = 1;
      params.wind.value.set(1.5, 0, 0);
    } else if (id === 'attract') {
      params.radialEnabled.value = 1;
      params.radialStrength.value = 3.0;
    } else if (id === 'repel') {
      params.radialEnabled.value = 1;
      params.radialStrength.value = -3.0;
    } else if (id === 'vortex') {
      params.radialEnabled.value = 1;
      params.radialStrength.value = 1.0;
      params.vortexEnabled.value = 1;
      params.vortexStrength.value = 3.0;
      params.dragEnabled.value = 1;
      params.dragCoefficient.value = 0.08;
    } else if (id === 'lorenz') {
      params.radialEnabled.value = 0;
      params.vortexEnabled.value = 0;
      params.windEnabled.value = 0;
      params.dragEnabled.value = 1;
      params.dragCoefficient.value = 0.05;
      params.lorenzEnabled.value = 1;
      params.lorenzStrength.value = 1.8;
    } else if (id === 'curl') {
      params.radialEnabled.value = 0;
      params.vortexEnabled.value = 0;
      params.windEnabled.value = 0;
      params.dragEnabled.value = 1;
      params.dragCoefficient.value = 0.04;
      params.curlEnabled.value = 1;
      params.curlStrength.value = 2.5;
    } else if (id === 'pulse') {
      params.radialEnabled.value = 0;
      params.vortexEnabled.value = 0;
      params.windEnabled.value = 0;
      params.dragEnabled.value = 1;
      params.dragCoefficient.value = 0.08;
      params.pulseEnabled.value = 1;
      params.pulseStrength.value = 6.0;
    } else if (id === 'boids') {
      params.radialEnabled.value = 0;
      params.vortexEnabled.value = 0;
      params.windEnabled.value = 0;
      params.dragEnabled.value = 1;
      params.dragCoefficient.value = 0.06;
      params.boidsEnabled.value = 1;
      params.boidsStrength.value = 3.0;
    } else if (id === 'pressure') {
      params.radialEnabled.value = 0;
      params.vortexEnabled.value = 0;
      params.windEnabled.value = 0;
      params.dragEnabled.value = 1;
      params.dragCoefficient.value = 0.05;
      params.pressureEnabled.value = 1;
      params.pressureStrength.value = 3.5;
    }
    simulation.reset();
    panel?.refresh();
  };

  const setMode = (next) => {
    mode = next;
    const lab = mode === 'LAB';
    panel.setVisible(lab);
    axes.visible = lab;
    attractorHelper.visible = lab;
    hud.innerHTML = lab
      ? '<strong>LAB</strong> · [- / Abajo / Izq]: Verde-Fucsia · [+ / Arriba / Der]: Azul-Amarillo · [N / M]: Lorenz · [V / B]: Curl · [X / C]: Pulse · [J / K]: Densidad · [U / I]: Boids'
      : '';
  };

  panel = createLabPanel({
    params,
    onReset: () => simulation.reset(),
    onPreset: applyPreset,
    onShapeChange: setShape,
    onModeChange: () => setMode(mode === 'LAB' ? 'PERFORMANCE' : 'LAB'),
    onPauseChange: () => paused = !paused
  });

  const hud = document.createElement('div');
  hud.className = 'hud';
  document.body.append(hud);
  setMode('LAB');

  // KEYBOARD CONTROLS Y CAMBIO DE PALETAS
  addEventListener('keydown', (event) => {
    if (event.code === 'KeyP') setMode(mode === 'LAB' ? 'PERFORMANCE' : 'LAB');
    if (event.code === 'KeyR') simulation.reset();

    if (event.code === 'Digit1') setShape(0);
    if (event.code === 'Digit2') setShape(1);
    if (event.code === 'Digit3') setShape(3);

    // TECLA MENOS (-): CAÍDA LIBRE + PALETA VERDE Y FUCSIA
    if (event.code === 'Minus' || event.code === 'NumpadSubtract') {
      params.radialEnabled.value = 0.0;
      params.vortexEnabled.value = 0.0;
      params.dragEnabled.value = 0.0;
      params.lorenzEnabled.value = 0.0;
      params.curlEnabled.value = 0.0;
      params.pulseEnabled.value = 0.0;
      params.boidsEnabled.value = 0.0;
      params.pressureEnabled.value = 0.0;
      params.windEnabled.value = 1.0;
      params.wind.value.set(0.0, -9.81, 0.0);
      params.maxSpeed.value = 50.0;

      setPalette('GREEN_FUCHSIA');
      panel?.refresh();
    }

    // TECLA MÁS (+): RESTAURAR + PALETA AZUL Y AMARILLO
    if (event.code === 'Equal' || event.code === 'NumpadAdd' || event.key === '+') {
      params.radialEnabled.value = 1.0;
      params.radialStrength.value = 2.2;
      params.vortexEnabled.value = 1.0;
      params.vortexStrength.value = 1.4;
      params.dragEnabled.value = 1.0;
      params.dragCoefficient.value = 0.12;
      params.lorenzEnabled.value = 1.0;
      params.lorenzStrength.value = 0.0;
      params.curlEnabled.value = 1.0;
      params.curlStrength.value = 0.0;
      params.pulseEnabled.value = 1.0;
      params.pulseStrength.value = 0.0;
      params.boidsEnabled.value = 1.0;
      params.boidsStrength.value = 0.0;
      params.pressureEnabled.value = 1.0;
      params.pressureStrength.value = 0.0;
      params.windEnabled.value = 1.0;
      params.wind.value.set(0.0, 0.0, 0.0);
      params.maxSpeed.value = 5.0;

      simulation.startMorph(params.shapeType.value);
      setPalette('YELLOW_BLUE');
      panel?.refresh();
    }

    const WIND_STEP = 0.15;
    const LORENZ_STEP = 0.1;
    const CURL_STEP = 0.1;
    const PULSE_STEP = 0.2;
    const BOIDS_STEP = 0.1;
    const PRESSURE_STEP = 0.2;

    // TECLAS N Y M: AUMENTAR / DISMINUIR ATRACTOR DE LORENZ
    if (event.code === 'KeyN') {
      params.lorenzEnabled.value = 1.0;
      params.lorenzStrength.value = Math.min(5.0, Number((params.lorenzStrength.value + LORENZ_STEP).toFixed(2)));
      panel?.refresh();
    }
    if (event.code === 'KeyM') {
      params.lorenzStrength.value = Math.max(0.0, Number((params.lorenzStrength.value - LORENZ_STEP).toFixed(2)));
      panel?.refresh();
    }

    // TECLAS V Y B: AUMENTAR / DISMINUIR CURL NOISE
    if (event.code === 'KeyV') {
      params.curlEnabled.value = 1.0;
      params.curlStrength.value = Math.min(6.0, Number((params.curlStrength.value + CURL_STEP).toFixed(2)));
      panel?.refresh();
    }
    if (event.code === 'KeyB') {
      params.curlStrength.value = Math.max(0.0, Number((params.curlStrength.value - CURL_STEP).toFixed(2)));
      panel?.refresh();
    }

    // TECLAS X Y C: AUMENTAR / DISMINUIR ONDA DE CHOQUE (PULSE)
    if (event.code === 'KeyX') {
      params.pulseEnabled.value = 1.0;
      params.pulseStrength.value = Math.min(10.0, Number((params.pulseStrength.value + PULSE_STEP).toFixed(2)));
      panel?.refresh();
    }
    if (event.code === 'KeyC') {
      params.pulseStrength.value = Math.max(0.0, Number((params.pulseStrength.value - PULSE_STEP).toFixed(2)));
      panel?.refresh();
    }

    // TECLAS J Y K: AUMENTAR / DISMINUIR PRESIÓN POR DENSIDAD (SPATIAL HASH)
    if (event.code === 'KeyJ') {
      params.pressureEnabled.value = 1.0;
      params.pressureStrength.value = Math.min(8.0, Number((params.pressureStrength.value + PRESSURE_STEP).toFixed(2)));
      panel?.refresh();
    }
    if (event.code === 'KeyK') {
      params.pressureStrength.value = Math.max(0.0, Number((params.pressureStrength.value - PRESSURE_STEP).toFixed(2)));
      panel?.refresh();
    }

    // TECLAS U E I: AUMENTAR / DISMINUIR BOIDS FLOW FIELD
    if (event.code === 'KeyU') {
      params.boidsEnabled.value = 1.0;
      params.boidsStrength.value = Math.min(6.0, Number((params.boidsStrength.value + BOIDS_STEP).toFixed(2)));
      panel?.refresh();
    }
    if (event.code === 'KeyI') {
      params.boidsStrength.value = Math.max(0.0, Number((params.boidsStrength.value - BOIDS_STEP).toFixed(2)));
      panel?.refresh();
    }

    // FLECHAS
    if (event.code === 'ArrowLeft') {
      params.windEnabled.value = 1.0;
      params.wind.value.x = Math.max(-4.0, params.wind.value.x - WIND_STEP);
      setPalette('GREEN_FUCHSIA'); // Izquierda -> Verde/Fucsia
      panel?.refresh();
    }
    if (event.code === 'ArrowRight') {
      params.windEnabled.value = 1.0;
      params.wind.value.x = Math.min(4.0, params.wind.value.x + WIND_STEP);
      setPalette('YELLOW_BLUE'); // Derecha -> Azul/Amarillo
      panel?.refresh();
    }
    if (event.code === 'ArrowUp') {
      params.windEnabled.value = 1.0;
      params.wind.value.y = Math.min(4.0, params.wind.value.y + WIND_STEP);
      setPalette('YELLOW_BLUE'); // Arriba -> Azul/Amarillo
      panel?.refresh();
    }
    if (event.code === 'ArrowDown') {
      params.windEnabled.value = 1.0;
      params.wind.value.y = Math.max(-4.0, params.wind.value.y - WIND_STEP);
      setPalette('GREEN_FUCHSIA'); // Abajo -> Verde/Fucsia
      panel?.refresh();
    }
  });

  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  simulation.reset();

  const clock = new THREE.Clock();

  renderer.setAnimationLoop(() => {
    const delta = clock.getDelta();
    params.uTime.value += delta;

    if (params.shapeProgress.value < 1.0) {
      params.shapeProgress.value = Math.min(1.0, params.shapeProgress.value + delta / 1.5);
    }

    if (!paused) simulation.stepSimulation();
    orbit.update();
    renderer.render(scene, camera);
  });
}

main().catch((error) => {
  console.error(error);
  const pre = document.createElement('pre');
  pre.style.cssText = 'position:fixed;inset:16px;white-space:pre-wrap;color:#fff;z-index:50';
  pre.textContent = String(error?.stack || error);
  document.body.append(pre);
});