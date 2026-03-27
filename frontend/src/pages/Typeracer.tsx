import { useState, useEffect, useRef, useCallback } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

type GamePhase = 'waiting' | 'playing' | 'finished';

export function Typeracer() {
  const { user } = useAuth();
  const [phase, setPhase] = useState<GamePhase>('waiting');
  const [text, setText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errors, setErrors] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [finalWpm, setFinalWpm] = useState(0);
  const [finalAccuracy, setFinalAccuracy] = useState(0);
  const [userInput, setUserInput] = useState('');

  const wsUrl = `ws://${new URL(API_URL).host}/api/engine/typeracer`;
  const { status, lastMessage, sendMessage } = useWebSocket(wsUrl);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number>(0);

  useEffect(() => {
    if (lastMessage?.type === 'gameStart' && lastMessage.text) {
      setText(lastMessage.text);
      setPhase('playing');
      setCurrentIndex(0);
      setErrors(0);
      setUserInput('');
      setStartTime(Date.now());
      setTimeLeft(60);
      inputRef.current?.focus();
    }

    if (lastMessage?.type === 'gameEnd') {
      if (lastMessage.wpm !== undefined) setFinalWpm(lastMessage.wpm);
      if (lastMessage.accuracy !== undefined) setFinalAccuracy(lastMessage.accuracy);
      setPhase('finished');
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [lastMessage]);

  useEffect(() => {
    if (phase === 'playing' && startTime) {
      timerRef.current = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = Math.max(0, 60 - elapsed);
        setTimeLeft(remaining);

        if (remaining === 0) {
          finishGame();
        }
      }, 100);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, startTime]);

  const finishGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    sendMessage({ type: 'finish', progress: currentIndex, errors });
    setPhase('finished');

    const elapsed = startTime ? (Date.now() - startTime) / 1000 : 60;
    const minutes = elapsed / 60;
    const wpm = Math.round((currentIndex / 5) / minutes * 100) / 100;
    const accuracy = currentIndex + errors > 0 
      ? Math.round((currentIndex / (currentIndex + errors)) * 10000) / 100 
      : 100;

    setFinalWpm(wpm);
    setFinalAccuracy(accuracy);

    submitScore(wpm, accuracy);
  }, [currentIndex, errors, startTime, sendMessage]);

  const submitScore = async (wpm: number, accuracy: number) => {
    try {
      await api.post('/api/scores', {
        gameSlug: 'typeracer',
        score: Math.round(wpm * 100),
        metadata: { wpm, accuracy }
      });
    } catch (e) {
      console.error('Failed to submit score:', e);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (phase !== 'playing') return;

    const value = e.target.value;
    const charIndex = value.length - 1;

    if (charIndex >= 0 && charIndex < text.length) {
      const isCorrect = value[charIndex] === text[charIndex];
      const prevCorrect = charIndex > 0 ? value[charIndex - 1] === text[charIndex - 1] : true;

      if (!isCorrect && prevCorrect) {
        setErrors(prev => prev + 1);
      }

      setCurrentIndex(value.length);
      setUserInput(value);

      sendMessage({ type: 'typing', progress: value.length, errors });

      if (value.length >= text.length) {
        finishGame();
      }
    } else {
      setUserInput(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
    }
  };

  const startNewGame = () => {
    setPhase('waiting');
    setText('');
    setCurrentIndex(0);
    setErrors(0);
    setUserInput('');
    setFinalWpm(0);
    setFinalAccuracy(0);
  };

  const renderText = () => {
    return text.split('').map((char, index) => {
      let className = 'text-text-secondary';

      if (index < currentIndex) {
        className = userInput[index] === char 
          ? 'text-accent-green' 
          : 'text-accent-red bg-accent-red/20';
      } else if (index === currentIndex) {
        className = 'text-text-primary bg-accent-blue/30';
      }

      return (
        <span key={index} className={className}>
          {char}
        </span>
      );
    });
  };

  if (status === 'connecting' || status === 'disconnected') {
    return (
      <div className="text-center py-12">
        <div className="spinner mb-4"></div>
        <p className="text-text-secondary">Connecting to game server...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="text-center py-12">
        <p className="text-accent-red mb-4">Failed to connect to game server</p>
        <button onClick={startNewGame} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  if (phase === 'finished') {
    return (
      <div className="card text-center">
        <h2 className="text-2xl font-bold text-text-primary mb-6">Race Complete!</h2>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="p-4 bg-crust rounded-lg">
            <p className="text-sm text-text-secondary mb-1">Speed</p>
            <p className="text-4xl font-bold text-accent-green">{finalWpm}</p>
            <p className="text-sm text-text-secondary">WPM</p>
          </div>
          <div className="p-4 bg-crust rounded-lg">
            <p className="text-sm text-text-secondary mb-1">Accuracy</p>
            <p className="text-4xl font-bold text-accent-blue">{finalAccuracy}%</p>
            <p className="text-sm text-text-secondary">correct</p>
          </div>
        </div>

        <button onClick={startNewGame} className="btn btn-primary">
          Race Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="tag tag-blue">{user?.username}</span>
          <span className="tag tag-purple">WPM: {currentIndex > 0 ? Math.round((currentIndex / 5) / ((Date.now() - (startTime || Date.now())) / 60000 || 0.01)) : 0}</span>
        </div>
        <div className={`text-2xl font-mono font-bold ${timeLeft <= 10 ? 'text-accent-red' : 'text-text-primary'}`}>
          {timeLeft}s
        </div>
      </div>

      <div className="card">
        <div 
          className="font-mono text-xl leading-relaxed p-6 bg-crust rounded-lg cursor-text"
          onClick={() => inputRef.current?.focus()}
        >
          {text ? renderText() : (
            <span className="text-text-secondary animate-pulse">Waiting for text...</span>
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          className="input mt-4"
          placeholder={phase === 'playing' ? 'Start typing...' : 'Game starting...'}
          disabled={phase !== 'playing'}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
      </div>

      <div className="flex justify-between text-sm text-text-secondary">
        <span>Progress: {currentIndex}/{text.length}</span>
        <span>Errors: {errors}</span>
      </div>
    </div>
  );
}
