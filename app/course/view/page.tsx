// "use client";

// import { useEffect, useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { motion } from "framer-motion";
// import { CheckCircle2, HelpCircle, Sparkles } from "lucide-react";

// type CourseModule = {
//   id: string;
//   title: string;
//   description: string;
// };

// type Course = {
//   id: string;
//   subject: string;
//   topic: string;
//   summary: string;
//   modules: CourseModule[];
// };

// export default function CourseViewPage() {
//   const [course, setCourse] = useState<Course | null>(null);
//   const [completedModules, setCompletedModules] = useState<string[]>([]);
//   const [courseCompleted, setCourseCompleted] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const courseId = searchParams.get("id");

//   useEffect(() => {
//     fetchCourseAndProgress();
//   }, [courseId]);

// const fetchCourseAndProgress = async () => {
//   const token = localStorage.getItem("token");
//   if (!token || !courseId) {
//     setError("⚠️ Missing token or course ID.");
//     return;
//   }

//   try {
//     const courseRes = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     if (!courseRes.ok) throw new Error("Failed to fetch course");
//     const { course } = await courseRes.json();
//     setCourse(course);

//     const dashRes = await fetch(`http://localhost:5000/api/dashboard`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     if (!dashRes.ok) throw new Error("Failed to fetch dashboard");
//     const dashboard = await dashRes.json();

//     const courseEntry = dashboard.courseModules.find(
//       (c: any) => c.courseId === courseId
//     );

//     const completed =
//       courseEntry?.completedModules.map((mod: any) => mod.moduleId) || [];
//     setCompletedModules(completed);

//     // ✅ Set courseCompleted based on dashboard data
//     if (courseEntry?.isCourseCompleted) {
//       setCourseCompleted(true);
//     }
//   } catch (err) {
//     console.error(err);
//     setError("❌ Failed to load course or dashboard.");
//   }
// };


//   const handleCardClick = (moduleId: string) => {
//     router.push(`/course/module/${moduleId}`);
//   };

//  const handleMarkCourseComplete = async () => {
//   if (!course || !course.id) return;

//   const token = localStorage.getItem("token");
//   if (!token) {
//     console.error("⚠️ No auth token found in localStorage");
//     return;
//   }

//   setLoading(true);

//   // Define the payload you want to send
//   const payload = {
//     courseId: course.id,
//     markedAt: new Date().toISOString(), // Optional: Add timestamp
//   };

//   console.log("📤 Sending course completion payload:", payload);

//   try {
//     const response = await fetch(`http://localhost:5000/api/courses/${course.id}/complete`, {
//       method: "PUT",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(payload),
//     });

//     if (response.ok) {
//       setCourseCompleted(true);

//       // Optional: refresh dashboard progress again
//       await fetchCourseAndProgress();
//     } else {
//       const result = await response.json();
//       console.error("❌ Failed to mark course complete:", result.error);
//     }
//   } catch (error) {
//     console.error("❌ Error marking course complete:", error);
//   } finally {
//     setLoading(false);
//   }
// };


//   if (error) {
//     return (
//       <div className="text-center mt-20 text-red-500 font-medium">{error}</div>
//     );
//   }

//   if (!course) {
//     return (
//       <div className="text-center mt-20 text-lg font-medium animate-pulse">
//         📚 Loading your course...
//       </div>
//     );
//   }

//   const allCompleted =
//     course.modules.length > 0 &&
//     course.modules.every((mod) => completedModules.includes(mod.id));

//   return (
//     <div className="max-w-4xl mx-auto px-4 py-12 space-y-8 relative">
//       {/* Header */}
//       <motion.div
//         initial={{ opacity: 0, y: 8 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.3 }}
//       >
//         <h1 className="text-3xl font-bold text-blue-600 dark:text-pink-400 mb-2">
//           {course.subject}: {course.topic}
//         </h1>
//         <p className="text-gray-700 dark:text-gray-300">{course.summary}</p>
//       </motion.div>

