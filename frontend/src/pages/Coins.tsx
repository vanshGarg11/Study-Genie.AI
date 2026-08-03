import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Coins as CoinsIcon,
  Brain,
  Upload,
  User,
  LogOut,
  Home,
  Sparkles,
  ArrowLeft,
  FolderOpen,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
} from "lucide-react";
import api from "../services/api";

const AMBER = "#F2B705";

const packages = [
  { coins: 100, price: 49 },
  { coins: 250, price: 99 },
  { coins: 500, price: 199 },
  { coins: 1000, price: 349 },
];

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: Home, index: "01" },
  { label: "Generate Notes", path: "/notes", icon: Brain, index: "02" },
  { label: "Upload PDF", path: "/pdf", icon: Upload, index: "03" },
  { label: "Buy Coins", path: "/coins", icon: CoinsIcon, index: "04" },
  { label: "Profile", path: "/profile", icon: User, index: "05" },
];

interface Transaction {
  _id: string;
  type: "credit" | "debit";
  amount: number;
  reason: string;
  createdAt: string;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export default function Coins() {
  const navigate = useNavigate();
  const location = useLocation();

  const [coins, setCoins] = useState(0);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCoins();
  }, []);

  const fetchCoins = async () => {
    try {
      const [balanceRes, historyRes] = await Promise.all([
        api.get("/api/coins/balance"),
        api.get("/api/coins/history"),
      ]);
      setCoins(balanceRes.data.coins);
      setHistory(historyRes.data.history);
    } catch {
      setError("Could not load your coin balance. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const buyCoins = async (coins: number) => {
    setError("");

    if (!window.Razorpay) {
      setError("Payment checkout is not loaded. Please refresh and try again.");
      return;
    }

    try {
      const { data } = await api.post("/api/payment/create-order", { coins });

      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: data.order.currency,
        order_id: data.order.id,
        name: "StudyGenie",
        description: `${coins} Coins`,

        handler: async (response: any) => {
          await api.post("/api/payment/verify", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          await fetchCoins();

          alert("Coins added successfully!");
        },

        theme: {
          color: "#4C6FFF",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch {
      setError("Could not start payment. Please try again.");
    }
  };

  return (
    <div className="sg-root min-h-screen flex font-[Inter] bg-[#0E1116] text-[#ECEEF3] overflow-x-hidden relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap');

        .sg-root { --ink:#0E1116; --line:#262B34; --line-soft:#1B1F27; --muted:#7D8494; --cobalt:#4C6FFF; --amber:#F2B705; --green:#22C58B; --coral:#E8556B; }
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

        .sg-balance-card {
          border: 1px solid var(--amber);
          background: #12161D;
        }

        .sg-txn-row {
          border: 1px solid var(--line);
          transition: transform .16s ease, box-shadow .16s ease, border-color .16s ease;
        }
        .sg-txn-row:hover {
          transform: translate(-2px,-2px);
          box-shadow: 4px 4px 0 0 rgba(242,183,5,0.2);
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
            onClick={() => navigate("/dashboard")}
            className="sg-back-btn flex items-center gap-2 px-3 py-2 border border-[#262B34] text-sm text-[#7D8494] sg-mono"
          >
            <ArrowLeft size={15} />
            BACK
          </button>

          <div className="flex items-baseline gap-3">
            <h2 className="sg-serif text-lg font-semibold text-[#ECEEF3]">Coin Wallet</h2>
            <span className="sg-mono text-[11px] text-[#7D8494]">/ coins</span>
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
          <div className="max-w-3xl mx-auto space-y-8">
            {loading ? (
              <>
                <div className="sg-skel h-32" />
                <div className="space-y-3">
                  <div className="sg-skel h-16" />
                  <div className="sg-skel h-16" />
                  <div className="sg-skel h-16" />
                </div>
              </>
            ) : (
              <>
                {error && (
                  <div className="sg-rise border border-[#E8556B]/50 bg-[#1A0E10] px-4 py-3 text-sm text-[#E8556B]">
                    {error}
                  </div>
                )}

                {/* Balance card */}
                <section className="sg-rise sg-balance-card p-8" style={{ animationDelay: "0ms" }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 border border-[#262B34] flex items-center justify-center bg-[#0E1116]">
                      <Wallet size={20} style={{ color: AMBER }} strokeWidth={2.2} />
                    </div>
                    <span
                      className="sg-mono text-[10px] tracking-widest uppercase px-2 py-1 border"
                      style={{ color: AMBER, borderColor: `${AMBER}4D` }}
                    >
                      WALLET
                    </span>
                  </div>
                  <p className="sg-mono text-xs uppercase tracking-[0.2em] text-[#7D8494] mb-2">
                    Current Balance
                  </p>
                  <div className="flex items-baseline gap-3">
                    <CoinsIcon size={32} style={{ color: AMBER }} strokeWidth={2} />
                    <h1 className="sg-mono text-5xl font-bold text-[#ECEEF3] tabular-nums">
                      {coins}
                    </h1>
                  </div>
                </section>

                {/* Coin packages */}
                <section className="space-y-4">
                  <div className="sg-rise flex items-center gap-3" style={{ animationDelay: "40ms" }}>
                    <span className="sg-mono text-[10px] uppercase tracking-[0.2em] text-[#7D8494]">
                      Buy More Coins
                    </span>
                    <span className="flex-1 border-t border-[#262B34]" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {packages.map((pkg, i) => (
                      <div
                        key={pkg.coins}
                        className="sg-rise sg-txn-row bg-[#12161D] p-6"
                        style={{ animationDelay: `${80 + i * 40}ms` }}
                      >
                        <CoinsIcon size={30} style={{ color: AMBER }} className="mb-3" strokeWidth={2} />

                        <h2 className="sg-mono text-2xl font-bold text-[#ECEEF3]">
                          {pkg.coins} Coins
                        </h2>

                        <p className="sg-mono text-sm text-[#7D8494] mt-1.5">
                          ₹{pkg.price}
                        </p>

                        <button
                          onClick={() => buyCoins(pkg.coins)}
                          className="mt-5 w-full bg-[#4C6FFF] hover:bg-[#3b5de7] py-3 text-sm font-semibold sg-mono text-white transition-colors duration-200"
                        >
                          BUY NOW
                        </button>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Transaction history */}
                <section className="space-y-4">
                  <div className="sg-rise flex items-center gap-3" style={{ animationDelay: "80ms" }}>
                    <span className="sg-mono text-[10px] uppercase tracking-[0.2em] text-[#7D8494]">
                      Transaction History
                    </span>
                    <span className="flex-1 border-t border-[#262B34]" />
                  </div>

                  {history.length === 0 ? (
                    <div
                      className="sg-rise border border-dashed border-[#262B34] p-10 text-center"
                      style={{ animationDelay: "120ms" }}
                    >
                      <p className="text-sm text-[#8B92A3]">No transactions yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {history.map((item, i) => (
                        <div
                          key={item._id}
                          className="sg-rise sg-txn-row bg-[#12161D] p-4 flex items-center justify-between gap-4"
                          style={{ animationDelay: `${120 + i * 40}ms` }}
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div
                              className="w-9 h-9 border flex items-center justify-center shrink-0"
                              style={{
                                borderColor: item.type === "credit" ? "#22C58B4D" : "#E8556B4D",
                                background: item.type === "credit" ? "#0E1F1C" : "#1A0E10",
                              }}
                            >
                              {item.type === "credit" ? (
                                <ArrowDownRight size={16} className="text-[#22C58B]" />
                              ) : (
                                <ArrowUpRight size={16} className="text-[#E8556B]" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-sm font-semibold text-[#ECEEF3] truncate">
                                {item.reason}
                              </h3>
                              <p className="sg-mono text-[11px] text-[#7D8494] mt-0.5">
                                {new Date(item.createdAt)
                                  .toLocaleString(undefined, {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                  .toUpperCase()}
                              </p>
                            </div>
                          </div>
                          <div
                            className="sg-mono text-lg font-bold shrink-0"
                            style={{ color: item.type === "credit" ? "#22C58B" : "#E8556B" }}
                          >
                            {item.type === "credit" ? "+" : "-"}
                            {item.amount}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
