import { hookahs } from '../data/hookahs';
import HookahCard from './HookahCard';

export default function HookahSelector() {
  return (
    <div>
      {/* Section Header */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] text-amber-400/70 font-mono tracking-widest uppercase">01</span>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-amber-500/30 to-transparent" />
        </div>
        <h2 className="font-serif text-base font-bold text-white tracking-wide">
          Choose Your Hookah
        </h2>
        <p className="text-[11px] text-gray-400 mt-0.5">Select from our premium collection</p>
      </div>

      {/* Hookah Stacked List */}
      <div className="space-y-1.5 max-h-[46vh] lg:max-h-[52vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-amber-500/20">
        {hookahs.map((hookah, index) => (
          <HookahCard key={hookah.id} hookah={hookah} index={index} />
        ))}
      </div>
    </div>
  );
}
