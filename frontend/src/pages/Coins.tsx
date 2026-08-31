import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import {
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  CheckCircle2,
  CreditCard,
  Loader2,
  Coins,
} from "lucide-react";
import Counter from "../components/Counter";
import api from "../services/api";
import { useUser } from "../context/userContextValue";
import toast from "react-hot-toast";

const packages = [
  {
    id: "starter",
    name: "Scholar Starter",
    coins: 50,
    price: 49,
    popular: false,
    tagline: "Great for quick exam chapter revision",
    features: [
      "25 Full AI Note Syntheses",
      "16 Interactive 3D Flashcard Decks",
      "16 MCQ Quiz Arena Assessments",
      "Instant PDF Document Grounding",
      "Standard Response Priority",
    ],
  },
  {
    id: "scholar",
    name: "Semester Pro",
    coins: 200,
    price: 149,
    popular: true,
    tagline: "Most popular choice for active college students",
    features: [
      "100 Full AI Note Syntheses",
      "66 Interactive 3D Flashcard Decks",
      "66 MCQ Quiz Arena Assessments",
      "Full Multi-Slide Course Lesson Generator",
      "Live2D Interactive Teacher Lectures",
      "Fast-Track GPU Generation Priority",
    ],
  },
  {
    id: "master",
    name: "Master Suite",
    coins: 500,
    price: 299,
    popular: false,
    tagline: "Uncapped power for full academic year mastery",
    features: [
      "250 Full AI Note Syntheses",
      "166 Interactive 3D Flashcard Decks",
      "166 MCQ Quiz Arena Assessments",
      "Unlimited Multi-Slide Course Generation",
      "Unlimited Live2D Interactive Lectures",
      "VIP Dedicated GPU Priority",
      "Never Expiring Coin Ledger Balance",
    ],
  },
];

interface Transaction {
  _id: string;
  amount: number;
  coins: number;
  type: "credit" | "debit";
  description: string;
  createdAt: string;
}

