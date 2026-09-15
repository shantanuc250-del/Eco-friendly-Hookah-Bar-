import { flavours } from '../data/flavours';
import FlavourButton from './FlavourButton';

export default function FlavourSelector() {
  return (
    <div className="mt-5 pt-4 border-t border-white/[0.08]">
      {/* Section Header */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] text-amber-400/70 font-mono tracking-widest uppercase">02</span>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-amber-500/30 to-transparent" />
        </div>
        <h2 className="font-serif text-base font-bold text-white tracking-wide">
          Choose Your Flavour
        </h2>
        <p className="text-[11px] text-gray-400 mt-0.5">Enhance your session experience</p>
      </div>

      {/* Flavour Grid */}
      <div className="flex flex-wrap gap-1.5">
        {flavours.map((flavour, index) => (
          <FlavourButton key={flavour.id} flavour={flavour} index={index} />
        ))}
      </div>
    </div>
  );
}
