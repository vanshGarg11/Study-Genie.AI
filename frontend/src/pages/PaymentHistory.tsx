import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import {
  Receipt,
  CheckCircle2,
  Clock,
  XCircle,
  Coins,
  Loader2,
} from "lucide-react";
import api from "../services/api";

interface Payment {
  _id: string;
  amount: number;
  coins: number;
  status: string;
  razorpay_payment_id?: string;
  createdAt: string;
}

export default function PaymentHistory() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const res = await api.get("/api/payment/history");
        setPayments(res.data.payments || []);
      } catch {
        // non-blocking
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  return (
    <AppLayout
      title="Payment Receipts & Orders"
      subtitle="Complete ledger of all coin top-up orders and Razorpay invoice records"
      actionButton={
        <button
          onClick={() => navigate("/coins")}
          className="btn-violet flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold"
        >
          <Coins size={14} />
          <span>Buy Coins</span>
        </button>
      }
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {loading ? (
          <div className="h-72 flex items-center justify-center">
            <Loader2 className="animate-spin text-violet-400" size={32} />
          </div>
        ) : payments.length === 0 ? (
          <div className="p-16 rounded-3xl neon-card text-center space-y-4 border-dashed">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-white/[0.03] border border-white/[0.08] text-gray-500 flex items-center justify-center">
              <Receipt size={32} />
            </div>
            <h3 className="text-lg font-bold text-white">No Payment History</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              You haven't completed any coin purchases yet. Recharge your account anytime to generate AI courses.
            </p>
            <button
              onClick={() => navigate("/coins")}
              className="btn-violet px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
            >
              Browse Coin Packages
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((p) => {
              const isSuccess = p.status === "success" || p.status === "completed";
              const isPending = p.status === "pending" || p.status === "created";
              return (
                <div
                  key={p._id}
                  className="p-5 rounded-2xl neon-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-white/[0.08]"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                        isSuccess
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : isPending
                          ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                          : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                      }`}
                    >
                      {isSuccess ? (
                        <CheckCircle2 size={20} />
                      ) : isPending ? (
                        <Clock size={20} />
                      ) : (
                        <XCircle size={20} />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">
                          +{p.coins} Scholar Coins
                        </span>
                        <span
                          className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md ${
                            isSuccess
                              ? "bg-emerald-500/20 text-emerald-300"
                              : isPending
                              ? "bg-amber-500/20 text-amber-300"
                              : "bg-rose-500/20 text-rose-300"
                          }`}
                        >
                          {p.status}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-gray-500 block mt-0.5">
                        {p.razorpay_payment_id || `Order #${p._id.slice(-8)}`} •{" "}
                        {new Date(p.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-lg font-black text-white font-mono block">
                      ₹{p.amount}
                    </span>
                    <span className="text-[10px] font-mono text-gray-500 block">
                      Razorpay Checkout
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
