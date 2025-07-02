
import { useRef, useEffect } from 'react';

export const useAudioBeep = () => {
  const audioRef = useRef<any>(null);

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

    audioRef.current = { play: createBeep };
  }, []);

  const playBeep = () => {
    if (audioRef.current) {
      try {
        audioRef.current.play();
      } catch (error) {
        console.log('Audio play failed:', error);
      }
    }
  };

  return { playBeep };
};
