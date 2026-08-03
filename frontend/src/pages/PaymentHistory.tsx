import { useEffect, useState } from "react";
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
  Receipt,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import api from "../services/api";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: Home, index: "01" },
  { label: "Generate Notes", path: "/notes", icon: Brain, index: "02" },
  { label: "Upload PDF", path: "/pdf", icon: Upload, index: "03" },
  { label: "Buy Coins", path: "/coins", icon: Coins, index: "04" },
  { label: "Profile", path: "/profile", icon: User, index: "05" },
];

interface Payment {
  _id: string;
  amount: number;
  coins: number;
  status: string;
  orderId: string;
  paymentId: string;
  createdAt: string;
}

const statusStyles: Record<string, { color: string; bg: string; icon: any }> = {
  success: { color: "#22C58B", bg: "#0E1F1C", icon: CheckCircle2 },
  paid: { color: "#22C58B", bg: "#0E1F1C", icon: CheckCircle2 },
  completed: { color: "#22C58B", bg: "#0E1F1C", icon: CheckCircle2 },
  pending: { color: "#F2B705", bg: "#1F1A0E", icon: Clock },
  failed: { color: "#E8556B", bg: "#1A0E10", icon: XCircle },
};

function getStatusStyle(status: string) {
  return statusStyles[status?.toLowerCase()] || statusStyles.pending;
}

export default function PaymentHistory() {
  const navigate = useNavigate();
  const location = useLocation();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await api.get("/api/payment/history");
      setPayments(res.data.payments);
    } catch {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

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

        .sg-payment-row {
          border: 1px solid var(--line);
          transition: transform .16s ease, box-shadow .16s ease, border-color .16s ease;
        }
        .sg-payment-row:hover {
          transform: translate(-2px,-2px);
          box-shadow: 4px 4px 0 0 rgba(76,111,255,0.2);
          border-color: #3a4150;
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
            onClick={() => navigate("/coins")}
            className="sg-back-btn flex items-center gap-2 px-3 py-2 border border-[#262B34] text-sm text-[#7D8494] sg-mono"
          >
            <ArrowLeft size={15} />
            BACK
          </button>

          <div className="flex items-baseline gap-3">
            <h2 className="sg-serif text-lg font-semibold text-[#ECEEF3]">Payment History</h2>
            <span className="sg-mono text-[11px] text-[#7D8494]">/ payments</span>
          </div>

          <button
            onClick={() => navigate("/pdfs")}
            className="sg-back-btn flex items-center gap-2 px-3 py-2 border border-[#262B34] text-sm text-[#7D8494] sg-mono"
          >
            <FolderOpen size={15} />
            MY PDFS
          </button>
        </header>

        <main className="flex-1 p-9 overflow-y-auto space-y-6 sg-rule-bg">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="sg-rise flex items-center gap-3" style={{ animationDelay: "0ms" }}>
              <span className="sg-mono text-[10px] uppercase tracking-[0.2em] text-[#7D8494]">
                {loading ? "LOADING…" : `${payments.length} PAYMENT${payments.length === 1 ? "" : "S"}`}
              </span>
              <span className="flex-1 border-t border-[#262B34]" />
            </div>

            {loading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="sg-skel h-20" />
                ))}
              </div>
            ) : payments.length === 0 ? (
              <div
                className="sg-rise border border-dashed border-[#262B34] p-16 text-center"
                style={{ animationDelay: "80ms" }}
              >
                <Receipt size={40} className="mx-auto text-[#5A6070]" strokeWidth={1.5} />
                <h2 className="sg-serif text-xl font-semibold text-[#ECEEF3] mt-4">
                  No payments yet
                </h2>
                <p className="text-[#8B92A3] text-sm mt-1.5">
                  Your coin purchases will show up here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map((payment, i) => {
                  const style = getStatusStyle(payment.status);
                  const StatusIcon = style.icon;
                  return (
                    <div
                      key={payment._id}
                      className="sg-rise sg-payment-row bg-[#12161D] p-5 flex items-center justify-between gap-4"
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div
                          className="w-11 h-11 border flex items-center justify-center shrink-0"
                          style={{ borderColor: `${style.color}4D`, background: style.bg }}
                        >
                          <StatusIcon size={18} style={{ color: style.color }} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-baseline gap-2">
                            <h3 className="sg-mono text-lg font-bold text-[#ECEEF3]">
                              ₹{payment.amount}
                            </h3>
                            <span className="text-sm text-[#8B92A3]">
                              &middot; {payment.coins} Coins
                            </span>
                          </div>
                          <p className="sg-mono text-[11px] text-[#7D8494] mt-1 truncate">
                            {payment.paymentId || payment.orderId}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className="sg-mono text-[10px] tracking-widest uppercase px-2 py-1 border inline-block"
                          style={{ color: style.color, borderColor: `${style.color}4D` }}
                        >
                          {payment.status}
                        </span>
                        <p className="sg-mono text-[11px] text-[#7D8494] mt-2">
                          {new Date(payment.createdAt)
                            .toLocaleString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                            .toUpperCase()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
