import React from 'react';
import { Sparkles, Hand, Eye, Flame, Check } from 'lucide-react';
import { useSession } from '../context/SessionContext';

export const ARTutorial: React.FC = () => {
  const { showTutorial, closeTutorial } = useSession();

  if (!showTutorial) return null;

  const steps = [
    {
      icon: Eye,
      title: '1. Allow Camera Access',
      desc: 'Look into your front camera. Processing runs 100% locally on your device.',
    },
    {
      icon: Hand,
      title: '2. Raise Your Hand',
      desc: 'Raise your hand into the camera view to enable real-time hand landmark tracking.',
    },
    {
      icon: Sparkles,
      title: '3. Pinch the Mouthpiece',
      desc: 'Pinch your thumb & index finger near the glowing mouthpiece to grab the hose.',
    },
    {
      icon: Flame,
      title: '4. Bring to Mouth & Sip',
      desc: 'Move the mouthpiece towards your mouth to trigger a virtual sip & smoke cloud!',
    },
  ];

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="max-w-lg w-full bg-gradient-to-b from-charcoal/95 to-black/95 border border-gold/40 rounded-2xl p-6 shadow-2xl shadow-purple-950/40 space-y-6">
        <div className="flex items-center justify-between border-b border-gold/20 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <h3 className="font-serif text-xl font-bold text-white tracking-wide">
              AR HAND-TRACKING GUIDE
            </h3>
          </div>
          <span className="text-xs uppercase tracking-widest text-gold/80 font-mono">
            VIRTUAL AR EXPERT
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-black/50 border border-white/10 hover:border-gold/30 transition-all flex flex-col gap-2"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-semibold text-white">{step.title}</h4>
                </div>
                <p className="text-xs text-gray-400 leading-snug">{step.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="pt-2 flex items-center justify-between gap-4">
          <p className="text-[11px] text-gray-400">
            You can toggle tracking debug points anytime using the top bar.
          </p>
          <button
            onClick={closeTutorial}
            className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-semibold text-xs hover:from-amber-400 hover:to-yellow-500 transition-all shadow-lg shadow-gold/20 flex items-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <Check className="w-4 h-4" />
            START EXPERIENCE
          </button>
        </div>
      </div>
    </div>
  );
};

export default ARTutorial;
