import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Square,
  Volume2,
  Send,
  Loader2,
  RotateCcw,
  Bot,
} from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";

interface Slide {
  heading: string;
  content: string[];
  speakerNotes: string;
}

interface Quiz {
  question: string;
  options: string[];
  answer: string;
}

interface Lesson {
  _id: string;
  title: string;
  slides: Slide[];
  quiz: Quiz[];
}

interface LessonProgress {
  currentSlide: number;
  completed: boolean;
  quizScore: number;
}

interface TeacherMessage {
  sender: "student" | "teacher";
  text: string;
}

export default function LessonPlayer() {
  const navigate = useNavigate();
  const { lessonId } = useParams();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [teacherQuestion, setTeacherQuestion] = useState("");
  const [teacherLoading, setTeacherLoading] = useState(false);
  const [teacherMessages, setTeacherMessages] = useState<TeacherMessage[]>([
    {
      sender: "teacher",
      text: "Hello! I am your AI Instructor for this lesson. If you have questions about this slide, type below and I'll explain.",
    },
  ]);

  const fetchLesson = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/lesson/${lessonId}`);
      setLesson(res.data.lesson);

      const progressRes = await api.get(`/api/lesson/${lessonId}/progress`);
      const progressData = progressRes.data.progress as LessonProgress;
      const safeSlide = Math.max(
        0,
        Math.min(
          progressData.currentSlide || 0,
          res.data.lesson.slides.length - 1
        )
      );

      setCurrentSlide(safeSlide);
      setShowQuiz(false);
      setCurrentQuestion(0);
      setSelectedOption("");
      setScore(progressData.quizScore || 0);
      setQuizFinished(Boolean(progressData.completed));
    } catch {
      toast.error("Could not load lesson.");
      setLesson(null);
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    fetchLesson();
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [fetchLesson]);

  const slide = lesson?.slides[currentSlide];
  const progressPercent = lesson?.slides.length
    ? Math.round(((currentSlide + 1) / lesson.slides.length) * 100)
    : 0;

  const narrationText = useMemo(() => {
    if (!slide) return "";
    return [slide.heading, ...slide.content, slide.speakerNotes]
      .filter(Boolean)
      .join(". ");
  }, [slide]);

  const saveProgress = useCallback(
    async (updates: Partial<LessonProgress>) => {
      if (!lessonId) return;
      try {
        await api.patch(`/api/lesson/${lessonId}/progress`, updates);
      } catch {
        // Non-blocking
      }
    },
    [lessonId]
  );

  const speakSlide = useCallback(() => {
    if (!narrationText) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(narrationText);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [narrationText]);

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const goToSlide = (index: number) => {
    stopSpeaking();
    setCurrentSlide(index);
    saveProgress({ currentSlide: index });
  };

  const nextSlide = () => {
    if (!lesson) return;
    stopSpeaking();

    if (currentSlide === lesson.slides.length - 1) {
      saveProgress({ currentSlide });
      setShowQuiz(true);
      return;
    }

    const next = currentSlide + 1;
    setCurrentSlide(next);
    saveProgress({ currentSlide: next });
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      stopSpeaking();
      const prev = currentSlide - 1;
      setCurrentSlide(prev);
      saveProgress({ currentSlide: prev });
    }
  };

  const submitAnswer = () => {
    if (!lesson || !selectedOption) return;

    const question = lesson.quiz[currentQuestion];
    const isCorrect =
      selectedOption.trim().toLowerCase() === question.answer.trim().toLowerCase() ||
      question.answer.trim().toLowerCase().startsWith(selectedOption.trim().toLowerCase());

    const nextScore = isCorrect ? score + 1 : score;
    setScore(nextScore);
    setSelectedOption("");

    if (currentQuestion === lesson.quiz.length - 1) {
      setQuizFinished(true);
      saveProgress({
        currentSlide,
        completed: true,
        quizScore: nextScore,
      });
      toast.success("Lesson & comprehension quiz completed!");
    } else {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const askTeacher = async () => {
    const question = teacherQuestion.trim();
    if (!question || teacherLoading || !lessonId) return;

    setTeacherMessages((prev) => [
      ...prev,
      { sender: "student", text: question },
    ]);
    setTeacherQuestion("");
    setTeacherLoading(true);

    try {
      const res = await api.post(`/api/lesson/${lessonId}/ask`, { question });
      setTeacherMessages((prev) => [
        ...prev,
        { sender: "teacher", text: res.data.answer },
      ]);
    } catch {
      setTeacherMessages((prev) => [
        ...prev,
        {
          sender: "teacher",
          text: "I couldn't clarify that right now. Please try rephrasing your question.",
        },
      ]);
    } finally {
      setTeacherLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout title="Loading Course Lesson...">
        <div className="h-96 flex items-center justify-center">
          <Loader2 className="animate-spin text-violet-400" size={32} />
        </div>
      </AppLayout>
    );
  }

  if (!lesson || !slide) {
    return (
      <AppLayout title="Lesson Not Found">
        <div className="p-12 rounded-3xl neon-card text-center space-y-4 max-w-md mx-auto">
          <h3 className="text-lg font-bold text-white">Lesson not available</h3>
          <p className="text-xs text-gray-400">
            This lesson may have been deleted or does not exist.
          </p>
          <button
            onClick={() => navigate("/lessons")}
            className="btn-violet px-4 py-2 rounded-xl text-xs font-bold"
          >
            Back to My Lessons
          </button>
        </div>
      </AppLayout>
    );
  }

  if (showQuiz) {
    const q = lesson.quiz[currentQuestion];
    return (
      <AppLayout
        title={`Course Assessment — ${lesson.title}`}
        subtitle="Test your comprehension of this lesson"
        actionButton={
          <button
            onClick={() => setShowQuiz(false)}
            className="btn-ghost px-3.5 py-1.5 rounded-xl text-xs font-semibold"
          >
            ← Back to Slides
          </button>
        }
      >
        <div className="max-w-3xl mx-auto">
          <div className="p-8 sm:p-12 rounded-3xl neon-card space-y-8 border-violet-500/30">
            {quizFinished ? (
              <div className="text-center py-8 space-y-6">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 size={36} />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">
                    Lesson Completed!
                  </h2>
                  <p className="text-sm font-mono text-emerald-400 mt-2">
                    Final Score: {score} / {lesson.quiz.length} Correct
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-4">
                  <button
                    onClick={() => {
                      setQuizFinished(false);
                      setCurrentQuestion(0);
                      setSelectedOption("");
                      setScore(0);
                      saveProgress({ completed: false, quizScore: 0 });
                    }}
                    className="btn-ghost flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold"
                  >
                    <RotateCcw size={15} />
                    <span>Retry Quiz</span>
                  </button>

                  <button
                    onClick={() => navigate("/lessons")}
                    className="btn-violet px-6 py-3 rounded-xl text-xs font-bold"
                  >
                    Back to All Lessons
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                  <span className="text-xs font-mono uppercase font-bold text-cyan-400">
                    Question {currentQuestion + 1} of {lesson.quiz.length}
                  </span>
                  <span className="text-xs font-mono text-gray-400">
                    Score: {score}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                  {q.question}
                </h3>

                <div className="grid grid-cols-1 gap-3">
                  {q.options.map((opt, i) => {
                    const isSelected = selectedOption === opt;
                    const letter = String.fromCharCode(65 + i);
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedOption(opt)}
                        className={`w-full p-4 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                          isSelected
                            ? "bg-violet-600/25 border-violet-500/60 text-white glow-violet"
                            : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] text-gray-300"
                        }`}
                      >
                        <span className="w-7 h-7 rounded-lg bg-black/40 border border-white/[0.08] font-mono font-bold text-xs flex items-center justify-center shrink-0">
                          {letter}
                        </span>
                        <span className="text-sm font-medium">{opt}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    disabled={!selectedOption}
                    onClick={submitAnswer}
                    className="btn-cyan px-6 py-3 rounded-xl text-xs font-bold disabled:opacity-40"
                  >
                    Submit Answer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title={lesson.title}
      subtitle={`Slide ${currentSlide + 1} of ${lesson.slides.length} • AI Guided Course`}
      actionButton={
        <div className="flex items-center gap-2">
          {isSpeaking ? (
            <button
              onClick={stopSpeaking}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold cursor-pointer"
            >
              <Square size={13} />
              <span>Stop Audio</span>
            </button>
          ) : (
            <button
              onClick={speakSlide}
              className="btn-cyan flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
            >
              <Volume2 size={13} />
              <span>Listen Narration</span>
            </button>
          )}

          <button
            onClick={() => setShowQuiz(true)}
            className="btn-ghost flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
          >
            <HelpCircle size={13} />
            <span>Take Quiz ({lesson.quiz.length})</span>
          </button>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Slide Outline Sidebar */}
        <div className="lg:col-span-3 space-y-3">
          <div className="p-4 rounded-2xl neon-card space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <span className="text-xs font-mono uppercase font-bold text-gray-400">
                Course Outline
              </span>
              <span className="text-xs font-mono text-violet-400">
                {progressPercent}%
              </span>
            </div>

            <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
              {lesson.slides.map((s, idx) => {
                const isActive = currentSlide === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => goToSlide(idx)}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                      isActive
                        ? "bg-violet-600/20 border-violet-500/50 text-white font-bold"
                        : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] text-gray-400"
                    }`}
                  >
                    <span className="w-5 h-5 rounded-md bg-black/40 font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className="text-xs line-clamp-2">
                      {s.heading}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center Presentation Stage */}
        <div className="lg:col-span-6 space-y-5">
          <div className="p-6 sm:p-8 rounded-3xl neon-card space-y-6 min-h-[460px] flex flex-col justify-between border-violet-500/20">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <span className="text-xs font-mono font-bold uppercase text-violet-400">
                  Slide {currentSlide + 1} of {lesson.slides.length}
                </span>

                {isSpeaking && (
                  <span className="flex items-center gap-1.5 text-xs text-cyan-400 font-mono animate-pulse">
                    <Volume2 size={14} /> Voice Narrating
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
                {slide.heading}
              </h2>

              <div className="space-y-3 pt-2">
                {slide.content.map((point, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm text-gray-200 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-2 shrink-0" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>

              {slide.speakerNotes && (
                <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] space-y-1 mt-4">
                  <span className="text-[10px] font-mono uppercase font-bold text-gray-400 block">
                    Instructor Takeaway
                  </span>
                  <p className="text-xs text-gray-300 italic leading-relaxed">
                    "{slide.speakerNotes}"
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
              <button
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className="btn-ghost flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>

              <button
                onClick={nextSlide}
                className="btn-violet flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-violet-600/20 cursor-pointer"
              >
                <span>{currentSlide === lesson.slides.length - 1 ? "Take Quiz" : "Next Slide"}</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Live Instructor Q&A Sidebar */}
        <div className="lg:col-span-3 space-y-3">
          <div className="p-4 rounded-2xl neon-card flex flex-col justify-between h-full min-h-[460px]">
            <div className="space-y-3 flex-1 flex flex-col min-h-0">
              <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
                <Bot size={16} className="text-violet-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Slide Teacher Q&A
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                {teacherMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl ${
                      msg.sender === "student"
                        ? "bg-violet-600/20 border border-violet-500/30 text-violet-200 ml-3"
                        : "bg-white/[0.03] border border-white/[0.06] text-gray-300 mr-3"
                    }`}
                  >
                    <span className="text-[10px] font-mono font-bold uppercase block text-gray-400 mb-1">
                      {msg.sender === "student" ? "You" : "AI Teacher"}
                    </span>
                    <p className="leading-relaxed">{msg.text}</p>
                  </div>
                ))}

                {teacherLoading && (
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-2 text-violet-400 text-xs font-mono">
                    <Loader2 size={14} className="animate-spin" />
                    <span>Teacher formulating...</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.06] flex gap-2">
              <input
                type="text"
                placeholder="Ask about this slide..."
                value={teacherQuestion}
                onChange={(e) => setTeacherQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") askTeacher();
                }}
                className="input-neon flex-1 px-3 py-2 rounded-xl text-xs"
              />
              <button
                onClick={askTeacher}
                disabled={teacherLoading || !teacherQuestion.trim()}
                className="btn-violet p-2 rounded-xl disabled:opacity-40 cursor-pointer"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
