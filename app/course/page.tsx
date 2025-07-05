"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { HelpCircle, Sparkles } from "lucide-react";
import api from "@/lib/api";

type Course = {
  id: string;
  title: string;
  description: string;
  grade: string;
  subject: string;
};

type DashboardEntry = {
  courseId: string;
  isCompleted: boolean;
};

export default function CourseListPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [completedCourseIds, setCompletedCourseIds] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchCoursesAndDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("🔒 Please log in.");
          setLoading(false);
          return;
        }

        const [coursesRes, dashboardRes] = await Promise.all([
          api.get("/courses"),
          api.get("/dashboard"),
        ]);

        const courseList: Course[] = coursesRes.data;
        const dashboard = dashboardRes.data;

        console.log("📦 Courses fetched:", courseList);
        console.log("📊 Dashboard data:", dashboard.courseModules);

        setCourses(courseList);

        const completedIds = new Set<string>();

        courseList.forEach((course) => {
          const dashboardEntry = dashboard.courseModules.find(
            (entry: DashboardEntry) => entry.courseId === course.id
          );

          if (!dashboardEntry) {
            console.log(
              `🚫 No dashboard entry found for course: ${course.title} (${course.id})`
            );
            return;
          }

          if (!dashboardEntry.isCompleted) {
            console.log(
              `🟡 Course not marked completed: ${course.title} (${course.id})`
            );
            return;
          }

          console.log(
            `✅ Course marked completed: ${course.title} (${course.id})`
          );
          completedIds.add(course.id);
        });

        setCompletedCourseIds(completedIds);
      } catch (err) {
        console.error("❌ Error loading data:", err);
        setError("⚠️ Failed to load courses.");
      } finally {
        setLoading(false);
      }
    };

    fetchCoursesAndDashboard();
  }, []);

  const handleCourseClick = async (course: Course) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await api.post("/dashboard/save", {
        activeCourse: {
          courseId: course.id,
          title: course.title || "",
        },
      });

      router.push(`/course/view?id=${course.id}`);
    } catch (err) {
      console.error("❌ Error saving course:", err);
    }
  };

  return (
    <div className="min-h-screen px-4 py-10 md:px-12 bg-background text-foreground">
      <h1 className="text-3xl font-bold text-blue-600 dark:text-pink-400 mb-8 text-center">
        📚 Your Generated Courses
      </h1>

      {loading && (
        <div className="text-center text-gray-500 dark:text-gray-400 text-lg py-12 animate-pulse">
          Loading courses...
        </div>
      )}

      {!loading && error && (
        <p className="text-center text-red-500 dark:text-red-400 font-medium">
          {error}
        </p>
      )}

      {!loading && !error && courses.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400 mt-4">
          No courses found. Try requesting one!
        </p>
      )}

      {!loading && courses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {courses.map((course) => {
            const isCompleted = completedCourseIds.has(course.id);

            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative cursor-pointer p-5 rounded-xl shadow-lg transition border ${
                  isCompleted
                    ? "bg-green-50 dark:bg-green-900 border-green-400 dark:border-green-500"
                    : "bg-white dark:bg-[#1c1c1c] border-blue-200 dark:border-pink-500/20"
                }`}
                onClick={() => handleCourseClick(course)}
              >
                {isCompleted && (
                  <div className="absolute top-3 right-3 bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md">
                    ✅ Completed
                  </div>
                )}

                <h2
                  className={`text-xl font-semibold mb-2 ${
                    isCompleted
                      ? "text-green-700 dark:text-green-300"
                      : "text-blue-600 dark:text-pink-400"
                  }`}
                >
                  {course.title}
                </h2>

                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 line-clamp-3">
                  {course.description}
                </p>

                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Grade: {course.grade} • Subject: {course.subject}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Floating Buttons */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={() => router.push("/doubt")}
            className="p-3 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 text-white shadow-lg hover:scale-105 transition"
          >
            <HelpCircle size={22} />
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <button
            onClick={() => router.push("/course/request")}
            className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg hover:scale-105 transition"
          >
            <Sparkles size={22} />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
