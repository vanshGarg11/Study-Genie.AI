import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Coins,
  Brain,
  Upload,
  User,
  LogOut,
  Home,
  Sparkles,
  FolderOpen,
  Loader2,
  MessageSquare,
  Play,
  Send,
  Square,
  Volume2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import api from "../services/api";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: Home, index: "01" },
  { label: "Generate Notes", path: "/notes", icon: Brain, index: "02" },
  { label: "Upload PDF", path: "/pdf", icon: Upload, index: "03" },
  { label: "Buy Coins", path: "/coins", icon: Coins, index: "04" },
  { label: "Profile", path: "/profile", icon: User, index: "05" },
];

const chromeStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap');

  .sg-root { --ink:#0E1116; --line:#262B34; --line-soft:#1B1F27; --muted:#7D8494; --cobalt:#4C6FFF; --amber:#F2B705; --green:#22C58B; --coral:#E8556B; }
  .sg-serif { font-family:'Fraunces', serif; font-optical-sizing:auto; }
  .sg-mono { font-family:'IBM Plex Mono', monospace; }

  @keyframes riseIn { from { opacity:0; transform: translateY(14px); } to { opacity:1; transform: translateY(0); } }
  .sg-rise { opacity:0; animation: riseIn .5s cubic-bezier(.2,.7,.2,1) forwards; }

  .sg-nav-item { position: relative; border: 1px solid transparent; }
  .sg-nav-item .sg-bracket {
    position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
    background: var(--cobalt); transform: scaleY(0); transform-origin: top;
    transition: transform .28s cubic-bezier(.2,.8,.2,1);
  }
  .sg-nav-item:hover .sg-bracket, .sg-nav-item[data-active="true"] .sg-bracket { transform: scaleY(1); }
  .sg-nav-item:hover, .sg-nav-item[data-active="true"] { border-color: var(--line); background: #151920; }
  .sg-nav-item .sg-idx { transition: color .2s ease, opacity .2s ease; opacity: .45; }
  .sg-nav-item:hover .sg-idx, .sg-nav-item[data-active="true"] .sg-idx { opacity: 1; color: var(--cobalt); }

  .sg-back-btn { transition: transform .18s ease, color .18s ease, border-color .18s ease; }
  .sg-back-btn:hover { transform: translateX(-2px); border-color: #3a4150; color: #ECEEF3; }

  .sg-btn-logout { transition: background .2s ease, color .2s ease, border-color .2s ease, letter-spacing .2s ease; }
  .sg-btn-logout:hover { letter-spacing: 0.04em; }

  .sg-corner-cut { clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%); }

  .sg-press { transition: transform .16s ease, box-shadow .16s ease; }
  .sg-press:hover:not(:disabled) { transform: translate(-2px,-2px); box-shadow: 3px 3px 0 0 var(--line); }
  .sg-press:active:not(:disabled) { transform: translate(0,0); box-shadow: none; }

  @keyframes sgWave { 0%, 100% { transform: rotate(-8deg); } 50% { transform: rotate(12deg); } }
  @keyframes sgPulse { 0%, 100% { opacity: .35; transform: scaleX(.75); } 50% { opacity: 1; transform: scaleX(1); } }
  .sg-teacher-arm { transform-origin: 32px 22px; animation: sgWave 1.5s ease-in-out infinite; }
  .sg-voice-bar { animation: sgPulse 1.1s ease-in-out infinite; }
`;

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

function AppChrome({
  headerRight,
  children,
}: {
  headerRight?: React.ReactNode;
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="sg-root min-h-screen flex font-[Inter] bg-[#0E1116] text-[#ECEEF3]">
      <style>{chromeStyles}</style>

      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-[#0B0E13] border-r border-[#262B34] p-5 flex flex-col justify-between z-10">
        <div>
          <div
            className="flex items-center gap-3 px-1 mb-9 group cursor-pointer"
            onClick={() => navigate("/dashboard")}
          >
            <div className="w-9 h-9 border border-[#262B34] flex items-center justify-center bg-[#12161D] sg-corner-cut">
              <Sparkles size={16} className="text-[#4C6FFF]" />
            </div>
            <span className="sg-serif text-xl font-semibold tracking-tight text-[#ECEEF3]">
              StudyGenie
            </span>
          </div>

          <p className="sg-mono text-[10px] uppercase tracking-[0.2em] text-[#7D8494] mb-3 px-1">
            Navigate
          </p>

          <nav className="space-y-1">
            {navItems.map(({ label, path, icon: Icon, index }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="sg-nav-item w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-[#B7BCC7]"
              >
                <span className="sg-bracket" />
                <span className="flex items-center gap-3 relative z-10">
                  <Icon size={16} className="text-[#7D8494]" />
                  <span>{label}</span>
                </span>
                <span className="sg-idx sg-mono text-[10px]">{index}</span>
              </button>
            ))}
          </nav>
        </div>

        <button
          onClick={logout}
          className="sg-btn-logout w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#E8556B] border border-[#2A1A1D] hover:border-[#E8556B]/40 hover:bg-[#1A0E10]"
        >
          <LogOut size={16} />
          <span className="sg-mono text-xs tracking-wide">LOG OUT</span>
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 z-10 overflow-hidden">
        <header className="h-[72px] shrink-0 flex items-center justify-between px-8 border-b border-[#262B34]">
          <button
            onClick={() => navigate(-1)}
            className="sg-back-btn flex items-center gap-2 px-3 py-2 border border-[#262B34] text-sm text-[#7D8494] sg-mono"
          >
            <ArrowLeft size={15} />
            BACK
          </button>

          {headerRight}

          <button
            onClick={() => navigate("/pdfs")}
            className="sg-back-btn flex items-center gap-2 px-3 py-2 border border-[#262B34] text-sm text-[#7D8494] sg-mono"
          >
            <FolderOpen size={15} />
            MY PDFS
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export default function LessonPlayer() {
  const { lessonId } = useParams();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [savedProgress, setSavedProgress] = useState<LessonProgress | null>(null);
  const [lectureMode, setLectureMode] = useState(false);
  const [teacherQuestion, setTeacherQuestion] = useState("");
  const [teacherLoading, setTeacherLoading] = useState(false);
  const [teacherMessages, setTeacherMessages] = useState<TeacherMessage[]>([
    {
      sender: "teacher",
      text: "I am your AI teacher for this lesson. Ask me anything about the current topic.",
    },
  ]);

  const fetchLesson = useCallback(async () => {
    setLoading(true);
    setError("");

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

      setSavedProgress(progressData);
      setCurrentSlide(safeSlide);
      setShowQuiz(false);
      setCurrentQuestion(0);
      setSelectedOption("");
      setScore(progressData.quizScore || 0);
      setQuizFinished(Boolean(progressData.completed));
    } catch (err: any) {
      setError(err?.response?.data?.message || "Lesson not found.");
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
  const progress = lesson?.slides.length
    ? Math.round(((currentSlide + 1) / lesson.slides.length) * 100)
    : 0;

  const narrationText = useMemo(() => {
    if (!slide) return "";

    return [slide.heading, ...slide.content, slide.speakerNotes]
      .filter(Boolean)
      .join(". ");
  }, [slide]);

  const saveProgress = useCallback(async (updates: Partial<LessonProgress>) => {
    if (!lessonId) return;

    try {
      const res = await api.patch(`/api/lesson/${lessonId}/progress`, updates);
      setSavedProgress(res.data.progress);
    } catch {
      // Progress saving should never interrupt the lesson experience.
    }
  }, [lessonId]);

  const speakSlide = useCallback(() => {
    if (!narrationText) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(narrationText);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);

      if (lectureMode && lesson) {
        if (currentSlide < lesson.slides.length - 1) {
          const next = currentSlide + 1;
          setCurrentSlide(next);
          saveProgress({ currentSlide: next });

          window.setTimeout(() => {
            setLectureMode(true);
          }, 400);
        } else {
          setLectureMode(false);
        }
      }
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setLectureMode(false);
    };
    window.speechSynthesis.speak(utterance);
  }, [currentSlide, lectureMode, lesson, narrationText, saveProgress]);

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setLectureMode(false);
  };

  useEffect(() => {
    if (lectureMode && !isSpeaking && narrationText) {
      speakSlide();
    }
  }, [isSpeaking, lectureMode, narrationText, speakSlide]);

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

  const submitAnswer = () => {
    if (!lesson || !selectedOption) return;

    const question = lesson.quiz[currentQuestion];
    const nextScore = selectedOption === question.answer ? score + 1 : score;
    setScore(nextScore);

    setSelectedOption("");

    if (currentQuestion === lesson.quiz.length - 1) {
      setQuizFinished(true);
      saveProgress({
        currentSlide,
        completed: true,
        quizScore: nextScore,
      });
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
      const res = await api.post(`/api/lesson/${lessonId}/ask`, {
        question,
      });

      setTeacherMessages((prev) => [
        ...prev,
        { sender: "teacher", text: res.data.answer },
      ]);
    } catch (err: any) {
      setTeacherMessages((prev) => [
        ...prev,
        {
          sender: "teacher",
          text:
            err?.response?.data?.message ||
            "I could not answer that right now. Please try again.",
        },
      ]);
    } finally {
      setTeacherLoading(false);
    }
  };

  if (loading) {
    return (
      <AppChrome>
        <div className="min-h-full flex items-center justify-center">
          <Loader2 className="animate-spin text-[#4C6FFF]" size={28} />
        </div>
      </AppChrome>
    );
  }

  if (error || !lesson || !slide) {
    return (
      <AppChrome>
        <div className="p-8">
          <h1 className="sg-serif text-3xl font-semibold">{error || "Lesson not found."}</h1>
        </div>
      </AppChrome>
    );
  }

  if (showQuiz) {
    if (!lesson.quiz.length) {
      return (
        <AppChrome>
          <div className="p-8 max-w-4xl mx-auto">
            <button
              onClick={() => setShowQuiz(false)}
              className="sg-back-btn flex items-center gap-2 px-3 py-2 border border-[#262B34] text-sm text-[#7D8494] sg-mono"
            >
              <ArrowLeft size={15} />
              BACK TO SLIDES
            </button>
            <h1 className="sg-serif mt-8 text-3xl font-semibold">No quiz questions available.</h1>
          </div>
        </AppChrome>
      );
    }

    const question = lesson.quiz[currentQuestion];

    return (
      <AppChrome>
        <div className="p-8 max-w-4xl mx-auto">
          <button
            onClick={() => setShowQuiz(false)}
            className="sg-back-btn flex items-center gap-2 px-3 py-2 border border-[#262B34] text-sm text-[#7D8494] sg-mono"
          >
            <ArrowLeft size={15} />
            BACK TO SLIDES
          </button>

          <div className="sg-rise mt-8 border border-[#262B34] bg-[#12161D] p-8" style={{ animationDelay: "0ms" }}>
            {quizFinished ? (
              <div className="text-center py-12">
                <CheckCircle2 size={54} className="mx-auto text-[#22C58B]" />
                <h1 className="sg-serif mt-5 text-3xl font-semibold">Quiz Completed</h1>
                <p className="sg-mono mt-3 text-xl text-[#C7CBD3]">
                  Score: {score} / {lesson.quiz.length}
                </p>
                <p className="mt-2 text-sm text-[#7D8494]">
                  Your progress has been saved.
                </p>
                <button
                  onClick={() => {
                    setQuizFinished(false);
                    setCurrentQuestion(0);
                    setSelectedOption("");
                    setScore(0);
                    saveProgress({ completed: false, quizScore: 0 });
                  }}
                  className="sg-press mt-8 px-5 py-3 bg-[#4C6FFF] text-white font-semibold text-sm sg-mono"
                >
                  RETRY QUIZ
                </button>
              </div>
            ) : (
              <>
                <p className="sg-mono text-xs uppercase tracking-[0.2em] text-[#7D8494]">
                  Question {currentQuestion + 1} of {lesson.quiz.length}
                </p>
                <h1 className="sg-serif mt-4 text-2xl font-semibold">{question.question}</h1>

                <div className="mt-6 grid gap-3">
                  {question.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => setSelectedOption(option)}
                      className={`text-left p-4 border transition text-sm ${
                        selectedOption === option
                          ? "border-[#4C6FFF] bg-[#17213D]"
                          : "border-[#262B34] bg-[#0E1116] hover:border-[#3A4150]"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                <button
                  disabled={!selectedOption}
                  onClick={submitAnswer}
                  className="sg-press mt-8 px-6 py-3 bg-[#22C58B] text-[#062016] font-semibold text-sm sg-mono disabled:opacity-40"
                >
                  SUBMIT ANSWER
                </button>
              </>
            )}
          </div>
        </div>
      </AppChrome>
    );
  }

  return (
    <AppChrome
      headerRight={
        <div className="text-right">
          <p className="sg-mono text-[10px] uppercase tracking-[0.2em] text-[#7D8494]">AI Lesson</p>
          <h1 className="sg-serif text-lg font-semibold">{lesson.title}</h1>
          {savedProgress?.completed && (
            <p className="sg-mono text-[11px] text-[#22C58B]">
              Completed with score {savedProgress.quizScore} / {lesson.quiz.length}
            </p>
          )}
        </div>
      }
    >
      <main className="max-w-[1400px] mx-auto p-6 grid grid-cols-[240px_minmax(0,1fr)_340px] gap-6">
        <aside className="sg-rise border border-[#262B34] bg-[#12161D] p-4 h-fit" style={{ animationDelay: "0ms" }}>
          <p className="sg-mono text-xs uppercase tracking-[0.2em] text-[#7D8494] mb-4">
            Slides
          </p>
          <div className="space-y-2">
            {lesson.slides.map((item, index) => (
              <button
                key={`${item.heading}-${index}`}
                onClick={() => goToSlide(index)}
                className={`w-full text-left px-3 py-3 border text-sm ${
                  currentSlide === index
                    ? "border-[#4C6FFF] bg-[#17213D] text-white"
                    : "border-[#262B34] text-[#A8AFBE] hover:border-[#3A4150]"
                }`}
              >
                <span className="sg-mono block text-[10px] text-[#7D8494]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="line-clamp-2">{item.heading}</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="sg-rise border border-[#262B34] bg-[#12161D] min-h-[620px] flex flex-col" style={{ animationDelay: "40ms" }}>
          <div className="p-6 border-b border-[#262B34]">
            <div className="flex items-center justify-between mb-3">
              <span className="sg-mono text-xs uppercase tracking-[0.2em] text-[#7D8494]">
                Slide {currentSlide + 1} of {lesson.slides.length}
              </span>
              <span className="sg-mono text-xs text-[#4C6FFF]">{progress}% complete</span>
            </div>
            <div className="h-2 bg-[#0E1116] border border-[#262B34]">
              <div className="h-full bg-[#4C6FFF]" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="flex-1 p-6">
            <div className="h-full min-h-[460px] bg-[#080B10] border border-[#262B34] relative overflow-hidden">
              <div className="absolute inset-0 opacity-30 bg-[linear-gradient(#1B1F27_1px,transparent_1px),linear-gradient(90deg,#1B1F27_1px,transparent_1px)] bg-[size:42px_42px]" />
              <div className="absolute top-5 left-5 z-10">
                <span className="sg-mono text-[10px] uppercase tracking-[0.22em] text-[#4C6FFF] border border-[#4C6FFF]/40 px-2 py-1 bg-[#0E1116]">
                  Video Lecture Mode
                </span>
              </div>

              <div className="relative z-10 h-full grid grid-cols-[240px_1fr] gap-8 p-8 items-center">
                <div className="flex flex-col items-center">
                  <div className="relative w-44 h-56 border border-[#3A4150] bg-[#12161D] flex items-end justify-center overflow-hidden">
                    <div className="absolute top-8 w-20 h-20 rounded-full bg-[#ECEEF3] border-4 border-[#4C6FFF]" />
                    <div className="absolute top-[66px] left-[78px] w-2 h-2 bg-[#0E1116]" />
                    <div className="absolute top-[66px] right-[78px] w-2 h-2 bg-[#0E1116]" />
                    <div className="absolute top-[93px] w-8 h-1 bg-[#0E1116]" />
                    <div className="absolute bottom-0 w-28 h-28 bg-[#4C6FFF]" />
                    <div className="sg-teacher-arm absolute bottom-20 right-6 w-16 h-3 bg-[#ECEEF3]" />
                    <div className="absolute bottom-8 left-8 w-5 h-12 bg-[#ECEEF3]" />
                    <div className="absolute bottom-8 right-8 w-5 h-12 bg-[#ECEEF3]" />
                  </div>

                  <div className="mt-5 flex items-end gap-1 h-8">
                    {[0, 1, 2, 3, 4].map((bar) => (
                      <span
                        key={bar}
                        className="sg-voice-bar w-2 bg-[#22C58B]"
                        style={{
                          height: `${10 + bar * 4}px`,
                          animationDelay: `${bar * 0.12}s`,
                        }}
                      />
                    ))}
                  </div>
                  <p className="sg-mono text-xs text-[#7D8494] mt-2">
                    {isSpeaking ? "AI teacher is explaining" : "AI teacher ready"}
                  </p>
                </div>

                <div className="min-w-0">
                  <h2 className="sg-serif text-5xl font-semibold leading-tight">{slide.heading}</h2>

                  <ul className="mt-8 grid gap-4">
                    {slide.content.map((point, index) => (
                      <li key={`${point}-${index}`} className="flex gap-3 text-xl text-[#D9DDE7]">
                        <span className="mt-2.5 h-2.5 w-2.5 bg-[#4C6FFF] shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="absolute left-6 right-6 bottom-6 z-20 border border-[#3A4150] bg-[#0E1116]/95 px-5 py-4">
                <div className="flex items-center gap-2 text-[#F2B705] mb-2">
                  <Volume2 size={16} />
                  <span className="sg-mono text-xs uppercase tracking-[0.18em]">Captions</span>
                </div>
                <p className="text-sm leading-6 text-[#C7CBD3] line-clamp-3">
                  {slide.speakerNotes || narrationText}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-[#262B34] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setLectureMode(true);
                  if (!isSpeaking) speakSlide();
                }}
                disabled={isSpeaking}
                className="sg-press px-4 py-3 bg-[#22C58B] text-[#062016] font-semibold text-sm sg-mono disabled:opacity-40 flex items-center gap-2"
              >
                <Play size={16} />
                START LECTURE
              </button>
              <button
                onClick={stopSpeaking}
                disabled={!isSpeaking}
                className="sg-press px-4 py-3 border border-[#E8556B]/50 text-[#E8556B] text-sm sg-mono disabled:opacity-40 flex items-center gap-2"
              >
                <Square size={16} />
                STOP
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                disabled={currentSlide === 0}
                onClick={() => goToSlide(currentSlide - 1)}
                className="sg-press px-4 py-3 border border-[#262B34] text-sm sg-mono disabled:opacity-40 flex items-center gap-2"
              >
                <ChevronLeft size={16} />
                PREVIOUS
              </button>
              <button
                onClick={nextSlide}
                className="sg-press px-4 py-3 bg-[#4C6FFF] text-white font-semibold text-sm sg-mono flex items-center gap-2"
              >
                {currentSlide === lesson.slides.length - 1 ? "START QUIZ" : "NEXT"}
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </section>

        <aside className="sg-rise border border-[#262B34] bg-[#12161D] min-h-[620px] flex flex-col" style={{ animationDelay: "80ms" }}>
          <div className="p-5 border-b border-[#262B34]">
            <div className="flex items-center gap-2">
              <MessageSquare size={18} className="text-[#4C6FFF]" />
              <h2 className="sg-serif font-semibold">Ask Teacher</h2>
            </div>
            <p className="text-xs text-[#7D8494] mt-1">
              Ask questions while the AI explains the lesson.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {teacherMessages.map((message, index) => (
              <div
                key={`${message.sender}-${index}`}
                className={`flex ${
                  message.sender === "student" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[88%] border px-4 py-3 text-sm leading-6 ${
                    message.sender === "student"
                      ? "border-[#4C6FFF] bg-[#17213D] text-white"
                      : "border-[#262B34] bg-[#0E1116] text-[#C7CBD3]"
                  }`}
                >
                  {message.sender === "teacher" ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.text}
                    </ReactMarkdown>
                  ) : (
                    message.text
                  )}
                </div>
              </div>
            ))}

            {teacherLoading && (
              <div className="sg-mono text-sm text-[#7D8494]">Teacher is thinking…</div>
            )}
          </div>

          <div className="p-5 border-t border-[#262B34]">
            <div className="flex gap-2">
              <input
                value={teacherQuestion}
                onChange={(e) => setTeacherQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") askTeacher();
                }}
                placeholder="Ask this lesson…"
                className="sg-mono min-w-0 flex-1 bg-[#0E1116] border border-[#262B34] px-3 py-3 text-sm outline-none focus:border-[#4C6FFF]"
              />
              <button
                onClick={askTeacher}
                disabled={teacherLoading || !teacherQuestion.trim()}
                className="sg-press px-4 bg-[#4C6FFF] text-white disabled:opacity-50"
                aria-label="Ask teacher"
              >
                {teacherLoading ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <Send size={17} />
                )}
              </button>
            </div>
          </div>
        </aside>
      </main>
    </AppChrome>
  );
} 
