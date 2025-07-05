"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeftCircle,
  RefreshCcw,
  Send,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { saveDashboardProgress } from "@/lib/dashboard";
import api from "@/lib/api";

type Puzzle = {
  question: string;
  answer: string;
};

export default function PuzzleChallengeGame() {
  const router = useRouter();
  const { moduleId, gameId } = useParams() as {
    moduleId: string;
    gameId: string;
  };

  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [answersLog, setAnswersLog] = useState<
    { question: string; correct: string; user: string; isCorrect: boolean }[]
  >([]);
  const [resultSubmitted, setResultSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [gameTitle, setGameTitle] = useState("Puzzle Challenge");

  useEffect(() => {
    const fetchGame = async () => {
      const token = localStorage.getItem("token");
      if (!token || !moduleId || !gameId) {
        setError("Missing token, module ID, or game ID.");
        setLoading(false);
        return;
      }

      try {
        const data = await api.get(`/module/${moduleId}/game/${gameId}`);
        setPuzzles(data.game?.items || []);
        setGameTitle(data.game?.title || "Puzzle Challenge");
      } catch (err) {
        console.error("❌ Failed to fetch puzzle game:", err);
        setError("Failed to load Puzzle Challenge.");
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [moduleId, gameId]);

  const handleAnswerSubmit = () => {
    if (submitted || !puzzles.length) return;

    const correctAnswer = puzzles[current].answer;
    const userAnswer = answer.trim().toLowerCase();
    const isCorrect = userAnswer === correctAnswer.toLowerCase();

    if (isCorrect) setScore((prev) => prev + 1);

    const newLogEntry = {
      question: puzzles[current].question,
      correct: correctAnswer,
      user: answer.trim(),
      isCorrect,
    };

    setAnswersLog((prev) => [...prev, newLogEntry]);
    setSubmitted(true);
  };

  const handleNext = () => {
    setAnswer("");
    setSubmitted(false);
    setCurrent((prev) => prev + 1);
  };

  const handleFinish = () => {
    setIsFinished(true);
  };

  const handleSubmitResult = async () => {
    if (resultSubmitted) return;

    setSubmitting(true);

    const token = localStorage.getItem("token");
    if (!token || !moduleId || !gameId) {
      console.error("❌ Missing token, moduleId, or gameId");
      setSubmitting(false);
      return;
    }

    try {
      // [1] Submit game result
      await api.post(`/module/${moduleId}/game/${gameId}/submit`, {
        score,
        total: puzzles.length,
        log: answersLog,
      });
      console.log("✅ Game result submitted");

      // [2] Fetch dashboard
      const dashboard = await api.get("/dashboard");

      const course = dashboard.courseModules.find((c: any) =>
        c.completedModules.some((m: any) => m.moduleId === moduleId)
      );
      if (!course) throw new Error("❌ Active course not found for module");

      const module = course.completedModules.find(
        (m: any) => m.moduleId === moduleId
      );
      if (!module) throw new Error("❌ Module not found in course");

      // [3] Save dashboard progress
      await saveDashboardProgress({
        courseId: course.courseId,
        completedModule: { moduleId, title: module.title },
        gameResult: {
          gameId,
          gameTitle: "Puzzle Challenge",
          score,
          total: puzzles.length,
          timestamp: new Date().toISOString(),
        },
      });

      setResultSubmitted(true);
    } catch (err: any) {
      console.error("❌ Error submitting result:", err.message || err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setCurrent(0);
    setAnswer("");
    setScore(0);
    setSubmitted(false);
    setIsFinished(false);
    setAnswersLog([]);
    setResultSubmitted(false);
  };

  const handleBack = () => {
    router.push(`/game?moduleId=${moduleId}`);
  };

  const variants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  if (loading) return <div className="text-center mt-10">⏳ Loading...</div>;
  if (error)
    return <div className="text-center text-red-500 mt-10">{error}</div>;
  if (!puzzles.length)
    return <div className="text-center mt-10">❌ No puzzle data found.</div>;

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[100dvh] p-6 space-y-6">
      <motion.div
        className="absolute -z-10 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-pink-500 via-purple-600 to-blue-500 opacity-30 blur-3xl animate-spin-slow"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
      />

      <h2 className="text-2xl font-bold text-blue-600 dark:text-pink-400">
        {gameTitle}
      </h2>

      <AnimatePresence mode="wait">
        {!isFinished && current < puzzles.length ? (
          <motion.div
            key={current}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4 }}
            className="w-full max-w-md space-y-4 bg-white dark:bg-[#1c1c1c] p-6 rounded-xl shadow-md border border-blue-100 dark:border-pink-500/30"
          >
            <p className="font-medium text-gray-800 dark:text-gray-100">
              {puzzles[current].question}
            </p>
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={submitted}
              className="w-full p-2 border rounded-md dark:bg-[#111] dark:border-gray-700"
              placeholder="Type your answer..."
            />
            {!submitted ? (
              <button
                onClick={handleAnswerSubmit}
                className="w-full py-2 bg-blue-600 text-white rounded-md hover:scale-105 transition"
              >
                Submit
              </button>
            ) : (
              <>
                {answer.trim().toLowerCase() ===
                puzzles[current].answer.toLowerCase() ? (
                  <p className="text-green-600 dark:text-green-400 font-semibold">
                    Correct! ✅
                  </p>
                ) : (
                  <p className="text-red-500 dark:text-red-400 font-semibold">
                    Oops! Correct answer:{" "}
                    <strong>"{puzzles[current].answer}"</strong>
                  </p>
                )}
                {current + 1 < puzzles.length ? (
                  <button
                    onClick={handleNext}
                    className="w-full py-2 bg-blue-500 text-white rounded-md hover:scale-105 transition"
                  >
                    Next Puzzle →
                  </button>
                ) : (
                  <button
                    onClick={handleFinish}
                    className="w-full py-2 bg-green-600 text-white rounded-md hover:scale-105 transition"
                  >
                    Finish
                  </button>
                )}
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="result"
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4 }}
            className="w-full max-w-2xl"
          >
            <p className="text-center text-2xl font-bold text-blue-700 dark:text-pink-300 mb-6">
              🎉 You scored {score} out of {puzzles.length}
            </p>
            <div className="space-y-4">
              {answersLog.map((entry, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg shadow border ${
                    entry.isCorrect
                      ? "bg-green-50 border-green-300 dark:bg-green-900/20"
                      : "bg-red-50 border-red-300 dark:bg-red-900/20"
                  }`}
                >
                  <p className="font-medium text-gray-800 dark:text-gray-100">
                    {idx + 1}. {entry.question}
                  </p>
                  <p className="text-sm mt-1">
                    <strong>Your Answer:</strong>{" "}
                    <span
                      className={
                        entry.isCorrect
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-500 dark:text-red-400"
                      }
                    >
                      {entry.user || <em>blank</em>}
                    </span>
                  </p>
                  {!entry.isCorrect && (
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Correct Answer:</strong> {entry.correct}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              {resultSubmitted ? (
                <button
                  onClick={handleBack}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-md text-white font-medium bg-purple-600 hover:bg-purple-700 transition"
                >
                  <ArrowLeftCircle size={18} />
                  Back to Game Modes
                </button>
              ) : (
                <>
                  <button
                    onClick={handleRetry}
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* 💬 Floating Action Buttons */}
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
          <div className="absolute right-14 bottom-1 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
          <div className="absolute right-14 bottom-1 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
            Request AI Course
          </div>
        </motion.div>
      </div>
    </div>
  );
}
