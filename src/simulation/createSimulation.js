import * as THREE from 'three/webgpu';
import {
  Fn,
  If,
  color,
  cos,
  exp,
  hash,
  instanceIndex,
  instancedArray,
  mix,
  mod,
  sin,
  step,
  uint,
  uv,
  vec3,
  vec4,
  float,
  mx_noise_vec3
} from 'three/tsl';

export function createSimulation({ renderer, scene, params, count = 131072 }) {
  // STATE -----------------------------------------------------------------
  const positionBuffer = instancedArray(count, 'vec3');
  const velocityBuffer = instancedArray(count, 'vec3');
  
  // Buffers de soporte para la interpolación de formas (Morphing)
  const startPosBuffer = instancedArray(count, 'vec3');
  const targetPosBuffer = instancedArray(count, 'vec3');
  const shape0Buffer = instancedArray(count, 'vec3'); // Esfera
  const shape1Buffer = instancedArray(count, 'vec3'); // Cubo
  const shape3Buffer = instancedArray(count, 'vec3'); // Reloj de Arena

  // 3D SPATIAL DENSITY GRID (16x16x16 = 4096 celdas)
  const GRID_RES = 16;
  const GRID_SIZE = GRID_RES * GRID_RES * GRID_RES;
  const densityBuffer = instancedArray(GRID_SIZE, 'float');

  const clearDensity = Fn(() => {
    densityBuffer.element(instanceIndex).assign(0.0);
  })().compute(GRID_SIZE).setName('Clear Density');

  const accumulateDensity = Fn(() => {
    const p = positionBuffer.element(instanceIndex);
    const halfBounds = params.boundsSize.mul(0.5);
    const cellSize = params.boundsSize.div(float(GRID_RES));

    const gx = p.x.add(halfBounds).div(cellSize).floor().clamp(0.0, float(GRID_RES - 1));
    const gy = p.y.add(halfBounds).div(cellSize).floor().clamp(0.0, float(GRID_RES - 1));
    const gz = p.z.add(halfBounds).div(cellSize).floor().clamp(0.0, float(GRID_RES - 1));

    const cellIdx = uint(gx.add(gy.mul(float(GRID_RES))).add(gz.mul(float(GRID_RES * GRID_RES))));
    densityBuffer.element(cellIdx).addAssign(1.0);
  })().compute(count).setName('Accumulate Density');

  // INITIALIZATION --------------------------------------------------------
  const initParticles = Fn(() => {
    const i = instanceIndex;
    const p = positionBuffer.element(i);
    const v = velocityBuffer.element(i);

    const s0 = shape0Buffer.element(i);
    const s1 = shape1Buffer.element(i);
    const s3 = shape3Buffer.element(i);

    const r1 = hash(i.add(uint(11)));
    const r2 = hash(i.add(uint(23)));
    const r3 = hash(i.add(uint(37)));
    const r4 = hash(i.add(uint(53)));
    const r5 = hash(i.add(uint(71)));

    // --- FORMA 0: Esfera 3D ---
    const maxRadius = params.boundsSize.mul(0.45);
    const radius = r1.pow(0.333).mul(maxRadius);
    const theta = r2.mul(Math.PI * 2.0); 
    const phi = r3.sub(0.5).mul(Math.PI); 

    const xSphere = cos(theta).mul(cos(phi)).mul(radius);
    const ySphere = sin(theta).mul(cos(phi)).mul(radius);
    const zSphere = sin(phi).mul(radius);
    s0.assign(vec3(xSphere, ySphere, zSphere));

    // --- FORMA 1: Cubo ---
    const cubeHalfSize = params.boundsSize.mul(0.15); 
    const xCube = r1.sub(0.5).mul(2.0).mul(cubeHalfSize);
    const yCube = r2.sub(0.5).mul(2.0).mul(cubeHalfSize);
    const zCube = r3.sub(0.5).mul(2.0).mul(cubeHalfSize);
    s1.assign(vec3(xCube, yCube, zCube));

    // --- FORMA 3: Reloj de Arena ---
    const tSand = r1.sub(0.5).mul(2.0); 
    const heightScale = params.boundsSize.mul(0.35);
    const yHourglass = tSand.mul(heightScale);

    const hourglassRadius = tSand.abs().mul(params.boundsSize.mul(0.28)).add(0.05);
    const spiralTurns = 10.0;
    const spiralAngle = r2.mul(Math.PI * 2.0).add(tSand.mul(Math.PI * spiralTurns));

    const xHourglass = cos(spiralAngle).mul(hourglassRadius);
    const zHourglass = sin(spiralAngle).mul(hourglassRadius);
    s3.assign(vec3(xHourglass, yHourglass, zHourglass));

    // Inicializar posición activa según la forma por defecto
    p.assign(s0);

    // Velocidades iniciales suaves
    const speed = params.initialSpeed.mul(r4.add(0.2));
    const tangentX = sin(theta).negate();
    const tangentY = cos(theta);
    v.assign(vec3(tangentX.mul(speed), tangentY.mul(speed), r5.sub(0.5).mul(speed)));
  })().compute(count).setName('Initialize Particles');

  // TRIGGER MORPH (Configura las posiciones de origen y destino para interpolar)
  const triggerMorph = Fn(() => {
    const i = instanceIndex;
    const p = positionBuffer.element(i);
    const startP = startPosBuffer.element(i);
    const targetP = targetPosBuffer.element(i);

    const s0 = shape0Buffer.element(i);
    const s1 = shape1Buffer.element(i);
    const s3 = shape3Buffer.element(i);

    // Guardar punto de inicio actual
    startP.assign(p);

    // Determinar destino objetivo
    If(params.targetShapeType.equal(3), () => {
      targetP.assign(s3);
    }).ElseIf(params.targetShapeType.equal(1), () => {
      targetP.assign(s1);
    }).Else(() => {
      targetP.assign(s0);
    });
  })().compute(count).setName('Trigger Morph');

  // UPDATE / COMPUTE SHADER ----------------------------------------------
  const updateParticles = Fn(() => {
    const p = positionBuffer.element(instanceIndex);
    const v = velocityBuffer.element(instanceIndex);
    const startP = startPosBuffer.element(instanceIndex);
    const targetP = targetPosBuffer.element(instanceIndex);

    const dt = params.dt.mul(params.timeScale);
    const force = vec3(0.0).toVar();

    // INTERPOLACIÓN / MORPHING ACTIVO
    If(params.shapeProgress.lessThan(1.0), () => {
      const interpolatedPos = mix(startP, targetP, params.shapeProgress);
      // Atracción suave hacia la posición interpolada para no romper la física
      const morphForce = interpolatedPos.sub(p).mul(12.0);
      force.addAssign(morphForce);
    });

    // 1) CONSTANT / WIND FORCE
    force.addAssign(params.wind.mul(params.windEnabled));

    // 2) RADIAL FORCE
    const toAttractor = params.attractor.sub(p);
    const distSq = toAttractor.lengthSq();
    const epsSq = params.softening.mul(params.softening);
    
    const distance = toAttractor.length().add(0.0001);
    const radialDirection = toAttractor.div(distance);

    const radialForce = radialDirection
      .mul(params.radialStrength)
      .div(distSq.add(epsSq))
      .mul(params.radialEnabled);
      
    force.addAssign(radialForce);

    // 3) VORTEX FORCE: 3D tangent force around Z axis
    const zAxis = vec3(0.0, 0.0, 1.0);
    const tangent = zAxis.cross(radialDirection);
    force.addAssign(tangent.mul(params.vortexStrength).mul(params.vortexEnabled));

    // 4) LINEAR DRAG: F = -c v
    force.addAssign(v.mul(params.dragCoefficient).mul(params.dragEnabled).mul(-1.0));

    // 5) LORENZ ATTRACTOR: Chaotic dynamical system
    const lorenzScale = float(5.0);
    const lx = p.x.mul(lorenzScale);
    const ly = p.y.mul(lorenzScale);
    const lz = p.z.mul(lorenzScale).add(25.0);

    const sigma = float(10.0);
    const rho = float(28.0);
    const beta = float(8.0 / 3.0);

    const lorenzDx = sigma.mul(ly.sub(lx));
    const lorenzDy = lx.mul(rho.sub(lz)).sub(ly);
    const lorenzDz = lx.mul(ly).sub(beta.mul(lz));

    const vLorenz = vec3(lorenzDx, lorenzDy, lorenzDz).mul(0.05);
    const lorenzForce = vLorenz.sub(v).mul(params.lorenzStrength).mul(params.lorenzEnabled);
    force.addAssign(lorenzForce);

    // 6) CURL NOISE FIELD: Divergence-free fluid turbulence
    const curlEps = float(0.08);
    const noiseFreq = float(0.45);
    const tOffset = vec3(params.uTime.mul(0.15), params.uTime.mul(0.12), params.uTime.mul(0.18));
    const np = p.mul(noiseFreq).add(tOffset);

    const cdx = vec3(curlEps, 0.0, 0.0);
    const cdy = vec3(0.0, curlEps, 0.0);
    const cdz = vec3(0.0, 0.0, curlEps);

    const a_x1 = mx_noise_vec3(np.add(cdx));
    const a_x0 = mx_noise_vec3(np.sub(cdx));
    const a_y1 = mx_noise_vec3(np.add(cdy));
    const a_y0 = mx_noise_vec3(np.sub(cdy));
    const a_z1 = mx_noise_vec3(np.add(cdz));
    const a_z0 = mx_noise_vec3(np.sub(cdz));

    const dAz_dy = a_y1.z.sub(a_y0.z);
    const dAy_dz = a_z1.y.sub(a_z0.y);
    const dAx_dz = a_z1.x.sub(a_z0.x);
    const dAz_dx = a_x1.z.sub(a_x0.z);
    const dAy_dx = a_x1.x.sub(a_x0.x);
    const dAx_dy = a_y1.y.sub(a_y0.y);

    const invTwoEps = float(1.0).div(curlEps.mul(2.0));
    const curlX = dAz_dy.sub(dAy_dz).mul(invTwoEps);
    const curlY = dAx_dz.sub(dAz_dx).mul(invTwoEps);
    const curlZ = dAy_dx.sub(dAx_dy).mul(invTwoEps);

    const curlVector = vec3(curlX, curlY, curlZ);
    const curlForce = curlVector.mul(params.curlStrength).mul(params.curlEnabled);
    force.addAssign(curlForce);

    // 7) PULSE WAVE / NEGATIVE GRAVITY SHOCKWAVE
    const toParticle = p.sub(params.pulseOrigin);
    const distPulse = toParticle.length();
    const pulseDir = toParticle.div(distPulse.add(0.0001));

    const maxPulseRadius = float(8.0);
    const waveRadius = mod(params.uTime.mul(params.pulseSpeed), maxPulseRadius);

    const deltaR = distPulse.sub(waveRadius);
    const wSq = params.pulseWidth.mul(params.pulseWidth);
    const exponent = deltaR.mul(deltaR).div(wSq).negate();
    const gaussian = exp(exponent);

    const attenuation = float(1.0).div(float(1.0).add(distPulse.mul(0.15)));
    const pulseForce = pulseDir.mul(gaussian).mul(params.pulseStrength).mul(params.pulseEnabled).mul(attenuation);
    force.addAssign(pulseForce);

    // 8) BOIDS FLOW FIELD: Craig Reynolds Alignment without O(N^2)
    const boidsT = params.uTime.mul(params.boidsSpeed);
    const boidsK = params.boidsFrequency;
    const flowX = sin(p.y.mul(boidsK).add(boidsT));
    const flowY = cos(p.z.mul(boidsK).add(boidsT));
    const flowZ = sin(p.x.mul(boidsK).add(boidsT));
    const vFlow = vec3(flowX, flowY, flowZ).mul(2.5);
    const boidsForce = vFlow.sub(v).mul(params.boidsStrength).mul(params.boidsEnabled);
    force.addAssign(boidsForce);

    // 9) SPATIAL HASH / DENSITY PRESSURE FORCE: F = -grad(rho)
    const halfBounds = params.boundsSize.mul(0.5);
    const cellSize = params.boundsSize.div(float(GRID_RES));

    const gx = p.x.add(halfBounds).div(cellSize).floor().clamp(1.0, float(GRID_RES - 2));
    const gy = p.y.add(halfBounds).div(cellSize).floor().clamp(1.0, float(GRID_RES - 2));
    const gz = p.z.add(halfBounds).div(cellSize).floor().clamp(1.0, float(GRID_RES - 2));

    const idxXP = uint(gx.add(1.0).add(gy.mul(float(GRID_RES))).add(gz.mul(float(GRID_RES * GRID_RES))));
    const idxXN = uint(gx.sub(1.0).add(gy.mul(float(GRID_RES))).add(gz.mul(float(GRID_RES * GRID_RES))));
    const idxYP = uint(gx.add(gy.add(1.0).mul(float(GRID_RES))).add(gz.mul(float(GRID_RES * GRID_RES))));
    const idxYN = uint(gx.add(gy.sub(1.0).mul(float(GRID_RES))).add(gz.mul(float(GRID_RES * GRID_RES))));
    const idxZP = uint(gx.add(gy.mul(float(GRID_RES))).add(gz.add(1.0).mul(float(GRID_RES * GRID_RES))));
    const idxZN = uint(gx.add(gy.mul(float(GRID_RES))).add(gz.sub(1.0).mul(float(GRID_RES * GRID_RES))));

    const rhoXP = densityBuffer.element(idxXP);
    const rhoXN = densityBuffer.element(idxXN);
    const rhoYP = densityBuffer.element(idxYP);
    const rhoYN = densityBuffer.element(idxYN);
    const rhoZP = densityBuffer.element(idxZP);
    const rhoZN = densityBuffer.element(idxZN);

    const gradRho = vec3(
      rhoXP.sub(rhoXN),
      rhoYP.sub(rhoYN),
      rhoZP.sub(rhoZN)
    ).mul(0.004);

    const pressureForce = gradRho.negate().mul(params.pressureStrength).mul(params.pressureEnabled);
    force.addAssign(pressureForce);

    // INTEGRATION ---------------------------------------------------------
    v.addAssign(force.mul(dt));

    const speed = v.length();
    If(speed.greaterThan(params.maxSpeed), () => {
      v.assign(v.normalize().mul(params.maxSpeed));
    });

    p.addAssign(v.mul(dt));

    // ANIMATED 3D ELLIPSOIDAL BOUNDARY ------------------------------------
    const t = params.uTime;

    const scaleX = sin(t.mul(0.7)).mul(0.35).add(1.0); 
    const scaleY = cos(t.mul(0.5)).mul(0.35).add(1.0); 
    const scaleZ = sin(t.mul(0.9).add(1.5)).mul(0.35).add(1.0); 

    const baseRadius = params.boundsSize.mul(0.40);

    const normalizedP = vec3(p.x.div(scaleX), p.y.div(scaleY), p.z.div(scaleZ));
    const ellipsoidalDist = normalizedP.length();

    If(ellipsoidalDist.greaterThan(baseRadius), () => {
      const dir = normalizedP.normalize();
      const reInjectedP = dir.negate().mul(baseRadius.mul(0.98));
      
      p.assign(vec3(
        reInjectedP.x.mul(scaleX),
        reInjectedP.y.mul(scaleY),
        reInjectedP.z.mul(scaleZ)
      ));
    });
  })().compute(count).setName('Update Particles');

  // RENDER ---------------------------------------------------------------
  const material = new THREE.SpriteNodeMaterial({
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true
  });

  material.positionNode = positionBuffer.toAttribute();
  material.scaleNode = params.particleSize;

  material.colorNode = Fn(() => {
    const speed = velocityBuffer.toAttribute().length();
    const t = speed.div(params.maxSpeed).clamp(0.0, 1.0);
    const slow = color('#46a6ff');
    const fast = color('#ffb35a');
    return vec4(mix(slow, fast, t), 1.0);
  })();

  material.opacityNode = step(uv().xy.sub(0.5).length(), 0.5);

  const geometry = new THREE.PlaneGeometry(1, 1);
  const mesh = new THREE.InstancedMesh(geometry, material, count);
  mesh.frustumCulled = false;
  scene.add(mesh);

  function reset() {
    renderer.compute(initParticles);
  }

  function startMorph(targetType) {
    params.prevShapeType.value = params.shapeType.value;
    params.targetShapeType.value = targetType;
    params.shapeType.value = targetType;
    params.shapeProgress.value = 0.0;
    renderer.compute(triggerMorph);
  }

  function stepSimulation() {
    renderer.compute(clearDensity);
    renderer.compute(accumulateDensity);
    renderer.compute(updateParticles);
  }

  function dispose() {
    geometry.dispose();
    material.dispose();
    scene.remove(mesh);
  }

  return {
    count,
    positionBuffer,
    velocityBuffer,
    reset,
    startMorph,
    stepSimulation,
    dispose
  };
}