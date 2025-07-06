"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import api from "@/lib/api";

const navItems = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Courses", href: "/course" },
  { name: "Profile", href: "/profile" },
  { name: "Ask Doubt", href: "/doubt" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await api.post("/users/logout", {}); // 👈 required empty body
    } catch (err) {
      console.error("❌ Failed to call logout API:", err);
    }

    // ✅ Clear localStorage and redirect
    localStorage.clear();
    router.push("/auth/login");
  };

  return (
    <nav className="w-full bg-white dark:bg-[#121212] border-b border-gray-200 dark:border-gray-700 shadow-sm px-4 py-3 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Logo and nav links */}
        <div className="flex items-center space-x-6">
          <Link href="/dashboard" className="flex items-center gap-[2px]">
            <img src="/Learnify.svg" alt="Learnify Logo" className="h-7 w-7" />
            <span className="text-xl font-bold text-blue-600 dark:text-blue-600">
              earnify
            </span>
          </Link>

          <div className="hidden sm:flex items-center space-x-6 text-sm font-medium text-gray-700 dark:text-gray-300">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "hover:text-blue-600 dark:hover:text-pink-400 transition-colors",
                  pathname === item.href &&
                    "text-blue-600 dark:text-pink-400 font-semibold"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Right: Theme toggle and Logout */}
        <div className="hidden sm:flex items-center space-x-4 ml-auto">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-sm px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-red-100 dark:hover:bg-red-800 text-red-600 dark:text-red-400"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>

        {/* Mobile menu toggle */}
        <div className="sm:hidden flex items-center space-x-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile nav menu */}
      {mobileOpen && (
        <div className="sm:hidden mt-2 space-y-2 text-sm text-gray-700 dark:text-gray-300 px-4">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "block py-2 px-3 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900",
                pathname === item.href &&
                  "bg-blue-100 dark:bg-blue-900 font-semibold text-blue-600 dark:text-pink-400"
              )}
            >
              {item.name}
            </Link>
          ))}

          {/* Logout button for mobile */}
          <button
            onClick={async () => {
              await handleLogout();
              setMobileOpen(false);
            }}
            className="flex items-center gap-2 w-full text-left py-2 px-3 rounded-md border border-gray-300 dark:border-gray-700 mt-4 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-800"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}
    </nav>
  );
}
