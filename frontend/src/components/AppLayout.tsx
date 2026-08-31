import { type ReactNode, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Home,
  Brain,
  Layers,
  Trophy,
  Upload,
  FolderOpen,
  BookOpenCheck,
  Coins,
  User,
  LogOut,
  Sparkles,
  Menu,
  PlusCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "../context/userContextValue";
import { Toaster } from "react-hot-toast";

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actionButton?: ReactNode;
}

const navSections = [
  {
    heading: "STUDY TOOLS",
    items: [
      { label: "Dashboard", path: "/dashboard", icon: Home },
      { label: "AI Notes", path: "/notes", icon: Brain, badge: "AI" },
      { label: "Flashcards", path: "/flashcards", icon: Layers, badge: "3D" },
      { label: "Quiz Arena", path: "/quiz", icon: Trophy, badge: "Arena" },
    ],
  },
  {
    heading: "LIBRARY",
    items: [
      { label: "Upload PDF", path: "/pdf", icon: Upload },
      { label: "My Library", path: "/pdfs", icon: FolderOpen },
      { label: "My Lessons", path: "/lessons", icon: BookOpenCheck },
    ],
  },
  {
    heading: "ACCOUNT",
    items: [
      { label: "Coin Wallet", path: "/coins", icon: Coins },
      { label: "Profile", path: "/profile", icon: User },
    ],
  },
];

export default function AppLayout({
  children,
  title,
  subtitle,
  actionButton,
}: AppLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const isActive = (path: string) => {
    if (path === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(path);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full justify-between p-5 select-none">
      <div className="space-y-6">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 px-2 group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-violet-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-violet-600/30 group-hover:scale-105 transition-transform duration-300">
            <Sparkles size={20} />
          </div>
          <div>
            <span className="text-lg font-extrabold text-white tracking-tight leading-none block">
              Study<span className="text-gradient-vc">Genie</span>
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-violet-400/80 block mt-0.5">
              AI Study Suite
            </span>
          </div>
        </Link>

        {/* User Coin Balance Widget */}
        <Link
          to="/coins"
          className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-violet-950/40 via-[#0D0F1A] to-cyan-950/30 border border-violet-500/20 hover:border-violet-500/40 transition-all group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:rotate-12 transition-transform">
              <Coins size={16} />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-gray-400 block leading-tight">
                Coin Balance
              </span>
              <span className="text-sm font-mono font-bold text-white leading-tight">
                {user?.coins ?? 0}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-violet-400 group-hover:text-cyan-300 transition-colors">
            <span>Add</span>
            <PlusCircle size={14} />
          </div>
        </Link>

        {/* Nav Sections */}
        <nav className="space-y-6">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 px-3 block">
                {section.heading}
              </span>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const active = isActive(item.path);
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setMobileDrawerOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        active
                          ? "bg-violet-600/15 border border-violet-500/30 text-violet-300 shadow-md shadow-violet-600/10"
                          : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.03] border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          size={16}
                          className={active ? "text-violet-400" : "text-gray-400"}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md font-bold ${
                            active
                              ? "bg-violet-500/30 text-violet-200"
                              : "bg-white/[0.04] text-gray-400"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* User Footer Profile & Logout */}
      <div className="pt-4 border-t border-white/[0.06] space-y-3">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xs uppercase shrink-0 shadow-md shadow-violet-600/20">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-white block truncate leading-tight">
                {user?.name || "Student"}
              </span>
              <span className="text-[10px] text-gray-400 block truncate leading-tight">
                {user?.email || "scholar@studygenie.ai"}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/15 transition-all cursor-pointer"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#050507] text-[#F1F5F9] font-sans antialiased overflow-hidden">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#0D0F1A",
            color: "#F1F5F9",
            border: "1px solid rgba(139, 92, 246, 0.3)",
            borderRadius: "14px",
            fontSize: "13px",
          },
        }}
      />

      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col shrink-0 bg-[#08090E] border-r border-white/[0.06] z-30 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileDrawerOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 240 }}
              className="fixed inset-y-0 left-0 w-72 bg-[#08090E] border-r border-white/[0.08] z-50 lg:hidden"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-[#050507] relative">
        {/* Top Header Navbar */}
        <header className="h-16 shrink-0 sticky top-0 z-20 flex items-center justify-between px-4 sm:px-8 bg-[#050507]/80 backdrop-blur-xl border-b border-white/[0.06]">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray-300 hover:text-white"
            >
              <Menu size={18} />
            </button>

            <div className="min-w-0">
              {title && (
                <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight truncate leading-tight">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-[11px] sm:text-xs text-gray-400 truncate leading-tight">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {actionButton}
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
