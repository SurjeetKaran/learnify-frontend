'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import api from '@/lib/api';

const schema = z.object({
  email: z.string().email({ message: 'Enter a valid email' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type LoginFormData = z.infer<typeof schema>;

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(schema),
  });

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showMessage, setShowMessage] = useState(false);

  // ✅ Force dark theme on this page only
  useEffect(() => {
    document.documentElement.classList.add('dark');
    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, []);

  useEffect(() => {
    if (loginError) {
      setShowMessage(true);
      const timer = setTimeout(() => setShowMessage(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [loginError]);

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setLoginError('');

    try {
      const result = await api.post('/users/login', data);

      if (!result?.token || !result?.user) {
        throw new Error('Invalid login response');
      }

      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));

      router.push('/dashboard');
    } catch (err: any) {
      const msg = err?.response?.data?.error || err.message || 'Login failed';
      setLoginError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-transparent text-white min-h-screen flex items-center justify-center px-4 relative">
      {/* 🌈 Glowing Background */}
      <motion.div
        className="absolute -z-10 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-pink-500 via-purple-600 to-blue-500 opacity-40 blur-3xl animate-spin-slow"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 40, ease: 'linear' }}
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md bg-white dark:bg-[#121212] text-black dark:text-white p-8 rounded-xl shadow-2xl border border-blue-200 dark:border-pink-500/30 backdrop-blur-md space-y-6 animate-slide-up"
      >
        <h2 className="text-3xl font-bold text-center text-blue-600 dark:text-pink-400">
          Welcome Back 🎓
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-400">
          Log in to continue your learning adventure!
        </p>

        {/* Email Field */}
        <div className="relative">
          <input
            {...register('email')}
            type="email"
            id="email"
            placeholder="Email"
            className="peer w-full px-4 pt-5 pb-2 border rounded-md bg-transparent placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-pink-400"
          />
          <label
            htmlFor="email"
            className="absolute left-4 top-2 text-sm text-gray-500 dark:text-gray-400 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm transition-all"
          >
            Email
          </label>
          {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
        </div>

        {/* Password Field */}
        <div className="relative">
          <input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            id="password"
            placeholder="Password"
            className="peer w-full px-4 pt-5 pb-2 pr-10 border rounded-md bg-transparent placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-pink-400"
          />
          <label
            htmlFor="password"
            className="absolute left-4 top-2 text-sm text-gray-500 dark:text-gray-400 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm transition-all"
          >
            Password
          </label>
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 dark:text-gray-300 hover:text-blue-600 dark:hover:text-pink-400"
            tabIndex={-1}
          >
            {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
          </button>
          {errors.password && (
            <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Error Display */}
        {showMessage && loginError && (
          <div className="text-sm px-4 py-3 rounded-md text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300 border border-red-300 dark:border-red-700 animate-fade-slide">
            ⚠️ {loginError}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-md text-white font-semibold bg-gradient-to-r from-blue-500 to-purple-600 dark:from-pink-500 dark:to-purple-700 hover:scale-105 transition-transform duration-200 shadow-lg ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        {/* Redirect to Register */}
        <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
          <p>
            New here?{' '}
            <button
              type="button"
              onClick={() => router.push('/auth/register')}
              className="text-blue-600 dark:text-pink-400 hover:underline font-semibold"
            >
              Join us →
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}
