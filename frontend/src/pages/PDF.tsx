import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import {
  Upload,
  FileText,
  X,
  Loader2,
  FolderOpen,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import api from "../services/api";
import toast from "react-hot-toast";

const MAX_SIZE_MB = 25;

export default function PDF() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedDoc, setUploadedDoc] = useState<{ _id: string; fileName: string } | null>(null);

  const validateAndSetFile = (selectedFile: File) => {
    if (selectedFile.type !== "application/pdf") {
      toast.error("Please upload a valid PDF document.");
      return;
    }
    const sizeInMB = selectedFile.size / (1024 * 1024);
    if (sizeInMB > MAX_SIZE_MB) {
      toast.error(`File size exceeds the ${MAX_SIZE_MB}MB limit.`);
      return;
    }
    setFile(selectedFile);
    setUploadedDoc(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a PDF file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const res = await api.post("/api/pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const doc = res.data.pdf || res.data;
      setUploadedDoc(doc);
      setFile(null);
      toast.success("PDF uploaded and indexed successfully!");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to process PDF document."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <AppLayout
      title="Upload Course Document"
      subtitle="Index textbook chapters, lecture notes, or syllabi for instant AI chat and lessons"
      actionButton={
        <button
          onClick={() => navigate("/pdfs")}
          className="btn-ghost flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
        >
          <FolderOpen size={14} />
          <span>My Library</span>
        </button>
      }
    >
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Upload Dropzone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-12 sm:p-16 rounded-3xl neon-card text-center cursor-pointer transition-all border-2 border-dashed flex flex-col items-center justify-center space-y-4 ${
            isDragging
              ? "border-violet-400 bg-violet-950/20 scale-[1.01]"
              : "border-violet-500/25 hover:border-violet-500/50 bg-[#08090E]"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                validateAndSetFile(e.target.files[0]);
              }
            }}
          />

          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center text-white shadow-xl shadow-violet-600/30 animate-float">
            <Upload size={32} />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">
              Drop your PDF here, or <span className="text-violet-400">browse files</span>
            </h3>
            <p className="text-xs text-gray-400">
              Supports textbooks, research papers, syllabus PDFs up to {MAX_SIZE_MB}MB
            </p>
          </div>
        </div>

        {/* Selected File Card */}
        {file && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl neon-card flex items-center justify-between gap-4 border-violet-500/30"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-400 flex items-center justify-center shrink-0">
                <FileText size={22} />
              </div>
              <div className="min-w-0">
                <span className="text-sm font-bold text-white block truncate">
                  {file.name}
                </span>
                <span className="text-xs font-mono text-gray-400 block">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                className="p-2 text-gray-400 hover:text-rose-400 transition-colors"
              >
                <X size={16} />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpload();
                }}
                disabled={uploading}
                className="btn-violet px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg shadow-violet-600/25"
              >
                {uploading ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Sparkles size={15} />
                )}
                <span>{uploading ? "Extracting & Indexing..." : "Process Document"}</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Upload Success Card */}
        {uploadedDoc && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 rounded-3xl neon-card text-center space-y-5 border-emerald-500/30 glow-emerald-sm"
          >
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 size={30} />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-white">
                Document Ready for Learning!
              </h3>
              <p className="text-xs text-gray-300">
                "{uploadedDoc.fileName}" has been extracted into your AI library.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => navigate(`/pdf/chat/${uploadedDoc._id}`)}
                className="btn-cyan px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
              >
                Start Chatting
              </button>
              <button
                onClick={() => navigate("/pdfs")}
                className="btn-ghost px-5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer"
              >
                View Library
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
