import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookOpenCheck,
  CheckCircle2,
  ChevronRight,
  Loader2,
} from "lucide-react";
import api from "../services/api";

interface LessonItem {
  _id: string;
  title: string;
  slidesCount: number;
  quizCount: number;
  createdAt: string;
  progress?: {
    currentSlide?: number;
    completed?: boolean;
    quizScore?: number;
  };
}

export default function MyLessons() {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get("/api/lesson/my-lessons");
      setLessons(res.data.lessons || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Could not load lessons.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E1116] text-[#ECEEF3]">
      <header className="h-[72px] flex items-center justify-between px-8 border-b border-[#262B34]">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-sm text-[#7D8494] hover:text-[#ECEEF3]"
        >
          <ArrowLeft size={16} />
          Dashboard
        </button>
        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.2em] text-[#7D8494]">Library</p>
          <h1 className="text-lg font-semibold">My Lessons</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 border border-[#262B34] bg-[#12161D] flex items-center justify-center">
            <BookOpenCheck size={22} className="text-[#4C6FFF]" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Generated Lessons</h2>
            <p className="text-sm text-[#8B92A3] mt-1">
              Continue lessons and track quiz completion.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="h-48 flex items-center justify-center border border-[#262B34] bg-[#12161D]">
            <Loader2 className="animate-spin text-[#4C6FFF]" size={28} />
          </div>
        ) : error ? (
          <div className="border border-[#E8556B]/30 bg-[#1A0E10] text-[#E8556B] p-5">
            {error}
          </div>
        ) : lessons.length === 0 ? (
          <div className="border border-dashed border-[#262B34] p-12 text-center">
            <BookOpenCheck size={44} className="mx-auto text-[#5A6070]" />
            <h3 className="mt-4 text-xl font-semibold">No lessons yet</h3>
            <p className="mt-2 text-sm text-[#8B92A3]">
              Open a PDF chat and generate your first AI lesson.
            </p>
            <button
              onClick={() => navigate("/pdfs")}
              className="mt-6 px-5 py-3 bg-[#4C6FFF] text-white font-semibold"
            >
              Open My PDFs
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {lessons.map((lesson) => {
              const completed = Boolean(lesson.progress?.completed);
              const currentSlide = lesson.progress?.currentSlide ?? 0;
              const progressPercent = lesson.slidesCount
                ? Math.round(((currentSlide + 1) / lesson.slidesCount) * 100)
                : 0;

              return (
                <button
                  key={lesson._id}
                  onClick={() => navigate(`/lesson/${lesson._id}`)}
                  className="text-left border border-[#262B34] bg-[#12161D] p-5 hover:border-[#3A4150] transition flex items-center justify-between gap-5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {completed && <CheckCircle2 size={16} className="text-[#22C58B]" />}
                      <h3 className="font-semibold truncate">{lesson.title}</h3>
                    </div>
                    <p className="text-xs text-[#7D8494] mt-1">
                      {lesson.slidesCount} slides · {lesson.quizCount} quiz questions ·{" "}
                      {new Date(lesson.createdAt).toLocaleDateString()}
                    </p>
                    <div className="mt-4 h-2 bg-[#0E1116] border border-[#262B34] max-w-md">
                      <div
                        className={completed ? "h-full bg-[#22C58B]" : "h-full bg-[#4C6FFF]"}
                        style={{ width: `${completed ? 100 : progressPercent}%` }}
                      />
                    </div>
                    <p className="text-xs text-[#8B92A3] mt-2">
                      {completed
                        ? `Completed · Score ${lesson.progress?.quizScore || 0}/${lesson.quizCount}`
                        : `Resume at slide ${currentSlide + 1}`}
                    </p>
                  </div>
                  <ChevronRight size={20} className="text-[#4C6FFF] shrink-0" />
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
