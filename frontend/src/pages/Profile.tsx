import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import {
  User,
  Mail,
  Key,
  Lock,
  Loader2,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useUser } from "../context/userContextValue";
import api from "../services/api";
import toast from "react-hot-toast";

export default function Profile() {
  const navigate = useNavigate();
  const { user, refreshUser } = useUser();

  const [name, setName] = useState(user?.name || "");
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name cannot be empty.");
      return;
    }

    setUpdatingProfile(true);
    try {
      await api.put("/api/user/profile", { name: name.trim() });
      await refreshUser();
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Could not update profile name.");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error("Please enter your current and new password.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setUpdatingPassword(true);
    try {
      await api.put("/api/user/change-password", {
        currentPassword,
        newPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password changed successfully!");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to update password. Verify current password."
      );
    } finally {
      setUpdatingPassword(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <AppLayout
      title="Scholar Profile & Security"
      subtitle="Manage your credentials, academic identity, and account security settings"
      actionButton={
        <button
          onClick={logout}
          className="btn-ghost flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-400 border-rose-500/20"
        >
          <LogOut size={13} />
          <span>Sign Out</span>
        </button>
      }
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* User Card Hero */}
        <div className="p-6 sm:p-8 rounded-3xl neon-card bg-gradient-to-r from-violet-950/50 via-[#0D0F1A] to-cyan-950/30 border border-violet-500/30 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center text-white font-black text-2xl uppercase shadow-xl shadow-violet-600/30 shrink-0">
              {user?.name?.charAt(0) || "U"}
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white">{user?.name || "Student"}</h2>
              <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
                <Mail size={13} className="text-violet-400" />
                <span>{user?.email}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.08] text-center min-w-[140px]">
            <span className="text-[10px] font-mono uppercase text-gray-400 block">
              Wallet Balance
            </span>
            <span className="text-2xl font-mono font-black text-amber-400">
              {user?.coins ?? 0}
            </span>
            <span className="text-[10px] text-gray-400 block mt-0.5">Coins</span>
          </div>
        </div>

        {/* 2-Column Settings Form: Personal Info & Security */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Info */}
          <div className="p-6 sm:p-8 rounded-3xl neon-card space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
              <User size={18} className="text-violet-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Personal Information
              </h3>
            </div>

            <form onSubmit={handleUpdateName} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                  Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-neon w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                  Registered Email
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ""}
                  className="input-neon w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm opacity-50 cursor-not-allowed bg-black/30"
                />
              </div>

              <button
                type="submit"
                disabled={updatingProfile}
                className="btn-violet w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {updatingProfile ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Sparkles size={14} />
                )}
                <span>Save Profile Changes</span>
              </button>
            </form>
          </div>

          {/* Security / Password */}
          <div className="p-6 sm:p-8 rounded-3xl neon-card space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
              <Key size={18} className="text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Change Password
              </h3>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="input-neon w-full px-4 py-2 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-neon w-full px-4 py-2 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-neon w-full px-4 py-2 rounded-xl text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={updatingPassword}
                className="btn-cyan w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-2"
              >
                {updatingPassword ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Lock size={14} />
                )}
                <span>Update Password</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
