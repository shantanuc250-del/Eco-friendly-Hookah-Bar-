import { useEffect, useRef, useState, useCallback } from 'react';
import { FilesetResolver, HandLandmarker, FaceLandmarker } from '@mediapipe/tasks-vision';

export interface TrackingData {
  handDetected: boolean;
  handLandmarks: Array<{ x: number; y: number; z: number }> | null;
  gripPointNorm: { x: number; y: number; z: number } | null;
  pinchDistance: number;
  isGrabbing: boolean;
  mouthPointNorm: { x: number; y: number } | null;
  confidence: number;
  videoWidth: number;
  videoHeight: number;
}

const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm';

export function useVisionTracking(videoRef: React.RefObject<HTMLVideoElement | null>, isActive: boolean) {
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const trackingDataRef = useRef<TrackingData>({
    handDetected: false,
    handLandmarks: null,
    gripPointNorm: null,
    pinchDistance: 1.0,
    isGrabbing: false,
    mouthPointNorm: null,
    confidence: 0,
    videoWidth: 1280,
    videoHeight: 720,
  });

  const grabStateRef = useRef<boolean>(false);
  const lastVideoTimeRef = useRef<number>(-1);

  // Initialize MediaPipe Landmarkers
  useEffect(() => {
    let isMounted = true;

    async function initVision() {
      try {
        setIsInitializing(true);
        setError(null);

        const vision = await FilesetResolver.forVisionTasks(WASM_URL);

        if (!isMounted) return;

        // Initialize Hand Landmarker
        const handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 1,
        });

        // Initialize Face Landmarker for Mouth Proximity
        let faceLandmarker: FaceLandmarker | null = null;
        try {
          faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
              delegate: 'GPU',
            },
            runningMode: 'VIDEO',
            numFaces: 1,
          });
        } catch {
          console.warn('FaceLandmarker GPU init fallback');
        }

        if (!isMounted) return;

        handLandmarkerRef.current = handLandmarker;
        faceLandmarkerRef.current = faceLandmarker;
        setIsInitializing(false);
      } catch (err) {
        console.error('MediaPipe initialization error:', err);
        if (isMounted) {
          setError('Failed to initialize vision tracking.');
          setIsInitializing(false);
        }
      }
    }

    if (isActive) {
      initVision();
    }

    return () => {
      isMounted = false;
      if (handLandmarkerRef.current) {
        handLandmarkerRef.current.close();
        handLandmarkerRef.current = null;
      }
      if (faceLandmarkerRef.current) {
        faceLandmarkerRef.current.close();
        faceLandmarkerRef.current = null;
      }
    };
  }, [isActive]);

  // Frame Processing Loop
  const processFrame = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || !isActive) {
      animFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    trackingDataRef.current.videoWidth = video.videoWidth || 1280;
    trackingDataRef.current.videoHeight = video.videoHeight || 720;

    const nowInMs = performance.now();
    if (video.currentTime !== lastVideoTimeRef.current) {
      lastVideoTimeRef.current = video.currentTime;

      // 1. Hand Tracking
      if (handLandmarkerRef.current) {
        try {
          const handResults = handLandmarkerRef.current.detectForVideo(video, nowInMs);

          if (handResults.landmarks && handResults.landmarks.length > 0) {
            const landmarks = handResults.landmarks[0];
            const thumbTip = landmarks[4];
            const indexTip = landmarks[8];

            // Normalize pinch distance (Thumb tip 4 to Index tip 8)
            const dx = indexTip.x - thumbTip.x;
            const dy = indexTip.y - thumbTip.y;
            const dz = (indexTip.z || 0) - (thumbTip.z || 0);
            const rawPinchDistance = Math.sqrt(dx * dx + dy * dy + dz * dz);

            // Pinch / Grab hysteresis logic (Part 3: 0.055 GRAB, 0.075 RELEASE)
            const grabThreshold = 0.055;
            const releaseThreshold = 0.075;

            if (!grabStateRef.current && rawPinchDistance < grabThreshold) {
              grabStateRef.current = true;
            } else if (grabStateRef.current && rawPinchDistance > releaseThreshold) {
              grabStateRef.current = false;
            }

            // Grip point: Midpoint between thumb tip & index tip in raw normalized coords
            const gripPointNorm = {
              x: (thumbTip.x + indexTip.x) / 2,
              y: (thumbTip.y + indexTip.y) / 2,
              z: ((thumbTip.z || 0) + (indexTip.z || 0)) / 2,
            };

            trackingDataRef.current.handDetected = true;
            trackingDataRef.current.handLandmarks = landmarks;
            trackingDataRef.current.gripPointNorm = gripPointNorm;
            trackingDataRef.current.pinchDistance = rawPinchDistance;
            trackingDataRef.current.isGrabbing = grabStateRef.current;
            trackingDataRef.current.confidence = handResults.handedness[0]?.[0]?.score || 0.9;
          } else {
            trackingDataRef.current.handDetected = false;
            trackingDataRef.current.isGrabbing = false;
          }
        } catch {
          // Ignore frame dropouts
        }
      }

      // 2. Mouth Proximity Tracking (Part 7: Upper lip 13 & Lower lip 14)
      if (faceLandmarkerRef.current) {
        try {
          const faceResults = faceLandmarkerRef.current.detectForVideo(video, nowInMs);
          if (faceResults.faceLandmarks && faceResults.faceLandmarks.length > 0) {
            const faceLandmarks = faceResults.faceLandmarks[0];
            const upperLip = faceLandmarks[13];
            const lowerLip = faceLandmarks[14];
            if (upperLip && lowerLip) {
              trackingDataRef.current.mouthPointNorm = {
                x: (upperLip.x + lowerLip.x) / 2,
                y: (upperLip.y + lowerLip.y) / 2,
              };
            }
          }
        } catch {
          // Ignore frame dropouts
        }
      }
    }

    animFrameRef.current = requestAnimationFrame(processFrame);
  }, [isActive, videoRef]);

  useEffect(() => {
    if (isActive) {
      animFrameRef.current = requestAnimationFrame(processFrame);
    } else if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isActive, processFrame]);

  return {
    isInitializing,
    error,
    trackingDataRef,
  };
}
