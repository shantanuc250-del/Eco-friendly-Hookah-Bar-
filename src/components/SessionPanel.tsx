import { motion } from 'framer-motion';
import { useSession } from '../context/SessionContext';
import { Activity } from 'lucide-react';

export default function SessionPanel() {
  const { selectedHookah, selectedFlavour, isSessionActive } = useSession();

  return (
    <motion.div
      className="inline-flex items-center gap-4 px-4 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      <div className="flex items-center gap-2">
        <Activity className="w-3.5 h-3.5 text-purple-400/60" />
        <span className="text-[10px] text-white/30 tracking-[0.2em] uppercase">Session</span>
      </div>

      <div className="h-4 w-[1px] bg-white/10" />

      <div className="flex items-center gap-3">
        <div>
          <span className="text-[9px] text-white/20 uppercase tracking-wider block">Hookah</span>
          <span className="text-xs text-white/70 font-medium">{selectedHookah.name}</span>
        </div>

        <div className="text-white/10">·</div>

        <div>
          <span className="text-[9px] text-white/20 uppercase tracking-wider block">Flavour</span>
          <span className="text-xs text-white/70 font-medium">{selectedFlavour.name}</span>
        </div>

        <div className="text-white/10">·</div>

        <div>
          <span className="text-[9px] text-white/20 uppercase tracking-wider block">Status</span>
          <span className={`text-xs font-medium ${isSessionActive ? 'text-emerald-400' : 'text-white/40'}`}>
            {isSessionActive ? 'ACTIVE' : 'IDLE'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
