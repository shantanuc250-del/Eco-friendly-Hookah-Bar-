import { motion } from 'framer-motion';
import { SessionProvider } from './context/SessionContext';
import AgeGate from './components/AgeGate';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import HookahSelector from './components/HookahSelector';
import FlavourSelector from './components/FlavourSelector';
import VirtualStage from './components/VirtualStage';
import Toast from './components/Toast';
import Footer from './components/Footer';

export default function App() {
  return (
    <SessionProvider>
      {/* Age Gate Overlay */}
      <AgeGate />

      {/* Toast Notifications */}
      <Toast />

      {/* Main App Container */}
      <div className="min-h-screen bg-[#050507] text-white overflow-x-hidden">
        {/* Ambient Lounge Lights */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-1/3 w-[700px] h-[350px] rounded-full bg-purple-900/[0.07] blur-[160px]" />
          <div className="absolute bottom-0 right-10 w-[550px] h-[300px] rounded-full bg-amber-900/[0.05] blur-[140px]" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <Navbar />

          <Hero />

          {/* Main 2-Column Layout matching specification */}
          <motion.main
            className="max-w-[1700px] mx-auto px-4 md:px-8 pt-2 pb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left Column (24% Width on Desktop | Order 2 on Mobile) */}
              <div className="w-full lg:w-[320px] xl:w-[360px] flex-shrink-0 order-2 lg:order-1">
                <div className="lg:sticky lg:top-[74px]">
                  <HookahSelector />
                  <FlavourSelector />
                </div>
              </div>

              {/* Right Column (76% Width on Desktop | Order 1 on Mobile) */}
              <div className="flex-1 min-w-0 order-1 lg:order-2">
                <VirtualStage />
              </div>
            </div>
          </motion.main>

          <Footer />
        </div>
      </div>
    </SessionProvider>
  );
}
