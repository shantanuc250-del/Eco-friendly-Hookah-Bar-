import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { HookahData } from '../data/hookahs';
import { hookahs } from '../data/hookahs';
import type { FlavourData } from '../data/flavours';
import { flavours } from '../data/flavours';

export type CameraStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'unsupported';
export type ARInteractionState = 
  | 'IDLE'
  | 'HAND_DETECTED'
  | 'NEAR_MOUTHPIECE'
  | 'GRABBED'
  | 'MOVING_TO_MOUTH'
  | 'SIP_READY'
  | 'SIP_TRIGGERED'
  | 'SMOKE_ANIMATION'
  | 'EXHALE'
  | 'RELEASED';

interface SessionState {
  selectedHookah: HookahData;
  selectedFlavour: FlavourData;
  isAgeVerified: boolean;
  isSmoking: boolean;
  isSessionActive: boolean;
  sessionSeconds: number;
  toastMessage: string | null;
  // AR & Camera state
  isCameraActive: boolean;
  cameraStatus: CameraStatus;
  showHandTracking: boolean;
  showTutorial: boolean;
  arState: ARInteractionState;
  sipCount: number;
}

interface SessionContextType extends SessionState {
  setSelectedHookah: (hookah: HookahData) => void;
  setSelectedFlavour: (flavour: FlavourData) => void;
  verifyAge: () => void;
  triggerSmoke: () => void;
  stopSmoke: () => void;
  resetSession: () => void;
  showToast: (message: string) => void;
  hideToast: () => void;
  // AR & Camera methods
  startCamera: () => void;
  stopCamera: () => void;
  setCameraStatus: (status: CameraStatus) => void;
  toggleHandTracking: () => void;
  setShowHandTracking: (show: boolean) => void;
  setArState: (state: ARInteractionState) => void;
  triggerSip: () => void;
  resetArPosition: () => void;
  closeTutorial: () => void;
}

const SessionContext = createContext<SessionContextType | null>(null);

export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used within SessionProvider');
  return context;
};

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [selectedHookah, setSelectedHookah] = useState<HookahData>(hookahs[0]);
  const [selectedFlavour, setSelectedFlavour] = useState<FlavourData>(flavours[0]);
  const [isAgeVerified, setIsAgeVerified] = useState<boolean>(() => {
    return localStorage.getItem('hookah-bar-age-verified') === 'true';
  });
  const [isSmoking, setIsSmoking] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // AR & Camera State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('idle');
  const [showHandTracking, setShowHandTrackingState] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [arState, setArState] = useState<ARInteractionState>('IDLE');
  const [sipCount, setSipCount] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const verifyAge = useCallback(() => {
    setIsAgeVerified(true);
    localStorage.setItem('hookah-bar-age-verified', 'true');
  }, []);

  const triggerSmoke = useCallback(() => {
    setIsSmoking(true);
    if (!isSessionActive) {
      setIsSessionActive(true);
    }
    setTimeout(() => setIsSmoking(false), 4000);
  }, [isSessionActive]);

  const stopSmoke = useCallback(() => {
    setIsSmoking(false);
  }, []);

  const resetSession = useCallback(() => {
    setIsSmoking(false);
    setIsSessionActive(false);
    setSessionSeconds(0);
    setSipCount(0);
    setArState('IDLE');
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 3000);
  }, []);

  const hideToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  // AR Actions
  const startCamera = useCallback(() => {
    setCameraStatus('requesting');
    setIsCameraActive(true);
  }, []);

  const stopCamera = useCallback(() => {
    setIsCameraActive(false);
    setCameraStatus('idle');
    setArState('IDLE');
  }, []);

  const toggleHandTracking = useCallback(() => {
    setShowHandTrackingState((prev) => !prev);
  }, []);

  const setShowHandTracking = useCallback((show: boolean) => {
    setShowHandTrackingState(show);
  }, []);

  const triggerSip = useCallback(() => {
    setArState('SIP_TRIGGERED');
    setIsSmoking(true);
    setSipCount((prev) => prev + 1);
    if (!isSessionActive) {
      setIsSessionActive(true);
    }
    
    // Inhale -> Smoke animation -> Exhale -> Idle loop
    setTimeout(() => {
      setArState('SMOKE_ANIMATION');
    }, 1200);

    setTimeout(() => {
      setArState('EXHALE');
    }, 2800);

    setTimeout(() => {
      setArState('IDLE');
      setIsSmoking(false);
    }, 4500);
  }, [isSessionActive]);

  const resetArPosition = useCallback(() => {
    setArState('IDLE');
    showToast('AR Position Reset');
  }, [showToast]);

  const closeTutorial = useCallback(() => {
    setShowTutorial(false);
  }, []);

  useEffect(() => {
    if (isSessionActive) {
      timerRef.current = setInterval(() => {
        setSessionSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isSessionActive]);

  return (
    <SessionContext.Provider
      value={{
        selectedHookah,
        selectedFlavour,
        isAgeVerified,
        isSmoking,
        isSessionActive,
        sessionSeconds,
        toastMessage,
        isCameraActive,
        cameraStatus,
        showHandTracking,
        showTutorial,
        arState,
        sipCount,
        setSelectedHookah,
        setSelectedFlavour,
        verifyAge,
        triggerSmoke,
        stopSmoke,
        resetSession,
        showToast,
        hideToast,
        startCamera,
        stopCamera,
        setCameraStatus,
        toggleHandTracking,
        setShowHandTracking,
        setArState,
        triggerSip,
        resetArPosition,
        closeTutorial,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};
