import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { Typeracer } from './Typeracer';
import { RulesCard, RuleStep, Highlight } from '../components';
import { useAuth } from '../hooks/useAuth';

type GamePhase = 'auth' | 'rules' | 'playing';

function TypeRacerRules({ onPlay }: { onPlay: () => void }) {
  return (
    <RulesCard title="TypeRacer" description="Race against the clock">
      <div>
        <div className="rules-section-title">How to Play</div>
        <div className="rules-steps">
          <RuleStep number={1}>
            Type the text shown as <Highlight>quickly</Highlight> and <Highlight>accurately</Highlight> as you can
          </RuleStep>
          <RuleStep number={2}>
            You have <Highlight color="var(--accent-red)">60 seconds</Highlight> to complete the race
          </RuleStep>
          <RuleStep number={3}>
            Your <Highlight color="var(--accent-green)">WPM</Highlight> (words per minute) and <Highlight color="var(--accent-blue)">accuracy</Highlight> are tracked
          </RuleStep>
          <RuleStep number={4}>
            Log in to save your score to the <Highlight color="var(--accent-yellow)">leaderboard</Highlight>
          </RuleStep>
        </div>
      </div>

      <button onClick={onPlay} className="btn-primary-solid">
        Play
      </button>

      <Link to="/" className="text-link text-link-with-margin">
        Back to Games
      </Link>
    </RulesCard>
  );
}

export function PlayPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const hasPendingScore = typeof window !== 'undefined' && sessionStorage.getItem('pendingScore') !== null;
  const authPromptSeen = typeof window !== 'undefined' && sessionStorage.getItem('authPromptSeen') === 'true';
  const [phase, setPhase] = useState<GamePhase>(() => {
    if (hasPendingScore) return 'playing';
    if (isAuthenticated || authPromptSeen) return 'rules';
    return 'auth';
  });

  useEffect(() => {
    if (phase === 'auth' && !hasPendingScore) {
      const returnUrl = `/play/${slug}`;
      navigate(`/login?returnUrl=${encodeURIComponent(returnUrl)}`, { replace: true });
    }
  }, [phase, hasPendingScore, navigate, slug]);

  if (slug === 'typeracer') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        {phase === 'auth' ? (
          <div className="text-center">Loading...</div>
        ) : phase === 'rules' ? (
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
