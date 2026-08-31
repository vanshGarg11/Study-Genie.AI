import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  Lock,
  Mail,
  ArrowRight,
  Brain,
  Layers,
} from "lucide-react";
import { motion } from "framer-motion";
import api from "../services/api";
import { useUser } from "../context/userContextValue";
import toast, { Toaster } from "react-hot-toast";

export default function Login() {
  const navigate = useNavigate();
  const { refreshUser } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.error("Please enter both your email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/api/auth/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      localStorage.setItem("token", res.data.token);
      await refreshUser();
      toast.success("Welcome back to StudyGenie!");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          "Invalid credentials. Please double-check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#050507] text-[#F1F5F9] relative overflow-hidden font-sans">
      <Toaster position="top-right" />

      {/* Decorative ambient glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Left Feature Showcase (Desktop) */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between relative border-r border-white/[0.06] hero-gradient bg-grid"
      >
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-violet-600/30">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-white block">
              Study<span className="text-gradient-vc">Genie</span>
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-violet-400 block">
              AI Study Assistant
            </span>
          </div>
        </Link>

        <div className="space-y-8 max-w-lg">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full badge-violet text-xs font-mono font-semibold uppercase tracking-wider">
              🎓 Study Smarter, Learn Faster
            </span>
            <h1 className="text-4xl font-black text-white tracking-tight leading-tight">
              Transform readings into <span className="text-gradient-vc">interactive mastery</span>
            </h1>
            <p className="text-sm text-gray-300 leading-relaxed">
              Upload PDF materials, auto-generate bite-sized flashcards, take interactive MCQs, and chat directly with your course readings using Gemini AI.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl neon-card space-y-2">
              <div className="w-8 h-8 rounded-lg bg-violet-500/20 text-violet-400 flex items-center justify-center">
                <Brain size={16} />
              </div>
              <h4 className="text-xs font-bold text-white">AI Revision Notes</h4>
              <p className="text-[11px] text-gray-400">
                High-yield chapter summaries synthesized in seconds.
              </p>
            </div>

            <div className="p-4 rounded-2xl neon-card space-y-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Layers size={16} />
              </div>
              <h4 className="text-xs font-bold text-white">3D Flashcards</h4>
              <p className="text-[11px] text-gray-400">
                Interactive active recall flip decks with spaced review.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400 pt-6 border-t border-white/[0.06] font-mono">
          <span>+100 Coins Welcome Bonus</span>
          <span>© 2026 StudyGenie</span>
        </div>
      </motion.div>

      {/* Right Login Form */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10"
      >
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2 text-center lg:text-left">
            <Link to="/" className="lg:hidden inline-flex items-center gap-2 mb-6">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center text-white font-bold">
                <Sparkles size={18} />
              </div>
              <span className="font-bold text-xl text-white">StudyGenie</span>
            </Link>

            <h2 className="text-3xl font-black text-white tracking-tight">
              Welcome back
            </h2>
            <p className="text-xs sm:text-sm text-gray-400">
              Sign in with your academic credentials to access your workspace.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="email"
                  placeholder="scholar@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-neon w-full pl-10 pr-4 py-3 rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-neon w-full pl-10 pr-10 py-3 rounded-xl text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-violet w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <ArrowRight size={18} />
              )}
              <span>{loading ? "Signing in..." : "Sign In to Workspace"}</span>
            </button>
          </form>

          <p className="text-center text-xs text-gray-400">
            Don't have an account yet?{" "}
            <Link
              to="/register"
              className="text-violet-400 font-semibold hover:text-violet-300 transition-colors"
            >
              Create Account (+100 Free Coins)
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
