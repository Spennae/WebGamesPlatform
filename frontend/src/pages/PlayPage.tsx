import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { Typeracer } from './Typeracer';
import { RulesCard, RuleStep } from '../components';

type GamePhase = 'rules' | 'playing';

function TypeRacerRules({ onPlay }: { onPlay: () => void }) {
  return (
    <RulesCard title="TypeRacer" description="Race against the clock">
      <div>
        <div className="rules-section-title">How to Play</div>
        <div className="rules-steps">
          <RuleStep number={1}>
            Type the text shown as <span style={{ color: 'var(--text-primary)' }}>quickly</span> and <span style={{ color: 'var(--text-primary)' }}>accurately</span> as you can
          </RuleStep>
          <RuleStep number={2}>
            You have <span style={{ color: 'var(--accent-red)', fontWeight: 600 }}>60 seconds</span> to complete the race
          </RuleStep>
          <RuleStep number={3}>
            Your <span style={{ color: 'var(--accent-green)' }}>WPM</span> (words per minute) and <span style={{ color: 'var(--accent-blue)' }}>accuracy</span> are tracked
          </RuleStep>
          <RuleStep number={4}>
            Log in to save your score to the <span style={{ color: 'var(--accent-yellow)' }}>leaderboard</span>
          </RuleStep>
        </div>
      </div>

      <button onClick={onPlay} className="btn-primary-solid">
        Play
      </button>

      <Link to="/" className="text-link" style={{ marginTop: '16px' }}>
        Back to Games
      </Link>
    </RulesCard>
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
