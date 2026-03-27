import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { Typeracer } from './Typeracer';

export function PlayPage() {
  const { slug } = useParams<{ slug: string }>();

  if (slug === 'typeracer') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="page-header">
          <h1 className="page-title">TypeRacer</h1>
          <p className="page-subtitle">Race against the clock</p>
        </div>
        <Typeracer />
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
