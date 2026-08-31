import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import {
  Send,
  Bot,
  User,
  Plus,
  MessageSquare,
  Copy,
  Check,
  BookOpenCheck,
  Video,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import api from "../services/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import toast from "react-hot-toast";

interface Message {
  sender: "user" | "ai";
  text: string;
}

interface ChatSession {
  _id: string;
  title: string;
  isPinned: boolean;
  messages: Message[];
  createdAt: string;
}

export default function PDFChat() {
  const { pdfId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [pdfName, setPdfName] = useState("Document");
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatingLesson, setGeneratingLesson] = useState(false);
  const [generatingLecture, setGeneratingLecture] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);

  useEffect(() => {
    const fetchDocAndSessions = async () => {
      if (!pdfId) return;
      try {
        const res = await api.get(`/api/pdf/chat/${pdfId}`);
        setPdfName(res.data.pdfName || "Document");
        const list = res.data.chats || [];
        setSessions(list);
        if (list.length > 0) {
          setActiveSessionId(list[0]._id);
          setMessages(list[0].messages || []);
        }

        const suggRes = await api.get(`/api/pdf/${pdfId}/suggested-questions`);
        setSuggestedQuestions(suggRes.data.questions || []);
      } catch {
        toast.error("Could not load chat session.");
      }
    };
    fetchDocAndSessions();
  }, [pdfId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const switchSession = (sessionId: string) => {
    const target = sessions.find((s) => s._id === sessionId);
    if (target) {
      setActiveSessionId(sessionId);
      setMessages(target.messages || []);
    }
  };

  const createNewSession = async () => {
    if (!pdfId) return;
    try {
      const res = await api.post(`/api/pdf/chat/${pdfId}/new`);
      const newSession = res.data.chat;
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(newSession._id);
      setMessages([]);
      toast.success("New chat session started.");
    } catch {
      toast.error("Failed to start new chat.");
    }
  };

  const sendMessage = async (questionText?: string) => {
    const q = (questionText ?? input).trim();
    if (!q || loading || !pdfId) return;

    const userMsg: Message = { sender: "user", text: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post(`/api/pdf/chat/${pdfId}`, {
        question: q,
        chatId: activeSessionId,
      });

      const aiMsg: Message = { sender: "ai", text: res.data.answer };
      setMessages((prev) => [...prev, aiMsg]);

      if (res.data.chatId && !activeSessionId) {
        setActiveSessionId(res.data.chatId);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to get AI answer.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const createLesson = async () => {
    if (!pdfId) return;
    setGeneratingLesson(true);
    try {
      const res = await api.post(`/api/lesson/generate/${pdfId}`);
      toast.success("AI Lesson presentation created!");
      navigate(`/lesson/${res.data.lesson._id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to generate lesson.");
    } finally {
      setGeneratingLesson(false);
    }
  };

  const createLecture = async () => {
    if (!pdfId) return;
    setGeneratingLecture(true);
    try {
      const res = await api.post(`/api/lecture/generate/${pdfId}`);
      toast.success("Live2D video lecture generated!");
      navigate(`/lecture/${res.data.lecture._id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to generate lecture.");
    } finally {
      setGeneratingLecture(false);
    }
  };

  return (
    <AppLayout
      title={`Chat: ${pdfName}`}
      subtitle="Strict citation grounded answers from your uploaded document"
      actionButton={
        <div className="flex items-center gap-2">
          <button
            onClick={createLesson}
            disabled={generatingLesson}
            className="btn-ghost flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
          >
            {generatingLesson ? <Loader2 size={13} className="animate-spin" /> : <BookOpenCheck size={13} />}
            <span>{generatingLesson ? "Creating Slides..." : "Generate Lesson"}</span>
          </button>

          <button
            onClick={createLecture}
            disabled={generatingLecture}
            className="btn-cyan flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold"
          >
            {generatingLecture ? <Loader2 size={13} className="animate-spin" /> : <Video size={13} />}
            <span>{generatingLecture ? "Scripting Avatar..." : "Live2D Lecture"}</span>
          </button>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto h-[calc(100vh-140px)] grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sessions Sidebar */}
        <div className="hidden lg:flex lg:col-span-3 flex-col justify-between p-4 rounded-3xl neon-card overflow-hidden">
          <div className="space-y-3 flex-1 flex flex-col min-h-0">
            <button
              onClick={createNewSession}
              className="btn-violet w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-violet-600/20"
            >
              <Plus size={15} />
              <span>New Chat Session</span>
            </button>

            <span className="text-[10px] font-mono uppercase font-bold text-gray-500 block px-1">
              Chat History
            </span>

            <div className="space-y-1.5 overflow-y-auto flex-1 pr-1">
              {sessions.map((s) => {
                const isActive = activeSessionId === s._id;
                return (
                  <button
                    key={s._id}
                    onClick={() => switchSession(s._id)}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all cursor-pointer ${
                      isActive
                        ? "bg-violet-600/20 border-violet-500/40 text-white font-bold"
                        : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] text-gray-400"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <MessageSquare size={13} className={isActive ? "text-violet-400" : "text-gray-500"} />
                      <span className="truncate">{s.title || "Study Session"}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Conversation Window */}
        <div className="lg:col-span-9 flex flex-col justify-between p-6 rounded-3xl neon-card overflow-hidden bg-gradient-to-b from-[#0D0F1A] to-[#08090E] border border-violet-500/20">
          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 min-h-0">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 max-w-lg mx-auto py-8">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center text-white shadow-xl shadow-violet-600/30 animate-float">
                  <Bot size={30} />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-extrabold text-white">
                    What would you like to explore in this document?
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Answers are strictly grounded in your uploaded PDF. Ask for summaries, formula breakdowns, definitions, or exam questions.
                  </p>
                </div>

                {/* Suggested Questions */}
                {suggestedQuestions.length > 0 && (
                  <div className="w-full space-y-2 pt-2">
                    <span className="text-[10px] font-mono uppercase font-bold text-violet-400 block text-left">
                      Suggested Questions
                    </span>
                    <div className="grid grid-cols-1 gap-2">
                      {suggestedQuestions.slice(0, 3).map((sq, i) => (
                        <button
                          key={i}
                          onClick={() => sendMessage(sq)}
                          className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-violet-500/40 text-left text-xs text-gray-300 hover:text-white transition-all cursor-pointer"
                        >
                          "{sq}"
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isUser = msg.sender === "user";
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-start gap-3 ${
                      isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-300 flex items-center justify-center shrink-0 mt-1">
                        <Bot size={16} />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        isUser
                          ? "bg-violet-600/25 border border-violet-500/40 text-white ml-8 shadow-sm"
                          : "bg-white/[0.03] border border-white/[0.08] text-gray-200 mr-8"
                      }`}
                    >
                      {isUser ? (
                        <p>{msg.text}</p>
                      ) : (
                        <div className="space-y-3">
                          <div className="prose prose-invert max-w-none text-xs sm:text-sm">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {msg.text}
                            </ReactMarkdown>
                          </div>

                          <div className="flex items-center justify-end pt-2 border-t border-white/[0.06]">
                            <button
                              onClick={() => handleCopy(msg.text, idx)}
                              className="text-gray-400 hover:text-white flex items-center gap-1 text-[10px] font-mono cursor-pointer"
                            >
                              {copiedIndex === idx ? (
                                <Check size={12} className="text-emerald-400" />
                              ) : (
                                <Copy size={12} />
                              )}
                              <span>{copiedIndex === idx ? "Copied" : "Copy"}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {isUser && (
                      <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 flex items-center justify-center shrink-0 mt-1">
                        <User size={16} />
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}

            {loading && (
              <div className="flex items-center gap-3 text-xs text-violet-400 p-2">
                <Loader2 size={16} className="animate-spin" />
                <span className="font-mono">Gemini AI searching citations & reasoning...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="pt-4 border-t border-white/[0.06]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                placeholder="Ask anything about this document..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="input-neon flex-1 px-4 py-3 rounded-2xl text-xs sm:text-sm"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="btn-violet px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-40 cursor-pointer shadow-lg shadow-violet-600/25"
              >
                <Send size={15} />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
