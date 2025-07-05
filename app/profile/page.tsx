"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

const profileSchema = z.object({
  name: z.string().min(2, "Name is required"),
  grade: z.string().min(1, "Please select a grade"),
  board: z.string().min(1, "Please select your board"),
});

type ProfileData = z.infer<typeof profileSchema>;

export default function GetProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [deletePassword, setDeletePassword] = useState("");

  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "">("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.get<ProfileData>("/users/me");
        setValue("name", data.name);
        setValue("grade", data.grade);
        setValue("board", data.board);
      } catch (err) {
        console.error("❌ Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, [setValue]);

  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => {
        setStatusMessage("");
        setStatusType("");
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const onSubmit = async (data: ProfileData) => {
    try {
      setLoading(true);
      await api.put("/users/update-profile", data);
      setStatusMessage("✅ Profile updated successfully!");
      setStatusType("success");
    } catch (err) {
      console.error("❌ Update failed:", err);
      setStatusMessage("❌ Failed to update profile.");
      setStatusType("error");
    } finally {
      setLoading(false);
    }
  };

const handleDelete = async () => {
  if (!deleteReason.trim()) {
    setStatusMessage("❌ Please provide a reason for deletion.");
    setStatusType("error");
    return;
  }

  try {
    setLoading(true);

    await api.delete("/users/me", {
      data: { reason: deleteReason },
    });

    setStatusMessage("✅ Account deleted successfully");
    setStatusType("success");

    // Clear session/token
    localStorage.clear();
    document.cookie = "token=; Max-Age=0; path=/;";

    // Redirect after short delay
    setTimeout(() => router.push("/auth/login"), 2000);
  } catch (err) {
    console.error("❌ Delete failed:", err);
    setStatusMessage("❌ Failed to delete account.");
    setStatusType("error");
  } finally {
    setLoading(false);
  }
};


 return (
  <div className="flex items-center justify-center min-h-[80vh] px-4 py-8 animate-fade-in">
    {statusMessage && (
      <div
        className={cn(
          "fixed top-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-md shadow-md text-sm font-medium z-50 animate-fade-slide",
          statusType === "success"
            ? "bg-green-100 text-green-800 border border-green-300"
            : "bg-red-100 text-red-800 border border-red-300"
        )}
      >
        {statusMessage}
      </div>
    )}

    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-md bg-white dark:bg-[#121212] p-8 rounded-xl shadow-2xl border border-blue-200 dark:border-pink-500/30 backdrop-blur-md animate-slide-up space-y-6"
    >
      <h2 className="text-3xl font-bold text-center text-blue-600 dark:text-pink-400">
        Edit Your Profile 👤
      </h2>

      {/* Name */}
      <div className="relative">
        <input
          {...register("name")}
          type="text"
          readOnly
          className="w-full px-4 py-3 border rounded-md bg-gray-100 dark:bg-[#1a1a1a] text-gray-700 dark:text-gray-200 cursor-not-allowed"
        />
        {errors.name && (
          <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Grade */}
      <div className="relative">
        <select
          {...register("grade")}
          className="w-full px-4 py-3 border rounded-md bg-white dark:bg-[#1c1c1c] text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-pink-400"
        >
          <option value="">Select your grade</option>
          {[6, 7, 8, 9, 10, 11, 12].map((g) => (
            <option key={g} value={String(g)}>
              {g}
            </option>
          ))}
        </select>
        {errors.grade && (
          <p className="text-sm text-red-500 mt-1">{errors.grade.message}</p>
        )}
      </div>

      {/* Board */}
      <div className="relative">
        <select
          {...register("board")}
          className="w-full px-4 py-3 border rounded-md bg-white dark:bg-[#1c1c1c] text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-pink-400"
        >
          <option value="">Select your board</option>
          {["CBSE", "ICSE", "STATE", "IGCSE", "OTHER"].map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        {errors.board && (
          <p className="text-sm text-red-500 mt-1">{errors.board.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 rounded-md text-white font-semibold bg-gradient-to-r from-blue-500 to-purple-600 dark:from-pink-500 dark:to-purple-700 hover:scale-105 transition-transform duration-200 shadow-lg ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {loading ? "Saving..." : "Save Profile"}
      </button>

      {/* Delete Account Section */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
        <button
          type="button"
          onClick={() => setShowDeleteForm(!showDeleteForm)}
          className="flex items-center justify-center gap-2 w-full py-2 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold transition"
        >
          🗑️ {showDeleteForm ? "Cancel" : "Delete Account"}
        </button>

        <div
          className={cn(
            "grid transition-all duration-500 ease-in-out overflow-hidden",
            showDeleteForm ? "max-h-[1000px] mt-4" : "max-h-0"
          )}
        >
          <div className="space-y-4">
            <p className="text-sm font-medium text-red-500">⚠️ Delete Account</p>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Why are you deleting your account?
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  "Too many emails",
                  "Found better app",
                  "Privacy concern",
                  "Just exploring",
                ].map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setDeleteReason(reason)}
                    className={cn(
                      "px-3 py-2 rounded-md text-sm border transition",
                      deleteReason === reason
                        ? "bg-red-100 dark:bg-red-900 border-red-500 text-red-600 dark:text-red-300"
                        : "bg-white dark:bg-[#1a1a1a] hover:border-red-400 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                    )}
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              disabled={!deleteReason}
              onClick={handleDelete}
              className={cn(
                "w-full py-2 rounded-md text-white font-semibold transition",
                !deleteReason
                  ? "bg-red-400 cursor-not-allowed opacity-60"
                  : "bg-red-600 hover:bg-red-700"
              )}
            >
              Confirm Delete Account
            </button>
          </div>
        </div>
      </div>
    </form>
  </div>
);

}
