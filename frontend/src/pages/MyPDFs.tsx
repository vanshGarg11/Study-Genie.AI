import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import {
  FileText,
  Search,
  Trash2,
  Upload,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import api from "../services/api";
import toast from "react-hot-toast";

interface PDFItem {
  _id: string;
  fileName: string;
  createdAt: string;
}

export default function MyPDFs() {
  const navigate = useNavigate();
  const [pdfs, setPdfs] = useState<PDFItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchPDFs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/pdf");
      setPdfs(res.data.pdfs || []);
    } catch {
      toast.error("Could not fetch document library.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPDFs();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/pdf/${id}`);
      setPdfs((prev) => prev.filter((p) => p._id !== id));
      toast.success("Document removed from library.");
      setDeletingId(null);
    } catch {
      toast.error("Failed to delete PDF.");
    }
  };

  const filtered = useMemo(() => {
    return pdfs.filter((p) =>
      p.fileName.toLowerCase().includes(search.toLowerCase())
    );
  }, [pdfs, search]);

  return (
    <AppLayout
      title="My Document Library"
      subtitle={`${pdfs.length} Indexed PDF materials ready for AI chat and lesson generation`}
      actionButton={
        <button
          onClick={() => navigate("/pdf")}
          className="btn-violet flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer"
        >
          <Upload size={14} />
          <span>Upload PDF</span>
        </button>
      }
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full max-w-md">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              placeholder="Search documents by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-neon w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs"
            />
          </div>

          <span className="text-xs font-mono text-gray-400">
            Showing {filtered.length} of {pdfs.length} files
          </span>
        </div>

        {/* Documents Grid */}
        {loading ? (
          <div className="h-72 flex items-center justify-center">
            <Loader2 className="animate-spin text-violet-400" size={32} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 rounded-3xl neon-card text-center space-y-4 border-dashed">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-white/[0.03] border border-white/[0.08] text-gray-500 flex items-center justify-center">
              <FileText size={32} />
            </div>
            <h3 className="text-lg font-bold text-white">
              {search ? "No matching documents" : "Your Library is Empty"}
            </h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              Upload your textbook chapters, lecture slides, or revision notes to chat with them interactively.
            </p>
            <button
              onClick={() => navigate("/pdf")}
              className="btn-violet px-6 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
            >
              Upload Document
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((pdf, idx) => (
              <motion.div
                key={pdf._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="p-5 rounded-3xl neon-card flex flex-col justify-between space-y-4 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-violet-500/15 border border-violet-500/30 text-violet-400 flex items-center justify-center shrink-0">
                    <FileText size={22} />
                  </div>

                  <button
                    onClick={() => setDeletingId(pdf._id)}
                    className="text-gray-500 hover:text-rose-400 p-1.5 transition-colors"
                    title="Delete document"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors line-clamp-2">
                    {pdf.fileName}
                  </h4>
                  <span className="text-[10px] font-mono text-gray-500 block mt-1">
                    Added on {new Date(pdf.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {deletingId === pdf._id ? (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-2">
                    <p className="text-[11px] text-rose-300 font-semibold text-center">
                      Delete this document?
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleDelete(pdf._id)}
                        className="px-3 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-bold"
                      >
                        Confirm Delete
                      </button>
                      <button
                        onClick={() => setDeletingId(null)}
                        className="px-3 py-1 rounded-lg bg-white/[0.06] text-gray-300 text-[10px]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
                    <button
                      onClick={() => navigate(`/pdf/chat/${pdf._id}`)}
                      className="btn-cyan flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <MessageSquare size={13} />
                      <span>Chat Document</span>
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
