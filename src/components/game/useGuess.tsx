import { useCallback } from 'react';

import { TypeEffectiveness } from '@/api/schema';

export type Guess = TypeEffectiveness | number | boolean;

export const useGuess = (correctAnswer: Guess) => {
  const makeGuess = useCallback((guess: Guess) => guess === correctAnswer, [correctAnswer]);

  return { makeGuess };
};
