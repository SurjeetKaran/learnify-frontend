"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  RefreshCcw,
  ArrowLeftCircle,
  Send,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { saveDashboardProgress } from "@/lib/dashboard";
import api from "@/lib/api";

type Scene = {
  story: string;
  options: string[];
  answer: string;
};

export default function StoryModeGame() {
  const router = useRouter();
  const { moduleId, gameId } = useParams() as {
    moduleId: string;
    gameId: string;
  };

  const [scenes, setScenes] = useState<Scene[]>([]);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [log, setLog] = useState<
    { story: string; selected: string; correct: string; isCorrect: boolean }[]
  >([]);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [gameTitle, setGameTitle] = useState("Story Mode");

  const current = scenes[step];

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
        setScenes(data?.game?.items || []);
        setGameTitle(data?.game?.title || "Story Mode");
      } catch (err) {
        console.error("❌ Failed to fetch story mode:", err);
        setError("Failed to load Story Mode.");
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [moduleId, gameId]);

  const handleChoose = (opt: string) => {
    if (selected) return;

    const isCorrect = opt === current.answer;
    if (isCorrect) setScore((prev) => prev + 1);

    setLog((prev) => [
      ...prev,
      {
        story: current.story,
        selected: opt,
        correct: current.answer,
        isCorrect,
      },
    ]);

    setSelected(opt);

    setTimeout(() => {
      if (step + 1 < scenes.length) {
        setStep((prev) => prev + 1);
        setSelected(null);
      } else {
        setFinished(true);
      }
    }, 1200);
  };

  const handleRetry = () => {
    setStep(0);
    setSelected(null);
    setScore(0);
    setLog([]);
    setFinished(false);
    setSubmitted(false);
    setSubmitError("");
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token || !moduleId || !gameId) {
      console.error("❌ Missing token, moduleId, or gameId");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      // [1] Submit game result
      const gamePayload = {
        score,
        total: scenes.length,
      };

      console.log("📤 [1] Submitting game score:", gamePayload);
      await api.post(`/module/${moduleId}/game/${gameId}/submit`, gamePayload);
      console.log("✅ [1] Game submitted");

      // [2] Fetch dashboard data
      const dashboard = await api.get("/dashboard");

      const course = dashboard.courseModules.find((c: any) =>
        c.completedModules.some((m: any) => m.moduleId === moduleId)
      );
      if (!course) throw new Error("❌ Active course not found for module");

      const module = course.completedModules.find(
        (m: any) => m.moduleId === moduleId
      );
      if (!module) throw new Error("❌ Module not found in course");

      // [3] Submit dashboard progress
      const dashboardPayload = {
        courseId: course.courseId,
        completedModule: {
          moduleId,
          title: module.title,
        },
        gameResult: {
          gameId,
          gameTitle: "Story Mode",
          score,
          total: scenes.length,
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

  const handleBack = () => {
    router.push(`/game?moduleId=${moduleId}`);
  };

  const variants = {
    enter: { opacity: 0, x: 100 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
  };

  if (loading)
    return <div className="text-center mt-10">⏳ Loading Story Mode...</div>;
  if (error)
    return <div className="text-center text-red-500 mt-10">{error}</div>;
  if (!scenes.length)
    return <div className="text-center mt-10">❌ No story scenes found.</div>;

  return (
    <>
      <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 space-y-6 overflow-hidden relative">
        <motion.div
          className="absolute -z-10 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-pink-500 via-purple-600 to-blue-500 opacity-30 blur-3xl animate-spin-slow"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
        />

        <h2 className="text-2xl font-bold text-blue-600 dark:text-pink-400">
          {gameTitle}
        </h2>

        {!finished ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4 }}
              className="w-full max-w-xl space-y-4 bg-white dark:bg-[#1c1c1c] p-6 rounded-xl shadow border border-blue-100 dark:border-pink-500/30"
            >
              <p className="text-lg font-medium">{current.story}</p>
              <div className="grid gap-2">
                {current.options.map((opt) => {
                  const isSelected = selected === opt;
                  const isCorrect = opt === current.answer;

                  const base = "p-2 rounded-md border transition text-left";

                  const className = selected
                    ? isSelected && isCorrect
                      ? `${base} bg-green-100 border-green-400 dark:bg-green-700 text-green-900 dark:text-green-100`
                      : isSelected
                      ? `${base} bg-red-100 border-red-400 dark:bg-red-700 text-red-900 dark:text-red-100`
                      : `${base} border-gray-300 dark:border-gray-600`
                    : `${base} border-gray-300 dark:border-gray-600 hover:bg-blue-100 dark:hover:bg-blue-900`;

                  return (
                    <button
                      key={opt}
                      onClick={() => handleChoose(opt)}
                      disabled={!!selected}
                      className={className}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="w-full max-w-2xl space-y-6 animate-fade-in">
            <p className="text-center text-2xl font-bold text-blue-700 dark:text-pink-300">
              🎉 You made {score} smart choices out of {scenes.length}
            </p>

            {submitError && (
              <p className="text-center text-red-500 text-sm">{submitError}</p>
            )}
            {submitted && (
              <p className="text-center text-green-600 text-sm">
                ✅ Score submitted successfully!
              </p>
            )}

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
                  <p className="font-medium">
                    {idx + 1}. {entry.story}
                  </p>
                  <p className="text-sm mt-1">
                    <strong>Your Choice:</strong>{" "}
                    <span
                      className={
                        entry.isCorrect
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-500 dark:text-red-400"
                      }
                    >
                      {entry.selected}
                    </span>
                  </p>
                  {!entry.isCorrect && (
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Correct Choice:</strong> {entry.correct}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
              <>
                {submitted ? (
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
                      <RefreshCcw size={18} />
                      Retry Game
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-md text-white font-medium bg-green-600 hover:bg-green-700 transition disabled:opacity-50"
                    >
                      <Send size={18} />
                      {submitting ? "Submitting..." : "Submit Result"}
                    </button>
                  </>
                )}
              </>
            </div>
          </div>
        )}
      </div>

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
    </>
  );
}
