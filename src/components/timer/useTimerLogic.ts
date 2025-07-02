
import { useState, useEffect, useRef } from 'react';
import { useAudioBeep } from './useAudioBeep';

export const useTimerLogic = (totalQuestions: number, defaultTimePerQuestion: number) => {
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [timeLeft, setTimeLeft] = useState(defaultTimePerQuestion);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [timePerQuestion, setTimePerQuestion] = useState(defaultTimePerQuestion);
  const [totalTimeRemaining, setTotalTimeRemaining] = useState(defaultTimePerQuestion * totalQuestions);
  const [isOvertime, setIsOvertime] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const questionStartTimeRef = useRef<number>(Date.now());
  const { playBeep } = useAudioBeep();

  // Auto-start when component mounts
  useEffect(() => {
    setIsRunning(true);
    startTimeRef.current = Date.now();
    questionStartTimeRef.current = Date.now();
  }, []);

  // Timer logic - continues past zero and updates total time
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
        
        // Update total time remaining
        setTotalTimeRemaining(prev => Math.max(0, prev - 1));
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

  const redistributeTime = (newQuestionNumber: number) => {
    const currentTime = Date.now();
    const elapsedTime = Math.floor((currentTime - startTimeRef.current) / 1000);
    const originalTotalTime = defaultTimePerQuestion * totalQuestions;
    const remainingTime = Math.max(0, originalTotalTime - elapsedTime);
    
    setTotalTimeRemaining(remainingTime);
    
    const questionsRemaining = totalQuestions - newQuestionNumber + 1;
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
    playBeep();

    setTimeout(() => {
      setShowFlash(false);
      const newQuestionNumber = currentQuestion + 1;
      setCurrentQuestion(newQuestionNumber);
      
      // Redistribute time among remaining questions
      const newTimePerQuestion = redistributeTime(newQuestionNumber);
      setTimeLeft(newTimePerQuestion);
      questionStartTimeRef.current = Date.now();
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
    questionStartTimeRef.current = Date.now();
  };

  const handleSettingsSave = (newTime: number, newTotal: number) => {
    setTimePerQuestion(newTime);
    setTimeLeft(newTime);
    setTotalTimeRemaining(newTime * newTotal);
  };

  return {
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
  };
};
