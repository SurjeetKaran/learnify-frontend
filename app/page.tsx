// "use client";

// import { useEffect } from "react";
// import { useRouter } from "next/navigation";

// export default function Home() {
//   const router = useRouter();

//   useEffect(() => {
//     // Add dark class when component mounts
//     document.documentElement.classList.add("dark");

//     return () => {
//       // Optional: Remove dark class when navigating away
//       document.documentElement.classList.remove("dark");
//     };
//   }, []);

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-between px-6 py-12 bg-transparent text-gray-900 dark:text-white transition-colors duration-300">
//       <main className="flex flex-col items-center text-center space-y-8 mt-10 max-w-xl">
//         <span className="flex items-center gap-1 text-5xl font-extrabold text-blue-600 dark:text-blue-600 tracking-tight">
//           <img src="/Learnify.svg" alt="Learnify Logo" className="h-18 w-18" />
//           earnify
//         </span>

//         <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
//           Welcome to Your AI-Powered Learning World
//         </h1>

//         <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300">
//           🚀 Master school topics. 🧠 Play brain-boosting games. 🎯 Level up
//           with AI.
//         </p>

//         <ul className="space-y-2 text-left text-base sm:text-lg font-medium text-gray-800 dark:text-gray-200">
//           <li>✅ Personalized by Grade & Learning Style</li>
//           <li>✅ AI-Generated Concept Explanations</li>
//           <li>✅ 5 Game Modes for Fun + Learning</li>
//           <li>✅ Progress Tracking & Mastery Feedback</li>
//         </ul>

//         <button
//           onClick={() => router.push("/auth/login")}
//           className="mt-6 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-6 py-3 rounded-full text-lg font-semibold transition-all duration-200"
//         >
//           🎮 Get Started
//         </button>
//       </main>

//       <footer className="mt-16 text-sm text-gray-500 dark:text-gray-400">
//         Built for Students in Grades 6–12 • Made with ❤️ and AI
//       </footer>
//     </div>
//   );
// }

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    document.documentElement.classList.add("dark");
    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, []);

  const listVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="bg-transparent text-white min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* 🌈 Glowing Background */}
      <motion.div
        className="absolute -z-10 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-pink-500 via-purple-600 to-blue-500 opacity-40 blur-3xl animate-spin-slow"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
      />

      <main className="flex flex-col items-center text-center space-y-8 max-w-xl z-10">
        <motion.span
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-1 text-5xl font-extrabold text-blue-600 dark:text-blue-600 tracking-tight"
        >
          <img src="/Learnify.svg" alt="Learnify Logo" className="h-18 w-18" />
          earnify
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl font-bold"
        >
          Welcome to Your AI-Powered Learning World
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-lg sm:text-xl text-gray-200"
        >
          🚀 Master school topics. 🧠 Play brain-boosting games. 🎯 Level up with AI.
        </motion.p>

        {/* ✅ Animated Feature List */}
        <motion.ul
          initial="hidden"
          animate="show"
          variants={listVariants}
          className="space-y-2 text-left text-base sm:text-lg font-medium text-gray-100"
        >
          {[
            "✅ Personalized by Grade & Learning Style",
            "✅ AI-Generated Concept Explanations",
            "✅ 5 Game Modes for Fun + Learning",
            "✅ Progress Tracking & Mastery Feedback",
          ].map((text, index) => (
            <motion.li key={index} variants={itemVariants}>
              {text}
            </motion.li>
          ))}
        </motion.ul>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={() => router.push("/auth/login")}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full text-lg font-semibold transition-all duration-200"
        >
          🎮 Get Started
        </motion.button>
      </main>

      <footer className="absolute bottom-4 text-sm text-gray-300">
        Built for Students in Grades 6–12 • Made with ❤️ and AI
      </footer>
    </div>
  );
}
