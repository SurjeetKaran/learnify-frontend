

'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const schema = z.object({
  name: z.string().min(2, { message: 'Name is required' }),
  email: z.string().email({ message: 'Enter a valid email' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  grade: z.string().min(1, { message: 'Please select a grade' }),
  board: z.string().min(1, { message: 'Please select your board' }),
});

type RegisterFormData = z.infer<typeof schema>;

export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(schema),
  });

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Registration failed');

      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      router.push('/dashboard');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-transparent text-white min-h-screen flex items-center justify-center px-4 relative">

      {/* 🌈 Glowing Background */}
      <motion.div
        className="absolute -z-10 w-[800px] h-[800px] rounded-full bg-gradient-to-r from-pink-500 via-purple-600 to-blue-500 opacity-40 blur-3xl animate-spin-slow"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 50, ease: 'linear' }}
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-xl sm:max-w-2xl px-4 sm:px-8 bg-white dark:bg-[#121212] text-black dark:text-white p-8 rounded-xl shadow-2xl border border-blue-200 dark:border-pink-500/30 backdrop-blur-md transition-all duration-500 animate-slide-up space-y-6"
      >
        <h2 className="text-3xl font-bold text-center text-blue-600 dark:text-pink-400">Join Learnify 🎓</h2>
        <p className="text-center text-gray-600 dark:text-gray-400">Kickstart your learning journey!</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm mb-1">Full Name</label>
            <input
              {...register('name')}
              id="name"
              type="text"
              className="w-full px-4 py-2 rounded-md border bg-white dark:bg-[#1c1c1c] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-pink-400"
            />
            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm mb-1">Email</label>
            <input
              {...register('email')}
              id="email"
              type="email"
              className="w-full px-4 py-2 rounded-md border bg-white dark:bg-[#1c1c1c] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-pink-400"
            />
            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div className="relative">
            <label htmlFor="password" className="block text-sm mb-1">Password</label>
            <input
              {...register('password')}
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="w-full px-4 py-2 pr-10 rounded-md border bg-white dark:bg-[#1c1c1c] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-pink-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute top-[38px] right-3 text-gray-500 dark:text-gray-400"
            >
              {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>
            {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
          </div>

          {/* Grade */}
          <div>
            <label className="block text-sm mb-1">Grade</label>
            <select
              {...register('grade')}
              className="w-full px-4 py-2 rounded-md border bg-white dark:bg-[#1c1c1c] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-pink-400"
            >
              <option value="">Select grade</option>
              {['6', '7', '8', '9', '10', '11', '12'].map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            {errors.grade && <p className="text-sm text-red-500 mt-1">{errors.grade.message}</p>}
          </div>

          {/* Board */}
          <div>
            <label className="block text-sm mb-1">Board</label>
            <select
              {...register('board')}
              className="w-full px-4 py-2 rounded-md border bg-white dark:bg-[#1c1c1c] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-pink-400"
            >
              <option value="">Select board</option>
              {['CBSE', 'ICSE', 'STATE', 'IGCSE', 'OTHER'].map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            {errors.board && <p className="text-sm text-red-500 mt-1">{errors.board.message}</p>}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-md text-white font-semibold bg-gradient-to-r from-blue-500 to-purple-600 dark:from-pink-500 dark:to-purple-700 hover:scale-105 transition-transform duration-200 shadow-lg ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>

        {/* Switch to Login */}
        <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
          <p>
            Already a student?{' '}
            <button
              type="button"
              onClick={() => router.push('/auth/login')}
              className="text-blue-600 dark:text-pink-400 hover:underline font-semibold"
            >
              Login →
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}


