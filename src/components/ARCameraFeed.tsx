import React, { useEffect, useRef, useCallback } from 'react';
import { useSession } from '../context/SessionContext';
import { useVisionTracking } from '../hooks/useVisionTracking';
import { videoToStageCoordinates } from '../utils/arCoordinates';
import * as THREE from 'three';

export interface FrameTrackingPayload {
  handWorldPos: THREE.Vector3 | null;
  mouthWorldPos: THREE.Vector3 | null;
  isGrabbing: boolean;
  handDetected: boolean;
}

interface ARCameraFeedProps {
  onFrameTracking?: (payload: FrameTrackingPayload) => void;
  onError?: (err: string) => void;
  children?: React.ReactNode;
}

export const ARCameraFeed: React.FC<ARCameraFeedProps> = ({ onFrameTracking, onError, children }) => {
  const {
    isCameraActive,
    setCameraStatus,
    showHandTracking,
    setArState,
    triggerSip,
    arState,
  } = useSession();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { isInitializing, trackingDataRef } = useVisionTracking(videoRef, isCameraActive);

  // Proximity duration accumulator for Part 8 (300-500ms stable proximity required)
  const mouthProximityStartTimeRef = useRef<number | null>(null);

  // 1. Initialize Camera Stream via getUserMedia
  useEffect(() => {
    let isMounted = true;

    async function startWebcam() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (isMounted) {
          setCameraStatus('unsupported');
          onError?.('Webcam is not supported on this browser or device.');
        }
        return;
      }

      try {
        setCameraStatus('requesting');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setCameraStatus('granted');
      } catch (err: any) {
        console.error('Camera access error:', err);
        if (isMounted) {
          setCameraStatus('denied');
          onError?.(err?.message || 'Camera access was denied.');
        }
      }
    }

    if (isCameraActive) {
      startWebcam();
    }

    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [isCameraActive, setCameraStatus, onError]);

  // 2. High-Frequency Frame Loop for Coordinate Transformation & Sip Detection
  const renderFrameLoop = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
    }

    const containerWidth = canvas.clientWidth || window.innerWidth;
    const containerHeight = canvas.clientHeight || window.innerHeight;

    const trackingData = trackingDataRef.current;

    let handWorldPos: THREE.Vector3 | null = null;
    let mouthWorldPos: THREE.Vector3 | null = null;

    // Convert Hand Grip Point to 3D World Space (Parts 1, 3, 18)
    if (trackingData.handDetected && trackingData.gripPointNorm) {
      handWorldPos = videoToStageCoordinates(
        trackingData.gripPointNorm.x,
        trackingData.gripPointNorm.y,
        trackingData.gripPointNorm.z,
        trackingData.videoWidth,
        trackingData.videoHeight,
        containerWidth,
        containerHeight,
        3.2,
        45
      );
    }

    // Convert Mouth Center Point to 3D World Space (Parts 7, 10, 18)
    if (trackingData.mouthPointNorm) {
      mouthWorldPos = videoToStageCoordinates(
        trackingData.mouthPointNorm.x,
        trackingData.mouthPointNorm.y,
        0,
        trackingData.videoWidth,
        trackingData.videoHeight,
        containerWidth,
        containerHeight,
        3.2,
        45
      );
    }

    // Pass calculated payload to Three.js stage scene
    onFrameTracking?.({
      handWorldPos,
      mouthWorldPos,
      isGrabbing: trackingData.isGrabbing,
      handDetected: trackingData.handDetected,
    });

    // Part 8: Sip Detection Proximity Check (300-500ms required proximity while grabbed)
    if (trackingData.isGrabbing && handWorldPos && mouthWorldPos) {
      const distance = handWorldPos.distanceTo(mouthWorldPos);
      const now = performance.now();

      if (distance < 0.65) {
        if (mouthProximityStartTimeRef.current === null) {
          mouthProximityStartTimeRef.current = now;
        } else if (
          now - mouthProximityStartTimeRef.current > 400 &&
          arState !== 'SIP_TRIGGERED' &&
          arState !== 'SMOKE_ANIMATION' &&
          arState !== 'EXHALE'
        ) {
          triggerSip();
          mouthProximityStartTimeRef.current = null;
        }
      } else {
        mouthProximityStartTimeRef.current = null;
      }
    } else {
      mouthProximityStartTimeRef.current = null;
    }

    // Update AR State Machine status
    if (trackingData.handDetected && arState === 'IDLE') {
      setArState('HAND_DETECTED');
    }

    // 2D Debug Overlay Drawing (Part 15)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (showHandTracking && trackingData.handLandmarks) {
      const landmarks = trackingData.handLandmarks;
      const connections = [
        [0, 1], [1, 2], [2, 3], [3, 4],
        [0, 5], [5, 6], [6, 7], [7, 8],
        [5, 9], [9, 10], [10, 11], [11, 12],
        [9, 13], [13, 14], [14, 15], [15, 16],
        [13, 17], [17, 18], [18, 19], [19, 20],
        [0, 17]
      ];

      ctx.save();
      // Mirror drawing to align with mirrored camera CSS scaleX(-1)
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);

      ctx.strokeStyle = trackingData.isGrabbing ? 'rgba(255, 215, 0, 0.9)' : 'rgba(0, 255, 255, 0.6)';
      ctx.lineWidth = 3;

      connections.forEach(([i, j]) => {
        const pt1 = landmarks[i];
        const pt2 = landmarks[j];
        if (pt1 && pt2) {
          ctx.beginPath();
          ctx.moveTo(pt1.x * canvas.width, pt1.y * canvas.height);
          ctx.lineTo(pt2.x * canvas.width, pt2.y * canvas.height);
          ctx.stroke();
        }
      });

      // Draw Key Points
      landmarks.forEach((pt, idx) => {
        ctx.beginPath();
        ctx.arc(pt.x * canvas.width, pt.y * canvas.height, idx === 4 || idx === 8 ? 7 : 4, 0, Math.PI * 2);
        ctx.fillStyle = idx === 4 || idx === 8 ? '#ffd700' : '#00ffff';
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 10;
        ctx.fill();
      });

      // Draw Mouth Center Landmark
      if (trackingData.mouthPointNorm) {
        const mouthX = trackingData.mouthPointNorm.x * canvas.width;
        const mouthY = trackingData.mouthPointNorm.y * canvas.height;
        ctx.beginPath();
        ctx.arc(mouthX, mouthY, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#ff007f';
        ctx.shadowColor = '#ff007f';
        ctx.shadowBlur = 15;
        ctx.fill();
      }

      ctx.restore();
    }
  }, [showHandTracking, trackingDataRef, onFrameTracking, arState, triggerSip, setArState]);

  useEffect(() => {
    let animId: number;
    const loop = () => {
      renderFrameLoop();
      animId = requestAnimationFrame(loop);
    };
    if (isCameraActive) {
      animId = requestAnimationFrame(loop);
    }
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isCameraActive, renderFrameLoop]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-black flex items-center justify-center">
      {/* Mirrored Camera Video Feed */}
      <video
        ref={videoRef}
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1] filter brightness-95 contrast-105"
      />

      {/* Subtle Vignette Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-black/40" />

      {/* 2D Landmark Overlay Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* 3D WebGL Canvas Layer */}
      <div className="absolute inset-0 z-10">
        {children}
      </div>

      {isInitializing && (
        <div className="absolute bottom-6 left-6 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/80 border border-gold/30 text-xs text-amber-300 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>Initializing Hand & Face Vision Tracker...</span>
        </div>
      )}
    </div>
  );
};

export default ARCameraFeed;
