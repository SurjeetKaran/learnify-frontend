"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Doubt {
  _id: string;
  question: string;
  answer: string;
  createdAt: string;
}

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function DoubtHistoryPage() {
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDoubts = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Missing token");

        const res = await fetch(`${baseUrl}/api/doubts`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch doubts");

        const data = await res.json();
        setDoubts(data?.doubts || []);
      } catch (err: any) {
        console.error("❌ Error fetching doubts:", err.message);
        setError("Failed to load doubts. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoubts();
  }, []);

 return (
  <div className="min-h-screen px-4 py-6 flex items-center justify-center relative overflow-hidden">
    {/* 🌈 Removed glowing background blob */}

    <div className="w-full max-w-md bg-white dark:bg-[#121212] p-6 rounded-2xl shadow-2xl border border-blue-200 dark:border-pink-500/30 flex flex-col space-y-4 animate-fade-in min-h-[65vh]">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-blue-600 dark:text-pink-400">
          Doubt History 🕓
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Review your past questions and answers
        </p>
      </div>

      {loading ? (
        <p className="text-center text-gray-400 text-sm mt-8">
          Loading previous doubts...
        </p>
      ) : error ? (
        <p className="text-center text-red-500 text-sm mt-8">{error}</p>
      ) : doubts.length === 0 ? (
        <p className="text-center text-gray-400 text-sm mt-8">
          No doubts found.
        </p>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-4">
          {doubts.map((doubt) => (
            <div
              key={doubt.createdAt}
              className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1b1b1b] shadow-sm space-y-2"
            >
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Asked on: {new Date(doubt.createdAt).toLocaleString()}
              </p>
              <p className="font-medium text-gray-800 dark:text-white">
                ❓ {doubt.question}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                🤖 {doubt.answer}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

}
