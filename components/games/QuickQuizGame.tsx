"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  RefreshCcw,
  ArrowLeftCircle,
  Send,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { saveDashboardProgress } from "@/lib/dashboard";

type Question = {
  question: string;
  options: string[];
  answer: string;
};

export default function QuickQuizGame() {
  const router = useRouter();
  const { moduleId, gameId } = useParams() as {
    moduleId: string;
    gameId: string;
  };

  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [gameTitle, setGameTitle] = useState("Quick Quiz");
  const [submitting, setSubmitting] = useState(false);
  const [log, setLog] = useState<
    {
      question: string;
      selected: string | null;
      correct: string;
      isCorrect: boolean;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const question = questions[current];

  useEffect(() => {
    const fetchQuiz = async () => {
      const token = localStorage.getItem("token");
      if (!token || !moduleId || !gameId) {
        setError("Missing token, module ID, or game ID.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `http://localhost:5000/api/module/${moduleId}/game/${gameId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error(await res.text());

        const data = await res.json();
        setQuestions(data.game?.items || []);
        setGameTitle(data?.game?.title || "Quick Quiz");
      } catch (err) {
        console.error("❌ Failed to fetch quiz:", err);
        setError("Failed to load quiz.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [moduleId, gameId]);

  const handleChoose = (opt: string) => {
    if (selected) return;
    const isCorrect = opt === question.answer;
    if (isCorrect) setScore((s) => s + 1);
    setSelected(opt);

    setLog((prev) => [
      ...prev,
      {
        question: question.question,
        selected: opt,
        correct: question.answer,
        isCorrect,
      },
    ]);

    setTimeout(() => {
      if (current + 1 < questions.length) {
        setCurrent((c) => c + 1);
        setSelected(null);
      } else {
        setCompleted(true);
      }
    }, 1000);
  };

  const handleRetry = () => {
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setCompleted(false);
    setLog([]);
    setSubmitted(false);
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token || !moduleId || !gameId) {
      console.error("❌ Missing token, moduleId, or gameId");
      return;
    }

    setSubmitting(true);

    try {
      // [1] Submit quiz result
      const quizPayload = {
        score,
        total: questions.length,
        log,
      };

      console.log("📤 [1] Submitting quiz result:", quizPayload);

      const res = await fetch(
        `http://localhost:5000/api/module/${moduleId}/game/${gameId}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(quizPayload),
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        console.error("❌ [1] Quiz result submission failed:", errText);
        throw new Error(errText);
      }

      console.log("✅ [1] Quiz result submitted");

      // [2] Fetch user dashboard
      const dashRes = await fetch(`http://localhost:5000/api/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!dashRes.ok) {
        const errText = await dashRes.text();
        console.error("❌ [2] Dashboard fetch failed:", errText);
        throw new Error("Failed to fetch dashboard");
      }

      const dashboard = await dashRes.json();

      // [3] Identify course containing the current module
      const course = dashboard.courseModules.find((c: any) =>
        c.completedModules.some((m: any) => m.moduleId === moduleId)
      );

      if (!course) {
        throw new Error("❌ Active course not found for module");
      }

      const module = course.completedModules.find(
        (m: any) => m.moduleId === moduleId
      );
      if (!module) {
        throw new Error("❌ Module not found in course");
      }

      const dashboardPayload = {
        courseId: course.courseId,
        completedModule: {
          moduleId,
          title: module.title,
        },
        gameResult: {
          gameId,
          gameTitle: "Quick Quiz",
          score,
          total: questions.length,
          timestamp: new Date().toISOString(),
        },
      };

      console.log("📤 [4] Submitting dashboard progress:", dashboardPayload);

      await saveDashboardProgress(dashboardPayload);

      console.log("✅ [4] Dashboard updated");
      setSubmitted(true);
    } catch (err: any) {
      console.error("❌ Submission error:", err.message || err);
      alert("Failed to submit quiz. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    router.push(`/game?moduleId=${moduleId}`);
  };

  const variants = {
    enter: { opacity: 0, y: 30 },
    center: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -30 },
  };

  if (loading) return <p className="text-center mt-10">⏳ Loading quiz...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;
  if (!questions.length)
    return <p className="text-center mt-10">❌ No quiz questions found.</p>;

  return (
    <>
      <div className="relative flex flex-col items-center justify-center min-h-[100dvh] p-6 space-y-6 overflow-hidden">
        {/* 🌈 Animated Background Glow */}
        <motion.div
          className="absolute -z-10 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-pink-500 via-purple-600 to-blue-500 opacity-30 blur-3xl animate-spin-slow"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
        />

        <h2 className="text-2xl font-bold text-blue-600 dark:text-pink-400">
          {gameTitle}
        </h2>

        {!completed ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4 }}
              className="w-full max-w-xl space-y-4 bg-white dark:bg-[#1c1c1c] p-6 rounded-xl shadow border border-blue-100 dark:border-pink-500/30"
            >
              <p className="text-lg font-medium text-gray-800 dark:text-gray-100">
                {question.question}
              </p>
              <div className="grid gap-2">
                {question.options.map((opt) => {
                  const isCorrect = opt === question.answer;
                  const isSelected = selected === opt;

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
              🎉 You scored {score} out of {questions.length}
            </p>

            <div className="space-y-4">
              {log.map((entry, idx) => (
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
                      {entry.selected}
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

            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
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
            </div>
          </div>
        )}
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

