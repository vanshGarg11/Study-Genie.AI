import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import {
  Coins,
  FileText,
  Brain,
  Upload,
  Layers,
  Trophy,
  BookOpenCheck,
  ArrowUpRight,
  Sparkles,
  ChevronRight,
  MessageSquare,
  Lightbulb,
} from "lucide-react";
import { motion } from "framer-motion";
import Counter from "../components/Counter";
import api from "../services/api";
import { useUser } from "../context/userContextValue";

interface PDFItem {
  _id: string;
  fileName: string;
  createdAt: string;
}

const studyTips = [
  "Use the 3D Flashcards active recall mode right before bed for 30% higher memory retention.",
  "Ask the PDF Chat to test you with 'generate 3 practice questions from Chapter 2'.",
  "Take an AI Quiz immediately after reading a section to identify comprehension gaps.",
  "Use the Live2D teacher voice narration while commuting for effortless revision.",
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [pdfs, setPdfs] = useState<PDFItem[]>([]);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const fetchPDFs = async () => {
      try {
        const res = await api.get("/api/pdf");
        setPdfs(res.data.pdfs || []);
      } catch {
        // non-blocking
      }
    };
    fetchPDFs();

    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % studyTips.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const actionCards = [
    {
      title: "Generate AI Notes",
      desc: "Instant structured revision summaries on any subject",
      icon: Brain,
      path: "/notes",
      color: "from-violet-600 to-indigo-600",
      badge: "2 Coins",
    },
    {
      title: "3D Flashcards",
      desc: "Interactive active recall flip cards with spaced review",
      icon: Layers,
      path: "/flashcards",
      color: "from-cyan-500 to-blue-600",
      badge: "3 Coins",
    },
    {
      title: "Quiz Arena",
      desc: "Self-assessment MCQs with instant feedback & streaks",
      icon: Trophy,
      path: "/quiz",
      color: "from-rose-500 to-pink-600",
      badge: "3 Coins",
    },
    {
      title: "PDF Document Chat",
      desc: "Ask any question with grounded textbook citations",
      icon: MessageSquare,
      path: "/pdfs",
      color: "from-amber-500 to-orange-600",
      badge: "Free",
    },
    {
      title: "Course Lessons",
      desc: "AI slide presentations with interactive voice teacher",
      icon: BookOpenCheck,
      path: "/lessons",
      color: "from-emerald-500 to-teal-600",
      badge: "Full Course",
    },
    {
      title: "Coin Top-Up",
      desc: "Recharge coins for unlimited AI document synthesis",
      icon: Coins,
      path: "/coins",
      color: "from-violet-600 to-purple-600",
      badge: "Instant",
    },
  ];

  return (
    <AppLayout
      title="Study Workspace"
      subtitle={`Welcome back, ${user?.name?.split(" ")[0] || "Scholar"}!`}
      actionButton={
        <button
          onClick={() => navigate("/pdf")}
          className="btn-violet flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer"
        >
          <Upload size={14} />
          <span>Upload PDF</span>
        </button>
      }
    >
      <div className="space-y-8">
        {/* Welcome Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 sm:p-8 rounded-3xl neon-card relative overflow-hidden bg-gradient-to-r from-violet-950/60 via-[#0D0F1A] to-cyan-950/40 border border-violet-500/20"
        >
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full badge-violet text-xs font-mono font-semibold">
                <Sparkles size={13} />
                <span>AI Study Suite Active</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {getGreeting()}, {user?.name || "Student"}!
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 max-w-xl">
                Ready to accelerate your learning? Upload lecture slides, generate flashcards, or practice quiz questions right now.
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.08] text-center min-w-[120px]">
                <span className="text-[10px] font-mono uppercase text-gray-400 block">
                  Coin Balance
                </span>
                <span className="text-2xl font-mono font-black text-amber-400">
                  <Counter end={user?.coins ?? 0} />
                </span>
              </div>

              <button
                onClick={() => navigate("/coins")}
                className="btn-cyan px-4 py-3 rounded-2xl text-xs font-bold cursor-pointer"
              >
                Top Up
              </button>
            </div>
          </div>
        </motion.div>

        {/* 6 Quick Action Launchpad */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Study Launchpad
            </h3>
            <span className="text-xs text-violet-400 font-mono">6 AI Tools</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {actionCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => navigate(card.path)}
                  className="p-5 rounded-2xl neon-card text-left flex flex-col justify-between space-y-4 group cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${card.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}
                    >
                      <Icon size={22} />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-1 rounded-md badge-violet">
                      {card.badge}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-white group-hover:text-violet-300 transition-colors flex items-center gap-1.5">
                      <span>{card.title}</span>
                      <ArrowUpRight
                        size={16}
                        className="opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all text-violet-400"
                      />
                    </h4>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Split Section: Recent Documents & AI Study Tip */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Recent PDFs */}
          <div className="lg:col-span-8 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Recent Documents
              </h3>
              <button
                onClick={() => navigate("/pdfs")}
                className="text-xs text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>View Library</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {pdfs.length === 0 ? (
              <div className="p-8 rounded-2xl neon-card text-center space-y-3 border-dashed">
                <FileText size={32} className="mx-auto text-gray-500" />
                <p className="text-xs text-gray-400">
                  No documents uploaded yet. Upload a syllabus or textbook to start.
                </p>
                <button
                  onClick={() => navigate("/pdf")}
                  className="btn-violet px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Upload First PDF
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {pdfs.slice(0, 4).map((pdf) => (
                  <div
                    key={pdf._id}
                    className="p-4 rounded-2xl neon-card flex items-center justify-between gap-4 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-400 flex items-center justify-center shrink-0">
                        <FileText size={18} />
                      </div>
                      <div className="min-w-0">
                        <span className="text-sm font-bold text-white block truncate">
                          {pdf.fileName}
                        </span>
                        <span className="text-[10px] font-mono text-gray-400 block">
                          {new Date(pdf.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/pdf/chat/${pdf._id}`)}
                      className="btn-cyan px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 cursor-pointer"
                    >
                      Chat PDF
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Study Pro-Tip Card */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Daily Study Tip
            </h3>

            <div className="p-6 rounded-3xl neon-card space-y-4 bg-gradient-to-br from-[#0D0F1A] to-violet-950/20 border border-violet-500/20">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <Lightbulb size={20} />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300 font-bold block">
                  Active Learning Strategy
                </span>
                <p className="text-xs text-gray-200 leading-relaxed italic">
                  "{studyTips[tipIndex]}"
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() =>
                    setTipIndex((prev) => (prev + 1) % studyTips.length)
                  }
                  className="text-[11px] font-mono text-violet-400 hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  Next Tip →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing & Coin Recharge Launch Banner */}
        <div className="p-6 sm:p-8 rounded-3xl neon-card relative overflow-hidden bg-gradient-to-r from-violet-950/40 via-[#0D0F1A] to-cyan-950/40 border border-violet-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full badge-violet text-xs font-mono font-semibold">
              <Sparkles size={13} />
              <span>Transparent Pay-As-You-Learn Pricing</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Need More AI Study Power?
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 max-w-xl">
              Recharge with 50, 200, or 500 Scholar Coins. Unlock instant multi-slide course lesson generation, 3D flashcards, and live AI video lectures with no monthly subscriptions.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate("/coins")}
              className="btn-violet px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-violet-600/30 cursor-pointer"
            >
              <Coins size={15} />
              <span>Explore Coin Plans</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
