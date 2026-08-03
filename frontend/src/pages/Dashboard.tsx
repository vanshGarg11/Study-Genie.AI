import {
  Coins,
  FileText,
  Brain,
  Upload,
  User,
  LogOut,
  Home,
  Sparkles,
  Search,
  Bell,
  ArrowUpRight,
  BookOpenCheck,
  FolderOpen,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import { useUser } from "../context/userContextValue";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: Home, index: "01" },
  { label: "Generate Notes", path: "/notes", icon: Brain, index: "02" },
  { label: "Upload PDF", path: "/pdf", icon: Upload, index: "03" },
  { label: "Buy Coins", path: "/coins", icon: Coins, index: "04" },
  { label: "Profile", path: "/profile", icon: User, index: "05" },
];

const quickActions = [
  {
    label: "Generate Notes",
    description: "Feed it a topic. Get back structured, exam-ready notes in seconds.",
    path: "/notes",
    icon: Brain,
    tag: "AI / NOTES",
  },
  {
    label: "Upload PDF",
    description: "Drop a textbook, paper, or slide deck for deep AI analysis.",
    path: "/pdf",
    icon: Upload,
    tag: "AI / DOCS",
  },
  {
    label: "My Lessons",
    description: "Resume generated lessons, continue slides, and finish quizzes.",
    path: "/lessons",
    icon: BookOpenCheck,
    tag: "PREMIUM / LESSONS",
  },
];

interface PDF {
  _id: string;
  fileName: string;
}

