import { useEffect, useRef, useState, useCallback } from 'react';
import { FilesetResolver, HandLandmarker, FaceLandmarker } from '@mediapipe/tasks-vision';
import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

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
  activeUserId: number | null;
}

const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm';

interface TrackedFace {
  id: number;
  center: { x: number; y: number };
  lastSeenTime: number;
  landmarks: NormalizedLandmark[];
}

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
    activeUserId: null,
  });

  const grabStateRef = useRef<boolean>(false);
  const lastVideoTimeRef = useRef<number>(-1);

  const nextFaceId = useRef<number>(1);
  const trackedFacesRef = useRef<TrackedFace[]>([]);
  const FACE_MATCH_THRESHOLD = 0.3; // Normalized distance
  const GRACE_PERIOD_MS = 1000;

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
          numHands: 4,
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
            numFaces: 4,
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

      // 1. Process Face Tracking
      const currentFaces: TrackedFace[] = [];
      if (faceLandmarkerRef.current) {
        try {
          const faceResults = faceLandmarkerRef.current.detectForVideo(video, nowInMs);
          if (faceResults.faceLandmarks && faceResults.faceLandmarks.length > 0) {
            faceResults.faceLandmarks.forEach((landmarks) => {
              // Use nose tip (landmark 1) as center
              const nose = landmarks[1];
              const center = { x: nose.x, y: nose.y };
              
              let bestMatch: TrackedFace | null = null;
              let minDistance = Infinity;
              
              for (const tf of trackedFacesRef.current) {
                const dx = tf.center.x - center.x;
                const dy = tf.center.y - center.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < minDistance && dist < FACE_MATCH_THRESHOLD) {
                  minDistance = dist;
                  bestMatch = tf;
                }
              }
              
              if (bestMatch) {
                bestMatch.center = center;
                bestMatch.lastSeenTime = nowInMs;
                bestMatch.landmarks = landmarks;
                currentFaces.push(bestMatch);
                // Remove to prevent double matching
                trackedFacesRef.current = trackedFacesRef.current.filter(tf => tf.id !== bestMatch!.id);
              } else {
                currentFaces.push({
                  id: nextFaceId.current++,
                  center,
                  lastSeenTime: nowInMs,
                  landmarks
                });
              }
            });
          }
        } catch {
          // Ignore
        }
      }

      // Restore unmatched faces in grace period
      for (const tf of trackedFacesRef.current) {
        if (nowInMs - tf.lastSeenTime <= GRACE_PERIOD_MS) {
          currentFaces.push(tf);
        }
      }
      trackedFacesRef.current = currentFaces;

      // 2. Process Hand Tracking
      const parsedHands: any[] = [];
      if (handLandmarkerRef.current) {
        try {
          const handResults = handLandmarkerRef.current.detectForVideo(video, nowInMs);
          if (handResults.landmarks && handResults.landmarks.length > 0) {
            handResults.landmarks.forEach((landmarks, i) => {
              const thumbTip = landmarks[4];
              const indexTip = landmarks[8];
              const wrist = landmarks[0];
              const dx = indexTip.x - thumbTip.x;
              const dy = indexTip.y - thumbTip.y;
              const dz = (indexTip.z || 0) - (thumbTip.z || 0);
              const rawPinchDistance = Math.sqrt(dx * dx + dy * dy + dz * dz);
              const gripPointNorm = {
                x: (thumbTip.x + indexTip.x) / 2,
                y: (thumbTip.y + indexTip.y) / 2,
                z: ((thumbTip.z || 0) + (indexTip.z || 0)) / 2,
              };
              const confidence = handResults.handedness[i]?.[0]?.score || 0.9;
              parsedHands.push({ landmarks, wrist, rawPinchDistance, gripPointNorm, confidence });
            });
          }
        } catch {
          // Ignore
        }
      }

      // 3. Determine grab state and active user
      const grabThreshold = 0.055;
      const releaseThreshold = 0.075;
      let currentActiveUserId = trackingDataRef.current.activeUserId;
      let isGrabbing = false;
      let bestHand = null;

      if (currentActiveUserId !== null) {
        const activeFace = currentFaces.find(f => f.id === currentActiveUserId);
        if (activeFace) {
          let minHandDist = Infinity;
          let matchedHand = null;
          for (const h of parsedHands) {
            const dx = h.wrist.x - activeFace.center.x;
            const dy = h.wrist.y - activeFace.center.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < minHandDist) {
              minHandDist = dist;
              matchedHand = h;
            }
          }

          if (matchedHand) {
            if (!grabStateRef.current && matchedHand.rawPinchDistance < grabThreshold) {
              grabStateRef.current = true;
            } else if (grabStateRef.current && matchedHand.rawPinchDistance > releaseThreshold) {
              grabStateRef.current = false;
            }
            if (grabStateRef.current) {
              isGrabbing = true;
              bestHand = matchedHand;
            } else {
              currentActiveUserId = null;
            }
          } else {
            if (grabStateRef.current) {
              grabStateRef.current = false;
            }
            currentActiveUserId = null;
          }
        } else {
          grabStateRef.current = false;
          currentActiveUserId = null;
        }
      }

      if (currentActiveUserId === null) {
        for (const h of parsedHands) {
          if (h.rawPinchDistance < grabThreshold) {
            let minFaceDist = Infinity;
            let closestFace = null;
            for (const f of currentFaces) {
              const dx = h.wrist.x - f.center.x;
              const dy = h.wrist.y - f.center.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              // Face-hand distance heuristic
              if (dist < minFaceDist && dist < 0.6) {
                minFaceDist = dist;
                closestFace = f;
              }
            }
            if (closestFace) {
              currentActiveUserId = closestFace.id;
              grabStateRef.current = true;
              isGrabbing = true;
              bestHand = h;
              break;
            }
          }
        }
      }

      // 4. Update tracking data
      if (bestHand) {
        trackingDataRef.current.handDetected = true;
        trackingDataRef.current.handLandmarks = bestHand.landmarks;
        trackingDataRef.current.gripPointNorm = bestHand.gripPointNorm;
        trackingDataRef.current.pinchDistance = bestHand.rawPinchDistance;
        trackingDataRef.current.isGrabbing = isGrabbing;
        trackingDataRef.current.confidence = bestHand.confidence;
      } else if (parsedHands.length > 0) {
        const h = parsedHands[0];
        trackingDataRef.current.handDetected = true;
        trackingDataRef.current.handLandmarks = h.landmarks;
        trackingDataRef.current.gripPointNorm = h.gripPointNorm;
        trackingDataRef.current.pinchDistance = h.rawPinchDistance;
        trackingDataRef.current.isGrabbing = false;
        trackingDataRef.current.confidence = h.confidence;
      } else {
        trackingDataRef.current.handDetected = false;
        trackingDataRef.current.isGrabbing = false;
      }

      trackingDataRef.current.activeUserId = currentActiveUserId;

      // 5. Update mouth point only for active user (if exists) or null to prevent false sips
      let activeMouthNorm = null;
      if (currentActiveUserId !== null) {
        const activeFace = currentFaces.find(f => f.id === currentActiveUserId);
        if (activeFace) {
          const upperLip = activeFace.landmarks[13];
          const lowerLip = activeFace.landmarks[14];
          if (upperLip && lowerLip) {
            activeMouthNorm = {
              x: (upperLip.x + lowerLip.x) / 2,
              y: (upperLip.y + lowerLip.y) / 2,
            };
          }
        }
      }
      trackingDataRef.current.mouthPointNorm = activeMouthNorm;
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
