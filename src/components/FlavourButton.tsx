import { memo } from 'react';
import { motion } from 'framer-motion';
import type { FlavourData } from '../data/flavours';
import { useSession } from '../context/SessionContext';

interface FlavourButtonProps {
  flavour: FlavourData;
  index: number;
}

const FlavourButton = memo(function FlavourButton({ flavour, index }: FlavourButtonProps) {
  const { selectedFlavour, setSelectedFlavour } = useSession();
  const isActive = selectedFlavour.id === flavour.id;

  return (
    <motion.button
      onClick={() => setSelectedFlavour(flavour)}
      className={`relative px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 border whitespace-nowrap ${
        isActive
          ? 'text-white border-amber-500/40 shadow-lg'
          : 'text-white/50 border-white/[0.06] hover:text-white/70 hover:border-white/[0.12] bg-white/[0.02] hover:bg-white/[0.05]'
      }`}
      style={
        isActive
          ? {
              background: `linear-gradient(135deg, ${flavour.color}20, ${flavour.color}08)`,
              boxShadow: `0 4px 20px ${flavour.color}20`,
            }
          : {}
      }
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.03 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Select ${flavour.name} flavour`}
      aria-pressed={isActive}
    >
      {/* Active dot */}
      {isActive && (
        <motion.div
          className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
          style={{ backgroundColor: flavour.color }}
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}

      <span className="flex items-center gap-1.5">
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: flavour.color, opacity: isActive ? 1 : 0.5 }}
        />
        {flavour.name}
      </span>
    </motion.button>
  );
});

export default FlavourButton;
