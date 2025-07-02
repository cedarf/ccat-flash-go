
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
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Auto-start when component mounts
  useEffect(() => {
    setIsRunning(true);
  }, []);

  // Keyboard event listener for 'q' key
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'q') {
        handleQuit();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Timer logic
  useEffect(() => {
    if (isRunning && !isFinished && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Time's up for this question
            handleNextQuestion();
            return timePerQuestion;
          }
          return prev - 1;
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
  }, [isRunning, isFinished, timeLeft, timePerQuestion]);

  // Create audio context for beep sound
  useEffect(() => {
    // Create a simple beep sound using Web Audio API
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

  const handleNextQuestion = () => {
    if (currentQuestion >= totalQuestions) {
      setIsFinished(true);
      setIsRunning(false);
      return;
    }

    // Show green flash and play sound
    setShowFlash(true);
    if (audioRef.current) {
      try {
        audioRef.current.play();
      } catch (error) {
        console.log('Audio play failed:', error);
      }
    }

    setTimeout(() => {
      setShowFlash(false);
      setCurrentQuestion(prev => prev + 1);
      setTimeLeft(timePerQuestion);
    }, 500);
  };

  const handleQuit = () => {
    setIsRunning(false);
    setIsFinished(true);
  };

  const handleRestart = () => {
    setCurrentQuestion(1);
    setTimeLeft(timePerQuestion);
    setIsFinished(false);
    setIsRunning(true);
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
            <div className={`text-8xl font-mono font-bold transition-colors duration-200 ${
              timeLeft <= 5 ? 'text-red-500' : 'text-slate-800'
            }`}>
              {timeLeft}
            </div>
            <div className="text-sm text-slate-500 mt-2">seconds remaining</div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${(timeLeft / timePerQuestion) * 100}%` }}
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
            Press 'Q' to quit • Timer auto-advances after {timePerQuestion} seconds
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
