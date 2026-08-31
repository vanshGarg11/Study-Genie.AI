import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Frown } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050507] px-5 relative overflow-hidden">
      {/* Glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-cyan-400/8 blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="neon-card rounded-3xl p-10 sm:p-14 text-center max-w-md w-full relative z-10"
      >
        {/* Glitch number */}
        <div className="relative mb-6">
          <span className="text-[96px] font-black leading-none font-mono text-gradient-vc select-none">
            404
          </span>
        </div>

        <Frown size={32} className="mx-auto text-violet-400 mb-4" />

        <h1 className="text-2xl font-extrabold text-white mb-2">
          Page Not Found
        </h1>
        <p className="text-sm text-gray-400 leading-relaxed mb-8">
          The study resource you're looking for has either been moved, deleted, or never existed in the first place.
        </p>

        <Link
          to="/dashboard"
          className="btn-violet inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-bold text-sm w-full"
        >
          <Home size={16} />
          <span>Back to Dashboard</span>
        </Link>

        <Link
          to="/"
          className="btn-ghost inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold text-sm w-full mt-3"
        >
          Go to Home
        </Link>
      </motion.div>
    </div>
  );
}
