
import React from 'react';

interface TimerDisplayProps {
  timeLeft: number;
  timePerQuestion: number;
  isOvertime: boolean;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({ 
  timeLeft, 
  timePerQuestion, 
  isOvertime 
}) => {
  const formatTime = (seconds: number) => {
    if (seconds >= 0) {
      return seconds.toString();
    } else {
      return `+${Math.abs(seconds)}`;
    }
  };

  const getTimerColor = () => {
    if (timeLeft < 0) {
      return isOvertime && Math.floor(Date.now() / 1000) % 2 === 0 ? 'text-red-500' : 'text-red-600';
    } else if (timeLeft <= 5) {
      return 'text-red-500';
    }
    return 'text-slate-800';
  };

  return (
    <>
      {/* Timer Display */}
      <div className="relative">
        <div className={`text-8xl font-mono font-bold transition-colors duration-200 ${getTimerColor()}`}>
          {formatTime(timeLeft)}
        </div>
        <div className="text-sm text-slate-500 mt-2">
          {timeLeft >= 0 ? 'seconds remaining' : 'seconds over'}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-1000 ease-linear ${
            timeLeft < 0 ? 'bg-red-500' : 'bg-blue-500'
          }`}
          style={{ 
            width: timeLeft < 0 ? '100%' : `${Math.max(0, (timeLeft / timePerQuestion) * 100)}%` 
          }}
        />
      </div>
    </>
  );
};
