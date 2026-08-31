import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import {
  Brain,
  Sparkles,
  Copy,
  Check,
  Download,
  Trash2,
  Search,
  BookOpen,
  Loader2,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useUser } from "../context/userContextValue";
import toast from "react-hot-toast";

interface StudyNote {
  _id: string;
  topic: string;
  notes?: string;
  content?: string;
  createdAt: string;
}

export default function Notes() {
  const { refreshUser, user } = useUser();
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedNote, setGeneratedNote] = useState<string | null>(null);
  const [activeTopic, setActiveTopic] = useState<string>("");
  const [notesHistory, setNotesHistory] = useState<StudyNote[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);

  const fetchHistory = async () => {
    try {
      const res = await api.get("/api/ai/notes");
      setNotesHistory(res.data.notes || []);
    } catch {
      // non-blocking
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleGenerate = async (targetTopic?: string) => {
    const searchTopic = (targetTopic ?? topic).trim();
    if (!searchTopic) {
      toast.error("Please enter a study topic.");
      return;
    }

    if ((user?.coins ?? 0) < 2) {
      toast.error("You need at least 2 coins to generate study notes.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/api/ai/notes", { topic: searchTopic });
      const text = res.data.notes || res.data.note?.notes || res.data.note?.content || res.data.content;
      setGeneratedNote(text);
      setActiveTopic(searchTopic);
      setTopic("");
      await refreshUser();
      await fetchHistory();
      toast.success("Study notes synthesized successfully!");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to generate notes. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedNote) return;
    navigator.clipboard.writeText(generatedNote);
    setCopied(true);
    toast.success("Notes copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!generatedNote) return;
    const blob = new Blob([generatedNote], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeTopic.toLowerCase().replace(/\s+/g, "-")}-notes.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded Markdown file!");
  };

  const handleDelete = async (noteId: string) => {
    try {
      await api.delete(`/api/ai/notes/${noteId}`);
      toast.success("Note deleted.");
      setNotesHistory((prev) => prev.filter((n) => n._id !== noteId));
      if (activeTopic && notesHistory.find((n) => n._id === noteId)?.topic === activeTopic) {
        setGeneratedNote(null);
        setActiveTopic("");
      }
    } catch {
      toast.error("Could not delete note.");
    }
  };

  const filteredHistory = notesHistory.filter((n) =>
    n.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout
      title="AI Revision Notes"
      subtitle="Synthesize structured exam notes and high-yield summaries (-2 coins)"
      actionButton={
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-violet-400 bg-violet-500/10 border border-violet-500/20 px-3 py-1.5 rounded-xl font-bold">
            2 Coins / Synthesis
          </span>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Topic Input Bar */}
        <div className="p-4 sm:p-6 rounded-3xl neon-card bg-gradient-to-r from-[#0D0F1A] via-[#08090E] to-[#0D0F1A] border border-violet-500/25 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Brain
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400"
              />
              <input
                type="text"
                placeholder="e.g. Quantum Computing, Photosynthesis, French Revolution, React Hooks..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleGenerate();
                }}
                className="input-neon w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm"
              />
            </div>

            <button
              onClick={() => handleGenerate()}
              disabled={loading || !topic.trim()}
              className="btn-violet px-6 py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 cursor-pointer shadow-lg shadow-violet-600/25"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Sparkles size={18} />
              )}
              <span>{loading ? "Synthesizing..." : "Generate Notes"}</span>
            </button>
          </div>
        </div>

        {/* Main Content Layout: History Sidebar + Notes Display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* History Sidebar */}
          <div className="lg:col-span-4 space-y-3">
            <div className="p-4 rounded-2xl neon-card space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <span className="text-xs font-mono uppercase font-bold text-gray-400">
                  Note History
                </span>
                <span className="text-xs font-mono text-violet-400">
                  {notesHistory.length} Saved
                </span>
              </div>

              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  type="text"
                  placeholder="Filter past notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-neon w-full pl-8 pr-3 py-2 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
                {filteredHistory.length === 0 ? (
                  <p className="text-xs text-gray-500 py-6 text-center">
                    No notes found.
                  </p>
                ) : (
                  filteredHistory.map((n) => {
                    const isSelected = activeTopic === n.topic;
                    return (
                      <div
                        key={n._id}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-2 transition-all cursor-pointer group ${
                          isSelected
                            ? "bg-violet-600/20 border-violet-500/40 text-white shadow-sm"
                            : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] text-gray-300"
                        }`}
                        onClick={() => {
                          setGeneratedNote(n.notes || n.content || "");
                          setActiveTopic(n.topic);
                        }}
                      >
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-bold block truncate">
                            {n.topic}
                          </span>
                          <span className="text-[10px] font-mono text-gray-500 flex items-center gap-1 mt-0.5">
                            <Clock size={10} />
                            {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(n._id);
                          }}
                          className="text-gray-500 hover:text-rose-400 p-1 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Generated Note Markdown Stage */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-16 rounded-3xl neon-card text-center space-y-4 min-h-[460px] flex flex-col items-center justify-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-violet-500/15 border border-violet-500/30 text-violet-400 flex items-center justify-center animate-pulse">
                    <Brain size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    Synthesizing High-Yield Notes...
                  </h3>
                  <p className="text-xs text-gray-400 max-w-sm">
                    Gemini AI is structuring concepts, bullet points, exam takeaways, and summaries.
                  </p>
                </motion.div>
              ) : generatedNote ? (
                <motion.div
                  key="note"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 sm:p-10 rounded-3xl neon-card space-y-6"
                >
                  {/* Action Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-violet-400 font-bold block">
                        Active Study Note
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-white capitalize">
                        {activeTopic}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopy}
                        className="btn-ghost flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                      >
                        {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        <span>{copied ? "Copied" : "Copy"}</span>
                      </button>

                      <button
                        onClick={handleDownload}
                        className="btn-cyan flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold"
                      >
                        <Download size={14} />
                        <span>Save .MD</span>
                      </button>
                    </div>
                  </div>

                  {/* Markdown Render Area */}
                  <div className="prose prose-invert max-w-none text-sm text-gray-200 leading-relaxed space-y-4">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {generatedNote}
                    </ReactMarkdown>
                  </div>
                </motion.div>
              ) : (
                <div className="p-16 rounded-3xl neon-card text-center space-y-4 min-h-[460px] flex flex-col items-center justify-center border-dashed">
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-gray-500 flex items-center justify-center">
                    <BookOpen size={28} />
                  </div>
                  <h3 className="text-base font-bold text-white">
                    No note currently open
                  </h3>
                  <p className="text-xs text-gray-400 max-w-sm">
                    Enter a subject above to generate fresh notes or select a previously saved summary from your history.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
