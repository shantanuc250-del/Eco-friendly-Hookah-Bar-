import { motion } from 'framer-motion';
import { Timer } from 'lucide-react';
import { useSession } from '../context/SessionContext';

export default function SessionTimer() {
  const { sessionSeconds, isSessionActive } = useSession();

  const minutes = Math.floor(sessionSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (sessionSeconds % 60).toString().padStart(2, '0');

  // Progress (max 30 min = 1800 seconds)
  const progress = Math.min(sessionSeconds / 1800, 1);

  return (
    <motion.div
      className="flex items-center gap-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <div className="flex items-center gap-2">
        <Timer className="w-4 h-4 text-white/30" />
        <span className="text-[10px] text-white/30 tracking-[0.2em] uppercase">Session</span>
      </div>

      {/* Progress bar */}
      <div className="w-20 h-1 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: isSessionActive
              ? 'linear-gradient(90deg, #d4a574, #8e44ad)'
              : 'transparent',
          }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.3 }}
        />
        {isSessionActive && (
          <motion.div
            className="h-full rounded-full bg-white/20 -mt-1"
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ width: `${progress * 100}%` }}
          />
        )}
      </div>

      {/* Time display */}
      <span className="text-sm font-mono text-white/60 tabular-nums min-w-[3.5rem]">
        {minutes}:{seconds}
      </span>
    </motion.div>
  );
}
