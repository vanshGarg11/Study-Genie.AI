import { useState } from "react";
import AppLayout from "../components/AppLayout";
import {
  Trophy,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  Loader2,
  Award,
  Flame,
} from "lucide-react";
import { motion } from "framer-motion";
import api from "../services/api";
import { useUser } from "../context/userContextValue";
import toast from "react-hot-toast";

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export default function Quiz() {
  const { refreshUser, user } = useUser();
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<{
    questionIndex: number;
    selected: string;
    isCorrect: boolean;
  }[]>([]);

  const handleGenerate = async (targetTopic?: string) => {
    const searchTopic = (targetTopic ?? topic).trim();
    if (!searchTopic) {
      toast.error("Please enter a subject or topic for the quiz.");
      return;
    }

    if ((user?.coins ?? 0) < 3) {
      toast.error("You need at least 3 coins to generate a quiz.");
      return;
    }

    setLoading(true);
    setQuestions([]);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setIsQuizCompleted(false);
    setUserAnswers([]);

    try {
      const res = await api.post("/api/ai/quiz", { topic: searchTopic });
      const rawQuiz = res.data.quiz || [];
      if (rawQuiz.length === 0) {
        toast.error("Could not generate quiz. Please try another topic.");
      } else {
        setQuestions(rawQuiz);
        await refreshUser();
        toast.success(`Generated ${rawQuiz.length} quiz questions!`);
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to generate quiz. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (option: string) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(option);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOption || isAnswerSubmitted) return;

    const currentQ = questions[currentIndex];
    const isCorrect =
      selectedOption.trim().toLowerCase() === currentQ.answer.trim().toLowerCase() ||
      currentQ.answer.trim().toLowerCase().startsWith(selectedOption.trim().toLowerCase());

    setIsAnswerSubmitted(true);

    if (isCorrect) {
      const newScore = score + 1;
      const newStreak = streak + 1;
      setScore(newScore);
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);
      toast.success("Correct answer! 🔥");
    } else {
      setStreak(0);
      toast.error("Incorrect.");
    }

    setUserAnswers((prev) => [
      ...prev,
      {
        questionIndex: currentIndex,
        selected: selectedOption,
        isCorrect,
      },
    ]);
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsQuizCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setStreak(0);
    setIsQuizCompleted(false);
    setUserAnswers([]);
  };

  const currentQ = questions[currentIndex];
  const progress = questions.length
    ? ((currentIndex + 1) / questions.length) * 100
    : 0;

  return (
    <AppLayout
      title="Interactive Quiz Arena"
      subtitle="Assess your comprehension with instant feedback and explanations (-3 coins)"
      actionButton={
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-xl font-bold">
            3 Coins / Assessment
          </span>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Topic Input Bar */}
        <div className="p-4 sm:p-6 rounded-3xl neon-card bg-gradient-to-r from-[#0D0F1A] via-[#08090E] to-[#0D0F1A] border border-rose-500/25 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Trophy
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-400"
              />
              <input
                type="text"
                placeholder="e.g. World War II, Data Structures, Human Anatomy, Microeconomics..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleGenerate();
                }}
                className="input-neon w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm"
              />
            </div>

            <button
              onClick={() => handleGenerate()}
              disabled={loading || !topic.trim()}
              className="btn-violet px-6 py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 cursor-pointer shadow-lg shadow-violet-600/25"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Sparkles size={18} />
              )}
              <span>{loading ? "Generating Quiz..." : "Launch Quiz"}</span>
            </button>
          </div>
        </div>

        {/* Active Question Stage */}
        {questions.length > 0 && !isQuizCompleted && currentQ && (
          <div className="p-6 sm:p-10 rounded-3xl neon-card space-y-6 border-rose-500/20">
            {/* Header Status */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-rose-400">
                Question {currentIndex + 1} of {questions.length}
              </span>

              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="text-gray-300">Score: {score}</span>
                {streak > 1 && (
                  <span className="text-amber-400 flex items-center gap-1 font-bold">
                    <Flame size={14} className="text-amber-400" /> {streak} Streak!
                  </span>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-violet-500 transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Question Text */}
            <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-snug">
              {currentQ.question}
            </h3>

            {/* Options List */}
            <div className="grid grid-cols-1 gap-3 pt-2">
              {currentQ.options.map((opt, i) => {
                const isSelected = selectedOption === opt;
                const isCorrect =
                  opt.trim().toLowerCase() === currentQ.answer.trim().toLowerCase() ||
                  currentQ.answer.trim().toLowerCase().startsWith(opt.trim().toLowerCase());
                const letter = String.fromCharCode(65 + i);

                let btnStyle = "bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.05] text-gray-300";

                if (isAnswerSubmitted) {
                  if (isCorrect) {
                    btnStyle = "bg-emerald-500/15 border-emerald-500/60 text-white glow-emerald-sm";
                  } else if (isSelected && !isCorrect) {
                    btnStyle = "bg-rose-500/15 border-rose-500/60 text-white glow-rose";
                  } else {
                    btnStyle = "opacity-40 border-white/[0.04] text-gray-500";
                  }
                } else if (isSelected) {
                  btnStyle = "bg-violet-600/20 border-violet-500/60 text-white glow-violet";
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleOptionSelect(opt)}
                    disabled={isAnswerSubmitted}
                    className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${btnStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-black/40 border border-white/[0.08] font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        {letter}
                      </span>
                      <span className="text-sm font-semibold">{opt}</span>
                    </div>

                    {isAnswerSubmitted && isCorrect && (
                      <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                    )}
                    {isAnswerSubmitted && isSelected && !isCorrect && (
                      <XCircle size={18} className="text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation Card */}
            {isAnswerSubmitted && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-black/50 border border-white/[0.08] space-y-1"
              >
                <span className="text-[10px] font-mono uppercase font-bold text-cyan-400 block">
                  Explanation & Concept
                </span>
                <p className="text-xs text-gray-200 leading-relaxed">
                  {currentQ.explanation || `The correct answer is "${currentQ.answer}".`}
                </p>
              </motion.div>
            )}

            {/* Action Bar */}
            <div className="flex justify-end pt-2">
              {!isAnswerSubmitted ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!selectedOption}
                  className="btn-cyan px-6 py-3 rounded-2xl text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="btn-violet px-6 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-violet-600/25"
                >
                  <span>{currentIndex < questions.length - 1 ? "Next Question" : "View Results"}</span>
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Results Summary Modal / Card */}
        {isQuizCompleted && (
          <div className="p-8 sm:p-12 rounded-3xl neon-card text-center space-y-8 border-violet-500/30">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 via-rose-500 to-violet-600 p-0.5 shadow-xl shadow-violet-600/30">
              <div className="w-full h-full rounded-[22px] bg-[#0D0F1A] flex items-center justify-center text-amber-400">
                <Trophy size={40} />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-black text-white tracking-tight">
                Assessment Completed!
              </h2>
              <p className="text-gray-300 text-sm">
                You scored <span className="font-mono font-bold text-cyan-400">{score}</span> out of <span className="font-mono font-bold text-white">{questions.length}</span> questions.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <span className="text-[10px] uppercase font-mono text-gray-400 block">Accuracy</span>
                <span className="text-xl font-bold font-mono text-emerald-400">
                  {Math.round((score / questions.length) * 100)}%
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <span className="text-[10px] uppercase font-mono text-gray-400 block">Best Streak</span>
                <span className="text-xl font-bold font-mono text-amber-400">
                  {maxStreak} 🔥
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <span className="text-[10px] uppercase font-mono text-gray-400 block">Points</span>
                <span className="text-xl font-bold font-mono text-violet-400">
                  +{score * 10}
                </span>
              </div>
            </div>

            {/* Detailed Question Review List */}
            {userAnswers.length > 0 && (
              <div className="text-left space-y-3 pt-6 border-t border-white/[0.06] max-w-2xl mx-auto">
                <span className="text-xs font-mono uppercase font-bold text-gray-400 block">
                  Question Breakdown
                </span>
                <div className="space-y-2.5">
                  {userAnswers.map((ua, i) => {
                    const qObj = questions[ua.questionIndex];
                    if (!qObj) return null;
                    return (
                      <div
                        key={i}
                        className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                          ua.isCorrect
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                            : "bg-rose-500/10 border-rose-500/30 text-rose-200"
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span>Q{i + 1}: {qObj.question}</span>
                          <span>{ua.isCorrect ? "✓ Correct" : "✗ Incorrect"}</span>
                        </div>
                        <p className="text-gray-300">
                          Your choice: <span className="font-semibold text-white">{ua.selected}</span>
                        </p>
                        {!ua.isCorrect && (
                          <p className="text-emerald-300">
                            Correct answer: <span className="font-semibold">{qObj.answer}</span>
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                onClick={handleRestart}
                className="btn-ghost flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold cursor-pointer"
              >
                <RotateCcw size={16} />
                <span>Retry Quiz</span>
              </button>

              <button
                onClick={() => {
                  setQuestions([]);
                  setIsQuizCompleted(false);
                }}
                className="btn-violet flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold cursor-pointer shadow-lg shadow-violet-600/25"
              >
                <Award size={16} />
                <span>Try Another Topic</span>
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {questions.length === 0 && !loading && !isQuizCompleted && (
          <div className="p-16 rounded-3xl neon-card text-center space-y-4 border-dashed">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <HelpCircle size={32} />
            </div>
            <h3 className="text-lg font-bold text-white">
              No Active Quiz Arena
            </h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
              Type any subject or chapter above to instantly launch an interactive multiple-choice assessment with instant answer explanations.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
