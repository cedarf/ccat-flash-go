
import React from 'react';
import { Button } from '@/components/ui/button';
import { Timer, Square } from 'lucide-react';

interface TimerControlsProps {
  onNextQuestion: () => void;
  onQuit: () => void;
  isRunning: boolean;
  timeLeft: number;
  timePerQuestion: number;
}

export const TimerControls: React.FC<TimerControlsProps> = ({ 
  onNextQuestion, 
  onQuit, 
  isRunning 
}) => {
  return (
    <div className="flex gap-4 justify-center pt-4">
      <Button
        onClick={onNextQuestion}
        disabled={!isRunning}
        className="flex-1"
      >
        <Timer className="w-4 h-4 mr-2" />
        Next Question
      </Button>
      <Button
        onClick={onQuit}
        variant="destructive"
        className="flex-1"
      >
        <Square className="w-4 h-4 mr-2" />
        Quit (Q)
      </Button>
    </div>
  );
};
