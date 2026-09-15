import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X } from 'lucide-react';
import { useSession } from '../context/SessionContext';

export default function AgeGate() {
  const { isAgeVerified, verifyAge } = useSession();

  if (isAgeVerified) return null;

  return (
    <AnimatePresence>
      {!isAgeVerified && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" />

          {/* Ambient glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-900/20 blur-[120px]" />
            <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] rounded-full bg-amber-900/10 blur-[100px]" />
          </div>

          {/* Card */}
          <motion.div
            className="relative z-10 w-[90%] max-w-md mx-auto"
            initial={{ scale: 0.8, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 30 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-2xl shadow-2xl shadow-purple-900/30">
              {/* Top decorative line */}
              <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

              <div className="p-8 md:p-10 text-center">
                {/* Icon */}
                <motion.div
                  className="mx-auto mb-6 w-16 h-16 rounded-full bg-gradient-to-br from-purple-600/30 to-amber-600/20 border border-purple-500/30 flex items-center justify-center"
                  animate={{ boxShadow: ['0 0 20px rgba(139,92,246,0.2)', '0 0 40px rgba(139,92,246,0.4)', '0 0 20px rgba(139,92,246,0.2)'] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <ShieldCheck className="w-8 h-8 text-purple-400" />
                </motion.div>

                {/* Title */}
                <h1 className="font-heading text-3xl md:text-4xl font-bold text-white tracking-wide mb-1">
                  HOOKAH BAR
                </h1>
                <p className="text-amber-400/80 text-sm tracking-[0.3em] uppercase font-medium mb-8">
                  Virtual Lounge
                </p>

                {/* Divider */}
                <div className="w-16 h-[1px] mx-auto bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8" />

                {/* Message */}
                <p className="text-white/60 text-sm md:text-base leading-relaxed mb-10 max-w-xs mx-auto">
                  This interactive experience is intended for adults of legal age.
                </p>

                {/* Buttons */}
                <div className="flex flex-col gap-3">
                  <motion.button
                    onClick={verifyAge}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold text-sm tracking-widest uppercase border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 shadow-lg shadow-purple-900/40"
                    whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(139,92,246,0.4)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Enter Lounge
                  </motion.button>

                  <motion.button
                    onClick={() => window.close()}
                    className="w-full py-3 px-6 rounded-xl bg-white/5 text-white/50 font-medium text-sm tracking-widest uppercase border border-white/5 hover:bg-white/10 hover:text-white/70 transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <X className="w-4 h-4" />
                      Exit
                    </span>
                  </motion.button>
                </div>
              </div>

              {/* Bottom decorative line */}
              <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
