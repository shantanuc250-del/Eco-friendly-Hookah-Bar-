import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { HookahData } from '../data/hookahs';

interface HookahModelProps {
  hookah: HookahData;
  isSmoking?: boolean;
  isARMode?: boolean;
}

function createBaseProfile(shape: string): THREE.Vector2[] {
  const points: THREE.Vector2[] = [];

  switch (shape) {
    case 'round':
      for (let i = 0; i <= 20; i++) {
        const t = i / 20;
        const y = t * 2.2;
        let r: number;
        if (t < 0.05) r = 0.1 + t * 8;
        else if (t < 0.4) r = 0.5 + Math.sin(t * Math.PI * 1.2) * 0.7;
        else if (t < 0.6) r = 1.1 - (t - 0.4) * 2.5;
        else if (t < 0.85) r = 0.6 - (t - 0.6) * 0.8;
        else r = 0.4 - (t - 0.85) * 1.5;
        points.push(new THREE.Vector2(Math.max(0.05, r), y));
      }
      break;
    case 'tall':
      for (let i = 0; i <= 20; i++) {
        const t = i / 20;
        const y = t * 2.8;
        let r: number;
        if (t < 0.05) r = 0.1 + t * 6;
        else if (t < 0.35) r = 0.4 + Math.sin(t * Math.PI * 1.5) * 0.5;
        else if (t < 0.55) r = 0.85 - (t - 0.35) * 2;
        else if (t < 0.9) r = 0.45 - (t - 0.55) * 0.3;
        else r = 0.35 - (t - 0.9) * 2;
        points.push(new THREE.Vector2(Math.max(0.05, r), y));
      }
      break;
    case 'wide':
      for (let i = 0; i <= 20; i++) {
        const t = i / 20;
        const y = t * 1.8;
        let r: number;
        if (t < 0.05) r = 0.1 + t * 10;
        else if (t < 0.45) r = 0.6 + Math.sin(t * Math.PI) * 0.9;
        else if (t < 0.6) r = 1.3 - (t - 0.45) * 4;
        else if (t < 0.85) r = 0.7 - (t - 0.6) * 1;
        else r = 0.45 - (t - 0.85) * 2;
        points.push(new THREE.Vector2(Math.max(0.05, r), y));
      }
      break;
    case 'angular':
      points.push(new THREE.Vector2(0.1, 0));
      points.push(new THREE.Vector2(0.6, 0.1));
      points.push(new THREE.Vector2(0.9, 0.5));
      points.push(new THREE.Vector2(1.0, 0.8));
      points.push(new THREE.Vector2(0.95, 1.2));
      points.push(new THREE.Vector2(0.7, 1.5));
      points.push(new THREE.Vector2(0.45, 1.7));
      points.push(new THREE.Vector2(0.35, 1.9));
      points.push(new THREE.Vector2(0.3, 2.0));
      points.push(new THREE.Vector2(0.15, 2.1));
      points.push(new THREE.Vector2(0.05, 2.2));
      break;
    default:
      for (let i = 0; i <= 20; i++) {
        const t = i / 20;
        const y = t * 2.4;
        let r: number;
        if (t < 0.05) r = 0.1 + t * 7;
        else if (t < 0.3) r = 0.45 + Math.sin(t * Math.PI * 1.3) * 0.6;
        else if (t < 0.5) r = 0.95 - (t - 0.3) * 2;
        else if (t < 0.8) r = 0.55 - (t - 0.5) * 0.5;
        else r = 0.4 - (t - 0.8) * 1.5;
        points.push(new THREE.Vector2(Math.max(0.05, r), y));
      }
      break;
  }
  return points;
}

function createBowlProfile(): THREE.Vector2[] {
  const points: THREE.Vector2[] = [];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    const y = t * 0.6;
    let r: number;
    if (t < 0.2) r = 0.3 + t * 1;
    else if (t < 0.7) r = 0.5 + Math.sin((t - 0.2) * Math.PI * 1.0) * 0.15;
    else r = 0.55 - (t - 0.7) * 0.8;
    points.push(new THREE.Vector2(Math.max(0.05, r), y));
  }
  return points;
}

