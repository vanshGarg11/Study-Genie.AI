import { useEffect, useState, useCallback } from "react";
import AppLayout from "../components/AppLayout";
import {
  Layers,
  Sparkles,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  CheckCircle2,
  XCircle,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { motion } from "framer-motion";
import api from "../services/api";
import { useUser } from "../context/userContextValue";
import toast from "react-hot-toast";

interface Flashcard {
  front: string;
  back: string;
}

export default function Flashcards() {
  const { refreshUser, user } = useUser();
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [deck, setDeck] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mastered, setMastered] = useState<number[]>([]);
  const [needsReview, setNeedsReview] = useState<number[]>([]);

  const handleGenerate = async (targetTopic?: string) => {
    const searchTopic = (targetTopic ?? topic).trim();
    if (!searchTopic) {
      toast.error("Please enter a topic for your flashcard deck.");
      return;
    }

    if ((user?.coins ?? 0) < 3) {
      toast.error("You need at least 3 coins to generate flashcards.");
      return;
    }

    setLoading(true);
    setDeck([]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setMastered([]);
    setNeedsReview([]);

    try {
      const res = await api.post("/api/ai/flashcards", { topic: searchTopic });
      const cards = res.data.flashcards || [];
      if (cards.length === 0) {
        toast.error("Could not generate cards. Please try another topic.");
      } else {
        setDeck(cards);
        await refreshUser();
        toast.success(`Generated ${cards.length} flashcards!`);
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to generate flashcard deck."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNext = useCallback(() => {
    if (currentIndex < deck.length - 1) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, deck.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleShuffle = () => {
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    toast.success("Deck shuffled!");
  };

  const markMastered = () => {
    if (!mastered.includes(currentIndex)) {
      setMastered((prev) => [...prev, currentIndex]);
      setNeedsReview((prev) => prev.filter((i) => i !== currentIndex));
    }
    handleNext();
  };

  const markReview = () => {
    if (!needsReview.includes(currentIndex)) {
      setNeedsReview((prev) => [...prev, currentIndex]);
      setMastered((prev) => prev.filter((i) => i !== currentIndex));
    }
    handleNext();
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (deck.length === 0) return;
      if (e.code === "Space") {
        e.preventDefault();
        handleFlip();
      } else if (e.code === "ArrowRight") {
        handleNext();
      } else if (e.code === "ArrowLeft") {
        handlePrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deck, handleFlip, handleNext, handlePrev]);

  const currentCard = deck[currentIndex];
  const progress = deck.length ? ((currentIndex + 1) / deck.length) * 100 : 0;

  return (
    <AppLayout
      title="3D Spaced Flashcards"
      subtitle="Interactive active recall decks powered by Gemini AI (-3 coins)"
      actionButton={
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-xl font-bold">
            3 Coins / Deck
          </span>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Topic Input Bar */}
        <div className="p-4 sm:p-6 rounded-3xl neon-card bg-gradient-to-r from-[#0D0F1A] via-[#08090E] to-[#0D0F1A] border border-cyan-500/25 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Layers
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400"
              />
              <input
                type="text"
                placeholder="e.g. Organic Chemistry Reactions, Cell Division, Macroeconomics, Spanish Vocab..."
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
              className="btn-cyan px-6 py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Sparkles size={18} />
              )}
              <span>{loading ? "Generating Deck..." : "Generate Cards"}</span>
            </button>
          </div>
        </div>

        {/* Active Flashcard Viewer */}
        {deck.length > 0 && currentCard && (
          <div className="space-y-6">
            {/* Header Toolbar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold uppercase text-cyan-400">
                  Card {currentIndex + 1} of {deck.length}
                </span>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-emerald-400">✓ {mastered.length} Mastered</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-rose-400">↻ {needsReview.length} Review</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleShuffle}
                  className="btn-ghost p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  title="Shuffle Deck"
                >
                  <Shuffle size={14} />
                  <span className="hidden sm:inline">Shuffle</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentIndex(0);
                    setIsFlipped(false);
                    setMastered([]);
                    setNeedsReview([]);
                  }}
                  className="btn-ghost p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  title="Restart Deck"
                >
                  <RotateCcw size={14} />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              </div>
            </div>

            {/* Cyan Progress Bar */}
            <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-violet-500 transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* 3D Flip Card Container */}
            <div
              onClick={handleFlip}
              className="perspective-1000 w-full h-80 sm:h-96 cursor-pointer select-none group"
            >
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="transform-style-3d relative w-full h-full"
              >
                {/* Front Side — Concept / Prompt */}
                <div className="backface-hidden absolute inset-0 rounded-3xl p-8 sm:p-12 flex flex-col justify-between neon-card bg-gradient-to-br from-[#0F172A] via-[#0D0F1A] to-[#0A0D14] border border-cyan-500/30 glow-cyan">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20">
                      Concept / Question
                    </span>
                    <span className="text-xs text-gray-500 font-mono flex items-center gap-1">
                      <RotateCw size={13} className="text-cyan-400" /> Click or Space to flip
                    </span>
                  </div>

                  <div className="my-auto text-center px-4">
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">
                      {currentCard.front}
                    </h3>
                  </div>

                  <div className="flex justify-between items-center text-xs text-gray-500 font-mono">
                    <span>Card #{currentIndex + 1}</span>
                    <span>Front Side</span>
                  </div>
                </div>

                {/* Back Side — Explanation / Answer */}
                <div className="backface-hidden rotate-y-180 absolute inset-0 rounded-3xl p-8 sm:p-12 flex flex-col justify-between neon-card bg-gradient-to-br from-[#1A102E] via-[#0D0F1A] to-[#0A0D14] border border-violet-500/40 glow-violet">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-violet-300 bg-violet-500/15 px-2.5 py-1 rounded-md border border-violet-500/30">
                      Answer & Explanation
                    </span>
                    <span className="text-xs text-gray-500 font-mono flex items-center gap-1">
                      <RotateCw size={13} className="text-violet-400" /> Click or Space to flip
                    </span>
                  </div>

                  <div className="my-auto text-center px-4">
                    <p className="text-lg sm:text-xl text-gray-100 leading-relaxed font-medium">
                      {currentCard.back}
                    </p>
                  </div>

                  <div className="flex justify-between items-center text-xs text-gray-500 font-mono">
                    <span>Card #{currentIndex + 1}</span>
                    <span>Back Side</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Active Recall Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="btn-ghost px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={markReview}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/25 text-xs font-bold transition-colors cursor-pointer"
                >
                  <XCircle size={15} />
                  <span>Review Again</span>
                </button>

                <button
                  onClick={markMastered}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/25 text-xs font-bold transition-colors cursor-pointer"
                >
                  <CheckCircle2 size={15} />
                  <span>Mastered</span>
                </button>
              </div>

              <button
                onClick={handleNext}
                disabled={currentIndex === deck.length - 1}
                className="btn-ghost px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {deck.length === 0 && !loading && (
          <div className="p-16 rounded-3xl neon-card text-center space-y-4 border-dashed">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Layers size={32} />
            </div>
            <h3 className="text-lg font-bold text-white">
              No Flashcards Loaded
            </h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
              Enter any syllabus topic or chapter above to generate a 3D interactive flashcard deck for active recall practice.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
