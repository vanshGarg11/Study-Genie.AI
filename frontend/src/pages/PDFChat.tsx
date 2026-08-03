import { useEffect, useRef, useState } from "react";
import {
  Coins,
  FileText,
  Brain,
  Upload,
  User,
  LogOut,
  Home,
  Sparkles,
  ArrowLeft,
  FolderOpen,
  Loader2,
  Send,
  Bot,
  Plus,
  MessageSquare,
  Trash2,
  Pencil,
  Pin,
  Copy,
  RotateCcw,
  Check,
  MoreVertical,
} from "lucide-react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import api from "../services/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useUser } from "../context/userContextValue";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: Home, index: "01" },
  { label: "Generate Notes", path: "/notes", icon: Brain, index: "02" },
  { label: "Upload PDF", path: "/pdf", icon: Upload, index: "03" },
  { label: "Buy Coins", path: "/coins", icon: Coins, index: "04" },
  { label: "Profile", path: "/profile", icon: User, index: "05" },
];

type Message = {
  sender: "user" | "ai";
  text: string;
};

function PDFChat() {
  const navigate = useNavigate();
  const location = useLocation();
  const { pdfId } = useParams();
  const { refreshUser } = useUser();

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: "Ask me anything about your uploaded PDF - I'll answer using only what's in the document.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [chatId, setChatId] = useState<string>("");
  const [chatSessions, setChatSessions] = useState<any[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [lectureLoading, setLectureLoading] = useState(false);
  const [lessonError, setLessonError] = useState("");

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const closeMenu = () => setMenuOpen(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const fetchChatSessions = async () => {
    try {
      const res = await api.get(`/api/pdf/chats/${pdfId}`);
      setChatSessions(res.data.chats);
    } catch {
      setError("Could not load chat sessions. Please refresh the page.");
    }
  };

  useEffect(() => {
    if (pdfId) {
      fetchChatSessions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfId]);

  const sendQuestion = async (overrideText?: string) => {
    const trimmed = (overrideText ?? question).trim();
    if (!trimmed || loading) return;

    setError("");
    setMessages((prev) => [...prev, { sender: "user", text: trimmed }]);
    setQuestion("");
    setLoading(true);

    try {
      const res = await api.post(`/api/pdf/chat/${pdfId}`, {
        question: trimmed,
        chatId,
      });
      setMessages((prev) => [...prev, { sender: "ai", text: res.data.answer }]);
      if (!chatId) {
        setChatId(res.data.chatId);
        fetchChatSessions();
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Couldn't get an answer right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendQuestion();
  };

  const fetchChatHistory = async (selectedChatId: string) => {
    try {
      const res = await api.get(
        `/api/pdf/chat-history/${pdfId}?chatId=${selectedChatId}`
      );

      const history: Message[] = [
        {
          sender: "ai",
          text: "Ask me anything about your uploaded PDF - I'll answer using only what's in the document.",
        },
      ];

      res.data.chats.forEach((chat: any) => {
        history.push({ sender: "user", text: chat.question });
        history.push({ sender: "ai", text: chat.answer });
      });

      setMessages(history);
      setChatId(selectedChatId);
    } catch {
      setError("Could not load that chat history. Please try again.");
    }
  };

  const startNewChat = () => {
    setChatId("");
    setMessages([
      {
        sender: "ai",
        text: "Ask me anything about your uploaded PDF - I'll answer using only what's in the document.",
      },
    ]);
  };

  const deleteChat = async (id: string) => {
    if (!window.confirm("Delete this chat?")) return;

    await api.delete(`/api/pdf/chat/${id}`);

    if (chatId === id) {
      startNewChat();
    }

    fetchChatSessions();
  };

  const renameChat = async (id: string, currentTitle: string) => {
    const title = prompt("Rename Chat", currentTitle);
    if (!title) return;

    await api.patch(`/api/pdf/chat/${id}/title`, { title });
    fetchChatSessions();
  };

  const pinChat = async (id: string) => {
    await api.patch(`/api/pdf/chat/${id}/pin`);
    fetchChatSessions();
  };

  const copyMessage = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const regenerate = () => {
    const lastQuestion = [...messages].reverse().find((m) => m.sender === "user");
    if (!lastQuestion) return;
    sendQuestion(lastQuestion.text);
  };

  const lastAiIndex = messages.reduce(
    (acc, m, i) => (m.sender === "ai" ? i : acc),
    -1
  );

  const generateLesson = async () => {
    if (lessonLoading) return;

    setLessonError("");
    setLessonLoading(true);

    try {

        const res = await api.post(
            `/api/lesson/generate/${pdfId}`
        );

        await refreshUser();
        navigate(`/lesson/${res.data.lesson._id}`);

    } catch (error: any) {
        const message = error?.response?.data?.message || "";
        setLessonError(
          message.includes("no readable text")
            ? "This PDF looks scanned or image-based, so StudyGenie cannot build a lesson from it yet. Upload a text-based PDF to generate lessons."
            : message || "Lesson generation failed. Please try again."
        );
    } finally {
        setLessonLoading(false);
    }
};

  const generateLecture = async () => {
    if (lectureLoading) return;

    setLessonError("");
    setLectureLoading(true);

    try {
      const res = await api.post(`/api/lecture/generate/${pdfId}`);
      await refreshUser();
      navigate(`/lecture/${res.data.lecture._id}`);
    } catch (error: any) {
      const message = error?.response?.data?.message || "";
      setLessonError(
        message.includes("no readable text")
          ? "This PDF looks scanned or image-based, so StudyGenie cannot build a video lecture from it yet. Upload a text-based PDF."
          : message || "Video lecture generation failed. Please try again."
      );
    } finally {
      setLectureLoading(false);
    }
  };

  return (
    <div className="sg-root min-h-screen flex font-[Inter] bg-[#0E1116] text-[#ECEEF3] overflow-x-hidden relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap');

        .sg-root { --ink:#0E1116; --line:#262B34; --line-soft:#1B1F27; --paper:#ECEEF3; --muted:#7D8494; --cobalt:#4C6FFF; --amber:#F2B705; --green:#22C58B; --coral:#E8556B; }
        .sg-serif { font-family:'Fraunces', serif; font-optical-sizing:auto; }
        .sg-mono { font-family:'IBM Plex Mono', monospace; }

        .sg-rule-bg {
          background-image: repeating-linear-gradient(
            to bottom,
            transparent 0px, transparent 31px, var(--line-soft) 32px
          );
        }

        @keyframes riseIn {
          from { opacity:0; transform: translateY(14px); }
          to { opacity:1; transform: translateY(0); }
        }
        .sg-rise { opacity:0; animation: riseIn .55s cubic-bezier(.2,.7,.2,1) forwards; }

        @keyframes bounceDot {
          0%, 60%, 100% { transform: translateY(0); opacity: .4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
        .sg-typing-dot { animation: bounceDot 1.2s ease-in-out infinite; }

        .sg-nav-item {
          position: relative;
          border: 1px solid transparent;
        }
        .sg-nav-item .sg-bracket {
          position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
          background: var(--cobalt);
          transform: scaleY(0);
          transform-origin: top;
          transition: transform .28s cubic-bezier(.2,.8,.2,1);
        }
        .sg-nav-item:hover .sg-bracket, .sg-nav-item[data-active="true"] .sg-bracket {
          transform: scaleY(1);
        }
        .sg-nav-item:hover, .sg-nav-item[data-active="true"] {
          border-color: var(--line);
          background: #151920;
        }
        .sg-nav-item .sg-idx {
          transition: color .2s ease, opacity .2s ease;
          opacity: .45;
        }
        .sg-nav-item:hover .sg-idx, .sg-nav-item[data-active="true"] .sg-idx {
          opacity: 1;
          color: var(--cobalt);
        }

        .sg-card { border: 1px solid var(--line); }

        .sg-back-btn {
          transition: transform .18s ease, color .18s ease, border-color .18s ease;
        }
        .sg-back-btn:hover {
          transform: translateX(-2px);
          border-color: #3a4150;
          color: #ECEEF3;
        }

        .sg-input {
          border: 1px solid var(--line);
          background: #0B0E13;
          transition: border-color .18s ease, box-shadow .18s ease;
        }
        .sg-input:focus {
          border-color: var(--cobalt);
          box-shadow: 0 0 0 2px rgba(76,111,255,0.15);
        }

        .sg-btn-send {
          background: var(--cobalt);
          transition: transform .18s ease, box-shadow .18s ease, background .18s ease;
        }
        .sg-btn-send:hover:not(:disabled) {
          transform: translate(-2px,-2px);
          box-shadow: 4px 4px 0 0 #151920, 4px 4px 0 1px var(--line);
        }
        .sg-btn-send:active:not(:disabled) {
          transform: translate(0,0);
          box-shadow: none;
        }

        .sg-btn-logout {
          transition: background .2s ease, color .2s ease, border-color .2s ease, letter-spacing .2s ease;
        }
        .sg-btn-logout:hover { letter-spacing: 0.04em; }

        .sg-corner-cut {
          clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%);
        }

        .sg-bubble-ai {
          border: 1px solid var(--line);
          background: #0E1116;
        }
        .sg-bubble-user { background: var(--cobalt); }
        .sg-avatar { border: 1px solid var(--line); }

        .sg-chat-scroll::-webkit-scrollbar { width: 8px; }
        .sg-chat-scroll::-webkit-scrollbar-track { background: transparent; }
        .sg-chat-scroll::-webkit-scrollbar-thumb { background: #262B34; }
        .sg-sessions-scroll::-webkit-scrollbar { width: 6px; }
        .sg-sessions-scroll::-webkit-scrollbar-track { background: transparent; }
        .sg-sessions-scroll::-webkit-scrollbar-thumb { background: #262B34; }

        .sg-newchat-btn {
          border: 1px solid var(--cobalt);
          color: var(--cobalt);
          transition: background .18s ease, color .18s ease, transform .18s ease;
        }
        .sg-newchat-btn:hover {
          background: var(--cobalt);
          color: #fff;
          transform: translate(-2px,-2px);
        }

        .sg-session-item {
          position: relative;
          border-bottom: 1px solid var(--line);
          transition: background .16s ease;
        }
        .sg-session-item .sg-bracket {
          position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
          background: var(--cobalt);
          transform: scaleY(0);
          transform-origin: top;
          transition: transform .22s cubic-bezier(.2,.8,.2,1);
        }
        .sg-session-item:hover, .sg-session-item[data-active="true"] { background: #151920; }
        .sg-session-item:hover .sg-bracket, .sg-session-item[data-active="true"] .sg-bracket {
          transform: scaleY(1);
        }

        .sg-menu-btn {
          border: 1px solid transparent;
          transition: background .15s ease, border-color .15s ease;
        }
        .sg-menu-btn:hover {
          background: #262B34;
          border-color: #3a4150;
        }

        .sg-dropdown {
          border: 1px solid var(--line);
          background: #151920;
        }
        .sg-dropdown-item {
          transition: background .14s ease;
        }
        .sg-dropdown-item:hover { background: #1B1F27; }
        .sg-dropdown-item.danger {
          color: var(--coral);
        }
        .sg-dropdown-item.danger:hover {
          background: rgba(232, 85, 107, 0.12);
        }

        .sg-msg-action {
          border: 1px solid var(--line);
          transition: transform .16s ease, box-shadow .16s ease, border-color .16s ease, color .16s ease;
        }
        .sg-msg-action:hover {
          transform: translate(-2px,-2px);
          box-shadow: 2px 2px 0 0 var(--line);
          color: #ECEEF3;
        }
      `}</style>

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
            {navItems.map(({ label, path, icon: Icon, index }) => {
              const active = location.pathname === path;
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  data-active={active}
                  aria-current={active ? "page" : undefined}
                  className="sg-nav-item w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-[#B7BCC7]"
                >
                  <span className="sg-bracket" />
                  <span className="flex items-center gap-3 relative z-10">
                    <Icon size={16} className={active ? "text-[#4C6FFF]" : "text-[#7D8494]"} />
                    <span className={active ? "text-[#ECEEF3]" : ""}>{label}</span>
                  </span>
                  <span className="sg-idx sg-mono text-[10px]">{index}</span>
                </button>
              );
            })}
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
      <div className="flex-1 flex flex-col min-w-0 z-10">
        <header className="h-[72px] shrink-0 flex items-center justify-between px-9 border-b border-[#262B34]">
          <button
            onClick={() => navigate("/dashboard")}
            className="sg-back-btn flex items-center gap-2 px-3 py-2 border border-[#262B34] text-sm text-[#7D8494] sg-mono"
          >
            <ArrowLeft size={15} />
            BACK
          </button>

          <div className="flex items-baseline gap-3">
            <h2 className="sg-serif text-lg font-semibold text-[#ECEEF3]">Chat with PDF</h2>
            <span className="sg-mono text-[11px] text-[#7D8494]">/ pdf-chat</span>
          </div>

          <button
            onClick={() => navigate("/pdfs")}
            className="sg-back-btn flex items-center gap-2 px-3 py-2 border border-[#262B34] text-sm text-[#7D8494] sg-mono"
          >
            <FolderOpen size={15} />
            MY PDFS
          </button>
        </header>

        <main className="flex-1 p-9 overflow-hidden flex gap-6 sg-rule-bg">
          {/* Chat sessions panel */}
          <aside className="sg-rise sg-card bg-[#12161D] w-72 shrink-0 flex flex-col min-h-0" style={{ animationDelay: "0ms" }}>
            <div className="px-5 pt-5 pb-4 border-b border-[#262B34]">
              <span className="sg-mono text-[10px] uppercase tracking-[0.2em] text-[#7D8494]">
                Sessions
              </span>
            </div>

            <div className="p-4">
              <button
                onClick={startNewChat}
                className="sg-newchat-btn w-full py-2.5 flex items-center justify-center gap-2 text-sm font-medium sg-mono"
              >
                <Plus size={15} />
                NEW CHAT
              </button>
            </div>

            <div className="sg-sessions-scroll flex-1 overflow-y-auto">
              {chatSessions.length === 0 ? (
                <p className="px-5 py-4 text-xs sg-mono text-[#5A6070]">
                  No past sessions yet.
                </p>
              ) : (
                chatSessions.map((chat: any) => {
                  const active = chat._id === chatId;
                  return (
                    <button
                      key={chat._id}
                      onClick={() => fetchChatHistory(chat._id)}
                      data-active={active}
                      className="sg-session-item group w-full text-left px-5 py-3.5"
                    >
                      <span className="sg-bracket" />
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2 overflow-hidden">
                          {chat.pinned && (
                            <Pin size={12} className="text-[#F2B705] shrink-0" fill="#F2B705" />
                          )}
                          <MessageSquare
                            size={13}
                            className={active ? "text-[#4C6FFF] shrink-0" : "text-[#7D8494] shrink-0"}
                          />
                          <span
                            className={`truncate text-sm font-medium ${
                              active ? "text-[#ECEEF3]" : "text-[#C7CBD3]"
                            }`}
                          >
                            {chat.title || "New Chat"}
                          </span>
                        </div>

                        <div className="relative opacity-0 group-hover:opacity-100 transition shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuOpen(menuOpen === chat._id ? null : chat._id);
                            }}
                            className="sg-menu-btn p-1"
                          >
                            <MoreVertical size={15} className="text-[#7D8494]" />
                          </button>

                          {menuOpen === chat._id && (
                            <div
                              className="sg-dropdown absolute right-0 top-8 w-40 z-50 overflow-hidden"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => {
                                  renameChat(chat._id, chat.title);
                                  setMenuOpen(null);
                                }}
                                className="sg-dropdown-item w-full px-3.5 py-2.5 text-left text-sm flex items-center gap-2 text-[#C7CBD3]"
                              >
                                <Pencil size={13} />
                                Rename
                              </button>

                              <button
                                onClick={() => {
                                  pinChat(chat._id);
                                  setMenuOpen(null);
                                }}
                                className="sg-dropdown-item w-full px-3.5 py-2.5 text-left text-sm flex items-center gap-2 text-[#C7CBD3]"
                              >
                                <Pin size={13} />
                                {chat.pinned ? "Unpin" : "Pin"}
                              </button>

                              <button
                                onClick={() => {
                                  deleteChat(chat._id);
                                  setMenuOpen(null);
                                }}
                                className="sg-dropdown-item danger w-full px-3.5 py-2.5 text-left text-sm flex items-center gap-2"
                              >
                                <Trash2 size={13} />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-[#7D8494] truncate pl-[21px]">
                        {chat.lastMessage}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* Chat card */}
          <section
            className="sg-rise sg-card bg-[#12161D] flex-1 flex flex-col min-h-0"
            style={{ animationDelay: "60ms" }}
          >
            {/* Card header */}
            <div className="flex items-center gap-3 px-8 pt-8 pb-5 border-b border-[#262B34]">
              <div className="w-11 h-11 border border-[#262B34] flex items-center justify-center bg-[#0E1116] shrink-0">
                <FileText size={20} className="text-[#4C6FFF]" strokeWidth={2.2} />
              </div>
              <div className="flex justify-between items-center w-full">

    <div>
        <span className="sg-mono text-[10px] tracking-widest uppercase px-2 py-1 border border-[#4C6FFF]/30 text-[#4C6FFF]">
            AI / DOCUMENT
        </span>

        <p className="text-[#8B92A3] text-sm mt-2">
            Ask questions grounded only in your uploaded document.
        </p>
    </div>

    <div className="flex items-center gap-3">
      <button
          onClick={generateLecture}
          disabled={lectureLoading}
          className="px-5 py-2 bg-[#22C58B] text-[#062016] text-sm font-semibold transition disabled:opacity-60 flex items-center gap-2"
      >
          {lectureLoading && <Loader2 size={15} className="animate-spin" />}
          {lectureLoading ? "Preparing..." : "Start Video Lecture"}
      </button>

      <button
          onClick={generateLesson}
          disabled={lessonLoading}
          className="px-5 py-2 border border-[#4C6FFF] text-[#4C6FFF] text-sm font-medium hover:bg-[#4C6FFF] hover:text-white transition disabled:opacity-60 flex items-center gap-2"
      >
          {lessonLoading && <Loader2 size={15} className="animate-spin" />}
          {lessonLoading ? "Generating..." : "Generate Lesson"}
      </button>
    </div>

</div>
            </div>
            {lessonError && (
              <div
                role="alert"
                className="mx-8 mt-4 px-4 py-3 text-sm border border-[#E8556B]/30 text-[#E8556B] bg-[#1A0E10]"
              >
                {lessonError}
              </div>
            )}

            {/* Messages */}
            <div
              ref={scrollRef}
              className="sg-chat-scroll flex-1 overflow-y-auto px-8 py-6 space-y-5"
            >
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] flex gap-3 ${
                      message.sender === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className="sg-avatar w-9 h-9 shrink-0 flex items-center justify-center bg-[#0E1116]"
                      style={{ color: message.sender === "user" ? "#4C6FFF" : "#7D8494" }}
                    >
                      {message.sender === "user" ? <User size={16} /> : <Bot size={16} />}
                    </div>

                    <div className="flex flex-col gap-1.5 min-w-0">
                      <div
                        className={`px-5 py-3 text-sm leading-7 ${
                          message.sender === "user"
                            ? "sg-bubble-user text-white"
                            : "sg-bubble-ai text-[#C7CBD3]"
                        }`}
                      >
                        {message.sender === "user" ? (
                          message.text
                        ) : (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              h1: ({ children }) => (
                                <h1 className="text-3xl font-bold text-white mb-6">{children}</h1>
                              ),
                              h2: ({ children }) => (
                                <h2 className="text-2xl font-semibold text-white mt-8 mb-4 border-b border-[#262B34] pb-2">
                                  {children}
                                </h2>
                              ),
                              h3: ({ children }) => (
                                <h3 className="text-xl font-semibold text-white mt-6 mb-3">{children}</h3>
                              ),
                              p: ({ children }) => (
                                <p className="mb-4 text-[#C7CBD3] leading-7">{children}</p>
                              ),
                              ul: ({ children }) => (
                                <ul className="list-disc pl-6 mb-5 space-y-2">{children}</ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="list-decimal pl-6 mb-5 space-y-2">{children}</ol>
                              ),
                              li: ({ children }) => <li>{children}</li>,
                              strong: ({ children }) => (
                                <strong className="text-white font-semibold">{children}</strong>
                              ),
                              code: ({ children }) => (
                                <code className="bg-[#0B0E13] px-2 py-1 rounded text-[#4C6FFF]">
                                  {children}
                                </code>
                              ),
                              pre: ({ children }) => (
                                <pre className="bg-[#0B0E13] p-4 rounded-xl overflow-x-auto my-4 border border-[#262B34]">
                                  {children}
                                </pre>
                              ),
                              table: ({ children }) => (
                                <table className="w-full border border-[#262B34] my-5">{children}</table>
                              ),
                              th: ({ children }) => (
                                <th className="border border-[#262B34] bg-[#151920] p-3 text-left">
                                  {children}
                                </th>
                              ),
                              td: ({ children }) => (
                                <td className="border border-[#262B34] p-3">{children}</td>
                              ),
                            }}
                          >
                            {message.text}
                          </ReactMarkdown>
                        )}
                      </div>

                      {message.sender === "ai" && index !== 0 && (
                        <div className="flex items-center gap-2 pl-1">
                          <button
                            onClick={() => copyMessage(message.text, index)}
                            className="sg-msg-action flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] sg-mono text-[#7D8494]"
                          >
                            {copiedIndex === index ? (
                              <Check size={12} className="text-[#22C58B]" />
                            ) : (
                              <Copy size={12} />
                            )}
                            {copiedIndex === index ? "COPIED" : "COPY"}
                          </button>

                          {index === lastAiIndex && !loading && (
                            <button
                              onClick={regenerate}
                              className="sg-msg-action flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] sg-mono text-[#7D8494]"
                            >
                              <RotateCcw size={12} />
                              REGENERATE
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="max-w-[70%] flex gap-3">
                    <div className="sg-avatar w-9 h-9 shrink-0 flex items-center justify-center bg-[#0E1116] text-[#7D8494]">
                      <Bot size={16} />
                    </div>
                    <div className="sg-bubble-ai px-5 py-4 flex items-center gap-1.5">
                      <span className="sg-typing-dot w-1.5 h-1.5 rounded-full bg-[#4C6FFF]" style={{ animationDelay: "0s" }} />
                      <span className="sg-typing-dot w-1.5 h-1.5 rounded-full bg-[#4C6FFF]" style={{ animationDelay: "0.15s" }} />
                      <span className="sg-typing-dot w-1.5 h-1.5 rounded-full bg-[#4C6FFF]" style={{ animationDelay: "0.3s" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-dashed border-[#262B34] p-6">
              {error && (
                <div
                  role="alert"
                  className="mb-4 px-4 py-3 text-sm border border-[#E8556B]/30 text-[#E8556B] bg-[#1A0E10]"
                >
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Ask anything about this PDF…"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                  className="sg-input flex-1 px-4 py-3 outline-none text-sm sg-mono text-[#ECEEF3] placeholder-[#5A6070] disabled:opacity-60"
                />

                <button
                  onClick={() => sendQuestion()}
                  disabled={loading || !question.trim()}
                  className="sg-btn-send text-white px-6 py-3 flex items-center justify-center gap-2 font-semibold text-sm sg-mono disabled:opacity-60 shrink-0"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  {loading ? "SENDING…" : "SEND"}
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default PDFChat;

