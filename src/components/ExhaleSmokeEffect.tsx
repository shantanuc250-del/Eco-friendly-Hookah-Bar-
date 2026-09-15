import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ExhaleSmokeEffectProps {
  mouthWorldPos: THREE.Vector3 | null;
  isActive: boolean;
  flavourColor: string;
}

export const ExhaleSmokeEffect = ({
  mouthWorldPos,
  isActive,
  flavourColor,
}: ExhaleSmokeEffectProps) => {
  const count = 180;
  const particlesRef = useRef<THREE.Points>(null);
  const particleTimesRef = useRef<Float32Array>(new Float32Array(count));

  // Particle Attributes
  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = 0;
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = 0;

      // Outward & upward velocities relative to user mouth orientation
      vel[i * 3] = (Math.random() - 0.5) * 0.015; // horizontal spread
      vel[i * 3 + 1] = Math.random() * 0.015 + 0.008; // upward drift
      vel[i * 3 + 2] = Math.random() * 0.025 + 0.015; // forward towards camera
    }

    return {
      positions: pos,
      velocities: vel,
    };
  }, [count]);

  const parsedColor = useMemo(() => {
    const col = new THREE.Color(flavourColor);
    col.lerp(new THREE.Color('#ffffff'), 0.4); // Blend with soft white atmospheric smoke
    return col;
  }, [flavourColor]);

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

  useFrame((state, delta) => {
    if (!particlesRef.current || !mouthWorldPos) return;

    const posAttr = particlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const posArr = posAttr.array as Float32Array;
    const time = state.clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      if (isActive) {
        particleTimesRef.current[i] += delta;
        const age = particleTimesRef.current[i];

        if (age > 2.2) {
          // Reset particle to mouth origin
          particleTimesRef.current[i] = Math.random() * 0.3;
          posArr[i * 3] = mouthWorldPos.x + (Math.random() - 0.5) * 0.05;
          posArr[i * 3 + 1] = mouthWorldPos.y + (Math.random() - 0.5) * 0.05;
          posArr[i * 3 + 2] = mouthWorldPos.z + 0.1;
        } else {
          // Move outward & expand with procedural turbulence
          const turbulenceX = Math.sin(time * 2 + i) * 0.005;
          const turbulenceY = Math.cos(time * 2 + i) * 0.005;

          posArr[i * 3] += velocities[i * 3] + turbulenceX;
          posArr[i * 3 + 1] += velocities[i * 3 + 1] + turbulenceY;
          posArr[i * 3 + 2] += velocities[i * 3 + 2];
        }
      } else {
        // Reset when inactive
        particleTimesRef.current[i] = 0;
        posArr[i * 3] = mouthWorldPos.x;
        posArr[i * 3 + 1] = mouthWorldPos.y;
        posArr[i * 3 + 2] = mouthWorldPos.z;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.4}
        color={parsedColor}
        transparent
        opacity={isActive ? 0.45 : 0}
        depthWrite={false}
        map={smokeTexture}
        blending={THREE.NormalBlending}
      />
    </points>
  );
};

export default ExhaleSmokeEffect;
