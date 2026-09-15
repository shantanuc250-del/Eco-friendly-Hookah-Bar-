export default function Footer() {
  return (
    <footer className="relative mt-12 border-t border-white/[0.04]">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-600/30 to-amber-600/20 flex items-center justify-center text-white font-heading font-bold text-[8px] tracking-wider border border-purple-500/20">
              HB
            </div>
            <div>
              <span className="font-heading text-sm text-white/60 font-bold tracking-wider">
                HOOKAH BAR
              </span>
              <span className="text-[10px] text-white/20 tracking-[0.2em] uppercase block">
                Virtual Lounge Experience
              </span>
            </div>
          </div>

          {/* Center text */}
          <p className="text-xs text-white/20 text-center">
            An interactive digital lounge experience.
          </p>

          {/* Right */}
          <p className="text-[10px] text-white/10">
            {new Date().getFullYear()} · Virtual Experience
          </p>
        </div>
      </div>
    </footer>
  );
}
