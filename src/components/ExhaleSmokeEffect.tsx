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
  const { positions, sizes, velocities, opacities } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    const vel = new Float32Array(count * 3);
    const op = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = 0;
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = 0;

      sz[i] = Math.random() * 0.15 + 0.05;
      op[i] = 0;

      // Outward & upward velocities relative to user mouth orientation
      vel[i * 3] = (Math.random() - 0.5) * 0.015; // horizontal spread
      vel[i * 3 + 1] = Math.random() * 0.015 + 0.008; // upward drift
      vel[i * 3 + 2] = Math.random() * 0.025 + 0.015; // forward towards camera
    }

    return {
      positions: pos,
      sizes: sz,
      velocities: vel,
      opacities: op,
    };
  }, [count]);

  const parsedColor = useMemo(() => {
    const col = new THREE.Color(flavourColor);
    col.lerp(new THREE.Color('#ffffff'), 0.4); // Blend with soft white atmospheric smoke
    return col;
  }, [flavourColor]);

  useFrame((_, delta) => {
    if (!particlesRef.current || !mouthWorldPos) return;

    const posAttr = particlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const posArr = posAttr.array as Float32Array;

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
          // Move outward & expand
          posArr[i * 3] += velocities[i * 3];
          posArr[i * 3 + 1] += velocities[i * 3 + 1];
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
        size={0.22}
        color={parsedColor}
        transparent
        opacity={isActive ? 0.75 : 0}
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
    </points>
  );
};

export default ExhaleSmokeEffect;
