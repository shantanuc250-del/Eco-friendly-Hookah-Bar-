import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FlexibleHoseProps {
  handWorldPos: THREE.Vector3 | null;
  mouthWorldPos: THREE.Vector3 | null;
  isGrabbing: boolean;
  accentColor: string;
  isSmoking: boolean;
}

export const FlexibleHose = ({
  handWorldPos,
  mouthWorldPos,
  isGrabbing,
  accentColor,
  isSmoking,
}: FlexibleHoseProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const mouthpieceRef = useRef<THREE.Group>(null);

  // Fixed Hookah Hose Base position (on left side at x = -1.1, y = 0.5)
  const fixedHoseBasePos = useMemo(() => new THREE.Vector3(-1.1, 0.5, -0.2), []);

  // Default rest position for mouthpiece when not grabbed
  const defaultRestPos = useMemo(() => new THREE.Vector3(-0.5, -0.2, 0.5), []);

  const currentMouthpiecePos = useRef<THREE.Vector3>(new THREE.Vector3(-0.5, -0.2, 0.5));
  const currentRotation = useRef<THREE.Quaternion>(new THREE.Quaternion());

  useFrame((_, delta) => {
    // 1. Calculate Target Mouthpiece Position (Part 2 & 4)
    let targetPos = defaultRestPos;

    if (isGrabbing && handWorldPos) {
      // Offset slightly to align mouthpiece naturally with pinch grip
      targetPos = new THREE.Vector3(
        handWorldPos.x,
        handWorldPos.y - 0.05,
        handWorldPos.z + 0.1
      );
    }

    // Clamp position within safe stage boundaries (Part 19)
    targetPos.x = THREE.MathUtils.clamp(targetPos.x, -2.2, 2.2);
    targetPos.y = THREE.MathUtils.clamp(targetPos.y, -1.5, 1.5);
    targetPos.z = THREE.MathUtils.clamp(targetPos.z, -0.5, 2.0);

    // Smooth lerp mouthpiece towards target
    const lerpSpeed = isGrabbing ? 14 : 6;
    currentMouthpiecePos.current.lerp(targetPos, Math.min(delta * lerpSpeed, 1.0));

    // Update Mouthpiece Group transform (Part 14: Quaternion Slerp)
    if (mouthpieceRef.current) {
      mouthpieceRef.current.position.copy(currentMouthpiecePos.current);

      const dummy = new THREE.Object3D();
      dummy.position.copy(currentMouthpiecePos.current);

      if (mouthWorldPos && isGrabbing) {
        dummy.lookAt(mouthWorldPos);
      } else {
        dummy.lookAt(0, 0, 1);
      }

      currentRotation.current.slerp(dummy.quaternion, Math.min(delta * 10, 1.0));
      mouthpieceRef.current.quaternion.copy(currentRotation.current);
    }

    // 2. Reconstruct dynamic Catmull-Rom hose curve (Part 5)
    const p0 = fixedHoseBasePos.clone();
    const p3 = currentMouthpiecePos.current.clone();

    // Natural sagging control points
    const p1 = new THREE.Vector3(
      p0.x * 0.7 + p3.x * 0.3,
      Math.min(p0.y, p3.y) - 0.6,
      (p0.z + p3.z) * 0.5 + 0.2
    );

    const p2 = new THREE.Vector3(
      p0.x * 0.3 + p3.x * 0.7,
      Math.min(p0.y, p3.y) - 0.4,
      p3.z + 0.1
    );

    const curve = new THREE.CatmullRomCurve3([p0, p1, p2, p3]);
    const geometry = new THREE.TubeGeometry(curve, 36, 0.035, 8, false);

    if (meshRef.current) {
      meshRef.current.geometry.dispose();
      meshRef.current.geometry = geometry;
    }
  });

  return (
    <group>
      {/* Dynamic Bending Hose Mesh */}
      <mesh ref={meshRef}>
        <meshStandardMaterial
          color="#151520"
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>

      {/* Mouthpiece Assembly */}
      <group ref={mouthpieceRef}>
        {/* Handle */}
        <mesh position={[0, 0, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.02, 0.25, 16]} />
          <meshStandardMaterial
            color={accentColor}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* Tip */}
        <mesh position={[0, 0, 0.23]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.015, 0.022, 0.08, 16]} />
          <meshStandardMaterial
            color="#ffffff"
            metalness={0.2}
            roughness={0.1}
            transparent
            opacity={0.9}
          />
        </mesh>

        {/* Glowing Indicator Ring */}
        <mesh position={[0, 0, 0.27]}>
          <ringGeometry args={[0.02, 0.04, 32]} />
          <meshBasicMaterial
            color={isSmoking ? '#ffd700' : isGrabbing ? '#00ffff' : accentColor}
            transparent
            opacity={isSmoking ? 0.9 : isGrabbing ? 0.8 : 0.4}
            side={THREE.DoubleSide}
          />
        </mesh>

        {(isGrabbing || isSmoking) && (
          <pointLight
            position={[0, 0, 0.28]}
            intensity={isSmoking ? 3.0 : 1.5}
            distance={0.8}
            color={isSmoking ? '#ffaa00' : '#00ffff'}
          />
        )}
      </group>
    </group>
  );
};

export default FlexibleHose;
