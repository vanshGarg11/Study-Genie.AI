import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  Lock,
  Mail,
  User,
  ArrowRight,
  Gift,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import api from "../services/api";
import { useUser } from "../context/userContextValue";
import toast, { Toaster } from "react-hot-toast";

export default function Register() {
  const navigate = useNavigate();
  const { refreshUser } = useUser();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const getPasswordStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 6) score += 33;
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score += 34;
    if (/[^A-Za-z0-9]/.test(password) || password.length >= 10) score += 33;
    return score;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/api/auth/register", {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        await refreshUser();
        toast.success("Account created! +100 Coins credited to your wallet.");
        navigate("/dashboard");
      } else {
        toast.success("Registration successful! Please sign in.");
        navigate("/login");
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          "Registration failed. Please verify your details."
      );
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength();

  return (
    <div className="min-h-screen w-full flex bg-[#050507] text-[#F1F5F9] relative overflow-hidden font-sans">
      <Toaster position="top-right" />

      {/* Background glow effects */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

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

        <div className="space-y-6 max-w-lg">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-4 glow-amber-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Gift size={20} />
            </div>
            <div>
              <span className="text-sm font-bold text-amber-300 block">
                Instant Welcome Grant: 100 Coins
              </span>
              <span className="text-xs text-gray-300">
                Unlock multi-slide lessons, voice audio narration, and live Q&A immediately.
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-black text-white tracking-tight">
              Join thousands of students mastering their coursework
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              Experience the power of LLM-grounded document learning with real-time flashcard generators, interactive quizzes, and Live2D interactive avatars.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            {[
              "Free AI Note Generation on Any Topic",
              "PDF Chat with strict citation grounding",
              "Interactive 3D Flashcard decks with active recall",
              "Comprehension quiz arenas with explanations",
            ].map((feat, i) => (
              <div key={i} className="flex items-center gap-2.5 text-xs text-gray-300">
                <CheckCircle2 size={15} className="text-cyan-400 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400 pt-6 border-t border-white/[0.06] font-mono">
          <span>Protected by JWT & Bcrypt Encryption</span>
          <span>© 2026 StudyGenie</span>
        </div>
      </motion.div>

      {/* Right Register Form */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10"
      >
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2 text-center lg:text-left">
            <Link to="/" className="lg:hidden inline-flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center text-white font-bold">
                <Sparkles size={18} />
              </div>
              <span className="font-bold text-xl text-white">StudyGenie</span>
            </Link>

            <h2 className="text-3xl font-black text-white tracking-tight">
              Create Scholar Account
            </h2>
            <p className="text-xs sm:text-sm text-gray-400">
              Get started with 100 free coins automatically credited.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                Full Name
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Alex Rivera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-neon w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
                />
              </div>
            </div>

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
                  placeholder="alex@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-neon w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-neon w-full pl-10 pr-10 py-2.5 rounded-xl text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {password && (
                <div className="pt-1">
                  <div className="h-1 w-full bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        strength <= 33
                          ? "bg-rose-500 w-1/3"
                          : strength <= 67
                          ? "bg-amber-400 w-2/3"
                          : "bg-cyan-400 w-full"
                      }`}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                Confirm Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-neon w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
                />
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
              <span>{loading ? "Creating Scholar Account..." : "Create Account"}</span>
            </button>
          </form>

          <p className="text-center text-xs text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-violet-400 font-semibold hover:text-violet-300 transition-colors"
            >
              Log In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