interface NoteSummary {
  _id: string;
}

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useUser();

  const [pdfs, setPdfs] = useState<PDF[]>([]);
  const [pdfsLoading, setPdfsLoading] = useState(true);
  const [notesCount, setNotesCount] = useState(0);
  const [notesLoading, setNotesLoading] = useState(true);

  const fetchPDFs = async () => {
    try {
      const res = await api.get("/api/pdf/my-pdfs");
      setPdfs(res.data.pdfs);
    } catch {
      setPdfs([]);
    } finally {
      setPdfsLoading(false);
    }
  };

  useEffect(() => {
    fetchPDFs();
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await api.get("/api/ai/notes");
      const notes = (res.data.notes || []) as NoteSummary[];
      setNotesCount(res.data.count ?? notes.length);
    } catch {
      setNotesCount(0);
    } finally {
      setNotesLoading(false);
    }
  };

  const stats = [
    {
      label: "Available Coins",
      value: user ? String(user.coins).padStart(2, "0") : "--",
      icon: Coins,
      accent: "#4C6FFF",
    },
    {
      label: "PDFs Uploaded",
      value: pdfsLoading ? "--" : String(pdfs.length).padStart(2, "0"),
      icon: FileText,
      accent: "#F2B705",
    },
    {
      label: "Notes Generated",
      value: notesLoading ? "--" : String(notesCount).padStart(2, "0"),
      icon: Brain,
      accent: "#4C6FFF",
    },
  ];

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="sg-root min-h-screen flex font-[Inter] bg-[#0E1116] text-[#ECEEF3] overflow-x-hidden relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap');

        .sg-root { --ink:#0E1116; --line:#262B34; --line-soft:#1B1F27; --paper:#ECEEF3; --muted:#7D8494; --cobalt:#4C6FFF; --amber:#F2B705; }
        .sg-serif { font-family:'Fraunces', serif; font-optical-sizing:auto; }
        .sg-mono { font-family:'IBM Plex Mono', monospace; }

        /* ruled paper texture, faint */
        .sg-rule-bg {
          background-image: repeating-linear-gradient(
            to bottom,
            transparent 0px, transparent 31px, var(--line-soft) 32px
          );
        }

        @keyframes riseIn {
          from { opacity:0; transform: translateY(14px); }
          to { opacity:1; transform: translateY(0); }
        }
        .sg-rise { opacity:0; animation: riseIn .55s cubic-bezier(.2,.7,.2,1) forwards; }

        @keyframes blink {
          0%, 100% { opacity:1; } 50% { opacity:0; }
        }
        .sg-caret { animation: blink 1.1s step-start infinite; }

        /* nav item: sliding bracket + index number */
        .sg-nav-item {
          position: relative;
          border: 1px solid transparent;
        }
        .sg-nav-item .sg-bracket {
          position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
          background: var(--cobalt);
          transform: scaleY(0);
          transform-origin: top;
          transition: transform .28s cubic-bezier(.2,.8,.2,1);
        }
        .sg-nav-item:hover .sg-bracket, .sg-nav-item[data-active="true"] .sg-bracket {
          transform: scaleY(1);
        }
        .sg-nav-item:hover, .sg-nav-item[data-active="true"] {
          border-color: var(--line);
          background: #151920;
        }
        .sg-nav-item .sg-idx {
          transition: color .2s ease, opacity .2s ease;
          opacity: .45;
        }
        .sg-nav-item:hover .sg-idx, .sg-nav-item[data-active="true"] .sg-idx {
          opacity: 1;
          color: var(--cobalt);
        }

        /* hard-edge press card */
        .sg-card {
          border: 1px solid var(--line);
          box-shadow: 6px 6px 0 0 rgba(76,111,255,0.0);
          transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
        }
        .sg-card:hover {
          transform: translate(-3px,-3px);
          box-shadow: 6px 6px 0 0 var(--cobalt-shadow, rgba(76,111,255,0.35));
          border-color: #3a4150;
        }

        .sg-action-card {
          border: 1px solid var(--line);
          transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
          box-shadow: 0 0 0 0 rgba(0,0,0,0);
        }
        .sg-action-card:hover {
          transform: translate(-4px,-4px);
          box-shadow: 7px 7px 0 0 #1c212b, 7px 7px 0 1px var(--line);
          border-color: #3a4150;
        }
        .sg-action-card:active {
          transform: translate(-1px,-1px);
          box-shadow: 3px 3px 0 0 #1c212b, 3px 3px 0 1px var(--line);
        }

        .sg-dotted-leader {
          flex: 1;
          border-bottom: 1px dotted #3a4150;
          margin: 0 10px;
          transform: translateY(-4px);
        }

        .sg-search:focus-within {
          border-color: var(--cobalt);
        }

        .sg-btn-logout {
          transition: background .2s ease, color .2s ease, border-color .2s ease, letter-spacing .2s ease;
        }
        .sg-btn-logout:hover {
          letter-spacing: 0.04em;
        }

        .sg-corner-cut {
          clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%);
        }

        .sg-pdf-arrow {
          transition: transform .18s ease, color .18s ease;
        }
        .sg-action-card:hover .sg-pdf-arrow {
          transform: translate(2px,-2px);
          color: #6C87FF;
        }

        @keyframes pulseLine {
          0%, 100% { opacity: .35; }
          50% { opacity: .75; }
        }
        .sg-skel-pdf {
          animation: pulseLine 1.3s ease-in-out infinite;
          background: #151920;
          border: 1px solid var(--line);
        }
      `}</style>

      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-[#0B0E13] border-r border-[#262B34] p-5 flex flex-col justify-between z-10">
        <div>
          <div
            className="flex items-center gap-3 px-1 mb-9 group cursor-pointer"
            onClick={() => navigate("/dashboard")}
          >
            <div className="w-9 h-9 border border-[#262B34] flex items-center justify-center bg-[#12161D] sg-corner-cut">
              <Sparkles size={16} className="text-[#4C6FFF]" />
            </div>
            <span className="sg-serif text-xl font-semibold tracking-tight text-[#ECEEF3]">
              StudyGenie
            </span>
          </div>

          <p className="sg-mono text-[10px] uppercase tracking-[0.2em] text-[#7D8494] mb-3 px-1">
            Navigate
          </p>

          <nav className="space-y-1">
            {navItems.map(({ label, path, icon: Icon, index }) => {
              const active = location.pathname === path;
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  data-active={active}
                  aria-current={active ? "page" : undefined}
                  className="sg-nav-item w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-[#B7BCC7]"
                >
                  <span className="sg-bracket" />
                  <span className="flex items-center gap-3 relative z-10">
                    <Icon size={16} className={active ? "text-[#4C6FFF]" : "text-[#7D8494]"} />
                    <span className={active ? "text-[#ECEEF3]" : ""}>{label}</span>
                  </span>
                  <span className="sg-idx sg-mono text-[10px]">{index}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <button
          onClick={logout}
          className="sg-btn-logout w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#E8556B] border border-[#2A1A1D] hover:border-[#E8556B]/40 hover:bg-[#1A0E10]"
        >
          <LogOut size={16} />
          <span className="sg-mono text-xs tracking-wide">LOG OUT</span>
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        <header className="h-[72px] shrink-0 flex items-center justify-between px-9 border-b border-[#262B34]">
          <div className="flex items-baseline gap-3">
            <h2 className="sg-serif text-lg font-semibold text-[#ECEEF3]">Workspace</h2>
            <span className="sg-mono text-[11px] text-[#7D8494]">/ dashboard</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="sg-search relative hidden md:flex items-center border border-[#262B34] bg-[#12161D] transition-colors duration-200">
              <Search size={14} className="ml-3 text-[#7D8494]" />
              <input
                type="text"
                placeholder="Search resources, templates..."
                className="pl-2 pr-4 py-2.5 text-sm bg-transparent outline-none w-60 text-[#ECEEF3] placeholder-[#5A6070] sg-mono"
              />
            </div>

            <button
              onClick={() => navigate("/pdfs")}
              className="hidden sm:flex items-center gap-2 h-10 px-3.5 border border-[#262B34] bg-[#12161D] text-[#7D8494] hover:text-[#ECEEF3] hover:border-[#3a4150] transition-colors duration-200 text-sm font-medium"
            >
              <FolderOpen size={16} />
              My PDFs
            </button>

            <button
              onClick={() => navigate("/lessons")}
              className="hidden sm:flex items-center gap-2 h-10 px-3.5 border border-[#262B34] bg-[#12161D] text-[#7D8494] hover:text-[#ECEEF3] hover:border-[#3a4150] transition-colors duration-200 text-sm font-medium"
            >
              <BookOpenCheck size={16} />
              My Lessons
            </button>

            <button
              className="w-10 h-10 flex items-center justify-center border border-[#262B34] bg-[#12161D] text-[#7D8494] hover:text-[#ECEEF3] hover:border-[#3a4150] transition-colors duration-200 relative"
              aria-label="Notifications"
            >
              <Bell size={16} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#4C6FFF]" />
            </button>

            <div className="w-10 h-10 border border-[#262B34] bg-[#12161D] flex items-center justify-center text-xs font-bold sg-mono text-[#ECEEF3]">
              U
            </div>
          </div>
        </header>

        <main className="flex-1 p-9 overflow-y-auto space-y-10 sg-rule-bg">
          {/* Hero */}
          <section
            className="sg-rise bg-[#12161D] border border-[#262B34] p-8 relative overflow-hidden"
            style={{ animationDelay: "0ms" }}
          >
            <div className="relative z-10 max-w-xl">
              <span className="sg-mono inline-flex items-center gap-2 px-2.5 py-1 text-[10px] tracking-widest uppercase border border-[#4C6FFF]/30 text-[#4C6FFF] mb-4">
                Live smarter - Learn faster<span className="sg-caret">_</span>
              </span>
              <h1 className="sg-serif text-3xl font-semibold text-[#ECEEF3] mb-2 leading-tight">
                Welcome back, Scholar.
              </h1>
              <p className="text-[#8B92A3] text-sm leading-relaxed max-w-md">
                Your workspace is synced and ready. Pick up where you left off,
                or feed something new into the machine.
              </p>
            </div>
          </section>

          {/* Stats - ledger style */}
          <section className="sg-rise border border-[#262B34]" style={{ animationDelay: "90ms" }}>
            <div className="px-6 py-3 border-b border-[#262B34] flex items-center justify-between">
              <span className="sg-mono text-[10px] uppercase tracking-[0.2em] text-[#7D8494]">
                Account Ledger
              </span>
              <span className="sg-mono text-[10px] text-[#4C6FFF]">UPDATED NOW</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3">
              {stats.map(({ label, value, icon: Icon, accent }, i) => (
                <div
                  key={label}
                  className={`p-6 flex items-center justify-between group ${
                    i !== stats.length - 1 ? "md:border-r border-[#262B34]" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} style={{ color: accent }} strokeWidth={2.2} />
                    <span className="text-xs text-[#8B92A3]">{label}</span>
                  </div>
                  <span className="sg-dotted-leader hidden md:block" />
                  <h3 className="sg-mono text-2xl font-semibold text-[#ECEEF3] tabular-nums">
                    {value}
                  </h3>
                </div>
              ))}
            </div>
          </section>

          {/* Quick actions */}
          <section className="space-y-4">
            <div className="sg-rise flex items-center gap-3" style={{ animationDelay: "160ms" }}>
              <span className="sg-mono text-[10px] uppercase tracking-[0.2em] text-[#7D8494]">
                Core Operations
              </span>
              <span className="flex-1 border-t border-[#262B34]" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quickActions.map(({ label, description, path, icon: Icon, tag }, i) => (
                <div
                  key={path}
                  onClick={() => navigate(path)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") navigate(path); }}
                  className="sg-rise sg-action-card bg-[#12161D] p-6 cursor-pointer flex flex-col gap-5"
                  style={{ animationDelay: `${220 + i * 90}ms` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="w-11 h-11 border border-[#262B34] flex items-center justify-center bg-[#0E1116]">
                      <Icon size={20} className="text-[#4C6FFF]" strokeWidth={2} />
                    </div>
                    <span className="sg-mono text-[10px] tracking-widest text-[#5A6070]">{tag}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <h4 className="sg-serif text-lg font-semibold text-[#ECEEF3]">{label}</h4>
                    </div>
                    <p className="text-[#8B92A3] text-sm leading-relaxed">{description}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#4C6FFF] text-xs font-medium sg-mono mt-1">
                    OPEN <ArrowUpRight size={13} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recent PDFs */}
          <section className="space-y-4">
            <div className="sg-rise flex items-center justify-between gap-3" style={{ animationDelay: "260ms" }}>
              <div className="flex items-center gap-3 flex-1">
                <span className="sg-mono text-[10px] uppercase tracking-[0.2em] text-[#7D8494]">
                  Recent PDFs{pdfs.length > 0 ? ` (${pdfs.length})` : ""}
                </span>
                <span className="flex-1 border-t border-[#262B34]" />
              </div>
              {pdfs.length > 0 && (
                <button
                  onClick={() => navigate("/pdfs")}
                  className="sg-mono text-[10px] tracking-widest uppercase text-[#4C6FFF] hover:underline underline-offset-2 shrink-0"
                >
                  View All
                </button>
              )}
            </div>

            {pdfsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[0, 1].map((i) => (
                  <div key={i} className="p-5 flex items-center gap-4">
                    <div className="sg-skel-pdf w-11 h-11 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="sg-skel-pdf h-3.5 w-3/5" />
                      <div className="sg-skel-pdf h-2.5 w-2/5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : pdfs.length === 0 ? (
              <div
                className="sg-rise border border-dashed border-[#262B34] p-6 text-center"
                style={{ animationDelay: "300ms" }}
              >
                <p className="text-sm text-[#8B92A3]">
                  No PDFs uploaded yet.{" "}
                  <button
                    onClick={() => navigate("/pdf")}
                    className="text-[#4C6FFF] font-medium hover:underline underline-offset-2"
                  >
                    Upload one
                  </button>{" "}
                  to get started.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {pdfs.slice(0, 4).map((pdf, i) => (
                  <div
                    key={pdf._id}
                    onClick={() => navigate(`/pdf/chat/${pdf._id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") navigate(`/pdf/chat/${pdf._id}`);
                    }}
                    className="sg-rise sg-action-card bg-[#12161D] p-5 cursor-pointer flex items-center justify-between gap-4"
                    style={{ animationDelay: `${320 + i * 60}ms` }}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-11 h-11 border border-[#262B34] flex items-center justify-center bg-[#0E1116] shrink-0">
                        <FileText size={18} className="text-[#F2B705]" strokeWidth={2} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-[#ECEEF3] truncate">
                          {pdf.fileName}
                        </h3>
                        <p className="sg-mono text-[11px] text-[#7D8494] mt-0.5">
                          CLICK TO CONTINUE CHATTING
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight size={16} className="sg-pdf-arrow text-[#4C6FFF] shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
