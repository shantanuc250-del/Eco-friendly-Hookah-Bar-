import { memo } from 'react';
import { motion } from 'framer-motion';
import type { HookahData } from '../data/hookahs';
import { useSession } from '../context/SessionContext';
import { Crown, Star, Sparkles } from 'lucide-react';

interface HookahCardProps {
  hookah: HookahData;
  index: number;
}

const categoryIcon = (category: string) => {
  const upper = category.toUpperCase();
  if (upper.includes('LUXURY')) return <Crown className="w-3 h-3" />;
  if (upper.includes('SIGNATURE')) return <Sparkles className="w-3 h-3" />;
  return <Star className="w-3 h-3" />;
};

const HookahCard = memo(function HookahCard({ hookah, index }: HookahCardProps) {
  const { selectedHookah, setSelectedHookah } = useSession();
  const isActive = selectedHookah.id === hookah.id;

  return (
    <motion.button
      onClick={() => setSelectedHookah(hookah)}
      className={`relative w-full text-left h-[54px] px-3 rounded-xl border transition-all duration-300 flex items-center justify-between group cursor-pointer overflow-hidden ${
        isActive
          ? 'border-amber-500/60 bg-gradient-to-r from-amber-500/15 via-purple-900/20 to-black/80 shadow-md shadow-amber-500/10'
          : 'border-white/[0.08] bg-[#0c0c14] hover:bg-white/[0.04] hover:border-white/20'
      }`}
      initial={{ opacity: 0, x: -15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      aria-label={`Select ${hookah.name} hookah`}
      aria-pressed={isActive}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Hookah Thumbnail */}
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform ${
            isActive ? 'scale-105' : 'group-hover:scale-105'
          }`}
          style={{
            background: `linear-gradient(135deg, ${hookah.accent}33, ${hookah.accent}10)`,
            border: `1px solid ${hookah.accent}${isActive ? '60' : '25'}`,
          }}
        >
          <svg width="18" height="22" viewBox="0 0 24 28" fill="none">
            <ellipse cx="12" cy="22" rx="8" ry="5" fill={hookah.accent} opacity="0.4" />
            <rect x="11" y="6" width="2" height="14" rx="1" fill={hookah.accent} opacity="0.7" />
            <circle cx="12" cy="5" r="3" fill={hookah.accent} opacity="0.5" />
            <path d="M14 14 Q18 14 18 18" stroke={hookah.accent} strokeWidth="1.5" fill="none" opacity="0.6" />
          </svg>
        </div>

        {/* Name & Category */}
        <div className="min-w-0">
          <h3 className="text-xs font-semibold text-white truncate tracking-wide leading-tight">
            {hookah.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className="inline-flex items-center gap-1 text-[9px] font-medium tracking-wider uppercase px-1.5 py-0.2 rounded"
              style={{
                color: hookah.accent,
                backgroundColor: `${hookah.accent}18`,
              }}
            >
              {categoryIcon(hookah.category)}
              {hookah.category}
            </span>
          </div>
        </div>
      </div>

      {/* Selected Indicator Dot */}
      {isActive && (
        <motion.div
          className="w-2 h-2 rounded-full bg-amber-400 shadow-lg shadow-amber-400/50 flex-shrink-0"
          animate={{ scale: [1, 1.25, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </motion.button>
  );
});

export default HookahCard;
