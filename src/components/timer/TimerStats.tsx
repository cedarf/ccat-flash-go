
import React from 'react';

interface TimerStatsProps {
  timePerQuestion: number;
  totalTimeRemaining: number;
}

export const TimerStats: React.FC<TimerStatsProps> = ({ 
  timePerQuestion, 
  totalTimeRemaining 
}) => {
  const formatTotalTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-50 p-4 rounded-lg space-y-2">
      <div className="text-sm text-slate-600">
        <div className="flex justify-between">
          <span>Time per question:</span>
          <span className="font-mono">{timePerQuestion}s</span>
        </div>
        <div className="flex justify-between">
          <span>Total time remaining:</span>
          <span className="font-mono">{formatTotalTime(totalTimeRemaining)}</span>
        </div>
      </div>
    </div>
  );
};
