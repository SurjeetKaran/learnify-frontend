"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Gamepad2,
  Timer,
  Puzzle,
  Shuffle,
  BookOpenCheck,
  BookOpenText,
  CheckCircle,
  Loader2,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { JSX } from "react/jsx-runtime";
import api from "@/lib/api";

interface Game {
  _id: string;
  gameType: string;
  title: string;
  description: string;
}

const gameIcons: Record<string, JSX.Element> = {
  "quick-quiz": <Timer size={24} />,
  "puzzle-challenge": <Puzzle size={24} />,
  "concept-match": <Shuffle size={24} />,
  "flashcard-duel": <BookOpenCheck size={24} />,
  "story-mode": <BookOpenText size={24} />,
};

export default function GamePage() {
  const [games, setGames] = useState<Game[]>([]);
  const [completed, setCompleted] = useState<
    Map<string, { score: number; total: number }>
  >(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fetchedCourseId, setFetchedCourseId] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  const moduleId = searchParams.get("moduleId");

  useEffect(() => {
    const fetchSubmittedGameResults = async () => {
      if (!moduleId) return;

      try {
        const dashboard = await api.get("/dashboard");

        const resultMap = new Map<string, { score: number; total: number }>();
        let foundCourseId: string | null = null;

        dashboard.courseModules?.forEach((course: any) => {
          course.completedModules?.forEach((mod: any) => {
            if (mod.moduleId === moduleId) {
              foundCourseId = course.courseId || null;
              mod.gameResults?.forEach((res: any) => {
                resultMap.set(res.gameId, {
                  score: res.score,
                  total: res.total,
                });
              });
            }
          });
        });

        setCompleted(resultMap);
        setFetchedCourseId(foundCourseId);

        console.log(
          "Completed game results keys:",
          Array.from(resultMap.keys())
        );
        console.log("Fetched courseId:", foundCourseId);
      } catch (err) {
        console.error("❌ Error fetching dashboard results:", err);
      }
    };

    fetchSubmittedGameResults();
  }, [moduleId]);

  useEffect(() => {
    const fetchGames = async () => {
      if (!moduleId) {
        setError("Missing module ID.");
        setLoading(false);
        return;
      }

      try {
        const data = await api.get(`/module/${moduleId}/games`);
        setGames(data.games || []);
      } catch (err) {
        console.error("❌ Error fetching games:", err);
        setError("Failed to load games.");
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [moduleId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[100dvh] text-blue-600 dark:text-pink-400">
        <Loader2 className="animate-spin mr-2" />
        Loading Game Modes...
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 mt-10">{error}</div>;
  }

  // Check if all games are completed (disabled)
  const allGamesCompleted =
    games.length > 0 && games.every((game) => completed.has(String(game._id)));

  return (
    <div className="relative min-h-[100dvh] px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-6 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-pink-400 flex items-center justify-center gap-2">
          <Gamepad2 size={28} /> Choose a Game Mode
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
          Select how you'd like to challenge yourself today!
        </p>

        {games.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 mt-10">
            No games available.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-6">
            {games.map((game) => {
              const icon = gameIcons[game.gameType] || <Gamepad2 size={24} />;
              const result = completed.get(game._id);
              const isDone = !!result;

              const cardClasses = `relative rounded-xl border p-5 shadow-md space-y-3 text-left transition-transform ${
                isDone
                  ? "border-green-500 bg-green-50 dark:bg-green-900/10 opacity-70 cursor-not-allowed"
                  : "hover:shadow-lg hover:scale-[1.02] cursor-pointer border-blue-100 dark:border-pink-500/20 bg-white dark:bg-[#1c1c1c]"
              }`;

              const cardContent = (
                <>
                  <div className="flex items-center gap-3 text-blue-600 dark:text-pink-400">
                    {icon}
                    <h3 className="text-lg font-semibold">{game.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {game.description}
                  </p>
                  {isDone && (
                    <div className="absolute top-3 right-3 flex items-center gap-2 text-green-600 dark:text-green-400">
                      <CheckCircle size={20} />
                      <span className="text-xs font-semibold">
                        {result.score}/{result.total}
                      </span>
                    </div>
                  )}
                </>
              );

              return isDone ? (
                <div key={game._id} className={cardClasses}>
                  {cardContent}
                </div>
              ) : (
                <Link
                  key={game._id}
                  href={`/game/${game.gameType}/${moduleId}/${game._id}`}
                  className={cardClasses}
                >
                  {cardContent}
                </Link>
              );
            })}
          </div>
        )}

        {/* Show Go to Modules button only if moduleId exists AND all games completed AND courseId fetched */}
        {moduleId && allGamesCompleted && fetchedCourseId && (
          <div className="mt-10 text-center">
            <button
              onClick={() => router.push(`/course/view?id=${fetchedCourseId}`)}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-md text-white font-medium bg-purple-600 hover:bg-purple-700 transition"
            >
              Go to Modules
            </button>
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
