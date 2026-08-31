import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Mic,
  Pause,
  Play,
  Send,
  Square,
} from "lucide-react";
import api from "../services/api";
import Live2DTeacher from "../components/Live2DTeacher";
import toast from "react-hot-toast";

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
      text: "Welcome to class! I will guide you through this document section by section. Feel free to interrupt me with questions at any time.",
    },
  ]);

  const fetchLecture = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/lecture/${lectureId}`);
      setLecture(res.data.lecture);
    } catch {
      toast.error("Could not load video lecture.");
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

  const updateState = useCallback(
    async (updates: Partial<Lecture>) => {
      if (!lectureId) return;
      try {
        const res = await api.patch(`/api/lecture/${lectureId}/state`, updates);
        setLecture(res.data.lecture);
      } catch {
        // Non-blocking
      }
    },
    [lectureId]
  );

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
      currentSegment: Math.max(
        0,
        Math.min(nextSegment, lecture.segments.length - 1)
      ),
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
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: "teacher",
          text: "I couldn't answer that right now. Please try again.",
        },
      ]);
    } finally {
      setAsking(false);
    }
  };

  if (loading || !lecture || !segment) {
    return (
      <AppLayout title="Entering AI Lecture Room...">
        <div className="h-96 flex items-center justify-center">
          <Loader2 className="animate-spin text-cyan-400" size={32} />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title={`Live AI Classroom: ${lecture.title}`}
      subtitle={`Part ${lecture.currentSegment + 1} of ${lecture.segments.length} • Live2D Interactive Teacher`}
      actionButton={
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full badge-cyan text-xs font-mono font-semibold">
            <span className={`w-2 h-2 rounded-full ${speaking ? "bg-cyan-400 animate-ping" : "bg-cyan-500"}`} />
            {speaking ? "Teacher Speaking" : "Live Ready"}
          </span>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-6">
        {/* Main Stage & Live2D Avatar */}
        <div className="flex-1 p-6 sm:p-8 rounded-3xl neon-card flex flex-col justify-between relative overflow-hidden bg-gradient-to-b from-[#0F172A]/90 to-[#08090E] border-cyan-500/20">
          <div className="space-y-3 z-10">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full badge-violet font-mono text-xs font-semibold uppercase tracking-wider">
                Segment {lecture.currentSegment + 1} of {lecture.segments.length}
              </span>
              <span className="text-xs font-mono text-cyan-400 font-bold">
                {progress}% Complete
              </span>
            </div>

            <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-violet-500 transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="pt-2">
              <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
                {segment.heading}
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                {segment.objective}
              </p>
            </div>
          </div>

          {/* Live2D Avatar Stage */}
          <div className="relative my-auto flex items-center justify-center min-h-[280px] max-h-[400px]">
            <div className="w-full max-w-[340px] aspect-[430/620] overflow-hidden">
              <Live2DTeacher speaking={speaking} />
            </div>
          </div>

          {/* Captions & Controls Bottom */}
          <div className="space-y-4 z-10 pt-2">
            <div className="p-4 rounded-2xl bg-black/60 border border-white/[0.08] backdrop-blur-md">
              <span className="text-[10px] font-mono uppercase font-bold text-gray-400 block mb-1">
                Live Speech Subtitles
              </span>
              <p className="text-sm text-gray-200 line-clamp-2 leading-relaxed italic">
                "{segment.script}"
              </p>
            </div>

            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={startTeaching}
                  disabled={speaking}
                  className="btn-cyan px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 disabled:opacity-40 cursor-pointer"
                >
                  <Play size={15} />
                  <span>Start Lecture</span>
                </button>

                <button
                  onClick={pauseTeaching}
                  disabled={!speaking}
                  className="btn-ghost px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 disabled:opacity-40 cursor-pointer"
                >
                  <Pause size={15} />
                  <span>Pause</span>
                </button>

                <button
                  onClick={pauseTeaching}
                  className="px-4 py-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500/25 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Square size={15} />
                  <span>Stop</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={lecture.currentSegment === 0}
                  onClick={() => goToSegment(lecture.currentSegment - 1)}
                  className="btn-ghost p-2.5 rounded-xl disabled:opacity-30 cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>

                <button
                  disabled={
                    lecture.currentSegment === lecture.segments.length - 1
                  }
                  onClick={() => goToSegment(lecture.currentSegment + 1)}
                  className="btn-ghost p-2.5 rounded-xl disabled:opacity-30 cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Live Interruption Q&A Sidebar */}
        <div className="w-full lg:w-96 p-5 rounded-3xl neon-card flex flex-col justify-between shrink-0 h-64 lg:h-full border-cyan-500/20">
          <div className="space-y-3 flex-1 flex flex-col min-h-0">
            <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
              <Mic size={18} className="text-cyan-400" />
              <div>
                <h3 className="text-sm font-bold text-white">Ask AI Teacher</h3>
                <p className="text-[10px] text-gray-400">
                  Interrupt to clarify points in real-time
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === "student"
                      ? "bg-violet-600/20 border border-violet-500/30 text-violet-200 ml-4"
                      : "bg-white/[0.03] border border-white/[0.06] text-gray-200 mr-4"
                  }`}
                >
                  <span className="text-[10px] font-mono font-bold uppercase block text-gray-400 mb-1">
                    {msg.sender === "student" ? "You" : "Teacher"}
                  </span>
                  <p>{msg.text}</p>
                </div>
              ))}

              {asking && (
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-2 text-xs text-cyan-400 font-mono">
                  <Loader2 size={14} className="animate-spin" />
                  <span>Teacher is explaining...</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-white/[0.06] flex gap-2">
            <input
              type="text"
              placeholder="Interrupt with a question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") askTeacher();
              }}
              className="input-neon flex-1 px-3.5 py-2.5 rounded-2xl text-xs"
            />
            <button
              onClick={askTeacher}
              disabled={asking || !question.trim()}
              className="btn-cyan p-2.5 rounded-2xl disabled:opacity-40 cursor-pointer"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
