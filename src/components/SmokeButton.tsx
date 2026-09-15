import { motion } from 'framer-motion';
import { Wind } from 'lucide-react';
import { useSession } from '../context/SessionContext';

export default function SmokeButton() {
  const { triggerSmoke, isSmoking } = useSession();

  return (
    <motion.button
      onClick={triggerSmoke}
      disabled={isSmoking}
      className={`relative flex items-center gap-3 px-8 py-3.5 rounded-xl font-semibold text-sm tracking-widest uppercase overflow-hidden transition-all duration-500 ${
        isSmoking
          ? 'border-purple-500/40 text-purple-300 cursor-not-allowed'
          : 'border-amber-500/30 text-white hover:border-amber-400/50'
      } border`}
      style={{
        background: isSmoking
          ? 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(139,92,246,0.05))'
          : 'linear-gradient(135deg, rgba(212,165,116,0.15), rgba(139,92,246,0.08))',
      }}
      whileHover={isSmoking ? {} : { scale: 1.05, boxShadow: '0 8px 30px rgba(212,165,116,0.2)' }}
      whileTap={isSmoking ? {} : { scale: 0.95 }}
      aria-label={isSmoking ? 'Smoking in progress' : 'Trigger smoke'}
    >
      {/* Animated glow behind */}
      {isSmoking && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-purple-400/20 to-purple-600/10"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
      )}

      <Wind className={`w-5 h-5 ${isSmoking ? 'animate-pulse' : ''}`} />
      <span className="relative z-10">{isSmoking ? 'Smoking...' : 'Smoke'}</span>
    </motion.button>
  );
}
