import { Camera, Eye, Flame, RefreshCw, X, ShieldCheck, Hand, Bug } from 'lucide-react';
import { useSession } from '../context/SessionContext';

interface AROverlayUIProps {
  onTriggerManualSip: () => void;
  onResetPosition: () => void;
  onExitCamera: () => void;
  handDetected: boolean;
  isGrabbing: boolean;
  showDebugAR: boolean;
  onToggleDebugAR: () => void;
}

export const AROverlayUI: React.FC<AROverlayUIProps> = ({
  onTriggerManualSip,
  onResetPosition,
  onExitCamera,
  handDetected,
  isGrabbing,
  showDebugAR,
  onToggleDebugAR,
}) => {
  const {
    showHandTracking,
    toggleHandTracking,
    arState,
    sipCount,
    selectedHookah,
    selectedFlavour,
  } = useSession();

  // Dynamic Instruction Panel Text (Part 20)
  const getInstructionContent = () => {
    switch (arState) {
      case 'SIP_TRIGGERED':
      case 'SMOKE_ANIMATION':
        return { text: 'VIRTUAL SIP DETECTED!', highlight: 'text-amber-300' };
      case 'EXHALE':
        return { text: 'EXHALING VIRTUAL SMOKE CLOUD', highlight: 'text-purple-300' };
      default:
        if (isGrabbing) {
          return { text: 'Move mouthpiece towards your mouth', highlight: 'text-emerald-300' };
        }
        if (handDetected) {
          return { text: 'Pinch thumb & index finger to grab mouthpiece', highlight: 'text-cyan-300' };
        }
        return { text: 'Raise your hand into camera view', highlight: 'text-gray-300' };
    }
  };

  const instruction = getInstructionContent();

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-4 md:p-6">
      {/* 1. TOP BAR */}
      <div className="flex items-center justify-between pointer-events-auto">
        {/* Top-Left: Camera Active Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/75 border border-amber-500/40 backdrop-blur-md shadow-lg">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span className="text-xs font-mono font-medium text-amber-300 tracking-wider flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5" />
            CAMERA ACTIVE
          </span>
        </div>

        {/* Top-Right: Tracking Status, Debug AR & Exit */}
        <div className="flex items-center gap-2">
          {/* Debug AR Toggle (Part 15) */}
          <button
            onClick={onToggleDebugAR}
            className={`px-3 py-1.5 rounded-full text-xs font-mono border backdrop-blur-md transition-all flex items-center gap-1.5 cursor-pointer ${
              showDebugAR
                ? 'bg-purple-600/30 border-purple-400 text-purple-200 shadow-lg shadow-purple-500/20'
                : 'bg-black/60 border-white/15 text-gray-400 hover:text-white'
            }`}
          >
            <Bug className="w-3.5 h-3.5" />
            <span>DEBUG AR [{showDebugAR ? 'ON' : 'OFF'}]</span>
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/75 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-medium backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>◎ TRACKING: ON</span>
          </div>

          <button
            onClick={onExitCamera}
            className="p-2 rounded-full bg-black/75 border border-white/20 text-gray-300 hover:text-white hover:border-red-500/50 hover:bg-red-950/40 transition-all cursor-pointer"
            title="Exit Camera View"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. MIDDLE ROW: RIGHT FLOATING SESSION CARD */}
      <div className="flex justify-end my-auto pointer-events-auto">
        <div className="w-52 p-3.5 rounded-xl bg-black/75 border border-white/15 backdrop-blur-md shadow-2xl space-y-2 text-xs">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-mono text-[10px] tracking-widest text-amber-400/80 uppercase">
              YOUR SESSION
            </span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold">
              ACTIVE
            </span>
          </div>

          <div className="space-y-1 text-gray-300 text-[11px]">
            <div className="flex justify-between">
              <span className="text-gray-400">Hookah:</span>
              <strong className="text-white font-medium">{selectedHookah.name}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Flavour:</span>
              <strong className="text-amber-300 font-medium">{selectedFlavour.name}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Sips:</span>
              <strong className="text-cyan-400 font-bold">{sipCount}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM CONTROLS & INSTRUCTION CARDS */}
      <div className="space-y-3 pointer-events-auto">
        <div className="flex flex-wrap items-end justify-between gap-3">
          {/* Bottom-Left: Dynamic Instruction Panel (Part 20) */}
          <div className="max-w-xs p-3 rounded-xl bg-black/80 border border-white/15 backdrop-blur-md flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 flex-shrink-0">
              <Hand className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">AR Instruction</p>
              <p className={`text-xs font-medium ${instruction.highlight}`}>
                {instruction.text}
              </p>
            </div>
          </div>

          {/* Bottom-Right: Tracking Points Toggle */}
          <button
            onClick={toggleHandTracking}
            className={`px-3 py-2 rounded-xl text-xs font-medium border backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer ${
              showHandTracking
                ? 'bg-amber-500/20 border-gold/60 text-amber-300 shadow-lg shadow-gold/20'
                : 'bg-black/75 border-white/15 text-gray-400 hover:text-white'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Show Tracking Points [{showHandTracking ? 'ON' : 'OFF'}]</span>
          </button>
        </div>

        {/* Center Bottom Control Bar */}
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-black/85 border border-gold/30 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-2 text-[10px] text-gray-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Local Camera Processing</span>
          </div>

          {/* Central Circular Smoke Button */}
          <div className="flex items-center gap-4">
            <button
              onClick={onResetPosition}
              className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/15 hover:border-gold/40 text-gray-300 text-xs font-mono transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 inline mr-1" />
              RESET
            </button>

            <button
              onClick={onTriggerManualSip}
              className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 border-2 border-amber-300 hover:scale-105 transition-all shadow-xl shadow-amber-500/30 flex items-center justify-center cursor-pointer"
              title="Trigger Virtual Sip"
            >
              <Flame className="w-6 h-6 fill-black text-black" />
            </button>

            <button
              onClick={onExitCamera}
              className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/15 hover:border-red-500/40 text-gray-300 text-xs font-mono transition-all cursor-pointer"
            >
              EXIT
            </button>
          </div>

          <div className="text-[10px] font-mono text-amber-400/80">
            AR V2.0
          </div>
        </div>
      </div>
    </div>
  );
};

export default AROverlayUI;
