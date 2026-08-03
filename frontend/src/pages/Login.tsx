import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, FileText, HelpCircle, Layers } from "lucide-react";
import api from "../services/api";
import { useUser } from "../context/userContextValue";

function Login() {
  const navigate = useNavigate();
  const { refreshUser } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter both your email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      await refreshUser();
      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "We couldn't sign you in. Check your details and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex font-[Inter]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap');

        @keyframes float-stack {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50% { transform: translateY(-10px) rotate(-2deg); }
        }
        @keyframes sweep-highlight {
          0% { width: 0%; opacity: 0; }
          15% { opacity: 1; }
          60% { width: 100%; opacity: 1; }
          100% { width: 100%; opacity: 1; }
        }
        .card-stack { animation: float-stack 6s ease-in-out infinite; }
        .highlight-sweep {
          position: relative;
          display: inline-block;
        }
        .highlight-sweep::after {
          content: "";
          position: absolute;
          left: 0; bottom: 2px;
          height: 0.5em;
          width: 0%;
          background: #FFCB3D;
          opacity: 0.55;
          z-index: -1;
          border-radius: 2px;
          animation: sweep-highlight 2.4s ease-out 0.6s forwards;
        }
      `}</style>

      {/* Left Side — signature: a tilted deck of "study cards" */}
      <div
        className="hidden lg:flex lg:w-1/2 items-center justify-center px-16 relative overflow-hidden"
        style={{ background: "#17233D" }}
      >
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />

        <div className="max-w-lg relative z-10">
          <h1
            className="text-6xl mb-6 text-white"
            style={{ fontFamily: "Fraunces, serif", fontWeight: 600 }}
          >
            Study<span className="highlight-sweep text-white">Genie</span>
          </h1>

          <p className="text-xl leading-relaxed text-[#B7C0D6] mb-14">
            Upload your notes. Ask your PDFs questions. Let StudyGenie turn
            it all into quizzes, flashcards, and a plan you'll actually
            follow.
          </p>

          {/* Card stack */}
          <div className="relative h-56">
            <div
              className="card-stack absolute w-64 rounded-2xl p-5 shadow-2xl"
              style={{
                background: "#EEF1F6",
                transform: "rotate(-2deg)",
                left: 0,
                top: 10,
              }}
            >
              <div
                className="inline-flex items-center gap-1.5 text-[11px] tracking-wide px-2 py-1 rounded-md mb-3"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  background: "#FFCB3D",
                  color: "#17233D",
                }}
              >
                <FileText size={12} strokeWidth={2.5} />
                PDF CHAT
              </div>
              <div className="h-2.5 rounded bg-[#C7CEDC] w-full mb-2" />
              <div className="h-2.5 rounded bg-[#C7CEDC] w-4/5" />
            </div>

            <div
              className="absolute w-56 rounded-2xl p-5 shadow-xl"
              style={{
                background: "#1F2E4E",
                border: "1px solid #33436B",
                transform: "rotate(6deg)",
                left: 150,
                top: 55,
              }}
            >
              <div
                className="inline-flex items-center gap-1.5 text-[11px] tracking-wide px-2 py-1 rounded-md mb-3"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  background: "#14B8A6",
                  color: "#0B2320",
                }}
              >
                <HelpCircle size={12} strokeWidth={2.5} />
                QUIZ
              </div>
              <div className="h-2.5 rounded bg-[#3A4A6E] w-full mb-2" />
              <div className="h-2.5 rounded bg-[#3A4A6E] w-3/5" />
            </div>

            <div
              className="absolute w-48 rounded-2xl p-4 shadow-xl"
              style={{
                background: "#2A3A60",
                border: "1px solid #3D4E77",
                transform: "rotate(-8deg)",
                left: 40,
                top: 130,
              }}
            >
              <div
                className="inline-flex items-center gap-1.5 text-[10px] tracking-wide px-2 py-1 rounded-md"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  background: "#8B7CF6",
                  color: "#1A1533",
                }}
              >
                <Layers size={11} strokeWidth={2.5} />
                FLASHCARDS
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side — form */}
      <div
        className="w-full lg:w-1/2 flex items-center justify-center p-8"
        style={{
  background:
    "linear-gradient(135deg,#EEF2FF 0%,#F8FAFC 100%)",
}}
      >
        <div className="w-full max-w-lg bg-white rounded-[32px] shadow-2xl p-12">
          <h2
            className="text-3xl mb-2"
            style={{ fontFamily: "Fraunces, serif", fontWeight: 600, color: "#17233D" }}
          >
            Welcome back
          </h2>
          <p className="text-[#64748B] mb-8">Sign in to pick up where you left off.</p>

          {error && (
            <div
              role="alert"
              className="mb-6 px-4 py-3 rounded-xl text-sm"
              style={{ background: "#FDECEA", color: "#B3261E", border: "1px solid #F6C6C2" }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} noValidate>
            <div className="mb-5">
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium"
                style={{ color: "#334155" }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded-xl px-4 py-3 outline-none transition focus:ring-2"
                style={{ borderColor: "#CBD5E1" }}
                onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 2px #14B8A6")}
                onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
              />
            </div>

            <div className="mb-2">
              <label
                htmlFor="password"
                className="block mb-2 text-sm font-medium"
                style={{ color: "#334155" }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 pr-11 outline-none transition"
                  style={{ borderColor: "#CBD5E1" }}
                  onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 2px #14B8A6")}
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end mb-6">
              <Link
                to="/forgot-password"
                className="text-sm font-medium hover:underline"
                style={{ color: "#14B8A6" }}
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 disabled:opacity-70"
              style={{ background: "#3F3D9E" }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.background = "#332F82";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#3F3D9E";
              }}
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? "Signing in..." : "Sign in"}
            </button>

            <p className="text-center mt-6 text-[#64748B]">
              Don't have an account?
              <Link to="/register" className="ml-2 font-semibold" style={{ color: "#3F3D9E" }}>
                Register
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
