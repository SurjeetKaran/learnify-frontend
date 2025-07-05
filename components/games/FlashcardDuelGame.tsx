"use client";

import { useEffect, useState } from "react";
import {
  RefreshCcw,
  ArrowLeftCircle,
  Send,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import api from "@/lib/api";

export default function FlashcardDuelGame() {
  const { moduleId, gameId } = useParams() as {
    moduleId: string;
    gameId: string;
  };
  const router = useRouter();

  const [cards, setCards] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [reviewed, setReviewed] = useState<any[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [guess, setGuess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [gameTitle, setGameTitle] = useState("Flashcard Duel");

  const handleNext = () => {
    setReviewed((prev) => [
      ...prev,
      {
        ...cards[index],
        guess,
        isCorrect: guess === true,
      },
    ]);
    setFlipped(false);
    setGuess(null);
    setIsCorrect(null);
    setTimeout(() => {
      if (index + 1 < cards.length) {
        setIndex((prev) => prev + 1);
      } else {
        setCompleted(true);
      }
    }, 300);
  };

  const handleRestart = () => {
    setIndex(0);
    setFlipped(false);
    setCompleted(false);
    setReviewed([]);
    setSubmitted(false);
    setGuess(null);
    setIsCorrect(null);
  };

  const handleBack = () => {
    router.push(`/game?moduleId=${moduleId}`);
  };

 const handleSubmitResult = async () => {
  const token = localStorage.getItem("token");
  if (!token || !gameId || !moduleId) return;

  setSubmitting(true);

  const score = reviewed.filter((c) => c.isCorrect).length;
  const total = cards.length;
  const log = reviewed.map((card) => ({
    question: card.front,
    correct: card.back,
    isCorrect: card.isCorrect,
    selected: card.guess ? card.back : "(Wrong guess)",
  }));

  try {
    // [1] Submit game result
    await api.post(`/module/${moduleId}/game/${gameId}/submit`, { score, total, log });
    console.log("✅ Game result submitted");

    // [2] Fetch dashboard
    const dashboard = await api.get("/dashboard");

    const course = dashboard.courseModules.find((c: any) =>
      c.completedModules.some((m: any) => m.moduleId === moduleId)
    );
    if (!course) throw new Error("Active course not found");

    const module = course.completedModules.find(
      (m: any) => m.moduleId === moduleId
    );
    if (!module) throw new Error("Module not found");

    // [3] Save dashboard progress
    const payload = {
      courseId: course.courseId,
      completedModule: {
        moduleId,
        title: module.title,
      },
      gameResult: {
        gameId,
        gameTitle: "Flashcard Duel",
        score,
        total,
        timestamp: new Date().toISOString(),
      },
    };

    await api.post("/dashboard/save", payload);
    console.log("✅ Dashboard saved");

    setSubmitted(true);
  } catch (err) {
    console.error("❌ Error submitting result:", err);
  } finally {
    setSubmitting(false);
  }
};


 useEffect(() => {
  const fetchGame = async () => {
    const token = localStorage.getItem("token");
    if (!token || !moduleId || !gameId) {
      setError("Missing token, module ID, or game ID.");
      setLoading(false);
      return;
    }

    try {
      const res = await api.get(`/module/${moduleId}/game/${gameId}`);
      // process res as needed (e.g., setGame(res))
    } catch (err) {
      console.error("❌ Failed to fetch game:", err);
      setError("Failed to load game");
    } finally {
      setLoading(false);
    }
  };

  fetchGame();
}, [moduleId, gameId]);


  if (loading)
    return <div className="text-center mt-10">⏳ Loading Flashcards...</div>;
  if (error)
    return <div className="text-center text-red-500 mt-10">{error}</div>;
  if (!cards.length)
    return <div className="text-center mt-10">❌ No flashcards found.</div>;

  return (
    <>
      <div className="relative flex flex-col items-center justify-center min-h-[100dvh] px-4 py-6 space-y-6 overflow-hidden">
        <motion.div
          className="absolute -z-10 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-pink-500 via-purple-600 to-blue-500 opacity-30 blur-3xl pointer-events-none animate-spin-slow"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
        />

        <h2 className="text-3xl font-extrabold text-blue-700 dark:text-pink-300">
          {gameTitle}
        </h2>

        {!completed ? (
          <>
            <div className="w-full max-w-md h-48 perspective">
              <div
                className={`relative w-full h-full transform-style preserve-3d transition-transform duration-500 ${
                  flipped ? "rotate-y-180" : ""
                }`}
                onClick={() => setFlipped(true)}
              >
                <div className="card-face front bg-white dark:bg-[#1c1c1c] text-gray-800 dark:text-gray-100 border-2 border-blue-300 dark:border-pink-400/40 shadow-md">
                  {cards[index].front}
                </div>
                <div className="card-face back bg-white dark:bg-[#1c1c1c] text-gray-800 dark:text-gray-100 border-2 border-blue-300 dark:border-pink-400/40 shadow-md">
                  {cards[index].back}
                  {flipped && isCorrect === null && (
                    <div className="mt-4 space-x-4">
                      <button
                        onClick={() => {
                          setGuess(true);
                          setIsCorrect(true);
                        }}
                        className="px-4 py-2 rounded bg-green-600 text-white"
                      >
                        Yes ✅
                      </button>
                      <button
                        onClick={() => {
                          setGuess(false);
                          setIsCorrect(false);
                        }}
                        className="px-4 py-2 rounded bg-red-600 text-white"
                      >
                        No ❌
                      </button>
                    </div>
                  )}

                  {isCorrect !== null && (
                    <div
                      className={`mt-4 font-bold ${
                        isCorrect ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {isCorrect ? "✅ Marked Correct" : "❌ Marked Incorrect"}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {isCorrect !== null && (
              <button
                onClick={handleNext}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:scale-105 transition"
              >
                {index + 1 === cards.length ? "Finish 📚" : "Next Card →"}
              </button>
            )}
          </>
        ) : (
          <div className="w-full max-w-2xl space-y-6 animate-fade-in">
            <p className="text-center text-3xl font-extrabold text-blue-700 dark:text-pink-300 mb-6">
              🎉 You scored{" "}
              <span className="text-green-600 dark:text-green-400">
                {reviewed.filter((c) => c.isCorrect).length}
              </span>{" "}
              out of {cards.length}
            </p>

            <div className="space-y-4">
              {reviewed.map((card, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg shadow border ${
                    card.isCorrect
                      ? "bg-green-50 border-green-300 dark:bg-green-900/20"
                      : "bg-red-50 border-red-300 dark:bg-red-900/20"
                  }`}
                >
                  <p className="font-medium text-gray-800 dark:text-gray-100">
                    {idx + 1}. {card.front}
                  </p>
                  <p className="text-sm mt-1">
                    <strong>Your Answer:</strong>{" "}
                    <span
                      className={
                        card.isCorrect
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-500 dark:text-red-400"
                      }
                    >
                      {card.guess ? card.back : <em>Incorrect</em>}
                    </span>
                  </p>
                  {!card.isCorrect && (
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Correct Answer:</strong> {card.back}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
              {submitted ? (
                <button
                  onClick={handleBack}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-md text-white font-medium bg-purple-600 hover:bg-purple-700 transition"
                >
                  <ArrowLeftCircle size={18} /> Back to Game Modes
                </button>
              ) : (
                <>
                  <button
                    onClick={handleRestart}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-md text-white font-medium bg-blue-600 hover:bg-blue-700 transition"
                  >
                    <RefreshCcw size={18} /> Retry Game
                  </button>
                  <button
                    onClick={handleSubmitResult}
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-md text-white font-medium bg-green-600 hover:bg-green-700 transition disabled:opacity-60"
                  >
                    <Send size={18} />{" "}
                    {submitting ? "Submitting..." : "Submit Result"}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        <style jsx>{`
          .perspective {
            perspective: 1000px;
          }
          .transform-style {
            transform-style: preserve-3d;
          }
          .rotate-y-180 {
            transform: rotateY(180deg);
          }
          .card-face {
            position: absolute;
            width: 100%;
            height: 100%;
            padding: 1rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            border-radius: 0.75rem;
            font-weight: 600;
            font-size: 1.125rem;
            backface-visibility: hidden;
          }
          .back {
            transform: rotateY(180deg);
          }
        `}</style>
      </div>

      {/* 🌟 Floating Buttons Bottom-Right */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="group"
        >
          <button
            onClick={() => router.push("/doubt")}
            className="p-3 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 text-white shadow-lg hover:scale-105 transition"
          >
            <HelpCircle size={22} />
          </button>
          <div className="absolute right-14 bottom-1 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            Ask a Doubt
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="group"
        >
          <button
            onClick={() => router.push("/course/request")}
            className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg hover:scale-105 transition"
          >
            <Sparkles size={22} />
          </button>
          <div className="absolute right-14 bottom-1 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            Request AI Course
          </div>
        </motion.div>
      </div>
    </>
  );
}
