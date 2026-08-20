import * as THREE from 'three/webgpu';
import { uniform } from 'three/tsl';

// Uniforms are CPU-side values that TSL exposes to the GPU.
// Changing .value does not rebuild the compute shader.
export function createParameters() {
  return {
    uTime: uniform(0.0),
    shapeType: uniform(0), // 0: Óvalo/Esfera, 1: Cubo, 2: Multi-Esferas, 3: Reloj de Arena Curvo
    prevShapeType: uniform(0),
    targetShapeType: uniform(0),
    shapeProgress: uniform(1.0), // 1.0 = Morph finalizado / Estado estable
    dt: uniform(1 / 60),
    timeScale: uniform(1.0),
    initialSpeed: uniform(0.35),
    maxSpeed: uniform(5.0),
    boundsSize: uniform(10.0),
    particleSize: uniform(0.035),

    windEnabled: uniform(1.0), // Activado por defecto
    wind: uniform(new THREE.Vector3(0.0, 0.0, 0.0)),

    radialEnabled: uniform(1.0),
    attractor: uniform(new THREE.Vector3(0.0, 0.0, 0.0)),
    radialStrength: uniform(2.2),
    softening: uniform(0.35),

    vortexEnabled: uniform(1.0),
    vortexStrength: uniform(1.4),

    dragEnabled: uniform(1.0),
    dragCoefficient: uniform(0.12),

    lorenzEnabled: uniform(1.0),
    lorenzStrength: uniform(0.0),

    curlEnabled: uniform(1.0),
    curlStrength: uniform(0.0),

    pulseEnabled: uniform(1.0),
    pulseStrength: uniform(0.0),
    pulseOrigin: uniform(new THREE.Vector3(0.0, 0.0, 0.0)),
    pulseSpeed: uniform(3.5),
    pulseWidth: uniform(0.6),

    boidsEnabled: uniform(1.0),
    boidsStrength: uniform(0.0),
    boidsFrequency: uniform(0.75),
    boidsSpeed: uniform(1.2),

    pressureEnabled: uniform(1.0),
    pressureStrength: uniform(0.0)
  };
}