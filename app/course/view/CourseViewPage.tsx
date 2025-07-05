"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, HelpCircle, Sparkles } from "lucide-react";
import api from "@/lib/api";

type CourseModule = {
  id: string;
  title: string;
  description: string;
};

type Course = {
  id: string;
  subject: string;
  topic: string;
  summary: string;
  modules: CourseModule[];
};

export default function CourseViewPage() {
  const [course, setCourse] = useState<Course | null>(null);
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [courseCompleted, setCourseCompleted] = useState(false);
  const [allCompleted, setAllCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("id");

  const fetchCourseAndProgress = useCallback(async () => {
    if (!courseId) {
      setError("⚠️ Missing course ID.");
      return;
    }

    try {
      // ✅ Fetch course
      const courseData = await api.get(`/courses/${courseId}`);

      if (!courseData?.course) {
        throw new Error("Course data not found in response.");
      }

      const course = courseData.course;
      setCourse(course);

      // ✅ Fetch dashboard
      const dashboard = await api.get("/dashboard");

      const courseEntry = dashboard.courseModules.find(
        (c: any) => c.courseId === courseId
      );

      if (!courseEntry) {
        console.warn("No course entry found in dashboard");
        return;
      }

      const completed =
        courseEntry.completedModules?.map((m: any) => m.moduleId) || [];
      setCompletedModules(completed);

      if (courseEntry.isCompleted) {
        setCourseCompleted(true);
        setAllCompleted(true);
        console.log("✅ Course already marked complete.");
      } else {
        const allAreCompleted =
          course?.modules?.every((mod: { id: any }) =>
            completed.includes(mod.id)
          ) ?? false;
        setAllCompleted(allAreCompleted);
        setCourseCompleted(false);
      }

      // 🐛 Debug logs
      console.log(
        "📘 Modules:",
        course?.modules.map((m: { id: any }) => m.id)
      );
      console.log("✅ Completed:", completed);
    } catch (err: any) {
      console.error(
        "❌ Error loading course/dashboard:",
        err?.response?.data || err.message
      );
      setError("❌ Failed to load course or dashboard.");
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourseAndProgress();
  }, [fetchCourseAndProgress]);

  const handleCardClick = (moduleId: string) => {
    router.push(`/course/module/${moduleId}`);
  };

  const handleMarkCourseComplete = async () => {
    if (!course?.id) return;

    setLoading(true);

    try {
      const response = await api.put(`/courses/${course.id}/complete`, {
        courseId: course.id,
        markedAt: new Date().toISOString(),
      });

      console.log("✅ Marked course complete:", response.data);
      setCourseCompleted(true);
      setAllCompleted(true);
      await fetchCourseAndProgress();
    } catch (error: any) {
      console.error(
        "❌ Error marking course complete:",
        error?.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="text-center mt-20 text-red-500 font-medium">{error}</div>
    );
  }

  if (!course) {
    return (
      <div className="text-center mt-20 text-lg font-medium animate-pulse">
        📚 Loading your course...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8 relative">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold text-blue-600 dark:text-pink-400 mb-2">
          {course.subject}: {course.topic}
        </h1>
        <p className="text-gray-700 dark:text-gray-300">{course.summary}</p>
      </motion.div>

      {/* Modules */}
      <div className="space-y-6">
        {course.modules.map((mod, idx) => {
          const isCompleted = completedModules.includes(mod.id);
          return (
            <motion.div
              key={mod.id}
              onClick={() => handleCardClick(mod.id)}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`cursor-pointer border rounded-lg p-4 shadow-md transition hover:shadow-lg ${
                isCompleted
                  ? "bg-green-50 dark:bg-green-900 border-green-300 dark:border-green-600"
                  : "bg-white dark:bg-[#1e1e1e] border-blue-100 dark:border-pink-500/20"
              }`}
            >
              <h3
                className={`text-xl font-semibold ${
                  isCompleted
                    ? "text-green-700 dark:text-green-300"
                    : "text-blue-500 dark:text-pink-400"
                }`}
              >
                {idx + 1}. {mod.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {mod.description}
              </p>
              {isCompleted && (
                <div className="mt-2 text-sm text-green-600 dark:text-green-300 flex items-center gap-1">
                  <CheckCircle2 size={16} /> Completed
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Mark Course Complete */}
      {!courseCompleted && allCompleted && (
        <motion.button
          onClick={handleMarkCourseComplete}
          disabled={loading}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: loading ? 1 : 1.05 }}
          whileTap={{ scale: loading ? 1 : 0.95 }}
          className={`mt-10 w-full py-3 px-6 rounded-xl text-white font-semibold text-lg shadow-lg ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-pink-500 hover:bg-pink-600"
          }`}
        >
          {loading ? "Marking..." : "🎉 Mark Course Complete"}
        </motion.button>
      )}

      {/* Go to Dashboard */}
      {courseCompleted && (
        <motion.button
          onClick={() => router.push("/dashboard")}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-10 w-full py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg shadow-lg"
        >
          🚀 Go to Dashboard
        </motion.button>
      )}

      {/* Floating Buttons */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
        <button
          onClick={() => router.push("/course/request")}
          title="Request AI Course"
          className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg hover:scale-105 transition"
        >
          <Sparkles size={22} />
        </button>

        <button
          onClick={() => router.push("/doubt")}
          title="Ask a Doubt"
          className="p-3 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 text-white shadow-lg hover:scale-105 transition"
        >
          <HelpCircle size={22} />
        </button>
      </div>
    </div>
  );
}
