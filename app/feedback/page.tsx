
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

const feedbackSchema = z.object({
  message: z.string().min(5, 'Feedback must be at least 5 characters'),
  rating: z.string().optional(),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function FeedbackPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
  });

  const onSubmit = async (data: FeedbackFormData) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Missing token');

      const res = await fetch(`${baseUrl}/api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed to send feedback');

      reset();
      setSubmitted(true);
      setTimeout(() => router.push('/dashboard'), 2500);
    } catch {
      alert('❌ Failed to send feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
      {/* 🌈 Animated Background Glow */}
      <motion.div
        className="absolute -z-10 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-pink-500 via-purple-600 to-blue-500 opacity-30 blur-3xl animate-spin-slow"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 40, ease: 'linear' }}
      />

      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="thankyou"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6 }}
            className="max-w-md w-full p-8 rounded-2xl shadow-2xl border border-blue-200 dark:border-pink-500/30 text-center backdrop-blur-lg bg-white/80 dark:bg-[#121212]/70"
          >
            <h2 className="text-3xl font-bold text-blue-600 dark:text-pink-400 mb-3">🎉 Thank You!</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Your feedback helps us improve. Redirecting to dashboard...
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            onSubmit={handleSubmit(onSubmit)}
            className="w-full max-w-md p-8 rounded-2xl shadow-2xl border border-blue-200 dark:border-pink-500/30 space-y-5 backdrop-blur-lg bg-white/80 dark:bg-[#121212]/70"
          >
            <div className="text-center">
              <h1 className="text-2xl font-bold text-blue-600 dark:text-pink-400">Share Your Feedback 📝</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Help us improve your experience</p>
            </div>

            <div>
              <textarea
                {...register('message')}
                rows={4}
                placeholder="Type your feedback..."
                className="w-full px-4 py-3 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-pink-400 text-sm resize-none dark:bg-[#1c1c1c] dark:text-white"
              />
              {errors.message && <p className="text-sm text-red-500 mt-1">{errors.message.message}</p>}
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Rate your experience:</label>
              <select
                {...register('rating')}
                className="w-full px-3 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-pink-400 text-sm dark:bg-[#1c1c1c] dark:text-white"
              >
                <option value="">Select</option>
                <option value="excellent">Excellent 😊</option>
                <option value="good">Good 👍</option>
                <option value="average">Average 😐</option>
                <option value="poor">Poor 😞</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-md text-white font-semibold bg-gradient-to-r from-blue-500 to-purple-600 dark:from-pink-500 dark:to-purple-700 hover:scale-105 transition-transform duration-200 shadow-lg ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Sending...' : 'Submit Feedback'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

