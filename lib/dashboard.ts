

// ========== Types ==========
export type GameResult = {
  gameId: string;
  gameTitle: string;
  score: number;
  total: number;
  timestamp: string;
};

export type CompletedModule = {
  moduleId: string;
  title: string;
  gameResults: GameResult[];
};

export type CourseModule = {
  courseId: string;
  title?: string;         // Optional title
  course?: string;        // Optional course name (fallback)
  completedModules: CompletedModule[];
};

export type GameResultPayload = {
  gameId: string;
  gameTitle: string;
  score: number;
  total: number;
  timestamp: string;
};

export type CompletedModulePayload = {
  moduleId: string;
  title: string;
};

type SaveDashboardProgressPayload = {
  courseId: string;
  completedModule: CompletedModulePayload;
  gameResult?: GameResultPayload;
};

// ========== Helpers ==========

/**
 * Returns the course title (prefers `title`, then `course`, fallback: "Untitled")
 */
export function getCourseTitle(course: CourseModule): string {
  return course.title || course.course || "Untitled";
}

// ========== API ==========

/**
 * Save module progress or game result to the dashboard
 */
export async function saveDashboardProgress(payload: SaveDashboardProgressPayload) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Missing auth token");

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/save`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const raw = await res.text();
    let errorMessage = "Failed to save dashboard progress";

    try {
      const parsed = JSON.parse(raw);
      errorMessage = parsed?.message || errorMessage;
    } catch {
      console.error("❌ Raw server error (non-JSON):", raw);
    }

    throw new Error(errorMessage);
  }

  return res.json();
}

/**
 * Fetch the full dashboard for the logged-in user
 */
export async function fetchDashboard() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Missing auth token");

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    let errorMessage = "Failed to fetch dashboard";
    try {
      const error = await res.json();
      errorMessage = error?.message || errorMessage;
    } catch {
      const raw = await res.text();
      console.error("❌ Raw server error (not JSON):", raw);
    }
    throw new Error(errorMessage);
  }

  return res.json(); // { courseModules: [...] }
}

/**
 * Fetch game results for a specific module within a course
 */
export async function fetchModuleGameResults(moduleId: string, courseId: string) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Missing auth token");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/dashboard/module/${moduleId}/results?courseId=${courseId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    let errorMessage = "Failed to fetch module game results";
    try {
      const error = await res.json();
      errorMessage = error?.message || errorMessage;
    } catch {
      const raw = await res.text();
      console.error("❌ Raw server error (not JSON):", raw);
    }
    throw new Error(errorMessage);
  }

  const data = await res.json();
  return data.gameResults;
}
