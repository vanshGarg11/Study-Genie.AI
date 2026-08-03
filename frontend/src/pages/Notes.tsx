import { type ReactElement, useEffect, useState } from "react";
import {
  Coins,
  Brain,
  Upload,
  User,
  LogOut,
  Home,
  Sparkles,
  ArrowLeft,
  FolderOpen,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import { useUser } from "../context/userContextValue";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: Home, index: "01" },
  { label: "Generate Notes", path: "/notes", icon: Brain, index: "02" },
  { label: "Upload PDF", path: "/pdf", icon: Upload, index: "03" },
  { label: "Buy Coins", path: "/coins", icon: Coins, index: "04" },
  { label: "Profile", path: "/profile", icon: User, index: "05" },
];

function renderInline(text: string, keyPrefix: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter((p) => p.length > 0);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={`${keyPrefix}-${i}`} className="text-[#ECEEF3] font-bold">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={`${keyPrefix}-${i}`}>{part}</span>
    )
  );
}

function renderNotes(raw: string) {
  const lines = raw.split("\n");
  const blocks: ReactElement[] = [];
  let bulletBuffer: string[] = [];

  const flushBullets = () => {
    if (bulletBuffer.length === 0) return;
    blocks.push(
      <ul key={`ul-${blocks.length}`} className="space-y-2 my-3">
        {bulletBuffer.map((b, idx) => (
          <li key={idx} className="flex gap-2.5 text-sm font-medium text-[#C7CBD3] leading-7">
            <span className="text-[#4C6FFF] sg-mono mt-1 shrink-0">&gt;</span>
            <span>{renderInline(b, `b-${blocks.length}-${idx}`)}</span>
          </li>
        ))}
      </ul>
    );
    bulletBuffer = [];
  };

  let i = 0;
  while (i < lines.length) {
    const trimmed = lines[i].trim();
    const next = (lines[i + 1] || "").trim();

    if (trimmed === "") {
      flushBullets();
      i++;
      continue;
    }

    const headingMatch = trimmed.match(/^\*\*(.+)\*\*$/);

    if (headingMatch && /^=+$/.test(next)) {
      flushBullets();
      blocks.push(
        <h3
          key={`h-${blocks.length}`}
          className="sg-serif text-2xl font-bold text-[#ECEEF3] mt-6 mb-2 pb-2 border-b-2 border-[#4C6FFF]/40"
        >
          {headingMatch[1]}
        </h3>
      );
      i += 2;
      continue;
    }

    if (headingMatch && /^-+$/.test(next)) {
      flushBullets();
      blocks.push(
        <h4
          key={`h-${blocks.length}`}
          className="sg-mono text-xs font-semibold uppercase tracking-[0.15em] text-[#4C6FFF] mt-5 mb-2"
        >
          {headingMatch[1]}
        </h4>
      );
      i += 2;
      continue;
    }

    if (/^=+$/.test(trimmed) || /^-+$/.test(trimmed)) {
      i++;
      continue;
    }

    if (/^\*\s+/.test(trimmed)) {
      bulletBuffer.push(trimmed.replace(/^\*\s+/, ""));
      i++;
      continue;
    }

    if (headingMatch) {
      flushBullets();
      blocks.push(
        <p key={`p-${blocks.length}`} className="text-sm font-bold text-[#ECEEF3] mt-4 mb-1">
          {headingMatch[1]}
        </p>
      );
      i++;
      continue;
    }

    flushBullets();
    blocks.push(
      <p key={`p-${blocks.length}`} className="text-sm font-medium text-[#C7CBD3] leading-7 mb-1">
        {renderInline(trimmed, `p-${blocks.length}`)}
      </p>
    );
    i++;
  }

  flushBullets();
  return blocks;
}

