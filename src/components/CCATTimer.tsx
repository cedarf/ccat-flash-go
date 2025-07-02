
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Timer, Settings, Square } from 'lucide-react';
import { TimerDisplay } from './timer/TimerDisplay';
import { TimerStats } from './timer/TimerStats';
import { TimerControls } from './timer/TimerControls';
import { SettingsModal } from './timer/SettingsModal';
import { useTimerLogic } from './timer/useTimerLogic';
import { useKeyboardControls } from './timer/useKeyboardControls';

interface CCATTimerProps {
  totalQuestions?: number;
  defaultTimePerQuestion?: number;
}

const CCATTimer: React.FC<CCATTimerProps> = ({ 
  totalQuestions = 50, 
  defaultTimePerQuestion = 18 
}) => {
  const [showSettings, setShowSettings] = useState(false);
  
  const {
    currentQuestion,
    timeLeft,
    isRunning,
    isFinished,
    showFlash,
    timePerQuestion,
    totalTimeRemaining,
    isOvertime,
    handleNextQuestion,
    handleQuit,
    handleRestart,
    handleSettingsSave
  } = useTimerLogic(totalQuestions, defaultTimePerQuestion);

  useKeyboardControls(handleNextQuestion, handleQuit);

  const handleSettingsToggle = () => {
    setShowSettings(!showSettings);
  };

  const onSettingsSave = (newTime: number, newTotal: number) => {
    handleSettingsSave(newTime, newTotal);
    setShowSettings(false);
  };

  if (isFinished) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Card className="p-12 text-center max-w-md mx-4 shadow-lg">
          <div className="text-6xl font-bold text-green-600 mb-6">Done!</div>
          <p className="text-xl text-slate-600 mb-8">
            You completed {currentQuestion - 1} questions
          </p>
          <Button onClick={handleRestart} size="lg" className="w-full">
            Start New Session
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center transition-all duration-500 ${
      showFlash 
        ? 'bg-green-400' 
        : 'bg-gradient-to-br from-slate-50 to-slate-100'
    }`}>
      {showSettings && (
        <SettingsModal 
          currentTime={timePerQuestion}
          currentTotal={totalQuestions}
          onSave={onSettingsSave}
          onClose={() => setShowSettings(false)}
        />
      )}
      
      <Card className="p-8 max-w-lg mx-4 shadow-lg">
        <div className="text-center space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-800">CCAT Practice Timer</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSettingsToggle}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>

          {/* Question Progress */}
          <div className="text-lg font-semibold text-slate-600">
            Question {currentQuestion} / {totalQuestions}
          </div>

          <TimerDisplay 
            timeLeft={timeLeft}
            timePerQuestion={timePerQuestion}
            isOvertime={isOvertime}
          />

          <TimerStats 
            timePerQuestion={timePerQuestion}
            totalTimeRemaining={totalTimeRemaining}
          />

          <TimerControls 
            onNextQuestion={handleNextQuestion}
            onQuit={handleQuit}
            isRunning={isRunning}
            timeLeft={timeLeft}
            timePerQuestion={timePerQuestion}
          />

          {/* Instructions */}
          <div className="text-sm text-slate-500 pt-4 border-t">
            Press 'Q' to quit • Spacebar for next question • Timer continues past zero
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CCATTimer;
