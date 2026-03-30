import { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

type GamePhase = 'waiting' | 'playing' | 'finished';
type EngineStatus = 'checking' | 'healthy' | 'unhealthy' | 'unknown';

interface LeaderboardEntry {
  id: number;
  username: string;
  value: number;
}

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

  const finishGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    sendMessage({ type: 'finish', progress: currentIndexRef.current, errors: errorsRef.current });
  };

  const submitScore = async (wpm: number, accuracy: number) => {
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
      let style: React.CSSProperties = { color: '#6c7086' };

      if (index < currentIndex) {
        const isCorrect = userInput[index] === char;
        style = isCorrect ? { color: '#a6e3a1' } : { color: '#f38ba8' };
      } else if (index === currentIndex) {
        style = { color: '#cdd6f4', backgroundColor: 'rgba(137, 180, 250, 0.2)' };
      }

      return (
        <span key={index} style={style}>
          {char}
        </span>
      );
    });
  };

  if (phase === 'finished') {
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '40px 16px' }}>
        <div style={{ background: '#2b2c3f', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '20px', fontWeight: 600 }}>Race Complete</div>
            <div style={{ fontSize: '14px', color: '#a6adc8', marginTop: '8px' }}>Your performance</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: '#313244', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', color: '#a6adc8' }}>Speed</div>
              <div style={{ fontSize: '28px', fontWeight: 600, color: '#a6e3a1' }}>{finalWpm}</div>
              <div style={{ fontSize: '14px', color: '#a6adc8' }}>WPM</div>
            </div>
            <div style={{ background: '#313244', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', color: '#a6adc8' }}>Accuracy</div>
              <div style={{ fontSize: '28px', fontWeight: 600, color: '#89b4fa' }}>{finalAccuracy}%</div>
              <div style={{ fontSize: '14px', color: '#a6adc8' }}>correct</div>
            </div>
          </div>

          <button
            onClick={startNewRace}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              background: 'rgba(137,180,250,0.15)',
              color: '#89b4fa',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Race Again
          </button>
        </div>

        <div style={{ background: '#2b2c3f', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>Leaderboard</div>

          {leaderboard.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    borderRadius: '12px',
                    background: index % 2 === 0 ? '#2b2c3f' : '#313244'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      background: index === 0 ? 'rgba(249,226,175,0.25)' : 
                                  index === 1 ? 'rgba(203,166,247,0.25)' :
                                  index === 2 ? 'rgba(166,227,161,0.25)' : '#45475a',
                      color: index === 0 ? '#f9e2af' :
                             index === 1 ? '#cba6f7' :
                             index === 2 ? '#a6e3a1' : '#a6adc8'
                    }}>
                      {index + 1}
                    </div>
                    <span>{entry.username}</span>
                  </div>
                  <span style={{ fontWeight: 600, color: '#a6e3a1' }}>{(entry.value / 100).toFixed(2)} WPM</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: '14px', color: '#a6adc8' }}>No scores yet</div>
          )}
        </div>
      </div>
    );
  }

  if (engineStatus === 'unhealthy' || engineStatus === 'unknown') {
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '40px 16px' }}>
        <div style={{ background: '#2b2c3f', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>Engine Unavailable</div>
          <div style={{ color: '#a6adc8', marginBottom: '16px' }}>
            The TypeRacer engine is currently unavailable. Please try again in a few moments.
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              background: 'rgba(137,180,250,0.15)',
              color: '#89b4fa',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (status === 'connecting' || status === 'disconnected') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
        <div style={{ width: '24px', height: '24px', border: '2px solid #45475a', borderTopColor: '#89b4fa', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '16px' }}></div>
        <div style={{ fontSize: '14px', color: '#a6adc8' }}>Connecting to game server...</div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
        <div style={{ color: '#f38ba8', marginBottom: '16px', fontSize: '14px' }}>Failed to connect to game server</div>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            background: 'rgba(137,180,250,0.15)',
            color: '#89b4fa',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '40px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <span style={{ padding: '6px 12px', borderRadius: '9999px', background: 'rgba(137,180,250,0.15)', color: '#89b4fa', fontSize: '12px' }}>
          {user?.username}
        </span>
        <div style={{ fontSize: '12px', color: '#a6adc8' }}>
          Errors: <span style={{ fontWeight: 600, color: '#f38ba8' }}>{errors}</span>
          <span style={{ marginLeft: '16px', fontFamily: 'monospace', fontWeight: 600 }}>{liveWpm} WPM</span>
          <span style={{ marginLeft: '16px', fontFamily: 'monospace', fontWeight: 600, color: timeLeft <= 10 ? '#f38ba8' : '#cdd6f4' }}>
            {timeLeft}s
          </span>
        </div>
      </div>

      <div style={{ background: '#2b2c3f', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
        <div
          style={{ fontFamily: 'monospace', fontSize: '16px', lineHeight: '28px', padding: '16px', background: '#313244', borderRadius: '12px', cursor: 'text' }}
          onClick={() => inputRef.current?.focus()}
        >
          {text ? renderText() : (
            <span style={{ color: '#a6adc8' }}>Waiting for text...</span>
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%',
            marginTop: '16px',
            padding: '12px 16px',
            background: '#181825',
            border: 'none',
            borderRadius: '12px',
            color: '#cdd6f4',
            fontSize: '16px',
            outline: 'none'
          }}
          placeholder={phase === 'playing' ? 'Start typing...' : 'Game starting...'}
          disabled={phase !== 'playing'}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
      </div>

      <div style={{ textAlign: 'center', fontSize: '12px', color: '#a6adc8' }}>
        {currentIndex} / {text.length}
      </div>
    </div>
  );
}
