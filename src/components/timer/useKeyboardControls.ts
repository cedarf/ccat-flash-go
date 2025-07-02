
import { useEffect } from 'react';

export const useKeyboardControls = (handleNextQuestion: () => void, handleQuit: () => void) => {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'q') {
        handleQuit();
      } else if (event.key === ' ') {
        event.preventDefault();
        handleNextQuestion();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleNextQuestion, handleQuit]);
};