function Notes() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUser } = useUser();

  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedNoteId, setSelectedNoteId] = useState("");
  const [noteHistory, setNoteHistory] = useState<
    { _id: string; topic: string; notes: string; createdAt: string }[]
  >([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const fetchNoteHistory = async () => {
    try {
      const res = await api.get("/api/ai/notes");
      setNoteHistory(res.data.notes || []);
    } catch {
      setNoteHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchNoteHistory();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const generateNotes = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic to generate study material.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await api.post("/api/ai/notes", { topic });

      await refreshUser();

      setNotes(res.data.notes);
      setSelectedNoteId(res.data.note?._id || "");
      await fetchNoteHistory();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "We couldn't generate notes right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) generateNotes();
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(notes);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const openSavedNote = (note: {
    _id: string;
    topic: string;
    notes: string;
  }) => {
    setTopic(note.topic);
    setNotes(note.notes);
    setSelectedNoteId(note._id);
    setError("");
    setCopied(false);
  };

  return (
    <div className="sg-root min-h-screen flex font-[Inter] bg-[#0E1116] text-[#ECEEF3] overflow-x-hidden relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap');

        .sg-root { --ink:#0E1116; --line:#262B34; --line-soft:#1B1F27; --paper:#ECEEF3; --muted:#7D8494; --cobalt:#4C6FFF; --amber:#F2B705; }
        .sg-serif { font-family:'Fraunces', serif; font-optical-sizing:auto; }
        .sg-mono { font-family:'IBM Plex Mono', monospace; }

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

        @keyframes pulseLine {
          0%, 100% { opacity: .35; }
          50% { opacity: .8; }
        }
        .sg-skel {
          animation: pulseLine 1.3s ease-in-out infinite;
          background: repeating-linear-gradient(45deg, #262B34 0, #262B34 1px, transparent 1px, transparent 6px);
          background-color: #151920;
          border: 1px solid var(--line);
        }

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

        .sg-card {
          border: 1px solid var(--line);
          transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
        }
        .sg-card:hover {
          transform: translate(-3px,-3px);
          box-shadow: 6px 6px 0 0 rgba(76,111,255,0.35);
          border-color: #3a4150;
        }

        .sg-back-btn {
          transition: transform .18s ease, color .18s ease, border-color .18s ease;
        }
        .sg-back-btn:hover {
          transform: translateX(-2px);
          border-color: #3a4150;
          color: #ECEEF3;
        }

        .sg-input {
          border: 1px solid var(--line);
          background: #0B0E13;
          transition: border-color .18s ease, box-shadow .18s ease;
        }
        .sg-input:focus {
          border-color: var(--cobalt);
          box-shadow: 0 0 0 2px rgba(76,111,255,0.15);
        }

        .sg-btn-generate {
          background: var(--cobalt);
          transition: transform .18s ease, box-shadow .18s ease, background .18s ease;
        }
        .sg-btn-generate:hover:not(:disabled) {
          transform: translate(-2px,-2px);
          box-shadow: 4px 4px 0 0 #151920, 4px 4px 0 1px var(--line);
        }
        .sg-btn-generate:active:not(:disabled) {
          transform: translate(0,0);
          box-shadow: none;
        }

        .sg-copy-btn {
          border: 1px solid var(--line);
          transition: transform .16s ease, box-shadow .16s ease, border-color .16s ease;
        }
        .sg-copy-btn:hover {
          transform: translate(-2px,-2px);
          box-shadow: 3px 3px 0 0 var(--line);
        }

        .sg-notes-body {
          border-top: 1px dashed var(--line);
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
          <button
            onClick={() => navigate("/dashboard")}
            className="sg-back-btn flex items-center gap-2 px-3 py-2 border border-[#262B34] text-sm text-[#7D8494] sg-mono"
          >
            <ArrowLeft size={15} />
            BACK
          </button>

          <div className="flex items-baseline gap-3">
            <h2 className="sg-serif text-lg font-semibold text-[#ECEEF3]">Generate Notes</h2>
            <span className="sg-mono text-[11px] text-[#7D8494]">/ notes</span>
          </div>

          <button
            onClick={() => navigate("/pdfs")}
            className="sg-back-btn flex items-center gap-2 px-3 py-2 border border-[#262B34] text-sm text-[#7D8494] sg-mono"
          >
            <FolderOpen size={15} />
            MY PDFS
          </button>
        </header>

        <main className="flex-1 p-9 overflow-y-auto space-y-8 sg-rule-bg">
          {/* Prompt card */}
          <section className="sg-rise sg-card bg-[#12161D] p-8" style={{ animationDelay: "0ms" }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 border border-[#262B34] flex items-center justify-center bg-[#0E1116] shrink-0">
                <Brain size={20} className="text-[#4C6FFF]" strokeWidth={2.2} />
              </div>
              <span className="sg-mono text-[10px] tracking-widest uppercase px-2 py-1 border border-[#4C6FFF]/30 text-[#4C6FFF]">
                AI / NOTES
              </span>
            </div>

            <h1 className="sg-serif text-3xl font-semibold text-[#ECEEF3] mb-2 leading-tight">
              Generate notes
            </h1>
            <p className="text-[#8B92A3] text-sm mb-6 max-w-lg">
              Input any core concept or topic to map high-retention study assets.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="e.g., Quantum Entanglement, Cellular Respiration..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={handleKeyDown}
                className="sg-input flex-1 px-4 py-3 outline-none text-sm sg-mono text-[#ECEEF3] placeholder-[#5A6070]"
              />

              <button
                onClick={generateNotes}
                disabled={loading}
                className="sg-btn-generate text-white px-6 py-3 flex items-center justify-center gap-2 font-semibold text-sm sg-mono disabled:opacity-60 shrink-0"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Sparkles size={16} />
                )}
                {loading ? "SYNTHESIZING..." : "GENERATE"}
              </button>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-4 px-4 py-3 text-sm border border-[#E8556B]/30 text-[#E8556B] bg-[#1A0E10]"
              >
                {error}
              </div>
            )}
          </section>

          <section className="sg-rise sg-card bg-[#12161D] p-6" style={{ animationDelay: "60ms" }}>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <p className="sg-mono text-[10px] uppercase tracking-[0.2em] text-[#7D8494]">
                  Saved Notes
                </p>
                <h2 className="sg-serif text-xl font-semibold text-[#ECEEF3] mt-1">
                  Your generated notes history
                </h2>
              </div>
              <span className="sg-mono text-[11px] text-[#4C6FFF]">
                {historyLoading ? "--" : String(noteHistory.length).padStart(2, "0")}
              </span>
            </div>

            {historyLoading ? (
              <div className="space-y-3">
                <div className="sg-skel h-12" />
                <div className="sg-skel h-12" />
              </div>
            ) : noteHistory.length === 0 ? (
              <p className="text-sm text-[#8B92A3]">
                No old notes yet. Generate your first topic and it will appear here.
              </p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {noteHistory.map((note) => (
                  <button
                    key={note._id}
                    onClick={() => openSavedNote(note)}
                    className={`text-left border px-4 py-3 transition ${
                      selectedNoteId === note._id
                        ? "border-[#4C6FFF] bg-[#17213D]"
                        : "border-[#262B34] bg-[#0E1116] hover:border-[#3A4150]"
                    }`}
                  >
                    <span className="block truncate text-sm font-semibold text-[#ECEEF3]">
                      {note.topic}
                    </span>
                    <span className="sg-mono mt-1 block text-[10px] uppercase tracking-[0.14em] text-[#7D8494]">
                      {new Date(note.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Loading skeleton */}
          {loading && !notes && (
            <section className="sg-rise sg-card bg-[#12161D] p-8" style={{ animationDelay: "80ms" }}>
              <div className="flex items-center justify-between mb-6">
                <span className="sg-mono text-[10px] uppercase tracking-[0.2em] text-[#7D8494]">
                  Drafting notes<span className="sg-caret">_</span>
                </span>
              </div>
              <div className="sg-skel h-6 w-1/3 mb-6" />
              <div className="space-y-3">
                <div className="sg-skel h-4 w-full" />
                <div className="sg-skel h-4 w-11/12" />
                <div className="sg-skel h-4 w-4/5" />
                <div className="sg-skel h-4 w-full" />
                <div className="sg-skel h-4 w-3/5" />
              </div>
            </section>
          )}

          {/* Result */}
          {notes && !loading && (
            <section className="sg-rise sg-card bg-[#12161D] p-8" style={{ animationDelay: "80ms" }}>
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#262B34]">
                <div className="flex items-baseline gap-3">
                  <h2 className="sg-serif text-2xl font-semibold text-[#ECEEF3]">
                    Generated notes
                  </h2>
                  <span className="sg-mono text-[11px] text-[#7D8494]">/ {topic}</span>
                </div>

                <button
                  onClick={handleCopy}
                  className="sg-copy-btn flex items-center gap-1.5 text-xs font-medium px-3 py-2 sg-mono"
                  style={{ color: copied ? "#22C58B" : "#4C6FFF" }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "COPIED" : "COPY"}
                </button>
              </div>

              <div className="sg-notes-body pt-4">{renderNotes(notes)}</div>
            </section>
          )}

          {!notes && !loading && !error && (
            <p className="sg-rise text-center text-xs sg-mono uppercase tracking-widest text-[#5A6070] py-4" style={{ animationDelay: "80ms" }}>
              Engine idle - standby for input parameters.
            </p>
          )}
        </main>
      </div>
    </div>
  );
}

export default Notes;
