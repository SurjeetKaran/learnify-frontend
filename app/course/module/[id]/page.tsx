"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  MoveRight,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { BACKEND_URL } from "@/lib/config";

export default function ReadingModulePage() {
  const { id } = useParams();
  const router = useRouter();
  const [module, setModule] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isAlreadyCompleted, setIsAlreadyCompleted] = useState(false);
  const [error, setError] = useState("");
  const [direction, setDirection] = useState(1);
  const [isGeneratingGames, setIsGeneratingGames] = useState(false);

  const steps = [
    "Explanation",
    "Real-World Example",
    "Real-Life Application",
    "Summary",
    "Key Points",
    "Examples",
  ];

  const isLastStep = currentStep === steps.length - 1;

  useEffect(() => {
    const fetchModuleAndProgress = async () => {
      const token = localStorage.getItem("token");
      if (!token || typeof id !== "string") {
        setError("⚠️ Missing token or module ID.");
        return;
      }

      try {
        const res = await fetch(`${BACKEND_URL}/api/courses/module/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setModule(data.module);

        const dashboardRes = await fetch(`${BACKEND_URL}/api/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const dashboard = await dashboardRes.json();

        const courseProgress = dashboard.courseModules?.find(
          (c: any) => c.courseId === data.module.courseId
        );

        const completed = courseProgress?.completedModules?.some(
          (m: any) => m.moduleId === id
        );

        if (completed) {
          setIsAlreadyCompleted(true);
          setIsComplete(true);
        }
      } catch (err) {
        console.error("❌ Failed to load module or dashboard:", err);
        setError("Failed to load content.");
      }
    };

    fetchModuleAndProgress();
  }, [id]);

  const handleComplete = async () => {
    const token = localStorage.getItem("token");
    if (!token || !module?.courseId) {
      console.error("⚠️ Missing token or courseId");
      return;
    }

    const payload = {
      courseId: module.courseId,
      completedModule: {
        moduleId: id,
        title: module.title,
      },
    };

    console.log("📦 Payload being sent to /api/dashboard/save:", payload);

    try {
      const res = await fetch(`${BACKEND_URL}/api/dashboard/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      console.log("✅ Dashboard update result:", result);

      if (res.ok) {
        setIsComplete(true);
      } else {
        throw new Error(result.error || "Failed to save progress");
      }
    } catch (err) {
      console.error("❌ Dashboard sync failed:", err);
      alert("Failed to mark as complete.");
    }
  };

  const handleContinue = () => {
    if (module?.courseId) {
      router.push(`/course/view?id=${module.courseId}`);
    } else {
      alert("Something went wrong. Course ID is missing.");
    }
  };

  const handleGoToGames = async () => {
    const token = localStorage.getItem("token");

    if (!token || typeof id !== "string") {
      alert("Missing token or module ID.");
      return;
    }

    try {
      setIsGeneratingGames(true);

      // ✅ Step 1: Check if games already exist
      const checkRes = await fetch(
        `${BACKEND_URL}/api/module/${id}/check-games`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!checkRes.ok) throw new Error(await checkRes.text());
      const data = await checkRes.json();
      const games = data.games;

      if (!games || games.length === 0) {
        // ✅ Step 2: Generate games if not found
        const genRes = await fetch(
          `${BACKEND_URL}/api/module/${id}/generate-games-from-content`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!genRes.ok) throw new Error(await genRes.text());

        const { message, count } = await genRes.json();
        console.log(`✅ ${count} new games generated for module ${id}`);
      } else {
        console.log("✅ Games already exist, skipping generation");
      }

      // ✅ Navigate to game screen
      router.push(`/game?moduleId=${id}`);
    } catch (err) {
      console.error("❌ Error checking or generating games:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsGeneratingGames(false);
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
      scale: 0.95,
    }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (direction: number) => ({
      x: direction > 0 ? -100 : 100,
      opacity: 0,
      scale: 0.95,
    }),
  };

  const renderStep = () => {
    if (!module?.content) return null;
    const { content } = module;

    switch (steps[currentStep]) {
      case "Explanation":
        return (
          <ContentSection title="Explanation" body={content.explanation} />
        );
      case "Real-World Example":
        return (
          <ContentSection
            title="Real-World Example"
            body={content.realWorldExample}
          />
        );
      case "Real-Life Application":
        return (
          <ContentSection
            title="Real-Life Application"
            body={content.realLifeApplication}
          />
        );
      case "Summary":
        return <ContentSection title="Summary" body={content.summary} />;
      case "Key Points":
        return (
          <div>
            <h2 className="text-xl font-semibold">Key Points</h2>
            <ul className="list-disc pl-6 space-y-1">
              {content.keyPoints?.map((point: string, idx: number) => (
                <li key={idx}>{point}</li>
              ))}
            </ul>
          </div>
        );
      case "Examples":
        return (
          <div>
            <h2 className="text-xl font-semibold">Examples with Solutions</h2>
            {content.examples?.map((ex: any, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-md mt-3 border shadow-md backdrop-blur-md 
             bg-white/70 dark:bg-white/10 
             border-gray-300 dark:border-white/20 
             text-gray-900 dark:text-white"
              >
                <p className="font-medium text-gray-800 dark:text-white">
                  Q{idx + 1}: {ex.question}
                </p>
                <p className="text-sm mt-1 text-gray-700 dark:text-white/80">
                  <strong>Solution:</strong> {ex.solution}
                </p>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  if (error)
    return <div className="text-center text-red-500 mt-10">{error}</div>;
  if (!module)
    return (
      <div className="text-center mt-10 animate-pulse">
        📘 Loading module...
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 mt-10 transition-shadow duration-300">
      <h1 className="text-3xl font-bold text-blue-600 dark:text-pink-400 mb-4 flex items-center gap-3">
        📘 {module.title}
        {isComplete && (
          <span className="text-green-600 bg-green-100 dark:bg-green-800 dark:text-green-300 text-xs px-2 py-1 rounded-full font-medium">
            ✅ Completed
          </span>
        )}
      </h1>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.section
          key={currentStep}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3 }}
          className="mb-6 mt-8"
        >
          <div className="rounded-xl bg-white/10 dark:bg-white/5 backdrop-blur-md shadow-lg p-6 transition-all duration-300">
            {renderStep()}
          </div>
        </motion.section>
      </AnimatePresence>

      <div className="flex justify-between mt-6">
        <button
          onClick={() => {
            setDirection(-1);
            setCurrentStep((prev) => Math.max(prev - 1, 0));
          }}
          disabled={currentStep === 0}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center gap-2 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        {!isLastStep && (
          <button
            onClick={() => {
              setDirection(1);
              setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-md flex items-center gap-2 text-sm font-medium hover:bg-blue-600 transition"
          >
            Next
            <ArrowRight size={18} />
          </button>
        )}
      </div>

      {isLastStep && (
        <>
          {!isComplete && !isAlreadyCompleted ? (
            <div className="mt-8">
              <button
                onClick={handleComplete}
                className="w-full py-3 rounded-md text-white font-semibold bg-gradient-to-r from-green-500 to-teal-600 hover:scale-105 transition-transform duration-200 shadow-lg"
              >
                <CheckCircle className="inline-block mr-2" size={20} />
                Mark as Complete
              </button>
            </div>
          ) : (
            <div className="mt-6 flex flex-col space-y-4">
              <button
                onClick={handleContinue}
                className="w-full py-3 rounded-md text-white font-semibold bg-blue-600 hover:bg-blue-700 transition duration-200 shadow flex items-center justify-center gap-2"
              >
                <MoveRight size={18} />
                Continue to Next Module
              </button>

              <button
                onClick={handleGoToGames}
                disabled={isGeneratingGames}
                className={`w-full py-3 rounded-md text-white font-semibold bg-purple-600 hover:bg-purple-700 transition duration-200 shadow flex items-center justify-center gap-2 ${
                  isGeneratingGames ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isGeneratingGames
                  ? "⏳ Generating Games..."
                  : "🎮 Go to Game Modes"}
              </button>
            </div>
          )}
        </>
      )}

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

function ContentSection({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-1">{body}</p>
    </div>
  );
}


