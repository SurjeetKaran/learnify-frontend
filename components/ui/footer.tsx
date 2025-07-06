"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";
import { FcGoogle } from "react-icons/fc";

export default function Footer() {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const checkStandalone = () => {
      const isInStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true;

      setIsStandalone(isInStandalone);
    };

    checkStandalone();
  }, []);

  if (isStandalone) return null;

  return (
    <footer className="w-full bg-white dark:bg-[#121212] border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 py-6 mt-12">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-8">
        {/* Brand & Description */}
        <div>
          <Link href="/dashboard" className="flex items-center gap-[2px]">
            <img src="/Learnify.svg" alt="Learnify Logo" className="h-7 w-7" />
            <span className="text-xl font-bold text-blue-600 dark:text-blue-600">
              earnify
            </span>
          </Link>
          <p className="mt-2 text-sm">
            Empowering students with personalized, intelligent learning
            experiences.
          </p>

          {/* Social Icons */}
          <div className="flex space-x-4 mt-4 text-xl text-gray-600 dark:text-gray-400">
            <a
              href="https://www.google.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Google"
            >
              <FcGoogle />
            </a>
            <a
              href="https://www.linkedin.com/in/surjeet-karan"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="hover:text-blue-700"
            >
              <FaLinkedin />
            </a>
            <a
              href="https://github.com/SurjeetKaran/learnify-frontend.git"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="hover:text-gray-800 dark:hover:text-white"
            >
              <FaGithub />
            </a>
            <a
              href="/feedback"
              aria-label="Email"
              className="hover:text-pink-500"
            >
              <HiOutlineMail />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-md font-semibold mb-2">Quick Links</h3>
          <ul className="space-y-1">
            <li>
              <Link href="/dashboard" className="hover:underline">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/courses" className="hover:underline">
                Courses
              </Link>
            </li>
            <li>
              <Link href="/doubt" className="hover:underline">
                Ask a Doubt
              </Link>
            </li>
            <li>
              <Link href="/profile" className="hover:underline">
                Profile
              </Link>
            </li>
          </ul>
        </div>

        {/* Support Links */}
        <div>
          <h3 className="text-md font-semibold mb-2">Support</h3>
          <ul className="space-y-1">
            <li>
              <Link href="/feedback" className="hover:underline">
                Help Center
              </Link>
            </li>
            <li>
              <Link href="/feedback" className="hover:underline">
                Send Feedback
              </Link>
            </li>
            <li>
              <Link href="/feedback" className="hover:underline">
                Terms & Conditions
              </Link>
            </li>
            <li>
              <Link href="/feedback" className="hover:underline">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center mt-6 text-xs text-gray-500 dark:text-gray-500">
        © 2025 Learnify. All rights reserved.
      </div>
    </footer>
  );
}