export default function HookahModel({ hookah, isSmoking = false, isARMode = false }: HookahModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const coalRef = useRef<THREE.Mesh>(null);
  const config = hookah.modelConfig;

  const baseProfile = useMemo(() => createBaseProfile(config.baseShape), [config.baseShape]);
  const bowlProfile = useMemo(() => createBowlProfile(), []);

  const baseLathGeo = useMemo(() => new THREE.LatheGeometry(baseProfile, 32), [baseProfile]);
  const bowlGeo = useMemo(() => new THREE.LatheGeometry(bowlProfile, 24), [bowlProfile]);

  // Materials matching reference quality specs
  const glassMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: config.baseColor,
        transparent: true,
        opacity: config.glassOpacity,
        roughness: 0.05,
        metalness: 0.1,
        transmission: 0.7,
        thickness: 0.5,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
        side: THREE.DoubleSide,
      }),
    [config.baseColor, config.glassOpacity]
  );

  const metalMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: config.metalColor,
        roughness: 0.15,
        metalness: 0.95,
      }),
    [config.metalColor]
  );

  const stemMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: config.stemColor,
        roughness: 0.2,
        metalness: 0.9,
      }),
    [config.stemColor]
  );

  const bowlMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: config.bowlColor,
        roughness: 0.6,
        metalness: 0.2,
      }),
    [config.bowlColor]
  );

  const platformMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#08080a',
        roughness: 0.2,
        metalness: 0.8,
      }),
    []
  );

  const baseHeight = config.baseShape === 'tall' ? 2.8 : config.baseShape === 'wide' ? 1.8 : config.baseShape === 'angular' ? 2.2 : config.baseShape === 'round' ? 2.2 : 2.4;
  const stemBottom = baseHeight * 0.75;
  const stemTop = stemBottom + config.stemHeight;

  // Auto-normalize bounding box so ALL 10 hookahs fit inside exact safe height
  useEffect(() => {
    if (groupRef.current && isARMode) {
      const box = new THREE.Box3().setFromObject(groupRef.current);
      const size = new THREE.Vector3();
      box.getSize(size);
      if (size.y > 0) {
        const targetHeight = 1.7; // Target unit height in AR frustum
        const scaleFactor = targetHeight / size.y;
        groupRef.current.scale.set(scaleFactor, scaleFactor, scaleFactor);
      }
    }
  }, [hookah, isARMode]);

  useFrame((state) => {
    if (groupRef.current && !isARMode) {
      groupRef.current.rotation.y += 0.003;
    }
    if (coalRef.current) {
      const intensity = isSmoking ? 2.5 + Math.sin(state.clock.elapsedTime * 3) * 1 : 0.4 + Math.sin(state.clock.elapsedTime * 1.5) * 0.2;
      (coalRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = intensity;
    }
  });

  const scale = isARMode ? [0.38, 0.38, 0.38] : config.baseScale;
  const positionY = isARMode ? -0.7 : -stemTop / 2;

  return (
    <group ref={groupRef} scale={scale as any} position={[0, positionY, 0]}>
      {/* Black Marble Circular Table / Platform */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <cylinderGeometry args={[1.2, 1.25, 0.1, 32]} />
        <primitive object={platformMat} attach="material" />
      </mesh>
      
      {/* Platform Gold Rim */}
      <mesh position={[0, 0.005, 0]}>
        <ringGeometry args={[1.18, 1.22, 32]} />
        <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} side={THREE.DoubleSide} />
      </mesh>

      {/* Glass Base */}
      <mesh geometry={baseLathGeo} material={glassMat} castShadow receiveShadow />

      {/* Water inside base */}
      <mesh position={[0, baseHeight * 0.3, 0]}>
        <sphereGeometry args={[0.65, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial
          color={config.baseColor}
          transparent
          opacity={0.3}
          roughness={0.1}
          transmission={0.6}
        />
      </mesh>

      {/* Base Plate / Tray */}
      <mesh position={[0, stemBottom, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.6, 0.08, 32]} />
        <primitive object={metalMat} attach="material" />
      </mesh>

      {/* Stem */}
      <mesh position={[0, stemBottom + config.stemHeight / 2, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, config.stemHeight, 16]} />
        <primitive object={stemMat} attach="material" />
      </mesh>

      {/* Stem Decorative Rings */}
      {config.stemStyle === 'ornate' && (
        <>
          <mesh position={[0, stemBottom + config.stemHeight * 0.25, 0]}>
            <torusGeometry args={[0.1, 0.02, 8, 24]} />
            <primitive object={metalMat} attach="material" />
          </mesh>
          <mesh position={[0, stemBottom + config.stemHeight * 0.5, 0]}>
            <torusGeometry args={[0.12, 0.025, 8, 24]} />
            <primitive object={metalMat} attach="material" />
          </mesh>
          <mesh position={[0, stemBottom + config.stemHeight * 0.75, 0]}>
            <torusGeometry args={[0.1, 0.02, 8, 24]} />
            <primitive object={metalMat} attach="material" />
          </mesh>
        </>
      )}

      {/* Bowl */}
      <mesh position={[0, stemTop, 0]} geometry={bowlGeo} material={bowlMat} castShadow />

      {/* Glowing Coal on bowl */}
      <mesh ref={coalRef} position={[0, stemTop + 0.4, 0]} castShadow>
        <sphereGeometry args={[0.15, 12, 12]} />
        <meshStandardMaterial
          color="#ff4400"
          emissive="#ff4400"
          emissiveIntensity={0.6}
          roughness={0.8}
        />
      </mesh>

      {/* Hose Connector */}
      <mesh position={[0.15, stemBottom + config.stemHeight * 0.5, 0]} rotation={[0, 0, Math.PI / 6]} castShadow>
        <cylinderGeometry args={[0.04, 0.05, 0.15, 12]} />
        <primitive object={metalMat} attach="material" />
      </mesh>
    </group>
  );
}
