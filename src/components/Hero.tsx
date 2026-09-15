import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <motion.section
      className="relative pt-20 pb-3 px-4 md:px-8"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="max-w-[1700px] mx-auto">
        <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
          Choose Your{' '}
          <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-purple-400 bg-clip-text text-transparent">
            Hookah.
          </span>
        </h1>
        <p className="text-gray-400 text-xs md:text-sm mt-1.5 max-w-xl font-normal leading-relaxed">
          Build your virtual lounge experience. Choose your hookah, select a flavour and bring your session to life.
        </p>
      </div>
    </motion.section>
  );
}
