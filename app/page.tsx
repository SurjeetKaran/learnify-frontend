'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Add dark class when component mounts
    document.documentElement.classList.add('dark');

    return () => {
      // Optional: Remove dark class when navigating away
      document.documentElement.classList.remove('dark');
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-between px-6 py-12 bg-transparent text-gray-900 dark:text-white transition-colors duration-300">
      <main className="flex flex-col items-center text-center space-y-8 mt-10 max-w-xl">
        <span className="text-5xl font-extrabold text-blue-600 dark:text-pink-400 tracking-tight">
          Learnify
        </span>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
          Welcome to Your AI-Powered Learning World
        </h1>

        <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300">
          🚀 Master school topics. 🧠 Play brain-boosting games. 🎯 Level up with AI.
        </p>

        <ul className="space-y-2 text-left text-base sm:text-lg font-medium text-gray-800 dark:text-gray-200">
          <li>✅ Personalized by Grade & Learning Style</li>
          <li>✅ AI-Generated Concept Explanations</li>
          <li>✅ 5 Game Modes for Fun + Learning</li>
          <li>✅ Progress Tracking & Mastery Feedback</li>
        </ul>

        <button
          onClick={() => router.push('/auth/login')}
          className="mt-6 bg-blue-600 hover:bg-blue-700 dark:bg-pink-500 dark:hover:bg-pink-600 text-white px-6 py-3 rounded-full text-lg font-semibold transition-all duration-200"
        >
          🎮 Get Started
        </button>
      </main>

      <footer className="mt-16 text-sm text-gray-500 dark:text-gray-400">
        Built for Students in Grades 6–12 • Made with ❤️ and AI
      </footer>
    </div>
  );
}
