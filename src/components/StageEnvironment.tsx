import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface StageEnvironmentProps {
  accentColor: [number, number, number];
}

export default function StageEnvironment({ accentColor }: StageEnvironmentProps) {
  const dustRef = useRef<THREE.Points>(null);

  // Floor reflection
  const floorGeo = useMemo(() => new THREE.CircleGeometry(6, 64), []);

  // Floating dust particles
  const dustGeo = useMemo(() => {
    const count = 100;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = Math.random() * 6 - 1;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
      sizes[i] = Math.random() * 2 + 0.5;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    return geo;
  }, []);

  const dustMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new THREE.Vector3(0.8, 0.7, 0.5) },
        },
        vertexShader: `
        attribute float size;
        uniform float uTime;
        varying float vOpacity;
        void main() {
          vec3 pos = position;
          pos.y += sin(uTime * 0.5 + position.x * 2.0) * 0.1;
          pos.x += sin(uTime * 0.3 + position.z * 1.5) * 0.05;
          vOpacity = 0.3 + sin(uTime + position.y * 3.0) * 0.2;
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (100.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
        fragmentShader: `
        uniform vec3 uColor;
        varying float vOpacity;
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float alpha = smoothstep(0.5, 0.0, dist) * vOpacity * 0.4;
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  useFrame((state) => {
    if (dustMat.uniforms) {
      dustMat.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <>
      {/* Ambient lights */}
      <ambientLight intensity={0.4} color="#1a1a2e" />

      {/* Main key light */}
      <spotLight
        position={[3, 6, 2]}
        angle={0.4}
        penumbra={0.8}
        intensity={3}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Purple ambient fill */}
      <pointLight position={[-3, 3, -2]} intensity={1.5} color="#6c3483" distance={12} />

      {/* Gold rim light */}
      <pointLight position={[2, 2, -3]} intensity={1.2} color="#d4a574" distance={10} />

      {/* Accent light matching selected hookah */}
      <pointLight
        position={[0, 4, 0]}
        intensity={1}
        color={new THREE.Color(accentColor[0], accentColor[1], accentColor[2])}
        distance={8}
      />

      {/* Front fill light */}
      <pointLight position={[0, 2, 4]} intensity={1} color="#ffffff" distance={10} />

      {/* Bottom purple glow */}
      <pointLight position={[0, -1, 0]} intensity={0.3} color="#8e44ad" distance={6} />

      {/* Floor */}
      <mesh
        geometry={floorGeo}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -2.5, 0]}
        receiveShadow
      >
        <meshStandardMaterial
          color="#0a0a12"
          roughness={0.3}
          metalness={0.5}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Floor reflection ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.49, 0]}>
        <ringGeometry args={[1.5, 2.5, 64]} />
        <meshStandardMaterial
          color={new THREE.Color(accentColor[0] * 0.3, accentColor[1] * 0.3, accentColor[2] * 0.3)}
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.15}
          emissive={new THREE.Color(accentColor[0] * 0.1, accentColor[1] * 0.1, accentColor[2] * 0.1)}
          emissiveIntensity={2}
        />
      </mesh>

      {/* Floating dust */}
      <points ref={dustRef} geometry={dustGeo} material={dustMat} />
    </>
  );
}
