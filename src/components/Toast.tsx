import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useSession } from '../context/SessionContext';

export default function Toast() {
  const { toastMessage } = useSession();

  return (
    <AnimatePresence>
      {toastMessage && (
        <motion.div
          className="fixed bottom-6 left-1/2 z-[90] -translate-x-1/2"
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-2.5 px-5 py-3 rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-purple-500/10 backdrop-blur-xl shadow-2xl shadow-black/40">
            <CheckCircle className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-white/80 tracking-widest uppercase font-medium">
              {toastMessage}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
