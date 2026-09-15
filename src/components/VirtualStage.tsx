import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from '../context/SessionContext';
import HookahModel from './HookahModel';
import SmokeEffect from './SmokeEffect';
import StageEnvironment from './StageEnvironment';
import SmokeButton from './SmokeButton';
import SessionPanel from './SessionPanel';
import SessionTimer from './SessionTimer';
import ShareButton from './ShareButton';
import ARStage from './ARStage';
import { Crown, Star, Sparkles, Camera, Eye } from 'lucide-react';

function WebGLFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-black/40 rounded-2xl border border-white/10">
      <div className="text-center px-6">
        <p className="text-white/60 text-sm mb-2">WebGL is not available</p>
        <p className="text-white/30 text-xs">Please use a modern browser to experience the 3D hookah</p>
      </div>
    </div>
  );
}

function StageCanvas() {
  const { selectedHookah, selectedFlavour, isSmoking } = useSession();

  const smokePosition: [number, number, number] = useMemo(() => {
    const config = selectedHookah.modelConfig;
    const baseHeight =
      config.baseShape === 'tall'
        ? 2.8
        : config.baseShape === 'wide'
        ? 1.8
        : config.baseShape === 'angular'
        ? 2.2
        : config.baseShape === 'round'
        ? 2.2
        : 2.4;
    const stemBottom = baseHeight * 0.75;
    const stemTop = stemBottom + config.stemHeight;
    const modelCenterY = stemTop / 2;
    return [0, stemTop - modelCenterY + 0.7, 0];
  }, [selectedHookah]);

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [2.5, 1.5, 4], fov: 45, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
      fallback={<WebGLFallback />}
    >
      <StageEnvironment accentColor={selectedHookah.accentRGB} />

      <Suspense fallback={null}>
        <HookahModel hookah={selectedHookah} isSmoking={isSmoking} />
      </Suspense>

      <SmokeEffect
        isActive={isSmoking}
        smokeColor={selectedFlavour.colorRGB}
        position={smokePosition}
      />

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={3}
        maxDistance={8}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
        enableDamping
        dampingFactor={0.05}
        autoRotate={false}
      />
    </Canvas>
  );
}

const categoryIcon = (category: string) => {
  const upper = category.toUpperCase();
  if (upper.includes('LUXURY')) return <Crown className="w-3.5 h-3.5" />;
  if (upper.includes('SIGNATURE')) return <Sparkles className="w-3.5 h-3.5" />;
  return <Star className="w-3.5 h-3.5" />;
};

export default function VirtualStage() {
  const { selectedHookah, isCameraActive, startCamera, stopCamera } = useSession();

  return (
    <div className="relative flex flex-col h-full space-y-3">
      {/* 1. RIGHT STAGE HEADER (Selected Hookah Info Left | Mode Toggles Right) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-mono text-gray-400 tracking-[0.2em] uppercase">
            SELECTED HOOKAH
          </span>
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedHookah.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3 mt-0.5"
            >
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-white tracking-wide">
                {selectedHookah.name}
              </h2>
              <span
                className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-md"
                style={{
                  color: selectedHookah.accent,
                  backgroundColor: `${selectedHookah.accent}18`,
                  border: `1px solid ${selectedHookah.accent}30`,
                }}
              >
                {categoryIcon(selectedHookah.category)}
                {selectedHookah.category}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* View Controls Toggle Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={stopCamera}
            className={`py-2 px-3.5 rounded-xl border text-xs font-mono tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
              !isCameraActive
                ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-md shadow-amber-500/10'
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>3D LOUNGE VIEW</span>
          </button>

          <button
            onClick={startCamera}
            className={`py-2 px-3.5 rounded-xl border text-xs font-mono tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
              isCameraActive
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 border-amber-400 text-black font-bold shadow-lg shadow-amber-500/20'
                : 'bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/10 hover:border-gold/40'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>AR CAMERA VIEW</span>
          </button>

          <ShareButton />
        </div>
      </div>

      {/* 2. CAMERA STAGE CONTAINER (AR Camera Mode vs 3D Lounge Mode) */}
      <div className="relative flex-1 min-h-[420px] md:min-h-[540px] rounded-2xl overflow-hidden border border-white/15 bg-gradient-to-b from-black/80 to-[#07070c] shadow-2xl">
        {isCameraActive ? (
          <ARStage onExitCameraMode={stopCamera} />
        ) : (
          <>
            {/* Vignette overlay */}
            <div
              className="absolute inset-0 z-10 pointer-events-none rounded-2xl"
              style={{
                background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.7) 100%)',
              }}
            />

            {/* Purple ambient glow */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[350px] h-[220px] rounded-full blur-[110px] pointer-events-none z-[1]"
              style={{ backgroundColor: `${selectedHookah.accent}20` }}
            />

            {/* Canvas */}
            <div className="absolute inset-0">
              <StageCanvas />
            </div>

            {/* Launch Banner Callout Overlay */}
            <div className="absolute top-4 left-4 right-4 z-20 pointer-events-none flex justify-center">
              <div className="pointer-events-auto bg-black/80 border border-gold/40 backdrop-blur-md px-4 py-2 rounded-full shadow-2xl flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span className="text-xs text-gray-200">
                  Try the <strong className="text-amber-300 font-semibold">AR Hand-Tracking Camera Experience</strong>
                </span>
                <button
                  onClick={startCamera}
                  className="py-1 px-3 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold text-[11px] hover:from-amber-400 hover:to-yellow-400 transition-all cursor-pointer shadow-md"
                >
                  START AR
                </button>
              </div>
            </div>

            {/* Description overlay */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedHookah.id + '-desc'}
                className="absolute bottom-4 left-4 right-4 z-20"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-xs text-gray-400 italic">{selectedHookah.description}</p>
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </div>

      {/* 3. STAGE CONTROLS ROW */}
      <div className="flex items-center gap-4 flex-wrap pt-1">
        <SmokeButton />
        <SessionTimer />
        <div className="hidden lg:block ml-auto">
          <SessionPanel />
        </div>
      </div>

      {/* Mobile Session Panel */}
      <div className="lg:hidden">
        <SessionPanel />
      </div>
    </div>
  );
}
