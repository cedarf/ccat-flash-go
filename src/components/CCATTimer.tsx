
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Timer, Settings, Square } from 'lucide-react';

interface CCATTimerProps {
  totalQuestions?: number;
  defaultTimePerQuestion?: number;
}

const CCATTimer: React.FC<CCATTimerProps> = ({ 
  totalQuestions = 50, 
  defaultTimePerQuestion = 18 
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [timeLeft, setTimeLeft] = useState(defaultTimePerQuestion);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [timePerQuestion, setTimePerQuestion] = useState(defaultTimePerQuestion);
  const [showSettings, setShowSettings] = useState(false);
  const [totalTimeRemaining, setTotalTimeRemaining] = useState(defaultTimePerQuestion * totalQuestions);
  const [isOvertime, setIsOvertime] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Auto-start when component mounts
  useEffect(() => {
    setIsRunning(true);
    startTimeRef.current = Date.now();
  }, []);

  // Keyboard event listeners for 'q' and spacebar
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
  }, []);

  // Timer logic - now continues past zero
  useEffect(() => {
    if (isRunning && !isFinished) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1;
          if (newTime <= 0 && !isOvertime) {
            setIsOvertime(true);
          }
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isFinished, isOvertime]);

  // Create audio context for beep sound
  useEffect(() => {
    const createBeep = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    };

    audioRef.current = { play: createBeep } as any;
  }, []);

  const redistributeTime = (questionsRemaining: number) => {
    const elapsedTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const originalTotalTime = defaultTimePerQuestion * totalQuestions;
    const remainingTime = Math.max(0, originalTotalTime - elapsedTime);
    
    setTotalTimeRemaining(remainingTime);
    
    if (questionsRemaining > 0) {
      const newTimePerQuestion = Math.max(5, Math.floor(remainingTime / questionsRemaining));
      setTimePerQuestion(newTimePerQuestion);
      return newTimePerQuestion;
    }
    return timePerQuestion;
  };

  const handleNextQuestion = () => {
    if (currentQuestion >= totalQuestions) {
      setIsFinished(true);
      setIsRunning(false);
      return;
    }

    // Show green flash and play sound
    setShowFlash(true);
    setIsOvertime(false);
    
    if (audioRef.current) {
      try {
        audioRef.current.play();
      } catch (error) {
        console.log('Audio play failed:', error);
      }
    }

    setTimeout(() => {
      setShowFlash(false);
      const newQuestionNumber = currentQuestion + 1;
      setCurrentQuestion(newQuestionNumber);
      
      // Redistribute time among remaining questions
      const questionsRemaining = totalQuestions - newQuestionNumber + 1;
      const newTimePerQuestion = redistributeTime(questionsRemaining);
      setTimeLeft(newTimePerQuestion);
    }, 500);
  };

  const handleQuit = () => {
    setIsRunning(false);
    setIsFinished(true);
  };

  const handleRestart = () => {
    setCurrentQuestion(1);
    setTimePerQuestion(defaultTimePerQuestion);
    setTimeLeft(defaultTimePerQuestion);
    setTotalTimeRemaining(defaultTimePerQuestion * totalQuestions);
    setIsFinished(false);
    setIsOvertime(false);
    setIsRunning(true);
    startTimeRef.current = Date.now();
  };

  const handleSettingsToggle = () => {
    setShowSettings(!showSettings);
    if (isRunning) {
      setIsRunning(false);
    }
  };

  const handleSettingsSave = (newTime: number, newTotal: number) => {
    setTimePerQuestion(newTime);
    setTimeLeft(newTime);
    setTotalTimeRemaining(newTime * newTotal);
    setShowSettings(false);
  };

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

  const formatTotalTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
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
          onSave={handleSettingsSave}
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

          {/* Timer Display */}
          <div className="relative">
            <div className={`text-8xl font-mono font-bold transition-colors duration-200 ${getTimerColor()}`}>
              {formatTime(timeLeft)}
            </div>
            <div className="text-sm text-slate-500 mt-2">
              {timeLeft >= 0 ? 'seconds remaining' : 'seconds over'}
            </div>
          </div>

          {/* Time Stats */}
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

          {/* Controls */}
          <div className="flex gap-4 justify-center pt-4">
            <Button
              onClick={handleNextQuestion}
              disabled={!isRunning}
              className="flex-1"
            >
              <Timer className="w-4 h-4 mr-2" />
              Next Question
            </Button>
            <Button
              onClick={handleQuit}
              variant="destructive"
              className="flex-1"
            >
              <Square className="w-4 h-4 mr-2" />
              Quit (Q)
            </Button>
          </div>

          {/* Instructions */}
          <div className="text-sm text-slate-500 pt-4 border-t">
            Press 'Q' to quit • Spacebar for next question • Timer continues past zero
          </div>
        </div>
      </Card>
    </div>
  );
};

// Settings Modal Component
interface SettingsModalProps {
  currentTime: number;
  currentTotal: number;
  onSave: (time: number, total: number) => void;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  currentTime, 
  currentTotal, 
  onSave, 
  onClose 
}) => {
  const [timePerQuestion, setTimePerQuestion] = useState(currentTime);
  const [totalQuestions, setTotalQuestions] = useState(currentTotal);

  const handleSave = () => {
    onSave(timePerQuestion, totalQuestions);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="p-6 max-w-sm mx-4">
        <h3 className="text-lg font-semibold mb-4">Timer Settings</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Seconds per question
            </label>
            <input
              type="number"
              value={timePerQuestion}
              onChange={(e) => setTimePerQuestion(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
              min="5"
              max="300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Total questions
            </label>
            <input
              type="number"
              value={totalQuestions}
              onChange={(e) => setTotalQuestions(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
              min="1"
              max="200"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1">
              Save
            </Button>
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CCATTimer;
