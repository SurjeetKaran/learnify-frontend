'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CourseGenerationPage() {
  const [secondsLeft, setSecondsLeft] = useState(5); // 10 sec
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          router.push('/course'); // 🔁 Update to your actual course view route
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [router]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-blue-600 dark:text-pink-400">
        🚧 Generating your course...
      </h1>
      <p className="text-gray-700 dark:text-gray-300 text-lg max-w-xl">
        Hang tight! We're customizing your learning content based on your request.
      </p>
      <div className="text-4xl font-mono text-blue-500 dark:text-pink-400">
        ⏳ {formatTime(secondsLeft)}
      </div>
    </div>
  );
}
