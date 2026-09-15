import { motion } from 'framer-motion';
import { Share2 } from 'lucide-react';
import { useSession } from '../context/SessionContext';

export default function ShareButton() {
  const { selectedHookah, selectedFlavour, showToast } = useSession();

  const handleShare = async () => {
    const text = `My Hookah Bar virtual session:\n${selectedHookah.name} + ${selectedFlavour.name}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Hookah Bar Session',
          text,
        });
      } catch (e) {
        // User cancelled or share failed, try clipboard
        await copyToClipboard(text);
      }
    } else {
      await copyToClipboard(text);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      showToast('SESSION COPIED');
    } catch {
      showToast('UNABLE TO COPY');
    }
  };

  return (
    <motion.button
      onClick={handleShare}
      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/[0.06] bg-white/[0.02] text-white/40 hover:text-white/70 hover:border-white/[0.12] hover:bg-white/[0.05] transition-all duration-300 text-xs tracking-widest uppercase"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Share session"
    >
      <Share2 className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">Share</span>
    </motion.button>
  );
}
