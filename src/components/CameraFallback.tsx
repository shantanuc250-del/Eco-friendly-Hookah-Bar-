import React from 'react';
import { CameraOff, RefreshCw, XCircle } from 'lucide-react';

interface CameraFallbackProps {
  onRetry: () => void;
  onContinueWithoutCamera: () => void;
  errorMessage?: string;
}

export const CameraFallback: React.FC<CameraFallbackProps> = ({
  onRetry,
  onContinueWithoutCamera,
  errorMessage = 'Camera access is required for the interactive AR hand-tracking experience.',
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-6 bg-charcoal/90 backdrop-blur-xl border border-gold/20 rounded-2xl animate-fade-in">
      <div className="max-w-md w-full bg-black/60 border border-gold/30 rounded-2xl p-6 text-center shadow-2xl shadow-purple-900/20 space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-red-950/40 border border-red-500/40 flex items-center justify-center text-red-400">
          <CameraOff className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h3 className="font-serif text-2xl font-bold text-white tracking-wide">
            Camera Access Required
          </h3>
          <p className="text-sm text-gray-300 leading-relaxed">
            {errorMessage}
          </p>
          <div className="pt-2 px-3 py-2 bg-charcoal/80 rounded-lg border border-white/5 text-xs text-amber-300/90">
            🔒 Privacy Notice: All video processing occurs 100% locally in your browser. No camera video is recorded or sent to any server.
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={onRetry}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-semibold text-sm hover:from-amber-400 hover:to-yellow-500 transition-all shadow-lg shadow-gold/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            TRY AGAIN
          </button>
          <button
            onClick={onContinueWithoutCamera}
            className="flex-1 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-sm transition-all border border-white/10 flex items-center justify-center gap-2 cursor-pointer"
          >
            <XCircle className="w-4 h-4 text-gray-400" />
            3D LOUNGE VIEW
          </button>
        </div>
      </div>
    </div>
  );
};

export default CameraFallback;