export default function CoinsPage() {
  const navigate = useNavigate();
  const { user, refreshUser } = useUser();
  const [loadingPkg, setLoadingPkg] = useState<string | null>(null);
  const [history, setHistory] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get("/api/user/ledger");
        setHistory(res.data.transactions || []);
      } catch {
        // non-blocking
      }
    };
    fetchHistory();
  }, []);

  const handlePurchase = async (pkg: typeof packages[0]) => {
    if (!localStorage.getItem("token")) {
      toast.error("Please login or register to purchase coin packages.");
      navigate("/login");
      return;
    }
    setLoadingPkg(pkg.id);
    try {
      const res = await api.post("/api/payment/create-order", {
        packageId: pkg.id,
        amount: pkg.price,
        coins: pkg.coins,
      });

      const order = res.data.order;

      const options = {
        key: res.data.key || "rzp_test_TE2wUyVmLYKPS2",
        amount: order.amount,
        currency: order.currency,
        name: "StudyGenie AI",
        description: `${pkg.coins} Scholar Coins Pack`,
        order_id: order.id,
        handler: async (response: any) => {
          try {
            await api.post("/api/payment/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              packageId: pkg.id,
              coins: pkg.coins,
              amount: pkg.price,
            });
            await refreshUser();
            toast.success(`Success! +${pkg.coins} coins added to your wallet.`);
          } catch {
            toast.error("Payment verification failed.");
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: {
          color: "#8B5CF6",
        },
      };

      const razorpayInstance = new (window as any).Razorpay(options);
      razorpayInstance.open();
    } catch {
      toast.error("Failed to initialize payment gateway.");
    } finally {
      setLoadingPkg(null);
    }
  };

  return (
    <AppLayout
      title="Coin Wallet & Top-Up"
      subtitle="Power your AI notes, 3D flashcards, and interactive Live2D classroom lectures"
      actionButton={
        <button
          onClick={() => navigate("/payments")}
          className="btn-ghost flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold"
        >
          <Receipt size={14} />
          <span>Payment Receipts</span>
        </button>
      }
    >
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Coin Balance Hero Widget */}
        <div className="p-8 sm:p-12 rounded-3xl neon-card bg-gradient-to-r from-violet-950/60 via-[#0D0F1A] to-cyan-950/40 border border-violet-500/30 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full badge-violet text-xs font-mono font-semibold">
              <Sparkles size={13} />
              <span>Instant AI Computation Power</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Recharge Your Learning Engine
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 max-w-lg">
              Coins are only consumed when generating fresh notes (-2), flashcard decks (-3), or custom AI quiz arenas (-3).
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-black/60 border border-violet-500/40 text-center min-w-[200px] glow-violet">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-2">
              <Coins size={24} />
            </div>
            <span className="text-[10px] font-mono uppercase text-gray-400 block tracking-widest">
              Available Balance
            </span>
            <span className="text-4xl font-mono font-black text-amber-400">
              <Counter end={user?.coins ?? 0} />
            </span>
            <span className="text-[11px] text-gray-400 block mt-1">
              Coins Active
            </span>
          </div>
        </div>

        {/* 3 Pricing Packages */}
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <h3 className="text-xl font-extrabold text-white">
              Choose Your Coin Package
            </h3>
            <p className="text-xs text-gray-400">
              Secure payments powered by Razorpay checkout
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`p-6 sm:p-8 rounded-3xl neon-card flex flex-col justify-between space-y-6 relative transition-all ${
                  pkg.popular
                    ? "border-violet-500/60 bg-gradient-to-b from-[#16132E] to-[#0D0F1A] glow-violet-lg scale-[1.02]"
                    : "border-white/[0.08]"
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-mono text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-violet-600/30">
                    Most Popular Choice
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-bold text-white">{pkg.name}</h4>
                    <p className="text-xs text-gray-400 mt-1">{pkg.tagline}</p>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-black text-white font-mono">
                      ₹{pkg.price}
                    </span>
                    <span className="text-xs text-violet-400 font-mono font-bold">
                      / {pkg.coins} Coins
                    </span>
                  </div>

                  <div className="space-y-2.5 pt-4 border-t border-white/[0.06]">
                    {pkg.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-gray-300">
                        <CheckCircle2 size={15} className="text-cyan-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handlePurchase(pkg)}
                  disabled={loadingPkg === pkg.id}
                  className={`w-full py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    pkg.popular
                      ? "btn-violet shadow-lg shadow-violet-600/30"
                      : "btn-cyan"
                  }`}
                >
                  {loadingPkg === pkg.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <CreditCard size={15} />
                  )}
                  <span>
                    {loadingPkg === pkg.id ? "Connecting Razorpay..." : `Purchase ${pkg.coins} Coins`}
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Coin Activity List */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Recent Coin Ledger
            </h3>
            <button
              onClick={() => navigate("/payments")}
              className="text-xs text-violet-400 hover:text-cyan-300 font-mono font-semibold cursor-pointer"
            >
              Full Invoices →
            </button>
          </div>

          {history.length === 0 ? (
            <div className="p-8 rounded-2xl neon-card text-center text-xs text-gray-500">
              No recent coin transactions recorded.
            </div>
          ) : (
            <div className="space-y-2">
              {history.slice(0, 5).map((t) => {
                const isCredit = t.type === "credit";
                return (
                  <div
                    key={t._id}
                    className="p-4 rounded-2xl neon-card flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isCredit
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : "bg-violet-500/15 text-violet-400 border border-violet-500/30"
                        }`}
                      >
                        {isCredit ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">
                          {t.description || (isCredit ? "Wallet Top-up" : "AI Feature Consumption")}
                        </span>
                        <span className="text-[10px] font-mono text-gray-500 block">
                          {new Date(t.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-sm font-mono font-bold ${
                        isCredit ? "text-emerald-400" : "text-violet-400"
                      }`}
                    >
                      {isCredit ? `+${t.coins}` : `-${t.coins}`} Coins
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
