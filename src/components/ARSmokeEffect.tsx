import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ARSmokeEffectProps {
  isSmoking: boolean;
  arState: string;
  flavourColor: string;
  mouthPos: { x: number; y: number } | null;
}

export const ARSmokeEffect = ({
  isSmoking,
  arState,
  flavourColor,
  mouthPos,
}: ARSmokeEffectProps) => {
  const count = 120;
  const particlesRef = useRef<THREE.Points>(null);
  const exhaleParticlesRef = useRef<THREE.Points>(null);

  // Generate particle buffer data
  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 0.4;
      pos[i * 3 + 1] = 1.3 + Math.random() * 0.2; // Near Hookah Bowl
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.4;

      vel[i * 3] = (Math.random() - 0.5) * 0.01;
      vel[i * 3 + 1] = Math.random() * 0.02 + 0.015;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.01;
    }

    return {
      positions: pos,
      velocities: vel,
    };
  }, [count]);

  // Exhale particle cloud
  const exhaleCount = 150;
  const { exhalePositions, exhaleVelocities } = useMemo(() => {
    const pos = new Float32Array(exhaleCount * 3);
    const vel = new Float32Array(exhaleCount * 3);

    for (let i = 0; i < exhaleCount; i++) {
      pos[i * 3] = 0;
      pos[i * 3 + 1] = 0.2;
      pos[i * 3 + 2] = 1.2;

      vel[i * 3] = (Math.random() - 0.5) * 0.02;
      vel[i * 3 + 1] = Math.random() * 0.015 + 0.01;
      vel[i * 3 + 2] = Math.random() * 0.02 + 0.01;
    }

    return {
      exhalePositions: pos,
      exhaleVelocities: vel,
    };
  }, [exhaleCount]);

  const smokeTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
      gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.2)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
    }
    return new THREE.CanvasTexture(canvas);
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // 1. Hookah Bowl Smoke Animation
    if (particlesRef.current) {
      const posAttr = particlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const posArr = posAttr.array as Float32Array;

      for (let i = 0; i < count; i++) {
        if (isSmoking || arState === 'SIP_TRIGGERED' || arState === 'SMOKE_ANIMATION') {
          const turbulenceX = Math.sin(time * 1.5 + i) * 0.003;
          const turbulenceZ = Math.cos(time * 1.5 + i) * 0.003;

          posArr[i * 3] += velocities[i * 3] + turbulenceX;
          posArr[i * 3 + 1] += velocities[i * 3 + 1];
          posArr[i * 3 + 2] += velocities[i * 3 + 2] + turbulenceZ;

          // Reset particle loop
          if (posArr[i * 3 + 1] > 2.5) {
            posArr[i * 3] = (Math.random() - 0.5) * 0.3;
            posArr[i * 3 + 1] = 1.3;
            posArr[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
          }
        }
      }
      posAttr.needsUpdate = true;
    }

    // 2. Virtual Exhale Smoke Cloud
    if (exhaleParticlesRef.current) {
      const posAttr = exhaleParticlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const posArr = posAttr.array as Float32Array;
      const isExhaling = arState === 'EXHALE' || arState === 'SMOKE_ANIMATION';

      // Determine mouth position origin in 3D AR space
      const mouthX = mouthPos ? (mouthPos.x - 0.5) * 3.5 : 0;
      const mouthY = mouthPos ? (0.5 - mouthPos.y) * 2.5 : 0.2;

      for (let i = 0; i < exhaleCount; i++) {
        if (isExhaling) {
          const turbulenceX = Math.sin(time * 2 + i) * 0.004;
          const turbulenceY = Math.cos(time * 2 + i) * 0.004;

          posArr[i * 3] += exhaleVelocities[i * 3] + turbulenceX;
          posArr[i * 3 + 1] += exhaleVelocities[i * 3 + 1] + turbulenceY;
          posArr[i * 3 + 2] += exhaleVelocities[i * 3 + 2];

          if (posArr[i * 3 + 1] > mouthY + 1.2 || Math.abs(posArr[i * 3] - mouthX) > 1.5) {
            posArr[i * 3] = mouthX + (Math.random() - 0.5) * 0.2;
            posArr[i * 3 + 1] = mouthY;
            posArr[i * 3 + 2] = 1.2;
          }
        }
      }
      posAttr.needsUpdate = true;
    }
  });

  const parsedFlavourColor = useMemo(() => new THREE.Color(flavourColor), [flavourColor]);

  return (
    <group>
      {/* Bowl Smoke */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.25}
          color={parsedFlavourColor}
          transparent
          opacity={isSmoking || arState === 'SIP_TRIGGERED' ? 0.4 : 0.1}
          depthWrite={false}
          map={smokeTexture}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Exhale Cloud Particles */}
      <points ref={exhaleParticlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[exhalePositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.35}
          color={parsedFlavourColor.clone().lerp(new THREE.Color('#ffffff'), 0.5)}
          transparent
          opacity={arState === 'EXHALE' ? 0.5 : arState === 'SMOKE_ANIMATION' ? 0.3 : 0}
          depthWrite={false}
          map={smokeTexture}
          blending={THREE.NormalBlending}
        />
      </points>

      {/* Coal Glow Light */}
      <pointLight
        position={[0, 1.35, 0]}
        intensity={isSmoking || arState === 'SIP_TRIGGERED' ? 5.0 : 1.5}
        distance={2.0}
        color={isSmoking ? '#ff4500' : '#ff8c00'}
      />
    </group>
  );
};

export default ARSmokeEffect;
