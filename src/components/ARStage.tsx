import React, { useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { useSession } from '../context/SessionContext';
import ARCameraFeed from './ARCameraFeed';
import type { FrameTrackingPayload } from './ARCameraFeed';
import HookahModel from './HookahModel';
import FlexibleHose from './FlexibleHose';
import ARSmokeEffect from './ARSmokeEffect';
import ExhaleSmokeEffect from './ExhaleSmokeEffect';
import AROverlayUI from './AROverlayUI';
import ARTutorial from './ARTutorial';
import CameraFallback from './CameraFallback';

interface ARStageProps {
  onExitCameraMode: () => void;
}

export const ARStage: React.FC<ARStageProps> = ({ onExitCameraMode }) => {
  const {
    selectedHookah,
    selectedFlavour,
    cameraStatus,
    startCamera,
    stopCamera,
    triggerSip,
    resetArPosition,
    arState,
    isSmoking,
  } = useSession();

  const [trackingData, setTrackingData] = useState<FrameTrackingPayload>({
    handWorldPos: null,
    mouthWorldPos: null,
    isGrabbing: false,
    handDetected: false,
  });

  const [showDebugAR, setShowDebugAR] = useState(false);

  const handleFrameTracking = useCallback((payload: FrameTrackingPayload) => {
    setTrackingData(payload);
  }, []);

  const handleCameraError = useCallback((_err: string) => {
    // SessionContext handles status updates
  }, []);

  if (cameraStatus === 'denied' || cameraStatus === 'unsupported') {
    return (
      <div className="relative w-full h-full min-h-[550px] rounded-2xl overflow-hidden">
        <CameraFallback
          onRetry={startCamera}
          onContinueWithoutCamera={onExitCameraMode}
        />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[550px] rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-black">
      {/* Live Mirrored Camera Stream + MediaPipe Tracking */}
      <ARCameraFeed onFrameTracking={handleFrameTracking} onError={handleCameraError}>
        {/* 3D WebGL Canvas Overlay */}
        <Canvas
          gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
          className="w-full h-full"
        >
          <PerspectiveCamera makeDefault position={[0, 0, 3.2]} fov={45} />
          
          {/* Lighting */}
          <ambientLight intensity={0.7} color="#1a1a2e" />
          <directionalLight position={[2, 4, 3]} intensity={1.8} color="#ffffff" />
          <spotLight position={[-3, 3, 2]} intensity={1.5} color={selectedHookah.accent} angle={0.6} />
          
          {/* PART 6: STATIONARY HOOKAH BODY GROUP ON LEFT SIDE (x = -1.25) */}
          <group position={[-1.25, -0.4, -0.2]}>
            <HookahModel hookah={selectedHookah} isARMode={true} isSmoking={isSmoking} />
            <ARSmokeEffect
              isSmoking={isSmoking}
              arState={arState}
              flavourColor={selectedFlavour.color}
              mouthPos={null}
            />
          </group>

          {/* DYNAMIC HOSE & MOUTHPIECE GROUP (Follows Hand World Position) */}
          <FlexibleHose
            handWorldPos={trackingData.handWorldPos}
            mouthWorldPos={trackingData.mouthWorldPos}
            isGrabbing={trackingData.isGrabbing}
            accentColor={selectedHookah.accent}
            isSmoking={isSmoking}
          />

          {/* PART 10 & 11: EXHALE SMOKE ORIGINATING STRICTLY AT USER'S MOUTH POSITION */}
          {trackingData.mouthWorldPos && (
            <ExhaleSmokeEffect
              mouthWorldPos={trackingData.mouthWorldPos}
              isActive={arState === 'EXHALE' || arState === 'SMOKE_ANIMATION'}
              flavourColor={selectedFlavour.color}
            />
          )}

          {/* PART 15: DEVELOPMENT DEBUG MODE SPHERES & CONNECTORS */}
          {showDebugAR && (
            <group>
              {/* Hand Grip Target Marker */}
              {trackingData.handWorldPos && (
                <mesh position={trackingData.handWorldPos}>
                  <sphereGeometry args={[0.06, 16, 16]} />
                  <meshBasicMaterial color={trackingData.isGrabbing ? '#ffd700' : '#00ffff'} wireframe />
                </mesh>
              )}

              {/* Mouth Target Marker */}
              {trackingData.mouthWorldPos && (
                <mesh position={trackingData.mouthWorldPos}>
                  <sphereGeometry args={[0.06, 16, 16]} />
                  <meshBasicMaterial color="#ff007f" wireframe />
                </mesh>
              )}
            </group>
          )}
        </Canvas>
      </ARCameraFeed>

      {/* Floating AR Controls & Status Glass Overlay */}
      <AROverlayUI
        onTriggerManualSip={triggerSip}
        onResetPosition={resetArPosition}
        onExitCamera={() => {
          stopCamera();
          onExitCameraMode();
        }}
        handDetected={trackingData.handDetected}
        isGrabbing={trackingData.isGrabbing}
        showDebugAR={showDebugAR}
        onToggleDebugAR={() => setShowDebugAR((prev) => !prev)}
      />

      {/* Guided Onboarding Tutorial Overlay */}
      <ARTutorial />
    </div>
  );
};

export default ARStage;
