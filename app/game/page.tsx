import { Suspense } from "react";
import GamePage from "./GamePage";

export default function GameWrapper() {
  return (
    <Suspense
      fallback={
        <div className="text-center mt-20 text-blue-600 dark:text-pink-400">
          🎮 Loading Game Modes...
        </div>
      }
    >
      <GamePage />
    </Suspense>
  );
}
