import * as THREE from 'three/webgpu';
import {
  Fn,
  If,
  color,
  cos,
  hash,
  instanceIndex,
  instancedArray,
  mix,
  sin,
  step,
  uint,
  uv,
  vec3,
  vec4
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