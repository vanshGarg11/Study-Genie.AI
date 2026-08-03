import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
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
  Mic,
  Pause,
  Play,
  Send,
  Square,
} from "lucide-react";
import api from "../services/api";
import Live2DTeacher from "../components/Live2DTeacher";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: Home, index: "01" },
  { label: "Generate Notes", path: "/notes", icon: Brain, index: "02" },
  { label: "Upload PDF", path: "/pdf", icon: Upload, index: "03" },
  { label: "Buy Coins", path: "/coins", icon: Coins, index: "04" },
  { label: "Profile", path: "/profile", icon: User, index: "05" },
];

const chromeStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap');

  .sg-root { --ink:#0E1116; --line:#262B34; --line-soft:#1B1F27; --muted:#7D8494; --cobalt:#4C6FFF; --green:#22C58B; --amber:#F2B705; --coral:#E8556B; }
  .sg-serif { font-family:'Fraunces', serif; font-optical-sizing:auto; }
  .sg-mono { font-family:'IBM Plex Mono', monospace; }

  .sg-nav-item { position: relative; border: 1px solid transparent; }
  .sg-nav-item .sg-bracket {
    position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
    background: var(--cobalt); transform: scaleY(0); transform-origin: top;
    transition: transform .28s cubic-bezier(.2,.8,.2,1);
  }
  .sg-nav-item:hover .sg-bracket { transform: scaleY(1); }
  .sg-nav-item:hover { border-color: var(--line); background: #151920; }
  .sg-nav-item .sg-idx { transition: color .2s ease, opacity .2s ease; opacity: .45; }
  .sg-nav-item:hover .sg-idx { opacity: 1; color: var(--cobalt); }

  .sg-back-btn { transition: transform .18s ease, color .18s ease, border-color .18s ease; }
  .sg-back-btn:hover { transform: translateX(-2px); border-color: #3a4150; color: #ECEEF3; }

  .sg-btn-logout { transition: background .2s ease, color .2s ease, border-color .2s ease, letter-spacing .2s ease; }
  .sg-btn-logout:hover { letter-spacing: 0.04em; }

  .sg-corner-cut { clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%); }

  .sg-press { transition: transform .16s ease, box-shadow .16s ease; }
  .sg-press:hover:not(:disabled) { transform: translate(-2px,-2px); box-shadow: 3px 3px 0 0 var(--line); }
  .sg-press:active:not(:disabled) { transform: translate(0,0); box-shadow: none; }

  @keyframes riseIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .sg-rise { opacity: 0; animation: riseIn .5s cubic-bezier(.2,.7,.2,1) forwards; }

  .sg-progress-fill { transition: width .3s ease; }

  @keyframes livePulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: .45; transform: scale(.8); } }
  .sg-live-dot { animation: livePulse 1.3s ease-in-out infinite; }

  .sg-caption-card { transition: border-color .2s ease, box-shadow .2s ease; }
  .sg-caption-card:hover { border-color: #3a4150; box-shadow: 4px 4px 0 0 rgba(34,197,139,0.15); }
`;

interface LectureSegment {
  heading: string;
  objective: string;
  script: string;
  recap: string;
  checkpointQuestion: string;
}

interface Lecture {
  _id: string;
  title: string;
  currentSegment: number;
  status: "teaching" | "paused" | "completed";
  segments: LectureSegment[];
}

interface Message {
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
        <header className="h-[70px] shrink-0 flex items-center justify-between px-7 border-b border-[#262B34]">
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

        <div className="flex-1 overflow-hidden">{children}</div>
      </div>
    </div>
  );
}

export default function LectureRoom() {
  const { lectureId } = useParams();

  const [lecture, setLecture] = useState<Lecture | null>(null);
  const [loading, setLoading] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "teacher",
      text: "Welcome. I will teach this book section by section. You can interrupt me anytime with a question.",
    },
  ]);

  const fetchLecture = useCallback(async () => {
    setLoading(true);

    try {
      const res = await api.get(`/api/lecture/${lectureId}`);
      setLecture(res.data.lecture);
    } finally {
      setLoading(false);
    }
  }, [lectureId]);

  useEffect(() => {
    fetchLecture();

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [fetchLecture]);

  const segment = lecture?.segments[lecture.currentSegment];
  const progress = useMemo(() => {
    if (!lecture?.segments.length) return 0;
    return Math.round(((lecture.currentSegment + 1) / lecture.segments.length) * 100);
  }, [lecture]);

  const updateState = useCallback(async (updates: Partial<Lecture>) => {
    if (!lectureId) return;

    const res = await api.patch(`/api/lecture/${lectureId}/state`, updates);
    setLecture(res.data.lecture);
  }, [lectureId]);

  const speak = (text: string, onEnd?: () => void) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    utterance.pitch = 1;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => {
      setSpeaking(false);
      onEnd?.();
    };
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const startTeaching = async () => {
    if (!lecture || !segment) return;

    await updateState({ status: "teaching" } as Partial<Lecture>);
    speak(segment.script, async () => {
      await updateState({ status: "paused" } as Partial<Lecture>);
    });
  };

  const pauseTeaching = async () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
    await updateState({ status: "paused" } as Partial<Lecture>);
  };

  const goToSegment = async (nextSegment: number) => {
    if (!lecture) return;

    window.speechSynthesis.cancel();
    setSpeaking(false);
    await updateState({
      currentSegment: Math.max(0, Math.min(nextSegment, lecture.segments.length - 1)),
      status: "paused",
    } as Partial<Lecture>);
  };

  const askTeacher = async () => {
    const trimmed = question.trim();
    if (!trimmed || asking || !lectureId) return;

    window.speechSynthesis.cancel();
    setSpeaking(false);
    setQuestion("");
    setAsking(true);
    setMessages((prev) => [...prev, { sender: "student", text: trimmed }]);

    try {
      const res = await api.post(`/api/lecture/${lectureId}/ask`, {
        question: trimmed,
      });
      const answer = res.data.answer;
      setLecture(res.data.lecture);
      setMessages((prev) => [...prev, { sender: "teacher", text: answer }]);
      speak(answer);
    } finally {
      setAsking(false);
    }
  };

  if (loading || !lecture || !segment) {
    return (
      <AppChrome>
        <div className="min-h-full flex items-center justify-center">
          <Loader2 className="animate-spin text-[#22C58B]" size={30} />
        </div>
      </AppChrome>
    );
  }

  return (
    <AppChrome
      headerRight={
        <div className="text-right">
          <p className="sg-mono text-[10px] uppercase tracking-[0.22em] text-[#22C58B] flex items-center justify-end gap-1.5">
            <span className="sg-live-dot w-1.5 h-1.5 rounded-full bg-[#22C58B]" />
            Live AI Video Lecture
          </p>
          <h1 className="sg-serif font-semibold">{lecture.title}</h1>
        </div>
      }
    >
      <div className="h-full grid grid-cols-[minmax(0,1fr)_390px]">
        <section className="relative overflow-hidden border-r border-[#262B34] bg-[#05070B]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_34%,#183454_0,#071019_54%,#05070B_100%)]" />
          <div className="absolute inset-0 opacity-20 bg-[linear-gradient(#202632_1px,transparent_1px),linear-gradient(90deg,#202632_1px,transparent_1px)] bg-[size:48px_48px]" />

          <div className="relative z-10 h-full flex flex-col">
            <div className="sg-rise px-10 pt-8 shrink-0" style={{ animationDelay: "0ms" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="sg-mono text-xs uppercase tracking-[0.22em] text-[#8B92A3]">
                  Class part {lecture.currentSegment + 1} of {lecture.segments.length}
                </span>
                <span className="sg-mono text-xs text-[#22C58B] flex items-center gap-1.5">
                  {speaking && <span className="sg-live-dot w-1.5 h-1.5 rounded-full bg-[#22C58B]" />}
                  {speaking ? "Teacher speaking" : `${progress}% complete`}
                </span>
              </div>
              <div className="h-2 bg-[#0E1116] border border-[#202632]">
                <div className="sg-progress-fill h-full bg-[#22C58B]" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="flex-1 min-h-0 px-10 py-7">
              <div className="relative h-full min-h-[420px] overflow-hidden border border-[#273243] bg-[#0B0E13]/80">
                <div
                  className="sg-rise absolute left-8 top-8 z-20 max-w-[380px] border border-[#2D3545] bg-[#05070B]/90 p-5"
                  style={{ animationDelay: "60ms" }}
                >
                  <p className="sg-mono text-[10px] uppercase tracking-[0.22em] text-[#22C58B]">
                    Today's class
                  </p>
                  <h2 className="sg-serif mt-3 text-3xl font-semibold leading-tight text-[#ECEEF3]">
                    {segment.heading}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-[#A8AFBE]">
                    {segment.objective}
                  </p>
                </div>

                <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#05070B] via-[#05070B]/80 to-transparent" />

                <div className="absolute inset-0 flex items-end justify-center pb-24">
                  <div className="relative h-full w-full max-w-[430px] max-h-[620px] aspect-[430/620] overflow-hidden">
                    <Live2DTeacher speaking={speaking} />
                  </div>
                </div>

                <div className="absolute bottom-8 left-8 right-8 z-20">
                  <div
                    className="sg-rise sg-caption-card border border-[#2D3545] bg-[#05070B]/95 p-5 shadow-2xl"
                    style={{ animationDelay: "120ms" }}
                  >
                    <p className="sg-mono text-[10px] uppercase tracking-[0.22em] text-[#8B92A3] mb-2">
                      Live teacher captions
                    </p>
                    <p className="text-lg leading-8 text-[#D9DDE7] line-clamp-3">
                      {segment.script}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-10 pb-8 shrink-0 flex items-center justify-between gap-4">
              <div className="flex gap-3">
                <button
                  onClick={startTeaching}
                  disabled={speaking}
                  className="sg-press px-5 py-3 bg-[#22C58B] text-[#062016] font-semibold text-sm sg-mono disabled:opacity-50 flex items-center gap-2"
                >
                  <Play size={17} />
                  START / CONTINUE
                </button>
                <button
                  onClick={pauseTeaching}
                  disabled={!speaking}
                  className="sg-press px-5 py-3 border border-[#F2B705]/50 text-[#F2B705] text-sm sg-mono disabled:opacity-50 flex items-center gap-2"
                >
                  <Pause size={17} />
                  PAUSE
                </button>
                <button
                  onClick={pauseTeaching}
                  className="sg-press px-5 py-3 border border-[#E8556B]/50 text-[#E8556B] text-sm sg-mono flex items-center gap-2"
                >
                  <Square size={17} />
                  STOP
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  disabled={lecture.currentSegment === 0}
                  onClick={() => goToSegment(lecture.currentSegment - 1)}
                  className="sg-press px-4 py-3 border border-[#2D3545] disabled:opacity-40"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  disabled={lecture.currentSegment === lecture.segments.length - 1}
                  onClick={() => goToSegment(lecture.currentSegment + 1)}
                  className="sg-press px-4 py-3 border border-[#2D3545] disabled:opacity-40"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </section>

        <aside className="bg-[#0B0E13] flex flex-col">
          <div className="p-5 border-b border-[#262B34]">
            <div className="flex items-center gap-2">
              <Mic size={18} className="text-[#22C58B]" />
              <h2 className="sg-serif font-semibold">Talk To Teacher</h2>
            </div>
            <p className="text-xs text-[#8B92A3] mt-1">
              Interrupt the lecture, ask a question, then continue.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((message, index) => (
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
                      : "border-[#262B34] bg-[#05070B] text-[#D9DDE7]"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}

            {asking && <p className="sg-mono text-sm text-[#8B92A3]">Teacher is answering...</p>}
          </div>

          <div className="p-5 border-t border-[#262B34]">
            <div className="flex gap-2">
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") askTeacher();
                }}
                placeholder="Ask your teacher..."
                className="sg-mono min-w-0 flex-1 bg-[#05070B] border border-[#262B34] px-3 py-3 text-sm outline-none focus:border-[#22C58B]"
              />
              <button
                onClick={askTeacher}
                disabled={asking || !question.trim()}
                className="sg-press px-4 bg-[#22C58B] text-[#062016] disabled:opacity-50"
                aria-label="Ask teacher"
              >
                {asking ? <Loader2 className="animate-spin" size={17} /> : <Send size={17} />}
              </button>
            </div>
          </div>
        </aside>
      </div>
    </AppChrome>
  );
}
