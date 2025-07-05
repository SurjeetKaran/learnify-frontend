

'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

const requestSchema = z.object({
  subject: z.string().min(1, 'Please select a subject'),
  topic: z.string().min(1, 'Topic is required'),
});

type RequestFormData = z.infer<typeof requestSchema>;

export default function RequestCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
  });

  const onSubmit = async (data: RequestFormData) => {
    setLoading(true);
    setError('');

    try {
      await new Promise((res) => setTimeout(res, 1200));
      await api.post('/courses/generate', data);
      setSubmitted(true);
      setTimeout(() => router.push('/course/wait'), 2000);
    } catch (err) {
      setError('❌ Failed to request course. Please try again.');
      console.error('Request error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
      {/* 🌈 Animated Background Glow */}
      <motion.div
        className="absolute -z-10 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-pink-500 via-purple-600 to-blue-500 opacity-30 blur-3xl animate-spin-slow"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 40, ease: 'linear' }}
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md p-8 rounded-xl shadow-2xl border border-blue-200 dark:border-pink-500/30 backdrop-blur-md bg-white/80 dark:bg-[#121212]/70 space-y-6 animate-slide-up"
      >
        <h2 className="text-3xl font-bold text-center text-blue-600 dark:text-pink-400">
          Request AI Course 🧠
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-400">
          Generate a personalized course based on what you want to learn.
        </p>

        {/* Subject Dropdown */}
        <div className="relative">
          <select
            {...register('subject')}
            className="w-full px-4 py-3 border rounded-md bg-transparent text-gray-700 dark:text-gray-200 dark:bg-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-pink-400"
          >
            <option value="">Select a subject</option>
            <option value="Math">Math</option>
            <option value="Science">Science</option>
            <option value="English">English</option>
            <option value="Social Studies">Social Studies</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Other">Other</option>
          </select>
          {errors.subject && (
            <p className="text-sm text-red-500 mt-1">{errors.subject.message}</p>
          )}
        </div>

        {/* Topic Field */}
        <div className="relative">
          <input
            id="topic"
            type="text"
            {...register('topic')}
            placeholder="e.g. Linear Equations"
            className="peer w-full px-4 pt-5 pb-2 border rounded-md bg-transparent placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-pink-400 dark:bg-[#1a1a1a] text-gray-900 dark:text-white"
          />
          <label
            htmlFor="topic"
            className="absolute left-4 top-2 text-sm text-gray-500 dark:text-gray-400 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm transition-all"
          >
            Topic
          </label>
          {errors.topic && (
            <p className="text-sm text-red-500 mt-1">{errors.topic.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-md text-white font-semibold bg-gradient-to-r from-blue-500 to-purple-600 dark:from-pink-500 dark:to-purple-700 hover:scale-105 transition-transform duration-200 shadow-lg ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Requesting...' : 'Generate Course'}
        </button>

        {/* Success Message */}
        <AnimatePresence>
          {submitted && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-green-600 dark:text-green-400 text-center text-sm"
            >
              ✅ Your course request was submitted successfully!
            </motion.p>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-red-600 dark:text-red-400 text-center text-sm"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}
