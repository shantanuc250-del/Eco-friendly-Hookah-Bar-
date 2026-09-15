import { motion } from 'framer-motion';
import { RotateCcw, Radio } from 'lucide-react';
import { useSession } from '../context/SessionContext';

export default function Navbar() {
  const { resetSession, isSessionActive } = useSession();

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 h-[62px] border-b border-white/[0.08] bg-[#050507]/90 backdrop-blur-xl"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="relative h-full max-w-[1700px] mx-auto px-4 md:px-8 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 via-purple-600 to-amber-700 flex items-center justify-center text-white font-serif font-bold text-xs tracking-wider shadow-md shadow-amber-500/20">
            HB
          </div>
          <div>
            <h2 className="font-serif text-white text-sm font-bold tracking-wider leading-none">
              HOOKAH BAR
            </h2>
            <p className="text-[9px] text-amber-400/70 tracking-[0.25em] uppercase font-mono mt-0.5">
              VIRTUAL LOUNGE
            </p>
          </div>
        </div>

        {/* Center: Status Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.06]">
          <motion.div
            className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-[11px] text-gray-300 font-medium tracking-widest uppercase">
            ● LOUNGE OPEN
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {isSessionActive && (
            <motion.div
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Radio className="w-3 h-3 text-purple-400 animate-pulse" />
              <span className="text-[10px] text-purple-300 font-mono font-medium tracking-wider uppercase">
                SESSION ACTIVE
              </span>
            </motion.div>
          )}

          <motion.button
            onClick={resetSession}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 hover:border-gold/30 transition-all text-xs font-mono tracking-wider uppercase cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            aria-label="Reset session"
          >
            <RotateCcw className="w-3 h-3 text-amber-400" />
            <span>RESET</span>
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
}
