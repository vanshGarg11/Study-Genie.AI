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
  FolderOpen,
  Mail,
  Receipt,
  ArrowUpRight,
} from "lucide-react";
import { useUser } from "../context/userContextValue";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: Home, index: "01" },
  { label: "Generate Notes", path: "/notes", icon: Brain, index: "02" },
  { label: "Upload PDF", path: "/pdf", icon: Upload, index: "03" },
  { label: "Buy Coins", path: "/coins", icon: Coins, index: "04" },
  { label: "Profile", path: "/profile", icon: User, index: "05" },
];

const quickLinks = [
  {
    label: "Buy Coins",
    description: "Check your balance and top up your wallet.",
    path: "/coins",
    icon: Coins,
    tag: "WALLET",
  },
  {
    label: "Payment History",
    description: "Review past coin purchases and their status.",
    path: "/payments",
    icon: Receipt,
    tag: "BILLING",
  },
  {
    label: "My PDFs",
    description: "Browse everything you've uploaded so far.",
    path: "/pdfs",
    icon: FolderOpen,
    tag: "LIBRARY",
  },
];

function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const initial = user?.name?.charAt(0).toUpperCase() || "U";

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

        .sg-card { border: 1px solid var(--line); }

        .sg-avatar-lg {
          border: 2px solid var(--cobalt);
          background: #12161D;
        }

        .sg-link-card {
          border: 1px solid var(--line);
          transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
        }
        .sg-link-card:hover {
          transform: translate(-3px,-3px);
          box-shadow: 6px 6px 0 0 #1c212b, 6px 6px 0 1px var(--line);
          border-color: #3a4150;
        }
        .sg-link-card:hover .sg-link-arrow {
          transform: translate(2px,-2px);
          color: #6C87FF;
        }
        .sg-link-arrow { transition: transform .18s ease, color .18s ease; }

        .sg-btn-logout-lg {
          border: 1px solid #2A1A1D;
          color: #E8556B;
          transition: background .2s ease, color .2s ease, border-color .2s ease, letter-spacing .2s ease;
        }
        .sg-btn-logout-lg:hover {
          letter-spacing: 0.04em;
          border-color: rgba(232,85,107,0.4);
          background: #1A0E10;
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
            <h2 className="sg-serif text-lg font-semibold text-[#ECEEF3]">Profile</h2>
            <span className="sg-mono text-[11px] text-[#7D8494]">/ profile</span>
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
          <div className="max-w-2xl mx-auto space-y-8">
            {/* Identity card */}
            <section className="sg-rise sg-card bg-[#12161D] p-8" style={{ animationDelay: "0ms" }}>
              <div className="flex items-center gap-5">
                <div className="sg-avatar-lg w-16 h-16 flex items-center justify-center shrink-0">
                  <span className="sg-serif text-2xl font-semibold text-[#ECEEF3]">
                    {initial}
                  </span>
                </div>
                <div className="min-w-0">
                  <h1 className="sg-serif text-2xl font-semibold text-[#ECEEF3] truncate">
                    {user?.name || "Scholar"}
                  </h1>
                  <div className="flex items-center gap-1.5 mt-1.5 text-[#8B92A3] text-sm">
                    <Mail size={13} className="shrink-0" />
                    <span className="truncate">{user?.email || "—"}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-6 pt-6 border-t border-[#262B34]">
                <div className="flex items-center gap-2 px-4 py-2.5 border border-[#F2B705]/30 bg-[#0E1116]">
                  <Coins size={16} className="text-[#F2B705]" />
                  <span className="sg-mono text-sm font-semibold text-[#ECEEF3]">
                    {user ? user.coins : "--"}
                  </span>
                  <span className="sg-mono text-[10px] uppercase tracking-widest text-[#7D8494]">
                    Coins
                  </span>
                </div>
              </div>
            </section>

            {/* Quick links */}
            <section className="space-y-4">
              <div className="sg-rise flex items-center gap-3" style={{ animationDelay: "80ms" }}>
                <span className="sg-mono text-[10px] uppercase tracking-[0.2em] text-[#7D8494]">
                  Account
                </span>
                <span className="flex-1 border-t border-[#262B34]" />
              </div>

              <div className="space-y-3">
                {quickLinks.map(({ label, description, path, icon: Icon, tag }, i) => (
                  <div
                    key={path}
                    onClick={() => navigate(path)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") navigate(path);
                    }}
                    className="sg-rise sg-link-card bg-[#12161D] p-5 cursor-pointer flex items-center justify-between gap-4"
                    style={{ animationDelay: `${120 + i * 50}ms` }}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-11 h-11 border border-[#262B34] flex items-center justify-center bg-[#0E1116] shrink-0">
                        <Icon size={18} className="text-[#4C6FFF]" strokeWidth={2} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-[#ECEEF3]">{label}</h3>
                          <span className="sg-mono text-[9px] tracking-widest text-[#5A6070]">
                            {tag}
                          </span>
                        </div>
                        <p className="text-[#8B92A3] text-xs mt-0.5 truncate">{description}</p>
                      </div>
                    </div>
                    <ArrowUpRight size={16} className="sg-link-arrow text-[#4C6FFF] shrink-0" />
                  </div>
                ))}
              </div>
            </section>

            {/* Danger zone */}
            <section className="space-y-4">
              <div className="sg-rise flex items-center gap-3" style={{ animationDelay: "280ms" }}>
                <span className="sg-mono text-[10px] uppercase tracking-[0.2em] text-[#7D8494]">
                  Session
                </span>
                <span className="flex-1 border-t border-[#262B34]" />
              </div>

              <button
                onClick={logout}
                className="sg-rise sg-btn-logout-lg w-full flex items-center justify-center gap-2 py-3 text-sm font-medium sg-mono"
                style={{ animationDelay: "320ms" }}
              >
                <LogOut size={16} />
                LOG OUT OF STUDYGENIE
              </button>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Profile;
