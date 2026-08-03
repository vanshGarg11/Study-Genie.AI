import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Coins,
  Brain,
  Upload,
  User,
  LogOut,
  Home,
  Sparkles,
  ArrowLeft,
  FileText,
  FolderOpen,
  Search,
  ArrowUpRight,
  Trash2,
} from "lucide-react";
import api from "../services/api";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: Home, index: "01" },
  { label: "Generate Notes", path: "/notes", icon: Brain, index: "02" },
  { label: "Upload PDF", path: "/pdf", icon: Upload, index: "03" },
  { label: "Buy Coins", path: "/coins", icon: Coins, index: "04" },
  { label: "Profile", path: "/profile", icon: User, index: "05" },
];

interface PDF {
  _id: string;
  fileName: string;
  createdAt: string;
}

function MyPDFs() {
  const navigate = useNavigate();
  const location = useLocation();

  const [pdfs, setPdfs] = useState<PDF[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchPDFs = async () => {
    try {
      const res = await api.get("/api/pdf/my-pdfs");
      setPdfs(res.data.pdfs);
    } catch {
      setError("Could not load your PDFs. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const deletePDF = async (pdf: PDF) => {
    const confirmed = window.confirm(
      `Delete "${pdf.fileName}"? This will also remove its chats, lessons, and video lectures.`
    );

    if (!confirmed) return;

    setError("");
    setDeletingId(pdf._id);

    try {
      await api.delete(`/api/pdf/${pdf._id}`);
      setPdfs((prev) => prev.filter((item) => item._id !== pdf._id));
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Could not delete this PDF. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchPDFs();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const filteredPdfs = useMemo(() => {
    if (!query.trim()) return pdfs;
    return pdfs.filter((pdf) =>
      pdf.fileName.toLowerCase().includes(query.trim().toLowerCase())
    );
  }, [pdfs, query]);

  return (
    <div className="sg-root min-h-screen flex font-[Inter] bg-[#0E1116] text-[#ECEEF3] overflow-x-hidden relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap');

        .sg-root { --ink:#0E1116; --line:#262B34; --line-soft:#1B1F27; --muted:#7D8494; --cobalt:#4C6FFF; --amber:#F2B705; }
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
        .sg-rise { opacity:0; animation: riseIn .5s cubic-bezier(.2,.7,.2,1) forwards; }

        @keyframes pulseLine {
          0%, 100% { opacity: .35; }
          50% { opacity: .75; }
        }
        .sg-skel { animation: pulseLine 1.3s ease-in-out infinite; background: #151920; border: 1px solid var(--line); }

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

        .sg-back-btn {
          transition: transform .18s ease, color .18s ease, border-color .18s ease;
        }
        .sg-back-btn:hover {
          transform: translateX(-2px);
          border-color: #3a4150;
          color: #ECEEF3;
        }

        .sg-search {
          border: 1px solid var(--line);
          background: #12161D;
          transition: border-color .18s ease;
        }
        .sg-search:focus-within { border-color: var(--cobalt); }

        .sg-pdf-row {
          border: 1px solid var(--line);
          transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
        }
        .sg-pdf-row:hover {
          transform: translate(-3px,-3px);
          box-shadow: 6px 6px 0 0 rgba(76,111,255,0.3);
          border-color: #3a4150;
        }
        .sg-pdf-row:hover .sg-pdf-arrow {
          transform: translate(2px,-2px);
          color: #6C87FF;
        }
        .sg-pdf-arrow { transition: transform .18s ease, color .18s ease; }

        .sg-open-btn {
          border: 1px solid var(--cobalt);
          color: var(--cobalt);
          transition: background .18s ease, color .18s ease;
        }
        .sg-open-btn:hover {
          background: var(--cobalt);
          color: #fff;
        }

        .sg-btn-logout {
          transition: background .2s ease, color .2s ease, border-color .2s ease, letter-spacing .2s ease;
        }
        .sg-btn-logout:hover { letter-spacing: 0.04em; }

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
            <h2 className="sg-serif text-lg font-semibold text-[#ECEEF3]">My PDFs</h2>
            <span className="sg-mono text-[11px] text-[#7D8494]">/ pdfs</span>
          </div>
        </header>

        <main className="flex-1 p-9 overflow-y-auto space-y-6 sg-rule-bg">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Title + search row */}
            <div className="sg-rise flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ animationDelay: "0ms" }}>
              <div>
                <h1 className="sg-serif text-3xl font-semibold text-[#ECEEF3] leading-tight">
                  My PDFs
                </h1>
                <p className="sg-mono text-xs text-[#7D8494] mt-1">
                  {loading ? "LOADING…" : `${pdfs.length} FILE${pdfs.length === 1 ? "" : "S"} TOTAL`}
                </p>
              </div>

              {!loading && pdfs.length > 0 && (
                <div className="sg-search flex items-center px-3 py-2.5 w-full sm:w-64">
                  <Search size={14} className="text-[#7D8494] shrink-0" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search filenames…"
                    className="ml-2 flex-1 bg-transparent outline-none text-sm sg-mono text-[#ECEEF3] placeholder-[#5A6070]"
                  />
                </div>
              )}
            </div>

            {error && (
              <div className="border border-[#E8556B]/30 bg-[#1A0E10] text-[#E8556B] px-4 py-3 text-sm">
                {error}
              </div>
            )}

            {/* Content */}
            {loading ? (
              <div className="space-y-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="p-6 flex items-center gap-4">
                    <div className="sg-skel w-12 h-12 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="sg-skel h-4 w-2/5" />
                      <div className="sg-skel h-3 w-1/5" />
                    </div>
                    <div className="sg-skel h-9 w-20 shrink-0" />
                  </div>
                ))}
              </div>
            ) : pdfs.length === 0 ? (
              <div className="sg-rise border border-dashed border-[#262B34] p-16 text-center" style={{ animationDelay: "80ms" }}>
                <FolderOpen size={48} className="mx-auto text-[#5A6070]" strokeWidth={1.5} />
                <h2 className="sg-serif text-xl font-semibold text-[#ECEEF3] mt-4">
                  No PDFs uploaded
                </h2>
                <p className="text-[#8B92A3] text-sm mt-1.5 max-w-xs mx-auto">
                  Upload a textbook, paper, or slide deck to start chatting with it.
                </p>
                <button
                  onClick={() => navigate("/pdf")}
                  className="sg-open-btn mt-6 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium sg-mono"
                >
                  UPLOAD A PDF
                </button>
              </div>
            ) : filteredPdfs.length === 0 ? (
              <p className="sg-rise text-center text-sm text-[#7D8494] py-10" style={{ animationDelay: "80ms" }}>
                No files match "{query}".
              </p>
            ) : (
              <div className="space-y-4">
                {filteredPdfs.map((pdf, i) => (
                  <div
                    key={pdf._id}
                    className="sg-rise sg-pdf-row bg-[#12161D] p-6 flex items-center justify-between gap-4 cursor-pointer"
                    style={{ animationDelay: `${80 + i * 50}ms` }}
                    onClick={() => navigate(`/pdf/chat/${pdf._id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") navigate(`/pdf/chat/${pdf._id}`);
                    }}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 border border-[#262B34] flex items-center justify-center bg-[#0E1116] shrink-0">
                        <FileText size={20} className="text-[#F2B705]" strokeWidth={2} />
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-sm font-semibold text-[#ECEEF3] truncate">
                          {pdf.fileName}
                        </h2>
                        <p className="sg-mono text-[11px] text-[#7D8494] mt-1">
                          {new Date(pdf.createdAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }).toUpperCase()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePDF(pdf);
                        }}
                        disabled={deletingId === pdf._id}
                        className="px-3 py-2 text-sm font-medium sg-mono flex items-center gap-1.5 border border-[#E8556B]/40 text-[#E8556B] hover:bg-[#1A0E10] disabled:opacity-50"
                        aria-label={`Delete ${pdf.fileName}`}
                      >
                        <Trash2 size={14} />
                        {deletingId === pdf._id ? "DELETING" : "DELETE"}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/pdf/chat/${pdf._id}`);
                        }}
                        className="sg-open-btn px-5 py-2 text-sm font-medium sg-mono flex items-center gap-1.5"
                      >
                        OPEN <ArrowUpRight size={13} className="sg-pdf-arrow" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default MyPDFs;
