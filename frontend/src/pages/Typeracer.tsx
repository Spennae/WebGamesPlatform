import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { StatCard, StatsGrid, Leaderboard } from '../components';

type GamePhase = 'waiting' | 'playing' | 'finished';
type EngineStatus = 'checking' | 'healthy' | 'unhealthy' | 'unknown';

interface LeaderboardEntry {
  id: number;
  username: string;
  value: number;
}

export function Typeracer() {
  const { user, isGuest } = useAuth();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<GamePhase>('waiting');
  const [text, setText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errors, setErrors] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [finalWpm, setFinalWpm] = useState(0);
  const [finalAccuracy, setFinalAccuracy] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [gameKey, setGameKey] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [liveWpm, setLiveWpm] = useState(0);
  const [engineStatus, setEngineStatus] = useState<EngineStatus>('checking');

  const wsUrl = `ws://localhost:5000/api/engine/typeracer`;
  const wsEnabled = phase !== 'finished';
  const { status, lastMessage, sendMessage } = useWebSocket(`${wsUrl}?key=${gameKey}`, wsEnabled);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number>(0);
  const textRef = useRef('');
  const currentIndexRef = useRef(0);
  const errorsRef = useRef(0);

  useEffect(() => { textRef.current = text; }, [text]);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { errorsRef.current = errors; }, [errors]);

  const finishGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    sendMessage({ type: 'finish', progress: currentIndexRef.current, errors: errorsRef.current });
  };

  const submitScore = async (wpm: number, accuracy: number) => {
    if (isGuest) return;
    
    try {
      await api.post('/api/scores', {
        gameSlug: 'typeracer',
        value: Math.round(wpm * 100),
        metadata: { wpm, accuracy }
      });
    } catch (e) {
      console.error('Failed to submit score:', e);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await api.get<LeaderboardEntry[]>('/api/scores/typeracer?limit=10');
      setLeaderboard(response.data);
    } catch (e) {
      console.error('Failed to fetch leaderboard:', e);
    }
  };

  useEffect(() => {
    const savedScore = sessionStorage.getItem('pendingScore');
    if (savedScore && !isGuest) {
      const { wpm, accuracy } = JSON.parse(savedScore);
      setFinalWpm(wpm);
      setFinalAccuracy(accuracy);
      setPhase('finished');
      sessionStorage.removeItem('pendingScore');
      
      (async () => {
        await submitScore(wpm, accuracy);
        fetchLeaderboard();
      })();
    }
  }, [isGuest]);

  useEffect(() => {
    const checkEngineHealth = async () => {
      try {
        const response = await fetch('http://localhost:5000/health/engines');
        if (response.ok) {
          const data = await response.json();
          setEngineStatus(data.status === 'healthy' ? 'healthy' : 'unhealthy');
        } else {
          setEngineStatus('unhealthy');
        }
      } catch {
        setEngineStatus('unknown');
      }
    };

    checkEngineHealth();
    const interval = setInterval(checkEngineHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (phase === 'waiting' && lastMessage?.type === 'gameStart' && lastMessage.text) {
      setText(lastMessage.text);
      setPhase('playing');
      setCurrentIndex(0);
      setErrors(0);
      setUserInput('');
      setStartTime(Date.now());
      setTimeLeft(60);
      setLiveWpm(0);
      inputRef.current?.focus();
    }

    if (phase === 'playing' && lastMessage?.type === 'gameEnd') {
      const wpm = lastMessage.wpm ?? 0;
      const accuracy = lastMessage.accuracy ?? 0;
      setFinalWpm(wpm);
      setFinalAccuracy(accuracy);
      setPhase('finished');
      if (timerRef.current) clearInterval(timerRef.current);
      
      if (isGuest) {
        sessionStorage.setItem('pendingScore', JSON.stringify({ wpm, accuracy }));
      }
      
      submitScore(wpm, accuracy);
      fetchLeaderboard();
    }
  }, [lastMessage, phase]);

  useEffect(() => {
    if (phase !== 'playing' || !startTime) return;

    timerRef.current = window.setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const remaining = Math.max(0, 60 - elapsed);
      setTimeLeft(Math.floor(remaining));

      const wpm = elapsed > 0 ? Math.round((currentIndexRef.current / 5) / (elapsed / 60)) : 0;
      setLiveWpm(wpm);

      if (remaining <= 0) {
        finishGame();
      }
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, startTime]);

  const handleLoginToSave = () => {
    navigate(`/login?returnUrl=${encodeURIComponent('/play/typeracer')}`);
  };

  const startNewRace = () => {
    setGameKey(k => k + 1);
    setPhase('waiting');
    setText('');
    setCurrentIndex(0);
    setErrors(0);
    setUserInput('');
    setFinalWpm(0);
    setFinalAccuracy(0);
    setTimeLeft(60);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (phase !== 'playing') return;

    const value = e.target.value;
    const charIndex = value.length - 1;

    if (charIndex >= 0 && charIndex < textRef.current.length) {
      const isCorrect = value[charIndex] === textRef.current[charIndex];
      const prevCorrect = charIndex > 0 ? value[charIndex - 1] === textRef.current[charIndex - 1] : true;

      if (!isCorrect && prevCorrect) {
        setErrors(prev => prev + 1);
      }

      setCurrentIndex(value.length);
      setUserInput(value);

      sendMessage({ type: 'typing', progress: value.length, errors: errorsRef.current });

      if (value.length >= textRef.current.length) {
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

  const renderText = () => {
    return text.split('').map((char, index) => {
      let style: React.CSSProperties = { color: 'var(--text-muted)' };

      if (index < currentIndex) {
        const isCorrect = userInput[index] === char;
        style = isCorrect ? { color: 'var(--accent-green)' } : { color: 'var(--accent-red)' };
      } else if (index === currentIndex) {
        style = { color: 'var(--text-primary)', backgroundColor: 'rgba(137, 180, 250, 0.2)' };
      }

      return (
        <span key={index} style={style}>
          {char}
        </span>
      );
    });
  };

  const leaderboardEntries = leaderboard.map((entry, index) => ({
    rank: index + 1,
    username: entry.username,
    value: entry.value,
  }));

  if (phase === 'finished') {
    return (
      <div className="rules-card">
        <div className="results-card">
          <div className="results-title">
            Race Complete
            <div className="results-subtitle">Your performance</div>
          </div>

          <StatsGrid>
            <StatCard value={finalWpm} label="Speed" unit="WPM" color="var(--accent-green)" />
            <StatCard value={`${finalAccuracy}%`} label="Accuracy" unit="correct" color="var(--accent-blue)" />
          </StatsGrid>

          {isGuest && (
            <div className="guest-prompt">
              <div className="guest-prompt-text">
                Login to save your score to the leaderboard
              </div>
              <button
                onClick={handleLoginToSave}
                className="btn-primary-solid"
                style={{ background: 'var(--accent-green)', color: 'var(--bg-primary)' }}
              >
                Login to Save Your Score
              </button>
            </div>
          )}

          <div className="results-actions results-actions-with-margin">
            <button onClick={startNewRace} className="btn btn-primary">
              Race Again
            </button>
          </div>
        </div>

        <div className="results-card">
          <div className="results-title results-title-left">Leaderboard</div>
          <Leaderboard entries={leaderboardEntries} />
        </div>
      </div>
    );
  }

  if (engineStatus === 'unhealthy' || engineStatus === 'unknown') {
    return (
      <div className="rules-card">
        <div className="results-card results-card-centered">
          <div className="results-title">Engine Unavailable</div>
          <div className="text-text-secondary text-with-margin-top">
            The TypeRacer engine is currently unavailable. Please try again in a few moments.
          </div>
          <button onClick={() => window.location.reload()} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (status === 'connecting' || status === 'disconnected') {
    return (
      <div className="rules-card">
        <div className="centered-container">
          <div className="loading-spinner"></div>
          <div className="text-text-secondary text-sm">Connecting to game server...</div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="rules-card">
        <div className="centered-container">
          <div className="error-message">Failed to connect to game server</div>
          <button onClick={() => window.location.reload()} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rules-card">
      <div className="game-header">
        <span style={{ 
          padding: '6px 12px', 
          borderRadius: '9999px', 
          background: isGuest ? 'rgba(249,226,175,0.15)' : 'rgba(137,180,250,0.15)', 
          color: isGuest ? 'var(--accent-yellow)' : 'var(--accent-blue)', 
          fontSize: '12px' 
        }}>
          {isGuest ? 'Guest' : user?.username}
        </span>
        <div className="game-stats">
          <span>Errors: <span style={{ fontWeight: 600, color: 'var(--accent-red)' }}>{errors}</span></span>
          <span>{liveWpm} WPM</span>
          <span style={{ color: timeLeft <= 10 ? 'var(--accent-red)' : 'var(--text-primary)' }}>
            {timeLeft}s
          </span>
        </div>
      </div>

      <div className="game-text-container">
        <div
          className="game-text"
          onClick={() => inputRef.current?.focus()}
        >
          {text ? renderText() : (
            <span style={{ color: 'var(--text-secondary)' }}>Waiting for text...</span>
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          className="input text-with-margin-top"
          placeholder={phase === 'playing' ? 'Start typing...' : 'Game starting...'}
          disabled={phase !== 'playing'}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
      </div>

      <div className="game-footer">
        {currentIndex} / {text.length}
      </div>
    </div>
  );
}
