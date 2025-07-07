"use client";

import { useEffect, useState } from "react";
import {
  RefreshCcw,
  ArrowLeftCircle,
  Send,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import api from "@/lib/api";

type ConceptPair = {
  term: string;
  definition: string;
  isCorrect: boolean;
};

export default function ConceptMatchGame() {
  const router = useRouter();
  const { moduleId, gameId } = useParams() as {
    moduleId: string;
    gameId: string;
  };

  const [pairs, setPairs] = useState<ConceptPair[]>([]);
  const [index, setIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [log, setLog] = useState<
    { term: string; definition: string; user: boolean; isCorrect: boolean }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [gameTitle, setGameTitle] = useState("Quick Quiz");

  const current = pairs[index];

  useEffect(() => {
    const fetchGame = async () => {
      const token = localStorage.getItem("token");
      if (!token || !moduleId || !gameId) {
        setError("Missing token, module ID, or game ID.");
        setLoading(false);
        return;
      }

      try {
        console.log(`🎮 Fetching concept match game: ${moduleId} / ${gameId}`);
        const res = await api.get<{ game: any }>(`/module/${moduleId}/game/${gameId}`);

        if (!res || !res.game) {
          throw new Error("Game data missing from response");
        }

        setPairs(res.game.items || []);
        setGameTitle(res.game.title || "Concept Match");
      } catch (err: any) {
        console.error("❌ Failed to fetch concept match:", err);
        setError("Failed to load Concept Match.");
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [moduleId, gameId]);

  const handleAnswer = (userChoice: boolean) => {
    const correctAnswer = current.isCorrect;
    const isAnswerCorrect = userChoice === correctAnswer;

    if (isAnswerCorrect) {
      setScore((prev) => prev + 1);
    }

    setLog((prev) => [
      ...prev,
      {
        term: current.term,
        definition: current.definition,
        user: userChoice,
        isCorrect: isAnswerCorrect,
      },
    ]);

    if (index + 1 < pairs.length) {
      setIndex((prev) => prev + 1);
    } else {
      setCompleted(true);
    }
  };

  const handleBack = () => {
    router.push(`/game?moduleId=${moduleId}`);
  };

  const handleSubmitResult = async () => {
    const token = localStorage.getItem("token");
    if (!token || !gameId || !moduleId) {
      console.error("❌ Missing token, gameId, or moduleId");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const gamePayload = { score, total: pairs.length };
      console.log("📤 [1] Submitting game score:", gamePayload);

      await api.post(`/module/${moduleId}/game/${gameId}/submit`, gamePayload);
      console.log("✅ [1] Game submitted");

      const dashboard = await api.get("/dashboard");

      const course = dashboard.courseModules.find((c: any) =>
        c.completedModules.some((m: any) => m.moduleId === moduleId)
      );
      if (!course) throw new Error("❌ Active course not found for module");

      const module = course.completedModules.find(
        (m: any) => m.moduleId === moduleId
      );
      if (!module) throw new Error("❌ Module not found in course");

      const dashboardPayload = {
        courseId: course.courseId,
        completedModule: {
          moduleId,
          title: module.title,
        },
        gameResult: {
          gameId,
          gameTitle,
          score,
          total: pairs.length,
          timestamp: new Date().toISOString(),
        },
      };

      console.log("📤 [3] Submitting dashboard payload:", dashboardPayload);
      await api.post("/dashboard/save", dashboardPayload);
      console.log("✅ [3] Dashboard progress saved");

      setSubmitted(true);
    } catch (err: any) {
      console.error("❌ Error during submit:", err.message || err);
      setSubmitError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  if (loading)
    return <div className="text-center mt-10">⏳ Loading Concept Match...</div>;
  if (error)
    return <div className="text-center text-red-500 mt-10">{error}</div>;
  if (!pairs.length)
    return (
      <div className="text-center mt-10">❌ No concept match pairs found.</div>
    );


  return (
    <div className="relative flex flex-col items-center justify-center min-h-[100dvh] px-4 py-6 space-y-6">
      {/* Background Glow */}
      <motion.div
        className="absolute -z-10 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-pink-500 via-purple-600 to-blue-500 opacity-30 blur-3xl pointer-events-none animate-spin-slow"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
      />

      <h2 className="text-2xl font-bold text-blue-600 dark:text-pink-400">
        {gameTitle}
      </h2>

      {/* Game Body */}
      <AnimatePresence mode="wait">
        {!completed ? (
          <motion.div
            key={index}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4 }}
            className="w-full max-w-md space-y-4"
          >
            <div className="p-4 border rounded-lg bg-white dark:bg-[#1c1c1c] shadow text-center">
              <p className="text-lg font-semibold text-blue-700 dark:text-pink-300">
                🧠 {current.term}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {current.definition}
              </p>
              <p className="mt-4 font-medium text-gray-800 dark:text-gray-100">
                Is this correct?
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => handleAnswer(true)}
                className="flex-1 py-2 rounded-md bg-green-600 text-white font-medium hover:scale-105 transition"
              >
                ✅ Yes
              </button>
              <button
                onClick={() => handleAnswer(false)}
                className="flex-1 py-2 rounded-md bg-red-600 text-white font-medium hover:scale-105 transition"
              >
                ❌ No
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4 }}
            className="w-full max-w-2xl space-y-6 animate-fade-in"
          >
            <p className="text-center text-2xl font-bold text-blue-700 dark:text-pink-300">
              🎉 You got {score} out of {pairs.length} correct!
            </p>

            <div className="space-y-4">
              {log.map((entry, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border shadow ${
                    entry.isCorrect
                      ? "bg-green-50 border-green-300 dark:bg-green-900/20"
                      : "bg-red-50 border-red-300 dark:bg-red-900/20"
                  }`}
                >
                  <p className="font-medium text-gray-800 dark:text-gray-100">
                    {idx + 1}. <strong>{entry.term}</strong>: {entry.definition}
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
                      {entry.user ? "Yes" : "No"}
                    </span>
                  </p>
                </div>
              ))}
            </div>

           <>
  {!submitted ? (
    <>
      <button
        onClick={() => {
          setIndex(0);
          setScore(0);
          setCompleted(false);
          setSubmitted(false);
          setLog([]);
        }}
        className="w-full inline-flex items-center gap-2 px-5 py-2 rounded-md text-white font-medium bg-blue-600 hover:bg-blue-700 transition"
      >
        <RefreshCcw size={18} />
        Retry Game
      </button>

      <button
        onClick={handleSubmitResult}
        disabled={submitting}
        className="w-full inline-flex items-center gap-2 px-5 py-2 rounded-md text-white font-medium bg-green-600 hover:bg-green-700 transition disabled:opacity-50"
      >
        <Send size={18} />
        {submitting ? "Submitting..." : "Submit Result"}
      </button>
    </>
  ) : (
    <button
      onClick={handleBack}
      className="w-full inline-flex items-center gap-2 px-5 py-2 rounded-md text-white font-medium bg-purple-600 hover:bg-purple-700 transition"
    >
      <ArrowLeftCircle size={18} />
      Back to Game Modes
    </button>
  )}
</>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Buttons */}
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
