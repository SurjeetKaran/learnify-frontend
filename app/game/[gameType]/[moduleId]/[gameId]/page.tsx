'use client';

import { useParams } from 'next/navigation';
import StoryModeGame from '@/components/games/StoryMode';
import PuzzleChallenge from '@/components/games/PuzzleChallenge';
import FlashcardDuel from '@/components/games/FlashcardDuelGame';
import ConceptMatch from '@/components/games/ConceptMatchGame';
import QuickQuiz from '@/components/games/QuickQuizGame';
import { Loader2 } from 'lucide-react';
import { JSX, useEffect, useState } from 'react';

export default function GameTypePage() {
  const { gameType } = useParams<{ gameType: string }>();
  const [component, setComponent] = useState<JSX.Element | null>(null);

  useEffect(() => {
    switch (gameType) {
      case 'story-mode':
        setComponent(<StoryModeGame />);
        break;
      case 'puzzle-challenge':
        setComponent(<PuzzleChallenge />);
        break;
      case 'flashcard-duel':
        setComponent(<FlashcardDuel />);
        break;
      case 'concept-match':
        setComponent(<ConceptMatch />);
        break;
      case 'quick-quiz':
        setComponent(<QuickQuiz />);
        break;
      default:
        setComponent(
          <div className="text-center text-red-500 mt-20 text-lg font-semibold">
            ❌ Unknown game type: <code>{gameType}</code>
          </div>
        );
    }
  }, [gameType]);

  return (
    <div>
      {component ? (
        component
      ) : (
        <div className="flex justify-center items-center h-[80vh] text-blue-600 dark:text-pink-400">
          <Loader2 className="animate-spin mr-2" />
          Loading game...
        </div>
      )}
    </div>
  );
}
