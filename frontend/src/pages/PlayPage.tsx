import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { Typeracer } from './Typeracer';

type GamePhase = 'rules' | 'playing';

function TypeRacerRules({ onPlay }: { onPlay: () => void }) {
  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '40px 16px' }}>
      <div style={{ background: '#2b2c3f', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px' }}>TypeRacer</div>
        <div style={{ fontSize: '14px', color: '#a6adc8', marginBottom: '24px' }}>Race against the clock</div>
        
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#cdd6f4' }}>How to Play</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(166,227,161,0.2)', color: '#a6e3a1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, flexShrink: 0 }}>1</div>
              <div style={{ fontSize: '14px', color: '#a6adc8', lineHeight: '20px' }}>
                Type the text shown as <span style={{ color: '#cdd6f4' }}>quickly</span> and <span style={{ color: '#cdd6f4' }}>accurately</span> as you can
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(166,227,161,0.2)', color: '#a6e3a1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, flexShrink: 0 }}>2</div>
              <div style={{ fontSize: '14px', color: '#a6adc8', lineHeight: '20px' }}>
                You have <span style={{ color: '#f38ba8', fontWeight: 600 }}>60 seconds</span> to complete the race
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(166,227,161,0.2)', color: '#a6e3a1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, flexShrink: 0 }}>3</div>
              <div style={{ fontSize: '14px', color: '#a6adc8', lineHeight: '20px' }}>
                Your <span style={{ color: '#a6e3a1' }}>WPM</span> (words per minute) and <span style={{ color: '#89b4fa' }}>accuracy</span> are tracked
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(166,227,161,0.2)', color: '#a6e3a1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, flexShrink: 0 }}>4</div>
              <div style={{ fontSize: '14px', color: '#a6adc8', lineHeight: '20px' }}>
                Log in to save your score to the <span style={{ color: '#f9e2af' }}>leaderboard</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onPlay}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            background: '#89b4fa',
            color: '#1e1e2e',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Play
        </button>
      </div>

      <Link 
        to="/" 
        style={{ 
          display: 'block', 
          textAlign: 'center', 
          fontSize: '14px', 
          color: '#a6adc8',
          textDecoration: 'none'
        }}
      >
        Back to Games
      </Link>
    </div>
  );
}

export function PlayPage() {
  const { slug } = useParams<{ slug: string }>();
  const hasPendingScore = typeof window !== 'undefined' && sessionStorage.getItem('pendingScore') !== null;
  const [phase, setPhase] = useState<GamePhase>(hasPendingScore ? 'playing' : 'rules');

  if (slug === 'typeracer') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        {phase === 'rules' ? (
          <TypeRacerRules onPlay={() => setPhase('playing')} />
        ) : (
          <Typeracer />
        )}
      </div>
    );
  }

  const gameName = slug;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="page-header">
        <h1 className="page-title">{gameName}</h1>
        <p className="page-subtitle">Game coming soon...</p>
      </div>

      <div className="card text-center">
        <div className="mb-6">
          <span className="tag tag-blue text-sm px-4 py-2">Coming Soon</span>
        </div>
        <p className="text-lg text-text-primary mb-4">
          The {gameName} game engine is currently under development.
        </p>
        <p className="text-text-secondary mb-8">
          We're working hard to bring you an exciting gaming experience.
        </p>
        <Link to="/" className="btn btn-secondary">
          Back to Games
        </Link>
      </div>
    </div>
  );
}
