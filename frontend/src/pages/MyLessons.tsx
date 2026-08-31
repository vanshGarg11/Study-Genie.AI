import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import {
  BookOpenCheck,
  ChevronRight,
  Layers,
  HelpCircle,
  Upload,
} from "lucide-react";
import { motion } from "framer-motion";
import api from "../services/api";

interface LessonItem {
  _id: string;
  title: string;
  slidesCount: number;
  quizCount: number;
  pdfId: string;
  progress?: {
    completed?: boolean;
    quizScore?: number;
  };
}

export default function MyLessons() {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLessons = async () => {
      setLoading(true);
      try {
        const res = await api.get("/api/lesson");
        setLessons(res.data.lessons || []);
      } finally {
        setLoading(false);
      }
    };
    fetchLessons();
  }, []);

  return (
    <AppLayout
      title="My Course Lessons"
      subtitle={`${lessons.length} Multi-slide curriculum courses with interactive quiz checkpoints`}
      actionButton={
        <button
          onClick={() => navigate("/pdfs")}
          className="btn-violet flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer"
        >
          <Upload size={14} />
          <span>Generate from PDF</span>
        </button>
      }
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {loading ? (
          <div className="h-72 flex items-center justify-center">
            <span className="text-xs font-mono text-violet-400">Loading course library...</span>
          </div>
        ) : lessons.length === 0 ? (
          <div className="p-16 rounded-3xl neon-card text-center space-y-4 border-dashed">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-white/[0.03] border border-white/[0.08] text-gray-500 flex items-center justify-center">
              <BookOpenCheck size={32} />
            </div>
            <h3 className="text-lg font-bold text-white">No Lessons Generated Yet</h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              Go to your PDF library or upload a document and click "Generate Lesson" to create an interactive multi-slide course.
            </p>
            <button
              onClick={() => navigate("/pdfs")}
              className="btn-violet px-6 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
            >
              Browse PDF Library
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {lessons.map((lesson, idx) => (
              <motion.div
                key={lesson._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="p-6 rounded-3xl neon-card flex flex-col justify-between space-y-5 group border-violet-500/20"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-400 flex items-center justify-center">
                      <BookOpenCheck size={20} />
                    </div>

                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md badge-violet">
                      AI Course
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-violet-300 transition-colors line-clamp-2 leading-snug">
                    {lesson.title}
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-gray-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Layers size={13} className="text-violet-400" />
                      {lesson.slidesCount} Slides
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <HelpCircle size={13} className="text-cyan-400" />
                      {lesson.quizCount} Quizzes
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                  <button
                    onClick={() => navigate(`/lesson/${lesson._id}`)}
                    className="btn-violet px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-violet-600/20"
                  >
                    <span>Start Lesson</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
