import type { CourseModule, CompletedModule } from './dashboard';

/**
 * Calculates the percentage score for a single game.
 * e.g., 3 correct out of 5 → 60%
 */
export function calculateGameScore(score: number, total: number): number {
  if (total === 0) return 0;
  return (score / total) * 100;
}

/**
 * Calculates the average score of all games in a module.
 * If no games are played, returns 0.
 */
export function calculateModuleScore(module: CompletedModule): number {
  if (!module.gameResults || module.gameResults.length === 0) return 0;

  const scores = module.gameResults.map(gr =>
    calculateGameScore(gr.score, gr.total)
  );
  const totalScore = scores.reduce((sum, s) => sum + s, 0);
  const average = totalScore / scores.length;

  return Math.round(average);
}

/**
 * Calculates the average score of all completed modules in a course.
 * If no modules are completed, returns 0.
 */
export function calculateCourseScore(course: CourseModule): number {
  if (!course.completedModules || course.completedModules.length === 0)
    return 0;

  const moduleScores = course.completedModules.map(calculateModuleScore);
  const totalScore = moduleScores.reduce((sum, s) => sum + s, 0);
  const average = totalScore / moduleScores.length;

  return Math.round(average);
}

/**
 * Returns Tailwind text color class based on score percentage.
 * Green (≥ 80), Yellow (60–79), Red (< 60)
 */
export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-yellow-500';
  return 'text-red-500';
}

/**
 * Returns an emoji based on score percentage.
 * ≥ 90: 🏅
 * ≥ 80: 🥳
 * ≥ 60: 👍
 * ≥ 40: 🧐
 * < 40: 😓
 */
export function getScoreEmoji(score: number): string {
  if (score >= 90) return '🏅';
  if (score >= 80) return '🥳';
  if (score >= 60) return '👍';
  if (score >= 40) return '🧐';
  return '😓';
}

export function getLowScoringModulesWithScore(
  course: CourseModule,
  threshold = 75
): { moduleId: string; title: string; score: number }[] {
  return course.completedModules
    .map((module) => {
      const scores = module.gameResults.map((gr) =>
        calculateGameScore(gr.score, gr.total)
      );
      const average =
        scores.length > 0
          ? scores.reduce((sum, s) => sum + s, 0) / scores.length
          : 0;

      return {
        moduleId: module.moduleId,
        title: module.title,
        score: Math.round(average),
      };
    })
    .filter((module) => module.score < threshold);
}

