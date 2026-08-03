import { useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Coins,
  FileText,
  Brain,
  Upload,
  User,
  LogOut,
  Home,
  Sparkles,
  ArrowLeft,
  FolderOpen,
  X,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import api from "../services/api";

const MAX_SIZE_MB = 20;
const TEAL = "#14B8A6";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: Home, index: "01" },
  { label: "Generate Notes", path: "/notes", icon: Brain, index: "02" },
  { label: "Upload PDF", path: "/pdf", icon: Upload, index: "03" },
  { label: "Buy Coins", path: "/coins", icon: Coins, index: "04" },
  { label: "Profile", path: "/profile", icon: User, index: "05" },
];

function PDF() {
  const navigate = useNavigate();
  const location = useLocation();

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const validateAndSetFile = (selected: File | null) => {
    setError("");
    setSuccess(false);
    if (!selected) return;

    if (selected.type !== "application/pdf") {
      setError("Only PDF files are supported.");
      return;
    }
    if (selected.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File is too large. Max size is ${MAX_SIZE_MB}MB.`);
      return;
    }
    setFile(selected);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    validateAndSetFile(e.dataTransfer.files?.[0] ?? null);
  };

  const uploadPDF = async () => {
    if (!file) {
      setError("Please select a PDF first.");
      return;
    }

    setError("");
    setSuccess(false);
    setLoading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const res = await api.post("/api/pdf/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (evt) => {
          if (evt.total) {
            setProgress(Math.round((evt.loaded / evt.total) * 100));
          }
        },
      });

      setSuccess(true);
      setFile(null);

      navigate(`/pdf/chat/${res.data.pdf._id}`);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Upload failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="sg-root min-h-screen flex font-[Inter] bg-[#0E1116] text-[#ECEEF3] overflow-x-hidden relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap');

        .sg-root { --ink:#0E1116; --line:#262B34; --line-soft:#1B1F27; --paper:#ECEEF3; --muted:#7D8494; --cobalt:#4C6FFF; --amber:#F2B705; --teal:#14B8A6; }
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
          box-shadow: 6px 6px 0 0 rgba(20,184,166,0.3);
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

        .sg-dropzone {
          border: 2px dashed var(--line);
          transition: border-color .2s ease, background .2s ease;
        }
        .sg-dropzone.dragging {
          border-color: var(--teal);
          background: #0E1F1C;
        }
        .sg-dropzone:not(.dragging):hover {
          border-color: #3a4150;
        }

        .sg-file-row {
          border: 1px solid var(--line);
        }

        .sg-progress-track {
          background: var(--line-soft);
          border: 1px solid var(--line);
        }
        .sg-progress-fill {
          background: var(--teal);
          transition: width .25s ease;
        }

        .sg-btn-upload {
          background: var(--teal);
          color: #06201B;
          transition: transform .18s ease, box-shadow .18s ease;
        }
        .sg-btn-upload:hover:not(:disabled) {
          transform: translate(-2px,-2px);
          box-shadow: 4px 4px 0 0 #151920, 4px 4px 0 1px var(--line);
        }
        .sg-btn-upload:active:not(:disabled) {
          transform: translate(0,0);
          box-shadow: none;
        }

        .sg-remove-btn {
          transition: color .15s ease, transform .15s ease;
        }
        .sg-remove-btn:hover {
          color: #E8556B;
          transform: rotate(90deg);
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
            <h2 className="sg-serif text-lg font-semibold text-[#ECEEF3]">Upload PDF</h2>
            <span className="sg-mono text-[11px] text-[#7D8494]">/ pdf</span>
          </div>

          <button
            onClick={() => navigate("/pdfs")}
            className="sg-back-btn flex items-center gap-2 px-3 py-2 border border-[#262B34] text-sm text-[#7D8494] sg-mono"
          >
            <FolderOpen size={15} />
            MY PDFS
          </button>
        </header>

        <main className="flex-1 p-9 overflow-y-auto space-y-8 sg-rule-bg flex justify-center">
          <div className="max-w-2xl w-full">
            <section className="sg-rise sg-card bg-[#12161D] p-8" style={{ animationDelay: "0ms" }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 border border-[#262B34] flex items-center justify-center bg-[#0E1116] shrink-0">
                  <Upload size={20} style={{ color: TEAL }} strokeWidth={2.2} />
                </div>
                <span
                  className="sg-mono text-[10px] tracking-widest uppercase px-2 py-1 border"
                  style={{ color: TEAL, borderColor: `${TEAL}4D` }}
                >
                  AI / DOCS
                </span>
              </div>

              <h1 className="sg-serif text-3xl font-semibold text-[#ECEEF3] mb-2 leading-tight">
                Upload a PDF
              </h1>
              <p className="text-[#8B92A3] text-sm mb-6 max-w-lg">
                Add your study material and StudyGenie will read it for you.
              </p>

              {/* Dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`sg-dropzone p-10 flex flex-col items-center justify-center text-center cursor-pointer ${
                  isDragging ? "dragging" : ""
                }`}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={(e) => validateAndSetFile(e.target.files?.[0] ?? null)}
                />

                {!file ? (
                  <>
                    <div className="w-12 h-12 border border-[#262B34] flex items-center justify-center mb-4 bg-[#0E1116]">
                      <Upload size={20} className="text-[#7D8494]" />
                    </div>
                    <p className="text-sm font-medium text-[#ECEEF3]">
                      Drag &amp; drop your PDF here, or click to browse
                    </p>
                    <p className="sg-mono text-xs text-[#5A6070] mt-1.5">
                      PDF only, up to {MAX_SIZE_MB}MB
                    </p>
                  </>
                ) : (
                  <div
                    className="sg-file-row w-full flex items-center gap-4 bg-[#0E1116] p-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="w-10 h-10 border border-[#E8556B]/30 flex items-center justify-center shrink-0 bg-[#1A0E10]">
                      <FileText size={16} className="text-[#E8556B]" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-medium truncate text-[#ECEEF3]">{file.name}</p>
                      <p className="sg-mono text-xs text-[#7D8494]">{formatSize(file.size)}</p>
                    </div>
                    {!loading && (
                      <button
                        onClick={() => {
                          setFile(null);
                          setError("");
                        }}
                        aria-label="Remove file"
                        className="sg-remove-btn text-[#7D8494] shrink-0"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {loading && (
                <div className="mt-5">
                  <div className="sg-progress-track h-2 overflow-hidden">
                    <div className="sg-progress-fill h-full" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="sg-mono text-xs text-[#7D8494] mt-1.5">{progress}% UPLOADED</p>
                </div>
              )}

              {error && (
                <div
                  role="alert"
                  className="mt-4 px-4 py-3 text-sm border border-[#E8556B]/30 text-[#E8556B] bg-[#1A0E10]"
                >
                  {error}
                </div>
              )}

              {success && (
                <div
                  className="mt-4 px-4 py-3 text-sm flex items-center gap-2 border"
                  style={{ background: "#0E1F1C", color: TEAL, borderColor: `${TEAL}4D` }}
                >
                  <CheckCircle2 size={16} />
                  PDF uploaded successfully.
                </div>
              )}

              <button
                onClick={uploadPDF}
                disabled={loading || !file}
                className="sg-btn-upload w-full mt-6 py-3 font-semibold text-sm sg-mono flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? "UPLOADING…" : "UPLOAD PDF"}
              </button>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default PDF;
