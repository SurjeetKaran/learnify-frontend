"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { History, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";

const doubtSchema = z.object({
  question: z.string().min(3, "Enter your question"),
});

type DoubtFormData = z.infer<typeof doubtSchema>;

interface Message {
  role: "user" | "ai";
  text: string;
}

const greetings = [
  "Hello! How can I help you today?",
  "Hey there! Need help with a topic?",
  "Welcome! Got a doubt? I'm here.",
  "👋 Hi! Ask me anything you're stuck on.",
  "Need a hand with something? Let’s solve it!",
];

export default function DoubtChatPage() {
  const [chat, setChat] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DoubtFormData>({
    resolver: zodResolver(doubtSchema),
  });

  // Add random greeting on first mount
  useEffect(() => {
    const randomGreeting =
      greetings[Math.floor(Math.random() * greetings.length)];
    setChat([{ role: "ai", text: `🤖 ${randomGreeting}` }]);
  }, []);

  const onSubmit = async (data: DoubtFormData) => {
    const userMessage: Message = { role: "user", text: data.question };
    setChat((prev) => [...prev, userMessage]);
    reset();
    setLoading(true);

    try {
      const response = await api.post("/doubt", {
        question: data.question,
      });

      if (!response?.doubt?.answer) {
        throw new Error("No answer received");
      }

      const aiMessage: Message = {
        role: "ai",
        text: `🤖 ${response.doubt.answer}`,
      };

      setChat((prev) => [...prev, aiMessage]);
    } catch (err) {
      setChat((prev) => [
        ...prev,
        {
          role: "ai",
          text: `❌ Failed to get answer. Please log in or try again later.`,
        },
      ]);
      console.error("Error asking doubt:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-6 bg-background">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl flex flex-col h-[65vh] rounded-2xl border border-blue-200 dark:border-pink-500/30 bg-white dark:bg-[#121212] shadow-xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-pink-400">
              Ask a Doubt 💬
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              AI will help you instantly
            </p>
          </div>
          {chat.length > 0 && (
            <button
              onClick={() => router.push("/doubt/history")}
              title="View Doubt History"
              className="p-2 rounded-full bg-blue-100 dark:bg-pink-700/20 text-blue-600 dark:text-pink-300 hover:scale-105 transition"
            >
              <History size={18} />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md p-3 space-y-3 text-sm">
          {chat.length === 0 && (
            <p className="text-center text-gray-400 mt-6">
              No doubts yet. Ask one below 👇
            </p>
          )}
          <AnimatePresence>
            {chat.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex items-start gap-2 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "ai" && (
                  <div className="mt-1 text-gray-500 dark:text-gray-300">
                    <Bot size={18} />
                  </div>
                )}
                <div
                  className={`px-3 py-2 rounded-md max-w-[80%] break-words whitespace-pre-wrap text-sm leading-snug ${
                    msg.role === "user"
                      ? "bg-blue-100 dark:bg-blue-900 text-gray-900 dark:text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                  }`}
                >
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && (
            <p className="text-sm text-gray-400 italic">AI is typing...</p>
          )}
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col sm:flex-row gap-2"
        >
          <input
            {...register("question")}
            type="text"
            placeholder="Type your doubt..."
            className="flex-1 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-transparent text-sm text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-pink-400"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-4 py-2 rounded-md bg-gradient-to-r from-blue-500 to-purple-600 dark:from-pink-500 dark:to-purple-700 text-white font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Send
          </button>
        </form>

        {errors.question && (
          <p className="text-sm text-red-500 mt-1">{errors.question.message}</p>
        )}
      </div>
    </div>
  );
}
