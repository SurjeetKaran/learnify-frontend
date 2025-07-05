"use client";

import {
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactNode,
  ReactPortal,
  useEffect,
  useState,
} from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  calculateCourseScore,
  getScoreColor,
  getScoreEmoji,
  getLowScoringModulesWithScore,
} from "@/lib/scoreUtils";

import {
  GraduationCap,
  BookOpen,
  Sparkles,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Book,
  Trash2,
  Loader2,
  MessageSquareHeart,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type GameResult = {
  gameId: string;
  gameTitle: string;
  score: number;
  total: number;
  timestamp: string;
};

type CompletedModule = {
  moduleId: string;
  title: string;
  completedAt: string;
  gameResults: GameResult[];
};

type CourseModule = {
  courseId: string;
  courseTitle: string;
  completedModules: CompletedModule[];
};

type DashboardData = {
  name: string;
  grade: string;
  board: string;
  courseModules: CourseModule[];
};

const greetings = [
  "🚀 Keep pushing your limits, {name}!",
  "💡 Learning never exhausts the mind, {name}.",
  "🌱 Every day is progress — keep going, {name}!",
  "🔥 You’re on fire, {name}!",
  "🎯 One step closer to your goals, {name}!",
  "💪 Knowledge is your superpower, {name}.",
  "📘 Keep exploring new ideas, {name}!",
  "🏆 You’re doing great, {name} — keep it up!",
  "🧠 Sharpen that mind, {name}!",
  "✨ Great things take time, {name}. You're on track!",
];

const staticCourseHeadings = [
  "📚 Your Learning Journey",
  "🧭 Track Your Progress",
  "📝 Your Enrolled Courses",
  "💼 Personalized Study Plan",
];

export default function DashboardPage() {
  const [user, setUser] = useState<{
    name: string;
    grade: string;
    board: string;
  } | null>(null);
  const [courseModules, setCourseModules] = useState<CourseModule[]>([]);
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
  const [greeting, setGreeting] = useState("");
  const [heading, setHeading] = useState("");
  const [deleteState, setDeleteState] = useState<{
    confirmId: string | null;
    deletingId: string | null;
  }>({ confirmId: null, deletingId: null });

  const router = useRouter();

  useEffect(() => {
  const fetchDashboard = async () => {
    try {
      const data: DashboardData = await api.get("/dashboard");

      setUser({ name: data.name, grade: data.grade, board: data.board });
      setCourseModules(data.courseModules);

      const greet = greetings[Math.floor(Math.random() * greetings.length)];
      const head =
        staticCourseHeadings[Math.floor(Math.random() * staticCourseHeadings.length)];
      setGreeting(greet.replace("{name}", data.name));
      setHeading(head);
    } catch (err) {
      console.error("❌ Failed to fetch dashboard:", err);
    }
  };

  fetchDashboard();
}, []);

const confirmDelete = (e: React.MouseEvent, id: string) => {
  e.stopPropagation();
  setDeleteState({ ...deleteState, confirmId: id });
};

const cancelDelete = (e: React.MouseEvent) => {
  e.stopPropagation();
  setDeleteState({ confirmId: null, deletingId: null });
};

const deleteCourse = async (e: React.MouseEvent, id: string) => {
  e.stopPropagation();

  try {
    setDeleteState({ confirmId: null, deletingId: id });

    await api.delete(`/courses/${id}`);
    setCourseModules((prev) => prev.filter((c) => c.courseId !== id));
  } catch (err) {
    console.error("❌ Failed to delete course:", err);
  } finally {
    setDeleteState({ confirmId: null, deletingId: null });
  }
};

  if (!user) {
    return (
      <div className="text-center mt-20 text-lg font-medium animate-pulse">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-10 md:px-12 bg-background text-foreground">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-600 dark:text-pink-400">
              {greeting}
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 mt-2">
              Here's your personalized dashboard.
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-[#1e1e1e] p-5 rounded-lg shadow border dark:border-pink-500/30">
            <GraduationCap className="text-blue-500 dark:text-pink-400 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Grade</p>
            <p className="font-semibold">{user.grade}</p>
          </div>
          <div className="bg-white dark:bg-[#1e1e1e] p-5 rounded-lg shadow border dark:border-pink-500/30">
            <BookOpen className="text-green-500 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Board</p>
            <p className="font-semibold">{user.board}</p>
          </div>
          <div className="bg-white dark:bg-[#1e1e1e] p-5 rounded-lg shadow border dark:border-pink-500/30">
            <p className="text-purple-500 font-bold text-xl mb-1">📚</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total Courses
            </p>
            <p className="font-semibold">{courseModules.length}</p>
          </div>
        </div>

        <h3 className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-pink-400 mt-12 mb-6 text-center sm:text-left">
          {heading}
        </h3>

     {courseModules.length === 0 && (
  <div className="backdrop-blur-md bg-white/30 dark:bg-white/10 border border-white/30 dark:border-white/20 text-gray-800 dark:text-white p-8 rounded-2xl shadow-2xl text-center transition-all duration-300">
    <h2 className="text-2xl font-bold mb-3 text-blue-700 dark:text-pink-400">
      🚀 Ready to Begin Your Gamified Learning Adventure?
    </h2>
    <p className="text-base sm:text-lg mb-6 text-gray-700 dark:text-gray-300 max-w-xl mx-auto">
      You haven't requested any courses yet. Dive into an interactive, AI-powered experience designed just for you. 
      <br className="hidden sm:block" />
      <span className="font-medium text-blue-600 dark:text-pink-400">Tap the ✨ icon below or use the button to request your first course!</span>
    </p>
    <button
      onClick={() => router.push("/course/request")}
      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-pink-500 to-violet-600 text-white text-base font-semibold rounded-full shadow-lg hover:scale-105 hover:shadow-pink-400/40 transition-all duration-300"
    >
      <Sparkles size={20} /> Request a Course
    </button>
  </div>
)}


        {/* Course Cards */}
        <div className="space-y-8">
          {courseModules.map((course) => {
            const completed = course.completedModules.length;
            const total = 5;
            const percent = Math.round((completed / total) * 100);
            const isExpanded = expandedCourseId === course.courseId;

            return (
              <motion.div
                key={course.courseId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`relative bg-white dark:bg-[#1e1e1e] rounded-xl p-6 transition border ${
                  percent === 100
                    ? "border-green-400 shadow-[0_0_10px_3px_rgba(34,197,94,0.6)]"
                    : "border-blue-100 dark:border-pink-500/30 shadow"
                }`}
                onClick={() =>
                  setExpandedCourseId(isExpanded ? null : course.courseId)
                }
              >
                {/* Delete Overlay */}
                {deleteState.confirmId === course.courseId && (
                  <motion.div className="absolute inset-0 z-10 bg-black/60 flex flex-col items-center justify-center gap-2 rounded-xl">
                    <p className="text-sm text-white">Delete this course?</p>
                    <div className="flex gap-3">
                      <button
                        onClick={(e) => deleteCourse(e, course.courseId)}
                        className="text-white bg-red-500 hover:bg-red-600 text-xs px-3 py-1 rounded"
                      >
                        {deleteState.deletingId === course.courseId ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Yes"
                        )}
                      </button>
                      <button
                        onClick={cancelDelete}
                        className="text-white bg-gray-600 hover:bg-gray-700 text-xs px-3 py-1 rounded"
                      >
                        No
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Header */}
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <Book className="text-blue-500 dark:text-pink-400" />
                    <h3 className="text-xl font-bold text-blue-600 dark:text-pink-400">
                      {course.courseTitle}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {percent === 100 &&
                      deleteState.confirmId !== course.courseId && (
                        <button
                          onClick={(e) => confirmDelete(e, course.courseId)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete course"
                        >
                          <Trash2 size={22} />
                        </button>
                      )}
                    {isExpanded ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  ✅ {completed} / {total} modules completed
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all"
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
                <p className="text-right text-sm font-semibold text-gray-700 dark:text-gray-300 mt-1">
                  🎯 {percent}%
                </p>

                {/* Expanded Section */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden mt-6 space-y-4"
                    >
                      {percent === 100
                        ? (() => {
                            const score = calculateCourseScore(course);
                            const scoreColor = getScoreColor(score);
                            const emoji = getScoreEmoji(score);
                            const lowModules =
                              getLowScoringModulesWithScore(course);

                            let message = "Great effort!";
                            if (score >= 90)
                              message = "Outstanding performance!";
                            else if (score >= 75) message = "Well done!";
                            else if (score >= 60)
                              message = "Good job, keep improving!";
                            else
                              message =
                                "Review the material again for better results.";

                            return (
                              <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="relative text-center p-6 rounded-xl shadow-lg
      bg-white/20 dark:bg-white/5
      border border-gray-300 dark:border-white/10 
      backdrop-blur-md space-y-4"
                              >
                                {/* Feedback Icon + Tooltip */}
                                <div className="absolute top-4 right-4 group">
                                  <MessageSquareHeart
                                    onClick={() => router.push("/feedback")}
                                    className="w-6 h-6 text-blue-600 dark:text-pink-400 cursor-pointer transition-all duration-300 
            group-hover:scale-110 
            group-hover:text-blue-800 dark:group-hover:text-pink-300
            group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                                  />
                                  <div className="absolute top-8 right-0 mt-1 whitespace-nowrap bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                                    Share your feedback!
                                  </div>
                                </div>

                                {/* Final Score */}
                                <p
                                  className={`text-lg sm:text-xl font-bold ${scoreColor}`}
                                >
                                  📊 Final Score: {score}% {emoji}
                                </p>

                                {/* Motivational Message */}
                                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                                  {message}
                                </p>

                                {/* Review List */}
                                {lowModules.length > 0 && (
                                  <div className="mt-4 text-left">
                                    <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-1">
                                      🧐 Recommended for Review:
                                    </p>
                                    <ul className="space-y-2">
                                      <AnimatePresence>
                                        {lowModules.map((mod, idx) => (
                                          <motion.li
                                            key={mod.moduleId || idx}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{
                                              duration: 0.3,
                                              delay: idx * 0.05,
                                            }}
                                            className="text-sm text-gray-800 dark:text-gray-200 flex items-center"
                                          >
                                            <span className="mr-2">🔁</span>
                                            <span className="flex-1">
                                              {mod.title}
                                            </span>
                                            <span className="ml-2 font-semibold text-blue-600 dark:text-red-400">
                                              {mod.score}%
                                            </span>
                                          </motion.li>
                                        ))}
                                      </AnimatePresence>
                                    </ul>
                                  </div>
                                )}
                              </motion.div>
                            );
                          })()
                        : course.completedModules.map((mod) => (
                            <div
                              key={mod.moduleId}
                              className="bg-gray-50 dark:bg-gray-900/40 border dark:border-gray-700 rounded-lg p-4"
                            >
                              <p className="text-sm font-bold mb-2 text-blue-700 dark:text-white">
                                🧠 {mod.title}
                              </p>
                              {mod.gameResults.length === 0 ? (
                                <p className="text-sm text-gray-500">
                                  No games played yet.
                                </p>
                              ) : (
                                mod.gameResults.map((gr, i) => (
                                  <div
                                    key={i}
                                    className="rounded-lg border border-blue-200 dark:border-pink-700 bg-white dark:bg-[#2a2a2a] p-3 mb-2"
                                  >
                                    <p className="font-semibold text-blue-800 dark:text-pink-400 mb-1">
                                      🎮 {gr.gameTitle}
                                    </p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                      Score: <strong>{gr.score}</strong> /{" "}
                                      {gr.total}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-1">
                                      ⏰{" "}
                                      {new Intl.DateTimeFormat("en-US", {
                                        dateStyle: "medium",
                                        timeStyle: "short",
                                      }).format(new Date(gr.timestamp))}
                                    </p>
                                  </div>
                                ))
                              )}
                            </div>
                          ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
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
    </div>
  );
}