//       {/* Modules */}
//       <div className="space-y-6">
//         {course.modules.map((mod, idx) => {
//           const isCompleted = completedModules.includes(mod.id);
//           return (
//             <motion.div
//               key={mod.id}
//               onClick={() => handleCardClick(mod.id)}
//               initial={{ opacity: 0, y: 15 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.2 }}
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//               className={`cursor-pointer border rounded-lg p-4 shadow-md transition hover:shadow-lg ${
//                 isCompleted
//                   ? "bg-green-50 dark:bg-green-900 border-green-300 dark:border-green-600"
//                   : "bg-white dark:bg-[#1e1e1e] border-blue-100 dark:border-pink-500/20"
//               }`}
//             >
//               <h3
//                 className={`text-xl font-semibold ${
//                   isCompleted
//                     ? "text-green-700 dark:text-green-300"
//                     : "text-blue-500 dark:text-pink-400"
//                 }`}
//               >
//                 {idx + 1}. {mod.title}
//               </h3>
//               <p className="text-gray-600 dark:text-gray-300">
//                 {mod.description}
//               </p>
//               {isCompleted && (
//                 <div className="mt-2 text-sm text-green-600 dark:text-green-300 flex items-center gap-1">
//                   <CheckCircle2 size={16} /> Completed
//                 </div>
//               )}
//             </motion.div>
//           );
//         })}
//       </div>

//       {/* Mark Course Complete */}
//       {allCompleted && !courseCompleted && (
//         <motion.button
//           onClick={handleMarkCourseComplete}
//           disabled={loading}
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           whileHover={{ scale: loading ? 1 : 1.05 }}
//           whileTap={{ scale: loading ? 1 : 0.95 }}
//           className={`mt-10 w-full py-3 px-6 rounded-xl text-white font-semibold text-lg shadow-lg ${
//             loading
//               ? "bg-gray-400 cursor-not-allowed"
//               : "bg-pink-500 hover:bg-pink-600"
//           }`}
//         >
//           {loading ? "Marking..." : "🎉 Mark Course Complete"}
//         </motion.button>
//       )}

//       {/* Go to Dashboard */}
//       {courseCompleted && (
//         <motion.button
//           onClick={() => router.push("/dashboard")}
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//           className="mt-10 w-full py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg shadow-lg"
//         >
//           🚀 Go to Dashboard
//         </motion.button>
//       )}

//       {/* Floating Buttons */}
//       <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
//         <button
//           onClick={() => router.push("/course/request")}
//           title="Request AI Course"
//           className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg hover:scale-105 transition"
//         >
//           <Sparkles size={22} />
//         </button>

//         <button
//           onClick={() => router.push("/doubt")}
//           title="Ask a Doubt"
//           className="p-3 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 text-white shadow-lg hover:scale-105 transition"
//         >
//           <HelpCircle size={22} />
//         </button>
//       </div>
//     </div>
//   );
// }

"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, HelpCircle, Sparkles } from "lucide-react";

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
    const token = localStorage.getItem("token");
    if (!token || !courseId) {
      setError("⚠️ Missing token or course ID.");
      return;
    }

    try {
      const courseRes = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!courseRes.ok) throw new Error("Failed to fetch course");
      const { course } = await courseRes.json();
      setCourse(course);

      const dashRes = await fetch(`http://localhost:5000/api/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!dashRes.ok) throw new Error("Failed to fetch dashboard");
      const dashboard = await dashRes.json();

      const courseEntry = dashboard.courseModules.find(
        (c: any) => c.courseId === courseId
      );

      if (!courseEntry) {
        console.warn("No course entry found in dashboard");
        return;
      }

      const completed = courseEntry.completedModules?.map((m: any) => m.moduleId) || [];
      setCompletedModules(completed);

      if (courseEntry.isCompleted) {
        setCourseCompleted(true);
        setAllCompleted(true);
        console.log("✅ Course already marked complete.");
      } else {
        const allAreCompleted =
          course?.modules?.every((mod: { id: any; }) => completed.includes(mod.id)) ?? false;
        setAllCompleted(allAreCompleted);
        setCourseCompleted(false);
      }

      // Debug logging
      console.log("📘 Modules:", course?.modules.map((m: { id: any; }) => m.id));
      console.log("✅ Completed:", completed);
    } catch (err) {
      console.error(err);
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

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("⚠️ No auth token found in localStorage");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`http://localhost:5000/api/courses/${course.id}/complete`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId: course.id, markedAt: new Date().toISOString() }),
      });

      if (response.ok) {
        console.log("✅ Marked course complete");
        setCourseCompleted(true);
        setAllCompleted(true);
        await fetchCourseAndProgress();
      } else {
        const result = await response.json();
        console.error("❌ Failed to mark complete:", result.error);
      }
    } catch (error) {
      console.error("❌ Error marking course complete:", error);
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
