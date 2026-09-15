import * as THREE from 'three';

/**
 * Transforms normalized MediaPipe video coordinates (0..1) to Three.js 3D world space
 * taking into account:
 * - CSS object-fit: cover aspect ratio cropping
 * - Mirrored selfie camera (scaleX(-1))
 * - Camera FOV frustum projection
 */
export function videoToStageCoordinates(
  normX: number,
  normY: number,
  normZ: number = 0,
  videoWidth: number,
  videoHeight: number,
  containerWidth: number,
  containerHeight: number,
  depth: number = 3.2,
  fov: number = 45
): THREE.Vector3 {
  if (!videoWidth || !videoHeight || !containerWidth || !containerHeight) {
    return new THREE.Vector3(0, 0, 0);
  }

  // 1. Account for CSS object-fit: cover scaling
  const videoAspect = videoWidth / videoHeight;
  const containerAspect = containerWidth / containerHeight;

  let visibleNormX = normX;
  let visibleNormY = normY;

  if (containerAspect > videoAspect) {
    // Container is wider than video: top & bottom of video are cropped
    const visibleHeight = videoWidth / containerAspect;
    const cropY = (videoHeight - visibleHeight) / 2;
    visibleNormY = (normY * videoHeight - cropY) / visibleHeight;
  } else {
    // Container is taller than video: left & right of video are cropped
    const visibleWidth = videoHeight * containerAspect;
    const cropX = (videoWidth - visibleWidth) / 2;
    visibleNormX = (normX * videoWidth - cropX) / visibleWidth;
  }

  // 2. Correct for mirrored selfie camera (transform: scaleX(-1))
  const mirroredX = 1 - visibleNormX;

  // 3. Convert normalized [0, 1] to centered [-0.5, 0.5]
  const centeredX = mirroredX - 0.5;
  const centeredY = 0.5 - visibleNormY; // Screen Y=0 is top, Three.js Y+ is up

  // 4. Calculate Three.js AR frustum dimensions at depth
  const vFovRad = (fov * Math.PI) / 180;
  const frustumHeight = 2 * Math.tan(vFovRad / 2) * depth;
  const frustumWidth = frustumHeight * containerAspect;

  // 5. Compute 3D world position
  const worldX = centeredX * frustumWidth;
  const worldY = centeredY * frustumHeight;
  const worldZ = normZ ? -normZ * 1.5 : 0;

  return new THREE.Vector3(worldX, worldY, worldZ);
}
