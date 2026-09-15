import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SmokeEffectProps {
  isActive: boolean;
  smokeColor: [number, number, number];
  position: [number, number, number];
}

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  size: number;
  opacity: number;
  drift: number;
  turbulence: number;
  layer: 'wisp' | 'cloud' | 'particle';
}

const PARTICLE_COUNT = 300;

export default function SmokeEffect({ isActive, smokeColor, position }: SmokeEffectProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const particlesRef = useRef<Particle[]>([]);
  const spawnTimerRef = useRef(0);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const opacities = new Float32Array(PARTICLE_COUNT);
    const colors = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = -100;
      positions[i * 3 + 2] = 0;
      sizes[i] = 0;
      opacities[i] = 0;
      colors[i * 3] = 0.8;
      colors[i * 3 + 1] = 0.8;
      colors[i * 3 + 2] = 0.85;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    return geo;
  }, []);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
      },
      vertexShader: `
        attribute float size;
        attribute float opacity;
        attribute vec3 color;
        varying float vOpacity;
        varying vec3 vColor;
        void main() {
          vOpacity = opacity;
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (350.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying float vOpacity;
        varying vec3 vColor;
        void main() {
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          if (dist > 0.5) discard;
          float alpha = smoothstep(0.5, 0.05, dist) * vOpacity;
          // Soft smoke look
          alpha *= 1.0 - smoothstep(0.0, 0.5, dist);
          gl_FragColor = vec4(vColor, alpha * 0.85);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  useEffect(() => {
    particlesRef.current = [];
  }, []);

  const spawnParticle = (layer: 'wisp' | 'cloud' | 'particle'): Particle => {
    const spread = layer === 'cloud' ? 0.15 : layer === 'wisp' ? 0.08 : 0.05;
    const baseSpeed = layer === 'cloud' ? 0.012 : layer === 'wisp' ? 0.02 : 0.03;
    const baseSize = layer === 'cloud' ? 2.0 : layer === 'wisp' ? 1.0 : 0.5;

    return {
      position: new THREE.Vector3(
        position[0] + (Math.random() - 0.5) * spread,
        position[1],
        position[2] + (Math.random() - 0.5) * spread
      ),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.005,
        baseSpeed + Math.random() * 0.01,
        (Math.random() - 0.5) * 0.005
      ),
      life: 0,
      maxLife: 80 + Math.random() * 60,
      size: baseSize + Math.random() * 0.5,
      opacity: 0,
      drift: Math.random() * Math.PI * 2,
      turbulence: 0.3 + Math.random() * 0.7,
      layer,
    };
  };

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    const time = state.clock.elapsedTime;
    material.uniforms.uTime.value = time;

    // Spawn particles
    if (isActive) {
      spawnTimerRef.current += delta;
      if (spawnTimerRef.current > 0.02) {
        spawnTimerRef.current = 0;

        if (particlesRef.current.length < PARTICLE_COUNT) {
          // Spawn mixed layers
          const rand = Math.random();
          if (rand < 0.3) {
            particlesRef.current.push(spawnParticle('cloud'));
          } else if (rand < 0.7) {
            particlesRef.current.push(spawnParticle('wisp'));
          } else {
            particlesRef.current.push(spawnParticle('particle'));
          }
        }
      }
    }

    const positions = geometry.attributes.position.array as Float32Array;
    const sizes = geometry.attributes.size.array as Float32Array;
    const opacities = geometry.attributes.opacity.array as Float32Array;
    const colors = geometry.attributes.color.array as Float32Array;

    // Update particles
    const alive: Particle[] = [];

    for (let i = 0; i < particlesRef.current.length; i++) {
      const p = particlesRef.current[i];
      p.life += 1;

      if (p.life >= p.maxLife) continue;

      const lifeRatio = p.life / p.maxLife;

      // Movement with turbulence
      const turbX = Math.sin(time * 2 + p.drift) * p.turbulence * 0.003;
      const turbZ = Math.cos(time * 1.5 + p.drift * 1.3) * p.turbulence * 0.003;

      p.velocity.x += turbX;
      p.velocity.z += turbZ;

      // Slight wind drift
      p.velocity.x += Math.sin(time * 0.3) * 0.0001;

      // Slow down vertically as smoke rises
      p.velocity.y *= 0.998;

      p.position.add(p.velocity);

      // Opacity: fade in quickly, hold, then fade out
      if (lifeRatio < 0.1) {
        p.opacity = lifeRatio / 0.1;
      } else if (lifeRatio < 0.5) {
        p.opacity = 1;
      } else {
        p.opacity = 1 - (lifeRatio - 0.5) / 0.5;
      }

      // Size increases as smoke rises
      const currentSize = p.size * (1 + lifeRatio * 2);

      alive.push(p);

      const idx = alive.length - 1;
      if (idx < PARTICLE_COUNT) {
        positions[idx * 3] = p.position.x;
        positions[idx * 3 + 1] = p.position.y;
        positions[idx * 3 + 2] = p.position.z;
        sizes[idx] = currentSize;
        opacities[idx] = p.opacity * (p.layer === 'cloud' ? 0.3 : p.layer === 'wisp' ? 0.5 : 0.7);

        // Tint with flavour color
        const tintStrength = 0.15;
        colors[idx * 3] = 0.8 + smokeColor[0] * tintStrength;
        colors[idx * 3 + 1] = 0.8 + smokeColor[1] * tintStrength;
        colors[idx * 3 + 2] = 0.85 + smokeColor[2] * tintStrength;
      }
    }

    particlesRef.current = alive;

    // Clear unused slots
    for (let i = alive.length; i < PARTICLE_COUNT; i++) {
      positions[i * 3 + 1] = -100;
      sizes[i] = 0;
      opacities[i] = 0;
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.size.needsUpdate = true;
    geometry.attributes.opacity.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}
